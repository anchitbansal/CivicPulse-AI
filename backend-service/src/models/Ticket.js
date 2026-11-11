import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  defect_type: { type: String, required: true, index: true },
  priority_score: { type: Number, required: true, min: 1, max: 100 },
  severity: { type: String, enum: ["CRITICAL", "MEDIUM", "LOW"], required: true },
  location: { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], required: true } },
  exif_timestamp: Date,
  before_image_url: String,
  after_image_url: String,
  status: { type: String, enum: ["Pending", "Assigned", "In Progress", "Resolved"], default: "Pending" },
  upvote_count: { type: Number, default: 1 },
  report_frequency: { type: Number, default: 1 },
  zone: { type: String, default: "Central" },
  ai_analysis: mongoose.Schema.Types.Mixed
}, { timestamps: true });
ticketSchema.index({ location: "2dsphere" });
export default mongoose.model("Ticket", ticketSchema);
