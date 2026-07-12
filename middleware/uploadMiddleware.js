const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, JPEG, and PNG images are allowed.'));
    }
    cb(null, true);
  },
});

// Magic byte signatures for allowed image types
const MAGIC_BYTES = [
  { bytes: [0xff, 0xd8, 0xff],                         type: 'JPEG' },
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], type: 'PNG'  },
];

/**
 * Middleware to validate the actual file content after multer saves it.
 * Checks magic bytes to prevent MIME type spoofing (e.g. a .txt file
 * sent with Content-Type: image/jpeg).
 * Must be used AFTER upload.single() or upload.fields() in the route.
 */
function validateImageMagicBytes(req, res, next) {
  // No file uploaded — nothing to validate, let the controller handle it
  if (!req.file) return next();

  const filePath = req.file.path;
  const buffer = Buffer.alloc(8);
  let fd;

  try {
    fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);
  } catch {
    // Could not read the file — delete it and reject
    fs.unlink(filePath, () => {});
    return res.status(400).json({ success: false, message: 'Could not read uploaded file.' });
  }

  const isValid = MAGIC_BYTES.some(({ bytes }) =>
    bytes.every((byte, i) => buffer[i] === byte)
  );

  if (!isValid) {
    // Delete the spoofed file from disk before rejecting
    fs.unlink(filePath, () => {});
    req.file = undefined;
    return res.status(400).json({ success: false, message: 'Only JPG, JPEG, and PNG images are allowed.' });
  }

  next();
}

module.exports = { upload, validateImageMagicBytes };

