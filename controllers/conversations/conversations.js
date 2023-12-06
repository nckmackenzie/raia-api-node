const { Op } = require('sequelize');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const Conversation = require('../../models/conversation');
const Message = require('../../models/message');
const User = require('../../models/user');
const pusher = require('../../utils/pusher');

exports.createConversation = catchAsync(async (req, res, next) => {
  const { toUser } = req.body;

  if (!toUser) {
    return next(new AppError('Provide user sending to', 400));
  }

  const fromUser = req.user;

  const existingConversation = await Conversation.findOne({
    where: {
      [Op.or]: [
        { user_1: fromUser, user_2: toUser },
        { user_1: toUser, user_2: fromUser },
      ],
    },
  });

  if (existingConversation) {
    return res.json({ status: 'success', data: existingConversation.id });
  }

  const conversation = await Conversation.create({
    user_1: fromUser,
    user_2: toUser,
  });

  return res.json({ status: 'success', data: conversation.id });
});

exports.createMessage = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findByPk(conversationId);

  if (!conversationId || !conversation) {
    return next(AppError('Invalid conversation id provided', 400));
  }

  const { senderId, content } = req.body;

  if (!senderId || !content) {
    return next(new AppError('Sender and content both required', 400));
  }

  const message = await Message.create({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  });

  pusher.trigger(conversationId, 'message:new', message);

  return res.json({ status: 'success', data: message });
});

exports.getConversations = catchAsync(async (req, res) => {
  const conversations = await Conversation.findAll({
    where: { [Op.or]: [{ user_1: req.user }, { user_2: req.user }] },
    include: [
      {
        model: User,
        as: 'user1',
        attributes: ['id', 'full_name', 'profile_image'],
      },
      {
        model: User,
        as: 'user2',
        attributes: ['id', 'full_name', 'profile_image'],
      },
      {
        model: Message,
        as: 'conversation',
        order: [['created_at', 'desc']],
        limit: 1,
        attributes: ['id', 'content', 'created_at'],
      },
    ],
    attributes: ['id'],
    order: [['created_at', 'desc']],
  });

  return res.json({ status: 'success', data: conversations });
});

exports.fetchMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findByPk(conversationId, {
    attributes: ['id'],
  });

  if (!conversationId || !conversation) {
    return next(AppError('Invalid conversation id provided', 400));
  }

  const messages = await Message.findAll({
    where: { conversation_id: conversationId },
    attributes: ['id', 'content', 'sender_id', 'created_at'],
  });

  return res.json({ status: 'success', data: messages });
});
