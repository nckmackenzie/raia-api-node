const { QueryTypes } = require('sequelize');
const catchAsync = require('../../utils/catchAsync');
const Ticket = require('../../models/tickets/ticket');
const Notification = require('../../models/notification');
const AppError = require('../../utils/AppError');
const db = require('../../utils/database');
const { getTickets, getTicket } = require('../../models/tickets/queries');

// prettier ignore
exports.createTicket = io =>
  // eslint-disable-next-line implicit-arrow-linebreak
  catchAsync(async (req, res, next) => {
    // prettier-ignore
    const { title, description, category, assignedLeaderId, priority } = req.body;

    const ticketNo = await Ticket.findOne({
      attributes: ['ticket_no'],
      order: [['created_at', 'DESC']],
      limit: 1,
    });

    if (!title || !description || !category || !assignedLeaderId) {
      return next(new AppError('Fill all required fields', 400));
    }

    try {
      const txn = await db.transaction(async t => {
        const ticket = await Ticket.create(
          {
            title,
            description,
            category,
            assigned_leader_id: assignedLeaderId,
            priority: priority || 'medium',
            user_id: req.user,
            ticket_no: !ticketNo ? '100001' : +ticketNo + 1,
          },
          { transaction: t }
        );

        await Notification.create(
          {
            user_from_id: req.user,
            user_to_id: assignedLeaderId,
            message: 'A new ticket has been addressed to you!',
            redirect_url: `/tickets/${ticket.id}`,
            notification_type: 'New ticket',
          },
          { transaction: t }
        );
        return ticket;
      });

      io.emit(`notification:new:${assignedLeaderId}`, {
        id: txn.id,
        message: 'New notification',
      });

      return res.status(201).json({ status: 'success' });
    } catch (error) {
      throw new AppError('Could not create ticket', 500);
    }
  });

exports.getTickets = catchAsync(async (req, res) => {
  const tickets = await db.query(getTickets(), { type: QueryTypes.SELECT });

  res.json({ status: 'success', data: tickets });
});

exports.getTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  if (!ticketId) return next(new AppError('Ticket not provided', 400));
  const ticket = await db.query(getTicket(), {
    replacements: [ticketId],
    type: QueryTypes.SELECT,
  });

  if (!ticket) return next(new AppError('Ticket not found', 404));
  //   const test = req.user === ticket.assigned_leader_id;
  //   prettier-ignore
  if (req.user !== ticket[0].user_id && req.user !== ticket[0].assigned_leader_id) {
    return next(
      new AppError("You don't have permission to view this page", 403)
    );
  }

  return res.json({ status: 'success', data: ticket[0] });
});
