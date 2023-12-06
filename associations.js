// associations.js
const Discussion = require('./models/barazas/discussion');
const DiscussionReply = require('./models/barazas/discussionReply');
const Discussionchat = require('./models/barazas/discussionChat');
const User = require('./models/user');
const Follow = require('./models/follow');
const Conversation = require('./models/conversation');
const Message = require('./models/message');
// const Discussionchat = require('./models/barazas/discussionChat');

// Define associations
function defineAssociations() {
  Discussion.hasMany(DiscussionReply, {
    foreignKey: 'discussion_id',
    as: 'comments',
  });
  Discussion.belongsTo(User, { foreignKey: 'user_id' });
  DiscussionReply.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Discussionchat.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  Follow.belongsTo(User, { foreignKey: 'followed_id', as: 'followed' });
  Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });

  Conversation.belongsTo(User, { foreignKey: 'user_1', as: 'user1' });
  Conversation.belongsTo(User, { foreignKey: 'user_2', as: 'user2' });

  Conversation.hasMany(Message, {
    foreignKey: 'conversation_id',
    as: 'conversation',
  });
}

module.exports = defineAssociations;

// You can add more associations here as needed
