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
  onCleanupLogs?: () => void;
  onClose: () => void;
  notifications: AppNotification[];
  initialData?: any[]; 
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSave, onOverride, onSyncLogs, onCleanupLogs, onClose, notifications, initialData = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState('notifications'); 
  const [isCleaningLogs, setIsCleaningLogs] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<{ kuyrukNo: string, code: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedForOverride, setSelectedForOverride] = useState<any>(null);
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
    const validCodes: DailyStatusCode[] = ['B', 'BB', 'TBU', 'KM', 'A', 'PB', 'KK', 'X', 'F', '?'];
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

  const filteredOverrideData = previewData.filter(a => 
    a.kuyrukNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] block mb-2 ml-2">SİSTEM YÖNETİMİ</span>
              <button onClick={() => setActiveSubTab('override')} className={`w-full text-left px-5 py-3 font-black text-[10px] uppercase tracking-widest ${activeSubTab === 'override' ? 'text-emerald-400 bg-emerald-500/10 rounded-xl' : 'text-gray-600 hover:text-white'}`}>○ KESİN KOD MÜDAHALE</button>
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
          ) : activeSubTab === 'override' ? (
            <div className="flex-1 flex flex-col p-10">
                <div className="p-10 border-b border-green-900/40 flex justify-between items-center bg-black/10 rounded-t-[3rem]">
                  <div>
                    <h1 className="text-white text-3xl font-black uppercase italic">Kesin Kod Müdahale Modülü</h1>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mt-2">NOT: BURADAN YAPILAN ATAMALAR KESİN EMİRDİR VE SİSTEM TARAFINDAN DEĞİŞTİRİLEMEZ</p>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={async () => {
                        if (onCleanupLogs) {
                          setIsCleaningLogs(true);
                          await onCleanupLogs();
                          setIsCleaningLogs(false);
                        }
                      }}
                      disabled={isCleaningLogs}
                      className={`${isCleaningLogs ? 'bg-red-800' : 'bg-red-700 hover:bg-red-600'} text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center`}
                    >
                      {isCleaningLogs ? 'TEMİZLENİYOR...' : 'LOGLARI TEMİZLE (TEKRARLARI SİL)'}
                    </button>
                    <button 
                      onClick={onSyncLogs}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center"
                    >
                      LOGLARI SENKRONİZE ET (GÜNCELLE)
                    </button>
                    <button onClick={handleFinalSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center">
                      DEĞİŞİKLİKLERİ KAYDET
                    </button>
                  </div>
                </div>
                <div className="bg-[#021a0c] p-10 flex-1 overflow-y-auto custom-scrollbar rounded-b-[3rem] flex flex-col">
                    <div className="mb-10 flex items-center space-x-6">
                      <div className="flex-1 relative group">
                        <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                          type="text" 
                          placeholder="ARAMA: KUYRUK NUMARASI YAZINIZ..."
                          className="w-full bg-black/40 border-2 border-green-900/40 rounded-[2rem] py-6 pl-16 pr-8 text-white font-black text-xl uppercase tracking-widest outline-none focus:border-emerald-500 transition-all shadow-2xl"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="text-right">
                         <span className="text-gray-600 text-[10px] font-black uppercase block mb-1">TOPLAM KAYIT</span>
                         <span className="text-white text-2xl font-black italic">{filteredOverrideData.length} / {previewData.length}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto flex-1 bg-black/20 rounded-[3rem] border border-green-900/20 p-4">
                      {searchTerm.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#021a0c] sticky top-0 z-20">
                             <tr className="border-b border-green-900/40">
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Platform</th>
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Kuyruk No</th>
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap text-center">KESİN ANALİZ KODU</th>
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Durum / Ayrıntı</th>
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Açıklama</th>
                                <th className="px-6 py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">EYLEM</th>
                             </tr>
                          </thead>
                         <tbody>
                          {filteredOverrideData.map((row, i) => (
                            <tr 
                              key={i} 
                              onDoubleClick={() => {
                                setSelectedForOverride(row);
                                setIsOverrideModalOpen(true);
                              }}
                              className="border-b border-white/5 text-white text-sm font-medium hover:bg-emerald-500/10 transition-all cursor-pointer group"
                            >
                              <td className="px-6 py-6"><span className="text-[10px] font-black bg-emerald-900/50 px-2 py-1 rounded text-emerald-400">{row.tip || "BELİRSİZ"}</span></td>
                              <td className="px-6 py-6 font-black text-2xl italic tracking-tighter group-hover:text-emerald-400 transition-colors uppercase">{row.kuyrukNo}</td>
                              <td className="px-6 py-6">
                                 <div className="flex justify-center">
                                     <span className={`px-10 py-4 rounded-2xl text-xl font-black transition-all shadow-lg ${!row.assignedCode || row.assignedCode === '?' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : (row.assignedCode === 'F' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20')}`}>
                                       {row.assignedCode || '?'}
                                     </span>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex flex-col">
                                    <span className={`font-black uppercase ${String(row.durum).toUpperCase().includes('FAAL') && !String(row.durum).toUpperCase().includes('GAYRİ') ? 'text-emerald-400' : 'text-red-400'}`}>
                                       {row.durum}
                                    </span>
                                    {row.durumAyrintisi && row.durumAyrintisi !== '-' && (
                                      <span className="text-[10px] text-orange-400 font-bold italic">({row.durumAyrintisi})</span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-6 italic text-gray-400">
                                 <div className="text-xs truncate max-w-sm">"{row.aciklama}"</div>
                              </td>
                              <td className="px-6 py-6">
                                 <button 
                                   onClick={() => {
                                      setSelectedForOverride(row);
                                      setIsOverrideModalOpen(true);
                                   }}
                                   className="bg-emerald-600/20 text-emerald-400 p-3 rounded-xl border border-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:text-white"
                                 >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                 </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                           <svg className="w-20 h-20 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                           <p className="text-white font-black uppercase tracking-[0.4em] text-center">Arama kutusuna kuyruk no yazınız<br/><span className="text-[10px] text-emerald-500">Örn: 9005, T-173</span></p>
                        </div>
                      )}
                    </div>
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
          {isOverrideModalOpen && selectedForOverride && (
            <OverrideModal 
              aircraft={selectedForOverride} 
              onClose={() => setIsOverrideModalOpen(false)}
              onSave={(code) => {
                handleCodeChange(selectedForOverride.kuyrukNo, code);
                setIsOverrideModalOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const OverrideModal: React.FC<{ 
  aircraft: any; 
  onSave: (code: string) => void; 
  onClose: () => void 
}> = ({ aircraft, onSave, onClose }) => {
  const [code, setCode] = useState(aircraft.assignedCode || '?');

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
       <div className="bg-[#052e16] w-full max-w-md rounded-[3rem] border border-orange-500/30 overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.2)]">
          <div className="p-10 border-b border-orange-500/20 bg-orange-500/5">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{aircraft.kuyrukNo}</h2>
                   <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">{aircraft.tip}</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <div className="bg-black/40 p-4 rounded-3xl border border-white/5 space-y-1">
                <div className="flex justify-between">
                   <span className="text-[9px] font-black text-gray-600 uppercase">Mevcut Durum</span>
                   <span className="text-white text-xs font-bold">{aircraft.durum}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-[9px] font-black text-gray-600 uppercase">Ayrıntı</span>
                   <span className="text-orange-400 text-xs font-bold italic">{aircraft.durumAyrintisi || '-'}</span>
                </div>
             </div>
          </div>

          <div className="p-10 space-y-8">
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 text-center">KESİN ANALİZ KODUNU SEÇİNİZ</label>
                <div className="grid grid-cols-4 gap-3">
                   {['B', 'BB', 'TBU', 'KM', 'A', 'PB', 'KK', 'X', 'F', '?'].map(c => (
                     <button 
                       key={c}
                       onClick={() => setCode(c)}
                       className={`py-4 rounded-2xl font-black text-lg transition-all ${code === c ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border-2 border-white/20' : 'bg-black/40 text-gray-500 border border-white/5 hover:border-orange-500/50'}`}
                     >
                       {c}
                     </button>
                   ))}
                </div>
                <p className="text-orange-500/60 text-[8px] font-bold text-center mt-6 uppercase tracking-widest">BU İŞLEM İLE ANALİZ MOTORU BU UÇAK İÇİN DEVRE DIŞI KALIR</p>
             </div>

             <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => onSave(code)}
                  className="w-full py-6 rounded-2xl bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center space-x-3"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                   <span>EMRİ ONAYLA VE KAYDET</span>
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-5 rounded-2xl bg-black/40 text-gray-500 font-black text-[10px] uppercase tracking-widest border border-white/5 hover:text-white transition-all"
                >
                   İPTAL ET
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default AdminPanel;
