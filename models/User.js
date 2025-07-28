import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  phone: { type: String },
  address: { type: String },
  
  emailVerified: { type: Boolean, default: false },
  adminVerified: { type: Boolean, default: false }, // ✅ NEW FIELD

  otp: { type: String },
  otpExpiry: { type: Date },

  isAdmin: { type: Boolean, default: false },
  isTeamLeader: { type: Boolean, default: false },

  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },

  attendance: [
    {
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['present', 'absent'], default: 'present' },
    }
  ],

  pendingTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  myTodos: [
  {
    text: String,
    completed: { type: Boolean, default: false },
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  }
],

}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
