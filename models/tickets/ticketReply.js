const { DataTypes } = require('sequelize');
const db = require('../../utils/database');
const User = require('../user');
const Ticket = require('./ticket');

const Ticketreply = db.define(
  'Ticketreply',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Ticket,
        key: 'id',
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: 'ticket_replies', timestamps: false }
);

module.exports = Ticketreply;
