const { DataTypes } = require('sequelize');
const db = require('../utils/database');
const User = require('./user');

const Feed = db.define(
  'Feed',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: 'feeds',
  }
);

Feed.belongsTo(User, { as: 'author', foreignKey: 'author_id' });

module.exports = Feed;
