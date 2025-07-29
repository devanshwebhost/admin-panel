import nodemailer from "nodemailer";
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// 🟡 Create Task
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { title, description, deadline, assignedTo, assignedBy } = body;

    if (!title || !deadline || !assignedTo || !assignedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await Task.create({
      title,
      description,
      dueDate: new Date(deadline),
      assignedTo: [new mongoose.Types.ObjectId(assignedTo)],
      assignedBy: new mongoose.Types.ObjectId(assignedBy),
    });

    await User.findByIdAndUpdate(assignedTo, {
      $push: { pendingTasks: task._id },
    });

    // 🟨 Get employee email
    const employee = await User.findById(assignedTo);
    const email = employee?.email;

    if (email) {
      // 📩 Send Email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SERVER_USER,       // Your email address
          pass: process.env.EMAIL_SERVER_PASS,       // Your app password
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_SERVER_USER,
        to: email,
        subject: `New Task Assigned: ${title}`,
        html: `<h3>New Task Assigned</h3>
               <p><strong>Title:</strong> ${title}</p>
               <p><strong>Description:</strong> ${description || 'No description'}</p>
               <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>`,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ message: 'Task assigned successfully', task }, { status: 200 });
  } catch (error) {
    console.error("❌ Error assigning task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🟢 Get Tasks for a Specific Assigned User
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assignedTo");

    const filter = assignedTo ? { assignedTo: assignedTo } : {};

    const tasks = await Task.find(filter)
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName");

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

