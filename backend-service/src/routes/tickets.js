import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import { analyzeImage, verifyResolution } from '../services/aiClient.js';
import { saveBufferLocally } from '../services/storageService.js';
import { dispatchNotification } from '../services/notificationService.js';
import { requireRole } from '../middleware/auth.js';
import {
  ADMIN_STATUS_TRANSITIONS,
  canAccessTicket,
  canonicalStatus,
  ticketListFilter,
} from '../middleware/access.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED_DEFECT_TYPES = ['pothole', 'garbage', 'sewage', 'streetlight', 'traffic_light', 'unknown'];

const normalizeDefectType = (aiType, userType) => {
  const clean = (val) => String(val || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  const normalizedAi = clean(aiType);
  const normalizedUser = clean(userType);

  const synonymMap = {
    traffic_light: 'traffic_light',
    traffic_signal: 'traffic_light',
    stop_light: 'traffic_light',
    streetlight: 'streetlight',
    street_light: 'streetlight',
    streetlamp: 'streetlight',
    lamp_post: 'streetlight',
    garbage: 'garbage',
    waste: 'garbage',
    trash: 'garbage',
    litter: 'garbage',
    dumpster: 'garbage',
    bottle: 'garbage',
    cup: 'garbage',
    pothole: 'pothole',
    road_damage: 'pothole',
    crack: 'pothole',
    hole: 'pothole',
    sewage: 'sewage',
    sewage_spill: 'sewage',
    drain: 'sewage',
    manhole: 'sewage',
    water_leak: 'sewage',
  };

  if (ALLOWED_DEFECT_TYPES.includes(normalizedAi)) {
    return normalizedAi;
  }
  if (synonymMap[normalizedAi]) {
    return synonymMap[normalizedAi];
  }

  if (ALLOWED_DEFECT_TYPES.includes(normalizedUser)) {
    return normalizedUser;
  }
  if (synonymMap[normalizedUser]) {
    return synonymMap[normalizedUser];
  }

  return 'unknown';
};

const getZoneFromCoordinates = ([lng, lat]) => {
  if (lat > 40.74) return 'north';
  if (lat < 40.72) return 'south';
  return 'central';
};

const emitSocketEvent = (req, eventName, payload) => {
  const io = req.app.get('io');
  if (io) {
    const zone = payload.zone || 'central';
    io.to(zone).emit(eventName, payload);
    io.emit(eventName, payload);
  }
};

// GET /api/tickets/my-reports (Tickets filed by current citizen)
router.get('/my-reports', async (req, res) => {
  try {
    const query = { citizen_id: req.user._id };
    const tickets = await Ticket.find(query)
      .populate('assigned_worker_id', 'name email phone department')
      .sort({ createdAt: -1 })
      .lean();
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch my reports.' });
  }
});

// GET /api/tickets/assigned-to-me (Tickets assigned to current worker)
router.get('/assigned-to-me', async (req, res) => {
  try {
    if (!['worker', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    const query = { assigned_worker_id: req.user._id };
    const tickets = await Ticket.find(query)
      .populate('citizen_id', 'name email phone')
      .sort({ priority_score: -1, createdAt: -1 })
      .lean();
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch assigned tickets.' });
  }
});

// GET /api/tickets/:id (Single ticket detail with history and relationships)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate('citizen_id', 'name email phone avatar_url')
      .populate('assigned_worker_id', 'name email phone department rating current_location')
      .populate('assigned_supervisor_id', 'name email phone department')
      .lean();

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'You do not have permission to access this complaint.' });
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch ticket.' });
  }
});

// GET /api/tickets (Filterable list of all tickets)
router.get('/', async (req, res) => {
  const { status, zone, defect_type, priority, ward } = req.query;

  try {
    const query = { ...ticketListFilter(req.user) };
    if (req.user.role === 'supervisor' && ward && ward !== req.user.assigned_ward) {
      return res.json([]);
    }
    if (status) {
      if (status === 'Pending') {
        query.status = { $in: ['REPORTED', 'Pending'] };
      } else if (status === 'Assigned') {
        query.status = { $in: ['ASSIGNED', 'Assigned'] };
      } else if (status === 'In Progress') {
        query.status = { $in: ['IN_PROGRESS', 'In Progress'] };
      } else if (status === 'Resolved') {
        query.status = { $in: ['RESOLVED', 'Resolved'] };
      } else {
        query.status = status;
      }
    }
    if (zone) query.zone = zone;
    if (defect_type) query.defect_type = defect_type;
    if (priority) query.severity = priority;
    if (ward) query['location.ward'] = ward;

    const tickets = await Ticket.find(query)
      .populate('citizen_id', 'name email')
      .populate('assigned_worker_id', 'name department')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch tickets.' });
  }
});

