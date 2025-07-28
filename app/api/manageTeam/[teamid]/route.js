// /api/manageTeam/[id]/route.js

import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const { name, addMemberId } = await req.json();

  try {
    const team = await Team.findById(id);
    if (!team) return new Response("Team not found", { status: 404 });

    if (name) team.name = name;
    if (addMemberId && !team.members.includes(addMemberId)) {
      team.members.push(addMemberId);
    }

    await team.save();
    const updatedTeam = await Team.findById(id).populate("members");

    return new Response(JSON.stringify({ team: updatedTeam }), { status: 200 });
  } catch (err) {
    console.error("Update team error:", err);
    return new Response("Failed to update team", { status: 500 });
  }
}
