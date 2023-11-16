const { DataTypes } = require('sequelize');
const db = require('../../utils/database');
const User = require('../user');

const Discussion = db.define(
  'Discussion',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATE,
    },
    end_datetime: {
      type: DataTypes.DATE,
    },
    invite_code: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    discussion_resources: {
      type: DataTypes.STRING,
    },
    discussion_type: {
      type: DataTypes.ENUM,
      values: ['public', 'private'],
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: 'discussions',
    defaultScope: { attributes: { exclude: ['is_deleted'] } },
  }
);

module.exports = Discussion;
