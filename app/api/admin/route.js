import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Setting } from "@/lib/models";

// ✅ POST - Create or Update Full Info
export async function POST(req) {
  await connectDB();
  const { role, services, holidays } = await req.json();

  const existing = await Setting.findOne();
  if (existing) {
    existing.role = role;
    existing.services = services;
    if (holidays) existing.holidays = holidays;
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

  let existing = await Setting.findOne();

  if (!existing) {
    // Agar settings nahi milti toh naya create kar do (Upsert behavior)
    existing = await Setting.create(body);
    return NextResponse.json({ message: "Settings Created", setting: existing });
  }

  // Only update fields that are provided
  if (body.role !== undefined) existing.role = body.role;
  if (body.services !== undefined) existing.services = body.services;
  if (body.holidays !== undefined) existing.holidays = body.holidays;

  await existing.save();
  return NextResponse.json({ message: "Partially Updated", setting: existing });
}
