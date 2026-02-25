
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#052e16]"> {/* Very Dark Forest Green */}
      <header className="bg-[#14532d] text-white shadow-2xl sticky top-0 z-50 border-b-2 border-green-800">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="bg-white p-1 rounded-full shadow-inner ring-2 ring-green-400 overflow-hidden">
               <img 
                 src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDRxOWVlbDJkbmx6bmxsM203Z3g3bXBobGJsbDQyMDJ1M2h5MzZqcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/n7frjzkahqcqyik0o3/giphy.gif" 
                 alt="OGM Logo" 
                 className="w-12 h-12 rounded-full object-cover" 
               />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter leading-none">OGM HAVACILIK</h1>
              <span className="text-[10px] text-green-400 font-black uppercase tracking-[0.3em] block mt-1">Hava Aracı Durum & Faaliyet Takip</span>
            </div>
          </div>
          <div className="bg-[#052e16]/80 px-5 py-2.5 rounded-2xl border border-green-700/50 shadow-inner backdrop-blur-sm">
             <span className="text-xs font-black text-green-300 uppercase tracking-widest">
                {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
             </span>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-6 py-10 max-w-[1600px]">
        {children}
      </main>
      <footer className="bg-[#14532d] text-green-200/40 py-8 border-t border-green-900 shadow-inner">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="text-xs font-black uppercase tracking-[0.4em] mb-2">T.C. TARIM VE ORMAN BAKANLIĞI</div>
          <div className="text-[10px] font-bold">ORMAN GENEL MÜDÜRLÜĞÜ - HAVACILIK DAİRESİ BAŞKANLIĞI &copy; {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
