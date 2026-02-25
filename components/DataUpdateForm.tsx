
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Aircraft, Status } from '../types';
import { updateAircraftData, fetchAircraftSpecificData } from '../services/sheetService';

interface DataUpdateFormProps {
  fleet: Aircraft[];
  onBack: () => void;
  onSuccess: () => void;
}

const formatForDateInput = (val: string | undefined | null) => {
  if (!val || val === '-') return '';
  const cleanVal = val.trim();
  
  // Handle Excel serial numbers (e.g., 45356 for 2024-03-05)
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
  
  // Handle DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY with optional spaces
  const parts = cleanVal.split(/[\.\/\-\s]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 3) {
    // If first part is 4 digits, it's probably YYYY-MM-DD or YYYY.MM.DD
    if (parts[0].length === 4) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      // Assume DD.MM.YYYY
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      return `${year}-${month}-${day}`;
    }
  }
  return cleanVal;
};

const DataUpdateForm: React.FC<DataUpdateFormProps> = ({ fleet, onBack, onSuccess }) => {
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
    aciklama: ''
  });

  useEffect(() => {
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
        aciklama: aircraft.aciklama && aircraft.aciklama !== '-' ? aircraft.aciklama : ''
      });

      if (aircraft.tip === 'AT-802') {
        setAt802Step(1);
        setAt802Data({
          acTT: aircraft.acTT && aircraft.acTT !== '-' ? aircraft.acTT : '',
          landings: aircraft.landings && aircraft.landings !== '-' ? aircraft.landings : '',
          starts: aircraft.engineStarts && aircraft.engineStarts !== '-' ? aircraft.engineStarts : '',
          flights: aircraft.engineFlights && aircraft.engineFlights !== '-' ? aircraft.engineFlights : '',
          frdsTest: formatForDateInput(aircraft.frdsTestDate),
          motorCalisma: formatForDateInput(aircraft.motorRunDate)
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
          .catch(() => {
             // Fallback to already set data
          })
          .finally(() => setIsLoadingSpecific(false));
      }
    } else {
      setSelectedAircraft(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKuyruk]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAircraft) return;

    setIsSubmitting(true);
    setMessage(null);

    // Bell-429 için saat verilerini virgüllü formata çevir (E-Tablo uyumu için)
    let finalData = { ...formData, ...at802Data };
    if (isBell429) {
      if (finalData.govdeUcusSaati) {
        finalData.govdeUcusSaati = finalData.govdeUcusSaati.replace(':', ',').replace('.', ',');
      }
      if (finalData.bakim50H) {
        finalData.bakim50H = finalData.bakim50H.replace(':', ',').replace('.', ',');
      }
    }

    try {
      const result = await updateAircraftData(
        selectedAircraft.appsScriptUrl || '',
        selectedAircraft.sheetId || '',
        selectedAircraft.kuyrukNo,
        finalData,
        selectedAircraft.mapping
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Veriler başarıyla güncellendi.' });
        setTimeout(() => {
          onSuccess();
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
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic mb-8">VERİ GÜNCELLEME</h2>
          
          <div className="mb-8 md:mb-12">
            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em] mb-4">HAVA ARACI SEÇİMİ</label>
            <select 
              value={selectedKuyruk}
              onChange={(e) => setSelectedKuyruk(e.target.value)}
              className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-4 md:px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all appearance-none"
            >
              <option value="">Kuyruk Numarası Seçiniz...</option>
              {fleet.map(a => (
                <option key={a.kuyrukNo} value={a.kuyrukNo}>{a.kuyrukNo} ({a.tip})</option>
              ))}
            </select>
          </div>

          {selectedAircraft ? (
            isBell429 ? (
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                {/* Teknik Veriler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                    <input 
                      type="text"
                      placeholder="YENİ (00:00)"
                      value={formData.govdeUcusSaati}
                      onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM (50H)</label>
                    <input 
                      type="text"
                      placeholder="YENİ SAAT"
                      value={formData.bakim50H}
                      onChange={(e) => handleInputChange('bakim50H', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM (TARİH)</label>
                    <input 
                      type="date"
                      value={formData.bakimTakvim}
                      onChange={(e) => handleInputChange('bakimTakvim', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full"></div>

                {/* Durum Verileri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER GÖREV YERİ</label>
                    <input 
                      type="text"
                      placeholder="YENİ KONUM"
                      value={formData.konum}
                      onChange={(e) => handleInputChange('konum', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER DURUMU</label>
                    <select 
                      value={formData.durum}
                      onChange={(e) => {
                        handleInputChange('durum', e.target.value);
                        if (e.target.value === Status.FAAL) {
                          handleInputChange('durumAyrintisi', '-');
                        }
                      }}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value={Status.FAAL}>{Status.FAAL}</option>
                      <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                    </select>
                  </div>

                  {formData.durum === Status.GAYRI_FAAL && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUM AYRINTISI</label>
                      <input 
                        type="text"
                        list="status-details"
                        placeholder="YENİ AYRINTI (B, BB, KM, A, PB, KK, X...)"
                        value={formData.durumAyrintisi}
                        onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)}
                        className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                      />
                      <datalist id="status-details">
                        <option value="BAKIM">BAKIM</option>
                        <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                        <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                        <option value="ARIZA">ARIZA</option>
                        <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                        <option value="KAZA KIRIM">KAZA KIRIM</option>
                        <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                      </datalist>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                    <textarea 
                      rows={4}
                      value={formData.aciklama}
                      onChange={(e) => handleInputChange('aciklama', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {message && (
                  <div className={`p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl uppercase tracking-[0.2em] md:tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "GÜNCELLE"
                  )}
                </button>
              </form>
            ) : isT70 ? (
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                {/* Teknik Veriler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                    <input 
                      type="text"
                      placeholder="YENİ (00:00)"
                      value={formData.govdeUcusSaati}
                      onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">40 SAAT BAKIM</label>
                    <input 
                      type="text"
                      placeholder="YENİ SAAT"
                      value={formData.bakim40H}
                      onChange={(e) => handleInputChange('bakim40H', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">120 SAAT BAKIM</label>
                    <input 
                      type="text"
                      placeholder="YENİ SAAT"
                      value={formData.bakim120H}
                      onChange={(e) => handleInputChange('bakim120H', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">480 SAAT BAKIM</label>
                    <input 
                      type="text"
                      placeholder="YENİ SAAT"
                      value={formData.bakim480H}
                      onChange={(e) => handleInputChange('bakim480H', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM (TARİH)</label>
                    <input 
                      type="date"
                      value={formData.bakimTakvimTarih}
                      onChange={(e) => handleInputChange('bakimTakvimTarih', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full"></div>

                {/* Durum Verileri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">KONUM</label>
                    <input 
                      type="text"
                      placeholder="YENİ KONUM"
                      value={formData.konum}
                      onChange={(e) => handleInputChange('konum', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                    <select 
                      value={formData.durum}
                      onChange={(e) => {
                        handleInputChange('durum', e.target.value);
                        if (e.target.value === Status.FAAL) {
                          handleInputChange('durumAyrintisi', '-');
                        }
                      }}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value={Status.FAAL}>{Status.FAAL}</option>
                      <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                    </select>
                  </div>

                  {formData.durum === Status.GAYRI_FAAL && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUM AYRINTISI</label>
                      <input 
                        type="text"
                        list="status-details"
                        placeholder="YENİ AYRINTI"
                        value={formData.durumAyrintisi}
                        onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)}
                        className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                      />
                      <datalist id="status-details">
                        <option value="BAKIM">BAKIM</option>
                        <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                        <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                        <option value="ARIZA">ARIZA</option>
                        <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                        <option value="KAZA KIRIM">KAZA KIRIM</option>
                        <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                      </datalist>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                    <textarea 
                      rows={4}
                      value={formData.aciklama}
                      onChange={(e) => handleInputChange('aciklama', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {message && (
                  <div className={`p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl uppercase tracking-[0.2em] md:tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "GÜNCELLE"
                  )}
                </button>
              </form>
            ) : isB360OrC650 ? (
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                {/* Teknik Veriler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                    <input 
                      type="text"
                      placeholder="YENİ (00:00)"
                      value={formData.govdeUcusSaati}
                      onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">LANDING</label>
                    <input 
                      type="text"
                      placeholder="YENİ DEĞER"
                      value={formData.landings}
                      onChange={(e) => handleInputChange('landings', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM ZAMANI (200 SAAT)</label>
                    <input 
                      type="text"
                      placeholder="YENİ SAAT"
                      value={formData.bakim200H}
                      onChange={(e) => handleInputChange('bakim200H', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM TARİHİ</label>
                    <input 
                      type="date"
                      value={formData.bakimTakvimTarih}
                      onChange={(e) => handleInputChange('bakimTakvimTarih', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full"></div>

                {/* Durum Verileri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">KONUM</label>
                    <input 
                      type="text"
                      placeholder="YENİ KONUM"
                      value={formData.konum}
                      onChange={(e) => handleInputChange('konum', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                    <select 
                      value={formData.durum}
                      onChange={(e) => {
                        handleInputChange('durum', e.target.value);
                        if (e.target.value === Status.FAAL) {
                          handleInputChange('durumAyrintisi', '-');
                        }
                      }}
                      className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value={Status.FAAL}>{Status.FAAL}</option>
                      <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                    </select>
                  </div>

                  {formData.durum === Status.GAYRI_FAAL && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUM AYRINTISI</label>
                      <input 
                        type="text"
                        list="status-details"
                        placeholder="YENİ AYRINTI"
                        value={formData.durumAyrintisi}
                        onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)}
                        className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                      />
                      <datalist id="status-details">
                        <option value="BAKIM">BAKIM</option>
                        <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                        <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                        <option value="ARIZA">ARIZA</option>
                        <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                        <option value="KAZA KIRIM">KAZA KIRIM</option>
                        <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                      </datalist>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                    <textarea 
                      rows={4}
                      value={formData.aciklama}
                      onChange={(e) => handleInputChange('aciklama', e.target.value)}
                      className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {message && (
                  <div className={`p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl uppercase tracking-[0.2em] md:tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "GÜNCELLE"
                  )}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* AIRFRAME */}
                        <div className="space-y-6 md:col-span-2 bg-white/5 p-6 rounded-2xl border border-white/10">
                          <h4 className="text-white font-black tracking-widest border-b border-white/10 pb-2">AIRFRAME</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">Ac TT</label>
                              <input type="text" value={at802Data.acTT} onChange={e => setAt802Data({...at802Data, acTT: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">Landings</label>
                              <input type="text" value={at802Data.landings} onChange={e => setAt802Data({...at802Data, landings: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                            </div>
                          </div>
                        </div>
                        
                        {/* ENGINE */}
                        <div className="space-y-6 md:col-span-2 bg-white/5 p-6 rounded-2xl border border-white/10">
                          <h4 className="text-white font-black tracking-widest border-b border-white/10 pb-2">ENGINE</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">Starts</label>
                              <input type="text" value={at802Data.starts} onChange={e => setAt802Data({...at802Data, starts: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">Flights</label>
                              <input type="text" value={at802Data.flights} onChange={e => setAt802Data({...at802Data, flights: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                            </div>
                          </div>
                        </div>

                        {/* TESTS */}
                        <div className="space-y-6 md:col-span-2 bg-white/5 p-6 rounded-2xl border border-white/10">
                          <h4 className="text-white font-black tracking-widest border-b border-white/10 pb-2">TEST VE ÇALIŞMALAR</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FRDS TESTİ HAFTALIK YAPILDIĞI TARİH</label>
                              <input type="date" value={at802Data.frdsTest} onChange={e => setAt802Data({...at802Data, frdsTest: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">MOTOR ÇALIŞMASI YAPILDIĞI TARİH</label>
                              <input type="date" value={at802Data.motorCalisma} onChange={e => setAt802Data({...at802Data, motorCalisma: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 flex justify-end">
                      <button type="button" onClick={() => setAt802Step(2)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-2xl uppercase tracking-widest shadow-xl transition-all">
                        İLERİ: GÜNLÜK DURUM
                      </button>
                    </div>
                  </div>
                )}

                {at802Step === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest mb-6">ADIM 2: GÜNLÜK DURUM</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-4">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER GÖREV YERİ / KONUM</label>
                        <input 
                          type="text"
                          value={formData.konum}
                          onChange={(e) => handleInputChange('konum', e.target.value)}
                          className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                        <select 
                          value={formData.durum}
                          onChange={(e) => {
                            handleInputChange('durum', e.target.value);
                            if (e.target.value === Status.FAAL) {
                              handleInputChange('durumAyrintisi', '-');
                            }
                          }}
                          className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                        >
                          <option value={Status.FAAL}>{Status.FAAL}</option>
                          <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                        </select>
                      </div>

                      {formData.durum === Status.GAYRI_FAAL && (
                        <div className="space-y-4 md:col-span-2">
                          <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">G.FAAL SEBEBİ / DURUM AYRINTISI</label>
                          <input 
                            type="text"
                            list="status-details"
                            value={formData.durumAyrintisi}
                            onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)}
                            className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                          />
                          <datalist id="status-details">
                            <option value="BAKIM">BAKIM</option>
                            <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                            <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                            <option value="ARIZA">ARIZA</option>
                            <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                            <option value="KAZA KIRIM">KAZA KIRIM</option>
                            <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                          </datalist>
                        </div>
                      )}

                      <div className="space-y-4 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                        <textarea 
                          rows={4}
                          value={formData.aciklama}
                          onChange={(e) => handleInputChange('aciklama', e.target.value)}
                          className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>

                    {message && (
                      <div className={`mt-8 p-4 md:p-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {message.text}
                      </div>
                    )}

                    <div className="mt-8 flex space-x-4">
                      <button type="button" onClick={() => setAt802Step(1)} className="bg-white/10 hover:bg-white/20 text-white font-black py-4 px-8 rounded-2xl uppercase tracking-widest transition-all">
                        GERİ
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] md:tracking-[0.5em] shadow-2xl transition-all flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "GÜNCELLE"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-20">
                <div className="bg-yellow-500/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-2">TASARIM AŞAMASINDA</h3>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Bu hava aracı tipi için güncelleme formu henüz aktif değildir.</p>
              </div>
            )
          ) : (
            <div className="text-center py-20 opacity-30">
              <svg className="w-20 h-20 text-white mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-white font-bold uppercase tracking-widest">Lütfen bir hava aracı seçiniz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataUpdateForm;
