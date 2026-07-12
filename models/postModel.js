const pool = require('../config/db');

const POST_QUERY = (whereClause) => `
  SELECT
    p.post_id,
    p.title,
    p.description,
    p.image_url,
    p.created_at,
    p.updated_at,
    u.user_id          AS author_id,
    u.name             AS author_name,
    pr.profile_picture AS author_picture,
    c.category_id,
    c.name             AS category_name,
    (SELECT COUNT(*) FROM likes    WHERE post_id = p.post_id) AS total_likes,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) AS total_comments,
    (SELECT COUNT(*) FROM shares   WHERE post_id = p.post_id) AS total_shares,
    (SELECT COUNT(*) FROM likes    WHERE post_id = p.post_id AND user_id = ?) AS has_liked,
    (SELECT COUNT(*) FROM shares   WHERE post_id = p.post_id AND user_id = ?) AS has_shared,
    GROUP_CONCAT(DISTINCT h.tag ORDER BY h.tag SEPARATOR ',') AS hashtags
  FROM posts p
  JOIN users u ON u.user_id = p.user_id
  LEFT JOIN profiles pr ON pr.user_id = p.user_id
  LEFT JOIN categories c ON c.category_id = p.category_id
  LEFT JOIN post_hashtags ph ON ph.post_id = p.post_id
  LEFT JOIN hashtags h ON h.hashtag_id = ph.hashtag_id
  ${whereClause}
  GROUP BY p.post_id
`;

function formatPost(row) {
  return {
    ...row,
    hashtags: row.hashtags ? row.hashtags.split(',') : [],
    has_liked: row.has_liked > 0,
    has_shared: row.has_shared > 0,
  };
}

async function listPosts({ page, limit, userId, search, categoryId, hashtag, authorId }) {
  const uid = userId || 0;
  const offset = (page - 1) * limit;

  // Build dynamic WHERE conditions and parameter list
  const conditions = [];
  const params = [];

  if (search) {
    const term = `%${search}%`;
    conditions.push(`(
      p.title LIKE ?
      OR p.description LIKE ?
      OR EXISTS (
        SELECT 1 FROM post_hashtags ph2
        JOIN hashtags h2 ON h2.hashtag_id = ph2.hashtag_id
        WHERE ph2.post_id = p.post_id AND h2.tag LIKE ?
      )
    )`);
    params.push(term, term, term);
  }

  if (categoryId) {
    conditions.push('p.category_id = ?');
    params.push(categoryId);
  }

  if (hashtag) {
    conditions.push('h.tag = ?');
    params.push(hashtag);
  }

  if (authorId) {
    conditions.push('p.user_id = ?');
    params.push(authorId);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  // COUNT uses the same filters so pagination totals are correct.
  // We join hashtags only when needed (hashtag filter) to avoid inflating counts.
  const needsHashtagJoin = !!hashtag;
  const countSql = `
    SELECT COUNT(DISTINCT p.post_id) AS total
    FROM posts p
    ${needsHashtagJoin ? 'LEFT JOIN post_hashtags ph ON ph.post_id = p.post_id LEFT JOIN hashtags h ON h.hashtag_id = ph.hashtag_id' : ''}
    ${whereClause}
  `;
  const [countRows] = await pool.execute(countSql, params);
  const total = countRows[0].total;

  const [rows] = await pool.execute(
    POST_QUERY(whereClause) + ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    [uid, uid, ...params]
  );

  return { posts: rows.map(formatPost), total };
}

async function getPostById(postId, userId) {
  const uid = userId || 0;
  const [rows] = await pool.execute(
    POST_QUERY('WHERE p.post_id = ?'),
    [uid, uid, postId]
  );
  return rows[0] ? formatPost(rows[0]) : null;
}

async function getPostOwner(postId) {
  const [rows] = await pool.execute(
    'SELECT post_id, user_id FROM posts WHERE post_id = ?',
    [postId]
  );
  return rows[0] || null;
}

async function syncHashtags(conn, postId, tags) {
  await conn.execute('DELETE FROM post_hashtags WHERE post_id = ?', [postId]);

  for (const tag of tags) {
    await conn.execute('INSERT IGNORE INTO hashtags (tag) VALUES (?)', [tag]);
    const [rows] = await conn.execute(
      'SELECT hashtag_id FROM hashtags WHERE tag = ?',
      [tag]
    );
    if (rows[0]) {
      await conn.execute(
        'INSERT IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)',
        [postId, rows[0].hashtag_id]
      );
    }
  }
}

async function createPost(userId, { title, description, imageUrl, categoryId, hashtags }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO posts (user_id, category_id, title, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [userId, categoryId || null, title, description || null, imageUrl || null]
    );
    const postId = result.insertId;

    if (hashtags && hashtags.length > 0) {
      await syncHashtags(conn, postId, hashtags);
    }

    await conn.commit();
    return postId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updatePost(postId, { title, description, imageUrl, categoryId, hashtags }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description || null); }
    if (imageUrl !== undefined) { fields.push('image_url = ?'); values.push(imageUrl); }
    if (categoryId !== undefined) { fields.push('category_id = ?'); values.push(categoryId); }

    if (fields.length > 0) {
      values.push(postId);
      await conn.execute(
        `UPDATE posts SET ${fields.join(', ')} WHERE post_id = ?`,
        values
      );
    }

    if (hashtags !== undefined) {
      await syncHashtags(conn, postId, hashtags);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deletePost(postId) {
  // Cascade deletes comments, likes, shares, post_hashtags automatically
  await pool.execute('DELETE FROM posts WHERE post_id = ?', [postId]);
}

module.exports = { listPosts, getPostById, getPostOwner, createPost, updatePost, deletePost };
