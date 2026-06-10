const { EventEmitter } = require('events');

const ticketEmitter = new EventEmitter();

const EVENTS = {
  TICKET_BOOKED: 'ticket:booked',
  TICKET_CANCELLED: 'ticket:cancelled',
  ADMIN_RESET: 'admin:reset',
};

module.exports = { ticketEmitter, EVENTS };
