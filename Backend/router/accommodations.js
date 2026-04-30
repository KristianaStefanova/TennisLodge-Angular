const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const accommodationController = require('../controllers/accommodationController');

/**
 * Host-only listing (two path segments). Avoids any clash with `GET /:id` (single segment).
 * Do not use `GET /mine` — Express may match `/:id` first depending on path-to-regexp version.
 */
router.get('/host/mine', auth(), accommodationController.getMine);
router.get('/', auth(false), accommodationController.getAll);
router.get('/:id', auth(false), accommodationController.getById);
router.post('/', auth(), accommodationController.create);
router.put('/:id', auth(), accommodationController.update);
router.delete('/:id', auth(), accommodationController.remove);

module.exports = router;
