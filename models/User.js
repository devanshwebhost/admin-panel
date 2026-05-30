import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // 1. Basic Information
  email: { type: String, unique: true, required: true },
  password: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  phone: { type: String },
  address: { type: String },
  profileImage: { type: String, default: "" }, // 🆕 User ki DP ke liye

  // 2. Professional & HR Info (Future-Proofing)
  designation: { type: String, default: "Employee" }, // 🆕 ex: "Lead Video Editor", "Developer"
  department: { type: String, default: "General" }, // 🆕 ex: "IT", "Production", "Design"
  joiningDate: { type: Date, default: Date.now }, // 🆕 Kab join kiya
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }, // 🆕 Employee chhod de toh 'inactive' kar sako bina data delete kiye
  
  emergencyContact: { // 🆕 Emergency ke time kaam aane ke liye
    name: { type: String, default: "" },
    relation: { type: String, default: "" },
    phone: { type: String, default: "" }
  },

  socialLinks: { // 🆕 Portfolio, GitHub ya LinkedIn links ke liye
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" }
  },

  // 3. Authentication & Security
  emailVerified: { type: Boolean, default: false },
  adminVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  lastLogin: { type: Date }, // 🆕 Tracking ke liye ki user aakhri baar kab online aaya tha

  // 4. Roles & Teams
  isAdmin: { type: Boolean, default: false },
  isTeamLeader: { type: Boolean, default: false },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  teamName: {
    type: String,
    default: null,
  },

  // 5. Work, Attendance & Productivity
  attendance: [
    {
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['present', 'absent', 'half-day', 'leave'] } // 🆕 'half-day' aur 'leave' add kiya
    }
  ],
  leaveBalance: { type: Number, default: 12 }, // 🆕 Saal ki kitni chhuttiyan bachi hain

  pendingTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  
  myTodos: [
    {
      text: String,
      completed: { type: Boolean, default: false },
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    }
  ],

  // 6. In-App Notifications
  notifications: [
    {
      title: { type: String },
      message: { type: String },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]

}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);