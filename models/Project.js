import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: String,
  startDate: String,
  description: String,
  amount: Number,
  timeline: String,
  clientName: String,
  clientOrigin: String,
  type: {
    type: String,
    enum: ['running', 'upcoming', 'completed']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
