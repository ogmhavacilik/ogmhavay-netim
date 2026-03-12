
import React, { useMemo } from 'react';
import { AircraftActivity, DailyStatusCode } from '../types';

interface ActivityGridProps {
  activities: AircraftActivity[];
  startDate: Date;
  endDate: Date;
  title: string;
  onExport?: () => void;
}

const ActivityGrid: React.FC<ActivityGridProps> = ({ activities, startDate, endDate, title, onExport }) => {
  const isHourlyView = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(0,0,0,0);
    e.setHours(0,0,0,0);
    return s.getTime() === e.getTime();
  }, [startDate, endDate]);

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
  const totalDaysInMonth = visibleDates.length;

  const getStatusClass = (code: DailyStatusCode | string) => {
    switch (code) {
      case 'B': case 'BB': case 'KM': return 'bg-[#FFFF00] text-black font-black border-black'; // SARI
      case 'A': case 'PB': case 'KK': return 'bg-[#FF0000] text-white font-black border-black'; // KIRMIZI
      case 'X': return 'bg-[#7030A0] text-white font-black border-black'; // MOR
      case 'F': return 'bg-white text-transparent';
      case '': return 'bg-gray-200 text-transparent'; // Veri yok
      default: return 'bg-white';
    }
  };

  const getStatusStyle = (code: DailyStatusCode | string): React.CSSProperties => {
    switch (code) {
      case 'B': case 'BB': case 'KM': return { backgroundColor: '#FFFF00', color: '#000000' };
      case 'A': case 'PB': case 'KK': return { backgroundColor: '#FF0000', color: '#FFFFFF' };
      case 'X': return { backgroundColor: '#7030A0', color: '#FFFFFF' };
      case 'F': return { backgroundColor: '#FFFFFF', color: '#FFFFFF' };
      case '': return { backgroundColor: '#e5e7eb', color: 'transparent' }; // Veri yok
      default: return { backgroundColor: '#FFFFFF' };
    }
  };

  const calculateRowStats = (activity: AircraftActivity) => {
    let bakim = 0, ariza = 0, olmadi = 0, faal = 0, missing = 0;
    let effectiveGFaal = 0;
    let currentStreak = 0;

    visibleDates.forEach(date => {
      const dateStrKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const s = activity.dailyStatuses[dateStrKey];
      
      if (s === undefined || s === '') {
        missing++;
      } else if (['B', 'BB', 'KM'].includes(s)) {
        bakim++;
      } else if (['A', 'PB', 'KK'].includes(s)) {
        ariza++;
      } else if (s === 'X') {
        olmadi++;
      } else if (s === 'F') {
        faal++;
      }

      if (s && ['B', 'BB', 'KM', 'A', 'PB', 'KK'].includes(s)) {
        currentStreak++;
      } else {
        if (currentStreak >= 3) {
          effectiveGFaal += currentStreak;
        }
        currentStreak = 0;
      }
    });

    if (currentStreak >= 3) {
      effectiveGFaal += currentStreak;
    }

    const totalGFaal = bakim + ariza + olmadi;
    const totalFaal = faal;
    
    const baseDays = totalDaysInMonth - olmadi - missing;
    const effectiveFaal = baseDays - effectiveGFaal;
    const percentage = baseDays > 0 ? ((effectiveFaal / baseDays) * 100).toFixed(0) : "0";
    
    return { bakim, ariza, olmadi, totalGFaal, totalFaal, percentage, effectiveGFaal, missing };
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
                visibleDates.map((date, idx) => (
                  <th key={idx} rowSpan={2} className="border border-black w-8 text-center font-bold min-w-[32px] text-[8px] bg-white h-16">
                    <div className="[writing-mode:vertical-lr] rotate-180 whitespace-nowrap mx-auto">
                      {date.getDate()}.{String(date.getMonth() + 1).padStart(2, '0')}.{date.getFullYear()}
                    </div>
                  </th>
                ))
              )}
              {!isHourlyView && (
                <>
                  <th colSpan={3} className="border border-black bg-[#00b0f0] text-white py-0.5 text-[8px] font-black uppercase tracking-tighter" style={{ backgroundColor: '#00b0f0', color: '#ffffff' }}>TOPLAM G.FAAL</th>
                  <th rowSpan={2} className="border border-black bg-[#00b0f0] text-white px-0.5 w-12 text-[8px] font-black uppercase leading-tight" style={{ backgroundColor: '#00b0f0', color: '#ffffff' }}>TOPLAM<br/>G.FAAL</th>
                  <th rowSpan={2} className="border border-black bg-[#ffc000] text-black px-0.5 w-12 text-[8px] font-black uppercase leading-tight" style={{ backgroundColor: '#ffc000', color: '#000000' }}>TOPLAM<br/>FAAL</th>
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
            {Object.keys(groupedActivities).map((groupName, gIdx) => {
              const groupActs = groupedActivities[groupName];
              let groupBakim = 0, groupAriza = 0, groupOlmadi = 0, groupTotalGF = 0, groupTotalF = 0, groupEffectiveGFaal = 0, groupMissing = 0;

              return (
                <React.Fragment key={gIdx}>
                  {groupActs.map((act, idx) => {
                    const s = calculateRowStats(act);
                    groupBakim += s.bakim;
                    groupAriza += s.ariza;
                    groupOlmadi += s.olmadi;
                    groupTotalGF += s.totalGFaal;
                    groupTotalF += s.totalFaal;
                    groupEffectiveGFaal += s.effectiveGFaal;
                    groupMissing += s.missing;

                    return (
                      <tr key={idx} className="h-7 hover:bg-gray-50">
                        <td className="border border-black text-center font-bold px-1">
                          {act.kuyrukNo}
                          <span className="text-red-600 ml-1">
                            {(() => {
                              const tail = String(act.kuyrukNo).trim().toUpperCase();
                              if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return '(D-A)';
                              if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) return '(S-A)';
                              if (tail === 'OR-2036') return '(D-L)';
                              if (tail === 'OR-2038') return '(S-L)';
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
                            const status = act.hourlyStatuses?.[dateStrKey]?.[hour] || act.dailyStatuses[dateStrKey] || '';
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
                              <td key={dIdx} className={`border border-black text-center text-[10px] ${getStatusClass(status)}`} style={getStatusStyle(status)}>
                                {status === 'F' ? (isCompletedToday ? <span className="text-orange-500 font-black text-sm">*</span> : '') : status}
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
                            <td className="border border-black text-center font-bold bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>{s.percentage}%</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {/* GRUP TOPLAMI SATIRI */}
                  {!isHourlyView && (
                    <tr className="h-6 bg-gray-100 font-black">
                      <td colSpan={3 + totalDaysInMonth} className="border border-black text-right px-4 uppercase text-[8px]" style={{ backgroundColor: '#f3f4f6' }}>TOPLAM</td>
                      <td className="border border-black text-center bg-[#ffff00]" style={{ backgroundColor: '#ffff00', color: '#000000' }}>{groupBakim}</td>
                      <td className="border border-black text-center bg-[#ff0000] text-white" style={{ backgroundColor: '#ff0000', color: '#ffffff' }}>{groupAriza}</td>
                      <td className="border border-black text-center bg-[#7030a0] text-white" style={{ backgroundColor: '#7030a0', color: '#ffffff' }}>{groupOlmadi}</td>
                      <td className="border border-black text-center bg-[#00b0f0] text-white" style={{ backgroundColor: '#00b0f0', color: '#ffffff' }}>{groupTotalGF}</td>
                      <td className="border border-black text-center bg-[#ffc000]" style={{ backgroundColor: '#ffc000', color: '#000000' }}>{groupTotalF}</td>
                      <td className="border border-black text-center bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
                        {((groupActs.length * totalDaysInMonth - groupOlmadi - groupMissing) > 0 ? (((groupActs.length * totalDaysInMonth - groupOlmadi - groupMissing) - groupEffectiveGFaal) / (groupActs.length * totalDaysInMonth - groupOlmadi - groupMissing) * 100).toFixed(0) : "0")}%
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col px-2">
        <div className="flex flex-wrap gap-4 mb-4">
           <div className="flex flex-col space-y-1">
              <div className="bg-[#ffff00] border border-black px-2 py-1 text-[9px] font-black w-40">B: BAKIM</div>
              <div className="bg-[#ffff00] border border-black px-2 py-1 text-[9px] font-black w-40">BB: BAKIM BEKLER</div>
              <div className="bg-[#ffff00] border border-black px-2 py-1 text-[9px] font-black w-40">KM: KABUL MUAYENESİ</div>
           </div>
           <div className="flex flex-col space-y-1">
              <div className="bg-[#ff0000] text-white border border-black px-2 py-1 text-[9px] font-black w-40">A: ARIZA</div>
              <div className="bg-[#ff0000] text-white border border-black px-2 py-1 text-[9px] font-black w-40">PB: PARÇA BEKLER</div>
              <div className="bg-[#ff0000] text-white border border-black px-2 py-1 text-[9px] font-black w-40">KK: KAZA KIRIM</div>
           </div>
           <div className="flex flex-col space-y-1">
              <div className="bg-[#7030a0] text-white border border-black px-2 py-1 text-[9px] font-black w-40">X: OLMADIĞI GÜNLER</div>
           </div>
           <div className="flex flex-col space-y-1">
              <div className="bg-white border border-black px-2 py-1 text-[9px] font-black w-64 flex items-center">
                <span className="text-orange-500 font-black text-sm mr-2">*</span>
                GÜN İÇERSİNDE TAMAMLANAN BAKIM VEYA ARIZA FAALİYETLERİ
              </div>
           </div>
        </div>
        {!isHourlyView && (
          <div className="text-[10px] font-bold text-red-600">
            ** 3 güne kadar olan gayrı faal durumlar (B, BB, KM, A, PB, KK) faaliyet oranına yansıtılmamıştır.
          </div>
        )}
        <div className="text-[10px] font-bold text-gray-500 mt-1 flex items-center">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 mr-2 inline-block"></div>
          Soluk alanlar veri tabanında bulunmamaktadır.
        </div>
      </div>
    </div>
  );
};

export default ActivityGrid;
