import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { email, password } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return Response.json({ message: "Password updated" });
}
