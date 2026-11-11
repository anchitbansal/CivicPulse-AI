import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['citizen', 'worker', 'supervisor', 'admin'],
      default: 'citizen',
      index: true,
    },
    department: {
      type: String,
      enum: [
        'Roads & Infrastructure',
        'Sanitation & Waste',
        'Water & Sewage',
        'Electrical & Lighting',
        'Traffic Operations',
        'General Administration',
      ],
      default: 'General Administration',
    },
    assigned_ward: {
      type: String,
      default: 'Central Ward',
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    current_location: {
      lat: { type: Number, default: 40.7306 },
      lng: { type: Number, default: -73.9867 },
    },
    active_tasks_count: {
      type: Number,
      default: 0,
    },
    completed_tasks_count: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    avatar_url: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
