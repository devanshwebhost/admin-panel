import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET() {
  await connectDB();
  const teams = await Team.find().populate("members");
  return new Response(JSON.stringify({ teams }), { status: 200 });
}

export async function POST(req) {
  await connectDB();
  const { name, members = [] } = await req.json();

  if (!name) {
    return new Response(JSON.stringify({ message: "Team name required" }), { status: 400 });
  }

  try {
    const team = await Team.create({ name, members });
    const populatedTeam = await Team.findById(team._id).populate("members");
    return new Response(JSON.stringify({ team: populatedTeam }), { status: 201 });
  } catch (err) {
    console.error("Team creation error:", err);
    return new Response(JSON.stringify({ message: "Failed to create team" }), { status: 500 });
  }
}
