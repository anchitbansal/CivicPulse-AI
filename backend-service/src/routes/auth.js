import express from 'express';
import { createToken, authenticate, requireRole } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../services/passwordService.js';
import User from '../models/User.js';

const router = express.Router();

const DEMO_USER_FIELDS = 'name email role department assigned_ward status';

// Authenticated admins can list demo accounts without secrets or location data.
router.get('/demo-users', authenticate, requireRole('admin'), async (_req, res) => {
  try {
    const users = await User.find()
      .select(DEMO_USER_FIELDS)
      .sort({ role: 1, name: 1 })
      .lean();
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

router.get('/me', authenticate, (req, res) => res.json(req.user));

export default router;
