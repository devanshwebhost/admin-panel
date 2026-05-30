// app/api/test-notify/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  // 1. Check ENV Status
  const envEmail = process.env.ADMIN_EMAIL;
  const envPass = process.env.EMAIL_APP_PASSWORD;

  // 2. Check Admins in DB
  const admins = await User.find({ isAdmin: true });
  
  // 3. Admin ka data check karo (Bina password ke)
  const adminData = admins.map(a => ({
      name: a.firstName,
      email: a.email,
      isAdmin: a.isAdmin,
      notificationCount: a.notifications?.length || 0 // 💡 Ye batayega ki DB me notification save hui ya nahi
  }));

  // 4. Force Push ek dummy notification taaki DB me test ho jaye
  await User.updateMany(
    { isAdmin: true },
    { $push: { notifications: { title: "X-Ray Test", message: "Testing Push", isRead: false, createdAt: new Date() } } }
  );

  return NextResponse.json({
    "1_ENV_EMAIL_STATUS": envEmail ? `✅ MIL GAYI: ${envEmail}` : "❌ MISSING! Check .env file and restart server",
    "2_ENV_PASSWORD_STATUS": envPass ? "✅ MIL GAYA" : "❌ MISSING!",
    "3_ADMINS_FOUND_IN_DB": admins.length,
    "4_ADMIN_DETAILS": adminData,
  });
}