const multer = require('multer');

function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error.message && error.message.includes('Only JPG')) {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference. Check category_id or post_id.',
    });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate value.' });
  }

  res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
}

module.exports = { notFoundHandler, errorHandler };
