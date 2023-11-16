const { DataTypes } = require('sequelize');
const db = require('../utils/database');
const User = require('./user');

const Point = db.define(
  'Point',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    point_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: 'points', timestamps: false }
);

module.exports = Point;
