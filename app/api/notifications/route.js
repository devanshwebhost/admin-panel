// app/api/notifications/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await User.findOne({ email }).select("notifications");
    return NextResponse.json(user?.notifications || []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { email, notifId } = await req.json(); // 💡 Naya parameter: notifId

    if (notifId) {
      // 💡 Agar kisi ek message par click kiya hai, toh sirf uski ID ko read mark karo
      await User.updateOne(
        { email: email, "notifications._id": notifId },
        { $set: { "notifications.$.isRead": true } }
      );
      return NextResponse.json({ message: "Single notification marked as read" });
    } else {
      // Purana bulk mark all as read logic
      await User.updateOne(
        { email: email, "notifications.isRead": false },
        { $set: { "notifications.$[].isRead": true } }
      );
      return NextResponse.json({ message: "All notifications marked as read" });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}