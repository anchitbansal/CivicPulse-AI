import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import { Server } from "socket.io";
import Ticket from "./models/Ticket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || "*" } });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

const emitTicket = (event, ticket) => io.to(`zone:${ticket.zone || "Central"}`).emit(event, ticket);
io.on("connection", socket => {
  socket.on("JOIN_ZONE", zone => socket.join(`zone:${zone || "Central"}`));
  socket.on("LEAVE_ZONE", zone => socket.leave(`zone:${zone || "Central"}`));
});

app.get("/health", (_, res) => res.json({ status: "ok", service: "backend" }));
app.get("/api/tickets", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.zone) filter.zone = req.query.zone;
    if (req.query.minPriority) filter.priority_score = { $gte: Number(req.query.minPriority) };
    res.json(await Ticket.find(filter).sort({ priority_score: -1, createdAt: -1 }).limit(250));
  } catch (error) { next(error); }
});

app.post("/api/tickets/report", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image is required" });
    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
    const { data: analysis } = await axios.post(`${process.env.AI_SERVICE_URL || "http://localhost:5000"}/analyze`, form, { headers: form.getHeaders(), timeout: 120000 });
    const lat = Number(req.body.latitude ?? analysis.exif.latitude);
    const lng = Number(req.body.longitude ?? analysis.exif.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: "latitude and longitude are required" });
    const existing = await Ticket.findOne({ defect_type: analysis.defect_type, location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: 15 } } });
    if (existing) {
      existing.upvote_count += 1;
      existing.report_frequency += 1;
      existing.priority_score = Math.max(existing.priority_score, analysis.priority_score);
      await existing.save();
      emitTicket("INCIDENT_UPDATED", existing);
      return res.status(200).json({ ticket: existing, merged: true, analysis });
    }
    const ticket = await Ticket.create({ defect_type: analysis.defect_type, priority_score: analysis.priority_score, severity: analysis.severity, location: { type: "Point", coordinates: [lng, lat] }, exif_timestamp: analysis.exif.captured_at || undefined, before_image_url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`, zone: req.body.zone || "Central", ai_analysis: analysis });
    emitTicket("INCIDENT_CREATED", ticket);
    res.status(201).json({ ticket, merged: false, analysis });
  } catch (error) { next(error); }
});

app.patch("/api/tickets/:id/status", async (req, res, next) => {
  try {
    const allowed = ["Pending", "Assigned", "In Progress", "Resolved"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "invalid status" });
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ error: "ticket not found" });
    emitTicket(req.body.status === "Resolved" ? "INCIDENT_RESOLVED" : "INCIDENT_UPDATED", ticket);
    res.json(ticket);
  } catch (error) { next(error); }
});

app.use((error, _, res, __) => res.status(error.response?.status || 500).json({ error: error.message || "internal server error" }));
const port = Number(process.env.BACKEND_PORT || 4000);
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/civicpulse")
  .then(() => server.listen(port, () => console.log(`CivicPulse backend listening on ${port}`)))
  .catch(error => { console.error("MongoDB connection failed", error); process.exit(1); });
