const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  time: { type: String },
});

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
