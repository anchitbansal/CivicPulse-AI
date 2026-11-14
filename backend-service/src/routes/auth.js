import express from 'express';
import { createToken, authenticate, requireRole } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../services/passwordService.js';
import User from '../models/User.js';
import { logger, maskEmail } from '../services/logger.js';

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
  const requestedEmail = maskEmail(req.body?.email);
  try {
    const { name, email, password, phone = '' } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      logger.warn('Signup validation failed', { email: requestedEmail, reason: 'missing-required-fields' });
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      logger.warn('Signup validation failed', { email: requestedEmail, reason: 'password-too-short' });
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      logger.warn('Signup rejected', { email: maskEmail(normalizedEmail), reason: 'email-already-registered' });
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
    logger.info('Signup succeeded', { role: user.role });
    return res.status(201).json({ token: createToken(user), user: safeUser });
  } catch (error) {
    logger.error('Signup failed', {
      email: requestedEmail,
      message: error.message,
      code: error.code || error.name || 'UNKNOWN',
    });
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    return res.status(500).json({ message: error.message || 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  const requestedEmail = maskEmail(req.body?.email);
  const requestedRole = req.body?.role || 'unspecified';
  logger.info('Login attempt', { email: requestedEmail, requestedRole });
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      logger.warn('Login failed', { email: requestedEmail, reason: 'missing-required-fields' });
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password_hash');
    const roleMatches = !user ? false : !role
      || (role === 'worker' && ['worker', 'supervisor'].includes(user.role))
      || user.role === role;
    if (!user || !roleMatches) {
      logger.warn('Login failed', { email: requestedEmail, reason: 'invalid-account-or-portal' });
      return res.status(401).json({ message: 'Invalid email, password, or portal.' });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      logger.warn('Login failed', { email: requestedEmail, reason: 'invalid-password' });
      return res.status(401).json({ message: 'Invalid email, password, or portal.' });
    }
    const safeUser = user.toObject();
    delete safeUser.password_hash;
    logger.info('Login succeeded', { email: maskEmail(user.email), role: user.role });
    return res.json({ token: createToken(user), user: safeUser });
  } catch (error) {
    logger.error('Login failed due to server error', {
      email: requestedEmail,
      message: error.message,
      code: error.code || error.name || 'UNKNOWN',
    });
    return res.status(500).json({ message: error.message || 'Unable to sign in.' });
  }
});

router.get('/me-authenticated', authenticate, (req, res) => res.json(req.user));

router.get('/me', authenticate, (req, res) => res.json(req.user));

export default router;
