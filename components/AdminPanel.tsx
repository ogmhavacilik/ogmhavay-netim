
import React, { useState } from 'react';
import { SheetConfig, Aircraft, AppNotification, DailyStatusCode } from '../types';
import { fetchAircraftDataFromAppsScript } from '../services/sheetService';

interface AdminPanelProps {
  onSave: (configs: SheetConfig[], data: Partial<Aircraft>[]) => void;
  onOverride?: (kuyrukNo: string, code: DailyStatusCode) => void;
  onClose: () => void;
  notifications: AppNotification[];
  initialData?: any[]; 
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSave, onOverride, onClose, notifications, initialData = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('notifications'); 
  const [previewData, setPreviewData] = useState<any[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCode, setEditingCode] = useState<{ kuyrukNo: string, code: string } | null>(null);

  const exportTableToExcel = (tableId: string, filename: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>${table.outerHTML}</body>
      </html>
    `;
    const url = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(html)));
    const link = document.createElement('a');
    link.download = filename + '.xls';
    link.href = url;
    link.click();
  };

  const handleCodeChange = (kuyrukNo: string, newCode: string) => {
    const validCodes: DailyStatusCode[] = ['B', 'BB', 'KM', 'A', 'PB', 'KK', 'X', 'F'];
    if (validCodes.includes(newCode as DailyStatusCode)) {
      setPreviewData(prev => prev.map(a => a.kuyrukNo === kuyrukNo ? { ...a, assignedCode: newCode } : a));
      if (onOverride) onOverride(kuyrukNo, newCode as DailyStatusCode);
    }
    setEditingCode(null);
  };

  const handleFinalSave = () => {
    onSave([], previewData);
    alert('Değişiklikler başarıyla kaydedildi!');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-[#052e16] w-full max-w-[1700px] h-[95vh] rounded-[4rem] border border-green-800/40 flex overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
        
        <div className="w-80 bg-[#021a0c] border-r border-green-900/40 p-10 flex flex-col">
          <div className="mb-14">
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase">ADMİN PANELİ</h2>
            <p className="text-green-600 text-[8px] font-black tracking-[0.6em] mt-3 italic uppercase opacity-50">Sistem Denetim Merkezi</p>
          </div>
          
          <nav className="space-y-10 flex-grow">
            <div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] block mb-6 ml-2">CANLI DENETİM</span>
              <button onClick={() => setActiveSubTab('notifications')} className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeSubTab === 'notifications' ? 'bg-emerald-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
                <span>GELEN KUTUSU</span>
                {notifications.length > 0 && <span className="bg-red-500 text-white text-[9px] w-6 h-6 rounded-full flex items-center justify-center">{notifications.length}</span>}
              </button>
            </div>
            
            <div className="pl-6 border-l-2 border-green-900/30 space-y-6">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] block mb-2 ml-2">ENTEGRASYON</span>
              <button onClick={() => setActiveSubTab('excel')} className={`w-full text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest ${activeSubTab === 'excel' ? 'text-emerald-400 bg-emerald-500/10 rounded-xl' : 'text-gray-600 hover:text-white'}`}>○ EXCEL MODÜLLERİ</button>
            </div>
          </nav>
          <button onClick={onClose} className="py-6 rounded-[2rem] border-2 border-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-950/30 transition-all">PANELİ KAPAT</button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#052e16] relative">
          {activeSubTab === 'notifications' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-10 border-b border-green-900/40 bg-black/10 flex justify-between items-center">
                   <div>
                      <h1 className="text-white text-4xl font-black uppercase tracking-tighter italic">Gelen Kutusu</h1>
                      <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-3">NOT: TURUNCU SATIRLAR CÜMLE ANALİZİ SONUCU ATANAN KODLARDIR</p>
                   </div>
                   <button onClick={() => exportTableToExcel('inbox-table', 'Gelen_Kutusu_Loglari')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={3}/></svg>
                      GELEN KUTUSU EXCEL İNDİR
                   </button>
                </div>
                
                <div className="flex-1 p-10 overflow-hidden">
                   {notifications.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-700 uppercase font-black tracking-[0.5em] italic opacity-30">Henüz bir değişiklik tespit edilmedi</div>
                   ) : (
                    <div className="bg-white/5 rounded-[2.5rem] border border-green-900/30 overflow-hidden flex flex-col shadow-2xl h-full">
                      <div className="overflow-y-auto custom-scrollbar">
                        <table id="inbox-table" className="w-full text-left border-collapse">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-emerald-700 text-white">
                              <th className="px-8 py-6 font-black text-[11px] uppercase tracking-widest border-r border-emerald-800">TARİH / SAAT</th>
                              <th className="px-8 py-6 font-black text-[11px] uppercase tracking-widest border-r border-emerald-800">KUYRUK NO</th>
                              <th className="px-8 py-6 font-black text-[11px] uppercase tracking-widest">GÜNCELLEME VE ANALİZ DETAYI (DÜZENLEMEK İÇİN ÇİFT TIKLA)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {notifications.map((n) => {
                              const isAssignment = n.kolon === 'ANALİZ / ÇİZELGE' || n.kolon === 'ATAMA KODU';
                              return (
                                <tr 
                                  key={n.id} 
                                  className={`group border-b border-white/5 transition-all ${isAssignment ? 'bg-orange-600/20 hover:bg-orange-600/30 cursor-pointer' : 'hover:bg-white/5'}`}
                                >
                                  <td className="px-8 py-6 text-emerald-400 font-black text-xs">{n.tarih}</td>
                                  <td className="px-8 py-6 text-white font-black text-lg italic tracking-tighter">
                                     {n.kuyrukNo}
                                     <div className={`text-[8px] uppercase mt-1 ${isAssignment ? 'text-orange-400 font-black' : 'text-gray-500'}`}>
                                        {isAssignment ? `● ${n.platform} ANALİZ ATAMASI` : n.platform}
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                    <div className={`p-4 rounded-2xl text-white text-sm font-medium italic border transition-all ${isAssignment ? 'bg-orange-500/10 border-orange-500/20' : 'bg-black/20 border-white/5'}`}>
                                       {n.mesaj}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                   )}
                </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-10">
                <div className="p-10 border-b border-green-900/40 flex justify-between items-center bg-black/10 rounded-t-[3rem]">
                  <div>
                    <h1 className="text-white text-3xl font-black uppercase italic">Excel Entegrasyon Modülleri</h1>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">Aktif Platformlar: Bell-429, AT-802 (Sayfa: GÜNLÜK DURUM)</p>
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={handleFinalSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3}/></svg>
                      DEĞİŞİKLİKLERİ KAYDET
                    </button>
                  </div>
                </div>
                <div className="bg-[#021a0c] p-10 flex-1 overflow-y-auto custom-scrollbar rounded-b-[3rem]">
                   <table className="w-full text-left bg-white/5 rounded-3xl overflow-hidden border-collapse">
                      <thead className="bg-emerald-800/40 text-emerald-400">
                         <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Platform</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Kuyruk</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Gövde Saati</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Faydalı Saat (MIN V:AI)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Analiz Kodu (DÜZELTMEK İÇİN ÇİFT TIKLA)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Detay Analizi</th>
                         </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                            <td className="px-8 py-4"><span className="text-[10px] font-black bg-emerald-900/50 px-2 py-1 rounded text-emerald-400">{row.tip || "BELİRSİZ"}</span></td>
                            <td className="px-8 py-4 font-bold">{row.kuyrukNo}</td>
                            <td className="px-8 py-4 text-blue-400 font-black">{row.govdeUcusSaati || '-'}</td>
                            <td className="px-8 py-4 text-emerald-400 font-black">{row.faydaliSaat}</td>
                            <td className="px-8 py-4" onDoubleClick={() => setEditingCode({ kuyrukNo: row.kuyrukNo, code: row.assignedCode })}>
                               {editingCode?.kuyrukNo === row.kuyrukNo ? (
                                 <select 
                                   autoFocus
                                   className="bg-black text-white px-2 py-1 rounded border border-emerald-500 font-black text-xs"
                                   value={editingCode.code}
                                   onChange={(e) => handleCodeChange(row.kuyrukNo, e.target.value)}
                                   onBlur={() => setEditingCode(null)}
                                 >
                                   {['B', 'BB', 'KM', 'A', 'PB', 'KK', 'X', 'F'].map(c => (
                                     <option key={c} value={c}>{c}</option>
                                   ))}
                                 </select>
                               ) : (
                                 <span className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${row.assignedCode === 'F' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                   {row.assignedCode}
                                 </span>
                               )}
                            </td>
                            <td className="px-8 py-4 italic text-gray-400">
                               <div className="text-[10px] text-emerald-500 mb-1 font-black">{row.durumAyrintisi}</div>
                               <div className="text-xs truncate max-w-xs">"{row.aciklama}"</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
