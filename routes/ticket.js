const express = require('express');
const {
  createTicket,
  getTickets,
  getTicket,
} = require('../controllers/tickets/ticket');

const ticketRoutes = io => {
  const router = express.Router();

  // Use io object in your route handlers as needed
  router.post('/', createTicket(io));
  router.get('/', getTickets);
  router.get('/:ticketId', getTicket);

  return router;
};

module.exports = ticketRoutes;