// POST /api/tickets/report (Citizen reports civic defect)
router.post('/report', requireRole('citizen'), upload.single('image'), async (req, res) => {
  try {
    const {
      defect_type,
      latitude,
      longitude,
      address,
      ward,
      title,
      description,
      status = 'REPORTED',
      severity,
      priority_score,
      report_frequency = 1,
    } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const citizenUser = req.user?.role === 'citizen' ? req.user : null;

    const lat = Number(latitude || 40.7306);
    const lng = Number(longitude || -73.9867);

    // Save image to local disk
    const savedImagePath = await saveBufferLocally(file.buffer, file.originalname);

    // Run AI defect analysis
    const aiResult = await analyzeImage(file, { defect_type });
    const defectLabel = normalizeDefectType(aiResult.defect_type, defect_type);
    const zone = getZoneFromCoordinates([lng, lat]);

    // Check for duplicate complaints within 15 meters
    const duplicateTicket = await Ticket.findOne({
      defect_type: defectLabel,
      status: { $nin: ['RESOLVED', 'Resolved'] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 15,
        },
      },
    });

    if (duplicateTicket) {
      duplicateTicket.upvote_count += 1;
      duplicateTicket.report_frequency += Number(report_frequency);
      duplicateTicket.duplicate_count += 1;
      duplicateTicket.images.push({
        url: savedImagePath,
        caption: 'Duplicate citizen report photo',
        uploaded_at: new Date(),
      });
      duplicateTicket.history.push({
        action: 'DUPLICATE_CONSOLIDATED',
        performed_by: citizenUser?._id || null,
        performed_by_name: citizenUser?.name || 'Citizen',
        performed_by_role: 'citizen',
        notes: 'Merged corroborating report from duplicate location within 15m radius.',
        timestamp: new Date(),
      });
      await duplicateTicket.save();

      emitSocketEvent(req, 'INCIDENT_UPDATED', duplicateTicket.toObject());
      return res.status(200).json({
        message: 'Duplicate ticket merged into existing incident.',
        ticket: duplicateTicket,
        merged: true,
      });
    }

    const calculatedSeverity = severity || aiResult.severity || 'MEDIUM';
    const calculatedPriority = Number(priority_score || aiResult.priority_score || 50);

    const newTicket = await Ticket.create({
      title: title || `${defectLabel.replace('_', ' ').toUpperCase()} reported at ${ward || 'City Center'}`,
      description: description || 'Citizen reported civic defect with photographic evidence.',
      defect_type: defectLabel,
      priority_score: calculatedPriority,
      severity: calculatedSeverity,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || 'GPS Location Tagged',
        ward: ward || 'Central Ward',
        city: 'Smart City',
      },
      exif_timestamp: new Date(),
      before_image_url: savedImagePath,
      images: [
        {
          url: savedImagePath,
          caption: 'Initial report photo',
          uploaded_at: new Date(),
        },
      ],
      status: 'REPORTED',
      zone,
      confidence: Number(aiResult.confidence || 0.8),
      citizen_id: citizenUser?._id || null,
      upvote_count: 1,
      report_frequency: Number(report_frequency),
      duplicate_count: 0,
      before_damage_pct: aiResult.damage_coverage_pct || 0,
      after_damage_pct: 0,
      history: [
        {
          action: 'CREATED',
          from_status: null,
          to_status: 'REPORTED',
          performed_by: citizenUser?._id || null,
          performed_by_name: citizenUser?.name || 'Citizen',
          performed_by_role: 'citizen',
          notes: 'Initial issue reported with AI defect analysis.',
          timestamp: new Date(),
        },
      ],
    });

    const io = req.app.get('io');

    // Notify administrators
    await dispatchNotification(io, {
      role: 'admin',
      title: 'New Incident Reported',
      message: `A ${newTicket.defect_type} (${newTicket.severity}) was reported in ${newTicket.location?.ward || 'Central Ward'}.`,
      type: 'ticket_created',
      ticket_id: newTicket._id,
    });

    emitSocketEvent(req, 'INCIDENT_CREATED', newTicket.toObject());
    if (io) {
      io.to('role:admin').emit('INCIDENT_CREATED', newTicket.toObject());
    }

    return res.status(201).json({
      message: 'Ticket created successfully.',
      ticket: newTicket,
      merged: false,
    });
  } catch (error) {
    console.error('Report error:', error);
    return res.status(500).json({ message: error.message || 'Failed to report ticket.' });
  }
});

// PATCH /api/tickets/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status, notes } = req.body;

  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only an administrator can change official complaint status.' });
    }

    const nextStatus = canonicalStatus(status);
    if (!nextStatus) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const allowed = ADMIN_STATUS_TRANSITIONS[ticket.status] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(409).json({
        message: `Cannot change status from ${ticket.status} to ${nextStatus}.`,
      });
    }

    const actor = req.user;
    const actorName = actor.name;
    const actorRole = actor.role;

    const prevStatus = ticket.status;
    ticket.status = nextStatus;

    if (nextStatus === 'RESOLVED') {
      const beforeFile = { buffer: Buffer.from(''), mimetype: 'image/jpeg', originalname: 'before.jpg' };
      const afterFile = { buffer: Buffer.from(''), mimetype: 'image/jpeg', originalname: 'after.jpg' };
      try {
        const verification = await verifyResolution(beforeFile, afterFile);
        ticket.after_damage_pct = verification.after_damage_pct || 0;
        ticket.before_damage_pct = verification.before_damage_pct || ticket.before_damage_pct || 0;
      } catch (e) {
        console.warn('AI resolution check optional step:', e.message);
      }
    }

    ticket.history.push({
      action: 'STATUS_UPDATED',
      from_status: prevStatus,
      to_status: nextStatus,
      performed_by: actor._id,
      performed_by_name: actorName,
      performed_by_role: actorRole,
      notes: notes || `Status updated to ${nextStatus}`,
      timestamp: new Date(),
    });

    await ticket.save();

    const io = req.app.get('io');
    const isResolved = nextStatus === 'RESOLVED';
    emitSocketEvent(req, isResolved ? 'INCIDENT_RESOLVED' : 'INCIDENT_UPDATED', ticket.toObject());

    if (io) {
      io.to(`ticket:${ticket._id}`).emit('ticket:status_change', {
        ticketId: ticket._id,
        from_status: prevStatus,
        to_status: nextStatus,
        ticket,
      });
      io.to('role:admin').emit('INCIDENT_UPDATED', ticket.toObject());
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update ticket status.' });
  }
});

export default router;
