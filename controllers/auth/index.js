// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const User = require('../../models/user');

exports.protect = catchAsync(async (req, res, next) => {
  if (req.url === '/signup') {
    return next(); // Skip verification
  }

  let token;

  // prettier-ignore
  if (
    req.headers.authorization
    && req.headers.authorization.startsWith('Bearer')
  ) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Login to access resource', 401));

  const { sub } = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({ where: { user_uid: sub } });

  if (!user.active) return next(new AppError('User deactivated', 401));

  // prettier-ignore
  if (user.is_deleted) return next(new AppError('This account was closed', 401));

  return next();
});
