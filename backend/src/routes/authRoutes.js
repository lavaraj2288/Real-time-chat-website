const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'chat_app_jwt_super_secret_key_2026';

// Helper to create JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      isGuest: user.isGuest,
      avatarColor: user.avatarColor
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    if (username.trim().length < 2 || username.trim().length > 30) {
      return res.status(400).json({ success: false, message: 'Username must be between 2 and 30 characters' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
    }

    const cleanUsername = username.trim();
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: cleanUsername,
      password: hashedPassword,
      isGuest: false
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        avatarColor: user.avatarColor,
        isGuest: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login existing user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const cleanUsername = username.trim();
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
    });

    if (!user || user.isGuest) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        avatarColor: user.avatarColor,
        isGuest: false
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   POST /api/auth/guest
// @desc    Instant guest entry with a chosen username
router.post('/guest', async (req, res) => {
  try {
    let { username } = req.body;

    if (!username || !username.trim()) {
      username = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    let cleanUsername = username.trim().slice(0, 30);

    // If an existing registered user already has this exact name, append random digits
    const existing = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
    });

    if (existing) {
      if (!existing.isGuest) {
        cleanUsername = `${cleanUsername}_${Math.floor(100 + Math.random() * 900)}`;
      } else {
        // Reuse guest account or update last active
        existing.lastActive = new Date();
        await existing.save();
        const token = generateToken(existing);
        return res.json({
          success: true,
          token,
          user: {
            id: existing._id,
            username: existing.username,
            avatarColor: existing.avatarColor,
            isGuest: true
          }
        });
      }
    }

    const guestUser = await User.create({
      username: cleanUsername,
      isGuest: true
    });

    const token = generateToken(guestUser);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: guestUser._id,
        username: guestUser.username,
        avatarColor: guestUser.avatarColor,
        isGuest: true
      }
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during guest login' });
  }
});

// @route   GET /api/auth/me
// @desc    Validate token and return current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        avatarColor: user.avatarColor,
        isGuest: user.isGuest
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
