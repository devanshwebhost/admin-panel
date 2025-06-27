import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  const { email, otp } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return Response.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  return Response.json({ message: "OTP verified" });
}
