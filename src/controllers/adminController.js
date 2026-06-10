const ticketModel = require('../models/ticketModel');
const { ticketEmitter, EVENTS } = require('../events/ticketEvents');

const resetTickets = async (req, res, next) => {
  try {
    const { secret } = req.body;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthorized — invalid admin secret' });
    }

    const tickets = await ticketModel.resetAll();
    ticketEmitter.emit(EVENTS.ADMIN_RESET, { count: tickets.length });

    res.json({ success: true, data: { reset_count: tickets.length }, message: 'All tickets have been reset to open' });
  } catch (err) {
    next(err);
  }
};

module.exports = { resetTickets };
