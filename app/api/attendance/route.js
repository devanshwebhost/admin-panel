// For POST - mark attendance
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    const user = await User.findById(userId);
    if (!user) return Response.json({ success: false, message: 'User not found' });

    if (!user.attendance) user.attendance = [];

    const alreadyMarked = user.attendance.find(a => a.date === today);
    if (alreadyMarked) {
      return Response.json({ success: false, message: 'Already marked' });
    }

    user.attendance.push({ date: today, time: new Date().toISOString() });
    await user.save();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
