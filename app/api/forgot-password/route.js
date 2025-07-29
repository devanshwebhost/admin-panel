// /app/api/forgot-password/route.js (for App Router)
// or /pages/api/forgot-password.js (for Pages Router — let me know if you're using this)

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server"; // ✅ Use NextResponse (App Router only)
// import { Link } from "lucide-react";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
  return NextResponse.json(
    {
      error: "User not found. Please sign up first. Redirecting to signup...",
      redirect: "/signup", // 👈 Include redirect URL
    },
    { status: 404 }
  );
}


    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiry on the user model
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🔐${otp} Is Your OTP to Reset Password`,
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto;">
    <h2 style="color: #902ba9; text-align: center;">🔐 Password Reset OTP</h2>

    <p style="font-size: 16px; color: #333; text-align: center;">
      You requested to reset your password. Use the OTP below to proceed:
    </p>

    <div style="background-color: #fff; padding: 20px; border-radius: 10px; margin: 20px auto; width: fit-content; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h1 style="font-size: 32px; color: #902ba9; margin: 0; text-align: center; letter-spacing: 4px;">${otp}</h1>
    </div>

    <p style="font-size: 14px; color: #666; text-align: center;">
      This OTP is valid for <strong>10 minutes</strong>.
    </p>

    <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
      If you did not request this, please ignore this email or contact our support team.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

    <p style="font-size: 12px; color: #aaa; text-align: center;">
      © ${new Date().getFullYear()} Indocs Media. All rights reserved.
    </p>
  </div>
`
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
