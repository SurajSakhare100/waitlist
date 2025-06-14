import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  waitlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waitlist',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
  },
  referralCount: {
    type: Number,
    default: 0,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)