const ticketModel = require('../models/ticketModel');
const { ticketEmitter, EVENTS } = require('../events/ticketEvents');

const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await ticketModel.findAll();
    res.json({ success: true, data: tickets, message: 'All tickets retrieved' });
  } catch (err) {
    next(err);
  }
};

const getOpenTickets = async (req, res, next) => {
  try {
    const tickets = await ticketModel.findByStatus('open');
    res.json({ success: true, data: tickets, message: 'Open tickets retrieved' });
  } catch (err) {
    next(err);
  }
};

const getClosedTickets = async (req, res, next) => {
  try {
    const tickets = await ticketModel.findByStatus('closed');
    res.json({ success: true, data: tickets, message: 'Closed tickets retrieved' });
  } catch (err) {
    next(err);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketModel.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, data: null, message: 'Ticket not found' });
    }
    res.json({ success: true, data: ticket, message: 'Ticket retrieved' });
  } catch (err) {
    next(err);
  }
};

const getTicketOwner = async (req, res, next) => {
  try {
    const ticket = await ticketModel.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, data: null, message: 'Ticket not found' });
    }
    if (ticket.status === 'open') {
      return res.status(404).json({ success: false, data: null, message: 'Ticket has no owner — seat is open' });
    }
    const owner = {
      first_name: ticket.first_name,
      last_name: ticket.last_name,
      email: ticket.email,
      seat_number: ticket.seat_number,
      booked_at: ticket.booked_at,
    };
    res.json({ success: true, data: owner, message: 'Ticket owner retrieved' });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketModel.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, data: null, message: 'Ticket not found' });
    }

    const { status, first_name, last_name, email, gender } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, data: null, message: '"status" field is required' });
    }
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, data: null, message: '"status" must be "open" or "closed"' });
    }

    if (status === 'closed') {
      if (!first_name || !last_name || !email || !gender) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'first_name, last_name, email, and gender are required',
        });
      }
      if (!['male', 'female'].includes(gender)) {
        return res.status(400).json({ success: false, data: null, message: '"gender" must be "male" or "female"' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, data: null, message: 'Invalid email format' });
      }
    }

    if (status === 'open' && ticket.status === 'open') {
      return res.status(400).json({ success: false, data: null, message: 'Seat is already open' });
    }

    const isNewBooking = ticket.status === 'open' && status === 'closed';
    const updated = await ticketModel.update(req.params.id, { status, first_name, last_name, email, gender, isNewBooking });

    if (isNewBooking) {
      ticketEmitter.emit(EVENTS.TICKET_BOOKED, updated);
    } else if (status === 'open') {
      ticketEmitter.emit(EVENTS.TICKET_CANCELLED, updated);
    }

    let message = 'Ticket updated successfully';
    if (isNewBooking) message = 'Ticket booked successfully';
    else if (status === 'open') message = 'Ticket cancelled successfully';

    res.json({ success: true, data: updated, message });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTickets, getOpenTickets, getClosedTickets, getTicketById, getTicketOwner, updateTicket };
