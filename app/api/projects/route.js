import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(request) {
  await connectDB();
  const body = await request.json();

  const project = await Project.create(body);
  return new Response(JSON.stringify(project), { status: 201 });
}

export async function GET() {
  await connectDB();
  const projects = await Project.find().populate("createdBy assignedTeam tasks.assignedTo tasks.completedBy");
  return new Response(JSON.stringify(projects), { status: 200 });
}
