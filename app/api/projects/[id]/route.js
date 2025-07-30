import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET(_, { params }) {
  await connectDB();
  const project = await Project.findById(params.id).populate("createdBy assignedTeam tasks.assignedTo tasks.completedBy");
  return new Response(JSON.stringify(project), { status: 200 });
}

export async function PATCH(request, { params }) {
  await connectDB();
  const body = await request.json();

  const updated = await Project.findByIdAndUpdate(params.id, body, {
    new: true,
  });

  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(_, { params }) {
  await connectDB();
  await Project.findByIdAndDelete(params.id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
