import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { Types } from "mongoose";

export async function PATCH(request, { params }) {
  await connectDB();

  const userId = params.id;

  // Validate ObjectId
  if (!Types.ObjectId.isValid(userId)) {
    return new Response(JSON.stringify({ message: "Invalid user ID" }), {
      status: 400,
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    user.adminVerified = !user.adminVerified;
    await user.save();

    return new Response(
      JSON.stringify({ message: "Login access toggled", user }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle Login Error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
