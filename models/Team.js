import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
report: {
  type: Map,
  of: {
    total: Number,
    pending: Number,
    completed: Number,
    inProgress: Number,
  },
  default: {},
},


});

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
