const pool = require('../config/db');

async function createUser(conn, { name, age, email, passwordHash }) {
  const [result] = await conn.execute(
    'INSERT INTO users (name, age, email, password_hash) VALUES (?, ?, ?, ?)',
    [name.trim(), Number(age), email.trim().toLowerCase(), passwordHash]
  );
  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT user_id, name, age, email, password_hash FROM users WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  return rows[0] || null;
}

async function findUserById(userId) {
  const [rows] = await pool.execute(
    'SELECT user_id, name, age, email FROM users WHERE user_id = ?',
    [userId]
  );
  return rows[0] || null;
}

async function deleteUser(userId) {
  await pool.execute('DELETE FROM users WHERE user_id = ?', [userId]);
}

module.exports = { createUser, findUserByEmail, findUserById, deleteUser };
