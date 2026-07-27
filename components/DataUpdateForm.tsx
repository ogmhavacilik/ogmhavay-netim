
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Aircraft, Status, DailyStatusCode } from '../types';
import { updateAircraftData, fetchAircraftSpecificData, analyzeStatus, updatePastEnvanterLog, formatGovdeHour, parseSingleCellToHour, proxyFetch } from '../services/sheetService';
import { LOG_SCRIPT_URL, MAIL_LOG_SHEET_ID } from '../constants';
import { safeStorage } from '../services/safeStorage';
import { cleanDescription } from '../services/cleanUtils';

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
  onTriggerSync?: () => Promise<void>;
  onUpdateLocalState?: (
    kuyrukNo: string,
    islemTarihi: string,
    updates: {
      govdeUcusSaati?: string;
      faydaliSaat?: string;
      konum?: string;
      durum?: string;
      durumAyrintisi?: string;
      aciklama?: string;
      assignedCode?: string;
      bakim50H?: string;
      bakimTakvim?: string;
      bakim40H?: string;
      bakim120H?: string;
      bakim480H?: string;
      bakimTakvimTarih?: string;
      bakim200H?: string;
    },
    isPastDate: boolean
  ) => void;
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

const formatDateForSheet = (val: string | undefined | null) => {
  if (!val || !val.includes('-')) return val || '';
  const parts = val.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return val;
};

