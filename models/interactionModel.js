const pool = require('../config/db');

async function toggleLike(userId, postId) {
  const [existing] = await pool.execute(
    'SELECT user_id FROM likes WHERE user_id = ? AND post_id = ?',
    [userId, postId]
  );

  if (existing.length > 0) {
    await pool.execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
  } else {
    await pool.execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
  }

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM likes WHERE post_id = ?',
    [postId]
  );

  return { liked: existing.length === 0, totalLikes: countRows[0].total };
}

async function toggleShare(userId, postId) {
  const [existing] = await pool.execute(
    'SELECT user_id FROM shares WHERE user_id = ? AND post_id = ?',
    [userId, postId]
  );

  if (existing.length > 0) {
    await pool.execute('DELETE FROM shares WHERE user_id = ? AND post_id = ?', [userId, postId]);
  } else {
    await pool.execute('INSERT INTO shares (user_id, post_id) VALUES (?, ?)', [userId, postId]);
  }

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM shares WHERE post_id = ?',
    [postId]
  );

  return { shared: existing.length === 0, totalShares: countRows[0].total };
}

module.exports = { toggleLike, toggleShare };
