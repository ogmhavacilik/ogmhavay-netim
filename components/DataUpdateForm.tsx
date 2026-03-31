
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Aircraft, Status, DailyStatusCode } from '../types';
import { updateAircraftData, fetchAircraftSpecificData, analyzeStatus, updatePastEnvanterLog } from '../services/sheetService';
import { LOG_SCRIPT_URL, MAIL_LOG_SHEET_ID } from '../constants';

interface DataUpdateFormProps {
  fleet: Aircraft[];
  envanterLog?: any[];
  onBack: () => void;
  onSuccess: (type: string) => void;
  onSaveIntraDay?: (data: {
    kuyrukNo: string;
    tip: string;
    startTime: string;
    endTime: string;
    status: DailyStatusCode;
    description: string;
    date: string;
  }) => Promise<boolean>;
}

const formatForDateInput = (val: string | undefined | null) => {
  if (!val || val === '-') return '';
  const cleanVal = val.trim();
  
  // Handle Excel serial numbers
  if (/^\d{5}$/.test(cleanVal)) {
    const serial = parseInt(cleanVal, 10);
    if (serial > 40000 && serial < 60000) {
      const date = new Date((serial - 25569) * 86400 * 1000);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  if (cleanVal.includes('T')) return cleanVal.split('T')[0];
  if (cleanVal.match(/^\d{4}-\d{2}-\d{2}$/)) return cleanVal;
  
  const parts = cleanVal.split(/[\.\/\-\s]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      return `${year}-${month}-${day}`;
    }
  }
  return cleanVal;
};

const DataUpdateForm: React.FC<DataUpdateFormProps> = ({ fleet, envanterLog, onBack, onSuccess, onSaveIntraDay }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedKuyruk, setSelectedKuyruk] = useState('');
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [at802Step, setAt802Step] = useState<1 | 2>(1);
  const [isLoadingSpecific, setIsLoadingSpecific] = useState(false);
  const [at802Data, setAt802Data] = useState({
    acTT: '',
    landings: '',
    starts: '',
    flights: '',
    frdsTest: '',
    motorCalisma: ''
  });

  const [formData, setFormData] = useState({
    govdeUcusSaati: '',
    bakim50H: '',
    bakimTakvim: '',
    bakim40H: '',
    bakim120H: '',
    bakim480H: '',
    bakimTakvimTarih: '',
    faydaliSaat: '',
    bakim200H: '',
    landings: '',
    konum: '',
    durum: '',
    durumAyrintisi: '',
    aciklama: '',
    intraDayStartTime: '',
    intraDayEndTime: '',
    islemTarihi: new Date().toISOString().split('T')[0]
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setPassword('');
    setAuthError('');
    setIsAuth(false);
    setSelectedKuyruk('');
    setSelectedAircraft(null);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const validPasswords: Record<string, string> = {
      'AT-802': '802',
      'Bell-429': '429',
      'T-70': '70',
      'C-650': '650',
      'B-360': '360'
    };
    if (validPasswords[selectedType!] === password) {
      setIsAuth(true);
      setAuthError('');
    } else {
      setAuthError('Hatalı Şifre');
    }
  };

  const filteredFleet = fleet.filter(a => a.tip === selectedType);

  const getNextDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('tr-TR');
  };

  const getRemainingDays = (dateStr: string) => {
    if (!dateStr) return null;
    const lastDate = new Date(dateStr);
    if (isNaN(lastDate.getTime())) return null;
    
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 7);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDateMidnight = new Date(nextDate);
    nextDateMidnight.setHours(0, 0, 0, 0);
    
    const diffTime = nextDateMidnight.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getAT802ColorClass = (days: number | null) => {
    if (days === null) return 'text-white/40';
    if (days >= 5) return 'text-emerald-400';
    if (days === 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const prevKuyrukRef = React.useRef<string>('');

  useEffect(() => {
    if (selectedKuyruk === prevKuyrukRef.current) return; // Sadece kuyruk değiştiğinde çalıştır
    prevKuyrukRef.current = selectedKuyruk;

    const aircraft = fleet.find(a => a.kuyrukNo === selectedKuyruk);
    if (aircraft) {
      setSelectedAircraft(aircraft);
      setFormData({
        govdeUcusSaati: aircraft.govdeUcusSaati && aircraft.govdeUcusSaati !== '-' ? aircraft.govdeUcusSaati : '',
        bakim50H: aircraft.bakim50H && aircraft.bakim50H !== '-' ? aircraft.bakim50H : '',
        bakimTakvim: formatForDateInput(aircraft.bakimTakvim),
        bakim40H: aircraft.bakim40H && aircraft.bakim40H !== '-' ? aircraft.bakim40H : '',
        bakim120H: aircraft.bakim120H && aircraft.bakim120H !== '-' ? aircraft.bakim120H : '',
        bakim480H: aircraft.bakim480H && aircraft.bakim480H !== '-' ? aircraft.bakim480H : '',
        bakim200H: aircraft.bakim200H && aircraft.bakim200H !== '-' ? aircraft.bakim200H : '',
        landings: aircraft.landings && aircraft.landings !== '-' ? aircraft.landings : '',
        bakimTakvimTarih: formatForDateInput(aircraft.bakimTakvimTarih),
        faydaliSaat: aircraft.faydaliSaat !== null ? aircraft.faydaliSaat.toString() : '',
        konum: aircraft.konum && aircraft.konum !== '-' ? aircraft.konum : '',
        durum: aircraft.durum || '',
        durumAyrintisi: aircraft.durumAyrintisi && aircraft.durumAyrintisi !== '-' ? aircraft.durumAyrintisi : '',
        aciklama: aircraft.aciklama && aircraft.aciklama !== '-' ? aircraft.aciklama : '',
        intraDayStartTime: '',
        intraDayEndTime: '',
        islemTarihi: new Date().toISOString().split('T')[0]
      });

      if (aircraft.tip === 'AT-802') {
        setAt802Step(1);
        setAt802Data({
          acTT: aircraft.acTT && aircraft.acTT !== '-' ? aircraft.acTT : '',
          landings: aircraft.landings && aircraft.landings !== '-' ? aircraft.landings : '',
          starts: aircraft.engineStarts && aircraft.engineStarts !== '-' ? aircraft.engineStarts : '',
          flights: aircraft.engineFlights && aircraft.engineFlights !== '-' ? aircraft.engineFlights : '',
          frdsTest: formatForDateInput(aircraft.frdsTestDate),
          motorCalisma: formatForDateInput(aircraft.motorRunDate),
        });
        
        setIsLoadingSpecific(true);
        fetchAircraftSpecificData(aircraft.appsScriptUrl || '', aircraft.sheetId || '', aircraft.kuyrukNo)
          .then(res => {
            if (res.success && res.data) {
              setAt802Data({
                acTT: res.data.acTT || aircraft.acTT || '',
                landings: res.data.landings || aircraft.landings || '',
                starts: res.data.starts || aircraft.engineStarts || '',
                flights: res.data.flights || aircraft.engineFlights || '',
                frdsTest: formatForDateInput(res.data.frdsTest || aircraft.frdsTestDate),
                motorCalisma: formatForDateInput(res.data.motorCalisma || aircraft.motorRunDate)
              });
            }
          })
          .catch(() => {})
          .finally(() => setIsLoadingSpecific(false));
      }
    } else {
      setSelectedAircraft(null);
    }
  }, [selectedKuyruk, fleet]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAircraft) return;

    setIsSubmitting(true);
    setMessage(null);

    let finalData: Record<string, any>;
    
    if (selectedAircraft.tip === 'AT-802') {
      // AT-802 için SADECE izin verilen alanları gönderiyoruz.
      // Teknik veriler (acTT, landings vb.) değiştirilebilir çünkü bunlar uçak özel sayfasındadır.
      // Günlük durum sayfasındaki formüllü alanlar (Gövde Saati, Faydalı Saat) gönderilmez.
      finalData = {
        acTT: at802Data.acTT,
        landings: at802Data.landings,
        starts: at802Data.starts,
        flights: at802Data.flights,
        frdsTest: at802Data.frdsTest,
        motorCalisma: at802Data.motorCalisma,
        konum: formData.konum,
        durum: formData.durum,
        durumAyrintisi: formData.durumAyrintisi,
        aciklama: formData.aciklama,
        intraDayStartTime: formData.intraDayStartTime,
        intraDayEndTime: formData.intraDayEndTime,
        islemTarihi: formData.islemTarihi
      };
      
      // Boş alanları temizle
      Object.keys(finalData).forEach(key => {
        if (finalData[key] === '' || finalData[key] === null || finalData[key] === undefined) {
          delete finalData[key];
        }
      });
    } else {
      finalData = { ...formData };
      
      // B-360 ve C-650 için boş verilerin gönderilmesini engelle
      if (selectedAircraft.tip === 'B-360' || selectedAircraft.tip === 'C-650') {
        Object.keys(finalData).forEach(key => {
          if (key !== 'aciklama' && (finalData[key] === '' || finalData[key] === null || finalData[key] === undefined)) {
            delete finalData[key];
          }
        });
      }

      if (selectedAircraft.tip === 'Bell-429') {
        if (finalData.govdeUcusSaati) {
          finalData.govdeUcusSaati = finalData.govdeUcusSaati.replace(':', ',').replace('.', ',');
        }
        if (finalData.bakim50H) {
          finalData.bakim50H = finalData.bakim50H.replace(':', ',').replace('.', ',');
        }
      }

      if (selectedAircraft.tip === 'T-70') {
        delete finalData.bakim40H;
        delete finalData.bakim120H;
        delete finalData.bakim480H;
        delete finalData.bakimTakvimTarih;
      }
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const isPastDate = formData.islemTarihi < today;

      // 1. GÜN İÇİ FAALİYET KAYDI (Hem güncel hem geçmiş tarih için geçerli)
      if (onSaveIntraDay && (formData.intraDayStartTime || formData.intraDayEndTime)) {
        // If changing to FAAL, the time logged is for the PREVIOUS status (GAYRI_FAAL)
        const statusToAnalyze = formData.durum === Status.FAAL ? {
          durum: selectedAircraft.durum,
          durumAyrintisi: selectedAircraft.durumAyrintisi,
          aciklama: selectedAircraft.aciklama
        } : { 
          durum: formData.durum, 
          durumAyrintisi: formData.durumAyrintisi, 
          aciklama: formData.aciklama 
        };
        
        const analysis = analyzeStatus(statusToAnalyze);
        
        const intraDaySaved = await onSaveIntraDay({
          kuyrukNo: selectedAircraft.kuyrukNo,
          tip: selectedAircraft.tip || '',
          startTime: formData.intraDayStartTime,
          endTime: formData.intraDayEndTime,
          status: analysis.code,
          description: formData.aciklama,
          date: formData.islemTarihi
        });

        if (!intraDaySaved) {
          setMessage({ type: 'error', text: 'Gün içi faaliyet kaydı başarısız oldu.' });
          setIsSubmitting(false);
          return;
        }
      }

      if (isPastDate) {
        // 2. GEÇMİŞ TARİHLİ GÜNCELLEME: Sadece Gövde Uçuş Saati güncellenir (Envanter Log)
        const pastHours = finalData.govdeUcusSaati || finalData.acTT;
        if (pastHours) {
          const dateParts = formData.islemTarihi.split('-');
          const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
          
          const result = await updatePastEnvanterLog(
            LOG_SCRIPT_URL,
            MAIL_LOG_SHEET_ID,
            selectedAircraft.kuyrukNo,
            formattedDate,
            pastHours
          );

          if (result.success) {
            setMessage({ type: 'success', text: 'Geçmiş tarihli Gövde Uçuş Saati başarıyla güncellendi.' });
            setTimeout(() => {
              onSuccess(selectedAircraft.tip);
            }, 1500);
          } else {
            setMessage({ type: 'error', text: result.message || 'Geçmiş gün güncellemesi başarısız.' });
          }
        } else {
          // Eğer saat girilmemişse ama gün içi faaliyet kaydedilmişse başarılı sayılabilir
          if (formData.intraDayStartTime || formData.intraDayEndTime) {
            setMessage({ type: 'success', text: 'Gün içi faaliyet başarıyla kaydedildi.' });
            setTimeout(() => {
              onSuccess(selectedAircraft.tip);
            }, 1500);
          } else {
            setMessage({ type: 'error', text: 'Geçmiş tarihli güncelleme için Gövde Uçuş Saati girmelisiniz.' });
          }
        }
        return; // Geçmiş tarih ise burada bitir
      }

      // 3. GÜNCEL TARİH (BUGÜN): Mevcut düzen devam eder
      
      // Format date to dd.MM.yyyy
      const dateParts = formData.islemTarihi.split('-');
      const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

      const result = await updateAircraftData(
        selectedAircraft.appsScriptUrl || '',
        selectedAircraft.sheetId || '',
        selectedAircraft.kuyrukNo,
        finalData,
        selectedAircraft.mapping,
        selectedAircraft.sheetName,
        selectedAircraft.tip
      );

      if (result.success) {
        // Envanter Log ve Faaliyet Log'a aynı anda gönder
        try {
          const statusToAnalyze = {
            durum: formData.durum,
            durumAyrintisi: formData.durumAyrintisi,
            aciklama: formData.aciklama
          };
          const analysis = analyzeStatus(statusToAnalyze);
          
          await fetch(LOG_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'logSingleAircraftActivity',
              data: {
                date: formattedDate,
                kuyrukNo: selectedAircraft.kuyrukNo,
                tip: selectedAircraft.tip,
                govdeUcusSaati: finalData.acTT || selectedAircraft.govdeUcusSaati || 0,
                faydaliSaat: finalData.faydaliSaat || selectedAircraft.faydaliSaat || 0,
                konum: formData.konum,
                durum: formData.durum,
                durumAyrintisi: formData.durumAyrintisi,
                aciklama: formData.aciklama,
                analizKodu: analysis.code
              }
            })
          });
        } catch (logError) {
          console.error("Merkezi log güncellenirken hata oluştu:", logError);
        }

        setMessage({ type: 'success', text: 'Veriler başarıyla güncellendi.' });
        setTimeout(() => {
          onSuccess(selectedAircraft.tip);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Güncelleme sırasında bir hata oluştu.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBell429 = selectedAircraft?.tip === 'Bell-429';
  const isT70 = selectedAircraft?.tip === 'T-70';
  const isB360OrC650 = selectedAircraft?.tip === 'B-360' || selectedAircraft?.tip === 'C-650';

  const todayStr = new Date().toISOString().split('T')[0];
  const isPastDate = formData.islemTarihi !== todayStr && formData.islemTarihi < todayStr;
  const disabledClass = isPastDate ? " opacity-50 cursor-not-allowed" : "";

  useEffect(() => {
    if (selectedKuyruk) {
      if (isPastDate && envanterLog) {
        const dateParts = formData.islemTarihi.split('-');
        const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`; // yyyy-MM-dd
        
        const logEntry = envanterLog.find(log => 
          log.kuyrukNo === selectedKuyruk && 
          log.tarih === formattedDate
        );
        
        if (logEntry) {
          const hours = logEntry.govdeUcusSaati ? String(logEntry.govdeUcusSaati).replace('.', ',') : '';
          setFormData(prev => ({
            ...prev,
            govdeUcusSaati: hours || prev.govdeUcusSaati,
            faydaliSaat: logEntry.faydaliSaat ? String(logEntry.faydaliSaat).replace('.', ',') : prev.faydaliSaat,
            konum: logEntry.konum || prev.konum,
            durum: logEntry.durum || prev.durum,
            durumAyrintisi: logEntry.durumAyrintisi || prev.durumAyrintisi,
            aciklama: logEntry.aciklama || prev.aciklama
          }));
          if (selectedType === 'AT-802') {
            setAt802Data(prev => ({
              ...prev,
              acTT: hours || prev.acTT,
              landings: logEntry.landings ? String(logEntry.landings).replace('.', ',') : prev.landings,
              starts: logEntry.engineStarts ? String(logEntry.engineStarts).replace('.', ',') : prev.starts,
              flights: logEntry.engineFlights ? String(logEntry.engineFlights).replace('.', ',') : prev.flights,
              frdsTest: formatForDateInput(logEntry.frdsTestDate),
              motorCalisma: formatForDateInput(logEntry.motorRunDate),
            }));
          }
        }
      } else if (!isPastDate && selectedAircraft) {
        // Bugün ise mevcut uçak verilerini getir
        setFormData(prev => ({
          ...prev,
          govdeUcusSaati: selectedAircraft.govdeUcusSaati ? String(selectedAircraft.govdeUcusSaati).replace('.', ',') : '',
          bakim50H: selectedAircraft.bakim50H ? String(selectedAircraft.bakim50H).replace('.', ',') : '',
          bakimTakvim: formatForDateInput(selectedAircraft.bakimTakvim),
          bakim40H: selectedAircraft.bakim40H ? String(selectedAircraft.bakim40H).replace('.', ',') : '',
          bakim120H: selectedAircraft.bakim120H ? String(selectedAircraft.bakim120H).replace('.', ',') : '',
          bakim480H: selectedAircraft.bakim480H ? String(selectedAircraft.bakim480H).replace('.', ',') : '',
          bakimTakvimTarih: formatForDateInput(selectedAircraft.bakimTakvimTarih),
          faydaliSaat: selectedAircraft.faydaliSaat ? String(selectedAircraft.faydaliSaat).replace('.', ',') : '',
          bakim200H: selectedAircraft.bakim200H ? String(selectedAircraft.bakim200H).replace('.', ',') : '',
          landings: selectedAircraft.landings || '',
          konum: selectedAircraft.konum || '',
          durum: selectedAircraft.durum || '',
          durumAyrintisi: selectedAircraft.durumAyrintisi || '',
          aciklama: selectedAircraft.aciklama || ''
        }));
        if (selectedType === 'AT-802') {
          setAt802Data({
            acTT: selectedAircraft.govdeUcusSaati ? String(selectedAircraft.govdeUcusSaati).replace('.', ',') : '',
            landings: selectedAircraft.landings || '',
            starts: '',
            flights: '',
            frdsTest: formatForDateInput(selectedAircraft.frdsTestDate),
            motorCalisma: formatForDateInput(selectedAircraft.motorRunDate),
            bakimTakvimTarih: formatForDateInput(selectedAircraft.bakimTakvimTarih)
          });
        }
      }
    }
  }, [formData.islemTarihi, selectedKuyruk, envanterLog, isPastDate, selectedType, selectedAircraft]);

  return (
    <div className="min-h-screen bg-[#021a0c] p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-emerald-500 font-black text-xs uppercase tracking-widest mb-8 hover:bg-white/10 transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Dön
        </button>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic mb-8">HAVA ARACI GÜNLÜK DURUM GÜNCELLE</h2>
          
          {!selectedType ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['BELL-429', 'AT-802', 'T-70', 'B-360', 'C-650'].map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type === 'BELL-429' ? 'Bell-429' : type)}
                  className="bg-white/5 border-2 border-white/10 hover:border-emerald-500 p-8 rounded-3xl text-white font-black text-xl transition-all"
                >
                  {type}
                </button>
              ))}
            </div>
          ) : !isAuth ? (
            <div className="max-w-md mx-auto">
              <h3 className="text-emerald-500 font-black text-center mb-6 uppercase tracking-widest">{selectedType} GİRİŞ ŞİFRESİ</h3>
              <form onSubmit={handleAuth} className="space-y-6">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Şifre Giriniz"
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-6 py-4 text-white text-center font-bold focus:border-emerald-500 outline-none transition-all"
                  autoFocus
                />
                {authError && <p className="text-red-500 text-center font-bold text-xs uppercase">{authError}</p>}
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setSelectedType(null)} className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl uppercase tracking-widest">GERİ</button>
                  <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest">GİRİŞ</button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-8 md:mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em] mb-4">İŞLEM TARİHİ</label>
                  <input 
                    type="date" 
                    value={formData.islemTarihi}
                    onChange={(e) => handleInputChange('islemTarihi', e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-4 md:px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">{selectedType} HAVA ARACI SEÇİMİ</label>
                    <button onClick={() => { setIsAuth(false); setSelectedType(null); setSelectedKuyruk(''); }} className="text-xs font-black text-white/40 hover:text-white uppercase tracking-widest">TİP DEĞİŞTİR</button>
                  </div>
                  <select 
                    value={selectedKuyruk}
                    onChange={(e) => setSelectedKuyruk(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-4 md:px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Kuyruk Numarası Seçiniz...</option>
                    {filteredFleet.map(a => (
                      <option key={a.kuyrukNo} value={a.kuyrukNo}>{a.kuyrukNo} ({a.cagriKodu})</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedAircraft ? (
                isBell429 ? (
                  <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                        <input type="text" placeholder="YENİ (00:00)" value={formData.govdeUcusSaati} onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM (50H)</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ SAAT" value={formData.bakim50H} onChange={(e) => handleInputChange('bakim50H', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM (TARİH)</label>
                        <input disabled={isPastDate} type="date" value={formData.bakimTakvim} onChange={(e) => handleInputChange('bakimTakvim', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER GÖREV YERİ</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ KONUM" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER DURUMU</label>
                        <select disabled={isPastDate} value={formData.durum} onChange={(e) => { 
                          const val = e.target.value;
                          handleInputChange('durum', val); 
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          if (val === Status.FAAL) {
                            handleInputChange('durumAyrintisi', '-');
                            if (selectedAircraft.durum === Status.GAYRI_FAAL && !formData.intraDayEndTime) {
                              handleInputChange('intraDayEndTime', timeStr);
                            }
                          } else if (val === Status.GAYRI_FAAL) {
                            if (!formData.intraDayStartTime) {
                              handleInputChange('intraDayStartTime', timeStr);
                            }
                          }
                        }} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`}>
                          <option value={Status.FAAL}>{Status.FAAL}</option>
                          <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                        </select>
                      </div>
                      {formData.durum === Status.GAYRI_FAAL && (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GAYRI FAAL BAŞLANGIÇ SAATİ</label>
                            <input disabled={isPastDate} type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUM AYRINTISI</label>
                            <input disabled={isPastDate} type="text" list="status-details" placeholder="YENİ AYRINTI" value={formData.durumAyrintisi} onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                            <datalist id="status-details">
                              <option value="BAKIM">BAKIM</option>
                              <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                              <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                              <option value="ARIZA">ARIZA</option>
                              <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                              <option value="KAZA KIRIM">KAZA KIRIM</option>
                              <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                              <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                            </datalist>
                          </div>
                        </>
                      )}
                      {formData.durum === Status.FAAL && selectedAircraft.durum === Status.GAYRI_FAAL && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FAAL OLDUĞU SAAT</label>
                          <input disabled={isPastDate} type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                        </div>
                      )}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                        <textarea disabled={isPastDate} rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none${disabledClass}`}></textarea>
                      </div>
                    </div>
                    {message && (
                      <div className={`p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {message.text}
                      </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl uppercase tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center">
                      {isSubmitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "GÜNCELLE"}
                    </button>
                  </form>
                ) : isT70 ? (
                  <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                        <input type="text" placeholder="YENİ (00:00)" value={formData.govdeUcusSaati} onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">KONUM</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ KONUM" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                        <select disabled={isPastDate} value={formData.durum} onChange={(e) => { 
                          const val = e.target.value;
                          handleInputChange('durum', val); 
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          if (val === Status.FAAL) {
                            handleInputChange('durumAyrintisi', '-');
                            if (selectedAircraft.durum === Status.GAYRI_FAAL && !formData.intraDayEndTime) {
                              handleInputChange('intraDayEndTime', timeStr);
                            }
                          } else if (val === Status.GAYRI_FAAL) {
                            if (!formData.intraDayStartTime) {
                              handleInputChange('intraDayStartTime', timeStr);
                            }
                          }
                        }} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`}>
                          <option value={Status.FAAL}>{Status.FAAL}</option>
                          <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                        </select>
                      </div>
                      {formData.durum === Status.GAYRI_FAAL && (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GAYRI FAAL BAŞLANGIÇ SAATİ</label>
                            <input disabled={isPastDate} type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUM AYRINTISI</label>
                            <input disabled={isPastDate} type="text" list="status-details" placeholder="YENİ AYRINTI" value={formData.durumAyrintisi} onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                            <datalist id="status-details">
                              <option value="BAKIM">BAKIM</option>
                              <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                              <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                              <option value="ARIZA">ARIZA</option>
                              <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                              <option value="KAZA KIRIM">KAZA KIRIM</option>
                              <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                              <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                            </datalist>
                          </div>
                        </>
                      )}
                      {formData.durum === Status.FAAL && selectedAircraft.durum === Status.GAYRI_FAAL && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FAAL OLDUĞU SAAT</label>
                          <input disabled={isPastDate} type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                        </div>
                      )}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                        <textarea disabled={isPastDate} rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none${disabledClass}`}></textarea>
                      </div>
                    </div>
                    {message && (
                      <div className={`p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {message.text}
                      </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl uppercase tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center">
                      {isSubmitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "GÜNCELLE"}
                    </button>
                  </form>
                ) : isB360OrC650 ? (
                  <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                        <input type="text" placeholder="YENİ (00:00)" value={formData.govdeUcusSaati} onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">LANDING</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ DEĞER" value={formData.landings} onChange={(e) => handleInputChange('landings', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM ZAMANI (200 SAAT)</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ SAAT" value={formData.bakim200H} onChange={(e) => handleInputChange('bakim200H', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM TARİHİ</label>
                        <input disabled={isPastDate} type="date" value={formData.bakimTakvimTarih} onChange={(e) => handleInputChange('bakimTakvimTarih', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">KONUM</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ KONUM" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                        <select disabled={isPastDate} value={formData.durum} onChange={(e) => { 
                          const val = e.target.value;
                          handleInputChange('durum', val); 
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          if (val === Status.FAAL) {
                            handleInputChange('durumAyrintisi', '-');
                            if (selectedAircraft.durum === Status.GAYRI_FAAL && !formData.intraDayEndTime) {
                              handleInputChange('intraDayEndTime', timeStr);
                            }
                          } else if (val === Status.GAYRI_FAAL) {
                            if (!formData.intraDayStartTime) {
                              handleInputChange('intraDayStartTime', timeStr);
                            }
                          }
                        }} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`}>
                          <option value={Status.FAAL}>{Status.FAAL}</option>
                          <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                        </select>
                      </div>
                      {formData.durum === Status.GAYRI_FAAL && (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GAYRI FAAL BAŞLANGIÇ SAATİ</label>
                            <input disabled={isPastDate} type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUM AYRINTISI</label>
                            <input disabled={isPastDate} type="text" list="status-details" placeholder="YENİ AYRINTI" value={formData.durumAyrintisi} onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                            <datalist id="status-details">
                              <option value="BAKIM">BAKIM</option>
                              <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                              <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                              <option value="ARIZA">ARIZA</option>
                              <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                              <option value="KAZA KIRIM">KAZA KIRIM</option>
                              <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                              <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                            </datalist>
                          </div>
                        </>
                      )}
                      {formData.durum === Status.FAAL && selectedAircraft.durum === Status.GAYRI_FAAL && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FAAL OLDUĞU SAAT</label>
                          <input disabled={isPastDate} type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                        </div>
                      )}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                        <textarea disabled={isPastDate} rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none${disabledClass}`}></textarea>
                      </div>
                    </div>
                    {message && (
                      <div className={`p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {message.text}
                      </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl uppercase tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center">
                      {isSubmitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "GÜNCELLE"}
                    </button>
                  </form>
                ) : selectedAircraft.tip === 'AT-802' ? (
                  <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                    {at802Step === 1 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest mb-6">ADIM 1: TEKNİK VERİLER ({selectedAircraft.kuyrukNo} GENEL)</h3>
                        {isLoadingSpecific ? (
                          <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6 md:gap-8">
                            <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                              <h4 className="text-white font-black tracking-widest border-b border-white/10 pb-2">TEKNİK VERİLER</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AC TT</label>
                                  <input type="text" value={at802Data.acTT} onChange={e => setAt802Data({...at802Data, acTT: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">LANDINGS</label>
                                  <input type="text" value={at802Data.landings} onChange={e => setAt802Data({...at802Data, landings: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">ENGINE STARTS</label>
                                  <input type="text" value={at802Data.starts} onChange={e => setAt802Data({...at802Data, starts: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">ENGINE FLIGHTS</label>
                                  <input type="text" value={at802Data.flights} onChange={e => setAt802Data({...at802Data, flights: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                              <h4 className="text-white font-black tracking-widest border-b border-white/10 pb-2">TEST VE ÇALIŞMALAR</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FRDS TESTİ HAFTALIK YAPILDIĞI TARİH</label>
                                  <input disabled={isPastDate} type="date" value={at802Data.frdsTest} onChange={e => setAt802Data({...at802Data, frdsTest: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                  {at802Data.frdsTest && (
                                    <div className="mt-1 space-y-0.5">
                                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">BİR SONRAKİ TEST: {getNextDate(at802Data.frdsTest)}</div>
                                      <div className={`text-[10px] font-black uppercase tracking-widest ${getAT802ColorClass(getRemainingDays(at802Data.frdsTest))}`}>
                                        KALAN GÜN SAYISI: {getRemainingDays(at802Data.frdsTest)! < 0 ? `${Math.abs(getRemainingDays(at802Data.frdsTest)!)} GÜN GEÇTİ` : `${getRemainingDays(at802Data.frdsTest)} GÜN`}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">MOTOR ÇALIŞMASI YAPILDIĞI TARİH</label>
                                  <input disabled={isPastDate} type="date" value={at802Data.motorCalisma} onChange={e => setAt802Data({...at802Data, motorCalisma: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                  {at802Data.motorCalisma && (
                                    <div className="mt-1 space-y-0.5">
                                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">BİR SONRAKİ ÇALIŞMA: {getNextDate(at802Data.motorCalisma)}</div>
                                      <div className={`text-[10px] font-black uppercase tracking-widest ${getAT802ColorClass(getRemainingDays(at802Data.motorCalisma))}`}>
                                        KALAN GÜN SAYISI: {getRemainingDays(at802Data.motorCalisma)! < 0 ? `${Math.abs(getRemainingDays(at802Data.motorCalisma)!)} GÜN GEÇTİ` : `${getRemainingDays(at802Data.motorCalisma)} GÜN`}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-8 flex justify-end">
                          <button type="button" onClick={() => setAt802Step(2)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-2xl uppercase tracking-widest shadow-xl transition-all">İLERİ: GÜNLÜK DURUM</button>
                        </div>
                      </div>
                    )}
                    {at802Step === 2 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest mb-6">ADIM 2: GÜNLÜK DURUM</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                          <div className="space-y-4">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER GÖREV YERİ / KONUM</label>
                            <input disabled={isPastDate} type="text" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-4">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                            <select disabled={isPastDate} value={formData.durum} onChange={(e) => { 
                              const val = e.target.value;
                              handleInputChange('durum', val); 
                              const now = new Date();
                              const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                              if (val === Status.FAAL) {
                                handleInputChange('durumAyrintisi', '-');
                                if (selectedAircraft.durum === Status.GAYRI_FAAL && !formData.intraDayEndTime) {
                                  handleInputChange('intraDayEndTime', timeStr);
                                }
                              } else if (val === Status.GAYRI_FAAL) {
                                if (!formData.intraDayStartTime) {
                                  handleInputChange('intraDayStartTime', timeStr);
                                }
                              }
                            }} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all">
                              <option value={Status.FAAL}>{Status.FAAL}</option>
                              <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                            </select>
                          </div>
                          {formData.durum === Status.GAYRI_FAAL && (
                            <>
                              <div className="space-y-4 md:col-span-2">
                                <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GAYRI FAAL BAŞLANGIÇ SAATİ</label>
                                <input type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                              </div>
                              <div className="space-y-4 md:col-span-2">
                                <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">G.FAAL SEBEBİ / DURUM AYRINTISI</label>
                                <input disabled={isPastDate} type="text" list="status-details" value={formData.durumAyrintisi} onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                <datalist id="status-details">
                                  <option value="BAKIM">BAKIM</option>
                                  <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                                  <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                                  <option value="ARIZA">ARIZA</option>
                                  <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                                  <option value="KAZA KIRIM">KAZA KIRIM</option>
                                  <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                                  <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                                </datalist>
                              </div>
                            </>
                          )}
                          {formData.durum === Status.FAAL && selectedAircraft.durum === Status.GAYRI_FAAL && (
                            <div className="space-y-4 md:col-span-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FAAL OLDUĞU SAAT</label>
                              <input type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                            </div>
                          )}
                          <div className="space-y-4 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                            <textarea disabled={isPastDate} rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none${disabledClass}`}></textarea>
                          </div>
                        </div>
                        {message && (
                          <div className={`mt-8 p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {message.text}
                          </div>
                        )}
                        <div className="mt-8 flex space-x-4">
                          <button type="button" onClick={() => setAt802Step(1)} className="bg-white/10 hover:bg-white/20 text-white font-black py-4 px-8 rounded-2xl uppercase tracking-widest transition-all">GERİ</button>
                          <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-4 rounded-2xl uppercase tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center">
                            {isSubmitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : "GÜNCELLE"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-20 opacity-30">
                    <svg className="w-20 h-20 text-white mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <p className="text-white font-bold uppercase tracking-widest">Lütfen bir hava aracı seçiniz</p>
                  </div>
                )
              ) : (
                <div className="text-center py-20 opacity-30">
                  <svg className="w-20 h-20 text-white mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <p className="text-white font-bold uppercase tracking-widest">Lütfen bir hava aracı seçiniz</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataUpdateForm;