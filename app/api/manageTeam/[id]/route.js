import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import { getTeamTaskStats } from "@/utils/getTeamTaskStats";

export async function PUT(req, context) {
  try {
    const { id } = context.params;
    const { removeMemberId, name, addMemberId } = await req.json();

    await connectDB();

    const team = await Team.findById(id);
    if (!team) {
      return new Response("Team not found", { status: 404 });
    }

    // ✅ Update Team Name
    if (name) {
      team.name = name;

      // Update teamName for all current members
      await User.updateMany(
        { _id: { $in: team.members } },
        { teamName: name }
      );
    }

    // ✅ Remove Member
    if (removeMemberId) {
      team.members = team.members.filter(
        (memberId) => memberId.toString() !== removeMemberId
      );

      await User.findByIdAndUpdate(removeMemberId, {
        $unset: { team: "", teamName: "" },
      });
    }

    // ✅ Add Member
    if (addMemberId && !team.members.includes(addMemberId)) {
      team.members.push(addMemberId);

      await User.findByIdAndUpdate(addMemberId, {
        team: team._id,
        teamName: team.name,
      });
    }

    await team.save();

    // ✅ Get updated team task stats
    const stats = await getTeamTaskStats(team._id);

    console.log(stats.total);
console.log(stats.completed);
console.log(stats.pending);
console.log(stats.delayed);

    return new Response(
      JSON.stringify({ team, stats }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating team:", error);
    return new Response("Server Error", { status: 500 });
  }
}
