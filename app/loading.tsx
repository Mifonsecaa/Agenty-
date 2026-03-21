export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        
        {/* Brand Animation */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
          <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
        </div>

        {/* Text Animation */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white tracking-tight animate-pulse">
            brainia<span className="text-white/40">.ai</span>
          </h2>
          <p className="text-xs text-emerald-400 font-mono mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            INITIALIZING SYSTEM
          </p>
        </div>

      </div>
    </div>
  );
}

