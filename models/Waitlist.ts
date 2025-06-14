import mongoose from 'mongoose'

const WaitlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  placeholderText: {
    type: String,
    default: 'Enter your email',
  },
  buttonText: {
    type: String,
    default: 'Join the waitlist',
  },
  successMessage: {
    type: String,
    default: 'Success! You\'re on the waitlist 🎉',
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
  logoSize: {
    type: String,
    default: '1X',
  },
  showSocialProof: {
    type: Boolean,
    default: true,
  },
  enableReferrals: {
    type: Boolean,
    default: true,
  },
  whiteLabel: {
    type: Boolean,
    default: false,
  },
  customDomain: {
    type: String,
  },
  embedCode: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Waitlist || mongoose.model('Waitlist', WaitlistSchema)