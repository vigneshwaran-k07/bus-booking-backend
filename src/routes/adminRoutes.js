const { Router } = require('express');
const { resetTickets } = require('../controllers/adminController');

const router = Router();

router.post('/reset', resetTickets);

module.exports = router;
