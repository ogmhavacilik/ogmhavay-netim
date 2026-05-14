import React, { useState } from 'react';
import { X, Search, AlertCircle, Download } from 'lucide-react';
import { LOG_SCRIPT_URL, MAIL_LOG_SHEET_ID } from '../constants';
import { parseSingleCellToHour } from '../services/sheetService';
import { Aircraft } from '../types';

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
}

const GovdeSorgulaModal: React.FC<GovdeSorgulaModalProps> = ({ isOpen, onClose, fleet }) => {
  const [type, setType] = useState('Tümü');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SorguResult[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatAsHour = (val: number | null) => {
    if (val === null) return '-';
    const hours = Math.floor(Math.abs(val));
    const minutes = Math.round((Math.abs(val) - hours) * 60);
    const sign = val < 0 ? '-' : '';
    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatAsDecimal = (val: number | null, aircraftType?: string) => {
    if (val === null) return '-';
    // Special case for Bell-429: if it was parsed from HH.MM format, we might want to show it as decimal or as it was.
    // But usually we just show the numeric value.
    return val.toFixed(1).replace('.', ',');
  };

  const handleSorgula = async () => {
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçiniz.');
      return;
    }
    
    setError('');
    setResults([]);
    setIsLoading(true);

    try {
      const res = await fetch(LOG_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'getFaaliyetLog',
          sheetId: MAIL_LOG_SHEET_ID
        })
      });
      
      const result = await res.json();
      const allData = (result && result.success && result.data && Array.isArray(result.data.envanterLog)) ? result.data.envanterLog : [];
      
      const normalizeDate = (dateStr: any): string | null => {
        if (!dateStr) return null;
        const s = String(dateStr).trim();
        let d = -1, m = -1, y = -1;
        
        if (s.includes('T')) {
          const dt = new Date(s);
          if (!isNaN(dt.getTime())) {
            d = dt.getUTCDate();
            m = dt.getUTCMonth() + 1;
            y = dt.getUTCFullYear();
          }
        } else if (s.includes('-')) {
          const parts = s.split(/[- :]/);
          if (parts.length >= 3) {
            if (parts[0].length === 4) {
              y = parseInt(parts[0], 10);
              m = parseInt(parts[1], 10);
              d = parseInt(parts[2], 10);
            } else {
              d = parseInt(parts[0], 10);
              m = parseInt(parts[1], 10);
              y = parseInt(parts[2], 10);
            }
          }
        } else if (s.includes('.')) {
          const parts = s.split('.');
          if (parts.length === 3) {
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            y = parseInt(parts[2], 10);
          }
        } else if (s.includes('/')) {
          const parts = s.split('/');
          if (parts.length === 3) {
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
            y = parseInt(parts[2], 10);
          }
        }
        
        if (d !== -1 && m !== -1 && y !== -1) {
          return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
        return null;
      };

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
          isDecimal: a.tip === 'Bell-429' || a.tip === 'B-360' || a.tip === 'C-650'
        };
      });

      startData.forEach((row: any) => {
        const kNo = String(row.kuyrukNo || '').trim();
        if (resultMap[kNo]) {
          const h = parseSingleCellToHour(row.govdeUcusSaati, resultMap[kNo].tip);
          if (h !== null) {
            if (resultMap[kNo].baslangicSaat === null || h > (resultMap[kNo].baslangicSaat || 0)) {
              resultMap[kNo].baslangicSaat = h;
              resultMap[kNo].baslangicRaw = String(row.govdeUcusSaati || '').trim();
              if (resultMap[kNo].isDecimal) {
                // Remove thousands separator dot if it exists, use comma as decimal for display
                const raw = String(row.govdeUcusSaati || '').trim();
                if (raw.includes('.') && raw.includes(',')) {
                  resultMap[kNo].baslangicDecimal = raw.replace(/\./g, '');
                } else {
                  resultMap[kNo].baslangicDecimal = raw.replace('.', ',');
                }
              }
            }
          }
        }
      });

      endData.forEach((row: any) => {
        const kNo = String(row.kuyrukNo || '').trim();
        if (resultMap[kNo]) {
          const h = parseSingleCellToHour(row.govdeUcusSaati, resultMap[kNo].tip);
          if (h !== null) {
            if (resultMap[kNo].bitisSaat === null || h > (resultMap[kNo].bitisSaat || 0)) {
              resultMap[kNo].bitisSaat = h;
              resultMap[kNo].bitisRaw = String(row.govdeUcusSaati || '').trim();
              if (resultMap[kNo].isDecimal) {
                // Remove thousands separator dot if it exists, use comma as decimal for display
                const raw = String(row.govdeUcusSaati || '').trim();
                if (raw.includes('.') && raw.includes(',')) {
                  resultMap[kNo].bitisDecimal = raw.replace(/\./g, '');
                } else {
                  resultMap[kNo].bitisDecimal = raw.replace('.', ',');
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
          return item;
        })
        .filter(item => item.baslangicSaat !== null || item.bitisSaat !== null)
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
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="4" style="border: none; text-align: right; color: gray; font-size: 10px;">Veri Çekiliş Tarihi: ${dateStr}</td>
          </tr>
          <tr>
            <td colspan="4" class="title-row" style="text-align: center;">GÖVDE UÇUŞ SAATİ SORGULAMA SONUÇLARI (${type})</td>
          </tr>
          <tr>
            <td colspan="4" style="text-align: center; font-weight: bold; color: #475569; background-color: #f8fafc;">Başlangıç: ${startDate} | Bitiş: ${endDate}</td>
          </tr>
          <tr class="header-row">
            <th>KUYRUK NO</th>
            <th>BAŞLANGIÇ (ONDALIK)</th>
            <th>BAŞLANGIÇ (SAAT)</th>
            <th>BİTİŞ (ONDALIK)</th>
            <th>BİTİŞ (SAAT)</th>
            <th>TOPLAM UÇUŞ</th>
          </tr>
    `;

    results.forEach(r => {
      const isDec = r.tip === 'Bell-429' || r.tip === 'B-360' || r.tip === 'C-650';
      const startDec = isDec ? (r.baslangicDecimal || '-') : formatAsDecimal(r.baslangicSaat);
      const bitisDec = isDec ? (r.bitisDecimal || '-') : formatAsDecimal(r.bitisSaat);
      
      html += `
        <tr>
          <td class="kuyruk-col">${r.kuyrukNo}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${startDec}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${formatAsHour(r.baslangicSaat)}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${bitisDec}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${formatAsHour(r.bitisSaat)}</td>
          <td class="fark-col" style="mso-number-format:'\@';">${formatAsHour(r.fark)}</td>
        </tr>
      `;
    });

    const totalFark = results.reduce((acc, curr) => acc + curr.fark, 0);
    html += `
        <tr style="background-color: #f0fdf4; font-weight: bold;">
          <td colspan="5" style="text-align: right; padding-right: 20px; color: #064e3b; font-size: 14px;">TOPLAM UÇUŞ SÜRESİ:</td>
          <td class="fark-col" style="mso-number-format:'\@'; color: #1e40af; font-size: 16px;">${formatAsHour(totalFark)}</td>
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
    link.download = `Govde_Ucus_Saati_${type}_${startDate}_${endDate}.xls`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-emerald-900 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Gövde Uçuş Saati Sorgula</h2>
            <p className="text-emerald-400 text-xs font-bold mt-1 uppercase tracking-widest">İki tarih arası uçuş süresi hesaplama</p>
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

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-center font-bold text-sm mb-6">
              <AlertCircle className="mr-3 shrink-0" />
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="border-4 border-emerald-800/10 rounded-[2rem] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-white">
                    <th className="px-2 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">KUYRUK NO</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BAŞL. (ONDALIK)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BAŞL. (SAAT)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BİTİŞ (ONDALIK)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BİTİŞ (SAAT)</th>
                    <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest">TOPLAM UÇUŞ</th>
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
                        <td className="px-2 py-4 text-center font-black text-blue-600 text-base bg-blue-50/30">
                          {formatAsHour(r.fark)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t-4 border-emerald-900">
                    <td colSpan={5} className="px-6 py-6 text-right font-black text-emerald-900 uppercase tracking-widest text-sm">
                      TOPLAM UÇUŞ SÜRESİ:
                    </td>
                    <td className="px-4 py-6 text-center font-black text-blue-700 text-xl bg-blue-100/50">
                      {formatAsHour(results.reduce((acc, curr) => acc + curr.fark, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {!isLoading && results.length === 0 && !error && (
            <div className="text-center py-20 text-slate-400 font-bold flex flex-col items-center">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Sorgulama yapmak için tarih aralığı seçip "Sorgula" butonuna basınız.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovdeSorgulaModal;