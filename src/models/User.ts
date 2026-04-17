import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  company: { 
    type: String, 
    required: true 
  },
  requiredHours: { 
    type: Number, 
    default: 160 
  },
  role: { 
    type: String, 
    enum: ['intern', 'supervisor'], 
    required: true 
  },
  resetToken: { 
    type: String 
  },
  resetTokenExpiry: { 
    type: Date 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true // adds createdAt and updatedAt automatically
});

export default mongoose.models.User || mongoose.model('User', UserSchema);