import express from 'express';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import CitizenFeedback from '../models/CitizenFeedback.js';
import { dispatchNotification } from '../services/notificationService.js';

const router = express.Router();

// Get tickets pending admin verification
router.get('/pending', async (_req, res) => {
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
router.post('/:ticketId/approve', async (req, res) => {
  try {
    const { notes } = req.body;
    const actorId = req.headers['x-user-id'];

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const admin = actorId ? await User.findById(actorId) : null;
    const adminName = admin ? admin.name : 'Municipal Supervisor';

    const prevStatus = ticket.status;
    ticket.status = 'RESOLVED';

    ticket.history.push({
      action: 'VERIFIED_RESOLVED',
      from_status: prevStatus,
      to_status: 'RESOLVED',
      performed_by: admin ? admin._id : null,
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
router.post('/:ticketId/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const actorId = req.headers['x-user-id'];

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const admin = actorId ? await User.findById(actorId) : null;
    const adminName = admin ? admin.name : 'Municipal Supervisor';

    const prevStatus = ticket.status;
    ticket.status = 'REOPENED';

    ticket.history.push({
      action: 'REOPENED',
      from_status: prevStatus,
      to_status: 'REOPENED',
      performed_by: admin ? admin._id : null,
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
        type: 'ticket_reopened',
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
    const actorId = req.headers['x-user-id'];

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const citizen = actorId ? await User.findById(actorId) : (ticket.citizen_id ? await User.findById(ticket.citizen_id) : null);
    const citizenName = citizen ? citizen.name : 'Citizen';

    const feedback = await CitizenFeedback.create({
      ticket_id: ticket._id,
      citizen_id: citizen ? citizen._id : ticket.citizen_id,
      rating: Number(rating) || 5,
      is_satisfied: is_satisfied !== false,
      reopen_requested: Boolean(reopen_requested),
      reopen_reason: reopen_reason || '',
      proof_images: Array.isArray(proof_images) ? proof_images : [],
    });

    const io = req.app.get('io');

    // If citizen disputes and requests reopen
    if (reopen_requested || is_satisfied === false) {
      const prevStatus = ticket.status;
      ticket.status = 'REOPENED';

      ticket.history.push({
        action: 'REOPENED',
        from_status: prevStatus,
        to_status: 'REOPENED',
        performed_by: citizen ? citizen._id : null,
        performed_by_name: citizenName,
        performed_by_role: 'citizen',
        notes: `Citizen disputed resolution: ${reopen_reason || 'Issue still persists.'}`,
        timestamp: new Date(),
      });

      await ticket.save();

      // Alert municipal admin
      await dispatchNotification(io, {
        role: 'admin',
        title: 'Resolution Disputed by Citizen',
        message: `${citizenName} disputed Ticket #${ticket._id.toString().slice(-4)}: "${reopen_reason || 'Unresolved'}"`,
        type: 'ticket_reopened',
        ticket_id: ticket._id,
      });

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
    }

    return res.status(201).json({
      message: reopen_requested ? 'Dispute submitted. Issue has been reopened.' : 'Thank you for your feedback.',
      feedback,
      ticket,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to submit citizen feedback.' });
  }
});

export default router;
