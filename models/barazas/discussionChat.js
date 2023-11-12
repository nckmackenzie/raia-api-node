const { DataTypes } = require('sequelize');
const db = require('../../utils/database');
const User = require('../user');
const Discussion = require('./discussion');

const Discussionchat = db.define(
  'Discussionchat',
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false, tableName: 'discussion_chats' }
);

module.exports = Discussionchat;
