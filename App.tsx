
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AircraftDetailModal from './components/AircraftDetailModal';
import ActivityGrid from './components/ActivityGrid';
import SplashScreen from './components/SplashScreen';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import DataUpdateForm from './components/DataUpdateForm';
import GovdeSorgulaModal from './components/GovdeSorgulaModal';
import { Aircraft, Status, SheetConfig, AppNotification, DailyStatusCode, AircraftActivity } from './types';
import { 
  BELL_SCRIPT_URL, 
  AT802_SCRIPT_URL, 
  T70_SCRIPT_URL, 
  B360_SCRIPT_URL, 
  C650_SCRIPT_URL, 
  LOG_SCRIPT_URL,
  MAIL_LOG_SHEET_ID,
  getCallSignByTail
} from './constants';
import { fetchAircraftDataFromAppsScript, fetchOPLData, formatToHHMM, parseSingleCellToHour, proxyFetch } from './services/sheetService';
import { exportAT802DailyStatusToPDF, exportOPLToPDF, exportAT802CiktiPDF } from './services/pdfService';
import { exportTableToMHTML } from './services/mhtmlService';
import { MOCK_ACTIVITY_GRID } from './constants';
import { generateFleetExcelHtml, exportTableToExcel } from './src/services/excelService';
import { X, Download, Activity, Clock } from 'lucide-react';
import { safeStorage } from './services/safeStorage';

const parseTimeToMinutes = (timeStr: string) => {
  if (!timeStr || timeStr === '-' || timeStr === 'undefined') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 1) return null;
  const h = parseInt(parts[0]);
  if (isNaN(h)) return null;
  const m = parts.length >= 2 ? parseInt(parts[1]) : 0;
  return h * 60 + (isNaN(m) ? 0 : m);
};

