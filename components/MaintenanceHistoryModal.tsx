import React, { useState, useMemo } from 'react';
import { Aircraft, AircraftActivity } from '../types';
import * as XLSX from 'xlsx';
import { cleanDescription } from '../services/cleanUtils';

interface MaintenanceHistoryModalProps {
  aircraft: Aircraft;
  activities: AircraftActivity[];
  envanterLog?: any[];
  onClose: () => void;
}

export interface HistoryRecord {
  id: string;
  type: 'ARIZA' | 'BAKIM';
  startDate: string;
  endDate: string;
  rawStartDate: string;
  rawEndDate: string;
  faaleGecisDate: string;
  durationDays: number;
  statusCodes: string[];
  statusLabels: string[];
  durumAyrintilari: string[];
  descriptions: string[];
  sources: ('Saatlik Veri' | 'Envanter Log' | 'Sistem Kaydı')[];
  isIntraDayOnly?: boolean;
}

const formatDateTR = (dateStr: string) => {
  if (!dateStr) return '-';
  if (dateStr.includes('.')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
};

const getCodeLabel = (code: string) => {
  const c = code.toUpperCase();
  switch (c) {
    case 'A': return 'A - ARIZA';
    case 'PB': return 'PB - PARÇA BEKLER';
    case 'KK': return 'KK - KAZA KIRIM';
    case 'TB': return 'TB - TECRÜBE UÇUŞU';
    case 'B': return 'B - BAKIM';
    case 'BB': return 'BB - BAKIM BEKLER';
    case 'TBU': return 'TBU - TEKNİK BÜLTEN';
    case 'KM': return 'KM - KABUL MUAYENE';
    default: return c;
  }
};

const BAKIM_CODES = ['B', 'BB', 'TBU'];
const ARIZA_CODES = ['A', 'PB', 'KK', 'TB'];

const isBakimText = (text: string) => {
  const t = text.toLocaleUpperCase('tr-TR');
  if (t.includes('KABUL') || t.includes('MUAYENE')) return false; // KM is not maintenance
  return (
    t.includes('BAKIM') ||
    t.includes('BÜLTEN') ||
    t.includes('PERİYODİK') ||
    t.includes('100 SAAT') ||
    t.includes('50 SAAT') ||
    t.includes('TAKVİM')
  );
};

const isArizaText = (text: string) => {
  const t = text.toLocaleUpperCase('tr-TR');
  return (
    t.includes('ARIZA') ||
    t.includes('PARÇA') ||
    t.includes('KAZA') ||
    t.includes('TECRÜBE') ||
    t.includes('ARIZALI') ||
    t.includes('GAYRİ FAAL (ARIZA)')
  );
};

const formatDateToISO = (dateStr: any): string => {
  if (!dateStr && dateStr !== 0) return '';
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return '';
    const y = dateStr.getFullYear();
    const m = String(dateStr.getMonth() + 1).padStart(2, '0');
    const d = String(dateStr.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(dateStr).trim();
  if (!s || s === '-') return '';
  if (s.includes('T')) {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dt.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  if (s.includes('-') || s.includes('.') || s.includes('/')) {
    const parts = s.split(/[- ./:]/).filter(Boolean);
    if (parts.length >= 3) {
      if (parts[0].length === 4) { // YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) { // DD-MM-YYYY or MM-DD-YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }
  return s;
};

const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({
  aircraft,
  activities,
  envanterLog = [],
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'ariza' | 'bakim'>('ariza');
  const [searchTerm, setSearchTerm] = useState('');

  const { arizaRecords, bakimRecords } = useMemo(() => {
    const kNo = aircraft.kuyrukNo.trim().toUpperCase();
    const activity = activities.find(a => a.kuyrukNo.trim().toUpperCase() === kNo);

    const dailyStatuses = activity?.dailyStatuses || {};
    const hourlyStatuses = activity?.hourlyStatuses || {};
    const hourlyDescriptions = activity?.hourlyDescriptions || {};
    const intraDayEvents = activity?.intraDayEvents || {};

    // Filter envanter logs for this aircraft
    const aircraftEnvLogs = envanterLog.filter(e => {
      const eK = String(e.kuyrukNo || e['Kuyruk No'] || e.tailNumber || '').trim().toUpperCase();
      return eK === kNo;
    });

    // Map of date => envanter log entry list
    const envLogByDate: Record<string, any[]> = {};
    aircraftEnvLogs.forEach(entry => {
      const rawDate = entry.tarih || entry.Tarih || entry.DATE || entry.date || '';
      const isoDate = formatDateToISO(rawDate);
      if (isoDate) {
        if (!envLogByDate[isoDate]) envLogByDate[isoDate] = [];
        envLogByDate[isoDate].push(entry);
      }
    });

    // Collect all unique dates YYYY-MM-DD
    const dateSet = new Set<string>();
    Object.keys(dailyStatuses).forEach(d => {
      const iso = formatDateToISO(d);
      if (iso) dateSet.add(iso);
    });
    Object.keys(hourlyStatuses).forEach(d => {
      const iso = formatDateToISO(d);
      if (iso) dateSet.add(iso);
    });
    Object.keys(intraDayEvents).forEach(d => {
      const iso = formatDateToISO(d);
      if (iso) dateSet.add(iso);
    });
    Object.keys(envLogByDate).forEach(d => {
      const iso = formatDateToISO(d);
      if (iso) dateSet.add(iso);
    });

    // Today's date
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    dateSet.add(todayStr);

    const sortedDates = Array.from(dateSet).sort(); // Ascending Order: oldest to newest

    const getDayInfo = (dStr: string) => {
      const dayCodes = new Set<string>();
      const durumAyrintilariSet = new Set<string>();
      const descriptionsSet = new Set<string>();
      const sourcesSet = new Set<'Saatlik Veri' | 'Envanter Log' | 'Sistem Kaydı'>();

      // 1. Daily status code
      const dailyCode = dailyStatuses[dStr];
      if (dailyCode) dayCodes.add(dailyCode.toUpperCase());

      // 2. Hourly status codes & descriptions
      if (hourlyStatuses[dStr]) {
        Object.values(hourlyStatuses[dStr]).forEach(st => {
          if (st) {
            dayCodes.add(String(st).toUpperCase());
            sourcesSet.add('Saatlik Veri');
          }
        });
      }
      if (hourlyDescriptions[dStr]) {
        Object.values(hourlyDescriptions[dStr]).forEach(desc => {
          const descCleaned = cleanDescription(desc);
          if (descCleaned) {
            descriptionsSet.add(descCleaned);
            sourcesSet.add('Saatlik Veri');
          }
        });
      }

      // 3. IntraDay Events
      if (intraDayEvents[dStr] && Array.isArray(intraDayEvents[dStr])) {
        intraDayEvents[dStr].forEach((ev: any) => {
          if (ev.status) dayCodes.add(String(ev.status).toUpperCase());
          if (ev.desc) {
            const dCleaned = cleanDescription(ev.desc);
            if (dCleaned) descriptionsSet.add(dCleaned);
          }
          sourcesSet.add('Saatlik Veri');
        });
      }

      // 4. Envanter log entries
      const envList = envLogByDate[dStr] || [];
      envList.forEach(envEntry => {
        sourcesSet.add('Envanter Log');
        const dt = String(envEntry.durumAyrintisi || envEntry['Durum Ayrıntısı'] || envEntry.durum || '').trim();
        const cleanedDt = cleanDescription(dt);
        if (cleanedDt) {
          durumAyrintilariSet.add(cleanedDt);
        }
        const rawAc = String(envEntry.aciklama || envEntry['Açıklama'] || '').trim();
        const ac = cleanDescription(rawAc);
        if (ac) {
          descriptionsSet.add(ac);
        }
      });

      // 5. System record for today
      if (dStr === todayStr) {
        if (aircraft.durum !== 'FAAL') {
          sourcesSet.add('Sistem Kaydı');
          const cleanedDt = cleanDescription(aircraft.durumAyrintisi);
          if (cleanedDt) {
            durumAyrintilariSet.add(cleanedDt);
          }
          const cleanedAc = cleanDescription(aircraft.aciklama);
          if (cleanedAc) {
            descriptionsSet.add(cleanedAc);
          }
        } else if (dayCodes.size === 0) {
          dayCodes.add('F');
        }
      }

      // Determine category for the day
      let hasBakim = false;
      let hasAriza = false;

      dayCodes.forEach(c => {
        if (BAKIM_CODES.includes(c)) hasBakim = true;
        if (ARIZA_CODES.includes(c)) hasAriza = true;
      });

      // If the aircraft status is FAAL ('F' or 'FAAL'), Kabul Muayene ('KM'), 'X', or empty,
      // and there are no explicit BAKIM or ARIZA status codes,
      // then notes/descriptions and envanter log comments MUST NOT convert it into a Bakım or Arıza event.
      const isFaalOrKmOrEmpty = (dayCodes.has('F') || dayCodes.has('FAAL') || dayCodes.has('KM') || dayCodes.size === 0) && !hasBakim && !hasAriza;

      if (!isFaalOrKmOrEmpty) {
        durumAyrintilariSet.forEach(t => {
          if (isBakimText(t)) hasBakim = true;
          if (isArizaText(t)) hasAriza = true;
        });
      }

      let primaryCategory: 'ARIZA' | 'BAKIM' | 'FAAL' = 'FAAL';
      if (hasBakim && !hasAriza) {
        primaryCategory = 'BAKIM';
      } else if (hasAriza && !hasBakim) {
        primaryCategory = 'ARIZA';
      } else if (hasBakim && hasAriza) {
        // If both present, pick based on codes or default to ARIZA
        primaryCategory = Array.from(dayCodes).some(c => ARIZA_CODES.includes(c)) ? 'ARIZA' : 'BAKIM';
      }

      // Is intra-day event? (e.g. dailyCode is 'F', but hourly codes had maintenance/fault)
      const isIntraDay = (dailyCode === 'F' || !dailyCode) && (hasBakim || hasAriza);

      return {
        codes: Array.from(dayCodes),
        durumAyrintilari: Array.from(durumAyrintilariSet),
        descriptions: Array.from(descriptionsSet),
        sources: Array.from(sourcesSet),
        category: primaryCategory,
        isIntraDay
      };
    };

    const aRecords: HistoryRecord[] = [];
    const bRecords: HistoryRecord[] = [];

    let currentBlock: {
      type: 'ARIZA' | 'BAKIM';
      dates: string[];
      codes: Set<string>;
      durumAyrintilari: Set<string>;
      descriptions: Set<string>;
      sources: Set<'Saatlik Veri' | 'Envanter Log' | 'Sistem Kaydı'>;
      hasIntraDayOnly: boolean;
    } | null = null;

    for (let i = 0; i < sortedDates.length; i++) {
      const dStr = sortedDates[i];
      const info = getDayInfo(dStr);

      if (info.category === 'ARIZA' || info.category === 'BAKIM') {
        if (currentBlock && currentBlock.type === info.category) {
          currentBlock.dates.push(dStr);
          info.codes.forEach(c => currentBlock!.codes.add(c));
          info.durumAyrintilari.forEach(da => currentBlock!.durumAyrintilari.add(da));
          info.descriptions.forEach(desc => currentBlock!.descriptions.add(desc));
          info.sources.forEach(src => currentBlock!.sources.add(src));
        } else {
          if (currentBlock) {
            finalizeBlock(currentBlock);
          }
          currentBlock = {
            type: info.category,
            dates: [dStr],
            codes: new Set(info.codes),
            durumAyrintilari: new Set(info.durumAyrintilari),
            descriptions: new Set(info.descriptions),
            sources: new Set(info.sources),
            hasIntraDayOnly: info.isIntraDay
          };
        }
      } else {
        if (currentBlock) {
          finalizeBlock(currentBlock);
          currentBlock = null;
        }
      }
    }

    if (currentBlock) {
      finalizeBlock(currentBlock);
    }

    function finalizeBlock(block: {
      type: 'ARIZA' | 'BAKIM';
      dates: string[];
      codes: Set<string>;
      durumAyrintilari: Set<string>;
      descriptions: Set<string>;
      sources: Set<'Saatlik Veri' | 'Envanter Log' | 'Sistem Kaydı'>;
      hasIntraDayOnly: boolean;
    }) {
      const startDate = block.dates[0];
      const endDate = block.dates[block.dates.length - 1];

      const lastDateIndex = sortedDates.indexOf(endDate);
      let faaleGecisDate = 'Devam Ediyor';

      if (block.hasIntraDayOnly && block.dates.length === 1) {
        const dStr = block.dates[0];
        const events = intraDayEvents[dStr] || [];
        if (events.length >= 2) {
          const downEv = events.find((e: any) => e.type === 'down' || (e.status && e.status !== 'F'));
          const upEv = events.find((e: any) => e.type === 'up' || e.status === 'F');
          if (downEv && upEv && events.length === 2) {
            const startMins = ((downEv.hour !== undefined ? downEv.hour : 0) * 60) + (downEv.exactMins || 0);
            const endMins = ((upEv.hour !== undefined ? upEv.hour : 0) * 60) + (upEv.exactMins || 0);
            const diffMins = endMins - startMins;
            if (diffMins > 0) {
              const hrs = Math.floor(diffMins / 60);
              const mins = diffMins % 60;
              const durStr = hrs > 0 ? `${hrs} Sa ${mins > 0 ? `${mins} Dk` : ''}` : `${mins} Dk`;
              faaleGecisDate = `${formatDateTR(endDate)} (Gün İçi FAAL - Süre: ${durStr})`;
            } else {
              faaleGecisDate = `${formatDateTR(endDate)} (Gün İçi FAAL)`;
            }
          } else if (events.length > 2) {
            faaleGecisDate = `${formatDateTR(endDate)} (Gün İçi FAAL - Çoklu Değişim)`;
          } else {
            faaleGecisDate = `${formatDateTR(endDate)} (Gün İçi FAAL)`;
          }
        } else {
          faaleGecisDate = `${formatDateTR(endDate)} (Gün İçi FAAL)`;
        }
      } else if (lastDateIndex !== -1 && lastDateIndex < sortedDates.length - 1) {
        const nextDate = sortedDates[lastDateIndex + 1];
        const nextInfo = getDayInfo(nextDate);
        if (nextInfo.category === 'FAAL') {
          faaleGecisDate = `${formatDateTR(nextDate)} (FAAL)`;
        } else if (endDate === todayStr) {
          faaleGecisDate = 'Devam Ediyor';
        } else {
          faaleGecisDate = `${formatDateTR(nextDate)}`;
        }
      } else if (endDate === todayStr && aircraft.durum !== 'FAAL') {
        faaleGecisDate = 'Devam Ediyor';
      }

      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const statusCodes = Array.from(block.codes).filter(c => c !== 'F' && c !== 'FAAL' && c !== 'KM');
      const statusLabels = statusCodes.length > 0
        ? statusCodes.map(getCodeLabel)
        : [block.type === 'ARIZA' ? 'A - ARIZA' : 'B - BAKIM'];

      const record: HistoryRecord = {
        id: `${block.type}_${startDate}_${endDate}`,
        type: block.type,
        startDate: formatDateTR(startDate),
        endDate: formatDateTR(endDate),
        rawStartDate: startDate,
        rawEndDate: endDate,
        faaleGecisDate,
        durationDays,
        statusCodes,
        statusLabels,
        durumAyrintilari: Array.from(block.durumAyrintilari),
        descriptions: Array.from(block.descriptions),
        sources: Array.from(block.sources),
        isIntraDayOnly: block.hasIntraDayOnly
      };

      if (block.type === 'ARIZA') {
        aRecords.push(record);
      } else {
        bRecords.push(record);
      }
    }

    // Return newest first
    aRecords.reverse();
    bRecords.reverse();

    return { arizaRecords: aRecords, bakimRecords: bRecords };
  }, [aircraft, activities, envanterLog]);

  const currentRecords = activeTab === 'ariza' ? arizaRecords : bakimRecords;

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return currentRecords;
    const term = searchTerm.toLocaleLowerCase('tr-TR');
    return currentRecords.filter(r => {
      return (
        r.startDate.includes(term) ||
        r.endDate.includes(term) ||
        r.faaleGecisDate.toLocaleLowerCase('tr-TR').includes(term) ||
        r.statusLabels.some(l => l.toLocaleLowerCase('tr-TR').includes(term)) ||
        r.durumAyrintilari.some(da => da.toLocaleLowerCase('tr-TR').includes(term)) ||
        r.descriptions.some(d => d.toLocaleLowerCase('tr-TR').includes(term))
      );
    });
  }, [currentRecords, searchTerm]);

  const handleExportExcel = () => {
    const exportData = currentRecords.map((r, idx) => ({
      'Sıra No': idx + 1,
      'Hava Aracı': aircraft.kuyrukNo,
      'Tür': r.type,
      'Başlangıç Tarihi': r.startDate,
      'Bitiş Tarihi': r.endDate,
      'Faale Geçiş / Çıkış Tarihi': r.faaleGecisDate,
      'Toplam Süre (Gün)': r.durationDays,
      'Durum Kodları': r.statusLabels.join(', ') || '-',
      'Durum Ayrıntıları': r.durumAyrintilari.join(' | ') || '-',
      'Veri Kaynağı': r.sources.join(', ') || '-',
      'Açıklamalar / Detaylar': r.descriptions.join(' | ') || 'Açıklama yok'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab === 'ariza' ? 'Arıza' : 'Bakım'} Geçmişi`);
    XLSX.writeFile(wb, `${aircraft.kuyrukNo}_${activeTab === 'ariza' ? 'Ariza' : 'Bakim'}_Gecmisi.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6">
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border border-emerald-900/20">
        
        {/* Header */}
        <div className="bg-[#1b5e20] text-white p-5 flex justify-between items-center shrink-0 border-b-4 border-emerald-900/50">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
              <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">{aircraft.kuyrukNo} - ARIZA / BAKIM GEÇMİŞİ</h2>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">ENVANTER LOG VE SAATLİK FAALİYET HARMANLANMIŞ KAYITLARI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
            <svg className="w-7 h-7 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation & Controls */}
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          
          {/* Tab buttons */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ariza')}
              className={`flex-1 md:flex-initial px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border ${
                activeTab === 'ariza'
                  ? 'bg-red-600 text-white border-red-700 shadow-md scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block animate-pulse"></span>
              <span>ARIZA GEÇMİŞİ</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
                {arizaRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bakim')}
              className={`flex-1 md:flex-initial px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border ${
                activeTab === 'bakim'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block"></span>
              <span>BAKIM GEÇMİŞİ</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
                {bakimRecords.length}
              </span>
            </button>
          </div>

          {/* Search and Excel button */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Tarih, detay veya açıklama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 transition-all shadow-sm w-full md:w-64"
            />
            <button
              onClick={handleExportExcel}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm shrink-0 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>EXCEL İNDİR</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-gray-50 space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-black text-sm uppercase italic">
                KAYIT BULUNAMADI ({activeTab === 'ariza' ? 'ARIZA' : 'BAKIM'})
              </p>
            </div>
          ) : (
            filteredRecords.map((record, index) => (
              <div
                key={record.id || index}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Top border color indicator */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    record.type === 'ARIZA' ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                  {/* Dates & Duration */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {record.type === 'ARIZA' ? 'ARIZA PERİYODU' : 'BAKIM PERİYODU'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-700">
                        {record.isIntraDayOnly ? 'GÜN İÇİ / SAATLİK' : `${record.durationDays} GÜN SÜRDÜ`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-lg font-black text-gray-900 tracking-tight">
                      <span>{record.startDate}</span>
                      <span className="text-gray-400">➔</span>
                      <span>{record.endDate}</span>
                    </div>
                  </div>

                  {/* Return to FAAL / Exit Date */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex flex-col items-start md:items-end">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                      BAKIM / ARIZA ÇIKIŞ (FAAL'E GEÇİŞ)
                    </span>
                    <span className="text-sm font-black text-emerald-950">
                      {record.faaleGecisDate}
                    </span>
                  </div>
                </div>

                {/* Status Badges & Sources */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {record.statusLabels.map((lbl, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                        record.type === 'ARIZA'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {lbl}
                    </span>
                  ))}

                  {record.sources.map((src, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200"
                    >
                      Kaynak: {src}
                    </span>
                  ))}
                </div>

                {/* Durum Ayrıntıları (Status Details if available) */}
                {record.durumAyrintilari.length > 0 && (
                  <div className="mt-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 mb-2">
                    <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      DURUM AYRINTILARI / TANIMLARI
                    </div>
                    <div className="space-y-1">
                      {record.durumAyrintilari.map((da, i) => (
                        <div key={i} className="text-xs font-bold text-amber-950 flex items-start">
                          <span className="mr-1.5 text-amber-600">■</span>
                          <span>{da}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descriptions */}
                <div className="mt-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    AÇIKLAMALAR & NOTLAR
                  </div>

                  {record.descriptions.length > 0 ? (
                    <ul className="space-y-1 text-xs font-medium text-gray-800">
                      {record.descriptions.map((desc, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 text-emerald-600 font-bold">•</span>
                          <span className="leading-relaxed">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-400 italic font-medium">Açıklama kaydı bulunamadı.</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryModal;
