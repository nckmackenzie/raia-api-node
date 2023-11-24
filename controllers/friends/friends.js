const { Op } = require('sequelize');
const User = require('../../models/user');
const catchAsync = require('../../utils/catchAsync');

exports.getSuggestions = catchAsync(async (req, res) => {
  const suggestions = await User.findAll({
    where: { id: { [Op.not]: req.user } },
    attributes: ['id', 'username', 'full_name', 'profile_image'],
  });

  return res.json({ status: 'success', data: suggestions });
});
