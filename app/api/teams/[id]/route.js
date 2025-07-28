import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { Types } from "mongoose";

// GET /api/teams/:id
export async function GET(_, { params }) {
  await connectDB();
  const { id } = params;

  if (!Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
    });
  }

  const team = await Team.findById(id).populate("members");
  if (!team) {
    return new Response(JSON.stringify({ message: "Team not found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ team }), { status: 200 });
}

// PATCH /api/teams/:id
export async function PATCH(req, { params }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  if (!Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
    });
  }

  const updatedTeam = await Team.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!updatedTeam) {
    return new Response(JSON.stringify({ message: "Team not found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ team: updatedTeam }), {
    status: 200,
  });
}

// DELETE /api/teams/:id
export async function DELETE(_, { params }) {
  await connectDB();
  const { id } = params;

  if (!Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
    });
  }

  const deleted = await Team.findByIdAndDelete(id);
  if (!deleted) {
    return new Response(JSON.stringify({ message: "Team not found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ message: "Team deleted" }), {
    status: 200,
  });
}
