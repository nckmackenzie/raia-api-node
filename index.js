const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');

const app = express();

app.use(cors());
app.options('*', cors());

//set http security headers
app.use(helmet());

app.use(express.json());

app.use(hpp());

app.use(compression());

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `);
});

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳');
});

app.get('/about', (req, res) => {
  res.send('This is my about route..... ');
});

// Export the Express API
module.exports = app;
