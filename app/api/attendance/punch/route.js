import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth';
import User from '@/models/User';

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(); // depends on your auth
  const userEmail = session?.user?.email;

  const user = await User.findOne({ email: userEmail });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  // prevent multiple punches
  const already = await Attendance.findOne({ user: user._id, date: dateStr });
  if (already) return NextResponse.json({ message: 'Already punched' }, { status: 400 });

  const attendance = new Attendance({
    user: user._id,
    date: dateStr,
    time: timeStr,
  });

  await attendance.save();

  return NextResponse.json({ message: 'Attendance punched' });
}
