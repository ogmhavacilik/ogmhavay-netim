
import React, { useMemo, useState, useEffect } from 'react';
import { AircraftActivity, DailyStatusCode } from '../types';
import { X, Clock, Calendar, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityGridProps {
  activities: AircraftActivity[];
  startDate: Date;
  endDate: Date;
  title: string;
  onExport?: () => void;
  onDayClick?: (date: Date) => void;
}

const ActivityGrid: React.FC<ActivityGridProps> = ({ activities, startDate, endDate, title, onExport, onDayClick }) => {
  const [selectedDayView, setSelectedDayView] = useState<{ activity: AircraftActivity, date: Date } | null>(null);

  const isHourlyView = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(0,0,0,0);
    e.setHours(0,0,0,0);
    return s.getTime() === e.getTime();
  }, [startDate, endDate]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getDaysInRange = (start: Date, end: Date) => {
    const dates = [];
    let currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    const lastDate = new Date(end);
    lastDate.setHours(0, 0, 0, 0);

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const visibleDates = getDaysInRange(startDate, endDate);
  const totalDaysInRange = visibleDates.length;

  const todayIndex = useMemo(() => {
    const todayStr = currentTime.toDateString();
    return visibleDates.findIndex(d => d.toDateString() === todayStr);
  }, [visibleDates, currentTime]);

  const daysElapsed = useMemo(() => {
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) return 0;
    const effectiveEnd = today < end ? today : end;
    
    const diffTime = Math.abs(effectiveEnd.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate, currentTime]);

  const getStatusClass = (code: DailyStatusCode | string, isKarma?: boolean) => {
    switch (code) {
      case 'B': case 'BB': case 'TBU': case 'KM': return 'bg-[#FFFF00] text-black font-black border-black'; // SARI
      case 'A': case 'PB': case 'KK': return 'bg-[#FF0000] text-black font-black border-black'; // KIRMIZI
      case 'X': return 'bg-[#7030A0] text-black font-black border-black'; // MOR
      case 'TB': return 'bg-[#40E0D0] text-black font-black border-black'; // TURKUAZ
      case 'F': return 'bg-[#DCFCE7] text-black font-black border-black';
      case '': return 'bg-gray-200 text-transparent'; // Veri yok
      default: return 'bg-white text-black';
    }
  };

  const getStatusStyle = (code: DailyStatusCode | string, isKarma?: boolean): React.CSSProperties => {
    switch (code) {
      case 'B': case 'BB': case 'TBU': case 'KM': return { backgroundColor: '#FFFF00', color: '#000000' };
      case 'A': case 'PB': case 'KK': return { backgroundColor: '#FF0000', color: '#000000' };
      case 'X': return { backgroundColor: '#7030A0', color: '#000000' };
      case 'TB': return { backgroundColor: '#40E0D0', color: '#000000' };
      case 'F': return { backgroundColor: '#DCFCE7', color: '#000000' };
      case '': return { backgroundColor: '#e5e7eb', color: 'transparent' }; // Veri yok
      default: return { backgroundColor: '#FFFFFF', color: '#000000' };
    }
  };

  const calculateRowStats = (activity: AircraftActivity) => {
    let bakim = 0, ariza = 0, olmadi = 0, faal = 0, missing = 0;

    const getStreakLengthAt = (dateStrKey: string, baseDate: Date) => {
      const s = activity.dailyStatuses[dateStrKey];
      if (!s || s === 'F') return 0;

      let length = 1;
      
      // Look backwards
      let d = new Date(baseDate);
      d.setDate(d.getDate() - 1);
      for (let i = 0; i < 30; i++) {
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const prevS = activity.dailyStatuses[k];
        if (prevS && prevS !== 'F') {
          length++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }

      // Look forwards
      d = new Date(baseDate);
      d.setDate(d.getDate() + 1);
      for (let i = 0; i < 30; i++) {
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const nextS = activity.dailyStatuses[k];
        if (nextS && nextS !== 'F') {
          length++;
          d.setDate(d.getDate() + 1);
        } else {
          break;
        }
      }

      return length;
    };

    let effectiveFaal = 0;

    visibleDates.forEach((date, idx) => {
      const isPastOrToday = todayIndex === -1 ? (date <= currentTime) : (idx <= todayIndex);
      const dateStrKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const s = activity.dailyStatuses[dateStrKey];
      
      if (isPastOrToday) {
        if (s === undefined || s === '') {
          missing++;
        } else if (['B', 'BB', 'TBU', 'KM'].includes(s)) {
          bakim++;
        } else if (['A', 'PB', 'KK'].includes(s)) {
          ariza++;
        } else if (s === 'X') {
          olmadi++;
        } else if (s === 'F') {
          faal++;
        }

        // Calculate effective faal for percentage
        if (s === 'F') {
          effectiveFaal++;
        } else if (s && s !== 'X') {
          const streakLen = getStreakLengthAt(dateStrKey, date);
          if (streakLen < 3) {
            effectiveFaal++;
          }
        }
      }
    });

    const totalGFaal = bakim + ariza + olmadi;
    const totalFaal = faal;
    
    const baseDays = daysElapsed - olmadi - missing;
    const percentage = baseDays > 0 ? ((effectiveFaal / baseDays) * 100).toFixed(0) : "0";
    
    return { bakim, ariza, olmadi, totalGFaal, totalFaal, effectiveFaal, percentage, missing };
  };

  // TİP bazlı gruplandırma ve sıralama
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: AircraftActivity[] } = {};
    activities.forEach(act => {
      if (!groups[act.tip]) groups[act.tip] = [];
      groups[act.tip].push(act);
    });
    
    // Sıralama: C-650, B-360, Bell-429, AT-802, T-70
    const order = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
    const sortedGroups: { [key: string]: AircraftActivity[] } = {};
    
    const getOrder = (cagriKodu: string) => {
      const match = String(cagriKodu).match(/ORMAN-(\d+)/i);
      if (match) return parseInt(match[1]);
      return 999;
    };

    order.forEach(tip => {
      if (groups[tip]) {
        if (tip === 'AT-802') {
          sortedGroups[tip] = groups[tip].sort((a, b) => a.kuyrukNo.localeCompare(b.kuyrukNo));
        } else {
          sortedGroups[tip] = groups[tip].sort((a, b) => getOrder(a.cagriKodu) - getOrder(b.cagriKodu));
        }
      }
    });
    
    // Diğer tipler varsa sona ekle
    Object.keys(groups).forEach(tip => {
      if (!order.includes(tip)) {
        if (tip === 'AT-802') {
          sortedGroups[tip] = groups[tip].sort((a, b) => a.kuyrukNo.localeCompare(b.kuyrukNo));
        } else {
          sortedGroups[tip] = groups[tip].sort((a, b) => getOrder(a.cagriKodu) - getOrder(b.cagriKodu));
        }
      }
    });
    
    return sortedGroups;
  }, [activities]);

  if (activities.length === 0) return null;

  return (
    <div className="activity-grid-section bg-white p-2">
      <div className="flex justify-between items-center mb-4 px-2">
         <h3 className="text-4xl font-black text-black tracking-tighter">{isHourlyView ? `${title} - SAATLİK GÖRÜNÜM` : title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table id="activity-table" className="w-full border-collapse border-[1.5px] border-black text-[10px] bg-white font-sans">
          <thead>
            <tr className="bg-white">
              <th rowSpan={2} className="border border-black px-1 py-1 w-10 uppercase font-black text-[9px]">SIRA NO</th>
              <th rowSpan={2} className="border border-black px-1 py-1 w-[110px] uppercase font-black text-[9px]">KUYRUK NO</th>
              <th rowSpan={2} className="border border-black px-1 py-1 w-[100px] uppercase font-black text-[9px]">ÇAĞRI KODU</th>
              <th rowSpan={2} className="border border-black px-1 py-1 w-[120px] uppercase font-black text-[9px]">HAVA ARACI TİPİ</th>
              {isHourlyView ? (
                hours.map((hour, idx) => (
                  <th key={idx} rowSpan={2} className="border border-black w-8 text-center font-bold min-w-[32px] text-[8px] bg-white h-16">
                    <div className="[writing-mode:vertical-lr] rotate-180 whitespace-nowrap mx-auto">
                      {hour}
                    </div>
                  </th>
                ))
              ) : (
                visibleDates.map((date, idx) => {
                  const isTodayColumn = idx === todayIndex;
                  return (
                    <th key={idx} rowSpan={2} className={`border border-black w-8 text-center font-bold min-w-[32px] text-[8px] bg-white h-16 relative ${isTodayColumn ? 'bg-red-50' : ''}`}>
                      <div className="[writing-mode:vertical-lr] rotate-180 whitespace-nowrap mx-auto">
                        {date.getDate()}.{String(date.getMonth() + 1).padStart(2, '0')}.{date.getFullYear()}
                      </div>
                      {isTodayColumn && (
                        <div className="absolute inset-y-0 right-[-2px] w-0 border-r-[3.5px] border-dashed border-red-600 z-[100] pointer-events-none" />
                      )}
                    </th>
                  );
                })
              )}
              {!isHourlyView && (
                <>
                  <th colSpan={3} className="border border-black bg-[#00b0f0] text-white py-0.5 text-[8px] font-black uppercase tracking-tighter" style={{ backgroundColor: '#00b0f0', color: '#ffffff' }}>TOPLAM G.FAAL</th>
                  <th rowSpan={2} className="border border-black bg-[#00b0f0] text-white px-0.5 w-12 text-[8px] font-black uppercase leading-tight" style={{ backgroundColor: '#00b0f0', color: '#ffffff' }}>TOPLAM<br/>G.FAAL</th>
                  <th rowSpan={2} className="border border-black bg-[#ffc000] text-black px-0.5 w-12 text-[8px] font-black uppercase leading-tight" style={{ backgroundColor: '#ffc000', color: '#000000' }}>TOPLAM<br/>FAAL</th>
                  <th rowSpan={2} className="border border-black bg-gray-50 text-black px-0.5 w-12 text-[7px] font-black uppercase leading-tight" style={{ backgroundColor: '#f8fafc', color: '#000000' }}>TOPLAM GÜN SAYISI</th>
                  <th rowSpan={2} className="border border-black bg-gray-100 text-black px-0.5 w-16 text-[8px] font-black uppercase leading-tight" style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>FAALİYET % **</th>
                </>
              )}
            </tr>
            {!isHourlyView && (
              <tr className="bg-white">
                <th className="border border-black bg-[#ffff00] text-black w-10 text-[7.5px] py-1 font-black" style={{ backgroundColor: '#ffff00', color: '#000000' }}>Bakım</th>
                <th className="border border-black bg-[#ff0000] text-white w-10 text-[7.5px] py-1 font-black" style={{ backgroundColor: '#ff0000', color: '#ffffff' }}>Arıza</th>
                <th className="border border-black bg-[#7030a0] text-white w-10 text-[7.5px] py-1 font-black" style={{ backgroundColor: '#7030a0', color: '#ffffff' }}>Olmadığı</th>
              </tr>
            )}
          </thead>
          <tbody>
            {(() => {
              let globalIndex = 0;
              return Object.keys(groupedActivities).map((groupName, gIdx) => {
                const groupActs = groupedActivities[groupName];
                let groupBakim = 0, groupAriza = 0, groupOlmadi = 0, groupTotalGF = 0, groupTotalF = 0, groupEffectiveFaal = 0, groupMissing = 0;

                return (
                  <React.Fragment key={gIdx}>
                    {groupActs.map((act, idx) => {
                      globalIndex++;
                      const s = calculateRowStats(act);
                      groupBakim += s.bakim;
                      groupAriza += s.ariza;
                      groupOlmadi += s.olmadi;
                      groupTotalGF += s.totalGFaal;
                      groupTotalF += s.totalFaal;
                      groupEffectiveFaal += s.effectiveFaal;
                      groupMissing += s.missing;

                      return (
                        <tr key={idx} className="h-7 hover:bg-gray-50">
                          <td className="border border-black text-center font-black px-1 text-gray-900">
                            {globalIndex}
                          </td>
                          <td className="border border-black text-center font-bold px-1">
                          {act.kuyrukNo}
                          <span className="text-red-600 ml-1">
                            {(() => {
                              const tail = String(act.kuyrukNo).trim().toUpperCase();
                              if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return '(DA)';
                              if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) return '(SA)';
                              if (tail === 'OR-2036') return '(DL)';
                              if (tail === 'OR-2038') return '(SL)';
                              if (tail === 'OR-1020') return '(H)';
                              return '';
                            })()}
                          </span>
                        </td>
                        <td className="border border-black text-center font-bold px-1">{act.cagriKodu}</td>
                        <td className="border border-black text-center px-1 font-bold">{act.tip}</td>
                        {isHourlyView ? (
                          hours.map((hour, hIdx) => {
                            const dateStrKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
                            
                            const now = new Date();
                            const isToday = startDate.toDateString() === now.toDateString();
                            const currentHour = now.getHours();
                            const hourInt = parseInt(hour.split(':')[0]);
                            const isFuture = isToday && hourInt > currentHour;

                            const hourlyStatus = act.hourlyStatuses?.[dateStrKey]?.[hour];
                            let status = hourlyStatus !== undefined ? hourlyStatus : (act.dailyStatuses[dateStrKey] || '');
                            if (isFuture) status = '';

                            return (
                              <td key={hIdx} className={`border border-black text-center text-[10px] ${getStatusClass(status)}`} style={getStatusStyle(status)}>
                                {status === 'F' ? '' : status}
                              </td>
                            );
                          })
                        ) : (
                          visibleDates.map((date, dIdx) => {
                            const dateStrKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            const status = act.dailyStatuses[dateStrKey] || '';
                            const isCompletedToday = act.intraDayCompletions?.[dateStrKey];
                            return (
                              <td 
                                key={dIdx} 
                                className={`border border-black text-center text-[10px] relative ${getStatusClass(status, isCompletedToday)} cursor-pointer hover:opacity-80 ${dIdx === todayIndex ? 'bg-red-50/10' : ''}`} 
                                style={getStatusStyle(status, isCompletedToday)}
                                onClick={() => {
                                  if (isCompletedToday) {
                                    setSelectedDayView({ activity: act, date: date });
                                  }
                                }}
                              >
                                {dIdx === todayIndex && (
                                   <div className="absolute inset-y-0 right-[-2px] w-0 border-r-[3.5px] border-dashed border-red-600 z-[50] pointer-events-none" />
                                )}
                                <div className="flex items-center justify-center min-h-[24px]">
                                  {status !== 'F' && status}
                                  {isCompletedToday && (
                                    <span className="text-orange-500 font-black text-base leading-none ml-0.5">*</span>
                                  )}
                                </div>
                              </td>
                            );
                          })
                        )}
                        {!isHourlyView && (
                          <>
                            <td className="border border-black text-center font-bold bg-[#ffffcc]" style={{ backgroundColor: '#ffffcc' }}>{s.bakim || '0'}</td>
                            <td className="border border-black text-center font-bold bg-[#ffcccc]" style={{ backgroundColor: '#ffcccc' }}>{s.ariza || '0'}</td>
                            <td className="border border-black text-center font-bold bg-[#e2efda]" style={{ backgroundColor: '#e2efda' }}>{s.olmadi || '0'}</td>
                            <td className="border border-black text-center font-bold bg-[#ddebf7]" style={{ backgroundColor: '#ddebf7' }}>{s.totalGFaal}</td>
                            <td className="border border-black text-center font-bold bg-[#fff2cc]" style={{ backgroundColor: '#fff2cc' }}>{s.totalFaal}</td>
                            <td className="border border-black text-center font-bold bg-white" style={{ backgroundColor: '#ffffff' }}>{daysElapsed}</td>
                            <td className="border border-black text-center font-bold bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>{s.percentage}%</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {/* GRUP TOPLAMI SATIRI */}
                  {!isHourlyView && (
                    <tr className="h-6 bg-gray-100 font-black">
                      <td colSpan={4 + totalDaysInRange} className="border border-black text-right px-4 uppercase text-[8px]" style={{ backgroundColor: '#f3f4f6' }}>TOPLAM</td>
                      <td className="border border-black text-center bg-[#ffff00]" style={{ backgroundColor: '#ffff00', color: '#000000' }}>{groupBakim}</td>
                      <td className="border border-black text-center bg-[#ff0000] text-white" style={{ backgroundColor: '#ff0000', color: '#ffffff' }}>{groupAriza}</td>
                      <td className="border border-black text-center bg-[#7030a0] text-white" style={{ backgroundColor: '#7030a0', color: '#ffffff' }}>{groupOlmadi}</td>
                      <td className="border border-black text-center bg-[#00b0f0] text-white" style={{ backgroundColor: '#00b0f0', color: '#ffffff' }}>{groupTotalGF}</td>
                      <td className="border border-black text-center bg-[#ffc000]" style={{ backgroundColor: '#ffc000', color: '#000000' }}>{groupTotalF}</td>
                      <td className="border border-black text-center font-black bg-gray-50">{groupActs.length * daysElapsed}</td>
                      <td className="border border-black text-center bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
                        {((groupActs.length * daysElapsed - groupOlmadi - groupMissing) > 0 ? ((groupEffectiveFaal) / (groupActs.length * daysElapsed - groupOlmadi - groupMissing) * 100).toFixed(0) : "0")}%
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            });
          })()}
        </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col px-2">
        <div className="flex flex-wrap gap-4 mb-4">
           <div className="flex flex-col space-y-1">
              <div className="bg-[#ffff00] border border-black px-2 py-1 text-[9px] font-black w-40">B: BAKIM</div>
              <div className="bg-[#ffff00] border border-black px-2 py-1 text-[9px] font-black w-40">BB: BAKIM BEKLER</div>
              <div className="bg-[#ffff00] border border-black px-2 py-1 text-[9px] font-black w-40">TBU: TEKNİK BÜLTEN UYGULAMASI</div>
              <div className="bg-[#ffff00] border border-black px-2 py-1 text-[9px] font-black w-40">KM: KABUL MUAYENESİ</div>
           </div>
           <div className="flex flex-col space-y-1">
              <div className="bg-[#ff0000] text-white border border-black px-2 py-1 text-[9px] font-black w-40">A: ARIZA</div>
              <div className="bg-[#ff0000] text-white border border-black px-2 py-1 text-[9px] font-black w-40">PB: PARÇA BEKLER</div>
              <div className="bg-[#ff0000] text-white border border-black px-2 py-1 text-[9px] font-black w-40">KK: KAZA KIRIM</div>
           </div>
           <div className="flex flex-col space-y-1">
              <div className="bg-[#7030a0] text-white border border-black px-2 py-1 text-[9px] font-black w-40">X: OLMADIĞI GÜNLER</div>
              <div className="bg-[#40E0D0] text-black border border-black px-2 py-1 text-[9px] font-black w-40">TB: TECRÜBE BEKLER</div>
           </div>
           <div className="flex flex-col space-y-1">
              <div className="bg-white border border-black px-2 py-1 text-[9px] font-black w-64 flex items-center">
                <span className="text-orange-500 font-black text-base leading-none mr-2">*</span>
                KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)
              </div>
           </div>
        </div>
        <div className="text-[10px] font-bold text-gray-500 mt-1 flex items-center">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 mr-2 inline-block"></div>
          Soluk alanlar veri tabanında bulunmamaktadır.
        </div>
      </div>

      {/* Hourly View Modal */}
      {selectedDayView && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border-4 border-emerald-900 flex flex-col animate-in zoom-in duration-300">
            <div className="p-6 border-b-4 border-emerald-900 flex justify-between items-center bg-emerald-900 rounded-t-[1.6rem]">
              <div className="flex items-center space-x-5">
                <div className="bg-white/20 p-3 rounded-2xl shadow-inner">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                    SAATLİK FAALİYET GÖRÜNÜMÜ
                  </h3>
                  <p className="text-white/80 font-bold text-xs uppercase tracking-[0.2em] mt-1">
                    {selectedDayView.activity.kuyrukNo} — {selectedDayView.activity.cagriKodu}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDayView(null)}
                className="p-3 hover:bg-white/20 rounded-full transition-all text-white active:scale-90"
              >
                <X className="w-10 h-10" />
              </button>
            </div>
            
            <div className="p-8 overflow-auto">
              <div className="flex justify-between items-center mb-8 bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100 shadow-inner">
                <div className="flex items-center space-x-4">
                  <div className="bg-emerald-100 p-4 rounded-2xl">
                    <Calendar className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Seçili Tarih</p>
                    <p className="text-2xl font-black text-emerald-900">
                      {selectedDayView.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-2">TOPLAM GAYRİ FAAL SÜRE</p>
                  <div className="bg-red-600 px-8 py-4 rounded-2xl shadow-xl shadow-red-200 border-b-4 border-red-800">
                    <span className="text-3xl font-black text-white tracking-tighter">
                      {(() => {
                        const dateStrKey = `${selectedDayView.date.getFullYear()}-${String(selectedDayView.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDayView.date.getDate()).padStart(2, '0')}`;
                        const events = selectedDayView.activity.intraDayEvents?.[dateStrKey] || [];
                        const dailyStatus = selectedDayView.activity.dailyStatuses[dateStrKey] || 'F';
                        
                        const isToday = selectedDayView.date.toDateString() === currentTime.toDateString();
                        const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
                        const endOfDayMins = isToday ? currentMins : 24 * 60;

                        let totalMins = 0;
                        let isDown = false;
                        let lastDownMins = 0;

                        if (events.length > 0 && events[0].type === 'up') {
                          isDown = true;
                          lastDownMins = 0;
                        } else if (events.length === 0 && dailyStatus !== 'F') {
                          totalMins = endOfDayMins;
                        }

                        for (const ev of events) {
                          if (ev.type === 'down' && !isDown) {
                            isDown = true;
                            lastDownMins = ev.exactMins;
                          } else if (ev.type === 'up' && isDown) {
                            isDown = false;
                            const upMins = isToday ? Math.min(ev.exactMins, currentMins) : ev.exactMins;
                            totalMins += Math.max(0, upMins - lastDownMins);
                          }
                        }

                        if (isDown) {
                          totalMins += Math.max(0, endOfDayMins - lastDownMins);
                        }

                        if (totalMins > 0 || dailyStatus !== 'F') {
                          const h = Math.floor(totalMins / 60);
                          const m = totalMins % 60;
                          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} SAAT`;
                        }

                        return '00:00 SAAT';
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-black text-emerald-900 mb-4 uppercase tracking-tight flex items-center">
                  <Activity className="w-6 h-6 mr-2" />
                  GÜNLÜK FAALİYET AKIŞI
                </h4>
                <div className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-emerald-900 text-white text-[10px] font-black uppercase py-2">
                    <div className="col-span-2 text-center">SAAT</div>
                    <div className="col-span-3 text-center">DURUM</div>
                    <div className="col-span-7 px-4">AÇIKLAMA</div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {hours.map((hour, idx) => {
                      const dateStrKey = `${selectedDayView.date.getFullYear()}-${String(selectedDayView.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDayView.date.getDate()).padStart(2, '0')}`;
                      
                      // Gelecek saat kontrolü
                      const now = new Date();
                      const isToday = selectedDayView.date.toDateString() === now.toDateString();
                      const currentHour = now.getHours();
                      const hourInt = parseInt(hour.split(':')[0]);
                      const isFuture = isToday && hourInt > currentHour;

                      const hourlyData = selectedDayView.activity.hourlyStatuses?.[dateStrKey] || {};
                      const hasHourlyData = Object.keys(hourlyData).length > 0;
                      const dailyStatus = selectedDayView.activity.dailyStatuses[dateStrKey] || 'F';

                      const status = isFuture ? '' : (hourlyData[hour] || (hasHourlyData ? 'F' : dailyStatus));
                      const isGayriFaal = status !== 'F' && status !== '';
                      
                      return (
                        <div key={idx} className={`grid grid-cols-12 border-b border-emerald-50 py-2 items-center ${isGayriFaal ? 'bg-red-50/30' : 'bg-white'}`}>
                          <div className="col-span-2 text-center font-bold text-gray-500">{hour}</div>
                          <div className="col-span-3 flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${getStatusClass(status)}`} style={getStatusStyle(status)}>
                              {status === '' ? '' : (status === 'F' ? 'FAAL' : status)}
                            </span>
                          </div>
                          <div className="col-span-7 px-4 text-[11px] font-medium text-gray-600 italic">
                            {selectedDayView.activity.hourlyDescriptions?.[dateStrKey]?.[hour] || (isGayriFaal ? 'Gayri Faal Durum Devam Ediyor' : 'Uçuşa Elverişli / Faal')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
                {hours.map((hour, idx) => {
                  const dateStrKey = `${selectedDayView.date.getFullYear()}-${String(selectedDayView.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDayView.date.getDate()).padStart(2, '0')}`;
                  
                  const now = new Date();
                  const isToday = selectedDayView.date.toDateString() === now.toDateString();
                  const currentHour = now.getHours();
                  const hourInt = parseInt(hour.split(':')[0]);
                  const isFuture = isToday && hourInt > currentHour;

                  const hourlyData = selectedDayView.activity.hourlyStatuses?.[dateStrKey] || {};
                  const hasHourlyData = Object.keys(hourlyData).length > 0;
                  const dailyStatus = selectedDayView.activity.dailyStatuses[dateStrKey] || 'F';

                  const status = isFuture ? '' : (hourlyData[hour] || (hasHourlyData ? 'F' : dailyStatus));
                  
                  return (
                    <div key={idx} className="flex flex-col items-center group">
                      <div className="text-[9px] font-black text-gray-400 mb-1 group-hover:text-emerald-600 transition-colors">{hour}</div>
                      <div 
                        className={`w-full h-14 flex items-center justify-center border-2 border-black/5 rounded-2xl font-black text-lg shadow-sm transition-all hover:scale-105 ${getStatusClass(status)}`}
                        style={{ 
                          ...getStatusStyle(status), 
                          color: status === 'F' ? '#000000' : getStatusStyle(status).color,
                          backgroundColor: status === 'F' ? '#ecfdf5' : getStatusStyle(status).backgroundColor
                        }}
                      >
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex justify-between items-center">
                <div className="flex space-x-8">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-[#ecfdf5] border-2 border-emerald-200 mr-2 rounded-lg"></div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">FAAL</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-[#FFFF00] border-2 border-yellow-400 mr-2 rounded-lg"></div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">BAKIM</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-[#FF0000] border-2 border-red-400 mr-2 rounded-lg"></div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">ARIZA</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDayView(null)}
                  className="px-16 py-5 bg-gray-900 text-white rounded-2xl font-black text-[14px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95 border-b-4 border-gray-700"
                >
                  PENCEREYİ KAPAT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityGrid;
