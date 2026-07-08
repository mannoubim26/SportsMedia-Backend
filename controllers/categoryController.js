const categoryModel = require('../models/categoryModel');

async function listCategories(req, res, next) {
  try {
    const categories = await categoryModel.listCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

module.exports = { listCategories };
