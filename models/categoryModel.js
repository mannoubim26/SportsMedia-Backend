const pool = require('../config/db');

async function listCategories() {
  const [rows] = await pool.execute(
    'SELECT category_id, name FROM categories ORDER BY name ASC'
  );
  return rows;
}

module.exports = { listCategories };
