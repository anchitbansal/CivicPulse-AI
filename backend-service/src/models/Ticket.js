import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    defect_type: {
      type: String,
      required: true,
      enum: ['pothole', 'garbage', 'sewage', 'streetlight', 'unknown'],
    },
    priority_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'MEDIUM', 'LOW'],
      default: 'LOW',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    exif_timestamp: { type: Date },
    before_image_url: String,
    after_image_url: String,
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    upvote_count: { type: Number, default: 0 },
    report_frequency: { type: Number, default: 1 },
    duplicate_count: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    zone: { type: String, default: 'central' },
    before_damage_pct: Number,
    after_damage_pct: Number,
  },
  { timestamps: true }
);

ticketSchema.index({ location: '2dsphere' });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

export default Ticket;
