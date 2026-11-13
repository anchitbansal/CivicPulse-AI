import express from 'express';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import CitizenFeedback from '../models/CitizenFeedback.js';
import { dispatchNotification } from '../services/notificationService.js';
import { requireRole } from '../middleware/auth.js';
import { sameId } from '../middleware/access.js';

const router = express.Router();

// Get tickets pending admin verification
router.get('/pending', requireRole('admin'), async (_req, res) => {
  try {
    const tickets = await Ticket.find({
      status: { $in: ['PENDING_VERIFICATION'] },
    })
      .populate('assigned_worker_id', 'name email role department')
      .populate('citizen_id', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch pending verifications.' });
  }
});

// Admin approves worker completion -> moves to RESOLVED
router.post('/:ticketId/approve', requireRole('admin'), async (req, res) => {
  try {
    const { notes } = req.body;

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (ticket.status !== 'PENDING_VERIFICATION') {
      return res.status(409).json({ message: 'Only complaints pending verification can be approved.' });
    }

    const admin = req.user;
    const adminName = admin.name;

    const prevStatus = ticket.status;
    ticket.status = 'RESOLVED';

    ticket.history.push({
      action: 'VERIFIED_RESOLVED',
      from_status: prevStatus,
      to_status: 'RESOLVED',
      performed_by: admin._id,
      performed_by_name: adminName,
      performed_by_role: 'admin',
      notes: notes || 'Resolution proof inspected and approved.',
      timestamp: new Date(),
    });

    await ticket.save();

    // Increment worker completed task stats
    if (ticket.assigned_worker_id) {
      await User.findByIdAndUpdate(ticket.assigned_worker_id, {
        $inc: { completed_tasks_count: 1 },
      });
    }

    const io = req.app.get('io');

    // Notify citizen
    if (ticket.citizen_id) {
      await dispatchNotification(io, {
        recipient_id: ticket.citizen_id,
        title: 'Issue Resolved & Verified',
        message: 'Your reported issue has been officially verified and resolved. Please rate the service.',
        type: 'ticket_verified',
        ticket_id: ticket._id,
      });
    }

    // Notify worker
    if (ticket.assigned_worker_id) {
      await dispatchNotification(io, {
        recipient_id: ticket.assigned_worker_id,
        title: 'Job Approved',
        message: `Your work on Ticket #${ticket._id.toString().slice(-4)} has been approved by admin.`,
        type: 'ticket_verified',
        ticket_id: ticket._id,
      });
    }

    if (io) {
      io.to(`ticket:${ticket._id}`).emit('ticket:status_change', {
        ticketId: ticket._id,
        from_status: prevStatus,
        to_status: 'RESOLVED',
        ticket,
      });
      io.to('role:admin').emit('INCIDENT_RESOLVED', ticket.toObject());
      io.emit('INCIDENT_RESOLVED', ticket.toObject());
    }

    return res.json({ message: 'Ticket resolution approved.', ticket });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to approve resolution.' });
  }
});

// Admin rejects worker completion -> moves to REOPENED
router.post('/:ticketId/reject', requireRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (!['PENDING_VERIFICATION', 'RESOLVED'].includes(ticket.status)) {
      return res.status(409).json({ message: 'This complaint cannot be reopened from its current status.' });
    }

    const admin = req.user;
    const adminName = admin.name;

    const prevStatus = ticket.status;
    ticket.status = 'REOPENED';

    ticket.history.push({
      action: 'REOPENED',
      from_status: prevStatus,
      to_status: 'REOPENED',
      performed_by: admin._id,
      performed_by_name: adminName,
      performed_by_role: 'admin',
      notes: reason || 'Resolution proof insufficient. Additional repairs required.',
      timestamp: new Date(),
    });

    await ticket.save();

    const io = req.app.get('io');

    // Notify worker of required rework
    if (ticket.assigned_worker_id) {
      await dispatchNotification(io, {
        recipient_id: ticket.assigned_worker_id,
        title: 'Work Rejected / Reopened',
        message: `Task #${ticket._id.toString().slice(-4)} reopened: ${reason || 'Incomplete fix.'}`,
        type: 'citizen_feedback',
        ticket_id: ticket._id,
      });
    }

    if (io) {
      io.to(`ticket:${ticket._id}`).emit('ticket:status_change', {
        ticketId: ticket._id,
        from_status: prevStatus,
        to_status: 'REOPENED',
        ticket,
      });
      io.to('role:admin').emit('INCIDENT_UPDATED', ticket.toObject());
      io.emit('INCIDENT_UPDATED', ticket.toObject());
    }

    return res.json({ message: 'Ticket reopened for corrective action.', ticket });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to reject resolution.' });
  }
});

// Citizen feedback & dispute handling
router.post('/:ticketId/citizen-feedback', async (req, res) => {
  try {
    const { rating, is_satisfied, reopen_requested, reopen_reason, proof_images } = req.body;

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (req.user.role !== 'citizen' || !sameId(ticket.citizen_id, req.user._id)) {
      return res.status(403).json({ message: 'Only the citizen who reported this complaint can submit feedback.' });
    }

    const citizen = req.user;
    const statusBeforeFeedback = ticket.status;
    const requestedReview = Boolean(reopen_requested) || is_satisfied === false;

    const feedback = await CitizenFeedback.findOneAndUpdate(
      { ticket_id: ticket._id, citizen_id: citizen._id },
      {
        $set: {
          rating: rating == null ? 5 : Number(rating),
          is_satisfied: is_satisfied !== false,
          reopen_requested: requestedReview,
          reopen_reason: reopen_reason || '',
          proof_images: Array.isArray(proof_images) ? proof_images : [],
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (requestedReview) {
      const admins = await User.find({ role: 'admin' }).select('_id').lean();
      const io = req.app.get('io');
      await Promise.all(
        admins.map((admin) => dispatchNotification(io, {
          recipient_id: admin._id,
          title: 'Citizen Review Requested',
          message: `Citizen feedback requests administrative review for Ticket #${ticket._id.toString().slice(-4)}.`,
          type: 'citizen_feedback',
          ticket_id: ticket._id,
        }))
      );
      if (io) {
        io.to('role:admin').emit('notification:new', {
          title: 'Citizen Review Requested',
          message: `Citizen feedback requests administrative review for Ticket #${ticket._id.toString().slice(-4)}.`,
          type: 'ticket_reopened',
          ticket_id: ticket._id,
        });
      }
    }

    return res.status(201).json({
      message: 'Thank you for your feedback.',
      feedback,
      ticket: { ...ticket.toObject(), status: statusBeforeFeedback },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to submit citizen feedback.' });
  }
});

export default router;
