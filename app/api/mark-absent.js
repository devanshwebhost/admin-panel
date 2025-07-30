import {connectDB} from '@/lib/mongodb'; // your MongoDB connector
import User from '@/models/User'; // adjust path

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  try {
    const today = new Date().toISOString().split('T')[0];

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

    return res.status(200).json({ message: 'Absent marked successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
