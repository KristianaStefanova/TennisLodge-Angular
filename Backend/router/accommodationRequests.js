const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const accommodationRequestController = require('../controllers/accommodationRequestController');

router.get('/mine', auth(), accommodationRequestController.listMine);
router.get('/host/:accommodationId', auth(), accommodationRequestController.listForHost);
router.post('/', auth(), accommodationRequestController.create);
router.patch('/:id', auth(), accommodationRequestController.updateStatus);

module.exports = router;
