const { QueryTypes } = require('sequelize');
const catchAsync = require('../../utils/catchAsync');
const Discussion = require('../../models/barazas/discussion');
const Discussionreply = require('../../models/barazas/discussionReply');
const Discussionchat = require('../../models/barazas/discussionChat');
const Discussionupvote = require('../../models/barazas/discussionUpvote');
const Discussionresource = require('../../models/barazas/discussionResource');
const Point = require('../../models/point');
const AppError = require('../../utils/AppError');
const User = require('../../models/user');
const { findResourceById } = require('../../utils/finder');
const db = require('../../utils/database');
const { getChat } = require('../../models/barazas/queries');

const ALLOWED_FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'svg', 'webp'];

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

  const totalUpvotes = await Discussionupvote.findAndCountAll({
    where: { discussion_id: discussion.id },
  });

  const hasUpvoted = await Discussionupvote.findOne({
    where: { discussion_id: discussion.id, user_id: req.user },
  });

  return res.json({
    status: 'success',
    data: discussion,
    upvotes: totalUpvotes.count,
    hasUpvoted: !!hasUpvoted,
  });
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

    const createdChat = await Discussionchat.create({
      discussion_id: discussion.id,
      user_id: req.user, // Assuming req.user contains the user ID
      message: req.body.message,
    });

    if (!createdChat) return next(new AppError('Unable to create chat', 500));

    const chat = await db.query(getChat(), {
      replacements: [createdChat.id],
      type: QueryTypes.SELECT,
    });

    io.emit(`chat:${discussion.id}`, chat[0]);

    return res.json({ status: 'success', data: chat[0] });
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

exports.barazaUpvote = catchAsync(async (req, res, next) => {
  const { discussionId } = req.params;

  const discussion = await Discussion.findOne({ where: { id: discussionId } });

  const checkUserSigned = await Discussionreply.findOne({
    where: { user_id: req.user, discussion_id: discussion.id },
  });

  if (checkUserSigned) {
    return next(new AppError('Alread upvo', 422));
  }

  if (!discussion || !discussionId) {
    return next(new AppError('Discussion not found', 404));
  }

  const checkBazarazaVote = await Discussionupvote.findOne({
    where: { discussion_id: discussion.id, user_id: req.user },
  });

  if (checkBazarazaVote) {
    return next(new AppError('You have already upvoted', 403));
  }

  try {
    await db.transaction(async t => {
      await Discussionupvote.create(
        {
          discussion_id: discussion.id,
          user_id: req.user,
        },
        { transaction: t }
      );

      await Point.create(
        {
          user_id: discussion.user_id,
          points: 20,
          point_type: 'baraza upvote',
          description: 'points earned from baraza upvote',
        },
        { transaction: t }
      );
    });

    return res.status(201).json({ status: 'created' });
  } catch (error) {
    throw new AppError('Could not create upvote', 500);
  }
});

exports.getResources = catchAsync(async (req, res, next) => {
  const { discussionId } = req.params;

  const discussion = await Discussion.findOne({ where: { id: discussionId } });

  if (!discussion || !discussionId) {
    return next(new AppError('Discussion not found', 404));
  }

  const resources = await Discussionresource.findAll({
    where: { discussion_id: discussion.id },
  });

  return res.json({ status: 'success', data: resources });
});

exports.createResource = catchAsync(async (req, res, next) => {
  const { discussionId } = req.params;

  const discussion = await Discussion.findOne({ where: { id: discussionId } });

  if (!discussion || !discussionId) {
    return next(new AppError('Discussion not found', 404));
  }

  const { resource, description } = req.body;

  if (!resource) {
    return next(new AppError('Resource url not provided', 400));
  }

  if (!resource) {
    return next(new AppError('Description not provided', 400));
  }

  const fileType = resource.split('.').pop();
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    return next(new AppError('Uploaded file type not supported.'));
  }

  const createdResource = await Discussionresource.create({
    user_id: req.user,
    discussion_id: discussion.id,
    resource_url: resource,
    description,
  });

  if (!createdResource) {
    return next(new AppError('Unable to create resource', 500));
  }

  return res.status(201).json({ status: 'success' });
});
