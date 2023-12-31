// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const User = require('../../models/user');

const rolesEnum = ['citizen', 'leader', 'admin'];

const signAndSendJwt = (user, res, status, isInitial = false) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // ensures browser can't make any changes to cookie,
    secure: true, // ensure cookie sent on https connection
  };

  if (process.env.NODE_ENV === 'development') delete cookieOptions.secure;

  res.cookie('raia_jwt', token, cookieOptions);

  res.status(status).json({ status: 'success', user, token, isInitial });
};

// eslint-disable-next-line consistent-return
exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Provide both email and password', 400));
  }

  const user = await User.findOne({
    where: { email },
    attributes: {
      exclude: [
        'user_uid',
        'createdAt',
        'updatedAt',
        'is_deleted',
        'active',
        'interests',
      ],
    },
  });

  if (!user || !(await user.verifyPassword(password, user.password_digest))) {
    return next(new AppError('Invalid credentials', 401));
  }
  //   remove unwanted outputs
  user.password_digest = undefined;
  user.role = rolesEnum[user.role];

  // login and send jwt token
  signAndSendJwt(user, res, 200);
});

// eslint-disable-next-line consistent-return
exports.signUp = catchAsync(async (req, res, next) => {
  const { email, fullName, contact, role, password } = req.body;

  if (!email || !fullName || !contact || !password) {
    return next(new AppError('Provide all required fields', 400));
  }

  const findEmail = await User.findOne({ where: { email } });
  if (findEmail) return next(new AppError('Email already exists', 401));

  const findContact = await User.findOne({ where: { contact } });
  if (findContact) return next(new AppError('Contact already exists', 401));

  let numericRole;
  if (!role || role === 'citizen') {
    numericRole = 0;
  } else if (role === 'leader') {
    numericRole = 1;
  } else if (role === 'admin') {
    numericRole = 2;
  } else {
    numericRole = 0;
  }

  const user = await User.create({
    email,
    full_name: fullName,
    contact,
    password_digest: password,
    role: numericRole,
  });

  user.password_digest = undefined;
  user.user_uid = undefined;
  user.created_at = undefined;
  user.interests = undefined;
  user.is_deleted = undefined;
  user.role = rolesEnum[numericRole];

  signAndSendJwt(user, res, 201, true);
});

exports.protect = catchAsync(async (req, res, next) => {
  if (req.url === '/auth/sign-up' || req.url === '/auth/sign-in') {
    return next(); // Skip verification
  }
  // if (req.url.startsWith('/auth')) {
  //   return next(); // Skip verification
  // }

  let token;

  // prettier-ignore
  if (
    req.headers.authorization
    && req.headers.authorization.startsWith('Bearer')
  ) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookie && req.cookies.raia_jwt) {
    token = req.cookies.raia_jwt;
  }

  if (!token) return next(new AppError('Login to access resource', 401));

  const { id } = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({
    attributes: ['id', 'full_name', 'email', 'username', 'contact', 'active'],
    where: { id },
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

// TODO FIX ME: UNCOMMENT LINES TO VERIFY
exports.changepasswordDummy = catchAsync(async (req, res, next) => {
  // get user password from db
  // const user = await User.findByPk(req.user, {
  //   attributes: ['id', 'name', 'password_digest'],
  // });
  const user = await User.findByPk(req.body.userId, {
    attributes: ['id', 'full_name', 'password_digest'],
  });

  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword.trim().length === 0) {
    return next(new AppError('Old password required', 400));
  }
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return next(new AppError('Confirm password', 400));
  }

  const hashedPassword = await user.encryptPasswordBeforeUpdate(newPassword);

  await User.update(
    { password_digest: hashedPassword },
    { where: { id: req.body.userId } }
  );

  // remove password from output
  user.password_digest = undefined;

  // sign and send json web token
  // signAndSendJwt(user, res, 200);
  return res.status(200).json({ status: 'success' });
});

exports.changepassword = catchAsync(async (req, res, next) => {
  // get user password from db
  // const user = await User.findByPk(req.user, {
  //   attributes: ['id', 'name', 'password_digest'],
  // });
  const user = await User.findByPk(req.user, {
    attributes: ['id', 'name', 'password_digest'],
  });

  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword.trim().length === 0) {
    return next(new AppError('Old password required', 400));
  }
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return next(new AppError('Confirm password', 400));
  }

  // verify entered old password is correct
  // prettier-ignore
  if (!user || !(await user.verifyPassword(oldPassword, user.password_digest))) {
    return next(new AppError('Old password is incorrect', 401));
  }

  const hashedPassword = await user.encryptPasswordBeforeUpdate(newPassword);

  // update user password
  // await User.update(
  //   { password: hashedPassword, password_changed_on: Date.now() - 1000 },
  //   { where: { id: req.user.id } }
  // );
  await User.update(
    { password_digest: hashedPassword },
    { where: { id: req.user.id } }
  );

  // remove password from output
  user.password_digest = undefined;

  // sign and send json web token
  // signAndSendJwt(user, res, 200);
  return res.status(200).json({ status: 'success' });
});

exports.getUser = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError('Log in again', 401));

  const user = await User.findByPk(req.user);

  user.password_digest = undefined;
  user.user_uid = undefined;
  user.created_at = undefined;
  user.interests = undefined;
  user.is_deleted = undefined;
  user.role = rolesEnum[user.role];

  return res.status(200).json({ status: 'success', user });
});

exports.logout = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError('You are not logged in', 400));
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true, // ensures browser doesnt change cookie,
  };

  req.user = null;
  res.cookie('raia_jwt', 'logout', cookieOptions);
  return res.status(200).json({ status: 'success', token: null });
});
