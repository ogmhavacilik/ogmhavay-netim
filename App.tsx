
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
import { fetchAircraftDataFromAppsScript, fetchOPLData, formatToHHMM } from './services/sheetService';
import { exportAT802DailyStatusToPDF, exportOPLToPDF } from './services/pdfService';
import { exportTableToMHTML } from './services/mhtmlService';
import { MOCK_ACTIVITY_GRID } from './constants';
import { generateFleetExcelHtml, exportTableToExcel } from './src/services/excelService';
import { X, Download, Activity, Clock } from 'lucide-react';

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
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'update'>('landing');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [activities, setActivities] = useState<AircraftActivity[]>([]);
  
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [oplCheckStatus, setOplCheckStatus] = useState<Record<string, 'pending' | 'checking' | 'done'>>({});
  
  const [filterType, setFilterType] = useState('Tümü');
  const [filterTail, setFilterTail] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStartDate, setFilterStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [filterEndDate, setFilterEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
  const [hideKazaKirim, setHideKazaKirim] = useState(true);

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
      const response = await fetch(LOG_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'saveIntraDayActivity',
          sheetId: MAIL_LOG_SHEET_ID,
          data: {
            ...data,
            date: data.date || new Date().toISOString().split('T')[0]
          }
        })
      });
      
      if (response.ok) {
        fetchPastLogs(); // Refresh activity data
        return true;
      } else {
        console.error("Kayıt sırasında bir hata oluştu.");
        return false;
      }
    } catch (error) {
      console.error('Error saving intra-day activity:', error);
      return false;
    } finally {
      setIsSavingIntraDay(false);
    }
  };

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
        kuyrukNo: 'B3:B16', 
        durum: 'C3:C16', 
        durumAyrintisi: 'D3:D16', 
        konum: 'E3:E16', 
        faydaliSaat: 'V3:AI16', 
        govdeUcusSaati: 'F3:F16',
        aciklama: 'AL3:AL16',   
        gelisTarihi: 'U24:V39',
        gelisKuyrukNo: 'T24:T39',
        bakimTakvimTarih: 'AJ3:AJ16',
        frdsTestDateMain: 'M3:M16',
        frdsTestDateAlt: 'N3:N16'
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
        bakim40H: 'L4:L6',
        bakim120H: 'N4:N6',
        bakim480H: 'J4:J6',
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
        <tr><td style="background-color: #FFFF00; color: #000000; border: 1px solid black;">KM</td><td colspan="4" style="border: 1px solid black;">KABUL MUAYENESİ</td></tr>
        <tr><td style="background-color: #FF0000; color: #FFFFFF; border: 1px solid black;">A</td><td colspan="4" style="border: 1px solid black;">ARIZA</td></tr>
        <tr><td style="background-color: #FF0000; color: #FFFFFF; border: 1px solid black;">PB</td><td colspan="4" style="border: 1px solid black;">PARÇA BEKLER</td></tr>
        <tr><td style="background-color: #FF0000; color: #FFFFFF; border: 1px solid black;">KK</td><td colspan="4" style="border: 1px solid black;">KAZA KIRIM</td></tr>
        <tr><td style="background-color: #7030A0; color: #FFFFFF; border: 1px solid black;">X</td><td colspan="4" style="border: 1px solid black;">OLMADIĞI GÜNLER</td></tr>
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
        const res = await fetch(LOG_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateLogEntry',
            sheetId: MAIL_LOG_SHEET_ID,
            kuyrukNo: kuyrukNo,
            date: displayDateStr,
            newCode: newCode,
            tip: aircraft?.tip || '',
            durum: aircraft?.durumAyrintisi || 'MANUEL GÜNCELLEME'
          })
        });
        const result = await res.json();
        console.log("Update log response:", result);
        if (result.success) {
          console.log(`Log updated successfully for ${kuyrukNo}`);
        } else {
          console.error(`Log update failed: ${result.message}`);
        }
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
        const existingIdx = updatedFleet.findIndex(a => a.kuyrukNo === incoming.kuyrukNo);
        const existing = existingIdx !== -1 ? updatedFleet[existingIdx] : null;
        
        if (existing && initialSyncDone.current) {
          ['durum', 'konum', 'durumAyrintisi', 'faydaliSaat', 'govdeUcusSaati'].forEach(col => {
            const key = col as keyof Aircraft;
            const oldVal = String(existing[key] || '').trim();
            const newVal = String(incoming[key] || '').trim();

            if (oldVal !== newVal) {
              const labelMap: Record<string, string> = {
                'durum': 'DURUM',
                'konum': 'KONUM',
                'durumAyrintisi': 'DURUM AYRINTISI',
                'faydaliSaat': 'FAYDALI SAAT',
                'govdeUcusSaati': 'GÖVDE UÇUŞ SAATİ'
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
          updatedFleet[existingIdx] = { ...updatedFleet[existingIdx], ...incoming } as Aircraft;
        } else {
          updatedFleet.push(incoming as Aircraft);
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

        // Log to central log if requested
        if (shouldLog && LOG_SCRIPT_URL) {
          fetch(LOG_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'logSingleAircraftActivity',
              sheetId: MAIL_LOG_SHEET_ID,
              data: {
                date: formattedDate,
                kuyrukNo: incoming.kuyrukNo,
                tip: incoming.tip || platform,
                govdeUcusSaati: incoming.govdeUcusSaati || 0,
                faydaliSaat: incoming.faydaliSaat || 0,
                konum: incoming.konum || 'ANKARA',
                durum: incoming.durum || Status.FAAL,
                durumAyrintisi: incoming.durumAyrintisi || '-',
                aciklama: incoming.aciklama || '',
                analizKodu: incoming.assignedCode || 'F'
              }
            })
          }).catch(err => console.error("Sync log error:", err));
        }
      });

      return updatedFleet;
    });

    if (discoveredChanges.length > 0) {
      setNotifications(prev => [...discoveredChanges, ...prev].slice(0, 100));
    }
  }, []);

  const fetchPastLogs = async () => {
    if (!LOG_SCRIPT_URL) return Promise.resolve();
    
    try {
      const res = await fetch(LOG_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ 
          action: 'getFaaliyetLog',
          sheetId: MAIL_LOG_SHEET_ID,
          intraDaySheetName: 'Saatlik Faaliyet Günlüğü',
          dailySheetName: 'Envanter Log'
        })
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const result = await res.json();
      console.log("Past logs result:", result);
      
      // Handle different response structures
      const data = result.data || result;
      const logData = data.faaliyetLog || data.dailyLogs || [];
      const intraDayData = data.intraDayLog || data.intraDayLogs || data.hourlyLogs || [];
      
      setEnvanterLog(logData.map((logEntry: any) => {
        const tarihStr = String(logEntry.tarih || logEntry.Tarih || '').trim();
        const kuyrukNo = String(logEntry.kuyrukNo || logEntry['Kuyruk No'] || logEntry.tailNumber || '').trim();
        let dayNum = -1, monthNum = -1, yearNum = -1;
        
        if (tarihStr.includes('T')) {
          const d = new Date(tarihStr);
          if (!isNaN(d.getTime())) {
            dayNum = d.getUTCDate();
            monthNum = d.getUTCMonth();
            yearNum = d.getUTCFullYear();
          }
        } else if (tarihStr.includes('-')) {
          const parts = tarihStr.split(/[- :]/);
          if (parts.length >= 3) {
            if (parts[0].length === 4) {
              yearNum = parseInt(parts[0], 10);
              monthNum = parseInt(parts[1], 10) - 1;
              dayNum = parseInt(parts[2], 10);
            } else {
              dayNum = parseInt(parts[0], 10);
              monthNum = parseInt(parts[1], 10) - 1;
              yearNum = parseInt(parts[2], 10);
            }
          }
        } else if (tarihStr.includes('/')) {
          const parts = tarihStr.split('/');
          if (parts.length === 3) {
            dayNum = parseInt(parts[0], 10);
            monthNum = parseInt(parts[1], 10) - 1;
            yearNum = parseInt(parts[2], 10);
          }
        } else if (tarihStr.includes('.')) {
          const parts = tarihStr.split('.');
          if (parts.length === 3) {
            dayNum = parseInt(parts[0], 10);
            monthNum = parseInt(parts[1], 10) - 1;
            yearNum = parseInt(parts[2], 10);
          }
        }

        if (dayNum !== -1) {
          return {
            ...logEntry,
            kuyrukNo: kuyrukNo,
            tarih: `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          };
        }
        return logEntry;
      }));

      console.log(`Processing ${logData.length} daily logs and ${intraDayData.length} intra-day logs`);

      setActivities(prevActivities => {
        const activityMap = new Map<string, AircraftActivity>();
        // Mevcut aktiviteleri haritaya ekle
        prevActivities.forEach(act => {
          activityMap.set(act.kuyrukNo, { ...act });
        });

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const normalizedEnvanterLog: any[] = [];

        // Process Daily Logs
        logData.forEach((logEntry: any) => {
          try {
            const kuyrukNo = String(logEntry.kuyrukNo || logEntry['Kuyruk No'] || logEntry.tailNumber || '').trim();
            if (!kuyrukNo) return;

            const tarihStr = String(logEntry.tarih || logEntry.Tarih || '').trim();
            const durumAyrintisi = String(logEntry.durum || logEntry.Durum || '').trim().toUpperCase();
            const analizKodu = logEntry.analizKodu ? String(logEntry.analizKodu).trim() : null;

            let dayNum = -1, monthNum = -1, yearNum = -1;
            
            // Tarih formatlarını dene
            if (tarihStr.includes('T') || (tarihStr.includes('-') && !tarihStr.includes('.'))) {
              const d = new Date(tarihStr);
              if (!isNaN(d.getTime())) {
                dayNum = d.getDate();
                monthNum = d.getMonth();
                yearNum = d.getFullYear();
              }
            } else if (tarihStr.includes('/')) {
              const parts = tarihStr.split('/');
              if (parts.length === 3) {
                // TR formatı varsay (DD/MM/YYYY)
                dayNum = parseInt(parts[0], 10);
                monthNum = parseInt(parts[1], 10) - 1;
                yearNum = parseInt(parts[2], 10);
              }
            } else if (tarihStr.includes('.')) {
              const parts = tarihStr.split('.');
              if (parts.length === 3) {
                dayNum = parseInt(parts[0], 10);
                monthNum = parseInt(parts[1], 10) - 1;
                yearNum = parseInt(parts[2], 10);
              }
            }

            if (dayNum !== -1) {
              const dateStrKey = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              normalizedEnvanterLog.push({
                ...logEntry,
                kuyrukNo: kuyrukNo,
                tarih: dateStrKey
              });

              // Bugünün verisini logdan değil, canlı veriden alıyoruz (ancak logda varsa ve canlıda yoksa eklenebilir)
              let code: DailyStatusCode = 'F';
              if (analizKodu) {
                code = analizKodu as DailyStatusCode;
              } else {
                if (durumAyrintisi.includes('BAKIM')) code = 'B';
                else if (durumAyrintisi.includes('ARIZA') || durumAyrintisi.includes('PARÇA BEKLER') || durumAyrintisi.includes('KAZA KIRIM')) code = 'A';
                else if (durumAyrintisi.includes('OLMADIĞI GÜNLER')) code = 'X';
                else if (durumAyrintisi !== '-' && durumAyrintisi !== '' && durumAyrintisi !== 'FAAL') code = 'B';
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
                  intraDayDurations: {}
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
          if (!dateStr) return;

          const key = `${kuyrukNo}_${dateStr}`;
          if (!intraDayGroups.has(key)) intraDayGroups.set(key, []);
          intraDayGroups.get(key)!.push(log);
        });

        intraDayGroups.forEach((logs, key) => {
          const [kuyrukNo, dateStr] = key.split('_');
          let act = activityMap.get(kuyrukNo);
          if (!act) {
            // Create activity if it doesn't exist
            act = {
              kuyrukNo: kuyrukNo,
              cagriKodu: getCallSignByTail(kuyrukNo),
              tip: 'Bilinmiyor',
              dailyStatuses: {},
              hourlyStatuses: {},
              intraDayCompletions: {},
              intraDayDurations: {}
            };
            activityMap.set(kuyrukNo, act);
          }

          let totalGayriFaalMins = 0;
          let hasFaal = false;
          let hasGayriFaal = false;

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
              hasFaal = true;
            } else if (statusRaw !== '' || startStr !== '' || endStr !== '') {
              hasGayriFaal = true;
              
              let code = statusRaw ? statusRaw.substring(0, 2) : 'B';
              if (statusRaw.includes('BAKIM')) code = 'B';
              else if (statusRaw.includes('ARIZA')) code = 'A';
              else if (statusRaw.includes('PARÇA')) code = 'PB';
              else if (statusRaw.includes('KABUL')) code = 'KM';
              else if (statusRaw.includes('BEKLER') && statusRaw.includes('BAKIM')) code = 'BB';
              else if (statusRaw.includes('KAZA')) code = 'KK';
              else if (statusRaw.includes('OLMADIĞI')) code = 'X';
              else if (statusRaw.includes('TECRÜBE')) code = 'TB';

              const parseExactMins = (timeStr: string) => {
                if (!timeStr) return -1;

                // Handle full date string from Google Sheets (e.g., "Sat Dec 30 1899 08:00:00 GMT+0200 (EET)")
                if (timeStr.includes('GMT') || timeStr.includes('T')) {
                  const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})/);
                  if (match) {
                    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
                  }
                  const d = new Date(timeStr);
                  if (!isNaN(d.getTime())) {
                    return d.getHours() * 60 + d.getMinutes();
                  }
                }

                if (!timeStr.includes(':')) return -1;
                
                // Handle "08:00" or "08:00:00"
                const parts = timeStr.split(':');
                const h = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                
                if (isNaN(h) || isNaN(m)) return -1;
                return h * 60 + m;
              };

              const sMins = parseExactMins(startStr);
              const eMins = parseExactMins(endStr);

              if (sMins !== -1) {
                events.push({ hour: Math.floor(sMins / 60), exactMins: sMins, type: 'down', status: code, desc: description });
              }
              if (eMins !== -1) {
                events.push({ hour: Math.floor(eMins / 60), exactMins: eMins, type: 'up', status: code, desc: description });
              }
            }
          });

          // Sort events by exact time
          events.sort((a, b) => a.exactMins - b.exactMins);

          // Determine daily status
          if (!act.dailyStatuses) act.dailyStatuses = {};
          const dailyStatus = act.dailyStatuses[dateStr] || 'F';
          if (dailyStatus !== 'F') hasGayriFaal = true;
          else hasFaal = true;

          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const currentMins = now.getHours() * 60 + now.getMinutes();
          const endOfDayMins = isToday ? currentMins : 24 * 60;

          totalGayriFaalMins = 0;
          let isDown = false;
          let lastDownMins = 0;

          if (events.length > 0 && events[0].type === 'up') {
            isDown = true;
            lastDownMins = 0;
          } else if (events.length === 0 && dailyStatus !== 'F') {
            totalGayriFaalMins = endOfDayMins;
          }

          for (const ev of events) {
            if (ev.type === 'down' && !isDown) {
              isDown = true;
              lastDownMins = ev.exactMins;
            } else if (ev.type === 'up' && isDown) {
              isDown = false;
              // If the 'up' event is in the future today, cap it at current time
              const upMins = isToday ? Math.min(ev.exactMins, currentMins) : ev.exactMins;
              totalGayriFaalMins += Math.max(0, upMins - lastDownMins);
            }
          }

          if (isDown) {
            totalGayriFaalMins += Math.max(0, endOfDayMins - lastDownMins);
          }

          let currentState = 'F';
          let currentDesc = '';

          if (events.length > 0) {
            if (events[0].type === 'up') {
              currentState = events[0].status;
              currentDesc = 'Gayri faal durum devam ediyor';
            }
          } else if (dailyStatus !== 'F') {
            currentState = dailyStatus;
            const logWithDesc = logs.find(l => String(l.description || l.aciklama || l.Açıklama || '').trim() !== '');
            if (logWithDesc) {
              currentDesc = String(logWithDesc.description || logWithDesc.aciklama || logWithDesc.Açıklama || '').trim();
            }
          }

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
            
            let displayDesc = currentDesc;
            if (currentState === 'F' && eventsAtHour.length === 0) {
              displayDesc = '';
            }
            if (displayDesc) {
              hourlyDescriptions[hStr] = displayDesc;
            }
          }

          if (!act.intraDayDurations) act.intraDayDurations = {};
          act.intraDayDurations[dateStr] = totalGayriFaalMins;
          
          if (!act.intraDayEvents) act.intraDayEvents = {};
          act.intraDayEvents[dateStr] = events;
          
          if (!act.hourlyStatuses) act.hourlyStatuses = {};
          act.hourlyStatuses[dateStr] = { ...act.hourlyStatuses[dateStr], ...hourlyStatuses } as Record<string, DailyStatusCode>;
          
          if (!act.hourlyDescriptions) act.hourlyDescriptions = {};
          act.hourlyDescriptions[dateStr] = { ...act.hourlyDescriptions[dateStr], ...hourlyDescriptions };
          
          // Karma day: Both FAAL and GAYRİ FAAL exist
          if (hasFaal && hasGayriFaal) {
            if (!act.intraDayCompletions) act.intraDayCompletions = {};
            act.intraDayCompletions[dateStr] = true;
          }
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
    
    // Geçmiş logları beklemeden hemen çekmeye başla
    fetchPastLogs();

    try {
      const fetchedFleet: Aircraft[] = [];

      await Promise.all(SHEET_CONFIGS.map(async (config) => {
        try {
          const data = await fetchAircraftDataFromAppsScript(config.appsScriptUrl, config);
          if (data && data.length > 0) {
            handleSyncFromExcel(data, config.aircraftType, true);
            fetchedFleet.push(...(data as Aircraft[]));
          }
        } catch (e) {
          console.error(`Sync error for ${config.aircraftType}:`, e);
        }
      }));

      // 1-dakikalık senkronizasyon sırasında Envanter Log'u güncelle
      if (fetchedFleet.length > 0) {
        try {
          await fetch(LOG_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'logAllAircraftActivity',
              sheetId: MAIL_LOG_SHEET_ID,
              fleetData: fetchedFleet.map(a => ({
                kuyrukNo: a.kuyrukNo,
                tip: a.tip,
                govdeUcusSaati: a.govdeUcusSaati,
                faydaliSaat: a.faydaliSaat,
                konum: a.konum,
                durum: a.durum,
                durumAyrintisi: a.durumAyrintisi,
                aciklama: a.aciklama
              }))
            })
          });
        } catch (logError) {
          console.error("Otomatik log güncelleme hatası:", logError);
        }
      }

      // Log saving removed from frontend to prevent duplicate logs on refresh.
      // Now handled by server-side trigger at midnight.

    } finally {
      initialSyncDone.current = true;
      setIsSyncing(false);
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

      // AT-802 Test Tarihi Kontrolleri
      if (aircraft.tip === 'AT-802') {
        const checkTestDate = (dateStr: string | undefined, label: string) => {
          if (!dateStr || dateStr === '-') return;
          const lastDate = new Date(dateStr);
          if (isNaN(lastDate.getTime())) return;
          
          const nextDate = new Date(lastDate);
          nextDate.setDate(nextDate.getDate() + 7);
          
          const today = new Date();
          const diffTime = nextDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 2 && diffDays >= 0) {
            alerts.push(`${label}: Haftalık çalışmaya son ${diffDays} gün kaldı!`);
          } else if (diffDays < 0) {
            alerts.push(`${label}: Haftalık çalışma tarihi geçti! (${Math.abs(diffDays)} gün gecikti)`);
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
    const interval = setInterval(runGlobalSync, 60000); 
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
        const res = await fetch(LOG_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
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
          })
        });
        const result = await res.json();
        
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

        const parseHour = (val: any): number | null => {
          if (val === null || val === undefined || String(val).trim() === "" || String(val).toUpperCase() === "N/A") return null;
          if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
            const d = new Date(val);
            const epoch = new Date(Date.UTC(1899, 11, 30));
            return (d.getTime() - epoch.getTime()) / (1000 * 60 * 60);
          }
          const s = String(val).trim().replace(',', '.');
          if (s.includes(':')) {
            const parts = s.split(':').map(Number);
            if (parts.length >= 2) return (parts[0] || 0) + (parts[1] || 0) / 60;
          }
          const n = parseFloat(s);
          return isNaN(n) ? null : n;
        };

        const historyFleet: Aircraft[] = filtered.map((row: any) => {
          const govdeSaat = parseHour(row.govdeUcusSaati);
          let h = govdeSaat !== null ? Math.floor(govdeSaat) : 0;
          let m = govdeSaat !== null ? Math.round((govdeSaat - h) * 60) : 0;
          if (m === 60) {
            h += 1;
            m = 0;
          }
          const govdeStr = govdeSaat !== null ? `${h}:${m.toString().padStart(2, '0')}` : '-';

          return {
            kuyrukNo: row.kuyrukNo || '',
            cagriKodu: getCallSignByTail(row.kuyrukNo || ''),
            tip: row.tip || '',
            durum: row.durum || '',
            durumAyrintisi: row.durumAyrintisi || '',
            konum: row.konum || '',
            faydaliSaat: parseHour(row.faydaliSaat) || 0,
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

    const order = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];

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

      // Same type, sort by ORMAN-XX or Kuyruk No for AT-802
      const getOrder = (cagriKodu: string) => {
        const match = String(cagriKodu).match(/ORMAN-(\d+)/i);
        if (match) return parseInt(match[1]);
        return 999;
      };

      if (typeA === 'AT-802') {
        return a.kuyrukNo.localeCompare(b.kuyrukNo);
      }
      
      return getOrder(a.cagriKodu) - getOrder(b.cagriKodu);
    });
  }, [fleet, historicalFleet, searchTerm, filterType, filterTail, hideKazaKirim]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
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
  }, [activities, filterType, filterTail, hideKazaKirim]);

  const toggleNote = (kuyrukNo: string) => {
    setExpandedNotes(prev => ({ ...prev, [kuyrukNo]: !prev[kuyrukNo] }));
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
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

  const syncLogs = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${AT802_SCRIPT_URL}?action=sync`);
      const result = await response.json();
      if (result.success) {
        alert('Log senkronizasyonu başarıyla tamamlandı.');
        runGlobalSync(); // Refresh data
      } else {
        alert('Senkronizasyon hatası: ' + result.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Senkronizasyon sırasında bir hata oluştu.');
    } finally {
      setIsSyncing(false);
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

      <div className="flex justify-between items-center mb-12">
         <div className="flex items-center space-x-6">
            <button 
              onClick={() => setCurrentView('landing')}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-emerald-500 hover:bg-white/10 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <div className={`bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 rounded-[1.8rem] flex items-center shadow-2xl backdrop-blur-md ${isSyncing ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
               <div className={`w-3 h-3 rounded-full mr-4 shadow-[0_0_10px_#10b981] ${isSyncing ? 'bg-yellow-400 animate-spin shadow-[0_0_10px_#facc15]' : 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]'}`}></div>
               <span className={`font-black text-[11px] uppercase tracking-[0.5em] ${isSyncing ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {isSyncing ? 'FİLO VERİLERİ ÇEKİLİYOR...' : 'OTOMATİK VERİ TAKİBİ AKTİF'}
               </span>
            </div>
          </div>
          <div className="flex space-x-5">
            <button onClick={() => setShowActivity(!showActivity)} className={`px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl border-2 ${showActivity ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/10 text-white border-white/20'}`}>
              {showActivity ? "ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU" : "FAALİYET ÇİZELGESİ"}
            </button>
            <button 
              onClick={handleAdminClick} 
              className={`relative px-10 py-5 rounded-[2rem] font-black text-[11px] border-2 uppercase tracking-[0.4em] transition-all shadow-lg flex items-center ${notifications.length > 0 ? 'bg-red-900 border-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-[#021a0c] hover:bg-emerald-900 text-white border-emerald-800/50'}`}
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
        <div className="flex items-center ml-auto bg-black/40 px-4 py-2.5 rounded-xl border border-white/10">
          <input type="checkbox" id="hideKazaKirim" checked={hideKazaKirim} onChange={(e) => setHideKazaKirim(e.target.checked)} className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2" />
          <label htmlFor="hideKazaKirim" className="ml-2 text-xs font-black text-white uppercase tracking-widest cursor-pointer">Kaza Kırımları Gizle</label>
        </div>
        <button onClick={() => setIsGovdeSorguOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ml-2">
          Gövde Uçuş Saati Sorgula
        </button>
      </div>

      <div className="mb-14"><Dashboard fleet={filteredFleet} /></div>

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
             />
           </div>
        </div>
      ) : (
        <div className="mb-24 animate-in fade-in duration-1000">
          <div className="flex justify-between items-end mb-12 px-6">
             <div>
                <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic">ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU</h2>
                {historicalFleet !== null && (
                  <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl inline-block font-black text-xs uppercase tracking-widest">
                    Bu rapor geçmiş tarihli veridir.
                  </div>
                )}
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.8em] mt-4 border-l-4 border-emerald-500 pl-4">Platform Bazlı Durum ve Gövde Uçuş Saati</p>
             </div>
             <div className="flex items-center space-x-6">
                {filterType === 'AT-802' && (
                  <div className="flex space-x-3">
                    <button 
                      onClick={async () => {
                        const res = await exportAT802DailyStatusToPDF(AT802_SCRIPT_URL, '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4');
                        if (!res.success) alert(res.message);
                      }}
                      className="bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={3}/></svg>
                      GÜNLÜK DURUM (PDF)
                    </button>
                  </div>
                )}
                <button onClick={exportFleetToExcel} className="bg-emerald-700 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={3}/></svg>
                   EXCEL İNDİR
                </button>
                <div className="relative">
                  <input type="text" placeholder="Kuyruk, Tip veya Konum Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[400px] px-12 py-4 bg-black/60 text-white rounded-[2rem] border-2 border-white/10 outline-none font-bold focus:border-emerald-500 transition-all shadow-2xl backdrop-blur-xl" />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
                </div>
             </div>
          </div>

          <div id="summary-container" className="bg-white p-8 rounded-sm shadow-2xl overflow-hidden font-sans border border-gray-300">
            <div className="flex justify-between items-center mb-6 relative">
               <div className="w-1/4"></div>
               <h2 className="text-center text-2xl font-black text-gray-800 uppercase tracking-tight flex-grow">ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU</h2>
               <div className="w-1/4 text-right text-red-600 font-black text-xl">
                  {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
               </div>
            </div>

            <div className="overflow-x-auto">
              <table id="inventory-table" className="w-full border-collapse border-[1.5px] border-black text-[12px]">
                <thead>
                  <tr className="bg-[#d9d9d9]">
                    <th className="border border-black px-3 py-3 text-center font-black w-28">ÇAĞRI KODU</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-44">KUYRUK NUMARASI</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-24">DURUM</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-36">DURUM AYRINTISI</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-24">GÖVDE SAATİ</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-28">KONUM</th>
                    <th className="border border-black px-3 py-3 text-center font-black w-24">FAYDALI SAAT</th>
                    <th className="border border-black px-3 py-3 text-left font-black">AÇIKLAMA</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredFleet.map((a, i) => {
                    const isKazaKirim = a.assignedCode === 'KK' || (a.durumAyrintisi && a.durumAyrintisi.toUpperCase().includes('KAZA KIRIM'));
                    const hasOplAlert = a.oplAlerts && a.oplAlerts.length > 0 && !isKazaKirim;
                    const isFaal = String(a.durum).toUpperCase().includes("FAAL") && !String(a.durum).toUpperCase().includes("GAYRİ") && !String(a.durum).toUpperCase().includes("GAYRI");
                    return (
                      <tr key={i} className={`hover:bg-gray-100 transition-colors cursor-pointer group ${hasOplAlert ? 'animate-intense-blink' : ''} ${historicalFleet !== null ? 'opacity-60 cursor-default' : 'active:scale-[0.99]'}`} onClick={() => historicalFleet === null && setSelectedAircraft(a)}>
                        <td className="border border-black px-3 py-2.5 text-center font-bold text-gray-900">{a.cagriKodu}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-bold text-gray-900">
                          {a.kuyrukNo} 
                          <span className="text-red-600 font-black ml-1">
                            {(() => {
                              const tail = String(a.kuyrukNo).trim().toUpperCase();
                              if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return '(DA)';
                              if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) return '(SA)';
                              if (tail === 'OR-2036') return '(DL)';
                              if (tail === 'OR-2038') return '(SL)';
                              if (tail === 'OR-1020') return '(H)';
                              return '';
                            })()}
                          </span>
                          {hasOplAlert && (
                            <span className="ml-2 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-bounce shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                              ALERT!
                            </span>
                          )}
                        </td>
                        <td className={`border border-black px-3 py-2.5 text-center font-black ${isFaal ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#ffebee] text-[#c62828]'}`}>{a.durum.toUpperCase()}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-black text-gray-900 uppercase">{a.durumAyrintisi !== '-' ? a.durumAyrintisi : ''}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-black text-[#FF6B00] text-base">{a.govdeUcusSaati || '-'}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-bold text-gray-900 uppercase">{a.konum}</td>
                        <td className="border border-black px-3 py-2.5 text-center font-black text-[#1a73e8] text-base">{formatToHHMM(a.faydaliSaat)}</td>
                        <td className="border border-black px-4 py-2 text-left text-[11px] leading-tight text-gray-600 italic whitespace-pre-wrap">{a.aciklama}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-[12px] font-black border-t-2 border-black/10 pt-6">
               <div><span className="text-red-600 mr-1 font-black">H:</span> HELİTAK</div>
               <div><span className="text-red-600 mr-1 font-black">SA:</span> SINGLE AMFİBİ</div>
               <div><span className="text-red-600 mr-1 font-black">DA:</span> DUAL AMFİBİ</div>
               <div><span className="text-red-600 mr-1 font-black">SL:</span> SINGLE LAND</div>
               <div><span className="text-red-600 mr-1 font-black">DL:</span> DUAL LAND</div>
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
      {isAdminOpen && <AdminPanel notifications={notifications} initialData={fleet} onSave={(configs, data) => handleSyncFromExcel(data, configs?.[0]?.aircraftType || 'GENEL', true)} onOverride={handleManualOverride} onSyncLogs={syncLogs} onClose={() => setIsAdminOpen(false)} />}
      
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
                  <option value="KM" className="bg-emerald-950">KABUL MUAYENESİ</option>
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
                onClick={handleSaveIntraDay}
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
