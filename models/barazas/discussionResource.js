const { DataTypes } = require('sequelize');
const db = require('../../utils/database');
const User = require('../user');
const Discussion = require('./discussion');

const Discussionresource = db.define(
  'Discussionresource',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    discussion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Discussion,
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    resource_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource_type: {
      type: DataTypes.ENUM,
      values: ['image', 'document', 'audio', 'video'],
      defaultValue: 'image',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false, tableName: 'discussion_resources' }
);

module.exports = Discussionresource;
