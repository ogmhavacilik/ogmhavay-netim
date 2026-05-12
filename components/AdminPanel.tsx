import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { SheetConfig, Aircraft, AppNotification, DailyStatusCode } from '../types';
import { fetchAircraftDataFromAppsScript, formatToHHMM, parseSingleCellToHour } from '../services/sheetService';
import { getMailRecipients, saveMailRecipient, deleteMailRecipient, MailRecipient, sendManualEmail, testMail, setupAutoMailTrigger, setupMidnightTrigger } from '../src/services/mailService';
import { generateFleetExcelHtml } from '../src/services/excelService';

interface AdminPanelProps {
  onSave: (configs: SheetConfig[], data: Partial<Aircraft>[]) => void;
  onOverride?: (kuyrukNo: string, code: DailyStatusCode) => void;
  onSyncLogs?: () => void;
  onClose: () => void;
  notifications: AppNotification[];
  initialData?: any[]; 
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSave, onOverride, onSyncLogs, onClose, notifications, initialData = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('notifications'); 
  const [previewData, setPreviewData] = useState<any[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<{ kuyrukNo: string, code: string } | null>(null);
  const [recipients, setRecipients] = useState<MailRecipient[]>([]);
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState<Omit<MailRecipient, 'id'>>({
    name: '',
    email: '',
    type: 'MANUEL',
    time: '09:00',
    days: 'HER GÜN',
    attachments: ''
  });

  React.useEffect(() => {
    if (activeSubTab === 'automail') {
      loadRecipients();
    }
  }, [activeSubTab]);

  const loadRecipients = async () => {
    const data = await getMailRecipients();
    setRecipients(data);
  };

  const handleAddRecipient = async () => {
    if (!newRecipient.name || !newRecipient.email) {
      alert('Lütfen isim ve e-posta giriniz.');
      return;
    }
    const success = await saveMailRecipient(editingRecipientId ? { ...newRecipient, id: editingRecipientId } : newRecipient);
    if (success) {
      alert(editingRecipientId ? 'Alıcı başarıyla güncellendi.' : 'Alıcı başarıyla eklendi.');
      setNewRecipient({
        name: '',
        email: '',
        type: 'MANUEL',
        time: '09:00',
        days: 'HER GÜN',
        attachments: ''
      });
      setEditingRecipientId(null);
      loadRecipients();
    } else {
      alert('Hata oluştu.');
    }
  };

  const handleEditRecipient = (recipient: MailRecipient) => {
    setNewRecipient({
      name: recipient.name,
      email: recipient.email,
      type: recipient.type,
      time: recipient.time,
      days: recipient.days,
      attachments: recipient.attachments
    });
    setEditingRecipientId(recipient.id);
  };

  const handleCancelEdit = () => {
    setNewRecipient({
      name: '',
      email: '',
      type: 'MANUEL',
      time: '09:00',
      days: 'HER GÜN',
      attachments: ''
    });
    setEditingRecipientId(null);
  };

  const handleDeleteRecipient = async (id: string) => {
    if (confirm('Bu alıcıyı silmek istediğinize emin misiniz?')) {
      const success = await deleteMailRecipient(id);
      if (success) {
        loadRecipients();
      }
    }
  };

  const handleManualSend = async (id: string) => {
    const recipient = recipients.find(r => r.id === id);
    if (!recipient) return;

    if (!recipient.attachments) {
      if (!confirm('Bu alıcının seçili raporu yok. Yine de boş mail göndermek istiyor musunuz?')) {
        return;
      }
    }

    setSendingId(id);
    
    const customAttachments: { name: string, data: string, mimeType: string }[] = [];
    
    if (recipient.attachments && (recipient.attachments.includes('ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU') || recipient.attachments.includes('ENVANTER RAPORU'))) {
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const html = generateFleetExcelHtml(previewData as Aircraft[], dateStr);
      const base64Data = btoa(unescape(encodeURIComponent(html)));
      
      customAttachments.push({
        name: 'ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU.xls',
        data: base64Data,
        mimeType: 'application/vnd.ms-excel'
      });
    }

    const success = await sendManualEmail(id, customAttachments);
    setSendingId(null);
    if (success) {
      alert('Raporlar başarıyla gönderildi.');
    } else {
      alert('E-posta gönderilirken hata oluştu.');
    }
  };

  const handleTestMail = async () => {
    const email = prompt('Test maili gönderilecek adresi giriniz:');
    if (!email) return;
    const res = await testMail(email);
    if (res.success) alert('Test e-postası gönderildi!');
    else alert('Hata: ' + res.message);
  };

  const handleSetupAutoMail = async () => {
    if (confirm('Otomatik mail tetikleyicisini kurmak istiyor musunuz? (15 dakikada bir kontrol eder)')) {
      const res = await setupAutoMailTrigger();
      alert(res.message || (res.success ? 'Tetikleyici kuruldu.' : 'Hata oluştu.'));
    }
  };

  const handleSetupMidnight = async () => {
    if (confirm('Gece yarısı loglama tetikleyicisini kurmak istiyor musunuz? (Her gün 00:05)')) {
      const res = await setupMidnightTrigger();
      alert(res.message || (res.success ? 'Tetikleyici kuruldu.' : 'Hata oluştu.'));
    }
  };

  const toggleDay = (day: string) => {
    const currentDays = newRecipient.days.split(',').filter(d => d);
    if (currentDays.includes(day)) {
      setNewRecipient({ ...newRecipient, days: currentDays.filter(d => d !== day).join(',') });
    } else {
      setNewRecipient({ ...newRecipient, days: [...currentDays, day].join(',') });
    }
  };

  const toggleAttachment = (report: string) => {
    const currentAtts = newRecipient.attachments.split(',').filter(a => a);
    if (currentAtts.includes(report)) {
      setNewRecipient({ ...newRecipient, attachments: currentAtts.filter(a => a !== report).join(',') });
    } else {
      setNewRecipient({ ...newRecipient, attachments: [...currentAtts, report].join(',') });
    }
  };

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

  const handleCodeChange = (kuyrukNo: string, newCode: string) => {
    const validCodes: DailyStatusCode[] = ['B', 'BB', 'TBU', 'KM', 'A', 'PB', 'KK', 'X', 'F'];
    if (validCodes.includes(newCode as DailyStatusCode)) {
      setPreviewData(prev => prev.map(a => a.kuyrukNo === kuyrukNo ? { ...a, assignedCode: newCode } : a));
      if (onOverride) onOverride(kuyrukNo, newCode as DailyStatusCode);
    }
    setEditingCode(null);
  };

  const handleFinalSave = () => {
    onSave([], previewData);
    alert('Değişiklikler başarıyla kaydedildi!');
  };

  const [excelRawData, setExcelRawData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    kuyrukNo: '',
    durum: '',
    konum: '',
    durumAyrintisi: '',
    govdeUcusSaati: '',
    faydaliSaat: '',
    aciklama: '',
    assignedCode: ''
  });
  const [showMappingStep, setShowMappingStep] = useState(false);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        if (rawData.length > 0) {
          const headers = rawData[0].map(h => String(h || '').trim());
          const rows = rawData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((h, i) => {
              obj[h] = row[i];
            });
            return obj;
          });
          
          setExcelHeaders(headers);
          setExcelRawData(rows);
          
          const newMapping = { ...mapping };
          const fieldKeywords: Record<string, string[]> = {
            kuyrukNo: ['KUYRUK', 'TAIL', 'K.NO', 'NO'],
            durum: ['DURUM', 'STATUS', 'FAAL'],
            konum: ['KONUM', 'LOCATION', 'MEYDAN'],
            durumAyrintisi: ['AYRINTI', 'DETAIL', 'ALT DURUM'],
            govdeUcusSaati: ['GÖVDE', 'GOVDE', 'TOTAL', 'TT', 'SAAT'],
            faydaliSaat: ['FAYDALI', 'REMAINING', 'KALAN'],
            aciklama: ['AÇIKLAMA', 'ACIKLAMA', 'REMARKS', 'NOT'],
            assignedCode: ['ANALİZ', 'ANALIZ', 'KOD', 'CODE']
          };

          headers.forEach(h => {
             const upperH = h.toUpperCase();
             Object.entries(fieldKeywords).forEach(([field, keywords]) => {
                if (keywords.some(k => upperH.includes(k))) {
                   if (!newMapping[field]) newMapping[field] = h;
                }
             });
          });

          setMapping(newMapping);
          setShowMappingStep(true);
        }
      } catch (err) {
        alert('Excel okuma hatası: ' + String(err));
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const applyMapping = () => {
    if (!mapping.kuyrukNo) {
      alert('Kuyruk No alanı eşleştirilmelidir.');
      return;
    }

    const mappedData = excelRawData.map(row => ({
      tip: row['TIP'] || row['Tip'] || 'BELİRSİZ',
      kuyrukNo: String(row[mapping.kuyrukNo] || '').trim(),
      durum: String(row[mapping.durum] || '').trim(),
      konum: String(row[mapping.konum] || '').trim(),
      durumAyrintisi: String(row[mapping.durumAyrintisi] || '').trim(),
      govdeUcusSaati: String(row[mapping.govdeUcusSaati] || '').trim(),
      faydaliSaat: String(row[mapping.faydaliSaat] || '').trim(),
      aciklama: String(row[mapping.aciklama] || '').trim(),
      assignedCode: row[mapping.assignedCode] || 'F'
    })).filter(a => a.kuyrukNo);

    if (mappedData.length > 0) {
      setPreviewData(prev => {
        const newData = [...prev];
        mappedData.forEach(incoming => {
          const idx = newData.findIndex(a => a.kuyrukNo === incoming.kuyrukNo);
          if (idx !== -1) {
            newData[idx] = { ...newData[idx], ...incoming };
          } else {
            newData.push(incoming);
          }
        });
        return newData;
      });
      setShowMappingStep(false);
      alert(`${mappedData.length} adet hava aracı verisi eşleştirildi.`);
    }
  };

  const [newAircraft, setNewAircraft] = useState({
    tip: 'AT-802',
    kuyrukNo: '',
    durum: 'FAAL',
    durumAyrintisi: '-',
    govdeUcusSaati: '0:00',
    faydaliSaat: '0:00',
    assignedCode: 'F',
    aciklama: ''
  });

  const handleAddNewAircraft = () => {
    if (!newAircraft.kuyrukNo) {
      alert('Lütfen kuyruk numarası giriniz.');
      return;
    }
    const exists = previewData.find(a => a.kuyrukNo.toUpperCase() === newAircraft.kuyrukNo.toUpperCase());
    if (exists) {
      alert('Bu kuyruk numarası zaten mevcut.');
      return;
    }
    setPreviewData(prev => [...prev, { ...newAircraft, kuyrukNo: newAircraft.kuyrukNo.toUpperCase() }]);
    setNewAircraft({
      tip: 'AT-802',
      kuyrukNo: '',
      durum: 'FAAL',
      durumAyrintisi: '-',
      govdeUcusSaati: '0:00',
      faydaliSaat: '0:00',
      assignedCode: 'F',
      aciklama: ''
    });
  };

  const handleDeleteAircraft = (kuyrukNo: string) => {
    if (confirm(`${kuyrukNo} uçağını silmek istediğinize emin misiniz?`)) {
      setPreviewData(prev => prev.filter(a => a.kuyrukNo !== kuyrukNo));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-[#052e16] w-full max-w-[1700px] h-[95vh] rounded-[4rem] border border-green-800/40 flex overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
        
        <div className="w-80 bg-[#021a0c] border-r border-green-900/40 p-10 flex flex-col">
          <div className="mb-14">
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase">ADMİN PANELİ</h2>
            <p className="text-green-600 text-[8px] font-black tracking-[0.6em] mt-3 italic uppercase opacity-50">Sistem Denetim Merkezi</p>
          </div>
          
          <nav className="space-y-10 flex-grow">
            <div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] block mb-6 ml-2">CANLI DENETİM</span>
              <button onClick={() => setActiveSubTab('notifications')} className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeSubTab === 'notifications' ? 'bg-emerald-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
                <span>GELEN KUTUSU</span>
                {notifications.length > 0 && <span className="bg-red-500 text-white text-[9px] w-6 h-6 rounded-full flex items-center justify-center">{notifications.length}</span>}
              </button>
            </div>
            
            <div className="pl-6 border-l-2 border-green-900/30 space-y-6">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] block mb-2 ml-2">ENTEGRASYON</span>
              <button onClick={() => setActiveSubTab('excel')} className={`w-full text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest ${activeSubTab === 'excel' ? 'text-emerald-400 bg-emerald-500/10 rounded-xl' : 'text-gray-600 hover:text-white'}`}>○ EXCEL MODÜLLERİ</button>
              <button onClick={() => setActiveSubTab('automail')} className={`w-full text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest ${activeSubTab === 'automail' ? 'text-emerald-400 bg-emerald-500/10 rounded-xl' : 'text-gray-600 hover:text-white'}`}>○ OTOMAİL SİSTEMİ</button>
            </div>
          </nav>
          <button onClick={onClose} className="py-6 rounded-[2rem] border-2 border-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-950/30 transition-all">PANELİ KAPAT</button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#052e16] relative">
          {activeSubTab === 'notifications' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-10 border-b border-green-900/40 bg-black/10 flex justify-between items-center">
                   <div>
                      <h1 className="text-white text-4xl font-black uppercase tracking-tighter italic">Gelen Kutusu</h1>
                      <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-3">NOT: TURUNCU SATIRLAR CÜMLE ANALİZİ SONUCU ATANAN KODLARDIR</p>
                   </div>
                   <button onClick={() => exportTableToExcel('inbox-table', 'Gelen_Kutusu_Loglari')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={3}/></svg>
                      GELEN KUTUSU EXCEL İNDİR
                   </button>
                </div>
                
                <div className="flex-1 p-10 overflow-hidden">
                   {notifications.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-700 uppercase font-black tracking-[0.5em] italic opacity-30">Henüz bir değişiklik tespit edilmedi</div>
                   ) : (
                     <div className="bg-white/5 rounded-[2.5rem] border border-green-900/30 overflow-hidden flex flex-col shadow-2xl h-full">
                       <div className="overflow-y-auto custom-scrollbar">
                         <table id="inbox-table" className="w-full text-left border-collapse">
                           <thead className="sticky top-0 z-10">
                             <tr className="bg-emerald-700 text-white">
                               <th className="px-8 py-6 font-black text-[11px] uppercase tracking-widest border-r border-emerald-800">TARİH / SAAT</th>
                               <th className="px-8 py-6 font-black text-[11px] uppercase tracking-widest border-r border-emerald-800">KUYRUK NO</th>
                               <th className="px-8 py-6 font-black text-[11px] uppercase tracking-widest">GÜNCELLEME VE ANALİZ DETAYI (DÜZENLEMEK İÇİN ÇİFT TIKLA)</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-white/10">
                             {notifications.map((n, idx) => {
                               const isAssignment = n.kolon === 'ANALİZ / ÇİZELGE' || n.kolon === 'ATAMA KODU';
                               return (
                                 <tr 
                                   key={`${n.id}-${idx}`} 
                                   className={`group border-b border-white/5 transition-all ${isAssignment ? 'bg-orange-600/20 hover:bg-orange-600/30 cursor-pointer' : 'hover:bg-white/5'}`}
                                 >
                                   <td className="px-8 py-6 text-emerald-400 font-black text-xs">{n.tarih}</td>
                                   <td className="px-8 py-6 text-white font-black text-lg italic tracking-tighter">
                                      {n.kuyrukNo}
                                      <div className={`text-[8px] uppercase mt-1 ${isAssignment ? 'text-orange-400 font-black' : 'text-gray-500'}`}>
                                         {isAssignment ? `● ${n.platform} ANALİZ ATAMASI` : n.platform}
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                     <div className={`p-4 rounded-2xl text-white text-sm font-medium italic border transition-all ${isAssignment ? 'bg-orange-500/10 border-orange-500/20' : 'bg-black/20 border-white/5'}`}>
                                        {n.mesaj}
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
                </div>
            </div>
          ) : activeSubTab === 'excel' ? (
            <div className="flex-1 flex flex-col p-10">
                <div className="p-10 border-b border-green-900/40 flex justify-between items-center bg-black/10 rounded-t-[3rem]">
                  <div>
                    <h1 className="text-white text-3xl font-black uppercase italic">Excel Entegrasyon Modülleri</h1>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">Aktif Platformlar: Bell-429, AT-802 (Sayfa: GÜNLÜK DURUM)</p>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={onSyncLogs}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      LOGLARI SENKRONİZE ET (MANUEL)
                    </button>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleExcelUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={3}/></svg>
                        EXCEL YÜKLE (OFFLİNE)
                      </button>
                    </div>
                    <button onClick={handleFinalSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3}/></svg>
                      DEĞİŞİKLİKLERİ KAYDET
                    </button>
                  </div>
                </div>
                <div className="bg-[#021a0c] p-4 flex-1 overflow-y-auto custom-scrollbar rounded-b-[3rem]">
                   {showMappingStep ? (
                     <div className="bg-white/5 p-6 rounded-[2.5rem] border border-orange-500/30">
                        <div className="flex justify-between items-center mb-8">
                           <h2 className="text-orange-500 font-black text-xl uppercase italic tracking-tighter">Hücre Okuyucu - Kolon Eşleştirme</h2>
                           <div className="flex space-x-3">
                              <button onClick={() => setShowMappingStep(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-black text-[10px] uppercase">Vazgeç</button>
                              <button onClick={applyMapping} className="px-10 py-3 rounded-xl bg-orange-600 text-white font-black text-[10px] uppercase shadow-xl hover:bg-orange-500 transition-all">Veriyi İşle ve Aktar</button>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           {[
                             { label: 'Kuyruk No', key: 'kuyrukNo' },
                             { label: 'Durum', key: 'durum' },
                             { label: 'Konum', key: 'konum' },
                             { label: 'Durum Ayrıntısı', key: 'durumAyrintisi' },
                             { label: 'Gövde Saati', key: 'govdeUcusSaati' },
                             { label: 'Faydalı Saat', key: 'faydaliSaat' },
                             { label: 'Analiz Kodu', key: 'assignedCode' },
                             { label: 'Açıklama', key: 'aciklama' }
                           ].map(item => (
                             <div key={item.key} className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">{item.label}</label>
                                <select 
                                  className="w-full bg-emerald-950/50 text-white font-bold p-2.5 rounded-xl border border-emerald-900/40 text-[10px] outline-none focus:border-orange-500"
                                  value={mapping[item.key]}
                                  onChange={(e) => setMapping({ ...mapping, [item.key]: e.target.value })}
                                >
                                   <option value="">-- SEÇİNİZ --</option>
                                   {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                             </div>
                           ))}
                        </div>
                        <div className="mt-8 overflow-x-auto">
                           <h3 className="text-gray-600 text-[10px] font-black uppercase mb-3 ml-2 italic underline">Excel Ham Veri Önizleme (İlk 5 Satır)</h3>
                           <table className="w-full border-collapse text-[9px]">
                              <thead>
                                 <tr className="bg-white/5">
                                    {excelHeaders.map(h => <th key={h} className="p-2 border border-white/5 text-gray-400 font-black uppercase text-left">{h}</th>)}
                                 </tr>
                              </thead>
                              <tbody>
                                 {excelRawData.slice(0, 5).map((row, i) => (
                                   <tr key={i} className="border-b border-white/5">
                                      {excelHeaders.map(h => <td key={h} className="p-2 border border-white/5 text-gray-500 italic">{row[h]}</td>)}
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                   ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left bg-white/5 rounded-3xl border-collapse">
                        <thead className="bg-[#021a0c] sticky top-0 z-20">
                           <tr className="border-b border-green-900/40">
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Platform</th>
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Kuyruk</th>
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Durum</th>
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Gövde Saati</th>
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Faydalı Saat (MIN V:AI)</th>
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Analiz Kodu (DÜZELTMEK İÇİN ÇİFT TIKLA)</th>
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Açıklama</th>
                              <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">İŞLEM</th>
                           </tr>
                        </thead>
                      <tbody>
                        {/* Yeni Hava Aracı Ekleme Satırı */}
                        <tr className="bg-emerald-950/30 border-b border-emerald-900/40">
                          <td className="px-6 py-4">
                            <select 
                              className="bg-black/50 text-white p-2 rounded text-[10px] w-full outline-none border border-emerald-900/20"
                              value={newAircraft.tip}
                              onChange={(e) => setNewAircraft({...newAircraft, tip: e.target.value})}
                            >
                              <option value="AT-802">AT-802</option>
                              <option value="Bell-429">Bell-429</option>
                              <option value="T-70">T-70</option>
                              <option value="B-360">B-360</option>
                              <option value="C-650">C-650</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              placeholder="Kuyruk No"
                              className="bg-black/50 text-white p-2 rounded text-[10px] w-full outline-none border border-emerald-900/20"
                              value={newAircraft.kuyrukNo}
                              onChange={(e) => setNewAircraft({...newAircraft, kuyrukNo: e.target.value.toUpperCase()})}
                            />
                          </td>
                          <td className="px-6 py-4">
                             <select 
                               className="bg-black/50 text-white p-2 rounded text-[10px] w-full outline-none border border-emerald-900/20"
                               value={newAircraft.durum}
                               onChange={(e) => setNewAircraft({...newAircraft, durum: e.target.value})}
                             >
                                <option value="FAAL">FAAL</option>
                                <option value="GAYRİ FAAL">GAYRİ FAAL</option>
                             </select>
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              placeholder="0:00"
                              className="bg-black/50 text-white p-2 rounded text-[10px] w-full outline-none border border-emerald-900/20"
                              value={newAircraft.govdeUcusSaati}
                              onChange={(e) => setNewAircraft({...newAircraft, govdeUcusSaati: e.target.value})}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              placeholder="0:00"
                              className="bg-black/50 text-white p-2 rounded text-[10px] w-full outline-none border border-emerald-900/20"
                              value={newAircraft.faydaliSaat}
                              onChange={(e) => setNewAircraft({...newAircraft, faydaliSaat: e.target.value})}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              className="bg-black/50 text-white p-2 rounded text-[10px] w-full outline-none border border-emerald-900/20"
                              value={newAircraft.assignedCode}
                              onChange={(e) => setNewAircraft({...newAircraft, assignedCode: e.target.value as DailyStatusCode})}
                            >
                               {['B', 'BB', 'TBU', 'KM', 'A', 'PB', 'KK', 'X', 'F'].map(c => (
                                 <option key={c} value={c}>{c}</option>
                               ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              className="bg-black/50 text-white p-2 rounded text-[10px] w-full outline-none border border-emerald-900/20"
                              placeholder="Açıklama"
                              value={newAircraft.aciklama}
                              onChange={(e) => setNewAircraft({...newAircraft, aciklama: e.target.value})}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={handleAddNewAircraft}
                              className="bg-emerald-600 text-white px-4 py-2 rounded text-[9px] font-black uppercase whitespace-nowrap hover:bg-emerald-500 shadow-lg"
                            >
                              YÜKLE ↓
                            </button>
                          </td>
                        </tr>

                        {previewData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                            <td className="px-8 py-4"><span className="text-[10px] font-black bg-emerald-900/50 px-2 py-1 rounded text-emerald-400">{row.tip || "BELİRSİZ"}</span></td>
                            <td className="px-8 py-4 font-bold">{row.kuyrukNo}</td>
                            <td className="px-8 py-4">
                               <div className="flex flex-col">
                                  <span className={`font-black ${String(row.durum).toUpperCase().includes('FAAL') && !String(row.durum).toUpperCase().includes('GAYRİ') ? 'text-emerald-400' : 'text-red-400'}`}>
                                     {row.durum}
                                  </span>
                                  {row.durumAyrintisi && row.durumAyrintisi !== '-' && (
                                    <span className="text-[10px] text-orange-400 font-bold italic">({row.durumAyrintisi})</span>
                                  )}
                               </div>
                            </td>
                            <td className="px-8 py-4 text-orange-400 font-black">{row.govdeUcusSaati || '-'}</td>
                            <td className="px-8 py-4 text-emerald-400 font-black">
                              {(row.tip === 'B-360' || row.tip === 'C-650' || row.tip === 'Bell-429') 
                                ? formatToHHMM(typeof row.faydaliSaat === 'number' ? row.faydaliSaat : parseSingleCellToHour(row.faydaliSaat, row.tip)) 
                                : row.faydaliSaat}
                            </td>
                            <td className="px-8 py-4">
                               {editingCode?.kuyrukNo === row.kuyrukNo ? (
                                 <select 
                                   autoFocus
                                   className="bg-black text-white px-2 py-1 rounded border border-emerald-500 font-black text-xs"
                                   value={editingCode.code}
                                   onChange={(e) => handleCodeChange(row.kuyrukNo, e.target.value)}
                                   onBlur={() => setEditingCode(null)}
                                 >
                                   {['B', 'BB', 'TBU', 'KM', 'A', 'PB', 'KK', 'X', 'F'].map(c => (
                                     <option key={c} value={c}>{c}</option>
                                   ))}
                                 </select>
                               ) : (
                                 <div 
                                   className="flex items-center space-x-2 group cursor-pointer"
                                   onClick={() => setEditingCode({ kuyrukNo: row.kuyrukNo, code: row.assignedCode })}
                                 >
                                   <span className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${row.assignedCode === 'F' ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/40' : 'bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/40'}`}>
                                     {row.assignedCode}
                                   </span>
                                   <svg className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                   </svg>
                                 </div>
                               )}
                            </td>
                            <td className="px-8 py-4 italic text-gray-400">
                               <div className="text-xs truncate max-w-xs text-wrap">"{row.aciklama}"</div>
                            </td>
                            <td className="px-8 py-4">
                               <button 
                                 onClick={() => handleDeleteAircraft(row.kuyrukNo)}
                                 className="text-red-500 hover:text-red-400 font-black text-[9px] uppercase tracking-tighter"
                               >
                                 SİL
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                   )}
                </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-10 overflow-hidden">
                <div className="p-10 border-b border-green-900/40 flex justify-between items-center bg-black/10 rounded-t-[3rem]">
                   <div>
                      <h1 className="text-white text-3xl font-black uppercase italic">Otomail Sistemi</h1>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">Rapor Gönderim ve Alıcı Yönetimi</p>
                   </div>
                   <div className="flex space-x-3">
                      <button 
                         onClick={handleSetupAutoMail}
                         title="Otomatik mail tetikleyicisini kur"
                         className="text-emerald-500 hover:text-emerald-400 font-black text-[9px] uppercase tracking-widest border border-emerald-500/30 px-3 py-2 rounded-xl hover:bg-emerald-500/10 transition-all"
                      >
                         OTO MAİL KUR
                      </button>
                      <button 
                         onClick={handleSetupMidnight}
                         title="Gece yarısı loglama tetikleyicisini kur"
                         className="text-emerald-500 hover:text-emerald-400 font-black text-[9px] uppercase tracking-widest border border-emerald-500/30 px-3 py-2 rounded-xl hover:bg-emerald-500/10 transition-all"
                      >
                         GECE LOG KUR
                      </button>
                      <button 
                         onClick={handleTestMail}
                         className="text-emerald-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest border border-emerald-500/30 px-4 py-2 rounded-xl hover:bg-emerald-500/10 transition-all"
                      >
                         EKİ TEST MAİLİ GÖNDER
                      </button>
                   </div>
                </div>
                <div className="bg-[#021a0c] p-10 flex-1 overflow-y-auto custom-scrollbar rounded-b-[3rem]">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="bg-white/5 p-10 rounded-[2.5rem] border border-green-900/30">
                         <h3 className="text-white font-black text-lg uppercase mb-8">
                            {editingRecipientId ? 'Alıcıyı Düzenle' : 'Yeni Alıcı Ekle'}
                         </h3>
                         <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div>
                               <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">PERSONEL ADI</label>
                               <input 
                                 type="text" 
                                 className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all" 
                                 placeholder="Ad Soyad"
                                 value={newRecipient.name}
                                 onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                               />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">PERSONEL MAİL ADRESİ</label>
                               <input 
                                 type="email" 
                                 className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all" 
                                 placeholder="ornek@ogm.gov.tr"
                                 value={newRecipient.email}
                                 onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                               />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">GÖNDERME TÜRÜ</label>
                                  <select 
                                    className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={newRecipient.type}
                                    onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value as 'MANUEL' | 'OTOMATİK' })}
                                  >
                                     <option value="MANUEL">MANUEL</option>
                                     <option value="OTOMATİK">OTOMATİK</option>
                                  </select>
                               </div>
                               <div>
                                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">SAAT (OTOMATİK İÇİN)</label>
                                  <input 
                                    type="time" 
                                    className="w-full px-6 py-4 bg-black/40 border border-green-900/40 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={newRecipient.time}
                                    onChange={(e) => setNewRecipient({ ...newRecipient, time: e.target.value })}
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-4 ml-2">GÖNDERİM PERİYODU</label>
                               <div className="flex flex-wrap gap-3">
                                  {['HER GÜN', 'PAZARTESİ', 'CUMA'].map(day => (
                                    <label key={day} className="flex items-center space-x-3 bg-black/20 px-4 py-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                       <input 
                                         type="checkbox" 
                                         className="w-4 h-4 rounded border-green-900 bg-black text-emerald-600 focus:ring-emerald-500"
                                         checked={newRecipient.days.includes(day)}
                                         onChange={() => toggleDay(day)}
                                       />
                                       <span className="text-white text-[10px] font-black uppercase tracking-widest">{day}</span>
                                    </label>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-4 ml-2 flex justify-between">
                                  <span>EKLENECEK RAPORLAR</span>
                                  <span className="text-emerald-500 lowercase italic font-normal">en az birini seçiniz</span>
                               </label>
                               <div className="space-y-3">
                                  {['ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU', 'FAALİYET ÇİZELGESİ', 'HAVA ARACI EXCELİ (ONLİNE)'].map(report => (
                                    <label key={report} className="flex items-center space-x-3 bg-black/20 px-4 py-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                       <input 
                                         type="checkbox" 
                                         className="w-4 h-4 rounded border-green-900 bg-black text-emerald-600 focus:ring-emerald-500"
                                         checked={newRecipient.attachments.includes(report)}
                                         onChange={() => toggleAttachment(report)}
                                       />
                                       <span className="text-white text-[10px] font-black uppercase tracking-widest">{report}</span>
                                    </label>
                                  ))}
                               </div>
                            </div>
                            <button 
                               type="button" 
                               onClick={handleAddRecipient}
                               className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all"
                            >
                               ALICIYI KAYDET VE LOGLA
                            </button>
                         </form>
                      </div>

                      <div className="bg-white/5 p-10 rounded-[2.5rem] border border-green-900/30 flex flex-col">
                         <h3 className="text-white font-black text-lg uppercase mb-8">Kayıtlı Alıcılar ve Durum</h3>
                         <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                               <thead className="text-emerald-500 text-[9px] font-black uppercase tracking-widest border-b border-white/10">
                                  <tr>
                                     <th className="pb-4">AD SOYAD</th>
                                     <th className="pb-4">MAİL</th>
                                     <th className="pb-4">TÜR</th>
                                     <th className="pb-4">RAPORLAR</th>
                                     <th className="pb-4">İŞLEM</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                  {recipients.map((r, idx) => (
                                    <tr key={`${r.id}-${idx}`} className="text-white text-xs">
                                       <td className="py-4 font-bold">{r.name}</td>
                                       <td className="py-4 opacity-70 italic">{r.email}</td>
                                       <td className="py-4">
                                          <span className={`px-2 py-1 rounded text-[8px] font-black ${r.type === 'OTOMATİK' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                             {r.type} {r.type === 'OTOMATİK' && `(${r.time})`}
                                          </span>
                                       </td>
                                       <td className="py-4">
                                          <div className="flex flex-wrap gap-1">
                                             {r.attachments ? r.attachments.split(',').map((att, idx) => (
                                               <span key={idx} className="bg-white/5 text-[7px] px-1.5 py-0.5 rounded border border-white/10 opacity-60" title={att}>
                                                 {att.split(' ').map(w => w[0]).join('')}
                                               </span>
                                             )) : <span className="text-red-500 text-[7px] font-bold">YOK</span>}
                                          </div>
                                       </td>
                                       <td className="py-4 flex space-x-3">
                                          <button 
                                            onClick={() => handleManualSend(r.id)}
                                            disabled={sendingId === r.id}
                                            className="text-emerald-500 hover:text-emerald-400 font-black text-[9px] uppercase tracking-widest disabled:opacity-50 flex items-center"
                                          >
                                            {sendingId === r.id && (
                                              <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            )}
                                            {sendingId === r.id ? 'Exceller hazırlanıyor...' : 'GÖNDER'}
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteRecipient(r.id)}
                                            className="text-red-500 hover:text-red-400 font-black text-[9px] uppercase tracking-widest"
                                          >
                                            SİL
                                          </button>
                                       </td>
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
