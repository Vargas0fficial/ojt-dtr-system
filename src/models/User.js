import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['intern', 'supervisor'], default: 'intern' },
  company: String,
  supervisor: String,
  requiredHours: { type: Number, default: 160 },
  expectedStartTime: { type: String, default: '09:00' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);