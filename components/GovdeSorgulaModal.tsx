import React, { useState } from 'react';
import { X, Search, AlertCircle, Download } from 'lucide-react';

interface GovdeSorgulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SorguResult {
  kuyrukNo: string;
  baslangicSaat: number;
  bitisSaat: number;
  fark: number;
  isDecimal?: boolean;
}

const GovdeSorgulaModal: React.FC<GovdeSorgulaModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState('Tümü');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SorguResult[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parseHour = (val: any): { val: number | null, isDecimal: boolean } => {
    if (val === null || val === undefined || String(val).trim() === "" || String(val).toUpperCase() === "N/A") {
      return { val: null, isDecimal: false };
    }
    
    if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
      const d = new Date(val);
      const epoch = new Date(Date.UTC(1899, 11, 30));
      return { val: (d.getTime() - epoch.getTime()) / (1000 * 60 * 60), isDecimal: false };
    }

    const s = String(val).trim().replace(',', '.');
    if (s.includes(':')) {
      const parts = s.split(':').map(Number);
      if (parts.length >= 2) return { val: (parts[0] || 0) + (parts[1] || 0) / 60, isDecimal: false };
    }

    const n = parseFloat(s);
    if (isNaN(n)) return { val: null, isDecimal: false };
    
    // If it contains a dot or comma but no colon, it's likely decimal
    const isDec = String(val).includes('.') || String(val).includes(',');
    return { val: n, isDecimal: isDec };
  };

  const formatHour = (hours: number): string => {
    let h = Math.floor(Math.abs(hours));
    let m = Math.round((Math.abs(hours) - h) * 60);
    if (m === 60) {
      h += 1;
      m = 0;
    }
    const sign = hours < 0 ? '-' : '';
    return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatDecimal = (hours: number): string => {
    return hours.toFixed(2).replace('.', ',');
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
      const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          action: 'getAircraftData',
          sheetId: '1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg',
          sheetName: 'Envanter Log',
          mapping: {
            tarih: 'B2:B10000',
            kuyrukNo: 'C2:C10000',
            tip: 'D2:D10000',
            govdeUcusSaati: 'E2:E10000'
          }
        })
      });
      
      const result = await res.json();
      const data = (result && result.success && Array.isArray(result.data)) ? result.data : (Array.isArray(result) ? result : []);
      
      const startD = new Date(startDate);
      const endD = new Date(endDate);

      const decimalTypes = ['B-360', 'C-650', 'Bell-429'];

      const startData = data.filter((row: any) => {
        if (!row.tarih) return false;
        if (type !== 'Tümü' && row.tip !== type) return false;
        const d = new Date(row.tarih);
        return d.getDate() === startD.getDate() && d.getMonth() === startD.getMonth() && d.getFullYear() === startD.getFullYear();
      });

      const endData = data.filter((row: any) => {
        if (!row.tarih) return false;
        if (type !== 'Tümü' && row.tip !== type) return false;
        const d = new Date(row.tarih);
        return d.getDate() === endD.getDate() && d.getMonth() === endD.getMonth() && d.getFullYear() === endD.getFullYear();
      });

      const resultMap: Record<string, {
        kuyrukNo: string;
        baslangicSaat: number | null;
        bitisSaat: number | null;
        isDecimal: boolean;
      }> = {};

      startData.forEach((row: any) => {
        const { val: h, isDecimal: parsedIsDecimal } = parseHour(row.govdeUcusSaati);
        const isDecimal = parsedIsDecimal || decimalTypes.includes(row.tip);
        if (h !== null) {
          if (!resultMap[row.kuyrukNo]) {
            resultMap[row.kuyrukNo] = {
              kuyrukNo: row.kuyrukNo,
              baslangicSaat: h,
              bitisSaat: null,
              isDecimal: isDecimal
            };
          } else {
            if (resultMap[row.kuyrukNo].baslangicSaat === null || h > (resultMap[row.kuyrukNo].baslangicSaat || 0)) {
              resultMap[row.kuyrukNo].baslangicSaat = h;
              resultMap[row.kuyrukNo].isDecimal = isDecimal;
            }
          }
        }
      });

      endData.forEach((row: any) => {
        const { val: h, isDecimal: parsedIsDecimal } = parseHour(row.govdeUcusSaati);
        const isDecimal = parsedIsDecimal || decimalTypes.includes(row.tip);
        if (h !== null) {
          if (!resultMap[row.kuyrukNo]) {
            resultMap[row.kuyrukNo] = {
              kuyrukNo: row.kuyrukNo,
              baslangicSaat: null,
              bitisSaat: h,
              isDecimal: isDecimal
            };
          } else {
            if (resultMap[row.kuyrukNo].bitisSaat === null || h > (resultMap[row.kuyrukNo].bitisSaat || 0)) {
              resultMap[row.kuyrukNo].bitisSaat = h;
              if (!resultMap[row.kuyrukNo].isDecimal) resultMap[row.kuyrukNo].isDecimal = isDecimal;
            }
          }
        }
      });

      const finalResults: SorguResult[] = [];
      
      Object.values(resultMap).forEach(res => {
        if (res.baslangicSaat !== null && res.bitisSaat !== null) {
          const fark = res.bitisSaat - res.baslangicSaat;
          finalResults.push({
            kuyrukNo: res.kuyrukNo,
            baslangicSaat: res.baslangicSaat,
            bitisSaat: res.bitisSaat,
            fark: fark,
            isDecimal: res.isDecimal
          });
        }
      });

      setResults(finalResults.sort((a, b) => a.kuyrukNo.localeCompare(b.kuyrukNo)));

    } catch (err) {
      console.error(err);
      setError('Veri çekilirken bir hata oluştu.');
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
          .decimal-info { color: #94a3b8; font-size: 10px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="5" style="border: none; text-align: right; color: gray; font-size: 10px;">Veri Çekiliş Tarihi: ${dateStr}</td>
          </tr>
          <tr>
            <td colspan="5" class="title-row" style="text-align: center;">GÖVDE UÇUŞ SAATİ SORGULAMA SONUÇLARI (${type})</td>
          </tr>
          <tr>
            <td colspan="5" style="text-align: center; font-weight: bold; color: #475569; background-color: #f8fafc;">Başlangıç: ${startDate} | Bitiş: ${endDate}</td>
          </tr>
          <tr class="header-row">
            <th>KUYRUK NO</th>
            <th>BAŞLANGIÇ GÖVDE SAATİ</th>
            <th>BİTİŞ GÖVDE SAATİ</th>
            <th>TOPLAM UÇUŞ (ONDALIK)</th>
            <th>SAATLİK KARŞILIĞI</th>
          </tr>
    `;

    results.forEach(r => {
      html += `
        <tr>
          <td class="kuyruk-col">${r.kuyrukNo}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${r.isDecimal ? formatDecimal(r.baslangicSaat) : formatHour(r.baslangicSaat)}</td>
          <td class="saat-col" style="mso-number-format:'\@';">${r.isDecimal ? formatDecimal(r.bitisSaat) : formatHour(r.bitisSaat)}</td>
          <td class="fark-col" style="mso-number-format:'\@';">${r.isDecimal ? formatDecimal(r.fark) : '-'}</td>
          <td class="fark-col" style="mso-number-format:'\@';">${formatHour(r.fark)}</td>
        </tr>
      `;
    });

    const totalFark = results.reduce((acc, curr) => acc + curr.fark, 0);
    html += `
        <tr style="background-color: #f0fdf4; font-weight: bold;">
          <td colspan="3" style="text-align: right; padding-right: 20px; color: #064e3b; font-size: 14px;">TOPLAM UÇUŞ SÜRESİ:</td>
          <td class="fark-col" style="mso-number-format:'\@'; color: #166534; font-size: 16px;">${totalFark.toFixed(2).replace('.', ',')}</td>
          <td class="fark-col" style="mso-number-format:'\@'; color: #1e40af; font-size: 16px;">${formatHour(totalFark)}</td>
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
                    <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">KUYRUK NO</th>
                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BAŞLANGIÇ GÖVDE SAATİ</th>
                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">BİTİŞ GÖVDE SAATİ</th>
                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-emerald-800">TOPLAM UÇUŞ (ONDALIK)</th>
                    <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest">SAATLİK KARŞILIĞI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-black text-emerald-900 text-base border-r border-slate-100">{r.kuyrukNo}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-100">
                        {r.isDecimal ? formatDecimal(r.baslangicSaat) : formatHour(r.baslangicSaat)}
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-100">
                        {r.isDecimal ? formatDecimal(r.bitisSaat) : formatHour(r.bitisSaat)}
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 border-r border-slate-100 bg-slate-50/50">
                        {r.isDecimal ? formatDecimal(r.fark) : '-'}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-blue-600 text-lg bg-blue-50/30">
                        {formatHour(r.fark)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t-4 border-emerald-900">
                    <td colSpan={3} className="px-6 py-6 text-right font-black text-emerald-900 uppercase tracking-widest text-sm">
                      TOPLAM UÇUŞ SÜRESİ:
                    </td>
                    <td className="px-4 py-6 text-center font-black text-emerald-700 text-xl bg-emerald-100/50 border-r border-emerald-200">
                      {results.reduce((acc, curr) => acc + curr.fark, 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-6 text-center font-black text-blue-700 text-2xl bg-blue-100/50">
                      {formatHour(results.reduce((acc, curr) => acc + curr.fark, 0))}
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