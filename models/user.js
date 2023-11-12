const { DataTypes } = require('sequelize');
const db = require('../utils/database');

const User = db.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    national_id: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    date_of_birth: {
      type: DataTypes.DATE,
    },
    user_uid: {
      type: DataTypes.STRING,
      unique: true,
    },
    occupation: {
      type: DataTypes.STRING,
    },
    title_description: {
      type: DataTypes.STRING,
    },
    member_type: {
      type: DataTypes.STRING,
    },
    interests: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    county_id: {
      type: DataTypes.INTEGER,
    },
    ward: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.INTEGER,
    },
    elected_position: {
      type: DataTypes.STRING,
    },
    profile_image: {
      type: DataTypes.STRING,
    },
    password_digest: {
      type: DataTypes.STRING,
    },
    verified: {
      type: DataTypes.BOOLEAN,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = User;
