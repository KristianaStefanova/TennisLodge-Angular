const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../utils');
const { uploadProfilePicture } = require('../middleware/profilePictureUpload');

router.get('/profile', auth(), authController.getProfileInfo);
router.put('/profile', auth(), authController.editProfileInfo);
router.post(
    '/profile/picture',
    auth(),
    uploadProfilePicture,
    authController.uploadProfilePicture,
);

module.exports = router