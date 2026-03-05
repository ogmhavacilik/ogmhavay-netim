
import React, { useState, useEffect } from 'react';
import { Aircraft, Status, OPLItem } from '../types';
import LogRecordsModal from './LogRecordsModal';
import { fetchOPLData } from '../services/sheetService';

interface AircraftDetailModalProps {
  aircraft: Aircraft;
  onClose: () => void;
  onEdit: () => void;
  onViewLogs: (openLogs: () => void) => void;
}

const AircraftDetailModal: React.FC<AircraftDetailModalProps> = ({ aircraft, onClose, onEdit, onViewLogs }) => {
  const [activePhoto, setActivePhoto] = useState(0);
  const [isLogRecordsOpen, setIsLogRecordsOpen] = useState(false);
  const [oplAlerts, setOplAlerts] = useState<string[]>([]);
  const [isLoadingOPL, setIsLoadingOPL] = useState(false);

  const isBell429 = aircraft.tip === 'Bell-429';
  const isT70 = aircraft.tip === 'T-70';
  const isB360OrC650 = aircraft.tip === 'B-360' || aircraft.tip === 'C-650';
  const isAT802 = aircraft.tip === 'AT-802';

  useEffect(() => {
    const loadOPL = async () => {
      // Eğer zaten alertler yüklüyse tekrar çekme
      if (aircraft.oplAlerts && aircraft.oplAlerts.length > 0) {
        setOplAlerts(aircraft.oplAlerts);
        return;
      }

      if (!aircraft.appsScriptUrl || !aircraft.sheetId) return;
      setIsLoadingOPL(true);
      try {
        const data = await fetchOPLData(aircraft.appsScriptUrl, aircraft.sheetId, aircraft.kuyrukNo);
        const alerts: string[] = [];
        
        const findValue = (item: any, possibleKeys: string[]) => {
          const keys = Object.keys(item);
          const normalize = (s: string) => s.replace(/[\s_]/g, '').toUpperCase();
          for (const pk of possibleKeys) {
            const normalizedPk = normalize(pk);
            const foundKey = keys.find(k => normalize(k) === normalizedPk);
            if (foundKey) return item[foundKey];
          }
          return null;
        };

        const parseHour = (val: any): number | null => {
          if (val === null || val === undefined || String(val).trim() === "" || String(val).toUpperCase() === "N/A") return null;
          const s = String(val).trim().replace(',', '.');
          if (s.includes(':')) {
            const parts = s.split(':').map(Number);
            if (parts.length >= 2) return (parts[0] || 0) + (parts[1] || 0) / 60;
          }
          const n = parseFloat(s);
          return isNaN(n) ? null : n;
        };

        const parseDay = (val: any): number | null => {
          if (val === null || val === undefined || String(val).trim() === "" || String(val).toUpperCase() === "N/A") return null;
          const n = parseInt(String(val).trim());
          return isNaN(n) ? null : n;
        };

        data.forEach(item => {
          const parcaAdi = findValue(item, ["PARÇA ADI", "PARCA ADI", "Parça Adı"]) || "Bilinmeyen Parça";
          const kalanSaatRaw = findValue(item, ["DEĞİŞİME KALAN SAAT", "DEGISIME KALAN SAAT", "Değişime Kalan Saat"]);
          const kalanGunRaw = findValue(item, ["DEĞİŞİME KALAN GÜN", "DEGISIME KALAN GUN", "Değişime Kalan Gün"]);

          const kalanSaat = parseHour(kalanSaatRaw);
          const kalanGun = parseDay(kalanGunRaw);

          if (kalanSaat !== null && kalanSaat <= 100) {
            const h = Math.floor(kalanSaat);
            const m = Math.round((kalanSaat - h) * 60);
            const timeStr = m > 0 ? `${h}:${m.toString().padStart(2, '0')}` : `${h}`;
            alerts.push(`${parcaAdi}: Değişime ${timeStr} saat kaldı!`);
          }
          if (kalanGun !== null && kalanGun <= 180) {
            alerts.push(`${parcaAdi}: Değişime ${kalanGun} gün kaldı!`);
          }
        });
        setOplAlerts(alerts);
      } catch (error) {
        console.error("OPL yükleme hatası:", error);
      } finally {
        setIsLoadingOPL(false);
      }
    };

    loadOPL();
  }, [aircraft]);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-5xl rounded-xl overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200">
          
          {/* Header - Dark Green Matching Screenshot */}
          <div className="bg-[#1b5e20] text-white p-5 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black tracking-tight">{aircraft.kuyrukNo} - {aircraft.cagriKodu}</h2>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{aircraft.platformTipi} Platform | {aircraft.konum} Base</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-y-auto max-h-[85vh]">
            {/* Left Side: Photo & Technical Info */}
            <div className="p-8 bg-gray-50/50 border-r border-gray-100 flex flex-col">
               <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-8 shadow-lg bg-gray-200">
                 <img 
                   src={aircraft.photos[activePhoto]} 
                   alt={aircraft.kuyrukNo} 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm px-3 py-1 rounded text-[9px] text-white font-bold uppercase tracking-widest">
                    {aircraft.kuyrukNo}
                 </div>
               </div>
               
               <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col flex-grow">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase mb-6 flex items-center tracking-widest">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5}/></svg>
                    TEKNİK BİLGİLER
                 </h3>
                 
                 <div className="space-y-3">
                    {!isBell429 && !isT70 && !isB360OrC650 ? (
                      <>
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-gray-400 font-bold uppercase tracking-tighter"><span className="bg-gray-100 px-1 rounded">Seri</span> No:</span>
                          <span className="font-bold text-gray-800">{aircraft.seriNo || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-gray-400 font-bold uppercase tracking-tighter">Motor:</span>
                          <span className="font-bold text-gray-800">{aircraft.motor || '-'}</span>
                        </div>
                      </>
                    ) : isBell429 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">GÖVDE S/N</div>
                            <div className="text-sm font-black text-emerald-800 uppercase tracking-tighter">{aircraft.govdeSN || '-'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">GÖVDE UÇUŞ</div>
                            <div className="text-sm font-black text-emerald-800 uppercase tracking-tighter">{aircraft.govdeUcusSaati || '-'}</div>
                          </div>
                        </div>

                        <div className="border border-emerald-50 rounded-xl overflow-hidden">
                          <div className="bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700 uppercase tracking-widest">MOTOR SİSTEMLERİ</div>
                          <div className="divide-y divide-emerald-50 bg-white">
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #1 S/N:</span>
                              <span className="text-[11px] font-black text-gray-800">{aircraft.motor1SN || '-'}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #2 S/N:</span>
                              <span className="text-[11px] font-black text-gray-800">{aircraft.motor2SN || '-'}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #1 UÇUŞ:</span>
                              <span className="text-[11px] font-black text-emerald-700">{aircraft.motor1UcusSaati || '-'}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #2 UÇUŞ:</span>
                              <span className="text-[11px] font-black text-emerald-700">{aircraft.motor2UcusSaati || '-'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-red-50 rounded-xl overflow-hidden">
                          <div className="bg-red-50 px-3 py-1.5 text-[9px] font-black text-red-700 uppercase tracking-widest">BAKIM ZAMANLARI</div>
                          <div className="p-3 space-y-3 bg-white">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">SAAT ESASLI (50S):</span>
                              <span className="text-sm font-black text-red-600 tracking-tighter">{aircraft.bakim50H || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">TAKVİM ESASLI (TARİH):</span>
                              <span className="text-sm font-black text-gray-800 tracking-tighter">{aircraft.bakimTakvim || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isT70 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">GÖVDE S/N</div>
                            <div className="text-sm font-black text-emerald-800 uppercase tracking-tighter">{aircraft.govdeSN || '-'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">GÖVDE UÇUŞ</div>
                            <div className="text-sm font-black text-emerald-800 uppercase tracking-tighter">{aircraft.govdeUcusSaati || '-'}</div>
                          </div>
                        </div>

                        <div className="border border-emerald-50 rounded-xl overflow-hidden">
                          <div className="bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700 uppercase tracking-widest">MOTOR SİSTEMLERİ</div>
                          <div className="divide-y divide-emerald-50 bg-white">
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #1 S/N:</span>
                              <span className="text-[11px] font-black text-gray-800">{aircraft.motor1SN || '-'}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #2 S/N:</span>
                              <span className="text-[11px] font-black text-gray-800">{aircraft.motor2SN || '-'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-red-50 rounded-xl overflow-hidden">
                          <div className="bg-red-50 px-3 py-1.5 text-[9px] font-black text-red-700 uppercase tracking-widest">BAKIM ZAMANLARI</div>
                          <div className="p-3 space-y-3 bg-white">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">SAAT ESASLI (40S):</span>
                              <span className="text-sm font-black text-red-600 tracking-tighter">{aircraft.bakim40H || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">SAAT ESASLI (120S):</span>
                              <span className="text-sm font-black text-red-600 tracking-tighter">{aircraft.bakim120H || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">SAAT ESASLI (480S):</span>
                              <span className="text-sm font-black text-red-600 tracking-tighter">{aircraft.bakim480H || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">TAKVİM ESASLI (TARİH):</span>
                              <span className="text-sm font-black text-gray-800 tracking-tighter">{aircraft.bakimTakvimTarih || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {isB360OrC650 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">GÖVDE S/N</div>
                            <div className="text-sm font-black text-emerald-800 uppercase tracking-tighter">{aircraft.govdeSN || '-'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-[9px] font-black text-gray-400 uppercase mb-1">GÖVDE UÇUŞ</div>
                            <div className="text-sm font-black text-emerald-800 uppercase tracking-tighter">{aircraft.govdeUcusSaati || '-'}</div>
                          </div>
                        </div>

                        <div className="border border-emerald-50 rounded-xl overflow-hidden">
                          <div className="bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700 uppercase tracking-widest">MOTOR SİSTEMLERİ</div>
                          <div className="divide-y divide-emerald-50 bg-white">
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #1 S/N:</span>
                              <span className="text-[11px] font-black text-gray-800">{aircraft.motor1SN || '-'}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">MOTOR #2 S/N:</span>
                              <span className="text-[11px] font-black text-gray-800">{aircraft.motor2SN || '-'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-red-50 rounded-xl overflow-hidden">
                          <div className="bg-red-50 px-3 py-1.5 text-[9px] font-black text-red-700 uppercase tracking-widest">BAKIM ZAMANLARI</div>
                          <div className="p-3 space-y-3 bg-white">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">LANDING:</span>
                              <span className="text-sm font-black text-red-600 tracking-tighter">{aircraft.landings || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">SAAT ESASLI (200S):</span>
                              <span className="text-sm font-black text-red-600 tracking-tighter">{aircraft.bakim200H || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none">TAKVİM ESASLI (TARİH):</span>
                              <span className="text-sm font-black text-gray-800 tracking-tighter">{aircraft.bakimTakvimTarih || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isBell429 && !isT70 && !isB360OrC650 && (
                      <div className="flex justify-between items-center text-[13px] pt-2">
                        <span className="text-gray-400 font-bold uppercase tracking-tighter">Üretim Yılı:</span>
                        <span className="font-bold text-gray-800">{aircraft.uretimYili || '-'}</span>
                      </div>
                    )}
                    {aircraft.gelisTarihi && aircraft.gelisTarihi !== '-' && (
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-400 font-bold uppercase tracking-tighter">Geliş Tarihi:</span>
                        <span className="font-bold text-gray-800">{aircraft.gelisTarihi}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-bold uppercase tracking-tighter">Konum:</span>
                      <span className="font-black text-gray-900 uppercase">{aircraft.konum}</span>
                    </div>
                    
                    {!isBell429 && !isT70 && !isB360OrC650 && (
                      <div className="mt-8 pt-6 border-t-2 border-emerald-50">
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-emerald-700 font-black text-[12px] uppercase tracking-tighter">GÖVDE UÇUŞ SAATİ</span>
                            <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-1">GÜNCEL SİSTEM KAYDI</span>
                          </div>
                          <span className="font-black text-emerald-900 text-4xl tracking-tighter leading-none">
                            {aircraft.govdeUcusSaati && aircraft.govdeUcusSaati !== '-' ? aircraft.govdeUcusSaati : '-'}
                          </span>
                        </div>
                      </div>
                    )}
                 </div>
                 
                 <div className="mt-auto pt-6 border-t border-gray-100 text-[10px] text-gray-300 font-black uppercase tracking-widest flex justify-between items-center">
                    <span>SON SENKRONİZASYON</span>
                    <span className="text-gray-400 font-bold">{aircraft.guncellemeTarihi}</span>
                 </div>
               </div>
            </div>

            {/* Right Side: Maintenance & Status */}
            <div className="p-8 flex flex-col bg-white">
              <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5}/></svg>
                      BAKIM SAATLERİ
                   </h3>
                   <span className="text-[9px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase tracking-widest">
                      EN YAKIN: {aircraft.faydaliSaat} SAAT
                   </span>
                 </div>
                 <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                   <table className="w-full text-[13px]">
                     <thead className="bg-gray-50 border-b border-gray-100">
                       <tr>
                          <th className="px-5 py-3 text-left text-gray-400 font-black uppercase tracking-widest">Bakıma kalan Saat</th>
                          <th className="px-5 py-3 text-right text-gray-400 font-black uppercase tracking-widest">Kalan Saat</th>
                       </tr>
                     </thead>
                     <tbody>
                        {aircraft.maintenanceHours.map((mh, i) => (
                          <tr key={i} className="border-b last:border-0 border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 font-bold text-gray-600 uppercase tracking-tighter">{mh.bakimTuru}</td>
                            <td className={`px-5 py-4 text-right font-black text-2xl tracking-tighter ${mh.kalanSaat < 50 ? 'text-red-500' : 'text-emerald-600'}`}>
                              {mh.kalanSaat}
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
                 {isAT802 && (
                   <div className="mt-2 text-[10px] font-bold text-red-500 italic">
                     ** Hat bakımda yapılabilecek olan 25 ve 50 saatlik bakımlar dahil edilmemiştir.
                   </div>
                 )}
              </div>

              <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 flex-grow shadow-inner">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">MEVCUT DURUM</h3>
                 <div className="flex items-center mb-6">
                    <div className={`w-3.5 h-3.5 rounded-full mr-3 ${aircraft.durum === Status.FAAL ? 'bg-green-500 shadow-green-500/30' : 'bg-red-500 shadow-red-500/30'}`}></div>
                    <span className={`text-3xl font-black tracking-tighter ${aircraft.durum === Status.FAAL ? 'text-green-600' : 'text-red-600'}`}>
                      {aircraft.durum}
                      {aircraft.durum === Status.GAYRI_FAAL && aircraft.durumAyrintisi && aircraft.durumAyrintisi !== '-' && (
                        <span className="ml-2 text-xl opacity-80">({aircraft.durumAyrintisi})</span>
                      )}
                    </span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                       <span className="mr-2 opacity-50">BAŞLANGIÇ:</span>
                       <span className="text-gray-700">{aircraft.durumBaslangic}</span>
                    </div>

                    {isLoadingOPL ? (
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 animate-pulse">
                        <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-full bg-gray-100 rounded"></div>
                      </div>
                    ) : oplAlerts.length > 0 && (
                      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 shadow-sm">
                        <h4 className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth={2.5}/></svg>
                          BİLDİRİMLER (ÖPL ALERTLERİ)
                        </h4>
                        <ul className="space-y-1">
                          {oplAlerts.map((alert, idx) => (
                            <li key={idx} className="text-[12px] font-bold text-red-900 flex items-start">
                              <span className="mr-1.5 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                              {alert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="min-h-[140px] bg-white p-5 rounded-2xl border border-gray-200 text-gray-500 text-[13px] font-medium leading-relaxed shadow-sm italic whitespace-pre-wrap">
                      {aircraft.aciklama && aircraft.aciklama !== '-' ? aircraft.aciklama : "--"}
                    </div>
                 </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                 <button 
                   onClick={() => onViewLogs(() => setIsLogRecordsOpen(true))}
                   className="px-8 py-3 text-[11px] font-black text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all uppercase tracking-widest"
                 >
                   GÜNCELLE
                 </button>
                 <button onClick={onEdit} className="px-10 py-3 text-[11px] font-black text-white bg-[#1b5e20] hover:bg-[#154d1a] rounded-lg transition-all shadow-xl uppercase tracking-widest border border-emerald-900/30">DÜZENLE</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLogRecordsOpen && (
        <LogRecordsModal 
          aircraft={aircraft} 
          onClose={() => setIsLogRecordsOpen(false)} 
        />
      )}
    </>
  );
};

export default AircraftDetailModal;
