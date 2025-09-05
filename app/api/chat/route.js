// app/api/chat/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Memory, Setting } from "@/lib/models";

export async function POST(req) {
  const { userMessage, userId, userInfo } = await req.json();
  await connectDB();

  const settings = await Setting.findOne() || {
    role: "You are a helpful assistant.",
    services: "General assistance",
  };

  let memory = await Memory.findOne({ userId });
  if (!memory) {
    memory = await Memory.create({
      userId,
      userInfo,
      messages: [],
    });
  }

  const messages = [
    {
      role: "system",
      content: `${settings.role}. Services: ${settings.services}. This is the user: Name: ${userInfo.name}, Email: ${userInfo.email}, Address: ${userInfo.address}, Phone: ${userInfo.phone}`,
    },
    ...memory.messages.map(({ role, content }) => ({ role, content })),
    { role: "user", content: userMessage },
  ];

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages,
    }),
  });

  const data = await groqRes.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    return NextResponse.json({ error: "AI response failed." }, { status: 500 });
  }

  const aiReply = data.choices[0].message.content;

  memory.messages.push({ role: "user", content: userMessage });
  memory.messages.push({ role: "assistant", content: aiReply });
  await memory.save();

  return NextResponse.json({ reply: aiReply });
}


