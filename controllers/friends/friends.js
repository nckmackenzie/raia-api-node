const { Op } = require('sequelize');
const User = require('../../models/user');
const Follow = require('../../models/follow');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

exports.getSuggestions = catchAsync(async (req, res) => {
  // get users already following
  const followingIds = await Follow.findAll({
    where: { follower_id: req.user },
    attributes: ['followed_id'],
  }).then(follows => follows.map(follow => follow.followed_id));

  const suggestions = await User.findAll({
    where: { id: { [Op.not]: req.user, [Op.notIn]: followingIds } },
    attributes: ['id', 'username', 'full_name', 'profile_image'],
    limit: 5,
  });

  return res.json({ status: 'success', data: suggestions });
});

exports.follow = catchAsync(async (req, res, next) => {
  const { followedId } = req.body;

  if (!followedId) {
    return next(new AppError('User to follow not provided', 400));
  }

  const userFollowed = await User.findByPk(followedId);

  if (!userFollowed) return next(new AppError('User not found', 404));

  if (!userFollowed.active || userFollowed.is_deleted) {
    return next(
      new AppError('Trying to follow a user who is not longer active', 403)
    );
  }

  const alreadyFollowing = await Follow.findOne({
    where: { follower_id: req.user, followed_id: followedId },
  });

  if (alreadyFollowing) {
    return next(new AppError('You are already following this user', 400));
  }

  await Follow.create({ follower_id: req.user, followed_id: followedId });

  return res.json({ status: 'success', data: null });
});

exports.getFollowersAndFollowings = catchAsync(async (req, res) => {
  const { user } = req.query;
  // console.log(user);
  const following = await Follow.findAll({
    where: { follower_id: user || req.user },
    attributes: ['id', 'created_at'],
    include: {
      model: User,
      as: 'followed',
      attributes: ['id', 'full_name', 'username', 'profile_image'],
    },
  });

  const followed = await Follow.findAll({
    where: { followed_id: user || req.user },
    attributes: ['id', 'created_at'],
    include: {
      model: User,
      as: 'follower',
      attributes: ['id', 'full_name', 'username', 'profile_image'],
    },
  });

  return res.json({ status: 'success', data: { following, followed } });
});
