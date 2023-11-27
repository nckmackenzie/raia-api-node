const Feed = require('../../models/feed');
const User = require('../../models/user');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');

function values() {
  return {
    attributes: ['id', 'content', 'content_url', 'created_at', 'updated_at'],
    include: {
      model: User,
      as: 'author',
      attributes: ['id', 'full_name', 'username', 'profile_image'],
    },
  };
}

exports.getFeeds = catchAsync(async (req, res) => {
  const feeds = await Feed.findAll({
    where: { is_deleted: false },
    attributes: ['id', 'content', 'content_url', 'created_at', 'updated_at'],
    include: {
      model: User,
      as: 'author',
      attributes: ['id', 'full_name', 'username', 'profile_image'],
    },
    order: [['created_at', 'desc']],
    values,
  });

  // const fetchedFeed = await Feed.findByPk(feed.id, {
  //   attributes: ['id', 'content', 'content_url', 'created_at', 'updated_at'],
  //   include: {
  //     model: User,
  //     as: 'author',
  //     attributes: ['id', 'full_name', 'username', 'profile_image'],
  //   },
  // });

  return res.json({ status: 'success', data: feeds });
});

exports.postFeed = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  if (!content || content.toString().trim().length === 0) {
    return next(new AppError('Content not provided', 400));
  }

  const feed = await Feed.create({
    author_id: req.user,
    content,
    content_url: null,
  });

  const fetchedFeed = await Feed.findByPk(feed.id, {
    attributes: ['id', 'content', 'content_url', 'created_at', 'updated_at'],
    include: {
      model: User,
      as: 'author',
      attributes: ['id', 'full_name', 'username', 'profile_image'],
    },
  });

  return res.status(201).json({ status: 'success', data: fetchedFeed });
});
