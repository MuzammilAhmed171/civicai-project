const Logo = ({ size = 'md', light = false }) => {
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Official Pakistani Municipal Crest Emblem SVG */}
      <div className={`${dims} bg-[#064e3b] text-white p-1.5 flex items-center justify-center border-2 border-emerald-400 shadow-sm shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white">
          {/* Shield Outline */}
          <path d="M50 5 L90 20 V55 C90 75 50 95 50 95 C50 95 10 75 10 55 V20 Z" fill="#006600" stroke="#ffffff" strokeWidth="4" />
          {/* Crescent & Star */}
          <path d="M52 28 C40 28 30 38 30 50 C30 62 40 72 52 72 C44 72 36 64 36 50 C36 36 44 28 52 28 Z" fill="#ffffff" />
          <polygon points="62,35 65,42 72,42 66,47 68,54 62,49 56,54 58,47 52,42 59,42" fill="#ffffff" />
        </svg>
      </div>

      <div className="flex flex-col justify-center">
        <div className={`font-black tracking-wider uppercase text-base sm:text-lg ${light ? 'text-white' : 'text-slate-900'} leading-none`}>
          CIVIC<span className="text-emerald-600 font-bold">PAK</span>
        </div>
        <div className={`text-[10px] tracking-widest uppercase font-semibold ${light ? 'text-emerald-200' : 'text-emerald-700'} mt-1`}>
          Govt. Grievance Portal
        </div>
      </div>
    </div>
  );
};

export default Logo;
