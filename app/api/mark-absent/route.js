import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import User from '@/models/User'; // adjust according to your structure

export async function POST() {
  await connectDB();

  const today = new Date().toISOString().split('T')[0];

  try {
    const users = await User.find();

    for (const user of users) {
      const alreadyMarked = user.attendance?.some(
        (a) => a.date.toISOString().split('T')[0] === today
      );

      if (!alreadyMarked) {
        user.attendance.push({
          date: new Date(),
          status: 'absent',
        });
        await user.save();
      }
    }

    return NextResponse.json({ message: 'Absent marked successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
