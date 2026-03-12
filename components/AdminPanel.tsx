
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { SheetConfig, Aircraft, AppNotification, DailyStatusCode } from '../types';
import { fetchAircraftDataFromAppsScript, formatToHHMM, parseSingleCellToHour } from '../services/sheetService';
import { getMailRecipients, saveMailRecipient, deleteMailRecipient, MailRecipient, sendManualEmail, testMail } from '../src/services/mailService';
import { generateFleetExcelHtml } from '../src/services/excelService';

interface AdminPanelProps {
  onSave: (configs: SheetConfig[], data: Partial<Aircraft>[]) => void;
  onOverride?: (kuyrukNo: string, code: DailyStatusCode) => void;
  onClose: () => void;
  notifications: AppNotification[];
  initialData?: any[]; 
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSave, onOverride, onClose, notifications, initialData = [] }) => {
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
    
    // If recipient wants "ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU", generate it from current previewData
    if (recipient.attachments.includes('ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU')) {
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const html = generateFleetExcelHtml(previewData as Aircraft[], dateStr);
      
      // Convert HTML string to base64 for Apps Script
      // We use btoa(unescape(encodeURIComponent(html))) as in App.tsx
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
    const validCodes: DailyStatusCode[] = ['B', 'BB', 'KM', 'A', 'PB', 'KK', 'X', 'F'];
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

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Map Excel data to Aircraft type
      // Expecting columns like "Kuyruk No", "Durum", "Konum", etc.
      const mappedData = data.map((row: any) => ({
        kuyrukNo: row['Kuyruk No'] || row['KUYRUK NO'] || row['kuyrukNo'],
        durum: row['Durum'] || row['DURUM'] || row['durum'],
        konum: row['Konum'] || row['KONUM'] || row['konum'],
        durumAyrintisi: row['Durum Ayrıntısı'] || row['DURUM AYRINTISI'] || row['durumAyrintisi'],
        faydaliSaat: row['Faydalı Saat'] || row['FAYDALI SAAT'] || row['faydaliSaat'],
        aciklama: row['Açıklama'] || row['AÇIKLAMA'] || row['aciklama'],
        assignedCode: row['Analiz Kodu'] || row['ANALİZ KODU'] || row['assignedCode'] || 'F'
      })).filter(a => a.kuyrukNo);

      if (mappedData.length > 0) {
        setPreviewData(prev => {
          const newData = [...prev];
          mappedData.forEach(incoming => {
            const idx = newData.findIndex(a => a.kuyrukNo === incoming.kuyrukNo);
            if (idx !== -1) {
              newData[idx] = { ...newData[idx], ...incoming };
            }
          });
          return newData;
        });
        alert(`${mappedData.length} adet hava aracı verisi Excel'den yüklendi. Kaydetmeyi unutmayınız.`);
      }
    };
    reader.readAsBinaryString(file);
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
                            {notifications.map((n) => {
                              const isAssignment = n.kolon === 'ANALİZ / ÇİZELGE' || n.kolon === 'ATAMA KODU';
                              return (
                                <tr 
                                  key={n.id} 
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
                <div className="bg-[#021a0c] p-10 flex-1 overflow-y-auto custom-scrollbar rounded-b-[3rem]">
                   <table className="w-full text-left bg-white/5 rounded-3xl overflow-hidden border-collapse">
                      <thead className="bg-emerald-800/40 text-emerald-400">
                         <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Platform</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Kuyruk</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Gövde Saati</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Faydalı Saat (MIN V:AI)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Analiz Kodu (DÜZELTMEK İÇİN ÇİFT TIKLA)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase border-b border-green-900/40">Detay Analizi</th>
                         </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                            <td className="px-8 py-4"><span className="text-[10px] font-black bg-emerald-900/50 px-2 py-1 rounded text-emerald-400">{row.tip || "BELİRSİZ"}</span></td>
                            <td className="px-8 py-4 font-bold">{row.kuyrukNo}</td>
                            <td className="px-8 py-4 text-blue-400 font-black">{row.govdeUcusSaati || '-'}</td>
                            <td className="px-8 py-4 text-emerald-400 font-black">
                              {(row.tip === 'B-360' || row.tip === 'C-650' || row.tip === 'Bell-429') 
                                ? formatToHHMM(typeof row.faydaliSaat === 'number' ? row.faydaliSaat : parseSingleCellToHour(row.faydaliSaat, row.tip)) 
                                : row.faydaliSaat}
                            </td>
                            <td className="px-8 py-4" onDoubleClick={() => setEditingCode({ kuyrukNo: row.kuyrukNo, code: row.assignedCode })}>
                               {editingCode?.kuyrukNo === row.kuyrukNo ? (
                                 <select 
                                   autoFocus
                                   className="bg-black text-white px-2 py-1 rounded border border-emerald-500 font-black text-xs"
                                   value={editingCode.code}
                                   onChange={(e) => handleCodeChange(row.kuyrukNo, e.target.value)}
                                   onBlur={() => setEditingCode(null)}
                                 >
                                   {['B', 'BB', 'KM', 'A', 'PB', 'KK', 'X', 'F'].map(c => (
                                     <option key={c} value={c}>{c}</option>
                                   ))}
                                 </select>
                               ) : (
                                 <span className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${row.assignedCode === 'F' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                   {row.assignedCode}
                                 </span>
                               )}
                            </td>
                            <td className="px-8 py-4 italic text-gray-400">
                               <div className="text-[10px] text-emerald-500 mb-1 font-black">{row.durumAyrintisi}</div>
                               <div className="text-xs truncate max-w-xs">"{row.aciklama}"</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-10 overflow-hidden">
                <div className="p-10 border-b border-green-900/40 flex justify-between items-center bg-black/10 rounded-t-[3rem]">
                   <div>
                      <h1 className="text-white text-3xl font-black uppercase italic">Otomail Sistemi</h1>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">Rapor Gönderim ve Alıcı Yönetimi</p>
                   </div>
                   <button 
                      onClick={handleTestMail}
                      className="text-emerald-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest border border-emerald-500/30 px-4 py-2 rounded-xl hover:bg-emerald-500/10 transition-all"
                   >
                      EKİ TEST MAİLİ GÖNDER
                   </button>
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
                                  {recipients.map((r) => (
                                    <tr key={r.id} className="text-white text-xs">
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
