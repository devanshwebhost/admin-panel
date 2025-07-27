

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import GroqChat from "@/components/GroqChat";
import SignOutButton from "@/components/SignOut";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import DashboardPage from "@/components/DashboardClient";

export default async function DashboardMain() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-md p-6 rounded-xl text-center max-w-sm w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-4">You must be logged in to view this page.</p>
          <a href="/login" className="text-blue-600 hover:underline text-sm">Go to Login</a>
        </div>
      </div>
    );
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-md p-6 rounded-xl text-center max-w-sm w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">Please contact support or try logging in again.</p>
        </div>
      </div>
    );
  }

  const cleanUser = {
    _id: user._id?.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "Not provided",
    address: user.address || "Not provided",
    emailVerified: user.emailVerified,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString()
  };

  return (
    <>
      <DashboardPage user={cleanUser}/>
    </>
  );
}

