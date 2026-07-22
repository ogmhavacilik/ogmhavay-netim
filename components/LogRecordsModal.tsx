import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Aircraft, OPLItem } from '../types';
import { fetchOPLData } from '../services/sheetService';
import * as XLSX from 'xlsx';

import { BELL_SCRIPT_URL, AT802_SCRIPT_URL, T70_SCRIPT_URL, B360_SCRIPT_URL, C650_SCRIPT_URL, LOG_SCRIPT_URL } from '../constants';

import { exportOPLToPDF } from '../services/pdfService';

interface LogRecordsModalProps {
  aircraft: Aircraft;
  onClose: () => void;
}

const OPL_EXPORT_HEADERS = [
  "SIRA NU:",
  "HAVA ARACI NU:",
  "ÖMÜR TİPİ",
  "PARÇA ADI",
  "ANA PARÇA",
  "PARÇA NU:",
  "SERİ NU:",
  "ÖMRÜ",
  "DEĞİŞİME KALAN SAAT",
  "DEĞİŞİME KALAN GÜN",
  "DEĞİŞİME KALAN SAYKIL",
  "DEĞİŞİM YAPILACAK HAVA ARACI / MOTOR UÇUŞ SAATİ",
  "DEĞİŞİM YAPILACAK GÜN",
  "DEĞİŞİM YAPILACAK HAVA ARACI SAYKIL"
];

