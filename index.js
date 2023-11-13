const { createServer } = require('node:http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errors/errorHandler');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000;
const db = require('./utils/database');
const app = require('./app');

const ticketRoutes = require('./routes/ticket');
/* eslint-disable */
db.authenticate()
  .then(() => {
    console.log('🎉 Database connected successfully');
  })
  .catch(error => console.error('🔥Error:' + error.message));

db.sync()
  .then(() => console.log('Database is synchronized with the models'))
  .catch(err => {
    console.error(err);
  });

// uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const server = createServer(app);
const io = new Server(server, { cors: '*' });

app.use('/tickets', ticketRoutes(io));
// app.use('/tickets', ticketRoutes);

server.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `);
});

app.all('*', (req, res, next) => {
  next(new AppError(`No routes found for ${req.originalUrl}`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

// handle unhandled rejections
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// HANDLE SIGTERM FROM HEROKU
process.on('SIGTERM', () => {
  console.log('✋ SIGTERM RECEIVED: Shutting down gracefully');
  server.close(() => {
    console.log('💥 process terminated');
  });
});

/* eslint-enable */
