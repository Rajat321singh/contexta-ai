import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google auth
    },
    minlength: 6
  },
  
  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleProfile: {
    name: String,
    picture: String
  },
  
  // User preferences (filled in onboarding)
  interests: [{
    type: String,
    enum: [
      'technology',
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
      'geopolitics'
    ],
    validate: {
      validator: function(arr) {
        return arr.length <= 4; // Max 4 topics
      },
      message: 'Maximum 4 topics allowed'
    }
  }],
  
  keywords: [String],
  
  delivery: {
    type: {
      type: String,
      enum: ['email'],
      default: 'email'
    },
    times: [{
      type: String,
      validate: {
        validator: function(arr) {
          return arr.length <= 2; // Max 2 times per day
        },
        message: 'Maximum 2 delivery times allowed'
      }
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
  
  // Profile completion
  isOnboarded: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationToken: String,
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get safe user object (no password)
userSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    email: this.email,
    interests: this.interests,
    keywords: this.keywords,
    delivery: this.delivery,
    preferences: this.preferences,
    isOnboarded: this.isOnboarded,
    googleProfile: this.googleProfile,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);