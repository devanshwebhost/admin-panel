import { connectDB } from './lib/mongodb.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Please define MONGODB_URI in .env.local');

async function updateUsers() {
  await connectDB();

  const result = await User.updateMany({}, {
    $set: {
      team: null,
      teamName: null
    }
  });

  console.log(`✅ Updated ${result.modifiedCount} users`);
  process.exit();
}

updateUsers();
