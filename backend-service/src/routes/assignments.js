import express from 'express';
import multer from 'multer';
import Assignment from '../models/Assignment.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { saveBufferLocally } from '../services/storageService.js';
import { dispatchNotification } from '../services/notificationService.js';
import { verifyResolution } from '../services/aiClient.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Assign a ticket to a field worker
router.post('/', async (req, res) => {
  try {
    const { ticket_id, worker_id, instructions, priority_override, sla_hours } = req.body;
    const actorId = req.headers['x-user-id'] || req.body.assigned_by;

    if (!ticket_id || !worker_id) {
      return res.status(400).json({ message: 'ticket_id and worker_id are required.' });
    }

    const ticket = await Ticket.findById(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const worker = await User.findById(worker_id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    const admin = actorId ? await User.findById(actorId) : null;
    const adminName = admin ? admin.name : 'Municipal Administrator';

    // Calculate SLA deadline
    const hours = Number(sla_hours) || (ticket.priority === 'CRITICAL' ? 12 : 24);
    const slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Create or update assignment
    const assignment = await Assignment.create({
      ticket_id,
      worker_id,
      assigned_by: admin ? admin._id : worker._id,
      instructions: instructions || 'Please inspect and repair as per municipal standards.',
      priority_override: priority_override || null,
      sla_deadline: slaDeadline,
      status: 'pending',
    });

    // Update ticket status
    const previousStatus = ticket.status;
    ticket.status = 'ASSIGNED';
    ticket.assigned_worker_id = worker._id;
    if (priority_override) {
      ticket.priority = priority_override;
    }

    ticket.history.push({
      action: 'ASSIGNED',
      from_status: previousStatus,
      to_status: 'ASSIGNED',
      performed_by: admin ? admin._id : null,
      performed_by_name: adminName,
      performed_by_role: 'admin',
      notes: instructions || `Dispatched to ${worker.name}`,
      timestamp: new Date(),
    });

    await ticket.save();

    const io = req.app.get('io');

    // Notify the worker
    await dispatchNotification(io, {
      recipient_id: worker._id,
      title: 'New Task Assigned',
      message: `You have been assigned: ${ticket.title || ticket.defect_type}. SLA: ${hours}h.`,
      type: 'ticket_assigned',
      ticket_id: ticket._id,
    });

    // Notify the citizen if available
    if (ticket.citizen_id) {
      await dispatchNotification(io, {
        recipient_id: ticket.citizen_id,
        title: 'Work Crew Dispatched',
        message: `Your complaint has been assigned to field specialist ${worker.name}.`,
        type: 'status_updated',
        ticket_id: ticket._id,
      });
    }

    // Broadcast ticket status change
    if (io) {
      io.to(`ticket:${ticket._id}`).emit('ticket:status_change', {
        ticketId: ticket._id,
        from_status: previousStatus,
        to_status: 'ASSIGNED',
        ticket,
      });
      io.to('role:admin').emit('INCIDENT_UPDATED', ticket.toObject());
      io.emit('INCIDENT_UPDATED', ticket.toObject());
    }

    return res.status(201).json({
      message: 'Ticket successfully assigned.',
      assignment,
      ticket,
    });
  } catch (error) {
    console.error('Assignment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to assign ticket.' });
  }
});

// Worker accepts task and marks "IN_PROGRESS"
router.patch('/:id/accept', async (req, res) => {
  try {
    const actorId = req.headers['x-user-id'];
    let assignment = await Assignment.findById(req.params.id);

    // If param is ticketId instead of assignmentId
    if (!assignment) {
      assignment = await Assignment.findOne({ ticket_id: req.params.id, status: { $ne: 'completed' } });
    }

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    assignment.status = 'in_progress';
    assignment.accepted_at = new Date();
    await assignment.save();

    const ticket = await Ticket.findById(assignment.ticket_id);
    if (ticket) {
      const prevStatus = ticket.status;
      ticket.status = 'IN_PROGRESS';

      const worker = actorId ? await User.findById(actorId) : await User.findById(assignment.worker_id);
      const workerName = worker ? worker.name : 'Field Worker';

      ticket.history.push({
        action: 'WORK_STARTED',
        from_status: prevStatus,
        to_status: 'IN_PROGRESS',
        performed_by: worker ? worker._id : null,
        performed_by_name: workerName,
        performed_by_role: 'worker',
        notes: 'Worker accepted task and commenced repairs on-site.',
        timestamp: new Date(),
      });
      await ticket.save();

      const io = req.app.get('io');
      if (ticket.citizen_id) {
        await dispatchNotification(io, {
          recipient_id: ticket.citizen_id,
          title: 'Repairs In Progress',
          message: `Field specialist ${workerName} has commenced work on your reported issue.`,
          type: 'status_updated',
          ticket_id: ticket._id,
        });
      }

      if (io) {
        io.to(`ticket:${ticket._id}`).emit('ticket:status_change', {
          ticketId: ticket._id,
          from_status: prevStatus,
          to_status: 'IN_PROGRESS',
          ticket,
        });
        io.to('role:admin').emit('INCIDENT_UPDATED', ticket.toObject());
        io.emit('INCIDENT_UPDATED', ticket.toObject());
      }
    }

    return res.json({ message: 'Task marked in progress.', assignment, ticket });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to accept task.' });
  }
});

// Worker submits resolution proof
router.post('/:id/complete', upload.array('proof_images', 5), async (req, res) => {
  try {
    const { completion_notes } = req.body;
    const actorId = req.headers['x-user-id'];

    let ticket = await Ticket.findById(req.params.id);
    let assignment = null;

    if (!ticket) {
      assignment = await Assignment.findById(req.params.id);
      if (assignment) {
        ticket = await Ticket.findById(assignment.ticket_id);
      }
    } else {
      assignment = await Assignment.findOne({ ticket_id: ticket._id }).sort({ createdAt: -1 });
    }

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Save uploaded proof images
    const proofUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await saveBufferLocally(file.buffer, file.originalname);
        proofUrls.push(url);
      }
    } else if (req.body.proof_image_url) {
      proofUrls.push(req.body.proof_image_url);
    }

    if (proofUrls.length === 0) {
      // Fallback default proof image if demo mock
      proofUrls.push('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600');
    }

    // Attempt AI before/after analysis if files provided
    let aiVerification = null;
    if (req.files && req.files.length > 0) {
      try {
        const dummyBefore = { buffer: Buffer.from(''), mimetype: 'image/jpeg', originalname: 'before.jpg' };
        aiVerification = await verifyResolution(dummyBefore, req.files[0]);
      } catch (e) {
        console.warn('AI verification optional step:', e.message);
      }
    }

    const worker = actorId ? await User.findById(actorId) : await User.findById(ticket.assigned_worker_id);
    const workerName = worker ? worker.name : 'Field Specialist';

    const prevStatus = ticket.status;
    ticket.status = 'PENDING_VERIFICATION';
    ticket.after_image_url = proofUrls[0];
    if (aiVerification?.after_damage_pct !== undefined) {
      ticket.after_damage_pct = aiVerification.after_damage_pct;
    }

    ticket.resolution_proof = {
      images: proofUrls,
      completion_notes: completion_notes || 'Repairs completed according to municipal specification.',
      submitted_at: new Date(),
      submitted_by: worker ? worker._id : null,
    };

    ticket.history.push({
      action: 'COMPLETION_SUBMITTED',
      from_status: prevStatus,
      to_status: 'PENDING_VERIFICATION',
      performed_by: worker ? worker._id : null,
      performed_by_name: workerName,
      performed_by_role: 'worker',
      notes: completion_notes || 'Worker submitted repair completion proofs.',
      timestamp: new Date(),
    });

    await ticket.save();

    if (assignment) {
      assignment.status = 'completed';
      assignment.completed_at = new Date();
      await assignment.save();
    }

    const io = req.app.get('io');

    // Notify admins for verification
    await dispatchNotification(io, {
      role: 'admin',
      title: 'Resolution Submitted for Review',
      message: `${workerName} submitted completion proof for Ticket #${ticket._id.toString().slice(-4)}.`,
      type: 'resolution_submitted',
      ticket_id: ticket._id,
    });

    // Notify citizen that fix is pending signoff
    if (ticket.citizen_id) {
      await dispatchNotification(io, {
        recipient_id: ticket.citizen_id,
        title: 'Repairs Completed',
        message: 'The work crew has completed repairs. Awaiting administrative inspection.',
        type: 'status_updated',
        ticket_id: ticket._id,
      });
    }

    if (io) {
      io.to(`ticket:${ticket._id}`).emit('ticket:status_change', {
        ticketId: ticket._id,
        from_status: prevStatus,
        to_status: 'PENDING_VERIFICATION',
        ticket,
      });
      io.to('role:admin').emit('INCIDENT_UPDATED', ticket.toObject());
      io.emit('INCIDENT_UPDATED', ticket.toObject());
    }

    return res.json({
      message: 'Resolution proof submitted successfully. Awaiting administrative signoff.',
      ticket,
    });
  } catch (error) {
    console.error('Complete error:', error);
    return res.status(500).json({ message: error.message || 'Failed to submit completion.' });
  }
});

export default router;
