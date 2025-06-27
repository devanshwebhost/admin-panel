import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { token } = await req.json();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { emailVerified: true }
    );

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    return Response.json({ message: "Email verified successfully!" });
  } catch (err) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}
