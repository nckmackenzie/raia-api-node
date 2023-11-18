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

  // jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
  //   if (err) {
  //     return res
  //       .status(401)
  //       .json({ status: 'unauthenticated', error: err.message });
  //   }

  //   const user = await User.findOne({
  //     attributes: ['id', 'full_name', 'email', 'username', 'active'],
  //     where: { user_uid: decoded.sub },
  //   });

  //   if (!user.active) return next(new AppError('User deactivated', 401));

  //   // prettier-ignore
  //   if (user.is_deleted) return next(new AppError('This account was closed', 401));

  //   req.user = user;

  //   return next();
  // });

  const { sub } = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({
    attributes: ['id', 'full_name', 'email', 'username', 'contact', 'active'],
    where: { user_uid: sub },
  });

  if (!user) {
    return next(new AppError('Not user found for provided credentials', 401));
  }
  if (!user.active) return next(new AppError('User deactivated', 401));

  // prettier-ignore
  if (user.is_deleted) return next(new AppError('This account was closed', 401));

  req.user = user.id;

  return next();
});
