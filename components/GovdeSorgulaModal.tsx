import React, { useState } from 'react';
import { X, Search, AlertCircle, Download, Fuel } from 'lucide-react';
import { LOG_SCRIPT_URL, MAIL_LOG_SHEET_ID, getCallSignByTail } from '../constants';
import { parseSingleCellToHour, fetchYakitData, proxyFetch, YakitKaydi } from '../services/sheetService';
import { Aircraft } from '../types';
import * as XLSX from 'xlsx';

interface GovdeSorgulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fleet: Aircraft[];
}

interface SorguResult {
  kuyrukNo: string;
  tip: string;
  baslangicSaat: number | null;
  baslangicRaw: string | null;
  baslangicDecimal: string | null;
  bitisSaat: number | null;
  bitisRaw: string | null;
  bitisDecimal: string | null;
  fark: number;
  isDecimal?: boolean;
  toplamYakit: number;
  saatlikYakit: number;
  fuelRecords: YakitKaydi[];
}

const GovdeSorgulaModal: React.FC<GovdeSorgulaModalProps> = ({ isOpen, onClose, fleet }) => {
  const [type, setType] = useState('Tümü');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeFuel, setIncludeFuel] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SorguResult[]>([]);
  const [error, setError] = useState('');
  const [selectedFuelModal, setSelectedFuelModal] = useState<{
    kuyrukNo: string;
    records: YakitKaydi[];
    totalFuel: number;
  } | null>(null);

  if (!isOpen) return null;

  const formatAsHour = (val: number | null) => {
    if (val === null) return '-';
    const hours = Math.floor(Math.abs(val));
    const minutes = Math.round((Math.abs(val) - hours) * 60);
    const sign = val < 0 ? '-' : '';
    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatAsDecimal = (val: number | null) => {
    if (val === null) return '-';
    return val.toLocaleString('tr-TR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
      useGrouping: false
    });
  };

  const normalizeDate = (dateStr: any): string | null => {
    if (!dateStr && dateStr !== 0) return null;
    if (dateStr instanceof Date) {
      if (isNaN(dateStr.getTime())) return null;
      const y = dateStr.getFullYear();
      const m = dateStr.getMonth() + 1;
      const d = dateStr.getDate();
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    const s = String(dateStr).trim();
    if (!s || s === '-') return null;

    if (typeof dateStr === 'number' || /^\d{5}(\.\d+)?$/.test(s)) {
      const num = typeof dateStr === 'number' ? dateStr : parseFloat(s);
      if (num > 30000 && num < 60000) {
        const excelEpoch = new Date(1899, 11, 30);
        const dateObj = new Date(excelEpoch.getTime() + num * 86400 * 1000);
        if (!isNaN(dateObj.getTime())) {
          const y = dateObj.getFullYear();
          const m = dateObj.getMonth() + 1;
          const d = dateObj.getDate();
          return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      }
    }
    
    if (s.includes('T') || s.includes('Z') || s.includes('GMT')) {
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        const y = dt.getUTCFullYear();
        const m = dt.getUTCMonth() + 1;
        const d = dt.getUTCDate();
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }

    if (s.includes('-') || s.includes('.') || s.includes('/')) {
      const parts = s.split(/[- ./:]/).filter(Boolean);
      if (parts.length >= 3) {
        let y = -1, m = -1, d = -1;
        if (parts[0].length === 4) {
          y = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          d = parseInt(parts[2], 10);
        } else if (parts[2].length === 4 || parts[2].length === 2) {
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          y = parseInt(parts[2], 10);
          if (y < 100) y += 2000;
        }
        if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      }
    }
    
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getUTCFullYear();
      const m = dt.getUTCMonth() + 1;
      const d = dt.getUTCDate();
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return null;
  };

  const formatDisplayDate = (dateStr: any): string => {
    if (!dateStr && dateStr !== 0) return '-';
    const norm = normalizeDate(dateStr);
    if (norm) {
      const parts = norm.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
    }
    return String(dateStr);
  };

  const getMatchingKey = (inputKuyruk: string, mapKeys: string[]): string | null => {
    if (!inputKuyruk) return null;
    const s = String(inputKuyruk).trim().toUpperCase();
    if (!s) return null;

    if (mapKeys.includes(s)) return s;

    const normS = s.replace(/[-\s]/g, '');
    for (const k of mapKeys) {
      if (k.replace(/[-\s]/g, '').toUpperCase() === normS) return k;
    }

    const digitsS = s.replace(/\D/g, '');
    const numS = digitsS ? parseInt(digitsS, 10) : NaN;
    if (!isNaN(numS) && numS > 0) {
      for (const k of mapKeys) {
        const kDigits = k.replace(/\D/g, '');
        const kNum = kDigits ? parseInt(kDigits, 10) : NaN;
        if (!isNaN(kNum) && kNum === numS) return k;
      }
    }

    for (const k of mapKeys) {
      const cs = getCallSignByTail(k).replace(/[-\s]/g, '').toUpperCase();
      if (cs && (s === cs || normS === cs)) return k;
    }

    if (normS.length >= 3) {
      for (const k of mapKeys) {
        const kNorm = k.replace(/[-\s]/g, '').toUpperCase();
        if (kNorm.length >= 3 && (normS.includes(kNorm) || kNorm.includes(normS))) return k;
      }
    }

    return null;
  };

  const handleSorgula = async () => {
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçiniz.');
      return;
    }
    
    setError('');
    setResults([]);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const [res, yakitDataList] = await Promise.all([
        proxyFetch(LOG_SCRIPT_URL, {
          action: 'getFaaliyetLog',
          sheetId: MAIL_LOG_SHEET_ID
        }),
        includeFuel ? fetchYakitData() : Promise.resolve([])
      ]);
      
      const allData = res?.data?.envanterLog || res?.envanterLog || (res?.data && Array.isArray(res.data) ? res.data : []);
      
      const startData = allData.filter((row: any) => normalizeDate(row.tarih) === startDate);
      const endData = allData.filter((row: any) => normalizeDate(row.tarih) === endDate);

      const resultMap: Record<string, SorguResult> = {};

      fleet.forEach(a => {
        if (type !== 'Tümü' && a.tip !== type) return;
        resultMap[a.kuyrukNo] = {
          kuyrukNo: a.kuyrukNo,
          tip: a.tip || '',
          baslangicSaat: null,
          baslangicRaw: null,
          baslangicDecimal: null,
          bitisSaat: null,
          bitisRaw: null,
          bitisDecimal: null,
          fark: 0,
          isDecimal: a.tip === 'Bell-429' || a.tip === 'B-360' || a.tip === 'C-650',
          toplamYakit: 0,
          saatlikYakit: 0,
          fuelRecords: []
        };
      });

      startData.forEach((row: any) => {
        const kNo = String(row.kuyrukNo || '').trim();
        const mapKey = getMatchingKey(kNo, Object.keys(resultMap));
        if (mapKey && resultMap[mapKey]) {
          const item = resultMap[mapKey];
          const h = parseSingleCellToHour(row.govdeUcusSaati, item.tip);
          if (h !== null) {
            if (item.baslangicSaat === null || h > (item.baslangicSaat || 0)) {
              item.baslangicSaat = h;
              item.baslangicRaw = String(row.govdeUcusSaati || '').trim();
              if (item.isDecimal) {
                const raw = String(row.govdeUcusSaati || '').trim();
                if (raw.includes('.') && raw.includes(',')) {
                  item.baslangicDecimal = raw.replace(/\./g, '');
                } else {
                  item.baslangicDecimal = raw.replace('.', ',');
                }
              }
            }
          }
        }
      });

      endData.forEach((row: any) => {
        const kNo = String(row.kuyrukNo || '').trim();
        const mapKey = getMatchingKey(kNo, Object.keys(resultMap));
        if (mapKey && resultMap[mapKey]) {
          const item = resultMap[mapKey];
          const h = parseSingleCellToHour(row.govdeUcusSaati, item.tip);
          if (h !== null) {
            if (item.bitisSaat === null || h > (item.bitisSaat || 0)) {
              item.bitisSaat = h;
              item.bitisRaw = String(row.govdeUcusSaati || '').trim();
              if (item.isDecimal) {
                const raw = String(row.govdeUcusSaati || '').trim();
                if (raw.includes('.') && raw.includes(',')) {
                  item.bitisDecimal = raw.replace(/\./g, '');
                } else {
                  item.bitisDecimal = raw.replace('.', ',');
                }
              }
            }
          }
        }
      });

      const finalResults = Object.values(resultMap)
        .map(item => {
          if (item.baslangicSaat !== null && item.bitisSaat !== null) {
            item.fark = item.bitisSaat - item.baslangicSaat;
          }

          const matchingFuel = yakitDataList.filter(yr => {
            const matchedKey = getMatchingKey(yr.kuyrukNo, [item.kuyrukNo]);
            if (!matchedKey) return false;

            const normDate = normalizeDate(yr.tarih);
            if (!normDate) return false;
            return normDate >= startDate && normDate <= endDate;
          });

          item.fuelRecords = matchingFuel;
          item.toplamYakit = matchingFuel.reduce((acc, curr) => acc + curr.miktar, 0);
          item.saatlikYakit = item.fark > 0 ? (item.toplamYakit / item.fark) : 0;

          return item;
        })
        .filter(item => item.baslangicSaat !== null || item.bitisSaat !== null || item.toplamYakit > 0)
        .sort((a, b) => a.kuyrukNo.localeCompare(b.kuyrukNo));

      setResults(finalResults);
    } catch (err: any) {
      console.error("Sorgulama hatası:", err);
      setError('Veriler çekilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (results.length === 0) return;

    const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const totalCols = includeFuel ? 9 : 7;
    
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #e2e8f0; padding: 12px 8px; text-align: center; vertical-align: middle; font-size: 12px; }
          .header-row th { background-color: #064e3b; color: white; font-weight: bold; font-size: 11px; }
          .title-row { background-color: #f8fafc; font-weight: bold; font-size: 14px; color: #064e3b; }
          .kuyruk-col { font-weight: bold; color: #064e3b; font-size: 14px; }
          .saat-col { font-weight: bold; color: #475569; }
          .fark-col { font-weight: bold; color: #2563eb; font-size: 14px; background-color: #eff6ff; }
          .yakit-col { font-weight: bold; color: #b45309; font-size: 13px; background-color: #fffbeb; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="${totalCols}" style="border: none; text-align: right; color: gray; font-size: 10px;">Veri Çekiliş Tarihi: ${dateStr}</td>
          </tr>
          <tr>
            <td colspan="${totalCols}" class="title-row" style="text-align: center;">GÖVDE UÇUŞ SAATİ ${includeFuel ? 'VE YAKIT ' : ''}SORGULAMA SONUÇLARI (${type})</td>
          </tr>
          <tr>
            <td colspan="${totalCols}" style="text-align: center; font-weight: bold; color: #475569; background-color: #f8fafc;">Başlangıç: ${formatDisplayDate(startDate)} | Bitiş: ${formatDisplayDate(endDate)}</td>
          </tr>
          <tr class="header-row">
            <th>KUYRUK NO</th>
            <th>BAŞLANGIÇ (ONDALIK)</th>
            <th>BAŞLANGIÇ (SAAT)</th>
            <th>BİTİŞ (ONDALIK)</th>
            <th>BİTİŞ (SAAT)</th>
            <th>TOPLAM UÇUŞ</th>
            <th>TOPLAM UÇUŞ (ONDALIK)</th>
            ${includeFuel ? `
            <th>TOPLAM YAKIT (LT)</th>
            <th>SAATLİK YAKIT (LT/SAAT)</th>
            ` : ''}
          </tr>
    `;

    results.forEach(r => {
      const isDec = r.tip === 'Bell-429' || r.tip === 'B-360' || r.tip === 'C-650';
      const startDec = isDec ? (r.baslangicDecimal || '-') : formatAsDecimal(r.baslangicSaat);
      const bitisDec = isDec ? (r.bitisDecimal || '-') : formatAsDecimal(r.bitisSaat);
      const yakitStr = r.toplamYakit > 0 ? r.toplamYakit.toLocaleString('tr-TR') : '-';
      const saatlikYakitStr = r.saatlikYakit > 0 ? r.saatlikYakit.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '-';
      
      html += `
        <tr>
          <td class="kuyruk-col">${r.kuyrukNo}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${startDec}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${formatAsHour(r.baslangicSaat)}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${bitisDec}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${formatAsHour(r.bitisSaat)}</td>
          <td class="fark-col" style="mso-number-format:'\@';">${formatAsHour(r.fark)}</td>
          <td class="fark-col" style="mso-number-format:'\@';">${formatAsDecimal(r.fark)}</td>
          ${includeFuel ? `
          <td class="yakit-col" style="mso-number-format:'\@';">${yakitStr}</td>
          <td class="yakit-col" style="mso-number-format:'\@';">${saatlikYakitStr}</td>
          ` : ''}
        </tr>
      `;
    });

    const totalFark = results.reduce((acc, curr) => acc + curr.fark, 0);
    const totalYakit = results.reduce((acc, curr) => acc + curr.toplamYakit, 0);
    const overallSaatlikYakit = totalFark > 0 && totalYakit > 0 ? (totalYakit / totalFark).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '-';

    html += `
        <tr style="background-color: #f0fdf4; font-weight: bold;">
          <td colspan="5" style="text-align: right; padding-right: 20px; color: #064e3b; font-size: 14px;">TOPLAM:</td>
          <td class="fark-col" style="mso-number-format:'\@'; color: #1e40af; font-size: 16px;">${formatAsHour(totalFark)}</td>
          <td class="fark-col" style="mso-number-format:'\@'; color: #1e40af; font-size: 16px;">${formatAsDecimal(totalFark)}</td>
          ${includeFuel ? `
          <td class="yakit-col" style="mso-number-format:'\@'; color: #92400e; font-size: 16px;">${totalYakit.toLocaleString('tr-TR')} Lt</td>
          <td class="yakit-col" style="mso-number-format:'\@'; color: #92400e; font-size: 16px;">${overallSaatlikYakit} Lt/S</td>
          ` : ''}
        </tr>
    `;

    html += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Govde_Ucus_${includeFuel ? 've_Yakit_' : ''}${type}_${startDate}_${endDate}.xls`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-emerald-900 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span>Gövde Uçuş Saati {includeFuel ? '& Yakıt ' : ''}Sorgula</span>
            </h2>
            <p className="text-emerald-400 text-xs font-bold mt-1 uppercase tracking-widest">
              İki tarih arası uçuş süresi {includeFuel ? 've toplam / saatlik yakıt ikmal ' : ''}hesaplama
            </p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-end shrink-0">
          <div className="flex flex-col">
            <label className="text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Hava Aracı Tipi</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="bg-white text-slate-800 px-4 py-2.5 rounded-xl border-2 border-slate-200 outline-none font-bold focus:border-emerald-500 transition-all text-xs w-40">
              <option value="Tümü">Tümü</option>
              <option value="AT-802">AT-802</option>
              <option value="Bell-429">Bell-429</option>
              <option value="T-70">T-70</option>
              <option value="C-650">C-650</option>
              <option value="B-360">B-360</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Başlangıç Tarihi</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white text-slate-800 px-4 py-2.5 rounded-xl border-2 border-slate-200 outline-none font-bold focus:border-emerald-500 transition-all text-xs" />
          </div>
          <div className="flex flex-col">
            <label className="text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Bitiş Tarihi</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white text-slate-800 px-4 py-2.5 rounded-xl border-2 border-slate-200 outline-none font-bold focus:border-emerald-500 transition-all text-xs" />
          </div>
          <div className="flex flex-col">
            <label className="text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-1 ml-1">Yakıt Verileri</label>
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2.5 rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition-all text-xs font-bold text-slate-700 h-[42px] select-none">
              <input 
                type="checkbox" 
                checked={includeFuel} 
                onChange={(e) => setIncludeFuel(e.target.checked)} 
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
              />
              <span>Yakıt Dahil</span>
            </label>
          </div>
          <div className="flex gap-2 ml-auto">
            {results.length > 0 && (
              <button 
                onClick={exportToExcel}
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center h-[42px]"
              >
                <Download size={16} className="mr-2" />
                EXCEL İNDİR
              </button>
            )}
            <button 
              onClick={handleSorgula}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center h-[42px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Search size={16} className="mr-2" />
              )}
              SORGULA
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white min-h-[350px]">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-center font-bold text-sm mb-6">
              <AlertCircle className="mr-3 shrink-0" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-5"></div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">VERİLER SORGULANIYOR...</h3>
              <p className="text-slate-500 text-xs font-semibold mt-1 max-w-md">
                {includeFuel 
                  ? "Faaliyet logları ve Yakıt İkmal Verileri Google Sheets üzerinden çekiliyor, lütfen bekleyiniz..." 
                  : "Faaliyet logları çekiliyor, lütfen bekleyiniz..."}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="border-4 border-emerald-800/10 rounded-[2rem] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-white">
                    <th className="px-2 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">KUYRUK NO</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BAŞL. (ONDALIK)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BAŞL. (SAAT)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BİTİŞ (ONDALIK)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BİTİŞ (SAAT)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">TOPLAM UÇUŞ</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">TOPLAM UÇUŞ (ONDALIK)</th>
                    {includeFuel && (
                      <>
                        <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800 bg-amber-950/70">TOPLAM YAKIT (LT)</th>
                        <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest bg-amber-950/70">SAATLİK YAKIT (LT/SAAT)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, i) => {
                    const isDec = r.tip === 'Bell-429' || r.tip === 'B-360' || r.tip === 'C-650';
                    const startDec = isDec ? (r.baslangicDecimal || '-') : formatAsDecimal(r.baslangicSaat);
                    const bitisDec = isDec ? (r.bitisDecimal || '-') : formatAsDecimal(r.bitisSaat);
                    
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-2 py-4 font-black text-emerald-900 text-sm border-r border-slate-100">{r.kuyrukNo}</td>
                        <td className="px-2 py-4 text-center font-bold text-slate-400 text-xs border-r border-slate-100">
                          {startDec}
                        </td>
                        <td className="px-2 py-4 text-center font-bold text-slate-600 text-sm border-r border-slate-100">
                          {formatAsHour(r.baslangicSaat)}
                        </td>
                        <td className="px-2 py-4 text-center font-bold text-slate-400 text-xs border-r border-slate-100">
                          {bitisDec}
                        </td>
                        <td className="px-2 py-4 text-center font-bold text-slate-600 text-sm border-r border-slate-100">
                          {formatAsHour(r.bitisSaat)}
                        </td>
                        <td className="px-2 py-4 text-center font-black text-blue-600 text-base bg-blue-50/30 border-r border-slate-100">
                          {formatAsHour(r.fark)}
                        </td>
                        <td className="px-2 py-4 text-center font-bold text-blue-600 text-sm bg-blue-50/30 border-r border-slate-100">
                          {formatAsDecimal(r.fark)}
                        </td>
                        {includeFuel && (
                          <>
                            <td 
                              onClick={() => setSelectedFuelModal({ kuyrukNo: r.kuyrukNo, records: r.fuelRecords || [], totalFuel: r.toplamYakit })}
                              className="px-2 py-4 text-center font-black text-amber-800 text-sm bg-amber-50/60 border-r border-slate-100 cursor-pointer hover:bg-amber-100 transition-colors underline decoration-amber-500 decoration-2 underline-offset-4"
                              title="Yakıt ikmal detay kaydı için tıklayınız"
                            >
                              {r.toplamYakit > 0 ? `${r.toplamYakit.toLocaleString('tr-TR')} Lt` : '-'}
                            </td>
                            <td className="px-2 py-4 text-center font-bold text-amber-900 text-xs bg-amber-50/30">
                              {r.saatlikYakit > 0 ? `${r.saatlikYakit.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Lt/S` : '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t-4 border-emerald-900">
                    <td colSpan={5} className="px-6 py-6 text-right font-black text-emerald-900 uppercase tracking-widest text-sm">
                      TOPLAM:
                    </td>
                    <td className="px-4 py-6 text-center font-black text-blue-700 text-xl bg-blue-100/50 border-r border-emerald-200">
                      {formatAsHour(results.reduce((acc, curr) => acc + curr.fark, 0))}
                    </td>
                    <td className="px-4 py-6 text-center font-black text-blue-700 text-lg bg-blue-100/50 border-r border-emerald-200">
                      {formatAsDecimal(results.reduce((acc, curr) => acc + curr.fark, 0))}
                    </td>
                    {includeFuel && (
                      <>
                        <td className="px-4 py-6 text-center font-black text-amber-900 text-lg bg-amber-100/60 border-r border-emerald-200">
                          {results.reduce((acc, curr) => acc + (curr.toplamYakit || 0), 0).toLocaleString('tr-TR')} Lt
                        </td>
                        <td className="px-4 py-6 text-center font-black text-amber-950 text-base bg-amber-100/60">
                          {(() => {
                            const totHours = results.reduce((acc, curr) => acc + curr.fark, 0);
                            const totFuel = results.reduce((acc, curr) => acc + (curr.toplamYakit || 0), 0);
                            return totHours > 0 && totFuel > 0
                              ? `${(totFuel / totHours).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Lt/S`
                              : '-';
                          })()}
                        </td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : !error ? (
            <div className="text-center py-20 text-slate-400 font-bold flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 my-4">
              <Search size={48} className="mb-4 text-slate-300" />
              <p className="text-slate-700 font-black text-sm uppercase tracking-wide">
                {hasSearched ? "SEÇİLEN TARİHLERDE KAYIT BULUNAMADI" : "SORGULAMA YAPMAK İÇİN FİLTRELERİ SEÇİNİZ"}
              </p>
              <p className="text-slate-400 text-xs mt-1 max-w-md font-medium">
                {hasSearched 
                  ? `${formatDisplayDate(startDate)} ile ${formatDisplayDate(endDate)} tarihleri arasında herhangi bir faaliyet veya yakıt kaydı bulunamamıştır.` 
                  : "Tarih aralığı ve kriterleri seçerek 'SORGULA' butonuna basınız."}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Fuel Detail Modal */}
      {selectedFuelModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-amber-900 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                  <Fuel size={20} className="text-amber-400" />
                  <span>{selectedFuelModal.kuyrukNo} - YAKIT İKMAL GEÇMİŞİ</span>
                </h3>
                <p className="text-amber-300 text-xs font-bold mt-0.5 uppercase tracking-widest">
                  {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)} DÖNEMİ DETAY BİLGİLERİ
                </p>
              </div>
              <button
                onClick={() => setSelectedFuelModal(null)}
                className="text-white/60 hover:text-white bg-white/10 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {selectedFuelModal.records.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold">
                  Seçilen tarih aralığında bu hava aracına ait kayıtlı yakıt ikmali bulunamadı.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-amber-100/80 text-amber-950 font-black uppercase">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Tarih</th>
                        <th className="p-3">İkmal Yeri</th>
                        <th className="p-3">Fiş / Fatura No</th>
                        <th className="p-3">Açıklama</th>
                        <th className="p-3 text-right">Miktar (Lt)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {selectedFuelModal.records.map((r, i) => (
                        <tr key={i} className="hover:bg-amber-50/50">
                          <td className="p-3 text-slate-400">{i + 1}</td>
                          <td className="p-3 font-extrabold text-amber-900">{formatDisplayDate(r.tarih)}</td>
                          <td className="p-3">{r.ikmalYeri || '-'}</td>
                          <td className="p-3">{r.faturaNo || '-'}</td>
                          <td className="p-3">{r.aciklama || '-'}</td>
                          <td className="p-3 text-right font-black text-amber-800 text-sm">
                            {r.miktar.toLocaleString('tr-TR')} Lt
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-amber-100/90 font-black text-amber-950 border-t-2 border-amber-300">
                      <tr>
                        <td colSpan={5} className="p-3 text-right uppercase tracking-wider">TOPLAM YAKIT MİKTARI:</td>
                        <td className="p-3 text-right text-base text-amber-900">
                          {selectedFuelModal.totalFuel.toLocaleString('tr-TR')} Lt
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs font-bold text-slate-500">
                Toplam {selectedFuelModal.records.length} ikmal kaydı listelendi
              </span>
              <div className="flex gap-2">
                {selectedFuelModal.records.length > 0 && (
                  <button
                    onClick={() => {
                      const exportData = selectedFuelModal.records.map((r, idx) => ({
                        'Sıra No': idx + 1,
                        'Kuyruk No': selectedFuelModal.kuyrukNo,
                        'Tarih': formatDisplayDate(r.tarih),
                        'İkmal Yeri': r.ikmalYeri || '-',
                        'Fiş / Fatura No': r.faturaNo || '-',
                        'Açıklama': r.aciklama || '-',
                        'Yakıt Miktarı (Lt)': r.miktar
                      }));
                      const ws = XLSX.utils.json_to_sheet(exportData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Yakıt İkmalleri');
                      XLSX.writeFile(wb, `${selectedFuelModal.kuyrukNo}_Yakit_${startDate}_${endDate}.xlsx`);
                    }}
                    className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={14} />
                    EXCEL İNDİR
                  </button>
                )}
                <button
                  onClick={() => setSelectedFuelModal(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2 rounded-xl font-bold text-xs"
                >
                  KAPAT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovdeSorgulaModal;
