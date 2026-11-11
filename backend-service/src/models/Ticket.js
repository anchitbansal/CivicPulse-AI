import mongoose from 'mongoose';

const statusMap = {
  Pending: 'REPORTED',
  Assigned: 'ASSIGNED',
  'In Progress': 'IN_PROGRESS',
  Resolved: 'RESOLVED',
};

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Civic Issue',
    },
    description: {
      type: String,
      default: '',
    },
    defect_type: {
      type: String,
      required: true,
      enum: ['pothole', 'garbage', 'sewage', 'streetlight', 'traffic_light', 'unknown'],
      index: true,
    },
    priority_score: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      address: {
        type: String,
        default: 'GPS Tagged Location',
      },
      ward: {
        type: String,
        default: 'Central Ward',
      },
      city: {
        type: String,
        default: 'Smart City',
      },
    },
    exif_timestamp: { type: Date, default: Date.now },
    before_image_url: { type: String, default: '' },
    after_image_url: { type: String, default: '' },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: 'Incident photo' },
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: [
        'REPORTED',
        'ASSIGNED',
        'IN_PROGRESS',
        'PENDING_VERIFICATION',
        'RESOLVED',
        'REOPENED',
        // Legacy compatibility
        'Pending',
        'Assigned',
        'In Progress',
        'Resolved',
      ],
      default: 'REPORTED',
      index: true,
      set: function (v) {
        return statusMap[v] || v;
      },
    },
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assigned_worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assigned_supervisor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolution_proof: {
      images: [{ type: String }],
      completion_notes: { type: String, default: '' },
      submitted_at: { type: Date, default: null },
      submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    history: [
      {
        action: { type: String, required: true },
        from_status: { type: String },
        to_status: { type: String },
        performed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        performed_by_name: { type: String, default: 'System' },
        performed_by_role: { type: String, default: 'system' },
        notes: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    upvote_count: { type: Number, default: 0 },
    report_frequency: { type: Number, default: 1 },
    duplicate_count: { type: Number, default: 0 },
    duplicate_parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null },
    confidence: { type: Number, default: 0 },
    zone: { type: String, default: 'central' },
    before_damage_pct: { type: Number, default: 0 },
    after_damage_pct: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ticketSchema.index({ location: '2dsphere' });

// Ensure legacy statuses normalize on save
ticketSchema.pre('save', function (next) {
  if (statusMap[this.status]) {
    this.status = statusMap[this.status];
  }
  next();
});

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

export default Ticket;
