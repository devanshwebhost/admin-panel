import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import { Types } from "mongoose";

export async function DELETE(request, { params }) {
  await connectDB();

  const id = params?.id;

  if (!Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ message: "Invalid team ID" }), {
      status: 400,
    });
  }

  try {
    // Step 1: Find the team first
    const team = await Team.findById(id);
    if (!team) {
      return new Response(JSON.stringify({ message: "Team not found" }), {
        status: 404,
      });
    }

    // Step 2: Remove the team reference from all users who are part of the team
    await User.updateMany(
      { team: team._id },
      { $unset: { team: "", teamName: "" } } // or use $set: { team: null, teamName: null }
    );

    // Step 3: Delete the team
    await Team.findByIdAndDelete(id);

    return new Response(JSON.stringify({ message: "Team and user references deleted successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
