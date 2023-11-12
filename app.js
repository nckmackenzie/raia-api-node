const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const AppError = require('./utils/AppError');

const app = express();

app.use(cors());
app.options('*', cors());

// set http security headers
app.use(helmet());

app.use(express.json());

app.use(hpp());

app.use(compression());

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳');
});

app.all('*', (req, res, next) => {
  next(new AppError(`No routes found for ${req.originalUrl}`, 404));
});

module.exports = app;
