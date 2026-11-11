import express from 'express';
import { createToken, authenticate } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../services/passwordService.js';
import User from '../models/User.js';

const router = express.Router();

// Get list of demo users for rapid multi-portal testing
router.get('/demo-users', async (_req, res) => {
  try {
    const users = await User.find().sort({ role: 1, name: 1 }).lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch demo users.' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone = '' } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: 'citizen',
      password_hash: await hashPassword(password),
    });
    const safeUser = user.toObject();
    delete safeUser.password_hash;
    return res.status(201).json({ token: createToken(user), user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password_hash');
    if (!user || (role && !(role === 'worker' ? ['worker', 'supervisor'].includes(user.role) : user.role === role))) {
      return res.status(401).json({ message: 'Invalid email, password, or portal.' });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid email, password, or portal.' });
    const safeUser = user.toObject();
    delete safeUser.password_hash;
    return res.json({ token: createToken(user), user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to sign in.' });
  }
});

router.get('/me-authenticated', authenticate, (req, res) => res.json(req.user));

// Get current profile based on header or fallback
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    let user = null;

    if (userId) {
      user = await User.findById(userId).lean();
    }

    if (!user) {
      // Fallback to first admin or first user
      user = (await User.findOne({ role: 'admin' }).lean()) || (await User.findOne().lean());
    }

    if (!user) {
      return res.status(404).json({ message: 'No active profile found. Seed may be pending.' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch user profile.' });
  }
});

export default router;
