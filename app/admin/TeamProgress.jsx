export default function TeamProgress() {
  return (
    <div className="bg-white min-h-screen p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-[#902ba9] text-center mb-6">📈 Team Progress</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sample Progress Cards */}
        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-lg font-semibold text-indigo-600">Alpha Team</h2>
          <p className="text-sm text-gray-600 mt-1">3 projects in progress</p>
          <div className="mt-4 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-indigo-500 rounded w-[65%]"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">65% completed</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-lg font-semibold text-green-600">Beta Team</h2>
          <p className="text-sm text-gray-600 mt-1">1 project remaining</p>
          <div className="mt-4 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-green-500 rounded w-[90%]"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">90% completed</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-lg font-semibold text-red-500">Gamma Team</h2>
          <p className="text-sm text-gray-600 mt-1">Delayed: 2 tasks pending</p>
          <div className="mt-4 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-red-400 rounded w-[40%]"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">40% completed</p>
        </div>
      </div>
    </div>
  );
}
