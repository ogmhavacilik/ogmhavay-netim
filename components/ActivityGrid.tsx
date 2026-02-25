
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
  const getDaysInRange = (start: Date) => {
    const dates = [];
    const year = start.getFullYear();
    const month = start.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) dates.push(new Date(year, month, i));
    return dates;
  };

  const visibleDates = getDaysInRange(startDate);
  const totalDaysInMonth = visibleDates.length;

  const getStatusClass = (code: DailyStatusCode) => {
    switch (code) {
      case 'B': case 'BB': case 'KM': return 'bg-[#FFFF00] text-black font-black border-black'; // SARI
      case 'A': case 'PB': case 'KK': return 'bg-[#FF0000] text-white font-black border-black'; // KIRMIZI
      case 'X': return 'bg-[#7030A0] text-white font-black border-black'; // MOR
      case 'F': return 'bg-white text-transparent';
      default: return 'bg-white';
    }
  };

  const calculateRowStats = (activity: AircraftActivity) => {
    let bakim = 0, ariza = 0, olmadi = 0;
    visibleDates.forEach(date => {
      const day = date.getDate();
      const s = activity.dailyStatuses[day] || '';
      if (['B', 'BB', 'KM'].includes(s)) bakim++;
      else if (['A', 'PB', 'KK'].includes(s)) ariza++;
      else if (s === 'X') olmadi++;
    });
    
    const totalGFaal = bakim + ariza + olmadi;
    const totalFaal = totalDaysInMonth - totalGFaal;
    const percentage = totalDaysInMonth > 0 ? ((totalFaal / totalDaysInMonth) * 100).toFixed(0) : "0";
    
    return { bakim, ariza, olmadi, totalGFaal, totalFaal, percentage };
  };

  // TİP bazlı gruplandırma ve sıralama
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: AircraftActivity[] } = {};
    activities.forEach(act => {
      if (!groups[act.tip]) groups[act.tip] = [];
      groups[act.tip].push(act);
    });
    
    // Sıralama: 1-Bell-429, 2-AT-802, 3-T-70
    const order = ['Bell-429', 'AT-802', 'T-70'];
    const sortedGroups: { [key: string]: AircraftActivity[] } = {};
    
    order.forEach(tip => {
      if (groups[tip]) {
        sortedGroups[tip] = groups[tip];
      }
    });
    
    // Diğer tipler varsa sona ekle
    Object.keys(groups).forEach(tip => {
      if (!order.includes(tip)) {
        sortedGroups[tip] = groups[tip];
      }
    });
    
    return sortedGroups;
  }, [activities]);

  if (activities.length === 0) return null;

  return (
    <div className="activity-grid-section bg-white p-2">
      <div className="flex justify-between items-center mb-4 px-2">
         <h3 className="text-4xl font-black text-black tracking-tighter">{title}</h3>
         {onExport && (
            <button onClick={onExport} className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={3}/></svg>
               EXCEL OLARAK İNDİR
            </button>
         )}
      </div>

      <div className="overflow-x-auto">
        <table id="activity-table" className="w-full border-collapse border-[1.5px] border-black text-[10px] bg-white font-sans">
          <thead>
            <tr className="bg-white">
              <th rowSpan={2} className="border border-black px-1 py-1 w-[110px] uppercase font-black text-[9px]">ÇAĞRI KODU</th>
              <th rowSpan={2} className="border border-black px-1 py-1 w-[100px] uppercase font-black text-[9px]">KUYRUK NO</th>
              <th rowSpan={2} className="border border-black px-1 py-1 w-[120px] uppercase font-black text-[9px]">HAVA ARACI TİPİ</th>
              {visibleDates.map((date, idx) => (
                <th key={idx} rowSpan={2} className="border border-black w-8 text-center font-bold min-w-[32px] text-[8px] bg-white h-16">
                   <div className="[writing-mode:vertical-lr] rotate-180 whitespace-nowrap mx-auto">
                     {date.getDate()}.{String(date.getMonth() + 1).padStart(2, '0')}.{date.getFullYear()}
                   </div>
                </th>
              ))}
              <th colSpan={3} className="border border-black bg-[#00b0f0] text-white py-0.5 text-[8px] font-black uppercase tracking-tighter">TOPLAM G.FAAL</th>
              <th rowSpan={2} className="border border-black bg-[#00b0f0] text-white px-0.5 w-12 text-[8px] font-black uppercase leading-tight">TOPLAM<br/>G.FAAL</th>
              <th rowSpan={2} className="border border-black bg-[#ffc000] text-black px-0.5 w-12 text-[8px] font-black uppercase leading-tight">TOPLAM<br/>FAAL</th>
              <th rowSpan={2} className="border border-black bg-gray-100 text-black px-0.5 w-16 text-[8px] font-black uppercase leading-tight">FAALİYET % **</th>
            </tr>
            <tr className="bg-white">
              <th className="border border-black bg-[#ffff00] text-black w-10 text-[7.5px] py-1 font-black">Bakım</th>
              <th className="border border-black bg-[#ff0000] text-white w-10 text-[7.5px] py-1 font-black">Arıza</th>
              <th className="border border-black bg-[#7030a0] text-white w-10 text-[7.5px] py-1 font-black">Olmadığı</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedActivities).map((groupName, gIdx) => {
              const groupActs = groupedActivities[groupName];
              let groupBakim = 0, groupAriza = 0, groupOlmadi = 0, groupTotalGF = 0, groupTotalF = 0;

              return (
                <React.Fragment key={gIdx}>
                  {groupActs.map((act, idx) => {
                    const s = calculateRowStats(act);
                    groupBakim += s.bakim;
                    groupAriza += s.ariza;
                    groupOlmadi += s.olmadi;
                    groupTotalGF += s.totalGFaal;
                    groupTotalF += s.totalFaal;

                    return (
                      <tr key={idx} className="h-7 hover:bg-gray-50">
                        <td className="border border-black text-center font-bold px-1">{act.cagriKodu}</td>
                        <td className="border border-black text-center font-bold px-1">{act.kuyrukNo}</td>
                        <td className="border border-black text-center px-1 font-bold">{act.tip}</td>
                        {visibleDates.map((date, dIdx) => {
                          const status = act.dailyStatuses[date.getDate()] || '';
                          return (
                            <td key={dIdx} className={`border border-black text-center text-[10px] ${getStatusClass(status)}`}>
                              {status === 'F' ? '' : status}
                            </td>
                          );
                        })}
                        <td className="border border-black text-center font-bold bg-[#ffffcc]">{s.bakim || '0'}</td>
                        <td className="border border-black text-center font-bold bg-[#ffcccc]">{s.ariza || '0'}</td>
                        <td className="border border-black text-center font-bold bg-[#e2efda]">{s.olmadi || '0'}</td>
                        <td className="border border-black text-center font-bold bg-[#ddebf7]">{s.totalGFaal}</td>
                        <td className="border border-black text-center font-bold bg-[#fff2cc]">{s.totalFaal}</td>
                        <td className="border border-black text-center font-bold bg-gray-50">{s.percentage}%</td>
                      </tr>
                    );
                  })}
                  {/* GRUP TOPLAMI SATIRI */}
                  <tr className="h-6 bg-gray-100 font-black">
                    <td colSpan={3 + totalDaysInMonth} className="border border-black text-right px-4 uppercase text-[8px]">TOPLAM</td>
                    <td className="border border-black text-center bg-[#ffff00]">{groupBakim}</td>
                    <td className="border border-black text-center bg-[#ff0000] text-white">{groupAriza}</td>
                    <td className="border border-black text-center bg-[#7030a0] text-white">{groupOlmadi}</td>
                    <td className="border border-black text-center bg-[#00b0f0] text-white">{groupTotalGF}</td>
                    <td className="border border-black text-center bg-[#ffc000]">{groupTotalF}</td>
                    <td className="border border-black text-center bg-gray-200">
                      {((groupTotalF / (groupTotalF + groupTotalGF)) * 100).toFixed(0)}%
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* LEJANT ALANI */}
      <div className="mt-6 flex flex-wrap gap-4 px-2">
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
      </div>
    </div>
  );
};

export default ActivityGrid;
