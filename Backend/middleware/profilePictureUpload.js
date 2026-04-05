const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__basedir, 'static', 'uploads', 'profiles');

fs.mkdirSync(uploadDir, { recursive: true });

const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = allowedExt.has(ext) ? ext : '.jpg';
    const id = req.user && req.user._id ? String(req.user._id) : 'user';
    cb(null, `${id}-${Date.now()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    if (ok) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed.'));
  },
});

function uploadProfilePicture(req, res, next) {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image must be 2 MB or smaller.' });
      }
      const msg =
        typeof err.message === 'string' && err.message
          ? err.message
          : 'Could not upload image.';
      return res.status(400).json({ message: msg });
    }
    next();
  });
}

module.exports = {
  uploadProfilePicture,
  profileUploadsDir: uploadDir,
};
