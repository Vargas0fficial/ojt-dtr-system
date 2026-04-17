import mongoose from 'mongoose';

const DTRLogSchema = new mongoose.Schema({
  intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeIn: { type: Date, required: true },
  timeOut: { type: Date },
  hours: { type: Number, default: 0 },
  isLate: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

export default mongoose.models.DTRLog || mongoose.model('DTRLog', DTRLogSchema);