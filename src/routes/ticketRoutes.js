const { Router } = require('express');
const {
  getAllTickets,
  getOpenTickets,
  getClosedTickets,
  getTicketById,
  getTicketOwner,
  updateTicket,
} = require('../controllers/ticketController');

const router = Router();

router.get('/', getAllTickets);
router.get('/open', getOpenTickets);
router.get('/closed', getClosedTickets);
router.get('/:id', getTicketById);
router.get('/:id/owner', getTicketOwner);
router.patch('/:id', updateTicket);

module.exports = router;
