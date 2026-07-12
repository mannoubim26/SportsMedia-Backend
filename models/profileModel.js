const pool = require('../config/db');

async function createProfile(conn, { userId, name, age }) {
  await conn.execute(
    'INSERT INTO profiles (user_id, name, age) VALUES (?, ?, ?)',
    [userId, name || null, age || null]
  );
}

async function getProfileByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT
      p.profile_id,
      p.user_id,
      p.name,
      p.age,
      p.bio,
      p.profile_picture,
      u.email,
      u.created_at
     FROM profiles p
     JOIN users u ON u.user_id = p.user_id
     WHERE p.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function updateProfile(userId, data) {
  const fields = [];
  const values = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name || null); }
  if (data.age !== undefined) { fields.push('age = ?'); values.push(data.age !== null && data.age !== '' ? Number(data.age) : null); }
  if (data.bio !== undefined) { fields.push('bio = ?'); values.push(data.bio || null); }
  if (data.profilePicture !== undefined) { fields.push('profile_picture = ?'); values.push(data.profilePicture); }

  if (fields.length === 0) return;

  values.push(userId);
  await pool.execute(
    `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
}

async function getPublicProfile(userId) {
  return getProfileByUserId(userId);
}

module.exports = { createProfile, getProfileByUserId, updateProfile, getPublicProfile };
