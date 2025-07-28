import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Todo || mongoose.model('Todo', TodoSchema);
