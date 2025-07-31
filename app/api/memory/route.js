// app/api/memory/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Memory } from '@/lib/models';

// GET memory for user
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const memory = await Memory.findOne({ userId });
  return NextResponse.json(memory?.messages || []);
}

// DELETE memory for user
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const memory = await Memory.findOne({ userId });
  if (memory) {
    memory.messages = [];
    await memory.save();
  }

  return NextResponse.json({ message: "Memory cleared." });
}