const LogRecordsModal: React.FC<LogRecordsModalProps> = ({ aircraft, onClose }) => {
  const [view, setView] = useState<'menu' | 'opl' | 'maintenance' | 'sheet'>('menu');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const exportTableToMHTML = (tableId: string, fileName: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 5px; font-family: Arial; font-size: 10pt; }
          th { background-color: #ddeaf6; font-weight: bold; }
        </style>
      </head>
      <body>
        ${table.outerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const findExportValue = (row: any, header: string) => {
    const normalize = (s: string) => s.replace(/[:\s_]/g, '').toUpperCase();
    const normalizedHeader = normalize(header);
    
    if (header === "HAVA ARACI NU:") {
      const key = Object.keys(row).find(k => normalize(k) === normalizedHeader);
      const val = key ? row[key] : null;
      return (val === "-" || !val) ? aircraft.kuyrukNo : val;
    }
    
    if (header === "HAVA ARACI") {
      return aircraft.tip || "-";
    }

    const key = Object.keys(row).find(k => normalize(k) === normalizedHeader);
    let value = key ? row[key] : "-";

    if (header === "SIRA NU:" && row['IS_MERGED_RECORD'] === 'BİRLEŞİK') {
      value = `BİRLEŞİK ${value === "-" ? "" : value}`.trim();
    }

    return value;
  };

  const exportOPLToExcel = () => {
    if (!oplData || oplData.length === 0) return;

    // Search filter but NO alert sorting for export
    let exportData = oplData;
    const term = searchTerm.toLocaleLowerCase('tr-TR').trim();
    if (term) {
      exportData = oplData.filter((item) => {
        return Object.entries(item).some(([key, val]) => {
          if (key === 'IS_MERGED_RECORD') return false;
          return String(val || "").toLocaleLowerCase('tr-TR').includes(term);
        });
      });
    }

    const tableHtml = `
      <table border="1">
        <thead>
          <tr style="background-color: #ddeaf6; font-weight: bold;">
            ${OPL_EXPORT_HEADERS.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${exportData.map(row => {
            const { alertCols, hasOplAlertValue } = checkRowAlert(row);
            return `
              <tr>
                ${OPL_EXPORT_HEADERS.map(h => {
                  const val = findExportValue(row, h);
                  const normalize = (s: string) => s.replace(/[:\s_]/g, '').toUpperCase();
                  const normalizedH = normalize(h);
                  const isAlertCol = alertCols.some(ac => normalize(ac) === normalizedH);
                  const isPartNumCol = normalizedH === "PARÇANU" || normalizedH === "PARCANU";
                  
                  const style = (isAlertCol || (isPartNumCol && hasOplAlertValue)) ? 'style="color: #FF0000; font-weight: bold;"' : '';
                  return `<td ${style}>${val}</td>`;
                }).join('')}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>ÖPL Listesi</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body>
        ${tableHtml}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${aircraft.kuyrukNo}_OPL_Listesi.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOPLToPDFHandler = () => {
    if (!oplData || oplData.length === 0) return;
    
    // Search filter but NO alert sorting for export
    let exportData = oplData;
    const term = searchTerm.toLocaleLowerCase('tr-TR').trim();
    if (term) {
      exportData = oplData.filter((item) => {
        return Object.entries(item).some(([key, val]) => {
          if (key === 'IS_MERGED_RECORD') return false;
          return String(val || "").toLocaleLowerCase('tr-TR').includes(term);
        });
      });
    }

    const preparedData = exportData.map(row => {
      const newRow: any = { ...row };
      OPL_EXPORT_HEADERS.forEach(h => {
        newRow[h] = findExportValue(row, h);
      });
      return newRow;
    });

    exportOPLToPDF(aircraft.kuyrukNo, preparedData, OPL_EXPORT_HEADERS);
  };

  const [oplData, setOplData] = useState<OPLItem[]>([]);
  const [dynamicHeaders, setDynamicHeaders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const hasOPLSupport = aircraft.tip !== 'Bell-429' && aircraft.tip !== 'T-70' && aircraft.tip !== 'B-360' && aircraft.tip !== 'C-650';

  const SHEET_IDS: Record<string, string> = {
    'AT-802': '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4',
    'Bell-429': '1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ',
    'T-70': '10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw',
    'B-360': '1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0',
    'C-650': '1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE'
  };

  const SCRIPT_URLS: Record<string, string> = {
    'AT-802': AT802_SCRIPT_URL,
    'Bell-429': BELL_SCRIPT_URL,
    'T-70': T70_SCRIPT_URL,
    'B-360': B360_SCRIPT_URL,
    'C-650': C650_SCRIPT_URL
  };

  const handleFetchOPL = async () => {
    if (!hasOPLSupport) return;
    setLoading(true);
    setErrorMsg(null);
    setView('opl');
    try {
      const scriptUrl = SCRIPT_URLS[aircraft.tip || 'AT-802'];
      const sheetId = SHEET_IDS[aircraft.tip || 'AT-802'];
      const kuyruk = aircraft ? aircraft.kuyrukNo : "";
      const data = await fetchOPLData(scriptUrl, sheetId, kuyruk);
      
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setUploadProgress(10);
          const base64String = (event.target?.result as string).split(',')[1];

          // Her hava aracının Excel formatı farklı olsa da, "replaceEntireSpreadsheet" işlemi 
          // tüm dosyayı (formatı, formülleri ve sayfalarıyla birlikte) olduğu gibi Google Sheets'e yazar.
          // Ancak diğer scriptlerde (Bell, T70 vb.) "Drive API" yetkisi kapalı olduğu için "Drive is not defined" hatası alınıyor.
          // Bu yüzden tüm uçakların Excel yükleme işlemini, Drive API yetkisi açık olan AT-802 servisi üzerinden yapıyoruz.
          // AT-802 servisi, gönderilen sheetId'ye göre ilgili uçağın Excel'ini bulup formatını bozmadan günceller.
          let uploadScriptUrl = AT802_SCRIPT_URL;
          
          const sheetId = SHEET_IDS[aircraft.tip || 'AT-802'];

          if (!uploadScriptUrl || !sheetId) {
            throw new Error("Bu uçak tipi için yapılandırma bulunamadı.");
          }

          setUploadProgress(30);

          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + 10;
            });
          }, 500);

          const response = await fetch(uploadScriptUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              action: 'replaceEntireSpreadsheet',
              sheetId: sheetId,
              fileData: base64String
            })
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          if (!response.ok) {
            throw new Error(`HTTP Hatası: ${response.status} ${response.statusText}`);
          }

          const textResult = await response.text();
          let result;
          try {
            result = JSON.parse(textResult);
          } catch (e) {
            throw new Error("Sunucudan geçersiz yanıt alındı: " + textResult.substring(0, 100));
          }

          if (result.success) {
            setUploadComplete(true);
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            setErrorMsg("Hata: " + result.error);
            setLoading(false);
          }
        } catch (err: any) {
          setErrorMsg("Dosya yüklenirken hata oluştu: " + err.message);
          setLoading(false);
        } finally {
          e.target.value = '';
        }
      };
      
      reader.onerror = () => {
        setErrorMsg("Dosya okunamadı.");
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg("Dosya yüklenirken hata oluştu: " + err.message);
      setLoading(false);
      e.target.value = '';
    }
  };

  const checkRowAlert = useCallback((row: any) => {
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

    const kalanSaatRaw = findValue(row, ["DEĞİŞİME KALAN SAAT", "DEGISIME KALAN SAAT", "Değişime Kalan Saat"]);
    const kalanGunRaw = findValue(row, ["DEĞİŞİME KALAN GÜN", "DEGISIME KALAN GUN", "Değişime Kalan Gün"]);

    const kalanSaat = parseHour(kalanSaatRaw);
    const kalanGun = parseDay(kalanGunRaw);

    let hasAlert = false;
    let alertCols: string[] = [];
    let hasOplAlertValue = false;

    // Check for explicit OPL ALERT column
    const oplAlertKey = Object.keys(row).find(k => {
      const n = k.replace(/[\s_]/g, '').toUpperCase();
      return n.includes("ÖPLALERT") || n.includes("OPLALERT");
    });

    if (oplAlertKey) {
      const v = String(row[oplAlertKey] || "").trim();
      if (v !== "" && v !== "-" && v !== "0") {
        hasOplAlertValue = true;
        hasAlert = true;
        alertCols.push(oplAlertKey);
      }
    }

    if (kalanSaat !== null && kalanSaat <= 100) {
      hasAlert = true;
      const key = Object.keys(row).find(k => k.replace(/[\s_]/g, '').toUpperCase() === "DEĞİŞİMEKALANSAAT" || k.replace(/[\s_]/g, '').toUpperCase() === "DEGISIMEKALANSAAT");
      if (key) alertCols.push(key);
    }
    if (kalanGun !== null && kalanGun <= 180) {
      hasAlert = true;
      const key = Object.keys(row).find(k => k.replace(/[\s_]/g, '').toUpperCase() === "DEĞİŞİMEKALANGÜN" || k.replace(/[\s_]/g, '').toUpperCase() === "DEGISIMEKALANGUN");
      if (key) alertCols.push(key);
    }

    return { hasAlert, alertCols, hasOplAlertValue };
  }, []);

  const filteredData = useMemo(() => {
    if (!oplData || oplData.length === 0) return [];
    
    let processedData = oplData;
    const term = searchTerm.toLocaleLowerCase('tr-TR').trim();
    
    if (term) {
      processedData = oplData.filter((item) => {
        return Object.entries(item).some(([key, val]) => {
          if (key === 'IS_MERGED_RECORD') return false;
          return String(val || "").toLocaleLowerCase('tr-TR').includes(term);
        });
      });
    }

    return [...processedData].sort((a, b) => {
      const alertA = checkRowAlert(a).hasAlert ? 1 : 0;
      const alertB = checkRowAlert(b).hasAlert ? 1 : 0;
      return alertB - alertA;
    });
  }, [oplData, searchTerm, checkRowAlert]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-6">
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.1; }
          100% { opacity: 1; }
        }
        .animate-blink {
          animation: blink 0.5s infinite;
        }
      `}</style>
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
        <div className="flex-grow overflow-y-auto flex flex-col bg-gray-50">
          {view === 'menu' ? (
            <div className="flex-grow flex flex-wrap items-center justify-center p-6 md:p-10 gap-6 md:gap-10 overflow-y-auto py-8">
               {hasOPLSupport && (
                 <button onClick={handleFetchOPL} className="bg-white w-full max-w-sm md:w-80 lg:w-96 p-8 md:p-10 rounded-[2.5rem] border-2 border-emerald-100 shadow-xl hover:shadow-2xl hover:border-emerald-500 transition-all flex flex-col items-center text-center space-y-4 md:space-y-6 transform hover:-translate-y-1">
                    <div className="bg-emerald-50 p-5 md:p-6 rounded-[2rem] text-emerald-700"><svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth={2}/></svg></div>
                    <div><h3 className="text-xl md:text-2xl font-black text-emerald-950 uppercase mb-2">ÖMÜRLÜ PARÇA LİSTESİ</h3><p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">KESİN FİLTRELEME AKTİF</p></div>
                 </button>
               )}
               <button onClick={() => setView('sheet')} className="bg-white w-full max-w-sm md:w-80 lg:w-96 p-8 md:p-10 rounded-[2.5rem] border-2 border-blue-100 shadow-xl hover:shadow-2xl hover:border-blue-500 transition-all flex flex-col items-center text-center space-y-4 md:space-y-6 transform hover:-translate-y-1">
                  <div className="bg-blue-50 p-5 md:p-6 rounded-[2rem] text-blue-700"><svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div>
                  <div><h3 className="text-xl md:text-2xl font-black text-blue-950 uppercase mb-2">HAVA ARACI GÜNLÜK DURUMLARI</h3><p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">GÖRÜNTÜLE</p></div>
               </button>
               <button onClick={() => setView('maintenance')} className="bg-white w-full max-w-sm md:w-80 lg:w-96 p-8 md:p-10 rounded-[2.5rem] border-2 border-purple-100 shadow-xl hover:shadow-2xl hover:border-purple-500 transition-all flex flex-col items-center text-center space-y-4 md:space-y-6 transform hover:-translate-y-1">
                  <div className="bg-purple-50 p-5 md:p-6 rounded-[2rem] text-purple-700"><svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
                  <div><h3 className="text-xl md:text-2xl font-black text-purple-950 uppercase mb-2">ÇEVRİM DIŞI ÇALIŞ</h3><p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">İNDİR / YÜKLE EKRANI</p></div>
               </button>
            </div>
          ) : view === 'sheet' ? (
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
               <div className="p-4 bg-white border-b flex justify-between items-center shrink-0">
                 <button onClick={() => setView('menu')} className="bg-gray-100 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-colors">GERİ DÖN</button>
                 <h3 className="text-sm font-black text-blue-950 uppercase">{aircraft.kuyrukNo} - HAVA ARACI GÜNLÜK DURUMLARI</h3>
                 <div className="w-20"></div>
               </div>
               <div className="flex-grow w-full h-full bg-gray-50">
                 <iframe 
                   src={`https://docs.google.com/spreadsheets/d/${SHEET_IDS[aircraft.tip || 'AT-802']}/edit?rm=minimal`} 
                   className="w-full h-full border-0"
                   title="Google Sheets View"
                 />
               </div>
            </div>
          ) : view === 'maintenance' ? (
             <div className="flex-grow flex flex-col items-center justify-center p-10 space-y-8 animate-in fade-in duration-300">
               <div className="text-center mb-8">
                 <h2 className="text-3xl font-black text-blue-950 uppercase mb-4">OFFLINE ÇALIŞMA MODU</h2>
                 <p className="text-gray-500 font-bold">Mevcut veriyi Excel olarak indirin, çevrimdışı düzenleyin ve ardından güncel dosyayı yükleyin.</p>
               </div>
               
               <div className="flex space-x-8">
                 <button 
                   onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${SHEET_IDS[aircraft.tip || 'AT-802']}/export?format=xlsx`)}
                   className="bg-white w-72 p-10 rounded-[3rem] border-2 border-emerald-100 shadow-xl hover:shadow-2xl hover:border-emerald-500 transition-all flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2"
                 >
                    <div className="bg-emerald-50 p-6 rounded-[2rem] text-emerald-700">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-emerald-950 uppercase mb-2">EXCEL İNDİR</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">MEVCUT VERİYİ İNDİR</p>
                    </div>
                 </button>

                 <label className="cursor-pointer bg-white w-72 p-10 rounded-[3rem] border-2 border-blue-100 shadow-xl hover:shadow-2xl hover:border-blue-500 transition-all flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2">
                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                    <div className="bg-blue-50 p-6 rounded-[2rem] text-blue-700">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-blue-950 uppercase mb-2">EXCEL YÜKLE</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-widest">GÜNCEL VERİYİ YÜKLE</p>
                    </div>
                 </label>
               </div>

               {loading && !uploadComplete && (
                 <div className="mt-8 flex flex-col items-center space-y-4 w-full max-w-md">
                   <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                     <div className="bg-blue-600 h-4 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                   </div>
                   <span className="text-xs font-black text-blue-900 uppercase">EXCEL YÜKLENİYOR... %{uploadProgress}</span>
                 </div>
               )}
               {uploadComplete && (
                 <div className="mt-8 flex flex-col items-center space-y-4">
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <span className="text-lg font-black text-green-700 uppercase">YÜKLEME TAMAMLANDI</span>
                   <span className="text-xs font-bold text-gray-500 uppercase">Sayfa yenileniyor...</span>
                 </div>
               )}
               {errorMsg && (
                 <div className="mt-8 bg-red-100 text-red-700 px-6 py-4 rounded-xl font-bold text-sm">
                   {errorMsg}
                 </div>
               )}

               <button onClick={() => setView('menu')} className="mt-12 bg-gray-100 px-8 py-3 rounded-xl text-xs font-black uppercase hover:bg-gray-200 transition-colors">
                 MENÜYE DÖN
               </button>
             </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
                <div className="p-6 bg-white border-b flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => setView('menu')} className="bg-gray-100 px-6 py-2 rounded-xl text-[10px] font-black uppercase">GERİ DÖN</button>
                      {hasOPLSupport && (
                        <button 
                          onClick={exportOPLToExcel}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          <span>İNDİR (XLS)</span>
                        </button>
                      )}
                      {hasOPLSupport && (
                        <button 
                          onClick={exportOPLToPDFHandler}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          <span>İNDİR (PDF)</span>
                        </button>
                      )}
                    </div>
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
                        <span className="text-xs font-black text-emerald-900 uppercase">VERİLER YÜKLENİYOR...</span>
                      </div>
                    ) : (
                      <div className="overflow-auto custom-scrollbar flex-grow bg-white" id="opl-table-container">
                        <table id="opl-table" className="w-full text-left border-collapse min-w-[3500px] table-fixed">
                           <thead className="sticky top-0 z-20">
                             <tr className="bg-[#ddeaf6]">
                               <th className="px-3 py-4 border border-black text-[9px] font-black uppercase text-center w-28 bg-gray-100">KAYIT DURUMU</th>
                               {dynamicHeaders.map((h, i) => (
                                 <th key={i} className="px-3 py-4 border border-black text-[9px] font-black uppercase text-center align-middle h-16 bg-[#ddeaf6]">{h}</th>
                               ))}
                             </tr>
                           </thead>
                           <tbody>
                             {filteredData.map((row, rIdx) => {
                               const { hasAlert, alertCols, hasOplAlertValue } = checkRowAlert(row);
                               
                               return (
                               <tr key={rIdx} className={`transition-colors h-10 hover:bg-blue-50/50 ${hasAlert ? 'bg-red-700' : ''}`}>
                                 <td className={`px-3 py-1.5 border border-black text-[9px] font-black text-center uppercase italic ${hasAlert ? 'text-white bg-red-800 animate-blink' : 'text-orange-600 bg-orange-50/20'}`}>
                                   {row['IS_MERGED_RECORD'] || ''}
                                 </td>
                                 {dynamicHeaders.map((header, cIdx) => {
                                   const normalize = (s: string) => s.replace(/[:\s_]/g, '').toUpperCase();
                                   const normalizedHeader = normalize(header);
                                   const isAlertCol = alertCols.some(ac => normalize(ac) === normalizedHeader);
                                   const isOplAlert = normalizedHeader.includes("ÖPLALERT") || normalizedHeader.includes("OPLALERT");
                                   const isPartNumCol = normalizedHeader === "PARÇANU" || normalizedHeader === "PARCANU";
                                   
                                   let val = row[header] || "-";
                                   
                                   if (normalizedHeader === "SIRANU" && row['IS_MERGED_RECORD'] === 'BİRLEŞİK') {
                                     val = `BİRLEŞİK ${val === "-" ? "" : val}`.trim();
                                   }

                                   const isBlinking = isPartNumCol && (isAlertCol || hasOplAlertValue);
                                   const isDarkRed = isPartNumCol && (isAlertCol || hasOplAlertValue);

                                   return (
                                   <td key={cIdx} className={`px-3 py-1.5 border border-black text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${isBlinking ? 'animate-blink' : ''} ${(isAlertCol || isOplAlert || isDarkRed) ? 'text-white bg-red-900 font-black' : hasAlert ? 'text-white font-bold' : 'text-gray-800'}`}>
                                     {String(val)}
                                   </td>
                                   );
                                 })}
                               </tr>
                               );
                             })}
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
