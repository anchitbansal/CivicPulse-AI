import express from 'express';
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