const formatT70DateForSheet = (val: string | undefined | null) => {
  if (!val) return '';
  const s = val.trim();
  // Convert any format (. or / or -) to -
  const clean = s.replace(/[\.\/]/g, '-');
  const parts = clean.split('-');
  
  if (parts.length === 3) {
    let day, month, year;
    
    if (parts[0].length === 4) { // YYYY-MM-DD
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else { // DD-MM-YY or DD-MM-YYYY
      day = parts[0];
      month = parts[1];
      year = parts[2];
    }
    
    const dayStr = day.padStart(2, '0');
    const monthStr = month.padStart(2, '0');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${dayStr}.${monthStr}.${fullYear}`;
  }
  return clean;
};

const formatT70DateForDisplay = (val: string | undefined | null) => {
  if (!val || val === '-') return '';
  const s = val.trim();
  
  // If it's already in DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;

  // If it's DD-MM-YY or DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{2,4}$/.test(s)) {
    const parts = s.split('-');
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${parts[0]}.${parts[1]}.${year}`;
  }

  // If it's YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const parts = s.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  // If it's DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split('/');
    return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2].slice(-2)}`;
  }
  
  return s;
};

const DataUpdateForm: React.FC<DataUpdateFormProps> = ({ fleet, envanterLog, onBack, onSuccess, onSaveIntraDay, onTriggerSync, onUpdateLocalState }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedKuyruk, setSelectedKuyruk] = useState('');
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdateCompleted, setIsUpdateCompleted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

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
    islemTarihi: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setPassword('');
    setAuthError('');
    setIsAuth(false);
    setSelectedKuyruk('');
    setSelectedAircraft(null);
    setValidationErrors({});
    setIsUpdateCompleted(false);
    initializationRef.current = '';
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

  useEffect(() => {
    const aircraft = fleet.find(a => a.kuyrukNo === selectedKuyruk);
    setSelectedAircraft(aircraft || null);
  }, [selectedKuyruk, fleet]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      // Local storage persistence
      if (selectedKuyruk) {
        const storageKey = `draft_${selectedKuyruk}_${newState.islemTarihi}`;
        safeStorage.setItem(storageKey, JSON.stringify({ formData: newState, at802Data }));
      }
      return newState;
    });
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleAt802InputChange = (field: string, value: string) => {
    setAt802Data(prev => {
      const newState = { ...prev, [field]: value };
      if (selectedKuyruk) {
        const storageKey = `draft_${selectedKuyruk}_${formData.islemTarihi}`;
        safeStorage.setItem(storageKey, JSON.stringify({ formData, at802Data: newState }));
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAircraft) return;

    // validation for mandatory start times
    const newErrors: Record<string, boolean> = {};
    const isCurrentGayriFaal = selectedAircraft.durum === Status.GAYRI_FAAL;
    const isCurrentFaal = !isCurrentGayriFaal;
    const isNewGayriFaal = formData.durum === Status.GAYRI_FAAL;
    const isNewFaal = formData.durum === Status.FAAL || formData.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ;

    if (isCurrentFaal && isNewGayriFaal && !formData.intraDayStartTime) {
      newErrors.intraDayStartTime = true;
    }
    if (isCurrentGayriFaal && isNewFaal && !formData.intraDayEndTime) {
      newErrors.intraDayEndTime = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      let errText = 'Hata: Faal/Gayri Faal başlangıç saatleri zorunlu veridir, lütfen giriniz!';
      if (newErrors.intraDayStartTime) {
        errText = "HATA: Faal durumdan Gayri Faal duruma geçerken 'GAYRI FAAL BAŞLANGIÇ SAATİ' girilmesi zorunludur!";
      } else if (newErrors.intraDayEndTime) {
        errText = "HATA: Gayri Faal durumdan Faal duruma geçerken 'FAAL BAŞLANGIÇ SAATİ' girilmesi zorunludur!";
      }
      setMessage({ type: 'error', text: errText });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isPastDate = formData.islemTarihi < today;

    // Validation checks for flight hours (previous and subsequent limits) have been removed per user request to allow retroactive updates and corrections of past day flight hours freely.

    setIsSubmitting(true);
    setMessage(null);

    // 0. TAIL AND DATE CHECK (Mükerrer Kayıt Engeli)
    const searchDateStr = formData.islemTarihi;
    const searchKNoClean = (selectedAircraft.kuyrukNo || "").trim().toUpperCase();
    
    // Check if entry already exists in logs (Envanter Log)
    const existingLog = envanterLog?.find(log => {
      const logK = String(log.kuyrukNo || "").trim().toUpperCase();
      let logT = String(log.tarih || "").trim();
      // Normalize logT if it's dd.MM.yyyy
      if (logT.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        const p = logT.split('.');
        logT = `${p[2]}-${p[1]}-${p[0]}`;
      }
      return logK === searchKNoClean && logT === searchDateStr;
    });

    if (existingLog && !isPastDate) {
      const confirmUpdate = window.confirm('Mevcut kaydı güncellemek istediğinize emin misiniz?');
      if (!confirmUpdate) {
        setIsSubmitting(false);
        return;
      }
    }

    // 1. CONFLICT PREVENTION (Durum Çakışması Engeli)
    // Bir hava aracı aynı gün hem Faal hem Bakım olamaz.
    const durum = (formData.durum || '').toLocaleUpperCase('tr-TR');
    const ayrinti = (formData.durumAyrintisi || '').toLocaleUpperCase('tr-TR');
    const desc = (formData.aciklama || '').toLocaleUpperCase('tr-TR');
    
    const isMaintenance = ayrinti.includes('BAKIM') || ayrinti.includes('KABUL MUAYENE') || ayrinti === 'B' || ayrinti === 'KM' || ayrinti === 'BB';
    const isActuallyFaal = durum === 'FAAL';

    if (isActuallyFaal && isMaintenance) {
      setMessage({ 
        type: 'error', 
        text: 'HATA: Bir hava aracı aynı gün hem "FAAL" hem de "BAKIM" durumunda olamaz! Lütfen durum veya durumu detaylandıran ayrıntı bilgisini kontrol edin.' 
      });
      setIsSubmitting(false);
      return;
    }

    let finalData: Record<string, any>;
    
    if (selectedAircraft.tip === 'AT-802') {
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
        aciklama: cleanDescription(formData.aciklama),
        intraDayStartTime: formData.intraDayStartTime,
        intraDayEndTime: formData.intraDayEndTime,
        islemTarihi: formData.islemTarihi
      };

      if (isPastDate) {
        // Geçmiş tarihli seçildiğinde tüm hava araçlarında gövde saati sadece değiştirebilirler
        finalData = { acTT: at802Data.acTT, islemTarihi: formData.islemTarihi };
      } else {
        // Boş alanları temizle (Sadece güncel tarih için)
        Object.keys(finalData).forEach(key => {
          // Açıklama alanı boş olsa bile gönderilmelidir ki silinebilsin
          if (key !== 'aciklama' && (finalData[key] === '' || finalData[key] === null || finalData[key] === undefined)) {
            delete finalData[key];
          }
        });
      }
    } else {
      if (isPastDate) {
        // Geçmiş tarihli seçildiğinde tüm hava araçlarında gövde saati sadece değiştirebilirler
        finalData = { govdeUcusSaati: formData.govdeUcusSaati, islemTarihi: formData.islemTarihi };
        
        const decimalTypes = ['Bell-429', 'B-360', 'C-650'];
        if (decimalTypes.includes(selectedAircraft.tip) && finalData.govdeUcusSaati) {
          const parsedHours = parseSingleCellToHour(finalData.govdeUcusSaati, selectedAircraft.tip);
          if (parsedHours !== null) {
            finalData.govdeUcusSaati = parsedHours;
          }
        }
      } else {
        finalData = { ...formData, aciklama: cleanDescription(formData.aciklama) };
        
        // Tarih Formatlama (DD.MM.YYYY veya T-70 için GG-AA-YY)
        if (finalData.bakimTakvimTarih) {
          if (selectedAircraft.tip === 'T-70') {
            finalData.bakimTakvimTarih = formatT70DateForSheet(finalData.bakimTakvimTarih);
          } else {
            finalData.bakimTakvimTarih = formatDateForSheet(finalData.bakimTakvimTarih);
          }
        }
        if (finalData.bakimTakvim) {
          if (selectedAircraft.tip === 'T-70') {
            finalData.bakimTakvim = formatT70DateForSheet(finalData.bakimTakvim);
          } else {
            finalData.bakimTakvim = formatDateForSheet(finalData.bakimTakvim);
          }
        }

        // B-360 ve C-650 için boş verilerin gönderilmesini engelle
        const decimalTypes = ['Bell-429', 'B-360', 'C-650'];
        if (decimalTypes.includes(selectedAircraft.tip)) {
          Object.keys(finalData).forEach(key => {
            // Açıklama alanı boş olsa bile gönderilmelidir ki silinebilsin
            if (key !== 'aciklama' && (finalData[key] === '' || finalData[key] === null || finalData[key] === undefined)) {
              delete finalData[key];
            }
          });
          
          if (finalData.govdeUcusSaati) {
            const parsedHours = parseSingleCellToHour(finalData.govdeUcusSaati, selectedAircraft.tip);
            if (parsedHours !== null) {
              // Send as number to prevent rounding issues during parsing on the server (Apps Script)
              finalData.govdeUcusSaati = parsedHours;
            }
          }
          
          if (finalData.faydaliSaat) {
            const parsedFaydali = parseSingleCellToHour(finalData.faydaliSaat, selectedAircraft.tip);
            if (parsedFaydali !== null) {
              finalData.faydaliSaat = parsedFaydali;
            }
          }
          
          // Bell-429 specific other decimal fields
          if (selectedAircraft.tip === 'Bell-429') {
            const maintenanceFields = ['bakim50H', 'bakim100H', 'bakim200H', 'bakim400H', 'bakim800H'];
            maintenanceFields.forEach(field => {
              if (finalData[field]) {
                const parsed = parseSingleCellToHour(finalData[field], selectedAircraft.tip);
                if (parsed !== null) {
                  finalData[field] = parsed;
                }
              }
            });
          }
        }
      }
    }

    try {
      // 1. GÜN İÇİ FAALİYET KAYDI (Hem güncel hem geçmiş tarih için geçerli)
      if (onSaveIntraDay && (formData.intraDayStartTime || formData.intraDayEndTime)) {
        const statusToAnalyze = { 
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
          description: cleanDescription(formData.aciklama),
          date: formData.islemTarihi
        });

        if (!intraDaySaved) {
          setMessage({ type: 'error', text: 'Gün içi faaliyet kaydı başarısız oldu.' });
          setIsSubmitting(false);
          return;
        }
      }

      // Date formatting for Google Sheets Apps Script (dd.MM.yyyy)
      const dateParts = formData.islemTarihi.split('-');
      const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

      // 2. ANA DOSYA GÜNCELLEME (HER ZAMAN)
      // Kullanıcı isteği: İşlem tarihi ne olursa olsun ilgili hava aracının dosyasında güncelleme yapılır.
      const statusToAnalyze = {
        durum: formData.durum,
        durumAyrintisi: formData.durumAyrintisi,
        aciklama: formData.aciklama
      };
      const analysis = analyzeStatus(statusToAnalyze);

      let mainUpdateResult = { success: true, message: '' };
      if (!isPastDate) {
        const uRes = await updateAircraftData(
          selectedAircraft.appsScriptUrl || '',
          selectedAircraft.sheetId || '',
          selectedAircraft.kuyrukNo,
          { 
            ...finalData, 
            assignedCode: analysis.code // Send assignedCode to prevent auto-reanalysis on server
          },
          selectedAircraft.mapping,
          selectedAircraft.sheetName,
          selectedAircraft.tip
        );
        mainUpdateResult = { success: uRes.success, message: uRes.message };
      }

      if (!mainUpdateResult.success) {
        setMessage({ type: 'error', text: mainUpdateResult.message || 'Hava aracı dosyası güncellenirken hata oluştu.' });
        setIsSubmitting(false);
        return;
      }

      // 3. LOG GÜNCELLEME (TARİHE GÖRE DEĞİŞİR)
      if (isPastDate) {
        // GEÇMİŞ TARİH: Envanter Log'da ilgili tarih bulunur ve veriler güncellenir.
        const pastHours = finalData.govdeUcusSaati || finalData.acTT || '';
        const pastLogResult = await updatePastEnvanterLog(
          LOG_SCRIPT_URL,
          MAIL_LOG_SHEET_ID,
          selectedAircraft.kuyrukNo,
          formattedDate,
          pastHours,
          selectedAircraft.tip,
          formData.konum,
          formData.durum,
          formData.durumAyrintisi,
          formData.aciklama
        );

          if (pastLogResult.success) {
            setMessage({ type: 'success', text: 'Geçmiş gün verisi merkezi envanter logunda başarıyla düzeltildi.' });
            if (onUpdateLocalState) {
              onUpdateLocalState(
                selectedAircraft.kuyrukNo,
                formData.islemTarihi,
                {
                  govdeUcusSaati: pastHours,
                  faydaliSaat: formData.faydaliSaat,
                  konum: formData.konum,
                  durum: formData.durum,
                  durumAyrintisi: formData.durumAyrintisi,
                  aciklama: formData.aciklama
                },
                true
              );
            }
          } else {
            setMessage({ type: 'warning', text: 'Geçmiş gün verisi güncellenemedi: ' + pastLogResult.message });
          }
      } else {
        // GÜNCEL TARİH (BUGÜN): Mevcut merkezi loglama tetiklenir
        try {
          // --- USER REQUEST: Read the freshly updated values from the individual aircraft sheet first ---
          let updatedAcGovdeSaat = finalData.govdeUcusSaati || finalData.acTT || selectedAircraft.govdeUcusSaati || 0;
          let updatedAcFaydaliSaat = finalData.faydaliSaat || selectedAircraft.faydaliSaat || 0;

          try {
            const fetchedResult = await proxyFetch(selectedAircraft.appsScriptUrl || '', {
              sheetId: selectedAircraft.sheetId,
              sheetName: selectedAircraft.sheetName || '',
              mapping: selectedAircraft.mapping,
              action: 'getAircraftData',
              fetchTechnicalDetails: selectedAircraft.tip === 'AT-802'
            });

            if (fetchedResult && fetchedResult.success && Array.isArray(fetchedResult.data)) {
              const targetAc = fetchedResult.data.find((a: any) => 
                String(a.kuyrukNo || "").trim().toUpperCase() === String(selectedAircraft.kuyrukNo).trim().toUpperCase()
              );
              if (targetAc) {
                // Prevent Google Sheets replication lag/reversion:
                // Only overwrite our local updated hours if the fetched spreadsheet hours are strictly greater than or equal to our local hours.
                let fetchedGovdeVal = selectedAircraft.tip === 'AT-802' ? (targetAc.acTT || targetAc.govdeUcusSaati) : targetAc.govdeUcusSaati;
                
                if (fetchedGovdeVal) {
                  const fetchedGovdeRaw = parseSingleCellToHour(fetchedGovdeVal, selectedAircraft.tip);
                  const localGovdeRaw = parseSingleCellToHour(updatedAcGovdeSaat, selectedAircraft.tip);
                  
                  if (fetchedGovdeRaw !== null && localGovdeRaw !== null) {
                    if (fetchedGovdeRaw >= localGovdeRaw) {
                      updatedAcGovdeSaat = fetchedGovdeVal;
                    } else {
                      console.warn(`[LAG DETECTION] Ignored lagging/smaller flight hours (${fetchedGovdeRaw}) from fetched spreadsheet. Kept fresh input/form values (${localGovdeRaw}).`);
                    }
                  } else {
                    updatedAcGovdeSaat = fetchedGovdeVal;
                  }
                }

                updatedAcFaydaliSaat = targetAc.faydaliSaat !== undefined && targetAc.faydaliSaat !== null ? targetAc.faydaliSaat : updatedAcFaydaliSaat;
                console.log("Newly read aircraft values from Excel (with lag protection):", { updatedAcGovdeSaat, updatedAcFaydaliSaat });
              }
            }
          } catch (readError) {
             console.warn("Could not read freshly updated Excel data, falling back to local form values:", readError);
          }

          // Log flight hours with decimal support for specific types
          const getFormattedHourForLog = (val: any) => {
            if (!val && val !== 0 && val !== '0') return null;
            const decimalTypes = ['Bell-429', 'B-360', 'C-650'];
            if (decimalTypes.includes(selectedAircraft.tip)) {
              const parsed = parseSingleCellToHour(val, selectedAircraft.tip);
              // Send as number for decimal types to prevent string parsing issues on sever
              return parsed !== null ? parsed : val;
            }
            // For T-70 and AT-802, use HH:mm format in the log
            const parsed = parseSingleCellToHour(val, selectedAircraft.tip);
            if (parsed !== null) {
              const h = Math.floor(Math.abs(parsed));
              const m = Math.round((Math.abs(parsed) - h) * 60);
              return `${parsed < 0 ? '-' : ''}${h}:${m.toString().padStart(2, '0')}`;
            }
            return val;
          };

          const logGovdeSaat = getFormattedHourForLog(updatedAcGovdeSaat);
          const logFaydaliSaat = getFormattedHourForLog(updatedAcFaydaliSaat);

          await proxyFetch(LOG_SCRIPT_URL, {
            action: 'logSingleAircraftActivity',
            data: {
              date: formattedDate,
              kuyrukNo: selectedAircraft.kuyrukNo,
              tip: selectedAircraft.tip,
              govdeUcusSaati: logGovdeSaat,
              faydaliSaat: logFaydaliSaat,
              konum: formData.konum,
              durum: formData.durum,
              durumAyrintisi: formData.durumAyrintisi,
              aciklama: formData.aciklama,
              analizKodu: analysis.code
            }
          });
          setMessage({ type: 'success', text: 'Veriler ve merkezi log başarıyla güncellendi.' });
        } catch (logError) {
          console.error("Merkezi log güncellenirken hata oluştu:", logError);
          setMessage({ type: 'warning', text: 'Hava aracı dosyası güncellendi ancak merkezi log yapılamadı.' });
        }
        
        if (onUpdateLocalState) {
          onUpdateLocalState(
            selectedAircraft.kuyrukNo,
            formData.islemTarihi,
            {
              govdeUcusSaati: finalData.govdeUcusSaati || finalData.acTT || selectedAircraft.govdeUcusSaati || '',
              faydaliSaat: formData.faydaliSaat,
              konum: formData.konum,
              durum: formData.durum,
              durumAyrintisi: formData.durumAyrintisi,
              aciklama: formData.aciklama,
              assignedCode: analysis.code,
              bakim50H: formData.bakim50H,
              bakimTakvim: formData.bakimTakvim,
              bakim40H: formData.bakim40H,
              bakim120H: formData.bakim120H,
              bakim480H: formData.bakim480H,
              bakimTakvimTarih: formData.bakimTakvimTarih,
              bakim200H: formData.bakim200H
            },
            false
          );
        }
      }

      // Clear draft on success
      safeStorage.removeItem(`draft_${selectedAircraft.kuyrukNo}_${formData.islemTarihi}`);
      setIsUpdateCompleted(true);

    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBell429 = selectedAircraft?.tip === 'Bell-429';
  const isT70 = selectedAircraft?.tip === 'T-70';
  const isB360OrC650 = selectedAircraft?.tip === 'B-360' || selectedAircraft?.tip === 'C-650';

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  const isPastDate = formData.islemTarihi !== todayStr && formData.islemTarihi < todayStr;
  const disabledClass = isPastDate ? " opacity-50 cursor-not-allowed" : "";

  const initializationRef = React.useRef<string>('');

  useEffect(() => {
    if (!selectedKuyruk) {
      initializationRef.current = '';
      return;
    }
    if (!selectedAircraft || selectedAircraft.kuyrukNo !== selectedKuyruk) return;
    
    // Create a unique key for the current selection: Kuyruk No + Selected Date
    const currentInitKey = `${selectedKuyruk}_${formData.islemTarihi}`;
    
    // If we already initialized for this specific aircraft and date, do NOT reset the form
    if (initializationRef.current === currentInitKey) return;
    
    if (isPastDate) {
        if (!envanterLog || envanterLog.length === 0) return;
        
        // Use the same normalization logic as App.tsx to ensure match
        const searchDate = formData.islemTarihi; // yyyy-MM-dd
        const searchKuyruk = (selectedKuyruk || "").trim().toUpperCase();
        
        // Öncelikle seçili tarihteki kaydı bul
        let logEntry = envanterLog.find(log => {
          const logKuyruk = String(log.kuyrukNo || "").trim().toUpperCase();
          const logTarih = String(log.tarih || "").trim();
          return logKuyruk === searchKuyruk && logTarih === searchDate;
        });

        // Eğer o tarihte kayıt yoksa, O TARİHTEN ÖNCEKİ en güncel kaydı bul
        if (!logEntry) {
          const pastLogs = envanterLog
            .filter(log => {
               const logKuyruk = String(log.kuyrukNo || "").trim().toUpperCase();
               const logTarih = String(log.tarih || "").trim();
               return logKuyruk === searchKuyruk && logTarih < searchDate;
            })
            .sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
          
          if (pastLogs.length > 0) {
            logEntry = pastLogs[0];
          }
        }
        
        // Populate form using logEntry if found, otherwise use selectedAircraft as fallback
        const hours = logEntry?.govdeUcusSaati 
          ? formatGovdeHour(logEntry.govdeUcusSaati, selectedAircraft.tip) 
          : (selectedAircraft.govdeUcusSaati ? formatGovdeHour(selectedAircraft.govdeUcusSaati, selectedAircraft.tip) : '');

        setFormData(prev => ({
          ...prev,
          govdeUcusSaati: hours,
          faydaliSaat: logEntry?.faydaliSaat ? String(logEntry.faydaliSaat).replace('.', ',') : '',
          konum: logEntry?.konum || '',
          durum: logEntry?.durum || '',
          durumAyrintisi: logEntry?.durumAyrintisi || '',
          aciklama: logEntry?.aciklama || ''
        }));
        
        initializationRef.current = currentInitKey;

        if (selectedAircraft.tip === 'AT-802') {
          setAt802Step(1);
          setAt802Data({
            acTT: hours,
            landings: logEntry?.landings || selectedAircraft.landings || '',
            starts: '',
            flights: '',
            frdsTest: formatForDateInput(selectedAircraft.frdsTestDate),
            motorCalisma: formatForDateInput(selectedAircraft.motorRunDate),
          });
        }
      } else {
        // Bugün veya gelecek tarih ise mevcut uçak verilerini getir
        const hours = selectedAircraft.govdeUcusSaati ? formatGovdeHour(selectedAircraft.govdeUcusSaati, selectedAircraft.tip) : '';
        setFormData(prev => ({
          ...prev,
          govdeUcusSaati: hours,
          bakim50H: selectedAircraft.bakim50H ? String(selectedAircraft.bakim50H).replace('.', ',') : '',
          bakimTakvim: formatForDateInput(selectedAircraft.bakimTakvim),
          bakim40H: selectedAircraft.bakim40H ? String(selectedAircraft.bakim40H).replace('.', ',') : '',
          bakim120H: selectedAircraft.bakim120H ? String(selectedAircraft.bakim120H).replace('.', ',') : '',
          bakim480H: selectedAircraft.bakim480H ? String(selectedAircraft.bakim480H).replace('.', ',') : '',
          bakimTakvimTarih: selectedAircraft.tip === 'T-70' ? formatT70DateForDisplay(selectedAircraft.bakimTakvimTarih) : formatForDateInput(selectedAircraft.bakimTakvimTarih),
          faydaliSaat: selectedAircraft.faydaliSaat ? String(selectedAircraft.faydaliSaat).replace('.', ',') : '',
          bakim200H: selectedAircraft.bakim200H ? String(selectedAircraft.bakim200H).replace('.', ',') : '',
          landings: selectedAircraft.landings || '',
          konum: selectedAircraft.konum || '',
          durum: selectedAircraft.durum || '',
          durumAyrintisi: selectedAircraft.durumAyrintisi || '',
          aciklama: selectedAircraft.aciklama || '',
          intraDayStartTime: selectedAircraft.durumBaslangic && selectedAircraft.durumBaslangic !== '-' ? selectedAircraft.durumBaslangic : '',
          intraDayEndTime: selectedAircraft.durumBitis && selectedAircraft.durumBitis !== '-' ? selectedAircraft.durumBitis : '',
        }));

        initializationRef.current = currentInitKey;

        if (selectedAircraft.tip === 'AT-802') {
          setAt802Step(1);
          setAt802Data({
            acTT: hours,
            landings: selectedAircraft.landings || '',
            starts: selectedAircraft.engineStarts || '',
            flights: selectedAircraft.engineFlights || '',
            frdsTest: formatForDateInput(selectedAircraft.frdsTestDate),
            motorCalisma: formatForDateInput(selectedAircraft.motorRunDate),
          });

          // Fetch the real-time tech log details asynchronously
          setIsLoadingSpecific(true);
          fetchAircraftSpecificData(selectedAircraft.appsScriptUrl || '', selectedAircraft.sheetId || '', selectedAircraft.kuyrukNo)
            .then(res => {
              if (res.success && res.data) {
                setAt802Data(prev => ({
                  ...prev,
                  acTT: res.data.acTT || selectedAircraft.acTT || prev.acTT || '',
                  landings: res.data.landings || selectedAircraft.landings || prev.landings || '',
                  starts: res.data.starts || selectedAircraft.engineStarts || prev.starts || '',
                  flights: res.data.flights || selectedAircraft.engineFlights || prev.flights || '',
                  frdsTest: formatForDateInput(res.data.frdsTest || selectedAircraft.frdsTestDate),
                  motorCalisma: formatForDateInput(res.data.motorCalisma || selectedAircraft.motorRunDate)
                }));
              }
            })
            .catch(() => {})
            .finally(() => setIsLoadingSpecific(false));
        }
      }
  }, [formData.islemTarihi, selectedKuyruk, envanterLog, isPastDate, selectedType, selectedAircraft]);

  // Trigger a fresh live fetch of flight hours and log data from Apps Script when tail or date changes
  useEffect(() => {
    if (selectedKuyruk && onTriggerSync) {
      setIsRefreshing(true);
      onTriggerSync().finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [selectedKuyruk, formData.islemTarihi, onTriggerSync]);

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">HAVA ARACI GÜNLÜK DURUM GÜNCELLE</h2>
            <div className="flex items-center space-x-2 bg-black/40 border border-white/10 px-4 py-2 rounded-2xl shrink-0">
              {isRefreshing ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">CANLI BAĞLANTI...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">BAĞLANTI AKTİF</span>
                </>
              )}
            </div>
          </div>
          
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
                    onChange={(e) => {
                      handleInputChange('islemTarihi', e.target.value);
                      initializationRef.current = '';
                    }}
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
                      onChange={(e) => {
                        setSelectedKuyruk(e.target.value);
                        initializationRef.current = '';
                      }}
                      className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-4 md:px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all appearance-none"
                    >
                    <option value="">Kuyruk Numarası Seçiniz...</option>
                    {filteredFleet.map(a => (
                      <option key={a.kuyrukNo} value={a.kuyrukNo}>{a.kuyrukNo} ({a.cagriKodu})</option>
                    ))}
                  </select>
                </div>
              </div>

              {isUpdateCompleted ? (
                <div className="bg-white/5 border border-emerald-500/30 p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500 my-10 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-500 shadow-xl mb-2">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-emerald-400 uppercase tracking-tighter italic">GÜNCELLEME TAMAMLANDI</h3>
                    <p className="text-white/80 font-bold max-w-md mx-auto text-sm leading-relaxed">
                      {selectedAircraft?.kuyrukNo} kuyruk numaralı hava aracına ait veriler ve merkezi uçuş log kayıtları başarıyla güncellendi.
                    </p>
                  </div>

                  <div className="w-full max-w-md flex flex-col gap-4 pt-4">
                    <button
                      onClick={() => selectedAircraft && onSuccess(selectedAircraft.tip)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black py-5 px-6 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-all text-xs"
                    >
                      Ana Sayfaya Dön
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsUpdateCompleted(false);
                        setSelectedKuyruk('');
                        setSelectedAircraft(null);
                        setMessage(null);
                        setAt802Step(1);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 active:scale-[0.98] text-emerald-400 border border-emerald-500/20 font-black py-5 px-6 rounded-2xl uppercase tracking-[0.2em] transition-all text-xs"
                    >
                      Başka Hava Aracı Güncelle
                    </button>
                  </div>
                </div>
              ) : selectedAircraft ? (
                isBell429 ? (
                  <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                        <input type="text" placeholder="YENİ (00:00)" value={formData.govdeUcusSaati} onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM (50H)</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ SAAT" value={formData.bakim50H} onChange={(e) => handleInputChange('bakim50H', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className={`space-y-2 md:col-span-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM (TARİH)</label>
                        <input disabled={isPastDate} type="date" value={formData.bakimTakvim} onChange={(e) => handleInputChange('bakimTakvim', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER GÖREV YERİ</label>
                        <input type="text" placeholder="YENİ KONUM" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">HELİKOPTER DURUMU</label>
                        <select value={formData.durum} onChange={(e) => { 
                          const val = e.target.value;
                          handleInputChange('durum', val); 
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          if (val === Status.FAAL || val === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) {
                            if (val === Status.FAAL) {
                              handleInputChange('durumAyrintisi', '-');
                            }
                            if (!formData.intraDayEndTime) {
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
                          <option value={Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}>{Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}</option>
                        </select>
                      </div>
                      {formData.durum === Status.GAYRI_FAAL && (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GAYRI FAAL BAŞLANGIÇ SAATİ</label>
                            <input type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayStartTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">G.FAAL SEBEBİ / DURUM AYRINTISI</label>
                            <select value={formData.durumAyrintisi} onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all">
                              <option value="-">- (Seçiniz)</option>
                              <option value="BAKIM">BAKIM</option>
                              <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                              <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                              <option value="ARIZA">ARIZA</option>
                              <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                              <option value="KAZA KIRIM">KAZA KIRIM</option>
                              <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                              <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                              <option value="TEKNİK BÜLTEN UYGULAMASI">TEKNİK BÜLTEN UYGULAMASI</option>
                              <option value="KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)">KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)</option>
                            </select>
                          </div>
                        </>
                      )}
                      {(formData.durum === Status.FAAL || formData.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FAAL BAŞLANGIÇ SAATİ</label>
                          <input type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayEndTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                        </div>
                      )}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                        <textarea rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GÖVDE UÇUŞ SAATİ</label>
                        <input type="text" placeholder="YENİ (00:00)" value={formData.govdeUcusSaati} onChange={(e) => handleInputChange('govdeUcusSaati', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM (40 SAAT)</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ SAAT" value={formData.bakim40H} onChange={(e) => handleInputChange('bakim40H', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM (120 SAAT)</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ SAAT" value={formData.bakim120H} onChange={(e) => handleInputChange('bakim120H', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM (480 SAAT)</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ SAAT" value={formData.bakim480H} onChange={(e) => handleInputChange('bakim480H', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM ZAMANI (TARİH)</label>
                        <input disabled={isPastDate} type="text" placeholder="GG.AA.YYYY" value={formData.bakimTakvimTarih} onChange={(e) => handleInputChange('bakimTakvimTarih', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">KONUM</label>
                        <input type="text" placeholder="YENİ KONUM" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                        <select value={formData.durum} onChange={(e) => { 
                          const val = e.target.value;
                          handleInputChange('durum', val); 
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          if (val === Status.FAAL || val === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) {
                            if (val === Status.FAAL) {
                              handleInputChange('durumAyrintisi', '-');
                            }
                            if (!formData.intraDayEndTime) {
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
                          <option value={Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}>{Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}</option>
                        </select>
                      </div>
                      {formData.durum === Status.GAYRI_FAAL && (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">GAYRI FAAL BAŞLANGIÇ SAATİ</label>
                            <input type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayStartTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">G.FAAL SEBEBİ / DURUM AYRINTISI</label>
                            <select value={formData.durumAyrintisi} onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all">
                              <option value="-">- (Seçiniz)</option>
                              <option value="BAKIM">BAKIM</option>
                              <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                              <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                              <option value="ARIZA">ARIZA</option>
                              <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                              <option value="KAZA KIRIM">KAZA KIRIM</option>
                              <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                              <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                              <option value="TEKNİK BÜLTEN UYGULAMASI">TEKNİK BÜLTEN UYGULAMASI</option>
                              <option value="KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)">KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)</option>
                            </select>
                          </div>
                        </>
                      )}
                      {(formData.durum === Status.FAAL || formData.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">FAAL BAŞLANGIÇ SAATİ</label>
                          <input type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayEndTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                        </div>
                      )}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                        <textarea rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
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
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">LANDING</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ DEĞER" value={formData.landings} onChange={(e) => handleInputChange('landings', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">SAAT ESASLI BAKIM ZAMANI (200 SAAT)</label>
                        <input disabled={isPastDate} type="text" placeholder="YENİ SAAT" value={formData.bakim200H} onChange={(e) => handleInputChange('bakim200H', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                      <div className={`space-y-2${disabledClass}`}>
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">TAKVİM ESASLI BAKIM TARİHİ</label>
                        <input disabled={isPastDate} type="date" value={formData.bakimTakvimTarih} onChange={(e) => handleInputChange('bakimTakvimTarih', e.target.value)} className={`w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all${disabledClass}`} />
                      </div>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">KONUM</label>
                        <input type="text" placeholder="YENİ KONUM" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                        <select value={formData.durum} onChange={(e) => { 
                          const val = e.target.value;
                          handleInputChange('durum', val); 
                          const now = new Date();
                          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          if (val === Status.FAAL || val === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) {
                            if (val === Status.FAAL) {
                              handleInputChange('durumAyrintisi', '-');
                            }
                            if (!formData.intraDayEndTime) {
                              handleInputChange('intraDayEndTime', timeStr);
                            }
                          } else if (val === Status.GAYRI_FAAL) {
                            if (!formData.intraDayStartTime) {
                              handleInputChange('intraDayStartTime', timeStr);
                            }
                          }
                        }} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all">
                          <option value={Status.FAAL}>{Status.FAAL}</option>
                          <option value={Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}>{Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}</option>
                          <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                        </select>
                      </div>
                      {formData.durum === Status.GAYRI_FAAL && (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">
                              GAYRI FAAL BAŞLANGIÇ SAATİ {selectedAircraft?.durum !== Status.GAYRI_FAAL && <span className="text-red-500 font-bold tracking-normal text-xs ml-1">(ZORUNLU)</span>}
                            </label>
                            <input type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayStartTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">G.FAAL SEBEBİ / DURUM AYRINTISI</label>
                            <select
                              value={formData.durumAyrintisi}
                              onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)}
                              className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                            >
                              <option value="">LÜTFEN SEÇİNİZ...</option>
                              <option value="BAKIM">BAKIM</option>
                              <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                              <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                              <option value="ARIZA">ARIZA</option>
                              <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                              <option value="KAZA KIRIM">KAZA KIRIM</option>
                              <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                              <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                              <option value="KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)">KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)</option>
                              {formData.durumAyrintisi && !["BAKIM","BAKIM BEKLER","KABUL MUAYENESİ","ARIZA","PARÇA BEKLER","KAZA KIRIM","OLMADIĞI GÜNLER","TECRÜBE BEKLER","KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)","-",""].includes(formData.durumAyrintisi) && (
                                <option value={formData.durumAyrintisi}>{formData.durumAyrintisi}</option>
                              )}
                            </select>
                          </div>
                        </>
                      )}
                      {(formData.durum === Status.FAAL || formData.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">
                            FAAL BAŞLANGIÇ SAATİ {selectedAircraft?.durum === Status.GAYRI_FAAL && <span className="text-red-500 font-bold tracking-normal text-xs ml-1">(ZORUNLU)</span>}
                          </label>
                          <input type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayEndTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                        </div>
                      )}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                        <textarea rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
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
                                  <input type="text" placeholder="Gövde Saati" value={at802Data.acTT} onChange={e => setAt802Data({...at802Data, acTT: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className={`space-y-2${disabledClass}`}>
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">ENGINE STARTS</label>
                                  <input disabled={isPastDate} type="text" value={at802Data.starts} onChange={e => setAt802Data({...at802Data, starts: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className={`space-y-2${disabledClass}`}>
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">LANDINGS</label>
                                  <input disabled={isPastDate} type="text" value={at802Data.landings} onChange={e => setAt802Data({...at802Data, landings: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className={`space-y-2${disabledClass}`}>
                                  <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">ENGINE FLIGHTS</label>
                                  <input disabled={isPastDate} type="text" value={at802Data.flights} onChange={e => setAt802Data({...at802Data, flights: e.target.value})} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                                </div>
                              </div>
                            </div>

                            <div className={`space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10${disabledClass}`}>
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
                                <div className={`space-y-2${disabledClass}`}>
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
                            <input type="text" value={formData.konum} onChange={(e) => handleInputChange('konum', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-4">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">DURUMU</label>
                            <select value={formData.durum} onChange={(e) => { 
                              const val = e.target.value;
                              handleInputChange('durum', val); 
                              const now = new Date();
                              const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                              if (val === Status.FAAL || val === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) {
                                if (val === Status.FAAL) {
                                  handleInputChange('durumAyrintisi', '-');
                                }
                                if (!formData.intraDayEndTime) {
                                  handleInputChange('intraDayEndTime', timeStr);
                                }
                              } else if (val === Status.GAYRI_FAAL) {
                                if (!formData.intraDayStartTime) {
                                  handleInputChange('intraDayStartTime', timeStr);
                                }
                              }
                            }} className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all">
                              <option value={Status.FAAL}>{Status.FAAL}</option>
                              <option value={Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}>{Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ}</option>
                              <option value={Status.GAYRI_FAAL}>{Status.GAYRI_FAAL}</option>
                            </select>
                          </div>
                          {formData.durum === Status.GAYRI_FAAL && (
                            <>
                              <div className="space-y-4 md:col-span-2">
                                <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">
                                  GAYRI FAAL BAŞLANGIÇ SAATİ {selectedAircraft?.durum !== Status.GAYRI_FAAL && <span className="text-red-500 font-bold tracking-normal text-xs ml-1">(ZORUNLU)</span>}
                                </label>
                                <input type="time" value={formData.intraDayStartTime} onChange={(e) => handleInputChange('intraDayStartTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayStartTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                              </div>
                              <div className="space-y-4 md:col-span-2">
                                <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">G.FAAL SEBEBİ / DURUM AYRINTISI</label>
                                <select
                                  value={formData.durumAyrintisi}
                                  onChange={(e) => handleInputChange('durumAyrintisi', e.target.value)}
                                  className="w-full bg-white text-black border-2 border-transparent rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all"
                                >
                                  <option value="">LÜTFEN SEÇİNİZ...</option>
                                  <option value="BAKIM">BAKIM</option>
                                  <option value="BAKIM BEKLER">BAKIM BEKLER</option>
                                  <option value="KABUL MUAYENESİ">KABUL MUAYENESİ</option>
                                  <option value="ARIZA">ARIZA</option>
                                  <option value="PARÇA BEKLER">PARÇA BEKLER</option>
                                  <option value="KAZA KIRIM">KAZA KIRIM</option>
                                  <option value="OLMADIĞI GÜNLER">OLMADIĞI GÜNLER</option>
                                  <option value="TECRÜBE BEKLER">TECRÜBE BEKLER</option>
                                  <option value="KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)">KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)</option>
                                  {formData.durumAyrintisi && !["BAKIM","BAKIM BEKLER","KABUL MUAYENESİ","ARIZA","PARÇA BEKLER","KAZA KIRIM","OLMADIĞI GÜNLER","TECRÜBE BEKLER","KARMA GÜN (HEM FAAL HEM GAYRİ FAAL)","-",""].includes(formData.durumAyrintisi) && (
                                    <option value={formData.durumAyrintisi}>{formData.durumAyrintisi}</option>
                                  )}
                                </select>
                              </div>
                            </>
                          )}
                          {(formData.durum === Status.FAAL || formData.durum === Status.FAAL_FIREBOSS_GOREVI_YAPAMAZ) && (
                            <div className="space-y-4 md:col-span-2">
                              <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">
                                FAAL BAŞLANGIÇ SAATİ {selectedAircraft?.durum === Status.GAYRI_FAAL && <span className="text-red-500 font-bold tracking-normal text-xs ml-1">(ZORUNLU)</span>}
                              </label>
                              <input type="time" value={formData.intraDayEndTime} onChange={(e) => handleInputChange('intraDayEndTime', e.target.value)} className={`w-full bg-white text-black border-2 ${validationErrors.intraDayEndTime ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-transparent'} rounded-xl px-4 py-3 font-bold focus:border-emerald-500 outline-none transition-all`} />
                            </div>
                          )}
                          <div className="space-y-4 md:col-span-2">
                            <label className="block text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.4em]">AÇIKLAMA</label>
                            <textarea rows={4} value={formData.aciklama} onChange={(e) => handleInputChange('aciklama', e.target.value)} className="w-full bg-white text-black border-2 border-transparent rounded-2xl px-4 md:px-6 py-4 font-bold focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
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