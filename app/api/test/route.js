import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: 'Connected to MongoDB!' });
  } catch (error) {
    return Response.json({ error: 'Connection failed!', details: error.message });
  }
}
