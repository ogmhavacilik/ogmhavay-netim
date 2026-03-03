
import React from 'react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onViewDashboard: () => void;
  onViewUpdate: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onViewDashboard, onViewUpdate }) => {
  return (
    <div className="min-h-screen bg-[#021a0c] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-16"
      >
        <img 
          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDRxOWVlbDJkbmx6bmxsM203Z3g3bXBobGJsbDQyMDJ1M2h5MzZqcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/n7frjzkahqcqyik0o3/giphy.gif" 
          alt="Logo GIF" 
          className="w-40 h-40 mx-auto mb-8 rounded-full object-cover shadow-[0_0_30px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500/30"
        />
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase mb-4">
          HAVA ARAÇLARI <br /> <span className="text-emerald-500">YÖNETİM SİSTEMİ</span>
        </h1>
        <p className="text-emerald-500/60 font-black text-xs uppercase tracking-[0.8em]">Orman Genel Müdürlüğü - Havacılık Dairesi</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl z-10">
        <motion.button
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewDashboard}
          className="group relative bg-white/5 border-2 border-emerald-500/20 hover:border-emerald-500 p-12 rounded-[3rem] transition-all overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
          <div className="relative flex flex-col items-center text-center space-y-6">
            <div className="bg-emerald-500/10 p-6 rounded-[2rem] text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white uppercase mb-2">HAVA ARACI GÜNLÜK DURUMLARI VE FAALİYET ÇİZELGESİ</h3>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Envanter ve Operasyonel İzleme</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewUpdate}
          className="group relative bg-white/5 border-2 border-blue-500/20 hover:border-blue-500 p-12 rounded-[3rem] transition-all overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors"></div>
          <div className="relative flex flex-col items-center text-center space-y-6">
            <div className="bg-blue-500/10 p-6 rounded-[2rem] text-blue-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white uppercase mb-2">HAVA ARACI GÜNLÜK DURUM GÜNCELLE</h3>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Teknik Veri ve Durum Girişi</p>
            </div>
          </div>
        </motion.button>
      </div>

      <div className="absolute bottom-8 text-emerald-500/30 font-black text-[10px] uppercase tracking-[1em]">
        SİSTEM SÜRÜMÜ v2.5.0
      </div>
    </div>
  );
};

export default LandingPage;
