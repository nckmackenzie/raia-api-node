const catchAsync = require('../../utils/catchAsync');
const Discussion = require('../../models/barazas/discussion');
const Discussionupvote = require('../../models/barazas/discussionUpvote');
const Point = require('../../models/point');
const AppError = require('../../utils/AppError');
const { findResourceById } = require('../../utils/finder');
const db = require('../../utils/database');

exports.barazaUpvote = catchAsync(async (req, res, next) => {
  const discussion = await findResourceById(req, Discussion, 'discussionId');

  if (!discussion) return next(new AppError('Discussion not found', 404));

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
