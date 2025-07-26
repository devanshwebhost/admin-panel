import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, address, agree } = body;

    if (!email || !password || !firstName || !agree) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
      emailVerified: false,
    });

    const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify your email 🧐 ",
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto;">
    <h2 style="color: #902ba9; text-align: center;">🔐 Email Verification</h2>
    <p style="font-size: 16px; color: #333;">
      Hi there,
    </p>
    <p style="font-size: 16px; color: #333;">
      Please click the button below to verify your email and continue with your password reset:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="background-color: #902ba9; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
        Verify Email ⚡
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      This link will expire in 10 minutes. If you didn’t request this, you can safely ignore it.
    </p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="font-size: 12px; color: #aaa; text-align: center;">
      © ${new Date().getFullYear()} Indocs Media. All rights reserved.
    </p>
  </div>
`
    });

    return Response.json({ message: "Signup successful, verify your email" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
