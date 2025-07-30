// /api/users/[id]/route.js
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(request, { params }) {
  await connectDB();
  const deleted = await User.findByIdAndDelete(params.id);
  return new Response(JSON.stringify({ message: "User deleted" }), { status: 200 });
}
