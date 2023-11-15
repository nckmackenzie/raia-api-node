const { QueryTypes } = require('sequelize');
const catchAsync = require('../../utils/catchAsync');
const Discussion = require('../../models/barazas/discussion');
const Discussionreply = require('../../models/barazas/discussionReply');
const Discussionchat = require('../../models/barazas/discussionChat');
const AppError = require('../../utils/AppError');
const User = require('../../models/user');
const { findResourceById } = require('../../utils/finder');
const db = require('../../utils/database');
const { getChat } = require('../../models/barazas/queries');

exports.getBarazaDetails = catchAsync(async (req, res, next) => {
  const { discussionId } = req.params;

  if (!discussionId) return next(new AppError('Discussion not found', 400));

  const discussion = await Discussion.findByPk(discussionId, {
    include: [
      {
        model: Discussionreply,
        attributes: ['id', 'content', 'user_id', 'created_at'],
        as: 'comments',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'username', 'profile_image'],
          },
        ],
      },
      {
        model: User,
        attributes: ['id', 'full_name', 'username', 'profile_image'],
      },
    ],
  });

  if (!discussion) {
    return next(new AppError('Entered discussion id not found', 404));
  }

  return res.json({ status: 'success', data: discussion });
});

exports.barazaReply = catchAsync(async (req, res, next) => {
  const { discussionId } = req.params;

  if (!discussionId) return next(new AppError('Discussion not found', 400));

  const discussion = await Discussion.findByPk(discussionId);

  if (!discussion) {
    return next(new AppError('Entered discussion id not found', 404));
  }

  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return next(new AppError('content not provided', 400));
  }

  const reply = await Discussionreply.create({
    content,
    discussion_id: discussionId,
    user_id: req.user,
  });

  if (!reply) return next(new AppError('Unable to create comment', 500));

  return res.status(201).json({ status: 'created' });
});

exports.createChat = io =>
  // eslint-disable-next-line implicit-arrow-linebreak
  catchAsync(async (req, res, next) => {
    const discussion = await findResourceById(req, Discussion, 'discussionId');

    if (!req.body.message) {
      return next(new AppError('Message not provided', 400));
    }

    // const createdChat = await Discussionchat.create({
    //   discussion_id: discussion.id,
    //   user_id: req.user, // Assuming req.user contains the user ID
    //   message: req.body.message,
    // });

    // if (!createdChat) return next(new AppError('Unable to create chat', 500));

    // const chat = await db.query(getChat(), {
    //   replacements: [createdChat.id],
    //   type: QueryTypes.SELECT,
    // });

    // io.emit(`chat:${discussion.id}`, chat[0]);
    io.emit(`chat:${discussion.id}`, 'some message');

    // return res.json({ status: 'success', data: chat[0] });
    return res.json({ status: 'success', data: discussion.id });
  });

exports.getChats = catchAsync(async (req, res, next) => {
  const discussion = await findResourceById(req, Discussion, 'discussionId');

  if (!discussion) return next(new AppError('Discussion not found', 404));

  const chats = await Discussionchat.findAll({
    where: { discussion_id: discussion.id },
    attributes: ['id', 'message', 'message_url', 'is_deleted', 'created_at'],
    include: {
      model: User,
      as: 'user',
      attributes: ['id', 'full_name', 'username', 'profile_image'],
    },
  });

  return res.json({ status: 'success', data: chats });
});
