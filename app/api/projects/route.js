import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    await connectDB();

    const projects = await Project.find().sort({ createdAt: -1 }); // sorted by newest first
    return NextResponse.json(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received on server:", body.createdBy); // should NOT be undefined

    const project = new Project(body); // assuming body has all fields
    await project.save();

    return NextResponse.json({ success: true, project });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

