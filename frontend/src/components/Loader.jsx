import { Loader2, ShieldCheck, Activity } from 'lucide-react';
import Logo from './Logo';

export const GlobalLoader = ({ message = "Syncing with CivicAI Database..." }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative flex items-center justify-center mb-6">
        {/* Glowing Spinning Ring */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin glow-emerald" />
        <div className="absolute w-16 h-16 rounded-full border-4 border-emerald-400/30 border-b-emerald-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="p-3 bg-slate-900 rounded-full shadow-xl flex items-center justify-center">
          <Logo size="md" iconOnly={true} />
        </div>
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-bold text-slate-800 tracking-wide flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          {message}
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Connecting live with Pakistani Municipal Services & AI Vision Engine
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center space-x-1.5 mt-6">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
};

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 p-6 rounded-none shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 skeleton-shimmer rounded" />
            <div className="h-8 w-8 skeleton-shimmer rounded-full" />
          </div>
          <div className="h-8 w-36 skeleton-shimmer rounded" />
          <div className="h-3 w-48 skeleton-shimmer rounded" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden w-full">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="h-5 w-40 skeleton-shimmer rounded" />
        <div className="h-8 w-28 skeleton-shimmer rounded" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 skeleton-shimmer rounded" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 skeleton-shimmer rounded" />
                <div className="h-3 w-1/2 skeleton-shimmer rounded" />
              </div>
            </div>
            <div className="h-6 w-20 skeleton-shimmer rounded" />
            <div className="h-6 w-24 skeleton-shimmer rounded" />
            <div className="h-8 w-20 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-none overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="w-full md:w-48 h-48 skeleton-shimmer" />
          <div className="p-5 flex-1 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 skeleton-shimmer rounded" />
              <div className="h-4 w-16 skeleton-shimmer rounded" />
            </div>
            <div className="h-4 w-3/4 skeleton-shimmer rounded" />
            <div className="h-3 w-full skeleton-shimmer rounded" />
            <div className="h-3 w-2/3 skeleton-shimmer rounded" />
            <div className="pt-2 flex justify-between items-center">
              <div className="h-6 w-28 skeleton-shimmer rounded" />
              <div className="h-8 w-20 skeleton-shimmer rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonStackGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -bottom-3 left-3 right-3 h-full bg-slate-200 border-2 border-slate-300 -z-20" />
          <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-slate-300 border-2 border-slate-400 -z-10" />
          <div className="bg-white border-2 border-slate-300 p-4 space-y-3 relative z-10">
            <div className="bg-[#064e3b]/30 h-9 w-full skeleton-shimmer" />
            <div className="h-7 w-full skeleton-shimmer" />
            <div className="h-16 w-full skeleton-shimmer" />
            <div className="h-10 w-full skeleton-shimmer" />
            <div className="h-8 w-full skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalLoader;
