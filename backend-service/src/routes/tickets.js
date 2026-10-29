import express from 'express';
import multer from 'multer';
import Ticket from '../models/Ticket.js';
import { analyzeImage, verifyResolution } from '../services/aiClient.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const fallbackTickets = [
  {
    _id: 'fallback-1',
    defect_type: 'pothole',
    priority_score: 87,
    severity: 'CRITICAL',
    location: { type: 'Point', coordinates: [-73.9867, 40.7306] },
    status: 'Pending',
    zone: 'central',
    report_frequency: 2,
    upvote_count: 11,
    before_damage_pct: 68,
    after_damage_pct: 25,
    confidence: 0.91,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-2',
    defect_type: 'garbage',
    priority_score: 56,
    severity: 'MEDIUM',
    location: { type: 'Point', coordinates: [-73.9831, 40.7387] },
    status: 'Assigned',
    zone: 'north',
    report_frequency: 3,
    upvote_count: 5,
    before_damage_pct: 35,
    after_damage_pct: 18,
    confidence: 0.76,
    createdAt: new Date().toISOString(),
  },
];

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

router.get('/', async (req, res) => {
  const { status, zone, priority_score } = req.query;

  try {
    const query = {};
    if (status) query.status = status;
    if (zone) query.zone = zone;
    if (priority_score) query.priority_score = { $gte: Number(priority_score) };

    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
    return res.json(tickets.length ? tickets : fallbackTickets);
  } catch (error) {
    return res.json(fallbackTickets);
  }
});

router.post('/report', upload.single('image'), async (req, res) => {
  try {
    const { defect_type, latitude, longitude, status = 'Pending', severity, priority_score, report_frequency = 1 } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const lat = Number(latitude || 40.7306);
    const lng = Number(longitude || -73.9867);
    const aiResult = await analyzeImage(file, { defect_type });
    const defectLabel = aiResult.defect_type || defect_type || 'pothole';
    const zone = getZoneFromCoordinates([lng, lat]);

    const duplicateTicket = await Ticket.findOne({
      defect_type: defectLabel,
      status: { $ne: 'Resolved' },
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
      duplicateTicket.status = 'Pending';
      await duplicateTicket.save();

      emitSocketEvent(req, 'INCIDENT_UPDATED', duplicateTicket.toObject());
      return res.status(200).json({
        message: 'Duplicate ticket merged into existing incident.',
        ticket: duplicateTicket,
        merged: true,
      });
    }

    const newTicket = await Ticket.create({
      defect_type: defectLabel,
      priority_score: Number(priority_score || aiResult.priority_score || 50),
      severity: severity || aiResult.severity || 'MEDIUM',
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      exif_timestamp: new Date(),
      before_image_url: req.body.before_image_url || '',
      after_image_url: req.body.after_image_url || '',
      status,
      zone,
      confidence: Number(aiResult.confidence || 0.8),
      upvote_count: 1,
      report_frequency: Number(report_frequency),
      duplicate_count: 0,
      before_damage_pct: aiResult.damage_coverage_pct || 0,
      after_damage_pct: 0,
    });

    emitSocketEvent(req, 'INCIDENT_CREATED', newTicket.toObject());
    return res.status(201).json({
      message: 'Ticket created successfully.',
      ticket: newTicket,
      merged: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Failed to report ticket.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    ticket.status = status;
    if (status === 'Resolved') {
      const beforeFile = { buffer: Buffer.from(''), mimetype: 'image/jpeg', originalname: 'before.jpg' };
      const afterFile = { buffer: Buffer.from(''), mimetype: 'image/jpeg', originalname: 'after.jpg' };
      const verification = await verifyResolution(beforeFile, afterFile);
      ticket.after_damage_pct = verification.after_damage_pct || 0;
      ticket.before_damage_pct = verification.before_damage_pct || ticket.before_damage_pct || 0;
    }
    await ticket.save();

    emitSocketEvent(req, status === 'Resolved' ? 'INCIDENT_RESOLVED' : 'INCIDENT_UPDATED', ticket.toObject());
    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update ticket status.' });
  }
});

export default router;
