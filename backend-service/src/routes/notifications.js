import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// List notifications for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.json([]);
    }

    const notifications = await Notification.find({ recipient_id: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch notifications.' });
  }
});

// Mark single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update notification.' });
  }
});

// Mark all as read for current user
router.patch('/mark-all-read', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    await Notification.updateMany({ recipient_id: userId, is_read: false }, { is_read: true });
    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to mark all as read.' });
  }
});

export default router;
