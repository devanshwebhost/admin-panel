import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(req) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }

  try {
    await connectDB();
    await User.deleteOne({ email });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
  }
}
