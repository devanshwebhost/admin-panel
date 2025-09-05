import nodemailer from "nodemailer";
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import Team from '@/models/Team'; // Import the Team model
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// 🟡 Create Task
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { title, description, deadline, assignedTo, assignedBy, teamId } = body;

    // Validate required fields
    if (!title || !deadline || !assignedBy || (!assignedTo && !teamId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let assignedUsers = [];
    let taskTeamName = null;
    let taskTeamId = null;

    if (teamId) {
      // If a teamId is provided, assign the task to all team members
      const team = await Team.findById(teamId).populate('members');
      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      assignedUsers = team.members.map(member => member._id);
      taskTeamName = team.name;
      taskTeamId = team._id;
    } else {
      // Otherwise, assign to a single user
      assignedUsers = [new mongoose.Types.ObjectId(assignedTo)];
    }

    const task = await Task.create({
      title,
      description,
      dueDate: new Date(deadline),
      assignedTo: assignedUsers,
      assignedBy: new mongoose.Types.ObjectId(assignedBy),
      team: taskTeamId, // Assign the team ID to the task
      teamName: taskTeamName, // Assign the team name to the task
    });

    // Update pending tasks for each assigned user
    await User.updateMany(
      { _id: { $in: assignedUsers } },
      { $push: { pendingTasks: task._id } }
    );

    // 📩 Get and send email to all assigned employees
    const employees = await User.find({ _id: { $in: assignedUsers } });
    const assignedEmails = employees.map(employee => employee.email).filter(Boolean); // Filter out any null emails

    if (assignedEmails.length > 0) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_SERVER_USER,
        to: assignedEmails.join(','), // Join multiple emails with a comma
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


// 🟢 Get Tasks for a Specific Assigned User or Team
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assignedTo");
    const teamId = searchParams.get("teamId");

    let filter = {};

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    } else if (teamId) {
      filter.team = teamId;
    }

    const tasks = await Task.find(filter)
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .populate("team", "name"); // Populate the team details

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


