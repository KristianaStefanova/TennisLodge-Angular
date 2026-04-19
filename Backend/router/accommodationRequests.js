const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const accommodationRequestController = require('../controllers/accommodationRequestController');

router.get('/mine', auth(), accommodationRequestController.listMine);
router.get('/counts', auth(), accommodationRequestController.counts);
router.post('/guest-outcomes/read', auth(), accommodationRequestController.markGuestOutcomesRead);
router.get('/incoming', auth(), accommodationRequestController.listIncomingForHost);
router.get('/host/:accommodationId', auth(), accommodationRequestController.listForHost);
router.post('/', auth(), accommodationRequestController.create);
router.patch('/:id', auth(), accommodationRequestController.updateStatus);

module.exports = router;
