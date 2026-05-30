// app/api/chat/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Memory, Setting } from "@/lib/models";
import User from "@/models/User"; // 💡 User model import kiya
import nodemailer from "nodemailer";

// 💡 NEW FUNCTION: Dynamic Admin Notifier
async function notifyAdmins(errorReason) {
  try {
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASS) {
      console.warn("⚠️ Email notifier skipped because ADMIN_EMAIL or EMAIL_APP_PASSWORD is missing.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASS,
      },
    });

    await connectDB();
    
    // 1. Database se saare Admins dhundo
    const admins = await User.find({ isAdmin: true });
    if (admins.length === 0) return;

    // 2. Unki emails ka ek array banao
    const adminEmails = admins.map(admin => admin.email).filter(Boolean);

    // 3. Sabhi admins ko ek sath mass-email bhejo
    if (adminEmails.length > 0) {
      try {
        await transporter.verify();
        console.log(`✉️ Email bhejne ki koshish chal rahi hai in par: ${adminEmails}`);
        let info = await transporter.sendMail({
          from: process.env.ADMIN_EMAIL,
          to: adminEmails.join(", "),
          subject: "🚨 Pascel AI Alert - API Fail Ho Gayi Hai",
          text: `Pascel AI Alert,\n\nGroq API fail ho gayi hai. \n\nReason: ${errorReason}\n\nKripya turant server check karein.`
        });
        console.log("✅ Nodemailer Success:", info.response);
      } catch (emailErr) {
        console.error("❌ Nodemailer email failed:", emailErr);
      }
    } else {
      console.log("⚠️ Email skip ho gaya. Ya toh DB me Admin nahi hai, ya email list empty hai.");
    }

    // 4. In-App Notifications - Har admin ke database array me alert push karo
    await User.updateMany(
      { isAdmin: true },
      { 
        $push: { 
          notifications: { 
            title: "Pascel AI Down 🚨",
            message: `Groq API me problem aayi hai: ${errorReason}`,
            isRead: false,
            createdAt: new Date()
          } 
        } 
      }
    );
    
    console.log("Admins ko Email aur In-App Notification bhej di gayi hai!");
  } catch (err) {
    console.error("Admins ko notify karne me error:", err);
  }
}

export async function POST(req) {
  const { userMessage, userId, userInfo, userContext } = await req.json();
  await connectDB();

  let systemPrompt = userContext;

  if (!systemPrompt) {
    const settings = (await Setting.findOne()) || {
      role: "You are a helpful assistant.",
      services: "General assistance",
    };
    systemPrompt = `${settings.role}. Services: ${settings.services}. User: ${userInfo?.name || "User"}. 
    Please use Markdown formatting for lists, tables, and bold text to make your responses easy to read.`;
  }

  let memory = await Memory.findOne({ userId });
  if (!memory) {
    memory = await Memory.create({
      userId,
      userInfo: userInfo || {},
      messages: [],
    });
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...memory.messages.map(({ role, content }) => ({ role, content })),
    { role: "user", content: userMessage },
  ];

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      throw new Error(`API Response Status: ${groqRes.status} - ${errorText}`);
    }

    const data = await groqRes.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("AI response format invalid or empty.");
    }

    const aiReply = data.choices[0].message.content;

    memory.messages.push({ role: "user", content: userMessage });
    memory.messages.push({ role: "assistant", content: aiReply });
    await memory.save();

    return NextResponse.json({ reply: aiReply, status: "success" });

  } catch (error) {
    console.error("Pascel AI Error:", error.message);
    
    // 💡 Backend fail hone par automatically Admins ko database se dhoond kar notify karega
    await notifyAdmins(error.message);

    return NextResponse.json({ 
      reply: "Maaf kijiyega, mere AI server me abhi kuch technical samasya aa rahi hai. Maine admin team ko turant error report bhej di hai.",
      status: "error",
      isApiDown: true
    });
  }
}