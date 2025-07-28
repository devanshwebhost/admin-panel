import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";

// GET /api/teams
export async function GET() {
  try {
    await connectDB();

    const teams = await Team.find()
      .populate("members")
      .populate({ path: "createdBy", strictPopulate: false });

    return new Response(JSON.stringify({ teams }), { status: 200 });
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch teams" }), { status: 500 });
  }
}

// POST /api/teams
export async function POST(req) {
  try {
    await connectDB();
    const { name, members = [], createdBy } = await req.json();

    if (!name || !createdBy) {
      return new Response(JSON.stringify({ message: "Team name and creator are required" }), { status: 400 });
    }

    // Ensure creator is in the members list
    const uniqueMembers = Array.from(new Set([...members, createdBy]));

    // ✅ Check for users already in a team
// Correct check for users already assigned to a team
const usersAlreadyInTeam = await User.find({
  _id: { $in: uniqueMembers },
  team: { $exists: true, $ne: null },
}).select("firstName email _id team");



    if (usersAlreadyInTeam.length > 0) {
      const names = usersAlreadyInTeam.map((u) => `${u.firstName} (${u.email})`).join(", ");
      return new Response(
        JSON.stringify({
          message: `These users are already in a team: ${names}`,
          conflictUsers: usersAlreadyInTeam,
        }),
        { status: 409 }
      );
    }

    // ✅ Create the team
    const team = await Team.create({
      name,
      members: uniqueMembers,
      createdBy,
    });

    // ✅ Update all users in this team
    await User.updateMany(
      { _id: { $in: uniqueMembers } },
      { $set: { team: team._id, teamName: name } }
    );

    const populatedTeam = await Team.findById(team._id)
      .populate("members")
      .populate("createdBy");

    return new Response(JSON.stringify({ team: populatedTeam }), { status: 201 });
  } catch (err) {
    console.error("POST /api/teams error:", err);
    return new Response(JSON.stringify({ message: "Failed to create team" }), { status: 500 });
  }
}

