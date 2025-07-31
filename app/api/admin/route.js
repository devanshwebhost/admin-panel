import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Setting } from "@/lib/models";

// ✅ POST - Create or Update Full Info
export async function POST(req) {
  await connectDB();
  const { role, services } = await req.json();

  const existing = await Setting.findOne();
  if (existing) {
    existing.role = role;
    existing.services = services;
    await existing.save();
    return NextResponse.json({ message: "Updated" });
  }

  await Setting.create({ role, services });
  return NextResponse.json({ message: "Saved" });
}

// ✅ GET - Fetch Saved Info
export async function GET() {
  await connectDB();
  const setting = await Setting.findOne();

  if (!setting) {
    return NextResponse.json({ message: "No settings found" }, { status: 404 });
  }

  return NextResponse.json(setting);
}

// ✅ PATCH - Partial Update
export async function PATCH(req) {
  await connectDB();
  const body = await req.json();

  const existing = await Setting.findOne();
  if (!existing) {
    return NextResponse.json({ message: "Settings not found" }, { status: 404 });
  }

  // Only update fields that are provided
  if (body.role) existing.role = body.role;
  if (body.services) existing.services = body.services;

  await existing.save();
  return NextResponse.json({ message: "Partially Updated" });
}
