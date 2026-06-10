const { ticketEmitter, EVENTS } = require('./ticketEvents');

ticketEmitter.on(EVENTS.TICKET_BOOKED, (ticket) => {
  console.log(
    `[EVENT] Ticket booked — Seat #${ticket.seat_number} by ${ticket.first_name} ${ticket.last_name} <${ticket.email}> at ${new Date().toISOString()}`
  );
});

ticketEmitter.on(EVENTS.TICKET_CANCELLED, (ticket) => {
  console.log(
    `[EVENT] Ticket cancelled — Seat #${ticket.seat_number} released at ${new Date().toISOString()}`
  );
});

ticketEmitter.on(EVENTS.ADMIN_RESET, ({ count }) => {
  console.log(
    `[EVENT] Admin reset — ${count} ticket(s) reopened at ${new Date().toISOString()}`
  );
});
