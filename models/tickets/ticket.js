const { DataTypes } = require('sequelize');
const db = require('../../utils/database');
const User = require('../user');

const Ticket = db.define(
  'Ticket',
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
    ticket_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
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
    assigned_leader_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    category: {
      type: DataTypes.STRING,
    },
    priority: {
      type: DataTypes.STRING,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
  },
  { timestamps: true, tableName: 'tickets' }
);

module.exports = Ticket;
