import mongoose from 'mongoose';

const citizenFeedbackSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    is_satisfied: {
      type: Boolean,
      default: true,
    },
    reopen_requested: {
      type: Boolean,
      default: false,
    },
    reopen_reason: {
      type: String,
      default: '',
    },
    proof_images: [{ type: String }],
  },
  { timestamps: true }
);

const CitizenFeedback =
  mongoose.models.CitizenFeedback || mongoose.model('CitizenFeedback', citizenFeedbackSchema);

export default CitizenFeedback;
