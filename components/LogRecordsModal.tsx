import React, { useState, useMemo, useEffect } from 'react';
import { Aircraft, OPLItem } from '../types';
import { fetchOPLData } from '../services/sheetService';

interface LogRecordsModalProps {
  aircraft: Aircraft;
  onClose: () => void;
}

const LogRecordsModal: React.FC<LogRecordsModalProps> = ({ aircraft, onClose }) => {
  const [view, setView] = useState<'menu' | 'opl' | 'maintenance'>('menu');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oplData, setOplData] = useState<OPLItem[]>([]);
  const [dynamicHeaders, setDynamicHeaders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const hasOPLSupport = aircraft.tip !== 'Bell-429' && aircraft.tip !== 'T-70' && aircraft.tip !== 'B-360' && aircraft.tip !== 'C-650';

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRDij5IctLSM5u-xILc4fYk_KA_bM6GB41EB5OZw0moWGcUKeFu2P_y_SOk4VSNE7g0g/exec";
  const OPL_SHEET_ID = "1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4";

  const MAINTENANCE_URLS: Record<string, string> = {
    'AT-802': 'https://docs.google.com/spreadsheets/d/1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4/edit?hl=tr&gid=1682612983',
    'Bell-429': 'https://docs.google.com/spreadsheets/d/1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ/edit?gid=84538314',
    'T-70': 'https://docs.google.com/spreadsheets/d/10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw/edit?hl=tr&gid=1432056659#gid=1432056659',
    'B-360': 'https://docs.google.com/spreadsheets/d/1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0/edit?gid=1887341953#gid=1887341953',
    'C-650': 'https://docs.google.com/spreadsheets/d/1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE/edit?hl=tr&gid=1394131583#gid=1394131583'
  };

  const handleFetchOPL = async () => {
    if (!hasOPLSupport) return;
    setLoading(true);
    setErrorMsg(null);
    setView('opl');
    try {
      const kuyruk = aircraft ? aircraft.kuyrukNo : "";
      const data = await fetchOPLData(SCRIPT_URL, OPL_SHEET_ID, kuyruk);
      
      if (data && data.length > 0) {
        const cleanKuyruk = kuyruk.replace(/[-\s]/g, "").toUpperCase();
        
        // FRONTEND STRICT FILTER: Sadece tam eşleşenleri veya tam ID eşleşenleri al
        const isolatedData = data.filter(row => {
          const keys = Object.keys(row);
          // Kolon 1 ve 2 genellikle kuyruk no/id kolonlarıdır
          const ownerB = String(row[keys[1]] || "").replace(/[-\s]/g, "").toUpperCase();
          const ownerC = String(row[keys[2]] || "").replace(/[-\s]/g, "").toUpperCase();
          
          // includes() yerine tam eşleşme kontrolü (Sızıntıları önler)
          return (ownerB === cleanKuyruk || ownerC === cleanKuyruk);
        });

        setOplData(isolatedData);
        if (isolatedData.length > 0) {
          const keys = Object.keys(isolatedData[0]);
          setDynamicHeaders(keys.filter(k => k !== 'IS_MERGED_RECORD'));
        }
      } else {
        setOplData([]);
      }
    } catch (err: any) {
      setErrorMsg("Veritabanı bağlantı hatası.");
      setOplData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!oplData || oplData.length === 0) return [];
    const term = searchTerm.toLocaleLowerCase('tr-TR').trim();
    if (!term) return oplData;
    return oplData.filter((item) => {
      return Object.entries(item).some(([key, val]) => {
        if (key === 'IS_MERGED_RECORD') return false;
        return String(val || "").toLocaleLowerCase('tr-TR').includes(term);
      });
    });
  }, [oplData, searchTerm]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-6">
      <div className="bg-white w-full max-w-[98%] h-[95vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-emerald-900/20">
        
        {/* Header */}
        <div className="bg-[#14532d] text-white p-5 flex justify-between items-center shrink-0 border-b-4 border-emerald-900/50">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
               <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">{aircraft.kuyrukNo} ÖPL KAYITLARI</h2>
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">TAM İZOLASYON: BAŞKA UÇAK VERİSİ GÖSTERİLMEZ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all group">
            <svg className="w-8 h-8 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-hidden flex flex-col bg-gray-50">
          {view === 'menu' ? (
            <div className={`flex-grow flex items-center justify-center p-10 ${hasOPLSupport ? 'gap-10' : ''}`}>
               {hasOPLSupport && (
                 <button onClick={handleFetchOPL} className="bg-white w-96 p-12 rounded-[3.5rem] border-2 border-emerald-100 shadow-xl hover:shadow-2xl hover:border-emerald-500 transition-all flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2">
                    <div className="bg-emerald-50 p-6 rounded-[2rem] text-emerald-700"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth={2}/></svg></div>
                    <div><h3 className="text-2xl font-black text-emerald-950 uppercase mb-2">ÖMÜRLÜ PARÇA LİSTESİ</h3><p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">KESİN FİLTRELEME AKTİF</p></div>
                 </button>
               )}
               <button onClick={() => setView('maintenance')} className="bg-white w-96 p-12 rounded-[3.5rem] border-2 border-blue-100 shadow-xl hover:shadow-2xl hover:border-blue-500 transition-all flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2">
                  <div className="bg-blue-50 p-6 rounded-[2rem] text-blue-700"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 2v-6m-8-4h5h.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" strokeWidth={2}/></svg></div>
                  <div><h3 className="text-2xl font-black text-blue-950 uppercase mb-2">BAKIM TAKİP</h3><p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">CANLI EXCEL BAĞLANTISI</p></div>
               </button>
            </div>
          ) : view === 'maintenance' ? (
             <div className="flex-grow flex flex-col animate-in fade-in duration-300">
               <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center"><button onClick={() => setView('menu')} className="bg-gray-100 px-6 py-2 rounded-xl text-[10px] font-black uppercase">MENÜYE DÖN</button></div>
               <iframe src={MAINTENANCE_URLS[aircraft.tip || 'AT-802']} className="flex-grow w-full border-0"></iframe>
             </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
               <div className="p-6 bg-white border-b flex justify-between items-center">
                 <button onClick={() => setView('menu')} className="bg-gray-100 px-6 py-2 rounded-xl text-[10px] font-black uppercase">GERİ DÖN</button>
                 <div className="flex items-center space-x-3">
                   <span className="text-[10px] font-black text-emerald-700 uppercase">TABLO İÇİ ARAMA:</span>
                   <input type="text" placeholder="Kelime bazlı süz..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-80 px-4 py-2 bg-gray-50 border rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all shadow-sm" />
                 </div>
               </div>
               <div className="flex-grow p-4 overflow-hidden">
                  <div className="bg-white rounded-3xl shadow-xl border overflow-hidden flex flex-col h-full">
                    {loading ? (
                      <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black text-emerald-900 uppercase">HÜCRE BİRLEŞTİRMELERİ ÇÖZÜLÜYOR...</span>
                      </div>
                    ) : (
                      <div className="overflow-auto custom-scrollbar flex-grow bg-white">
                         <table className="w-full text-left border-collapse min-w-[3000px] table-fixed">
                           <thead className="sticky top-0 z-20">
                             <tr className="bg-[#ddeaf6]">
                               <th className="px-3 py-4 border border-black text-[9px] font-black uppercase text-center w-28 bg-gray-100">KAYIT DURUMU</th>
                               {dynamicHeaders.map((h, i) => (
                                 <th key={i} className="px-3 py-4 border border-black text-[9px] font-black uppercase text-center align-middle h-16 bg-[#ddeaf6]">{h}</th>
                               ))}
                             </tr>
                           </thead>
                           <tbody>
                             {filteredData.map((row, rIdx) => (
                               <tr key={rIdx} className="hover:bg-blue-50/50 transition-colors h-10">
                                 <td className="px-3 py-1.5 border border-black text-[9px] font-black text-center text-orange-600 bg-orange-50/20 uppercase italic">
                                   {row['IS_MERGED_RECORD'] || ''}
                                 </td>
                                 {dynamicHeaders.map((header, cIdx) => (
                                   <td key={cIdx} className="px-3 py-1.5 border border-black text-[11px] font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                                     {String(row[header] || '-')}
                                   </td>
                                 ))}
                               </tr>
                             ))}
                           </tbody>
                         </table>
                         {filteredData.length === 0 && <div className="p-20 text-center text-gray-400 font-black uppercase italic">BU UÇAĞA AİT KAYIT BULUNAMADI VEYA DİĞER UÇAKLAR ELENDİ</div>}
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogRecordsModal;