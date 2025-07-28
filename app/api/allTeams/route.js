import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const teams = await Team.find()
      .populate('leader', 'firstName lastName')
      .populate('members', 'firstName lastName');
    res.status(200).json({ teams });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
