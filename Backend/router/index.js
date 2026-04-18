const router = require('express').Router();
const users = require('./users');
const themes = require('./themes');
const posts = require('./posts');
const likes = require('./likes');
const test = require('./test');
const tournaments = require('./tournaments');
const accommodations = require('./accommodations');
const accommodationRequests = require('./accommodationRequests');
const { authController } = require('../controllers');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.use('/users', users);
router.use('/themes', themes);
router.use('/posts', posts);
router.use('/likes', likes);
router.use('/tournaments', tournaments);
router.use('/accommodations', accommodations);
router.use('/accommodation-requests', accommodationRequests);
router.use('/test', test);

module.exports = router;
