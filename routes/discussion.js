const express = require('express');
const {
  barazaReply,
  getBarazaDetails,
  createChat,
  getChats,
} = require('../controllers/discussions/discussions');

const discussionsRoutes = io => {
  const router = express.Router();

  // Use io object in your route handlers as needed
  //   router.get('/', getdiscussionss);
  router.post('/:discussionId/chat', createChat(io));
  router.get('/:discussionId', getBarazaDetails);
  router.post('/:discussionId/reply', barazaReply);
  router.get('/:discussionId/chats', getChats);

  return router;
};

module.exports = discussionsRoutes;
