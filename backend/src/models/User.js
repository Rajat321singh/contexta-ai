import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  interests: [{
    type: String,
    enum: ['technology',
  'politics',
  'finance',
  'ai',
  'cloud',
  'cybersecurity',
  'web3',
  'devops',
  'sports',
  'startups',
  'science',
  'business',
  'geopolitics'],
    required: true
  }],
  keywords: [String],
  delivery: {
    type: {
      type: String,
      enum: ['email'],
      default: 'email'
    },
    times: [{
      type: String, // Format: "07:00", "21:00"
      required: true
    }]
  },
  preferences: {
    tone: {
      type: String,
      enum: ['concise', 'detailed', 'technical'],
      default: 'concise'
    },
    minImportanceScore: {
      type: Number,
      default: 5
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);