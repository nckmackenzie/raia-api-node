const dotenv = require('dotenv');
const { server } = require('./utils/socket');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000;
const db = require('./utils/database');

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

server.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `);
});

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
