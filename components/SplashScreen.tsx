
import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 2500);
    const completeTimer = setTimeout(onComplete, 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#052e16] transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-green-400/20 animate-ping"></div>
        <div className="bg-white p-4 rounded-full shadow-[0_0_50px_rgba(34,197,94,0.3)] ring-4 ring-green-500/30 relative">
          <img 
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDRxOWVlbDJkbmx6bmxsM203Z3g3bXBobGJsbDQyMDJ1M2h5MzZqcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/n7frjzkahqcqyik0o3/giphy.gif" 
            alt="OGM Logo" 
            className="w-40 h-40 rounded-full object-cover"
          />
        </div>
      </div>
      <div className="mt-8 text-center">
        <h1 className="text-white text-3xl font-black tracking-widest mb-2 animate-pulse">OGM HAVACILIK</h1>
        <p className="text-green-400 text-xs font-bold uppercase tracking-[0.5em]">Sistem Yükleniyor...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
