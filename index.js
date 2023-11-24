const { createServer } = require('node:http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errors/errorHandler');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8000;
const db = require('./utils/database');
const app = require('./app');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/ticket');
const discussionRoutes = require('./routes/discussion');
const feedRoutes = require('./routes/feed');
const friendRoutes = require('./routes/friend');
const defineAssociations = require('./associations');
const { determineAllowedOrigins } = require('./utils/utils');

defineAssociations();
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
const io = new Server(server, {
  cors: {
    origin: determineAllowedOrigins(),
    credentials: true,
  },
  handlePreflightRequest: (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', determineAllowedOrigins());
    res.writeHead(200);
    res.end();
  },
});

let onlineUsers = [];

io.on('connection', socket => {
  // console.log('A user connected');

  socket.on('online:baraza:users', userData => {
    const existingUser = onlineUsers.find(user => user.id === userData.id);

    if (!existingUser) {
      onlineUsers.push(userData);
    }

    io.emit('online:users', onlineUsers);

    // console.log('Online Users:', onlineUsers);
  });

  // Handle disconnect event if needed
  socket.on('disconnect', () => {
    const disconnectedUserId = socket.id; // You might want to use a user ID instead

    onlineUsers = onlineUsers.filter(user => user.id !== disconnectedUserId);

    io.emit('online:users', onlineUsers);

    // console.log('A user disconnected');
    // console.log('Online Users:', onlineUsers);
  });
});

app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes(io));
app.use('/discussions', discussionRoutes(io));
app.use('/feeds', feedRoutes);
app.use('/friends', friendRoutes);
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
