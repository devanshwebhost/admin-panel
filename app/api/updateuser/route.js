// /app/api/user/update/route.js or /pages/api/user/update.js

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req) {
  const body = await req.json();
  const { email, field, value } = body;

  if (!email || !field) {
    return new Response(JSON.stringify({ error: "Missing data" }), { status: 400 });
  }

  try {
    await connectDB();
    const update = { [field]: value, updatedAt: new Date() };
    await User.updateOne({ email }, { $set: update });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
  }
}
