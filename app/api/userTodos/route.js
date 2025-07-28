import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  await connectDB();
  const user = await User.findById(userId);
  return NextResponse.json({ myTodos: user?.myTodos || [] });
}

export async function POST(req) {
  const { userId, text } = await req.json();
  await connectDB();
  const user = await User.findById(userId);

  user.myTodos.push({ text, completed: false });
  await user.save();

  return NextResponse.json({ myTodos: user.myTodos });
}

export async function PATCH(req) {
  const { userId, todoId, text, completed } = await req.json();
  await connectDB();
  const user = await User.findById(userId);

  const todo = user.myTodos.id(todoId);
  if (todo) {
    todo.text = text;
    todo.completed = completed;
  }

  await user.save();
  return NextResponse.json({ todos: user.myTodos });
}

export async function DELETE(req) {
  const { userId, todoId } = await req.json();
  await connectDB();
  const user = await User.findById(userId);

  user.myTodos = user.myTodos.filter((todo) => todo._id.toString() !== todoId);
  await user.save();

  return NextResponse.json({ todos: user.myTodos });
}
