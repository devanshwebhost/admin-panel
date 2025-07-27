import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// DELETE /api/tasks/:id
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Task ID' }, { status: 400 });
    }

    await Task.findByIdAndDelete(id);
    return NextResponse.json({ message: '✅ Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('❌ Delete Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tasks/:id
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updatedTask = await Task.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: '✅ Task updated', task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error('❌ Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
