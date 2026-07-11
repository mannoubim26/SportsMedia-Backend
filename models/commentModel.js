const pool = require('../config/db');

async function listComments(postId) {
  const [rows] = await pool.execute(
    `SELECT
      c.comment_id,
      c.text,
      c.created_at,
      u.user_id  AS author_id,
      u.name     AS author_name,
      pr.profile_picture AS author_picture
     FROM comments c
     JOIN users u ON u.user_id = c.user_id
     LEFT JOIN profiles pr ON pr.user_id = c.user_id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows;
}

async function createComment({ userId, postId, text }) {
  const [result] = await pool.execute(
    'INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)',
    [userId, postId, text.trim()]
  );
  return result.insertId;
}

async function getCommentOwner(commentId) {
  const [rows] = await pool.execute(
    'SELECT comment_id, user_id FROM comments WHERE comment_id = ?',
    [commentId]
  );
  return rows[0] || null;
}

async function deleteComment(commentId) {
  await pool.execute('DELETE FROM comments WHERE comment_id = ?', [commentId]);
}

module.exports = { listComments, createComment, getCommentOwner, deleteComment };
