const AppError = require('../../utils/AppError');
/* eslint-disable */
const sendDevErr = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err.message,
    errorDetails: err,
    stack: err.stack,
  });
};

const sendProdErr = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err.message,
  });
};

const handleJwtError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleForeignKeyError = () =>
  new AppError('Invalid entry in one of the entered fields!', 400);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendDevErr(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'SequelizeForeignKeyConstraintError')
      error = handleForeignKeyError();
    sendProdErr(error, res);
  }
};
