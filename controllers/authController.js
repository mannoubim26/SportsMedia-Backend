const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const userModel = require('../models/userModel');
const profileModel = require('../models/profileModel');

function generateToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  const { name, age, email, password } = req.body;

  if (!name || !age || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'name, age, email, and password are required.',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format.' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters.',
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await userModel.createUser(conn, {
      name: String(name).trim(),
      age: Number(age),
      email,
      passwordHash,
    });

    await profileModel.createProfile(conn, {
      userId,
      name: String(name).trim(),
      age: Number(age),
    });

    await conn.commit();

    const token = generateToken({ user_id: userId, email: email.trim().toLowerCase() });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { token, userId, email: email.trim().toLowerCase(), name: String(name).trim() },
    });
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }
    next(error);
  } finally {
    conn.release();
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required.' });
  }

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: { token, userId: user.user_id, email: user.email, name: user.name },
    });
  } catch (error) {
    next(error);
  }
}

function logout(_req, res) {
  // JWT is stateless; the client discards the token
  res.json({ success: true, message: 'Logged out successfully.' });
}

module.exports = { register, login, logout };
