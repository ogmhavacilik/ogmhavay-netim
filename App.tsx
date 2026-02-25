
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AircraftDetailModal from './components/AircraftDetailModal';
import ActivityGrid from './components/ActivityGrid';
import SplashScreen from './components/SplashScreen';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import DataUpdateForm from './components/DataUpdateForm';
import { Aircraft, Status, SheetConfig, AppNotification, DailyStatusCode, AircraftActivity } from './types';
import { fetchAircraftDataFromAppsScript, fetchOPLData, formatToHHMM } from './services/sheetService';

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

  const BELL_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
  const AT802_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx-iI6f4MP_bh03IsxLC56bkJ_WV8OFt5rNAlxda6gzumO1bG838CFRdzA0H0jXKNS-7g/exec";
  const T70_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcELr64A09o-x3jByNreNHbiurVHrNnGGV63XgQgKvr4kOz9gGqXLLINRRVAX8LcBHDQ/exec"; 
  const B360_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzD1GdmzKz2Q3r1-Whq8ueFW9ixN6faTjHkOUdoLxoN2NIRY6hANFlrMXQcVTGk1ZILSg/exec";
  const C650_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdmkAhcQgC6kqHtEKUCKfcc5JKphOzyt_VbOfuI5hv6qCuyRl-k6h46-gaIGakydo/exec";
  const LOG_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxz9VHGkSQ9Go9Yt2UHcIxN08vUSXbGeQJs7Jgar86bFXlmC977OD0dgumFcZgXK252/exec";
  
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
        kuyrukNo: 'B3:B14', 
        durum: 'C3:C14', 
        durumAyrintisi: 'D3:D14', 
        konum: 'E3:E14', 
        faydaliSaat: 'V3:AI14', 
        aciklama: 'AL3:AL14',   
        govdeUcusSaati: 'F3:F14',
        gelisTarihi: 'U24:V35',
        gelisKuyrukNo: 'T24:T35'
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
        bakimTakvimTarih: 'K4:K6',
        faydaliSaat: 'N4:N6',
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

  const handleManualOverride = (kuyrukNo: string, newCode: DailyStatusCode) => {
    setFleet(prev => prev.map(a => a.kuyrukNo === kuyrukNo ? { ...a, assignedCode: newCode } : a));
    setActivities(prev => prev.map(act => act.kuyrukNo === kuyrukNo ? {
      ...act,
      dailyStatuses: { ...act.dailyStatuses, [new Date().getDate()]: newCode }
    } : act));
    
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

  const handleSyncFromExcel = useCallback((incomingData: Partial<Aircraft>[], platform: string) => {
    if (!incomingData || incomingData.length === 0) return;
    
    const now = new Date();
    const timestamp = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let discoveredChanges: AppNotification[] = [];

    setFleet(prevFleet => {
      const updatedFleet = [...prevFleet];
      
      incomingData.forEach(incoming => {
        const existingIdx = updatedFleet.findIndex(a => a.kuyrukNo === incoming.kuyrukNo);
        const existing = existingIdx !== -1 ? updatedFleet[existingIdx] : null;
        
        if (existing && initialSyncDone.current) {
          ['durum', 'konum', 'durumAyrintisi', 'faydaliSaat'].forEach(col => {
            const key = col as keyof Aircraft;
            const oldVal = String(existing[key] || '').trim();
            const newVal = String(incoming[key] || '').trim();

            if (oldVal !== newVal) {
              const labelMap: Record<string, string> = {
                'durum': 'DURUM',
                'konum': 'KONUM',
                'durumAyrintisi': 'DURUM AYRINTISI',
                'faydaliSaat': 'FAYDALI SAAT'
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
          const currentDayNum = new Date().getDate();
          const newCode = (incoming.assignedCode || 'F') as DailyStatusCode;

          if (existsIdx !== -1) {
            newActivities[existsIdx] = {
              ...newActivities[existsIdx],
              dailyStatuses: { ...newActivities[existsIdx].dailyStatuses, [currentDayNum]: newCode }
            };
          } else {
            newActivities.push({
              kuyrukNo: incoming.kuyrukNo || '',
              cagriKodu: incoming.cagriKodu || `ORMAN-${incoming.kuyrukNo?.split('-')[1] || 'XX'}`,
              tip: incoming.tip || platform,
              dailyStatuses: { [currentDayNum]: newCode }
            });
          }
          return newActivities;
        });
      });

      return updatedFleet;
    });

    if (discoveredChanges.length > 0) {
      setNotifications(prev => [...discoveredChanges, ...prev].slice(0, 100));
    }
  }, []);

  const runGlobalSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await Promise.all(SHEET_CONFIGS.map(async (config) => {
        try {
          const data = await fetchAircraftDataFromAppsScript(config.appsScriptUrl, config);
          if (data && data.length > 0) handleSyncFromExcel(data, config.aircraftType);
        } catch (e) {
          console.error(`Sync error for ${config.aircraftType}:`, e);
        }
      }));

      // Log tablosundan geçmiş faaliyet verilerini çek
      if (LOG_SCRIPT_URL) {
        try {
          const response = await fetch(LOG_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getFaaliyetLog' })
          });
          const logData = await response.json();
          
          if (Array.isArray(logData) && logData.length > 0) {
            setActivities(prevActivities => {
              let newActivities = [...prevActivities];
              
              logData.forEach((logEntry: any) => {
                const kuyrukNo = String(logEntry.kuyrukNo).trim();
                const tarihStr = String(logEntry.tarih).trim(); // dd.MM.yyyy
                const durumAyrintisi = String(logEntry.durum).trim().toUpperCase();
                const analizKodu = logEntry.analizKodu ? String(logEntry.analizKodu).trim() : null;
                
                if (!kuyrukNo || !tarihStr) return;
                
                const parts = tarihStr.split('.');
                if (parts.length === 3) {
                  const dayNum = parseInt(parts[0], 10);
                  const monthNum = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
                  const yearNum = parseInt(parts[2], 10);
                  
                  // Sadece mevcut ayın verilerini al
                  const now = new Date();
                  if (monthNum === now.getMonth() && yearNum === now.getFullYear()) {
                    let code: DailyStatusCode = 'F'; // Varsayılan FAAL
                    
                    if (analizKodu) {
                      code = analizKodu as DailyStatusCode;
                    } else {
                      if (durumAyrintisi.includes('BAKIM')) {
                        code = 'B';
                      } else if (durumAyrintisi.includes('ARIZA') || durumAyrintisi.includes('PARÇA BEKLER') || durumAyrintisi.includes('KAZA KIRIM')) {
                        code = 'A';
                      } else if (durumAyrintisi.includes('OLMADIĞI GÜNLER')) {
                        code = 'X';
                      } else if (durumAyrintisi !== '-' && durumAyrintisi !== '' && durumAyrintisi !== 'FAAL') {
                        code = 'B'; // Diğer gayrı faal durumlar için varsayılan
                      }
                    }

                    const existsIdx = newActivities.findIndex(act => act.kuyrukNo === kuyrukNo);
                    if (existsIdx !== -1) {
                      newActivities[existsIdx] = {
                        ...newActivities[existsIdx],
                        dailyStatuses: { ...newActivities[existsIdx].dailyStatuses, [dayNum]: code }
                      };
                    }
                  }
                }
              });
              
              return newActivities;
            });
          }
        } catch (e) {
          console.error("Log verisi çekilirken hata oluştu:", e);
        }
      }

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

  const filteredFleet = useMemo(() => {
    const filtered = fleet.filter(a => {
      const s = searchTerm.toLowerCase();
      return a.kuyrukNo.toLowerCase().includes(s) || a.konum.toLowerCase().includes(s) || (a.tip && a.tip.toLowerCase().includes(s));
    });

    const order = ['Bell-429', 'AT-802', 'T-70'];

    return filtered.sort((a, b) => {
      const typeA = a.tip || '';
      const typeB = b.tip || '';
      
      const indexA = order.indexOf(typeA);
      const indexB = order.indexOf(typeB);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return typeA.localeCompare(typeB);
    });
  }, [fleet, searchTerm]);

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
    if (user === 'ogm' && pass === '1839') {
      setIsAdminAuthenticated(true);
      setIsAuthModalOpen(false);
      setIsAdminOpen(true);
    } else {
      alert('Hatalı kullanıcı adı veya şifre!');
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
        onBack={() => setCurrentView('landing')}
        onSuccess={() => {
          runGlobalSync();
          setCurrentView('dashboard');
        }}
      />
    );
  }

  return (
    <Layout>
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
              {showActivity ? "ENVANTER LİSTESİ" : "FAALİYET ÇİZELGESİ"}
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

      <div className="mb-14"><Dashboard fleet={fleet} /></div>

      {showActivity ? (
        <div className="mb-24 animate-in fade-in duration-1000">
           <div className="bg-white rounded-[2rem] p-4 shadow-2xl border-4 border-emerald-800/20 overflow-hidden">
             <ActivityGrid 
               activities={activities} 
               startDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)} 
               endDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)} 
               title={`${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }).toUpperCase()}`} 
               onExport={() => exportTableToExcel('activity-table', `OGM_Faaliyet_Raporu_${new Date().getMonth() + 1}_${new Date().getFullYear()}`)} 
             />
           </div>
        </div>
      ) : (
        <div className="mb-24 animate-in fade-in duration-1000">
          <div className="flex justify-between items-end mb-12 px-6">
             <div>
                <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic">ENVANTER LİSTESİ</h2>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.8em] mt-4 border-l-4 border-emerald-500 pl-4">Platform Bazlı Durum ve Gövde Uçuş Saati</p>
             </div>
             <div className="flex items-center space-x-6">
                <button onClick={() => exportTableToExcel('inventory-table', 'Envanter_Listesi')} className="bg-emerald-700 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={3}/></svg>
                   ENVANTER EXCEL İNDİR
                </button>
                <div className="relative">
                  <input type="text" placeholder="Kuyruk, Tip veya Konum Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[400px] px-12 py-4 bg-black/60 text-white rounded-[2rem] border-2 border-white/10 outline-none font-bold focus:border-emerald-500 transition-all shadow-2xl backdrop-blur-xl" />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
                </div>
             </div>
          </div>

          <div className="bg-white p-2 rounded-[2rem] shadow-2xl overflow-hidden border-4 border-emerald-800/10">
            <table id="inventory-table" className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="px-8 py-6 text-left text-xs font-black uppercase tracking-widest border-r border-emerald-800">HAVA ARACI / TİP</th>
                  <th className="px-8 py-6 text-center text-xs font-black uppercase tracking-widest border-r border-emerald-800">DURUM (DETAY İÇİN ÇİFT TIKLA)</th>
                  <th className="px-8 py-6 text-left text-xs font-black uppercase tracking-widest border-r border-emerald-800">KONUM</th>
                  <th className="px-8 py-6 text-center text-xs font-black uppercase tracking-widest border-r border-emerald-800">FAYDALI SAAT (MİN)</th>
                  <th className="px-8 py-6 text-left text-xs font-black uppercase tracking-widest">AÇIKLAMA METNİ (DİKEY AÇMAK İÇİN ÇİFT TIKLA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFleet.map((a, i) => {
                  const isKazaKirim = a.assignedCode === 'KK' || a.durumAyrintisi?.toUpperCase().includes('KAZA KIRIM');
                  const hasOplAlert = a.oplAlerts && a.oplAlerts.length > 0 && !isKazaKirim;
                  return (
                    <tr key={i} className={`hover:bg-slate-50 cursor-pointer transition-all active:scale-[0.99] group ${hasOplAlert ? 'animate-pulse bg-red-50/30' : ''}`}>
                      <td className="px-8 py-6" onClick={() => setSelectedAircraft(a)}>
                         <div className="font-black text-emerald-950 text-xl tracking-tighter group-hover:text-emerald-600 transition-colors flex items-center">
                           {a.kuyrukNo}
                           {hasOplAlert && (
                             <span className="ml-3 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-bounce">
                               ÖPL ALERT!
                             </span>
                           )}
                         </div>
                         <div className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full w-fit uppercase mt-1">{a.tip}</div>
                      </td>
                      <td className="px-8 py-6 text-center select-none" onDoubleClick={() => setSelectedAircraft(a)}>
                          <span className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase border-2 shadow-sm transition-transform active:scale-95 block ${a.durum === Status.FAAL ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {a.durum}
                            {a.durum === Status.GAYRI_FAAL && a.durumAyrintisi && a.durumAyrintisi !== '-' && (
                              <span className="ml-1 opacity-70">({a.durumAyrintisi})</span>
                            )}
                          </span>
                          {/* GÖVDE BİLGİSİ LİSTEDE GÖRÜNSÜN */}
                          <div className="mt-2 text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-gray-100/50 py-1 rounded">
                             GÖVDE: <span className="text-emerald-700 font-black">{a.govdeUcusSaati || '-'}</span>
                          </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-800 uppercase tracking-widest">{a.konum}</td>
                      <td className="px-8 py-6 text-center">
                         <div className="font-black text-3xl text-blue-600 tracking-tighter">
                            {formatToHHMM(a.faydaliSaat)}
                         </div>
                      </td>
                      <td className="px-8 py-6" onDoubleClick={() => toggleNote(a.kuyrukNo)}>
                         <div className="text-slate-500 text-xs font-bold leading-relaxed max-w-md">
                            <div className="text-emerald-700 font-black text-[9px] uppercase mb-1">{a.durumAyrintisi}</div>
                            <div className={`italic ${expandedNotes[a.kuyrukNo] ? 'whitespace-pre-wrap' : 'truncate'}`}>
                              "{a.aciklama && a.aciklama !== '-' ? a.aciklama : "Not Yok"}"
                            </div>
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

      {selectedAircraft && <AircraftDetailModal aircraft={selectedAircraft} onClose={() => setSelectedAircraft(null)} />}
      {isAdminOpen && <AdminPanel notifications={notifications} initialData={fleet} onSave={(configs, data) => handleSyncFromExcel(data, configs[0].aircraftType)} onOverride={handleManualOverride} onClose={() => setIsAdminOpen(false)} />}
      
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
    </Layout>
  );
};

export default App;