const App = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(() => {
    return !safeStorage.getItem('redirect_view');
  });
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'update'>(() => {
    return (safeStorage.getItem('redirect_view') as any) || 'landing';
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'checking' | 'updated' | 'no-change' | 'error'>('idle');
  const lastSyncSignatureRef = useRef<string>('');
  
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [activities, setActivities] = useState<AircraftActivity[]>([]);
  
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [oplCheckStatus, setOplCheckStatus] = useState<Record<string, 'pending' | 'checking' | 'done'>>({});
  
  const [filterType, setFilterType] = useState(() => {
    return safeStorage.getItem('redirect_filter') || 'Tümü';
  });
  const [filterTail, setFilterTail] = useState('');
  
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [filterStartDate, setFilterStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });

  const [filterEndDate, setFilterEndDate] = useState(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  });

  const [hideKazaKirim, setHideKazaKirim] = useState(true);
  const [sortByCagriKodu, setSortByCagriKodu] = useState(false);

  const [historicalFleet, setHistoricalFleet] = useState<Aircraft[] | null>(null);
  const [envanterLog, setEnvanterLog] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isGovdeSorguOpen, setIsGovdeSorguOpen] = useState(false);
  const [isFetchingActivities, setIsFetchingActivities] = useState(false);

  const [showIntraDayModal, setShowIntraDayModal] = useState(false);
  const [selectedAircraftForIntraDay, setSelectedAircraftForIntraDay] = useState<Aircraft | null>(null);
  const [intraDayStartTime, setIntraDayStartTime] = useState('');
  const [intraDayEndTime, setIntraDayEndTime] = useState('');
  const [intraDayStatus, setIntraDayStatus] = useState<DailyStatusCode>('F');
  const [intraDayDescription, setIntraDayDescription] = useState('');
  const [isSavingIntraDay, setIsSavingIntraDay] = useState(false);

  const handleSaveIntraDay = async (data: {
    kuyrukNo: string;
    tip: string;
    startTime: string;
    endTime: string;
    status: DailyStatusCode;
    description: string;
    date?: string;
  }) => {
    setIsSavingIntraDay(true);
    try {
      const result = await proxyFetch(LOG_SCRIPT_URL, {
        action: 'saveIntraDayActivity',
        sheetId: MAIL_LOG_SHEET_ID,
        data: {
          ...data,
          date: data.date || new Date().toISOString().split('T')[0]
        }
      });
      
      if (result && result.success) {
        fetchPastLogs(); // Refresh activity data
        return true;
      } else {
        console.error("Kayıt sırasında bir hata oluştu.", result);
        return false;
      }
    } catch (error) {
      console.error('Error saving intra-day activity:', error);
      return false;
    } finally {
      setIsSavingIntraDay(false);
    }
  };

  const handleUpdateLocalState = useCallback((
    kuyrukNo: string,
    islemTarihi: string,
    updates: {
      govdeUcusSaati?: string;
      faydaliSaat?: string;
      konum?: string;
      durum?: string;
      durumAyrintisi?: string;
      aciklama?: string;
      assignedCode?: string;
      bakim50H?: string;
      bakimTakvim?: string;
      bakim40H?: string;
      bakim120H?: string;
      bakim480H?: string;
      bakimTakvimTarih?: string;
      bakim200H?: string;
    },
    isPastDate: boolean
  ) => {
    const searchKNoClean = kuyrukNo.trim().toUpperCase();

    if (!isPastDate) {
      setFleet(prevFleet => {
        return prevFleet.map(a => {
          if (String(a.kuyrukNo).trim().toUpperCase() === searchKNoClean) {
            const updatedAc = { ...a };
            if (updates.govdeUcusSaati !== undefined) {
              const parsedVal = parseSingleCellToHour(updates.govdeUcusSaati, a.tip);
              if (parsedVal !== null) {
                updatedAc.govdeUcusSaati = updates.govdeUcusSaati;
              }
            }
            if (updates.faydaliSaat !== undefined) {
              const numVal = parseFloat(String(updates.faydaliSaat).replace(',', '.'));
              updatedAc.faydaliSaat = !isNaN(numVal) ? numVal : undefined;
            }
            if (updates.konum !== undefined) updatedAc.konum = updates.konum;
            if (updates.durum !== undefined) updatedAc.durum = updates.durum;
            if (updates.durumAyrintisi !== undefined) updatedAc.durumAyrintisi = updates.durumAyrintisi;
            if (updates.aciklama !== undefined) updatedAc.aciklama = updates.aciklama;
            if (updates.assignedCode !== undefined) updatedAc.assignedCode = updates.assignedCode;
            
            if (updates.bakim50H !== undefined) updatedAc.bakim50H = updates.bakim50H;
            if (updates.bakimTakvim !== undefined) updatedAc.bakimTakvim = updates.bakimTakvim;
            if (updates.bakim40H !== undefined) updatedAc.bakim40H = updates.bakim40H;
            if (updates.bakim120H !== undefined) updatedAc.bakim120H = updates.bakim120H;
            if (updates.bakim480H !== undefined) updatedAc.bakim480H = updates.bakim480H;
            if (updates.bakimTakvimTarih !== undefined) updatedAc.bakimTakvimTarih = updates.bakimTakvimTarih;
            if (updates.bakim200H !== undefined) updatedAc.bakim200H = updates.bakim200H;

            return updatedAc;
          }
          return a;
        });
      });
    }

    setEnvanterLog(prevLogs => {
      let updatedLogs = [...prevLogs];
      const index = updatedLogs.findIndex(log => {
        const logK = String(log.kuyrukNo || "").trim().toUpperCase();
        let logT = String(log.tarih || "").trim();
        if (logT.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const parts = logT.split('.');
          logT = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return logK === searchKNoClean && logT === islemTarihi;
      });

      const entryHours = updates.govdeUcusSaati !== undefined ? updates.govdeUcusSaati : "";
      const parsedFaydali = updates.faydaliSaat !== undefined ? parseFloat(String(updates.faydaliSaat).replace(',', '.')) : NaN;

      if (index !== -1) {
        updatedLogs[index] = {
          ...updatedLogs[index],
          ...(updates.govdeUcusSaati !== undefined ? { govdeUcusSaati: entryHours } : {}),
          ...(updates.faydaliSaat !== undefined ? { faydaliSaat: !isNaN(parsedFaydali) ? parsedFaydali : '' } : {}),
          ...(updates.konum !== undefined ? { konum: updates.konum } : {}),
          ...(updates.durum !== undefined ? { durum: updates.durum } : {}),
          ...(updates.durumAyrintisi !== undefined ? { durumAyrintisi: updates.durumAyrintisi } : {}),
          ...(updates.aciklama !== undefined ? { aciklama: updates.aciklama } : {})
        };
      } else {
        const targetTip = fleet.find(a => String(a.kuyrukNo).trim().toUpperCase() === searchKNoClean)?.tip || "";
        updatedLogs.push({
          kuyrukNo,
          tarih: islemTarihi,
          tip: targetTip,
          govdeUcusSaati: entryHours,
          faydaliSaat: !isNaN(parsedFaydali) ? parsedFaydali : '',
          konum: updates.konum || '',
          durum: updates.durum || 'FAAL',
          durumAyrintisi: updates.durumAyrintisi || '-',
          aciklama: updates.aciklama || 'GERİYE DÖNÜK GİRİŞ'
        });
      }

      const targetTip = fleet.find(a => String(a.kuyrukNo).trim().toUpperCase() === searchKNoClean)?.tip || "";
      if (updates.govdeUcusSaati !== undefined && targetTip) {
        const newHoursVal = parseSingleCellToHour(updates.govdeUcusSaati, targetTip) || 0;

        updatedLogs = updatedLogs.map(item => {
          if (String(item.kuyrukNo).trim().toUpperCase() === searchKNoClean && item.tarih > islemTarihi) {
            const rowHoursVal = parseSingleCellToHour(item.govdeUcusSaati, targetTip) || 0;
            if (rowHoursVal < newHoursVal) {
              return {
                ...item,
                govdeUcusSaati: updates.govdeUcusSaati
              };
            }
          }
          return item;
        });
      }

      return updatedLogs;
    });
  }, [fleet]);

  const [authenticatedTypes, setAuthenticatedTypes] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<{ type: string, action: () => void } | null>(null);
  const [authError, setAuthError] = useState('');

  const requireAuth = (aircraftType: string, action: () => void) => {
    if (authenticatedTypes.includes(aircraftType)) {
      action();
    } else {
      setPendingAction({ type: aircraftType, action });
      setAuthError('');
    }
  };

  const handleTypeAuth = (password: string) => {
    if (!pendingAction) return;
    
    const type = pendingAction.type;
    const validPasswords: Record<string, string> = {
      'AT-802': '802',
      'Bell-429': '429',
      'T-70': '70',
      'C-650': '650',
      'B-360': '360'
    };

    if (validPasswords[type] === password) {
      setAuthenticatedTypes(prev => [...prev, type]);
      pendingAction.action();
      setPendingAction(null);
    } else {
      setAuthError('Hatalı Şifre');
    }
  };

  const initialSyncDone = useRef(false);

  const SHEET_CONFIGS: SheetConfig[] = [
    {
      aircraftType: 'Bell-429',
      sheetId: '1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ',
      appsScriptUrl: BELL_SCRIPT_URL,
      mapping: { 
        kuyrukNo: 'A3:A8', 
        govdeSN: 'B3:B8',
        motor1SN: 'C3:C8',
        motor2SN: 'D3:D8',
        govdeUcusSaati: 'E3:E8',
        motor1UcusSaati: 'F3:F8',
        motor2UcusSaati: 'G3:G8',
        bakim50H: 'H3:H8',
        faydaliSaat: 'I3:I8', 
        bakimTakvim: 'J3:J8',
        konum: 'L3:L8', 
        durum: 'M3:M8', 
        durumAyrintisi: 'N3:N8', 
        aciklama: 'O3:O8',
      }
    },
    {
      aircraftType: 'AT-802',
      sheetId: '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4',
      sheetName: 'GÜNLÜK DURUM',
      appsScriptUrl: AT802_SCRIPT_URL,
      mapping: { 
        kuyrukNo: 'B3:B18', 
        durum: 'C3:C18', 
        durumAyrintisi: 'D3:D18', 
        konum: 'E3:E18', 
        faydaliSaat: 'V3:AI18', 
        govdeUcusSaati: 'F3:F18',
        aciklama: 'AL3:AL18',   
        gelisTarihi: 'U24:V45',
        gelisKuyrukNo: 'T24:T45',
        bakimTakvimTarih: 'AJ3:AJ18',
        frdsTestDateMain: 'M3:M18',
        frdsTestDateAlt: 'N3:N18'
      }
    },
    {
      aircraftType: 'T-70',
      sheetId: '10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw',
      appsScriptUrl: T70_SCRIPT_URL,
      mapping: {
        kuyrukNo: 'A4:A6',
        govdeSN: 'B4:B6',
        motor1SN: 'C4:C6',
        motor2SN: 'D4:D6',
        govdeUcusSaati: 'E4:E6',
        bakim40H: 'H4:H6',
        bakim120H: 'I4:I6',
        bakim480H: 'J4:J6',
        bakim40HKalan: 'L4:L6',
        bakim120HKalan: 'N4:N6',
        bakim480HKalan: 'O4:O6',
        bakimTakvimTarih: 'K4:K6',
        konum: 'P4:P6',
        durum: 'Q4:Q6',
        durumAyrintisi: 'R4:R6',
        aciklama: 'S4:S6'
      }
    },
    {
      aircraftType: 'B-360',
      sheetId: '1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0',
      appsScriptUrl: B360_SCRIPT_URL,
      mapping: {
        kuyrukNo: 'A3:A10',
        govdeSN: 'B3:B10',
        motor1SN: 'C3:C10',
        motor2SN: 'D3:D10',
        govdeUcusSaati: 'E3:E10',
        landings: 'H3:H10',
        faydaliSaat: 'I3:I10',
        bakim200H: 'J3:J10',
        bakimTakvimTarih: 'K3:K10',
        konum: 'M3:M10',
        durum: 'N3:N10',
        durumAyrintisi: 'O3:O10',
        aciklama: 'P3:P10'
      }
    },
    {
      aircraftType: 'C-650',
      sheetId: '1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE',
      appsScriptUrl: C650_SCRIPT_URL,
      mapping: {
        kuyrukNo: 'A3:A10',
        govdeSN: 'B3:B10',
        motor1SN: 'C3:C10',
        motor2SN: 'D3:D10',
        govdeUcusSaati: 'E3:E10',
        landings: 'H3:H10',
        faydaliSaat: 'I3:I10',
        bakim200H: 'J3:J10',
        bakimTakvimTarih: 'K3:K10',
        konum: 'M3:M10',
        durum: 'N3:N10',
        durumAyrintisi: 'O3:O10',
        aciklama: 'P3:P10'
      }
    }
  ];

  const exportTableToExcel = (tableId: string, filename: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const clonedTable = table.cloneNode(true) as HTMLElement;
    
    if (tableId === 'activity-table') {
      const legendHtml = `
        <tr><td colspan="5"></td></tr>
        <tr><td colspan="5" style="font-weight: bold;">KISALTMALAR</td></tr>
        <tr><td style="background-color: #FFFF00; color: #000000; border: 1px solid black;">B</td><td colspan="4" style="border: 1px solid black;">BAKIM</td></tr>
        <tr><td style="background-color: #FFFF00; color: #000000; border: 1px solid black;">BB</td><td colspan="4" style="border: 1px solid black;">BAKIM BEKLER</td></tr>
        <tr><td style="background-color: #FFFF00; color: #000000; border: 1px solid black;">TBU</td><td colspan="4" style="border: 1px solid black;">TEKNİK BÜLTEN UYGULAMASI</td></tr>
        <tr><td style="background-color: #FFFF00; color: #000000; border: 1px solid black;">KM</td><td colspan="4" style="border: 1px solid black;">KABUL MUAYENESİ</td></tr>
        <tr><td style="background-color: #40E0D0; color: #000000; border: 1px solid black;">TB</td><td colspan="4" style="border: 1px solid black;">TECRÜBE BEKLER</td></tr>
        <tr><td style="background-color: #FF0000; color: #FFFFFF; border: 1px solid black;">A</td><td colspan="4" style="border: 1px solid black;">ARIZA</td></tr>
        <tr><td style="background-color: #FF0000; color: #FFFFFF; border: 1px solid black;">PB</td><td colspan="4" style="border: 1px solid black;">PARÇA BEKLER</td></tr>
        <tr><td style="background-color: #FF0000; color: #FFFFFF; border: 1px solid black;">KK</td><td colspan="4" style="border: 1px solid black;">KAZA KIRIM</td></tr>
        <tr><td style="background-color: #7030A0; color: #FFFFFF; border: 1px solid black;">X</td><td colspan="4" style="border: 1px solid black;">OLMADIĞI GÜNLER</td></tr>
        <tr><td style="background-color: #FFFFFF; color: #f97316; font-weight: bold; font-size: 16px; border: 1px solid black;">*</td><td colspan="4" style="border: 1px solid black;">KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)</td></tr>
        <tr><td colspan="10" style="color: red; font-weight: bold;">** 3 güne kadar olan gayrı faal durumlar faaliyet oranına yansıtılmamıştır.</td></tr>
      `;
      const tbody = clonedTable.querySelector('tbody');
      if (tbody) {
        tbody.insertAdjacentHTML('beforeend', legendHtml);
      }
    }

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid black; text-align: center; vertical-align: middle; }
        </style>
      </head>
      <body>${clonedTable.outerHTML}</body>
      </html>
    `;
    const url = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(html)));
    const link = document.createElement('a');
    link.download = filename + '.xls';
    link.href = url;
    link.click();
  };

  const exportFleetToExcel = () => {
    const isHistorical = historicalFleet !== null;
    const targetDate = new Date(filterDate);
    const dateStr = targetDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fileNameDate = dateStr.replace(/\./g, '-');
    const fileName = isHistorical ? `Envanter_Rapor_${fileNameDate}.xls` : 'ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU.xls';
    
    const html = generateFleetExcelHtml(filteredFleet, dateStr);

    const url = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(html)));
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
  };

  const handleManualOverride = async (kuyrukNo: string, newCode: DailyStatusCode) => {
    const aircraft = fleet.find(a => a.kuyrukNo === kuyrukNo);
    
    setFleet(prev => prev.map(a => a.kuyrukNo === kuyrukNo ? { ...a, assignedCode: newCode } : a));
    const now = new Date();
    const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const displayDateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    
    setActivities(prev => prev.map(act => act.kuyrukNo === kuyrukNo ? {
      ...act,
      dailyStatuses: { ...(act.dailyStatuses || {}), [currentDateStr]: newCode }
    } : act));
    
    // Persist to Google Sheets
    if (LOG_SCRIPT_URL) {
      try {
        console.log(`Sending updateLogEntry for ${kuyrukNo} with code ${newCode} on ${displayDateStr}`);
        const result = await proxyFetch(LOG_SCRIPT_URL, {
          action: 'updateLogEntry',
          sheetId: MAIL_LOG_SHEET_ID,
          kuyrukNo: kuyrukNo,
          date: displayDateStr,
          newCode: newCode,
          tip: aircraft?.tip || '',
          durum: aircraft?.durumAyrintisi || 'MANUEL GÜNCELLEME',
          isManualOverride: true
        });
        console.log("Update log response:", result);
      } catch (err) {
        console.error("Error updating log entry:", err);
      }
    }

    setNotifications(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      platform: 'MANUEL',
      kuyrukNo: kuyrukNo,
      kolon: 'ATAMA KODU',
      oncekiDeger: '-',
      yeniDeger: newCode,
      mesaj: `${kuyrukNo} uçağı için ATAMA KODU verisi manuel olarak "${newCode}" olarak güncellendi.`,
      tarih: new Date().toLocaleTimeString('tr-TR')
    }, ...prev]);
  };

  const handleSyncFromExcel = useCallback((incomingData: Partial<Aircraft>[], platform: string, shouldLog: boolean = false) => {
    if (!incomingData || incomingData.length === 0) return;
    
    const now = new Date();
    const timestamp = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    let discoveredChanges: AppNotification[] = [];

    setFleet(prevFleet => {
      const updatedFleet = [...prevFleet];
      
      incomingData.forEach(incoming => {
        if (!incoming.kuyrukNo) return;
        const incomingKNo = String(incoming.kuyrukNo).trim().toUpperCase();
        
        const existingIdx = updatedFleet.findIndex(a => 
          String(a.kuyrukNo).trim().toUpperCase() === incomingKNo
        );
        const existing = existingIdx !== -1 ? updatedFleet[existingIdx] : null;
        
        if (existing && initialSyncDone.current) {
          ['durum', 'konum', 'durumAyrintisi', 'faydaliSaat', 'govdeUcusSaati', 'aciklama'].forEach(col => {
            const key = col as keyof Aircraft;
            const oldVal = String(existing[key] || '').trim();
            const newVal = String(incoming[key] || '').trim();

            if (oldVal !== newVal) {
              const labelMap: Record<string, string> = {
                'durum': 'DURUM',
                'konum': 'KONUM',
                'durumAyrintisi': 'DURUM AYRINTISI',
                'faydaliSaat': 'FAYDALI SAAT',
                'govdeUcusSaati': 'GÖVDE UÇUŞ SAATİ',
                'aciklama': 'AÇIKLAMA'
              };
              const colLabel = labelMap[col] || col.toUpperCase();
              
              discoveredChanges.push({
                id: Math.random().toString(36).substr(2, 9),
                platform: platform,
                kuyrukNo: existing.kuyrukNo,
                kolon: colLabel,
                oncekiDeger: oldVal, 
                yeniDeger: newVal,
                mesaj: `${existing.kuyrukNo} uçağı için ${colLabel} verisi ${oldVal} → ${newVal} olarak değiştirilmiştir.`,
                tarih: timestamp
              });
            }
          });
        }

        if (existingIdx !== -1) {
          const oldRaw = updatedFleet[existingIdx].govdeUcusSaatiRaw;
          const newRaw = incoming.govdeUcusSaatiRaw;
          
          // Monotonically Increasing Rule: 
          // If the new raw value is smaller than existing, ignore the hour update to prevent 5-second flickering
          const isDecreasing = (oldRaw !== undefined && oldRaw !== null && newRaw !== undefined && newRaw !== null && newRaw < oldRaw - 0.05); // Allow some jitter?
          
          const mergeData = { ...incoming };
          if (isDecreasing) {
            console.warn(`[STABILITY] Blocked decreasing hours for ${incomingKNo}: ${oldRaw} -> ${newRaw}`);
            delete mergeData.govdeUcusSaati;
            delete mergeData.govdeUcusSaatiRaw;
          }

          updatedFleet[existingIdx] = { ...updatedFleet[existingIdx], ...mergeData } as Aircraft;
        } else {
          // Yeni Ekle - Sadece kuyruk no geçerli görünüyorsa (T-70 junk koruması)
          const isJunkT70 = incoming.tip === 'T-70' && !incomingKNo.includes('OR-') && !incomingKNo.includes('10');
          if (!isJunkT70) {
            updatedFleet.push(incoming as Aircraft);
          }
        }

        setActivities(prevActivities => {
          let newActivities = [...prevActivities];
          const existsIdx = newActivities.findIndex(act => act.kuyrukNo === incoming.kuyrukNo);
          const now = new Date();
          const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const newCode = (incoming.assignedCode || 'F') as DailyStatusCode;

          if (existsIdx !== -1) {
            newActivities[existsIdx] = {
              ...newActivities[existsIdx],
              dailyStatuses: { ...(newActivities[existsIdx].dailyStatuses || {}), [currentDateStr]: newCode },
              hourlyStatuses: newActivities[existsIdx].hourlyStatuses || {},
              intraDayCompletions: newActivities[existsIdx].intraDayCompletions || {},
              intraDayDurations: newActivities[existsIdx].intraDayDurations || {}
            };
          } else {
            newActivities.push({
              kuyrukNo: incoming.kuyrukNo || '',
              cagriKodu: incoming.cagriKodu || getCallSignByTail(incoming.kuyrukNo || ''),
              tip: incoming.tip || platform,
              dailyStatuses: { [currentDateStr]: newCode },
              hourlyStatuses: {},
              intraDayCompletions: {},
              intraDayDurations: {}
            });
          }
          return newActivities;
        });
      });

      return updatedFleet;
    });

    // Log to central log if requested - Batching all aircraft in one request
    if (shouldLog && LOG_SCRIPT_URL && incomingData.length > 0) {
      const fleetToLog = incomingData.map(incoming => ({
        kuyrukNo: incoming.kuyrukNo,
        tip: incoming.tip || platform,
        govdeUcusSaati: incoming.govdeUcusSaati || 0,
        faydaliSaat: incoming.faydaliSaat || 0,
        konum: incoming.konum || 'ANKARA',
        durum: incoming.durum || Status.FAAL,
        durumAyrintisi: incoming.durumAyrintisi || '-',
        aciklama: incoming.aciklama || '',
        analizKodu: incoming.assignedCode || 'F'
      }));

      proxyFetch(LOG_SCRIPT_URL, {
        action: 'logAllAircraftActivity',
        sheetId: MAIL_LOG_SHEET_ID,
        fleetData: fleetToLog
      }).catch(err => {
        console.error("Batch sync log error:", err);
      });
    }

    if (discoveredChanges.length > 0) {
      setNotifications(prev => [...discoveredChanges, ...prev].slice(0, 100));
    }
  }, []);

  const fetchPastLogs = async () => {
    if (!LOG_SCRIPT_URL) return Promise.resolve();
    
    try {
      const result = await proxyFetch(LOG_SCRIPT_URL, { 
        action: 'getFaaliyetLog',
        sheetId: MAIL_LOG_SHEET_ID,
        intraDaySheetName: 'Saatlik Faaliyet Günlüğü',
        dailySheetName: 'Envanter Log'
      });
      
      console.log("Past logs result:", result);
      
      // Handle different response structures
      const data = result.data || result;
      const faaliyetLogs = data.faaliyetLog || data.dailyLogs || [];
      const envanterLogs = data.envanterLog || [];
      const intraDayData = data.intraDayLog || data.intraDayLogs || data.hourlyLogs || [];
      
      // Robust duplicate removal and merging
      const logDataMap = new Map<string, any>();
      
      const getUniversalKey = (entry: any) => {
        const k = String(entry.kuyrukNo || entry['Kuyruk No'] || entry.tailNumber || entry.tail || entry.Tail || '').trim().toUpperCase();
        const t = String(entry.tarih || entry.Tarih || entry.date || entry.Date || '').trim();
        if (!k || !t) return null;
        
        let d = -1, m = -1, y = -1;
        if (t.includes('T')) {
          const dt = new Date(t);
          if (!isNaN(dt.getTime())) { d = dt.getUTCDate(); m = dt.getUTCMonth() + 1; y = dt.getUTCFullYear(); }
        } else {
          const p = t.split(/[- ./:]/);
          if (p.length >= 3) {
            if (p[0].length === 4) { y = parseInt(p[0], 10); m = parseInt(p[1], 10); d = parseInt(p[2], 10); }
            else if (p[2].split(" ")[0].length === 4) { d = parseInt(p[0], 10); m = parseInt(p[1], 10); y = parseInt(p[2].split(" ")[0], 10); }
          }
        }
        
        if (d > 0 && m > 0 && y > 0) {
          return `${k}_${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
        return null;
      };

      faaliyetLogs.forEach((f: any) => {
        const key = getUniversalKey(f);
        if (key) {
          const existing = logDataMap.get(key);
          // If we have an existing one, merge only if the new one is 'better' (has more fields)
          if (!existing) {
            logDataMap.set(key, { ...f });
          } else {
            logDataMap.set(key, { ...existing, ...f });
          }
        }
      });

      envanterLogs.forEach((env: any) => {
        const key = getUniversalKey(env);
        if (key) {
          const existing = logDataMap.get(key);
          if (!existing) {
            logDataMap.set(key, { ...env });
          } else {
            // MERGE: envanterLog usually has Govde hours which is high priority
            const merged = { ...existing, ...env };
            // Ensure we keep the best version of values
            if (!merged.govdeUcusSaati || merged.govdeUcusSaati === '0') merged.govdeUcusSaati = existing.govdeUcusSaati || env.govdeUcusSaati;
            logDataMap.set(key, merged);
          }
        }
      });

      const logData = Array.from(logDataMap.values());
      
      setEnvanterLog(logData.map((logEntry: any) => {
        const tarihStr = String(logEntry.tarih || logEntry['Tarih'] || logEntry['date'] || '').trim();
        const kuyrukNo = String(logEntry.kuyrukNo || logEntry['Kuyruk No'] || logEntry.tailNumber || logEntry.tail || '').trim().toUpperCase();
        let dayNum = -1, monthNum = -1, yearNum = -1;
        
        if (tarihStr.includes('T')) {
          const d = new Date(tarihStr);
          if (!isNaN(d.getTime())) {
            dayNum = d.getUTCDate();
            monthNum = d.getUTCMonth();
            yearNum = d.getUTCFullYear();
          }
        } else {
          const parts = tarihStr.split(/[- ./:]/);
          if (parts.length >= 3) {
            if (parts[0].length === 4) {
              yearNum = parseInt(parts[0], 10);
              monthNum = parseInt(parts[1], 10) - 1;
              dayNum = parseInt(parts[2], 10);
            } else if (parts[2].split(" ")[0].length === 4) {
              dayNum = parseInt(parts[0], 10);
              monthNum = parseInt(parts[1], 10) - 1;
              yearNum = parseInt(parts[2].split(" ")[0], 10);
            }
          }
        }

        if (dayNum !== -1 && yearNum > 0) {
          return {
            ...logEntry,
            kuyrukNo: kuyrukNo,
            tarih: `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          };
        }
        return { ...logEntry, kuyrukNo: kuyrukNo };
      }));

      console.log(`Processing ${logData.length} daily logs and ${intraDayData.length} intra-day logs`);

      setActivities(() => {
        const activityMap = new Map<string, AircraftActivity>();
        
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        fleet.forEach(a => {
          let code: DailyStatusCode = '?';
          if (a.assignedCode) {
            code = a.assignedCode as DailyStatusCode;
          } else {
            const upperDurum = String(a.durum || '').trim().toUpperCase();
            if (upperDurum === 'FAAL') code = 'F';
          }

          activityMap.set(a.kuyrukNo, {
            kuyrukNo: a.kuyrukNo,
            cagriKodu: a.cagriKodu,
            tip: a.tip || 'Bilinmiyor',
            dailyStatuses: { [todayStr]: code },
            hourlyStatuses: {},
            intraDayCompletions: {},
            intraDayDurations: {},
            intraDayEvents: {},
            hourlyDescriptions: {},
            intraDayStartStatuses: {}
          });
        });

        const normalizedEnvanterLog: any[] = [];

        // Process Daily Logs
        logData.forEach((logEntry: any) => {
          try {
            const kuyrukNo = String(logEntry.kuyrukNo || logEntry['Kuyruk No'] || logEntry.tailNumber || '').trim();
            if (!kuyrukNo) return;

            // Junk T-70 filter: Ignore rows that don't match standard T-70 kuyruk numbers
            const kNoUpper = kuyrukNo.toUpperCase();
            if ((logEntry.tip === 'T-70' || logEntry.Platform === 'T-70') && !kNoUpper.includes('OR-') && !kNoUpper.includes('10')) {
               return;
            }

            const tarihStr = String(logEntry.tarih || logEntry.Tarih || '').trim();
            const durumAyrintisi = String(logEntry.durumAyrintisi || logEntry.durum || logEntry.Durum || '').trim().toUpperCase();
            const analizKodu = logEntry.analizKodu ? String(logEntry.analizKodu).trim() : null;

            let dayNum = -1, monthNum = -1, yearNum = -1;
            
            // Tarih formatlarını dene
            if (tarihStr.includes('T')) {
              const d = new Date(tarihStr);
              if (!isNaN(d.getTime())) {
                dayNum = d.getUTCDate();
                monthNum = d.getUTCMonth();
                yearNum = d.getUTCFullYear();
              }
            } else {
              const parts = tarihStr.split(/[- ./:]/);
              if (parts.length >= 3) {
                if (parts[0].length === 4) {
                  yearNum = parseInt(parts[0], 10);
                  monthNum = parseInt(parts[1], 10) - 1;
                  dayNum = parseInt(parts[2], 10);
                } else if (parts[2].split(" ")[0].length === 4) {
                  dayNum = parseInt(parts[0], 10);
                  monthNum = parseInt(parts[1], 10) - 1;
                  yearNum = parseInt(parts[2].split(" ")[0], 10);
                }
              }
            }

            if (dayNum !== -1) {
              const dateStrKey = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              if (dateStrKey > todayStr) return;
              
              // De-duplicate normalizedEnvanterLog (use latest record for same date/tail)
              const existingIdx = normalizedEnvanterLog.findIndex(e => e.kuyrukNo === kuyrukNo && e.tarih === dateStrKey);
              if (existingIdx !== -1) {
                normalizedEnvanterLog[existingIdx] = {
                  ...logEntry,
                  kuyrukNo: kuyrukNo,
                  tarih: dateStrKey
                };
              } else {
                normalizedEnvanterLog.push({
                  ...logEntry,
                  kuyrukNo: kuyrukNo,
                  tarih: dateStrKey
                });
              }

              // Bugünün verisini logdan değil, canlı veriden alıyoruz
              let code: DailyStatusCode = '?';
              const isMainFaal = durumAyrintisi === 'FAAL';
              
              if (analizKodu) {
                code = analizKodu as DailyStatusCode;
                // Heuristic fix: If main status is tracked as 'FAAL' in the log but the analysis code
                // remained 'TB' or 'KM', it's likely a logic error from the past.
                if (isMainFaal && (code === 'TB' || code === 'KM')) {
                  code = 'F';
                }
              } else if (isMainFaal) {
                code = 'F';
              } else {
                // Heuristic mapping for non-faal without analizKodu
                if (durumAyrintisi.includes('BAKIM') && durumAyrintisi.includes('BEKLER')) code = 'BB';
                else if (durumAyrintisi.includes('BAKIM')) code = 'B';
                else if (durumAyrintisi.includes('ARIZA')) code = 'A';
                else if (durumAyrintisi.includes('PARÇA')) code = 'PB';
                else if (durumAyrintisi.includes('KABUL')) code = 'KM';
                else if (durumAyrintisi.includes('TEKNİK BÜLTEN')) code = 'TBU';
                else if (durumAyrintisi.includes('KAZA')) code = 'KK';
                else if (durumAyrintisi.includes('TB') || durumAyrintisi.includes('TECRÜBE')) code = 'TB';
                else if (durumAyrintisi.includes('X')) code = 'X';
              }

              let act = activityMap.get(kuyrukNo);
              if (act) {
                if (!act.dailyStatuses) act.dailyStatuses = {};
                // Eğer bugün ise ve zaten bir kod varsa (canlı veriden gelen), logdaki kodu sadece analizKodu varsa ez
                if (dateStrKey === todayStr) {
                  if (analizKodu) {
                    act.dailyStatuses = { ...act.dailyStatuses, [dateStrKey]: code };
                  }
                } else {
                  act.dailyStatuses = { ...act.dailyStatuses, [dateStrKey]: code };
                }
              } else {
                activityMap.set(kuyrukNo, {
                  kuyrukNo: kuyrukNo,
                  cagriKodu: getCallSignByTail(kuyrukNo),
                  tip: logEntry.tip || logEntry.Tip || 'Bilinmiyor',
                  dailyStatuses: { [dateStrKey]: code },
                  hourlyStatuses: {},
                  intraDayCompletions: {},
                  intraDayDurations: {},
                  intraDayStartStatuses: {}
                });
              }
            }
          } catch (err) {
            console.error("Error processing log entry:", logEntry, err);
          }
        });

        // Process Intra-Day Logs
        const intraDayGroups = new Map<string, any[]>();
        intraDayData.forEach((log: any) => {
          const kuyrukNo = String(log.kuyrukNo || log['Kuyruk No'] || log.tailNumber || '').trim();
          if (!kuyrukNo) return;

          let dateStr = '';
          const rawTarih = log.tarih || log.Tarih || '';
          if (rawTarih) {
            const tarihStr = String(rawTarih).trim();
            if (tarihStr.includes('.')) {
              const parts = tarihStr.split('.');
              if (parts.length === 3) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            } else if (tarihStr.includes('/')) {
              const parts = tarihStr.split('/');
              if (parts.length === 3) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            } else {
              const d = new Date(tarihStr);
              if (!isNaN(d.getTime())) {
                dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              }
            }
          }
          if (!dateStr || dateStr > todayStr) return;

          const key = `${kuyrukNo}_${dateStr}`;
          if (!intraDayGroups.has(key)) intraDayGroups.set(key, []);
          intraDayGroups.get(key)!.push(log);
        });

        // Track carry-over status per tail
        const tailLastStatusMap = new Map<string, string>();

        // Full date range
        const startDateObj = new Date(filterStartDate);
        const endDateObj = new Date(filterEndDate);
        const dateRangeArray: string[] = [];
        let walkDate = new Date(startDateObj);
        while (walkDate <= endDateObj) {
          dateRangeArray.push(`${walkDate.getFullYear()}-${String(walkDate.getMonth() + 1).padStart(2, '0')}-${String(walkDate.getDate()).padStart(2, '0')}`);
          walkDate.setDate(walkDate.getDate() + 1);
        }

        const allTails = Array.from(activityMap.keys());

        dateRangeArray.forEach((dateStr) => {
          allTails.forEach((kuyrukNo) => {
            const key = `${kuyrukNo}_${dateStr}`;
            const logs = intraDayGroups.get(key) || [];
            let act = activityMap.get(kuyrukNo);
            if (!act) return;

            let totalGayriFaalMins = 0;
            const previousTailStatus = tailLastStatusMap.get(kuyrukNo) || 'F';

            const hourlyStatuses: Record<string, string> = {};
            const hourlyDescriptions: Record<string, string> = {};
            type LogEvent = { hour: number; exactMins: number; type: 'down' | 'up'; status: string; desc: string };
            const events: LogEvent[] = [];

            logs.forEach(log => {
              const statusRaw = String(log.status || log.Status || log.durum || log.Durum || '').trim().toUpperCase();
              const startStr = String(log.startTime || log.gayriFaalBaslangicSaati || log['GAYRİ FAAL BAŞLANGIÇ SAATİ'] || '').trim();
              const endStr = String(log.endTime || log.faalBaslangicSaati || log['FAAL BAŞLANGIÇ SAATİ'] || '').trim();
              const description = String(log.description || log.aciklama || log.Açıklama || '').trim();

              if (statusRaw === 'FAAL') {
                // No-op
              } else if (statusRaw !== '' || startStr !== '' || endStr !== '') {
                let code = 'B';
                if (statusRaw.includes('TEKNİK BÜLTEN') || statusRaw.includes('TBU')) code = 'TBU';
                else if (statusRaw.includes('BAKIM') && statusRaw.includes('BEKLER')) code = 'BB';
                else if (statusRaw.includes('BAKIM')) code = 'B';
                else if (statusRaw.includes('PARÇA')) code = 'PB';
                else if (statusRaw.includes('KABUL')) code = 'KM';
                else if (statusRaw.includes('KAZA')) code = 'KK';
                else if (statusRaw.includes('OLMADIĞI')) code = 'X';
                else if (statusRaw.includes('TECRÜBE')) code = 'TB';
                else if (statusRaw.includes('ARIZA') || statusRaw.includes('OVERSPEED') || statusRaw.includes('NG')) code = 'A';
                else if (statusRaw.length > 0) code = statusRaw.substring(0, 2);

                const parseExactMins = (timeStr: string) => {
                  if (!timeStr) return -1;
                  if (timeStr.includes('GMT') || timeStr.includes('T')) {
                    const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})/);
                    if (match) return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
                    const d = new Date(timeStr);
                    if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
                  }
                  if (!timeStr.includes(':')) return -1;
                  const parts = timeStr.split(':');
                  const h = parseInt(parts[0], 10);
                  const m = parseInt(parts[1], 10);
                  if (isNaN(h) || isNaN(m)) return -1;
                  return h * 60 + m;
                };

                const sMins = parseExactMins(startStr);
                const eMins = parseExactMins(endStr);
                if (sMins !== -1) events.push({ hour: Math.floor(sMins / 60), exactMins: sMins, type: 'down', status: code, desc: description });
                if (eMins !== -1) events.push({ hour: Math.floor(eMins / 60), exactMins: eMins, type: 'up', status: code, desc: description });
              }
            });

            events.sort((a, b) => a.exactMins - b.exactMins || (a.type === 'up' ? -1 : 1));

            if (!act.dailyStatuses) act.dailyStatuses = {};
            const dailyStatus = act.dailyStatuses[dateStr] || 'F';
            const now = new Date();
            const todayStrComp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const isToday = dateStr === todayStrComp;
            const isFuture = dateStr > todayStrComp;

            if (isFuture) return;

            const currentMins = now.getHours() * 60 + now.getMinutes();
            const endOfDayMins = isToday ? currentMins : 24 * 60;

            let initialStatus = previousTailStatus;
            let isDown = (previousTailStatus !== 'F');

            // Smart logic: If first event of day is a failure start, then we must have been Faal before that
            if (events.length > 0) {
              if (events[0].type === 'up') {
                isDown = true;
                initialStatus = (previousTailStatus !== 'F' ? previousTailStatus : (events[0].status || 'GA'));
              } else if (events[0].type === 'down') {
                isDown = false;
                initialStatus = 'F';
              }
            } else if ((dailyStatus as string) !== 'F' && (dailyStatus as string) !== '?' && (dailyStatus as string) !== '') {
              isDown = true;
              initialStatus = dailyStatus;
            } else if (dailyStatus === 'F' && previousTailStatus !== 'F') {
              isDown = false;
              initialStatus = 'F';
            }

            let lastDownMins = 0;
            if (!act.intraDayStartStatuses) act.intraDayStartStatuses = {};
            act.intraDayStartStatuses[dateStr] = initialStatus;

            for (const ev of events) {
              if (ev.type === 'down') {
                if (!isDown) {
                  isDown = true;
                  lastDownMins = ev.exactMins;
                }
              } else if (ev.type === 'up') {
                if (isDown) {
                  isDown = false;
                  const upMins = isToday ? Math.min(ev.exactMins, currentMins) : ev.exactMins;
                  totalGayriFaalMins += Math.max(0, upMins - lastDownMins);
                }
              }
            }

            if (isDown) {
              totalGayriFaalMins += Math.max(0, endOfDayMins - lastDownMins);
            }

            let currentState = initialStatus;
            let currentDesc = '';

            for (let h = 0; h < 24; h++) {
              const eventsAtHour = events.filter(e => e.hour === h);
              eventsAtHour.sort((a, b) => (a.type === 'down' ? -1 : 1));
              for (const ev of eventsAtHour) {
                if (ev.type === 'down') {
                  currentState = ev.status;
                  currentDesc = ev.desc;
                } else if (ev.type === 'up') {
                  currentState = 'F';
                  currentDesc = ev.desc;
                }
              }
              const hStr = `${h.toString().padStart(2, '0')}:00`;
              hourlyStatuses[hStr] = currentState;
              if (currentState !== 'F' || eventsAtHour.length > 0) {
                hourlyDescriptions[hStr] = currentDesc || (currentState !== 'F' ? 'Gayri Faal Durum Devam Ediyor' : '');
              }
            }

            tailLastStatusMap.set(kuyrukNo, currentState);
            
            // Bug Fix: Only carry over if we don't have a record for today or if it's explicitly unknown ('?')
            // DO NOT override 'F' (Faal) status from the log with a previous day's maintenance status.
            if ((act.dailyStatuses[dateStr] === undefined || act.dailyStatuses[dateStr] === '?' || act.dailyStatuses[dateStr] === '') && currentState !== 'F') {
              act.dailyStatuses[dateStr] = currentState as DailyStatusCode;
            }

            if (logs.length > 0 || dailyStatus !== 'F') {
              if (!act.intraDayDurations) act.intraDayDurations = {};
              act.intraDayDurations[dateStr] = totalGayriFaalMins;
              if (!act.intraDayEvents) act.intraDayEvents = {};
              act.intraDayEvents[dateStr] = events;
              if (!act.hourlyStatuses) act.hourlyStatuses = {};
              act.hourlyStatuses[dateStr] = { ...act.hourlyStatuses[dateStr], ...hourlyStatuses } as Record<string, DailyStatusCode>;
              if (!act.hourlyDescriptions) act.hourlyDescriptions = {};
              act.hourlyDescriptions[dateStr] = { ...act.hourlyDescriptions[dateStr], ...hourlyDescriptions };
              
              if (totalGayriFaalMins > 0 && totalGayriFaalMins < endOfDayMins) {
                if (!act.intraDayCompletions) act.intraDayCompletions = {};
                act.intraDayCompletions[dateStr] = true;
              }
            }
          });
        });
        return Array.from(activityMap.values());
      });
    } catch (e) {
      console.warn("Log verisi çekilirken hata oluştu, mock veriler kullanılıyor:", e);
      setActivities(MOCK_ACTIVITY_GRID);
    }
  };

  const handleSearchActivities = () => {
    setIsFetchingActivities(true);
    fetchPastLogs().finally(() => setIsFetchingActivities(false));
  };

  const runGlobalSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus('checking');
    
    // Geçmiş logları beklemeden hemen çekmeye başla
    fetchPastLogs();

    try {
      const fetchedFleet: Aircraft[] = [];

      await Promise.all(SHEET_CONFIGS.map(async (config) => {
        try {
          const data = await fetchAircraftDataFromAppsScript(config.appsScriptUrl, config);
          if (data && data.length > 0) {
            fetchedFleet.push(...(data as Aircraft[]));
          }
        } catch (e) {
          console.error(`Sync error for ${config.aircraftType}:`, e);
        }
      }));

      if (fetchedFleet.length > 0) {
        // Create a signature of the data to detect changes
        const currentSignature = JSON.stringify(fetchedFleet.map(a => ({
          k: a.kuyrukNo,
          g: a.govdeUcusSaati,
          f: a.faydaliSaat,
          ko: a.konum,
          d: a.durum,
          da: a.durumAyrintisi,
          ac: a.aciklama,
          an: a.assignedCode
        })));

        if (currentSignature !== lastSyncSignatureRef.current) {
          console.log("Changes detected in fleet data, proceeding with update and logging.");
          
          // Apply changes to UI
          handleSyncFromExcel(fetchedFleet, 'SYNC', false);

          try {
            await proxyFetch(LOG_SCRIPT_URL, {
              action: 'logAllAircraftActivity',
              sheetId: MAIL_LOG_SHEET_ID,
              fleetData: fetchedFleet.map(a => ({
                kuyrukNo: a.kuyrukNo,
                tip: a.tip || '',
                govdeUcusSaati: a.govdeUcusSaati,
                faydaliSaat: a.faydaliSaat,
                konum: a.konum,
                durum: a.durum,
                durumAyrintisi: a.durumAyrintisi,
                aciklama: a.aciklama,
                analizKodu: a.assignedCode
              }))
            });
            lastSyncSignatureRef.current = currentSignature;
            setSyncStatus('updated');
          } catch (logError) {
            console.error("Otomatik log güncelleme hatası:", logError);
            setSyncStatus('error');
          }
        } else {
          console.log("No changes detected in fleet data, skipping update/logging.");
          setSyncStatus('no-change');
        }
      }
    } catch (e) {
      console.error("Global sync failed:", e);
      setSyncStatus('error');
    } finally {
      initialSyncDone.current = true;
      setIsSyncing(false);
      // Reset status after a few seconds
      setTimeout(() => setSyncStatus(prev => prev === 'checking' ? 'idle' : prev), 3000);
    }
  }, [handleSyncFromExcel]);

  const checkOPLAlerts = useCallback(async (aircraft: Aircraft) => {
    if (!aircraft.appsScriptUrl || !aircraft.sheetId || aircraft.tip === 'Bell-429' || aircraft.tip === 'T-70' || aircraft.tip === 'B-360' || aircraft.tip === 'C-650') return;
    
    setOplCheckStatus(prev => ({ ...prev, [aircraft.kuyrukNo]: 'checking' }));
    
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
        let s = String(val).trim();
        
        // Handle Turkish format: dots for thousands, comma for decimal (e.g. 1.736,6)
        if (s.includes('.') && s.includes(',')) {
          s = s.replace(/\./g, '').replace(',', '.');
        } else if (s.includes(',')) {
          s = s.replace(',', '.');
        }

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

      // AT-802 Test Tarihi Kontrolleri
      if (aircraft.tip === 'AT-802') {
        const checkTestDate = (dateStr: string | undefined, label: string) => {
          if (!dateStr || dateStr === '-' || dateStr === 'N/A') return;
          
          let lastDate: Date;
          const parts = dateStr.split('.');
          if (parts.length === 3) {
            // Local date parsing: year, month (0-indexed), day
            lastDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            lastDate = new Date(dateStr);
          }

          if (isNaN(lastDate.getTime())) return;
          
          // Next test is exactly 7 days after the last test
          const nextDate = new Date(lastDate);
          nextDate.setDate(nextDate.getDate() + 7);
          nextDate.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Calculate difference in days
          const diffTime = nextDate.getTime() - today.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 2 && diffDays >= 0) {
            alerts.push(`${label}: Haftalık çalışmaya son ${diffDays} gün kaldı!`);
          } else if (diffDays < 0) {
            // If it's overdue, show how many days passed since the target date
            const overdueDays = Math.abs(diffDays);
            alerts.push(`${label}: Haftalık çalışma tarihi geçti! (${overdueDays} gün gecikti)`);
          }
        };

        checkTestDate(aircraft.frdsTestDate, 'FRDS');
        checkTestDate(aircraft.motorRunDate, 'MOTOR ÇALIŞTIRMA');
      }

      setFleet(prev => prev.map(a => a.kuyrukNo === aircraft.kuyrukNo ? { ...a, oplAlerts: alerts } : a));
      setOplCheckStatus(prev => ({ ...prev, [aircraft.kuyrukNo]: 'done' }));
    } catch (error) {
      console.error(`OPL check error for ${aircraft.kuyrukNo}:`, error);
      setOplCheckStatus(prev => ({ ...prev, [aircraft.kuyrukNo]: 'done' }));
    }
  }, []);

  useEffect(() => {
    // Clear redirect flags after they have been initialized in state on page load
    safeStorage.removeItem('redirect_view');
    safeStorage.removeItem('redirect_filter');
  }, []);

  useEffect(() => {
    if (fleet.length > 0) {
      fleet.forEach(a => {
        if (!oplCheckStatus[a.kuyrukNo] && a.tip !== 'Bell-429' && a.tip !== 'T-70' && a.tip !== 'B-360' && a.tip !== 'C-650') {
          checkOPLAlerts(a);
        }
      });
    }
  }, [fleet, oplCheckStatus, checkOPLAlerts]);

  useEffect(() => {
    runGlobalSync(); 
    const interval = setInterval(runGlobalSync, 900000); 
    return () => clearInterval(interval);
  }, [runGlobalSync]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (filterDate === todayStr) {
      setHistoricalFleet(null);
      return;
    }

    const fetchHistory = async () => {
      setIsFetchingHistory(true);
      try {
        const result = await proxyFetch(LOG_SCRIPT_URL, {
          action: 'getAircraftData',
          sheetId: MAIL_LOG_SHEET_ID,
          sheetName: 'Envanter Log',
          mapping: {
            id: 'A2:A10000',
            tarih: 'B2:B10000',
            kuyrukNo: 'C2:C10000',
            tip: 'D2:D10000',
            govdeUcusSaati: 'E2:E10000',
            faydaliSaat: 'F2:F10000',
            konum: 'G2:G10000',
            durum: 'H2:H10000',
            durumAyrintisi: 'I2:I10000',
            aciklama: 'J2:J10000'
          }
        });
        
        const data = (result && (result.success || result.status === 'success') && Array.isArray(result.data)) 
          ? result.data 
          : (Array.isArray(result) ? result : []);

        const targetDate = new Date(filterDate);
        const targetDay = targetDate.getDate();
        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();

        const filtered = data.filter((row: any) => {
          if (!row.tarih) return false;
          const rowDate = new Date(row.tarih);
          return rowDate.getDate() === targetDay && 
                 rowDate.getMonth() === targetMonth && 
                 rowDate.getFullYear() === targetYear;
        });

        const historyFleet: Aircraft[] = filtered.map((row: any) => {
          const rowTip = row.tip || '';
          const govdeSaat = parseSingleCellToHour(row.govdeUcusSaati, rowTip);
          
          let govdeStr = '-';
          if (govdeSaat !== null) {
            govdeStr = formatToHHMM(govdeSaat, rowTip);
          }

          return {
            kuyrukNo: row.kuyrukNo || '',
            cagriKodu: getCallSignByTail(row.kuyrukNo || ''),
            tip: rowTip,
            durum: row.durum || '',
            durumAyrintisi: row.durumAyrintisi || '',
            konum: row.konum || '',
            faydaliSaat: parseSingleCellToHour(row.faydaliSaat, rowTip) || 0,
            aciklama: row.aciklama || '',
            govdeUcusSaati: govdeStr,
            assignedCode: row.analizKodu as DailyStatusCode || 'F',
            appsScriptUrl: '',
            sheetId: ''
          };
        });

        setHistoricalFleet(historyFleet);
      } catch (err) {
        console.error("Historical data fetch error:", err);
        setHistoricalFleet([]);
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchHistory();
  }, [filterDate]);

  const filteredFleet = useMemo(() => {
    const sourceFleet = historicalFleet || fleet;
    const filtered = sourceFleet.filter(a => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = a.kuyrukNo.toLowerCase().includes(s) || a.konum.toLowerCase().includes(s) || (a.tip && a.tip.toLowerCase().includes(s));
      const matchesType = filterType === 'Tümü' || a.tip === filterType;
      const matchesTail = filterTail === '' || a.kuyrukNo.toLowerCase().includes(filterTail.toLowerCase());
      const isKazaKirim = a.assignedCode === 'KK' || (a.durumAyrintisi && a.durumAyrintisi.toUpperCase().includes('KAZA KIRIM'));
      const matchesKazaKirim = hideKazaKirim ? !isKazaKirim : true;
      
      return matchesSearch && matchesType && matchesTail && matchesKazaKirim;
    });

    const getOrder = (cagriKodu: string) => {
      const match = String(cagriKodu).match(/ORMAN-(\d+)/i);
      if (match) return parseInt(match[1]);
      return 999;
    };

    if (sortByCagriKodu) {
      return [...filtered].sort((a, b) => getOrder(a.cagriKodu) - getOrder(b.cagriKodu));
    }

    const order = ['C-650', 'B-360', 'Bell-429', 'T-70', 'AT-802'];

    return filtered.sort((a, b) => {
      const typeA = a.tip || '';
      const typeB = b.tip || '';
      
      const indexA = order.indexOf(typeA);
      const indexB = order.indexOf(typeB);
      
      if (indexA !== indexB) {
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return typeA.localeCompare(typeB);
      }

      // 1. Kaza kırım sorting: kaza kırımlar (KK) are ALWAYS at the absolute bottom within their type category.
      const isKazaKirimA = a.assignedCode === 'KK' || (a.durumAyrintisi && a.durumAyrintisi.toUpperCase().includes('KAZA KIRIM'));
      const isKazaKirimB = b.assignedCode === 'KK' || (b.durumAyrintisi && b.durumAyrintisi.toUpperCase().includes('KAZA KIRIM'));
      
      if (isKazaKirimA !== isKazaKirimB) {
        return isKazaKirimA ? 1 : -1;
      }

      // 2. Location (konum) grouping & sorting: same locations grouped together, sorted alphabetically (e.g. Antalya first, Çanakkale next, Muğla next)
      const konumA = (a.konum || '').trim().toLocaleUpperCase('tr-TR');
      const konumB = (b.konum || '').trim().toLocaleUpperCase('tr-TR');
      
      if (konumA !== konumB) {
        // Handle '-' or empty/missing in sorting to go to the bottom
        if (konumA === '-') return 1;
        if (konumB === '-') return -1;
        return konumA.localeCompare(konumB, 'tr-TR');
      }

      // 3. Within the same location, sort by cagriKodu / kuyrukNo:
      if (typeA === 'AT-802') {
        return a.kuyrukNo.localeCompare(b.kuyrukNo);
      }
      
      return getOrder(a.cagriKodu) - getOrder(b.cagriKodu);
    });
  }, [fleet, historicalFleet, searchTerm, filterType, filterTail, hideKazaKirim, sortByCagriKodu]);

  const filteredActivities = useMemo(() => {
    const filtered = activities.filter(a => {
      const matchesType = filterType === 'Tümü' || a.tip === filterType;
      const matchesTail = filterTail === '' || a.kuyrukNo.toLowerCase().includes(filterTail.toLowerCase());
      
      let hasKazaKirim = false;
      if (hideKazaKirim) {
        for (let day in a.dailyStatuses) {
          if (a.dailyStatuses[day] === 'KK') {
            hasKazaKirim = true;
            break;
          }
        }
      }
      const matchesKazaKirim = hideKazaKirim ? !hasKazaKirim : true;

      return matchesType && matchesTail && matchesKazaKirim;
    });

    // Enhance activities with 'X' for days before KM or Arrival Date
    return filtered.map(act => {
      const aircraft = fleet.find(f => f.kuyrukNo === act.kuyrukNo);
      const dailyStatuses = { ...act.dailyStatuses };
      
      // Find the earliest KM date
      const kmDates = Object.entries(dailyStatuses)
        .filter(([_, status]) => status === 'KM')
        .map(([date, _]) => date)
        .sort();
      
      let firstOperationalDate: string | null = kmDates.length > 0 ? kmDates[0] : null;
      
      // Also consider Gelis Tarihi (Arrival Date) if available
      if (aircraft?.gelisTarihi && aircraft.gelisTarihi !== '-' && aircraft.gelisTarihi !== '') {
        const parts = String(aircraft.gelisTarihi).split(/[./-]/);
        if (parts.length === 3) {
          let day = parseInt(parts[0], 10);
          let month = parseInt(parts[1], 10);
          let year = parseInt(parts[2], 10);
          
          if (parts[0].length === 4) {
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
          } else if (parts[2].length === 4) {
            // Check if MM/DD/YYYY format:
            // 1) month is > 12 (needs swap)
            // 2) first part is single digit, second part is single/double, separator is '/' (Google Sheets auto-formatted US date)
            const hasSlash = String(aircraft.gelisTarihi).includes('/');
            if (month > 12) {
              const temp = day;
              day = month;
              month = temp;
            } else if (hasSlash && month <= 12 && day <= 12) {
              const temp = day;
              day = month;
              month = temp;
            } else if (hasSlash && day > 12 && month <= 12 && parts[0].length === 1) {
              const temp = day;
              day = month;
              month = temp;
            }
          }

          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const isoGelis = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (!firstOperationalDate || isoGelis < firstOperationalDate) {
              firstOperationalDate = isoGelis;
            }
          }
        }
      }
      
      if (firstOperationalDate) {
        // Find visible range and fill 'X' for anything before firstOperationalDate
        const start = new Date(filterStartDate);
        const end = new Date(filterEndDate);
        let curr = new Date(start);
        while (curr <= end) {
          const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
          if (dateStr < firstOperationalDate) {
            dailyStatuses[dateStr] = 'X';
          }
          curr.setDate(curr.getDate() + 1);
        }
      }
      
      return { ...act, dailyStatuses };
    });
  }, [activities, filterType, filterTail, hideKazaKirim, fleet, filterStartDate, filterEndDate]);

  const toggleNote = (kuyrukNo: string) => {
    setExpandedNotes(prev => ({ ...prev, [kuyrukNo]: !prev[kuyrukNo] }));
  };

  const handleLogin = (user: string, pass: string) => {
    const validPasswords = ['802', '429', '70', '650', '360', '1839'];
    if (user === 'ogm' && validPasswords.includes(pass)) {
      setIsAdminAuthenticated(true);
      setIsAuthModalOpen(false);
      setIsAdminOpen(true);
    } else {
      alert('Hatalı kullanıcı adı veya şifre!');
    }
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const syncLogs = async () => {
    setIsSyncing(true);
    try {
      const result = await proxyFetch(AT802_SCRIPT_URL, { action: 'sync' });
      
      if (result && result.success) {
        alert('Log senkronizasyonu başarıyla tamamlandı.');
        runGlobalSync(); // Refresh data
      } else {
        alert('Senkronizasyon hatası: ' + (result?.message || result?.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Sync log error:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Senkronizasyon sırasında bir hata oluştu: ${errorMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const cleanupLogs = async () => {
    try {
      const result = await proxyFetch(LOG_SCRIPT_URL, { action: 'cleanupAllLogs' });
      if (result && result.success) {
        alert('Log temizleme işlemi başarıyla tamamlandı. Tekrar eden kayıtlar silindi.');
        runGlobalSync();
      } else {
        alert('Temizleme hatası: ' + (result?.message || result?.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Cleanup logs error:', error);
      alert('Temizleme işlemi sırasında bir hata oluştu.');
    }
  };

  if (isSplashVisible) return <SplashScreen onComplete={() => setIsSplashVisible(false)} />;

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onViewDashboard={() => setCurrentView('dashboard')}
        onViewUpdate={() => setCurrentView('update')}
      />
    );
  }

  if (currentView === 'update') {
    return (
      <DataUpdateForm 
        fleet={fleet}
        envanterLog={envanterLog}
        onBack={() => setCurrentView('landing')}
        onSaveIntraDay={handleSaveIntraDay}
        onTriggerSync={runGlobalSync}
        onUpdateLocalState={handleUpdateLocalState}
        onSuccess={(type) => {
          setFilterType(type);
          runGlobalSync();
          setCurrentView('dashboard');
        }}
      />
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center mb-12 w-full">
         <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDRxOWVlbDJkbmx6bmxsM203Z3g3bXBobGJsbDQyMDJ1M2h5MzZqcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/n7frjzkahqcqyik0o3/giphy.gif" alt="Logo GIF" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30 shadow-2xl mb-6 ring-4 ring-emerald-500/30" />
         <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase text-center">HAVA ARAÇLARI YÖNETİM SİSTEMİ</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch lg:items-center mb-12">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:space-x-6">
            <button 
              onClick={() => setCurrentView('landing')}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-emerald-500 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2 sm:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="sm:hidden font-black text-xs uppercase tracking-wider">Ana Sayfaya Dön</span>
            </button>
            <div className={`bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 rounded-[1.8rem] flex items-center justify-center shadow-2xl backdrop-blur-md ${isSyncing ? 'bg-yellow-500/10 border-yellow-500/30' : (syncStatus === 'no-change' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-emerald-500/10 border-emerald-500/30')}`}>
               <div className={`w-3 h-3 rounded-full mr-4 shrink-0 shadow-[0_0_10px_#10b981] ${isSyncing ? 'bg-yellow-400 animate-spin shadow-[0_0_10px_#facc15]' : (syncStatus === 'no-change' ? 'bg-blue-400 shadow-[0_0_10px_#3b82f6]' : 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]')}`}></div>
               <span className={`font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.5em] text-center ${isSyncing ? 'text-yellow-400' : (syncStatus === 'no-change' ? 'text-blue-400' : 'text-emerald-400')}`}>
                  {isSyncing ? 'VERİLER KONTROL EDİLİYOR...' : (syncStatus === 'no-change' ? 'OTOMATİK VERİ: DEĞİŞİKLİK YOK' : 'OTOMATİK VERİ TAKİBİ AKTİF')}
               </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:space-x-5">
            <button onClick={() => setShowActivity(!showActivity)} className={`px-6 sm:px-10 py-4 sm:py-5 rounded-[2rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.4em] transition-all shadow-2xl border-2 w-full sm:w-auto ${showActivity ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/10 text-white border-white/20'}`}>
               {showActivity ? "ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU" : "FAALİYET ÇİZELGESİ"}
            </button>
            <button 
              onClick={handleAdminClick} 
              className={`relative px-6 sm:px-10 py-4 sm:py-5 rounded-[2rem] font-black text-[10px] sm:text-[11px] border-2 uppercase tracking-[0.1em] sm:tracking-[0.4em] transition-all shadow-lg flex items-center justify-center w-full sm:w-auto ${notifications.length > 0 ? 'bg-red-900 border-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-[#021a0c] hover:bg-emerald-900 text-white border-emerald-800/50'}`}
            >
              YÖNETİM & GELEN KUTUSU
              {notifications.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-xl border-2 border-[#052e16] animate-bounce">
                  {notifications.length}
                </div>
              )}
            </button>
          </div>
      </div>

      <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-4 items-end shadow-2xl backdrop-blur-md">
        <div className="flex flex-col">
          <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Hava Aracı Tipi</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-black/60 text-white px-4 py-2.5 rounded-xl border border-white/10 outline-none font-bold focus:border-emerald-500 transition-all text-xs">
            <option value="Tümü">Tümü</option>
            <option value="AT-802">AT-802</option>
            <option value="Bell-429">Bell-429</option>
            <option value="T-70">T-70</option>
            <option value="B-360">B-360</option>
            <option value="C-650">C-650</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Kuyruk No</label>
          <input type="text" value={filterTail} onChange={(e) => setFilterTail(e.target.value)} placeholder="Örn: OR-2021" className="bg-black/60 text-white px-4 py-2.5 rounded-xl border border-white/10 outline-none font-bold focus:border-emerald-500 transition-all text-xs w-32" />
        </div>
        {showActivity ? (
          <>
            <div className="flex flex-col">
              <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Başlangıç Tarihi</label>
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="bg-black/60 text-white px-4 py-2.5 rounded-xl border border-white/10 outline-none font-bold focus:border-emerald-500 transition-all text-xs [color-scheme:dark]" />
            </div>
            <div className="flex flex-col">
              <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Bitiş Tarihi</label>
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="bg-black/60 text-white px-4 py-2.5 rounded-xl border border-white/10 outline-none font-bold focus:border-emerald-500 transition-all text-xs [color-scheme:dark]" />
            </div>
            <div className="flex flex-col justify-end">
              <button onClick={handleSearchActivities} disabled={isFetchingActivities} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 h-[38px]">
                {isFetchingActivities ? 'BEKLENİYOR...' : 'ARA'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col">
            <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Tarih</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-black/60 text-white px-4 py-2.5 rounded-xl border border-white/10 outline-none font-bold focus:border-emerald-500 transition-all text-xs [color-scheme:dark]" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 ml-auto">
          <div className="flex items-center bg-black/40 px-4 py-2.5 rounded-xl border border-white/10">
            <input type="checkbox" id="sortByCagriKodu" checked={sortByCagriKodu} onChange={(e) => setSortByCagriKodu(e.target.checked)} className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2" />
            <label htmlFor="sortByCagriKodu" className="ml-2 text-xs font-black text-white uppercase tracking-widest cursor-pointer">Çağrı Koduna Sırala</label>
          </div>
          <div className="flex items-center bg-black/40 px-4 py-2.5 rounded-xl border border-white/10">
            <input type="checkbox" id="hideKazaKirim" checked={hideKazaKirim} onChange={(e) => setHideKazaKirim(e.target.checked)} className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2" />
            <label htmlFor="hideKazaKirim" className="ml-2 text-xs font-black text-white uppercase tracking-widest cursor-pointer">Kaza Kırımları Gizle</label>
          </div>
        </div>
        <button onClick={() => setIsGovdeSorguOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ml-2">
          Gövde Uçuş Saati Sorgula
        </button>
      </div>

      <div className="mb-14">
        <Dashboard 
          fleet={filteredFleet} 
          activities={filteredActivities}
          startDate={new Date(filterStartDate)}
          endDate={new Date(filterEndDate)}
          currentTime={new Date()}
          isSyncing={isSyncing}
        />
      </div>

      {showActivity ? (
        <div className="mb-24 animate-in fade-in duration-1000">
           <div className="bg-white rounded-[2rem] p-4 shadow-2xl border-4 border-emerald-800/20 overflow-hidden relative">
             {isFetchingActivities && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="flex flex-col items-center">
                   <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                   <div className="text-emerald-800 font-black text-xl tracking-widest uppercase">Veri Bekleniyor...</div>
                 </div>
               </div>
             )}
             <div className="flex justify-between items-center mb-6 px-4">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => exportTableToExcel('activity-table', `Faaliyet_Cizelgesi_${filterStartDate}_${filterEndDate}`)}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    EXCEL İNDİR
                  </button>
                </div>
             </div>
             <ActivityGrid 
               activities={filteredActivities} 
               startDate={new Date(filterStartDate)} 
               endDate={new Date(filterEndDate)} 
               title={`${new Date(filterStartDate).toLocaleDateString('tr-TR')} - ${new Date(filterEndDate).toLocaleDateString('tr-TR')} FAALİYET ÇİZELGESİ`} 
               onExport={() => exportTableToMHTML('activity-table', `Faaliyet_Cizelgesi_${filterStartDate}_${filterEndDate}`)} 
               sortByCagriKodu={sortByCagriKodu}
             />
           </div>
        </div>
      ) : (
        <div className="mb-24 animate-in fade-in duration-1000">
          <div className="flex flex-col lg:flex-row gap-6 lg:justify-between lg:items-end mb-12 px-4 md:px-6">
             <div className="w-full lg:w-3/5">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-tight">ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU</h2>
                {historicalFleet !== null && (
                  <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl inline-block font-black text-xs uppercase tracking-widest">
                     Bu rapor geçmiş tarihli veridir.
                  </div>
                )}
                <p className="text-emerald-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] sm:tracking-[0.8em] mt-4 border-l-4 border-emerald-500 pl-4">Platform Bazlı Durum ve Gövde Uçuş Saati</p>
             </div>
             <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
                {filterType === 'AT-802' && (
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button 
                      onClick={async () => {
                        const res = await exportAT802DailyStatusToPDF(AT802_SCRIPT_URL, '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4');
                        if (!res.success) alert(res.message);
                      }}
                      className="bg-red-700 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={3}/></svg>
                      GÜNLÜK DURUM (PDF)
                    </button>
                    <button 
                      onClick={async () => {
                        const res = await exportAT802CiktiPDF(AT802_SCRIPT_URL, '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4');
                        if (!res.success) alert(res.message);
                      }}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={3}/></svg>
                      100 SAAT TAKİP (PDF)
                    </button>
                  </div>
                )}
                <button onClick={exportFleetToExcel} className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center w-full sm:w-auto">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={3}/></svg>
                    EXCEL İNDİR
                </button>
                <div className="relative w-full sm:w-[260px] md:w-[320px] lg:w-[400px]">
                  <input type="text" placeholder="Kuyruk, Tip veya Konum Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-12 py-4 bg-black/60 text-white rounded-[2rem] border-2 border-white/10 outline-none font-bold focus:border-emerald-500 transition-all shadow-2xl backdrop-blur-xl" />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
                </div>
             </div>
          </div>

          <div id="summary-container" className="bg-white p-3 sm:p-8 rounded-sm shadow-2xl overflow-hidden font-sans border border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 relative">
               <div className="hidden sm:block sm:w-1/4"></div>
               <h2 className="text-center text-lg sm:text-2xl font-black text-gray-800 uppercase tracking-tight flex-grow">ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU</h2>
               <div className="w-full sm:w-1/4 text-center sm:text-right text-red-600 font-black text-xl">
                  {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
               </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table id="inventory-table" className="min-w-[1200px] lg:w-full border-collapse border-[1.5px] border-black text-[12px] table-auto">
                <thead>
                  <tr className="bg-[#d9d9d9]">
                    <th className="border border-black px-2 py-3 text-center font-black w-14">SIRA NO</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-32">HAVA ARACI TİPİ</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-24">ÇAĞRI KODU</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-36">KUYRUK NUMARASI</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-44 min-w-[170px]">KONUM</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-24">DURUM</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-36">DURUM AYRINTISI</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-24">GÖVDE SAATİ</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-24">FAYDALI SAAT</th>
                    <th className="border border-black px-3 py-3 text-left font-black w-[400px] min-w-[340px]">AÇIKLAMA</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {(() => {
                    const rowSpans: number[] = [];
                    let idx = 0;
                    while (idx < filteredFleet.length) {
                      let span = 1;
                      while (idx + span < filteredFleet.length && filteredFleet[idx + span].tip === filteredFleet[idx].tip) {
                        span++;
                      }
                      rowSpans.push(span);
                      for (let s = 1; s < span; s++) {
                        rowSpans.push(0);
                      }
                      idx += span;
                    }

                    return filteredFleet.map((a, i) => {
                      const isKazaKirim = a.assignedCode === 'KK' || (a.durumAyrintisi && a.durumAyrintisi.toUpperCase().includes('KAZA KIRIM'));
                      const hasOplAlert = a.oplAlerts && a.oplAlerts.length > 0 && !isKazaKirim;
                      const isWeeklyAlertOnly = hasOplAlert && a.oplAlerts!.every(al => al.includes('haftalık') || al.includes('Haftalık'));
                      const isFaal = String(a.durum).toUpperCase().includes("FAAL") && !String(a.durum).toUpperCase().includes("GAYRİ") && !String(a.durum).toUpperCase().includes("GAYRI");
                      const showTypeTd = rowSpans[i] > 0;
                      const typeSpan = rowSpans[i];

                      return (
                        <tr key={i} className={`hover:bg-gray-100 transition-colors cursor-pointer group ${hasOplAlert ? (isWeeklyAlertOnly ? 'animate-yellow-blink' : 'animate-intense-blink') : ''} ${historicalFleet !== null ? 'opacity-60 cursor-default' : 'active:scale-[0.99]'}`} onClick={() => historicalFleet === null && setSelectedAircraft(a)}>
                          <td className="border border-black px-2 py-2.5 text-center font-black text-gray-900 relative overflow-hidden">
                            <div className="relative w-full h-full flex items-center justify-center min-h-[1.5rem]">
                              {/* Sıra numarası normalde görünür, hover esnasında küçülüp kaybolur */}
                              <span className="transition-all duration-300 transform group-hover:scale-0 group-hover:opacity-0 block font-black text-xs">
                                {i + 1}
                              </span>
                              {/* Göz simgesi / detayı göster ikonu hover esnasında pürüzsüzce belirir */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 text-emerald-600">
                                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                            </div>
                          </td>
                          {showTypeTd && (
                            <td rowSpan={typeSpan} className="border border-black px-3 py-2.5 text-center font-black text-gray-900 bg-gray-50 uppercase">
                              {a.tip}
                            </td>
                          )}
                          <td className="border border-black px-3 py-2.5 text-center font-bold text-gray-900">{a.cagriKodu}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-bold text-gray-900">
                          {a.kuyrukNo} 
                          <span className="text-red-600 font-black ml-1">
                            {(() => {
                              const tail = String(a.kuyrukNo).trim().toUpperCase();
                              if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return '(DA)';
                              if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031', 'OR-2039', 'OR-2040'].includes(tail)) return '(SA)';
                              if (tail === 'OR-2036') return '(DL)';
                              if (tail === 'OR-2038') return '(SL)';
                              if (tail === 'OR-1020') return '(H)';
                              return '';
                            })()}
                          </span>
                          {hasOplAlert && !isWeeklyAlertOnly && (
                            <>
                              <br />
                              <div className="inline-flex items-center justify-center text-red-600 animate-bounce mt-1">
                                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2L1 21h22L12 2z" />
                                  <path d="M12 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-4h-2V9h2v4z" fill="white" />
                                </svg>
                              </div>
                            </>
                          )}
                        </td>
                        <td className="border border-black px-3 py-2.5 text-center font-bold text-gray-900 uppercase whitespace-nowrap">{a.konum}</td>
                        <td className={`border border-black px-3 py-2.5 text-center font-black ${isFaal ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#ffebee] text-[#c62828]'}`}>{a.durum.toUpperCase()}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-black text-gray-900 uppercase">{a.durumAyrintisi !== '-' ? a.durumAyrintisi : ''}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-black text-[#FF6B00] text-base">{a.govdeUcusSaati || '-'}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-black text-[#1a73e8] text-base">{formatToHHMM(a.faydaliSaat, a.tip)}</td>
                        <td className="border border-black px-4 py-2 text-left text-[11px] leading-tight text-gray-600 italic whitespace-pre-wrap relative">
                          <div className="flex justify-between items-center w-full min-h-[1.5rem]">
                            <span className="flex-1 pr-14">{a.aciklama}</span>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300 bg-emerald-700 text-white font-black text-[9px] px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 uppercase tracking-widest not-italic">
                              DETAY <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} navigation-index=""><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                })()}
              </tbody>
              </table>
            </div>

            <div className="mt-8 border-t-2 border-black/10 pt-6">
              <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 text-[12px] font-black">
                {/* Sol Taraf: Hava Aracı Tipleri */}
                <div className="flex flex-wrap gap-x-8 gap-y-3 shrink-0">
                  <div><span className="text-red-600 mr-1 font-black">H:</span> HELİTAK</div>
                  <div><span className="text-red-600 mr-1 font-black">SA:</span> SINGLE AMFİBİ</div>
                  <div><span className="text-red-600 mr-1 font-black">DA:</span> DUAL AMFİBİ</div>
                  <div><span className="text-red-600 mr-1 font-black">SL:</span> SINGLE LAND</div>
                  <div><span className="text-red-600 mr-1 font-black">DL:</span> DUAL LAND</div>
                </div>

                {/* Sağ Taraf: Renkli Dolgu İkaz Açıklamaları */}
                <div className="flex flex-col md:flex-row gap-6 xl:border-l-2 xl:border-black/10 xl:pl-8 w-full xl:w-auto">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-5 h-5 bg-[#fee2e2] border border-red-300 rounded shrink-0" />
                    <div className="text-[11px] leading-tight text-gray-700">
                      <span className="font-black text-red-600 uppercase block">Kırmızı Dolgulu Satır / Kırmızı İkaz</span>
                      Ömürlü parçaların takibine yönelik aktif ikazların bulunduğunu belirtir.
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-5 h-5 bg-[#fef9c3] border border-yellow-300 rounded shrink-0" />
                    <div className="text-[11px] leading-tight text-gray-700">
                      <span className="font-black text-amber-500 uppercase block font-semibold">Sarı Dolgulu Satır (İKAZ)</span>
                      FRDS TEST ve MOTOR ÇALIŞTIRMA tarihlerinin yaklaştığını belirten ikazdır.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAircraft && (
        <AircraftDetailModal 
          aircraft={selectedAircraft} 
          activities={activities}
          onClose={() => setSelectedAircraft(null)} 
          onEdit={() => {
            requireAuth(selectedAircraft.tip, () => {
              setSelectedAircraft(null);
              setCurrentView('update');
            });
          }}
          onViewLogs={(openLogs) => {
            requireAuth(selectedAircraft.tip, openLogs);
          }}
        />
      )}
      {isAdminOpen && <AdminPanel notifications={notifications} initialData={fleet} onSave={(configs, data) => handleSyncFromExcel(data, configs?.[0]?.aircraftType || 'GENEL', true)} onOverride={handleManualOverride} onSyncLogs={syncLogs} onCleanupLogs={cleanupLogs} onClose={() => setIsAdminOpen(false)} />}
      
      {pendingAction && (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#052e16] w-full max-w-md p-10 rounded-[3rem] border border-green-800/40 shadow-2xl">
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase mb-2">ŞİFRE GEREKLİ</h2>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-8">{pendingAction.type} tipi için yetkilendirme gerekiyor</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleTypeAuth(formData.get('pass') as string);
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">ŞİFRE</label>
                <input name="pass" type="password" required className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all" />
                {authError && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{authError}</p>}
              </div>
              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setPendingAction(null)} className="flex-1 py-4 rounded-2xl border border-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-widest">İPTAL</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/50">ONAYLA</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#052e16] w-full max-w-md p-10 rounded-[3rem] border border-green-800/40 shadow-2xl">
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase mb-2">ADMİN GİRİŞİ</h2>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-8">Lütfen yetkili bilgilerinizi giriniz</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleLogin(formData.get('user') as string, formData.get('pass') as string);
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">KULLANICI ADI</label>
                <input name="user" type="text" required className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">ŞİFRE</label>
                <input name="pass" type="password" required className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsAuthModalOpen(false)} className="flex-1 py-4 rounded-2xl border border-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-widest">İPTAL</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">GİRİŞ YAP</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <GovdeSorgulaModal 
        isOpen={isGovdeSorguOpen} 
        onClose={() => setIsGovdeSorguOpen(false)} 
        fleet={fleet}
      />

      {/* Intra-Day Activity Modal */}
      {showIntraDayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[500] p-4">
          <div className="bg-[#052e16] w-full max-w-md p-10 rounded-[3rem] border border-green-800/40 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-white font-black text-2xl tracking-tighter uppercase">GÜN İÇİ FAALİYET KAYDI</h3>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">Faaliyet Log Girişi</p>
              </div>
              <button onClick={() => setShowIntraDayModal(false)} className="text-emerald-500 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">HAVA ARACI SEÇİNİZ</label>
                <select 
                  className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all appearance-none"
                  onChange={(e) => setSelectedAircraftForIntraDay(fleet.find(a => a.kuyrukNo === e.target.value) || null)}
                  value={selectedAircraftForIntraDay?.kuyrukNo || ''}
                >
                  <option value="" className="bg-emerald-950">Seçiniz...</option>
                  {fleet.map(a => (
                    <option key={a.kuyrukNo} value={a.kuyrukNo} className="bg-emerald-950">{a.kuyrukNo} - {a.tip}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">BAŞLANGIÇ SAATİ</label>
                  <input 
                    type="time" 
                    className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all"
                    value={intraDayStartTime}
                    onChange={(e) => setIntraDayStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">BİTİŞ SAATİ</label>
                  <input 
                    type="time" 
                    className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all"
                    value={intraDayEndTime}
                    onChange={(e) => setIntraDayEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">DURUM</label>
                <select 
                  className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all appearance-none"
                  value={intraDayStatus}
                  onChange={(e) => setIntraDayStatus(e.target.value as DailyStatusCode)}
                >
                  <option value="F" className="bg-emerald-950">FAAL</option>
                  <option value="A" className="bg-emerald-950">ARIZA</option>
                  <option value="B" className="bg-emerald-950">BAKIM</option>
                  <option value="BB" className="bg-emerald-950">BAKIM BEKLER</option>
                  <option value="TBU" className="bg-emerald-950">TEKNİK BÜLTEN UYGULAMASI</option>
                  <option value="KM" className="bg-emerald-950">KABUL MUAYENESİ</option>
                  <option value="TB" className="bg-emerald-950">TECRÜBE BEKLER</option>
                  <option value="PB" className="bg-emerald-950">PARÇA BEKLER</option>
                  <option value="KK" className="bg-emerald-950">KAZA KIRIM</option>
                  <option value="X" className="bg-emerald-950">OLMADIĞI GÜNLER</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">AÇIKLAMA / NOT</label>
                <textarea 
                  className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all h-24 resize-none"
                  value={intraDayDescription}
                  onChange={(e) => setIntraDayDescription(e.target.value)}
                  placeholder="Faaliyet detayı giriniz..."
                />
              </div>

              <button 
                onClick={() => {
                  if (selectedAircraftForIntraDay) {
                    handleSaveIntraDay({
                      kuyrukNo: selectedAircraftForIntraDay.kuyrukNo,
                      tip: selectedAircraftForIntraDay.tip,
                      startTime: intraDayStartTime,
                      endTime: intraDayEndTime,
                      status: intraDayStatus,
                      description: intraDayDescription
                    }).then(success => {
                      if (success) {
                        setShowIntraDayModal(false);
                        setIntraDayDescription('');
                        setIntraDayStartTime('');
                        setIntraDayEndTime('');
                      }
                    });
                  }
                }}
                disabled={isSavingIntraDay}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-xs"
              >
                {isSavingIntraDay ? 'KAYDEDİLİYOR...' : 'FAALİYETİ KAYDET'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
