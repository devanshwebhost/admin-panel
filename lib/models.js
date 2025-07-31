// lib/models.js
import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userInfo: {
    name: String,
    email: String,
    address: String,
    phone: String,
  },
  messages: [{ role: String, content: String }],
});

const settingSchema = new mongoose.Schema({
  role: String,
  services: String,
});

export const Memory = mongoose.models.Memory || mongoose.model("Memory", memorySchema);
export const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
