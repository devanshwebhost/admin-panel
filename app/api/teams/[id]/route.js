import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team"; // your Mongoose team model
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
    const deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) {
      return new Response(JSON.stringify({ message: "Team not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "Team deleted successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
