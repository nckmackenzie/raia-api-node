const express = require('express');
const {
  createConversation,
  createMessage,
  fetchMessages,
  getConversations,
} = require('../controllers/conversations/conversations');

const router = express.Router();

router.post('/', createConversation);
router.get('/', getConversations);
router.post('/:conversationId/messages/new', createMessage);
router.get('/:conversationId/messages', fetchMessages);

module.exports = router;
