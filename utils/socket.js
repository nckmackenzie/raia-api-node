const http = require('http');
const { Server } = require('socket.io');
const app = require('../app');

const server = http.createServer(app);
const io = new Server(server, { cors: '*' });

module.exports = { server, io };
