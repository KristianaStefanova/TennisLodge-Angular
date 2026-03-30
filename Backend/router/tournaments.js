const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const tournamentController = require('../controllers/tournamentController');

router.get('/', tournamentController.getAll);
router.get('/:id', tournamentController.getById);
router.post('/', auth(), tournamentController.create);
router.put('/:id', auth(), tournamentController.update);
router.delete('/:id', auth(), tournamentController.remove);

module.exports = router;
