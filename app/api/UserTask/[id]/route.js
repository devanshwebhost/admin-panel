// PUT /api/UserTask/[id]
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    console.log("🧾 PUT request body:", body);
    console.log("🆔 Task ID:", id);

    const { status } = body;

    const validStatuses = ["pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: '✅ Task status updated', task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating task status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

