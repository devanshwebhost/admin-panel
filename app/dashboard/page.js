import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.firstName} 👋</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="text-gray-800">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Phone</label>
            <p className="text-gray-800">{user.phone || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Address</label>
            <p className="text-gray-800">{user.address || 'Not provided'}</p>
          </div>
        </div>

        <form action="/api/auth/signout" method="post" className="mt-8">
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition shadow-lg"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
