import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  internName: String,
  company: String,
  supervisor: String,
  date: { type: String, default: () => new Date().toLocaleDateString() },
  timeIn: Date,
  timeOut: Date,
  totalHours: Number,
  remarks: String
}, { timestamps: true });

export default mongoose.models.Log || mongoose.model('Log', LogSchema);