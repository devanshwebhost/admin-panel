// app/api/migrate-users/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // 💡 updateMany purane data ko touch nahi karta, sirf naye fields add karega
    // Hum condition laga rahe hain ki jisme 'status' field nahi hai, sirf unko update karo
    const result = await User.updateMany(
      { status: { $exists: false } }, 
      {
        $set: {
          profileImage: "",
          designation: "Employee",
          department: "General",
          status: "active",
          emergencyContact: { name: "", relation: "", phone: "" },
          socialLinks: { linkedin: "", github: "", portfolio: "" },
          leaveBalance: 12,
          notifications: []
        }
      }
    );

    return NextResponse.json({ 
      message: "Database Migration Successful! Sabhi purane users update ho gaye hain.",
      usersUpdated: result.modifiedCount 
    });

  } catch (error) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}