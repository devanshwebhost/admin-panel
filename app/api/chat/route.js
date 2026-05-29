// app/api/chat/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Memory, Setting } from "@/lib/models";

export async function POST(req) {
  const { userMessage, userId, userInfo, userContext } = await req.json();
  await connectDB();

  // Use the rich userContext provided by the frontend if available.
  // This contains real-time data like Todos and Tasks specific to this user.
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

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", // Use a more capable model on Groq
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
