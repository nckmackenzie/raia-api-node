const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
// const AppError = require('./utils/AppError');
// const globalErrorHandler = require('./controllers/errors/errorHandler');
const { protect } = require('./controllers/auth');
const { determineAllowedOrigins } = require('./utils/utils');

const app = express();

const corsOptions = {
  origin: determineAllowedOrigins(), // Replace with the actual URL of your React app
  credentials: true, // Enable credentials (cookies)
};
app.use(cors(corsOptions));
// app.options('http://localhost:5173', cors());

// set http security headers
app.use(helmet());

if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
  });
  app.use('/', limiter);
}

app.use(express.json());

app.use(cookieParser());

app.use(hpp());

app.use(compression());

app.use(protect);

// app.get('/', (req, res) => {
//   res.json({ msg: 'Hey this is my API running 🥳', user: req.user });
// });

// app.all('*', (req, res, next) => {
//   next(new AppError(`No routes found for ${req.originalUrl}`, 404));
// });

// // global error handling middleware
// app.use(globalErrorHandler);

module.exports = app;
