import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();
  const teams = await Team.find()
    .populate('leader', 'firstName lastName')
    .populate('members', 'firstName lastName');
    
  return NextResponse.json({ teams });
}
