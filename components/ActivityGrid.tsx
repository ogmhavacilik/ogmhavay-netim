
import React, { useMemo, useState, useEffect } from 'react';
import { AircraftActivity, DailyStatusCode, Aircraft } from '../types';
import { X, Clock, Calendar, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityGridProps {
  activities: AircraftActivity[];
  fleet?: Aircraft[];
  startDate: Date;
  endDate: Date;
  title: string;
  onExport?: () => void;
  onDayClick?: (date: Date) => void;
  sortByCagriKodu?: boolean;
  sortByFaydaliSaat?: boolean;
}

const ActivityGrid: React.FC<ActivityGridProps> = ({ activities, fleet = [], startDate, endDate, title, onExport, onDayClick, sortByCagriKodu = false, sortByFaydaliSaat = false }) => {
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

  const getStatusClass = (code: DailyStatusCode | string, isCompletedToday?: boolean) => {
    if (code === 'K' || isCompletedToday || code === 'FY') return 'bg-white p-0 relative overflow-hidden border-black';
    switch (code) {
      case 'B': case 'BB': case 'TBU': case 'KM': return 'bg-[#FFFF00] text-black font-black border-black'; // SARI
      case 'A': case 'PB': case 'KK': return 'bg-[#FF0000] text-white font-black border-black'; // KIRMIZI
      case 'X': return 'bg-[#7030A0] text-white font-black border-black'; // MOR
      case 'TB': return 'bg-[#40E0D0] text-black font-black border-black'; // TURKUAZ
      case 'F': return 'bg-[#DCFCE7] text-black font-black border-black';
      case '': return 'bg-gray-200 text-transparent'; // Veri yok
      default: return 'bg-white text-black';
    }
  };

  const getStatusStyle = (code: DailyStatusCode | string, isCompletedToday?: boolean): React.CSSProperties => {
    if (code === 'K' || isCompletedToday) return { backgroundColor: '#FFFFFF', padding: 0 };
    if (code === 'FY') return { background: 'linear-gradient(135deg, #DCFCE7 50%, #FF0000 50%)', padding: 0 };
    switch (code) {
      case 'B': case 'BB': case 'TBU': case 'KM': return { backgroundColor: '#FFFF00', color: '#000000' };
      case 'A': case 'PB': case 'KK': return { backgroundColor: '#FF0000', color: '#FFFFFF' };
      case 'X': return { backgroundColor: '#7030A0', color: '#FFFFFF' };
      case 'TB': return { backgroundColor: '#40E0D0', color: '#000000' };
      case 'F': return { backgroundColor: '#DCFCE7', color: '#000000' };
      case '': return { backgroundColor: '#e5e7eb', color: 'transparent' }; // Veri yok
      default: return { backgroundColor: '#FFFFFF', color: '#000000' };
    }
  };

  const calculateRowStats = (activity: AircraftActivity) => {
    let bakim = 0, ariza = 0, olmadi = 0, faal = 0, faalYanginGoreviYapamaz = 0, missing = 0;

    const getStreakLengthAt = (dateStrKey: string, baseDate: Date) => {
      const s = activity.dailyStatuses[dateStrKey];
      if (!s || s === 'F' || s === 'FY') return 0;

      let length = 1;
      
      // Look backwards
      let d = new Date(baseDate);
      d.setDate(d.getDate() - 1);
      for (let i = 0; i < 30; i++) {
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const prevS = activity.dailyStatuses[k];
        if (prevS && prevS !== 'F' && prevS !== 'FY') {
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
        if (nextS && nextS !== 'F' && nextS !== 'FY') {
          length++;
          d.setDate(d.getDate() + 1);
        } else {
          break;
        }
      }

      return length;
    };

    const firstStatusDateKey = Object.keys(activity.dailyStatuses).sort()[0];
    const firstStatusDate = firstStatusDateKey ? new Date(firstStatusDateKey) : null;

    // First pass: Count basic stats
    visibleDates.forEach((date, idx) => {
      const isPastOrToday = todayIndex === -1 ? (date <= currentTime) : (idx <= todayIndex);
      const dateStrKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      let s = activity.dailyStatuses[dateStrKey];
      
      if (isPastOrToday && (s === undefined || s === '') && firstStatusDate && date < firstStatusDate) {
        s = 'X';
      }

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
        } else if (s === 'FY') {
          faalYanginGoreviYapamaz++;
        }
      }
    });

    // Second pass: Calculate effective faal for percentage
    let effectiveFaal = 0;
    const totalDowntimeDays = bakim + ariza;

    visibleDates.forEach((date, idx) => {
      const isPastOrToday = todayIndex === -1 ? (date <= currentTime) : (idx <= todayIndex);
      const dateStrKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      let s = activity.dailyStatuses[dateStrKey];
      
      if (isPastOrToday && (s === undefined || s === '') && firstStatusDate && date < firstStatusDate) {
        s = 'X';
      }

      if (isPastOrToday) {
        if (s === 'F' || s === 'FY') {
          effectiveFaal++;
        } else if (s && !['X', ''].includes(s)) {
          // Rule: Downtime is ignored for activity rate if:
          // 1. It is NOT part of a 3D+ streak 
          // 2. AND the total downtime in this report is < 3 days
          const streakLen = getStreakLengthAt(dateStrKey, date);
          if (streakLen < 3 && totalDowntimeDays < 3) {
            effectiveFaal++;
          }
        }
      }
    });

    const totalGFaal = bakim + ariza + olmadi;
    const totalFaal = faal + faalYanginGoreviYapamaz;
    
    const baseDays = daysElapsed - olmadi - missing;
    const percentage = baseDays > 0 ? ((effectiveFaal / baseDays) * 100).toFixed(0) : "0";
    
    return { bakim, ariza, olmadi, faal, totalGFaal, totalFaal, faalYanginGoreviYapamaz, effectiveFaal, percentage, missing };
  };

  // TİP bazlı gruplandırma ve sıralama
  const groupedActivities = useMemo(() => {
    const getOrder = (cagriKodu: string) => {
      const match = String(cagriKodu).match(/ORMAN-(\d+)/i);
      if (match) return parseInt(match[1]);
      return 999;
    };

    if (sortByFaydaliSaat) {
      const getFaydaliVal = (item: AircraftActivity) => {
        const ac = fleet.find(f => f.kuyrukNo.trim().toUpperCase() === item.kuyrukNo.trim().toUpperCase());
        const val = ac?.faydaliSaat ?? (item as any).faydaliSaat;
        if (val === null || val === undefined || val === '') return 999999;
        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
        return isNaN(num) ? 999999 : num;
      };
      const sorted = [...activities].sort((a, b) => getFaydaliVal(a) - getFaydaliVal(b));
      return { 'TÜMÜ': sorted };
    }

    if (sortByCagriKodu) {
      const sorted = [...activities].sort((a, b) => getOrder(a.cagriKodu) - getOrder(b.cagriKodu));
      return { 'TÜMÜ': sorted };
    }

    const groups: { [key: string]: AircraftActivity[] } = {};
    activities.forEach(act => {
      if (!groups[act.tip]) groups[act.tip] = [];
      groups[act.tip].push(act);
    });
    
    // Sıralama: C-650, B-360, Bell-429, AT-802, T-70
    const order = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
    const sortedGroups: { [key: string]: AircraftActivity[] } = {};

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
  }, [activities, fleet, sortByCagriKodu, sortByFaydaliSaat]);

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
              <th rowSpan={2} className="border border-black px-1 py-1 w-[120px] uppercase font-black text-[9px]">HAVA ARACI TİPİ</th>
              <th rowSpan={2} className="border border-black px-1 py-1 w-[100px] uppercase font-black text-[9px]">ÇAĞRI KODU</th>
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
                  <th colSpan={2} className="border border-black bg-[#ffc000] text-black py-0.5 text-[8px] font-black uppercase tracking-tighter" style={{ backgroundColor: '#ffc000', color: '#000000' }}>TOPLAM FAAL</th>
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
                <th className="border border-black bg-[#DCFCE7] text-black w-10 text-[7.5px] py-1 font-black" style={{ backgroundColor: '#DCFCE7', color: '#000000' }}>Faal</th>
                <th className="border border-black bg-[#DCFCE7] text-red-600 w-14 text-[6px] py-0.5 font-black leading-tight" style={{ backgroundColor: '#DCFCE7', color: '#dc2626' }}>Faal Yangın Görevi Yapamaz</th>
              </tr>
            )}
          </thead>
          <tbody>
            {(() => {
              let globalIndex = 0;
              let grandBakim = 0, grandAriza = 0, grandOlmadi = 0, grandTotalGF = 0, grandFaal = 0, grandFaalYanginGoreviYapamaz = 0, grandTotalF = 0, grandEffectiveFaal = 0, grandMissing = 0;
              let grandTotalActs = 0;

              const content = Object.keys(groupedActivities).map((groupName, gIdx) => {
                const groupActs = groupedActivities[groupName];
                let groupBakim = 0, groupAriza = 0, groupOlmadi = 0, groupTotalGF = 0, groupFaal = 0, groupFaalYanginGoreviYapamaz = 0, groupTotalF = 0, groupEffectiveFaal = 0, groupMissing = 0;
                grandTotalActs += groupActs.length;

                const groupRowSpans: number[] = [];
                let idxRow = 0;
                while (idxRow < groupActs.length) {
                  let span = 1;
                  while (idxRow + span < groupActs.length && groupActs[idxRow + span].tip === groupActs[idxRow].tip) {
                    span++;
                  }
                  groupRowSpans.push(span);
                  for (let s = 1; s < span; s++) {
                    groupRowSpans.push(0);
                  }
                  idxRow += span;
                }

                return (
                  <React.Fragment key={gIdx}>
                    {groupActs.map((act, idx) => {
                      globalIndex++;
                      const s = calculateRowStats(act);
                      groupBakim += s.bakim;
                      groupAriza += s.ariza;
                      groupOlmadi += s.olmadi;
                      groupTotalGF += s.totalGFaal;
                      groupFaal += s.faal;
                      groupFaalYanginGoreviYapamaz += s.faalYanginGoreviYapamaz;
                      groupTotalF += s.totalFaal;
                      groupEffectiveFaal += s.effectiveFaal;
                      groupMissing += s.missing;

                      // Accumulate for grand totals
                      grandBakim += s.bakim;
                      grandAriza += s.ariza;
                      grandOlmadi += s.olmadi;
                      grandTotalGF += s.totalGFaal;
                      grandFaal += s.faal;
                      grandFaalYanginGoreviYapamaz += s.faalYanginGoreviYapamaz;
                      grandTotalF += s.totalFaal;
                      grandEffectiveFaal += s.effectiveFaal;
                      grandMissing += s.missing;

                      const showTypeTd = groupRowSpans[idx] > 0;
                      const typeSpan = groupRowSpans[idx];

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
                              if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031', 'OR-2039', 'OR-2040'].includes(tail)) return '(SA)';
                              if (tail === 'OR-2036') return '(DL)';
                              if (tail === 'OR-2038') return '(SL)';
                              if (tail === 'OR-1020') return '(H)';
                              return '';
                            })()}
                          </span>
                        </td>
                        {showTypeTd && (
                          <td rowSpan={typeSpan} className="border border-black text-center px-1 font-bold bg-gray-50 uppercase">
                            {act.tip}
                          </td>
                        )}
                        <td className="border border-black text-center font-bold px-1">{act.cagriKodu}</td>
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
                            let status = act.dailyStatuses[dateStrKey] || '';
                            
                            // Auto-infer 'X' for display if date is before first ever entry
                            const firstKey = Object.keys(act.dailyStatuses).sort()[0];
                            if (status === '' && firstKey && dateStrKey < firstKey) {
                              status = 'X';
                            }

                            const isCompletedToday = act.intraDayCompletions?.[dateStrKey];
                            const hourlyData = act.hourlyStatuses?.[dateStrKey] || {};
                            const hasHourlyData = Object.keys(hourlyData).length > 0;
                            
                            // Bir günün "Karma" (Yıldızlı) olması için ya durum kodu 'K' (Karma) olmalı
                            // ya da saatlik verisi olup gün içinde durum değişikliği yaşanmış olmalı.
                            // Sadece "isCompletedToday" olması yetmez, saatlik verisi yoksa yıldız koymuyoruz.
                            const isKarma = status === 'K' || (isCompletedToday && hasHourlyData);

                            return (
                              <td 
                                key={dIdx} 
                                className={`border border-black text-center text-[10px] relative ${getStatusClass(status, isCompletedToday)} cursor-pointer hover:opacity-80 ${dIdx === todayIndex ? 'bg-red-50/10' : ''}`} 
                                style={getStatusStyle(status, isCompletedToday)}
                                onClick={() => {
                                  if (isKarma) {
                                    setSelectedDayView({ activity: act, date: date });
                                  }
                                }}
                              >
                                {dIdx === todayIndex && (
                                   <div className="absolute inset-y-0 right-[-2px] w-0 border-r-[3.5px] border-dashed border-red-600 z-[50] pointer-events-none" />
                                )}
                                {isKarma ? (
                                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                                     {/* Üst-Sol Başlangıç Durumu (Orange Star) */}
                                     {(() => {
                                       const startStatus = act.intraDayStartStatuses?.[dateStrKey] || 'F';
                                       let startBg = '#DCFCE7'; // F
                                       if (startStatus === 'X') startBg = '#7030A0';
                                       else if (['B','BB','KM','TBU'].includes(startStatus)) startBg = '#FFFF00';
                                       else if (['A','PB','KK'].includes(startStatus)) startBg = '#FF0000';
                                       else if (startStatus === 'TB') startBg = '#40E0D0';
                                       
                                       return (
                                         <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', backgroundColor: startBg }}>
                                            <span className="absolute top-[0px] left-[1px] font-black text-[15px] leading-tight drop-shadow-sm" style={{ color: '#FFA500' }}>★</span>
                                         </div>
                                       );
                                     })()}
                                     
                                     {/* Alt-Sağ Son Durum (Kırmızı/Sarı vb) */}
                                     {(() => {
                                       const hourlyData = act.hourlyStatuses?.[dateStrKey] || {};
                                       const hStatuses = Object.values(hourlyData) as string[];
                                       const startStatus = act.intraDayStartStatuses?.[dateStrKey] || 'F';
                                       
                                       // Find a status different from start status to represent the second half
                                       const otherStatus = hStatuses.find(sh => sh !== startStatus) || status;
                                       
                                       const isMaintenance = ['B','BB','KM','TBU'].includes(otherStatus);
                                       const isOlmadi = otherStatus === 'X';
                                       const isKM = otherStatus === 'KM';
                                       
                                       let bg = '#FF0000'; // Default Ariza
                                       let fg = '#FFFFFF';
                                       let label = 'A';

                                       if (isMaintenance) {
                                         bg = '#FFFF00';
                                         fg = '#000000';
                                         label = isKM ? 'KM' : 'B';
                                       } else if (isOlmadi) {
                                         bg = '#7030A0';
                                         fg = '#FFFFFF';
                                         label = 'X';
                                       } else if (otherStatus === 'F') {
                                         bg = '#DCFCE7';
                                         fg = '#000000';
                                         label = ''; // Faal ise boş kalsın veya F yazılsın
                                       } else if (otherStatus === 'FY') {
                                         bg = '#DCFCE7';
                                         fg = '#dc2626';
                                         label = 'FY';
                                       } else if (otherStatus === 'TB') {
                                         bg = '#40E0D0';
                                         fg = '#000000';
                                         label = 'TB';
                                       }
                                       
                                       return (
                                         <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', backgroundColor: bg, color: fg }}>
                                            <span className="absolute bottom-[1px] right-[2px] font-black text-[9px] leading-none">{label}</span>
                                         </div>
                                       );
                                     })()}
                                  </div>
                                ) : status === 'FY' ? (
                                  <div className="absolute inset-0 w-full h-full min-h-[24px]" style={{ background: 'linear-gradient(135deg, #DCFCE7 50%, #FF0000 50%)' }} />
                                ) : (
                                  <div className="flex items-center justify-center min-h-[24px]">
                                    {status !== 'F' && status}
                                  </div>
                                )}
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
                            <td className="border border-black text-center font-bold bg-[#dcfce7]" style={{ backgroundColor: '#dcfce7' }}>{s.faal || '0'}</td>
                            <td className="border border-black text-center font-bold bg-[#dcfce7] text-red-600" style={{ backgroundColor: '#dcfce7', color: '#dc2626' }}>{s.faalYanginGoreviYapamaz || '0'}</td>
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
                      <td className="border border-black text-center bg-[#dcfce7] text-black font-bold">{groupFaal}</td>
                      <td className="border border-black text-center bg-[#dcfce7] text-red-600 font-bold">{groupFaalYanginGoreviYapamaz}</td>
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

            // GENEL TOPLAM SATIRI
            if (!isHourlyView && activities.length > 0) {
              const grandPercentage = (grandTotalActs * daysElapsed - grandOlmadi - grandMissing) > 0 
                ? ((grandEffectiveFaal) / (grandTotalActs * daysElapsed - grandOlmadi - grandMissing) * 100).toFixed(1) 
                : "0";

              content.push(
                <tr key="grand-total" className="h-8 bg-gray-900 font-black border-t-2 border-black">
                  <td colSpan={4 + totalDaysInRange} className="border border-black text-right px-4 uppercase text-[10px] bg-gray-900 text-white">GENEL TOPLAM (FİLO)</td>
                  <td className="border border-black text-center bg-[#ffff00] text-black">{grandBakim}</td>
                  <td className="border border-black text-center bg-[#ff0000] text-white">{grandAriza}</td>
                  <td className="border border-black text-center bg-[#7030a0] text-white">{grandOlmadi}</td>
                  <td className="border border-black text-center bg-[#00b0f0] text-white">{grandTotalGF}</td>
                  <td className="border border-black text-center bg-[#dcfce7] text-black font-bold">{grandFaal}</td>
                  <td className="border border-black text-center bg-[#dcfce7] text-red-600 font-bold">{grandFaalYanginGoreviYapamaz}</td>
                  <td className="border border-black text-center bg-[#ffc000] text-black">{grandTotalF}</td>
                  <td className="border border-black text-center font-black bg-white text-black">{grandTotalActs * daysElapsed}</td>
                  <td className="border border-black text-center bg-emerald-700 text-white text-[11px]">%{grandPercentage}</td>
                </tr>
              );
            }

            return content;
          })()}
        </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-col px-2 bg-slate-50 p-6 rounded-3xl border border-slate-200">
        <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest border-l-4 border-slate-800 pl-4">AÇIKLAMALAR VE KISALTMALAR</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Maintenance (SARI) */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#ffff00] border-2 border-black flex items-center justify-center text-[11px] font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">B</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">B: BAKIM</div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#ffff00] border-2 border-black flex items-center justify-center text-[10px] font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">BB</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">BB: BAKIM BEKLER</div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#ffff00] border-2 border-black flex items-center justify-center text-[8px] font-black leading-tight shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform text-center">TBU</div>
              <div className="text-[10px] font-black text-slate-700 uppercase leading-none">TBU: TEKNİK BÜLTEN<br/>UYGULAMASI</div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#ffff00] border-2 border-black flex items-center justify-center text-[9px] font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">KM</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">KM: KABUL MUAYENESİ</div>
            </div>
          </div>

          {/* Column 2: Fault/Accident (KIRMIZI) */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#ff0000] border-2 border-black flex items-center justify-center text-[12px] font-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">A</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">A: ARIZA</div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#ff0000] border-2 border-black flex items-center justify-center text-[10px] font-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">PB</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">PB: PARÇA BEKLER</div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#ff0000] border-2 border-black flex items-center justify-center text-[10px] font-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">KK</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">KK: KAZA KIRIM</div>
            </div>
          </div>

          {/* Column 3: Absent/Experience (MOR/TURKUAZ/YEŞİL) */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#7030a0] border-2 border-black flex items-center justify-center text-[12px] font-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">X</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">X: OLMADIĞI GÜNLER</div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#40E0D0] border-2 border-black flex items-center justify-center text-[10px] font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">TB</div>
              <div className="text-[11px] font-black text-slate-700 uppercase">TB: TECRÜBE BEKLER</div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #DCFCE7 50%, #FF0000 50%)' }} />
              <div className="text-[10px] font-black text-slate-700 uppercase leading-tight">
                <span className="text-[#15803d]">FAAL </span>
                <span className="text-[#dc2626]">(YANGIN GÖREVİ YAPAMAZ)</span>
              </div>
            </div>
          </div>

          {/* Column 4: Karma (STAR) */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col">
              <div className="flex items-center space-x-3 group">
                <div className="px-3 h-10 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform min-w-[32px]">
                   <span className="text-[#f97316] text-[24px] font-black leading-none">*</span>
                </div>
                <div className="text-[10px] font-black text-slate-700 uppercase leading-tight">KARMA GÜN<br/>(HEM FAAL HEM GAYRİ FAAL)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="bg-emerald-100/50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
             <p className="text-[11px] font-black text-emerald-900 leading-relaxed uppercase tracking-tight">
               NOT: AYNI GÜN İÇİNDE HEM FAAL HEM GAYRİ FAAL OLAN GÜNLER KÖŞEGENLİ VE TURUNCU YILDIZLI GÖSTERİLİR.
             </p>
          </div>
          <div className="bg-emerald-200/50 border-l-4 border-emerald-600 p-4 rounded-r-xl">
             <p className="text-[11px] font-black text-emerald-950 leading-relaxed uppercase tracking-tight">
               * FAALİYET % HESAPLAMA NOTU: Üst üste 3 gün (veya daha fazla) OLMADIĞI GÜNLER (X) durumunda olan hava araçları, bu süre zarfında hesaplamaya dahil edilmez. Farklı tarihlerde gerçekleşen toplam OLMADIĞI GÜNLER süresi ise hesaplamaya dahil edilir.
             </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
           <p className="text-[12px] font-black text-red-600 text-center uppercase tracking-wider">
             ** 3 GÜNE KADAR OLAN GAYRI FAAL DURUMLAR FAALİYET ORANINA YANSITILMAMIŞTIR.
           </p>
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
