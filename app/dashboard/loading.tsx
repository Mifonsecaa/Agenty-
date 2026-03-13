export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-emerald-500/10 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 bg-white/10 rounded-xl" />
              <div className="h-6 w-12 bg-emerald-500/10 rounded-full" />
            </div>
            <div className="h-8 w-24 bg-white/10 rounded-lg mb-2" />
            <div className="h-4 w-32 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton (Chart + Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-2xl animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-40 bg-white/10 rounded-lg" />
            <div className="h-8 w-24 bg-white/5 rounded-lg" />
          </div>
          <div className="h-[300px] w-full bg-gradient-to-t from-white/5 to-transparent rounded-xl" />
        </div>

        {/* Activity Skeleton */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl animate-pulse">
          <div className="h-6 w-32 bg-white/10 rounded-lg mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-white/10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

