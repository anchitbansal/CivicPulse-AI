import express from 'express';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// List workers and supervisors with their active assignments count
router.get('/', async (req, res) => {
  try {
    const { department, status, role } = req.query;
    const query = { role: role ? role : { $in: ['worker', 'supervisor'] } };

    if (department) query.department = department;
    if (status) query.status = status;

    const workers = await User.find(query).sort({ active_tasks_count: 1, name: 1 }).lean();

    // Dynamically calculate active task counts from Tickets to ensure exact accuracy
    const enhancedWorkers = await Promise.all(
      workers.map(async (worker) => {
        const activeCount = await Ticket.countDocuments({
          assigned_worker_id: worker._id,
          status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'Assigned', 'In Progress'] },
        });
        return {
          ...worker,
          active_tasks_count: activeCount,
        };
      })
    );

    return res.json(enhancedWorkers);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch workers.' });
  }
});

// Update worker status (e.g., 'available', 'busy', 'offline')
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    return res.json(worker);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update worker status.' });
  }
});

// Update worker live location
router.patch('/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'lat and lng are required.' });
    }

    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { current_location: { lat: Number(lat), lng: Number(lng) } },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    return res.json(worker);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update location.' });
  }
});

export default router;
