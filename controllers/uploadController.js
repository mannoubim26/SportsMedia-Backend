function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Image uploaded successfully.',
    data: { url },
  });
}

module.exports = { uploadImage };
