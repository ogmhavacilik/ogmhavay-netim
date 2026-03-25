import { SheetConfig, Aircraft, Status, StatusType, DailyStatusCode, OPLItem } from '../types';
import { getCallSignByTail } from '../constants';

/**
 * Durum metinlerini analiz ederek faaliyet kodunu belirler.
 */
export const analyzeStatus = (item: any): { code: DailyStatusCode, interpretation: string } => {
  if (!item) return { code: 'F', interpretation: 'FAAL' };
  
  // Helper to get value from multiple possible keys (headers, column letters, mapping keys)
  const getVal = (keys: string[]) => {
    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null && item[key] !== '') return String(item[key]);
    }
    return '';
  };

  const detail = getVal(['durumAyrintisi', 'Durum Ayrıntısı', 'DURUM AYRINTISI', 'O', 'o', 'C', 'c', 'durum_ayrintisi']).toLocaleLowerCase('tr-TR').trim();
  const desc = getVal(['aciklama', 'Açıklama', 'AÇIKLAMA', 'P', 'p', 'D', 'd', 'aciklama']).toLocaleLowerCase('tr-TR').trim();
  const durumStr = getVal(['durum', 'Durum', 'DURUM', 'N', 'n', 'B', 'b', 'durum']).toLocaleUpperCase('tr-TR').trim();
  const detailUpper = detail.toLocaleUpperCase('tr-TR');
  
  // 1. KESİN ÖNCELİK: DURUM AYRINTISI (BİREBİR EŞLEŞME VEYA NET ANAHTAR KELİME)
  // Kullanıcı "Eğer durum ayrıntısı varsa birebir onu baz al" dedi.
  
  // PARÇA BEKLER (PB) - En yüksek öncelik
  if (detailUpper.includes('PARÇA BEKLER') || detailUpper.includes('PARCA BEKLER') || detailUpper === 'PB') return { code: 'PB', interpretation: 'PARÇA BEKLER' };
  
  // TECRÜBE BEKLER (TB) - İSTİSNA: Durum ayrıntısında varsa kesinlikle TB
  if (detailUpper.includes('TECRÜBE BEKLER') || detailUpper.includes('TECRUBE BEKLER') || detailUpper === 'TB') return { code: 'TB', interpretation: 'TECRÜBE BEKLER' };

  // BAKIM BEKLER (BB)
  if (detailUpper.includes('BAKIM BEKLER') || detailUpper === 'BB') return { code: 'BB', interpretation: 'BAKIM BEKLER' };
  
  // KABUL MUAYENE (KM)
  if (detailUpper.includes('KABUL MUAYENE') || detailUpper === 'KM') return { code: 'KM', interpretation: 'KABUL MUAYENESİ' };
  
  // KAZA KIRIM (KK)
  if (detailUpper.includes('KAZA KIRIM') || detailUpper === 'KK') return { code: 'KK', interpretation: 'KAZA KIRIM' };
  
  // BAKIM (B)
  if (detailUpper.includes('BAKIM') || detailUpper === 'B') return { code: 'B', interpretation: 'BAKIM' };
  
  // ARIZA (A)
  if (detailUpper.includes('ARIZA') || detailUpper === 'A') return { code: 'A', interpretation: 'ARIZA' };
  
  // OLMADIĞI GÜNLER (X)
  if (detailUpper.includes('OLMADIĞI GÜNLER') || detailUpper.includes('OLMADIGI GUNLER') || detailUpper === 'X') return { code: 'X', interpretation: 'OLMADIĞI GÜNLER' };

  // TECRÜBE / TEST (TB) - Durum ayrıntısında varsa
  if (detailUpper.includes('TECRÜBE') || detailUpper.includes('TECRUBE') || detailUpper.includes('TEST')) return { code: 'TB', interpretation: 'TECRÜBE BEKLER' };

  const fullText = `${detail} ${desc} ${durumStr.toLocaleLowerCase('tr-TR')}`;

  // 2. FALLBACK: AÇIKLAMA VE DURUM AYRINTISI BİRLİKTE
  // OLMADIĞI GÜNLER -> X
  if (fullText.includes('olmadığı günler') || fullText.includes('olmadigi gunler')) {
    return { code: 'X', interpretation: 'OLMADIĞI GÜNLER' };
  }

  // KABUL MUAYENESİ -> KM
  if (fullText.includes('kabul muayene') || fullText.includes('kabul mua')) {
    return { code: 'KM', interpretation: 'KABUL MUAYENESİ' };
  }

  // KAZA KIRIM -> KK
  if (fullText.includes('kaza') || fullText.includes('kırım') || fullText.includes('kirim') || fullText.includes('hasar')) {
    return { code: 'KK', interpretation: 'KAZA KIRIM' };
  }

  // PARÇA BEKLER -> PB
  if (fullText.includes('parça') && (fullText.includes('bekle') || fullText.includes('sipariş') || fullText.includes('siparis'))) {
    return { code: 'PB', interpretation: 'PARÇA BEKLER' };
  }
  
  // TECRÜBE BEKLER -> TB
  if (fullText.includes('tecrübe') || fullText.includes('tecrube') || fullText.includes('test')) {
    if (detail.includes('test uçuşu') || detail.includes('test/tecrübe') || fullText.includes('bekliyor') || fullText.includes('bekler') || fullText.includes('sıra')) {
      return { code: 'TB', interpretation: 'TECRÜBE BEKLER' };
    }
  }

  // BAKIM BEKLER -> BB
  if (fullText.includes('bakım bekler') || fullText.includes('bakim bekler') || 
     ((fullText.includes('bakım') || fullText.includes('bakim')) && (fullText.includes('bekliyor') || fullText.includes('bekler') || fullText.includes('sıra') || fullText.includes('sira')))) {
    return { code: 'BB', interpretation: 'BAKIM BEKLER' };
  }

  // BAKIM -> B
  if (fullText.includes('bakım') || fullText.includes('bakim') || fullText.includes('yıllık') || fullText.includes('yillik') || fullText.includes('periyodik') || /\b\d+h\b/.test(fullText)) {
    return { code: 'B', interpretation: 'BAKIM' };
  }

  // ARIZA -> A
  if (fullText.includes('arıza') || fullText.includes('ariza') || fullText.includes('problem')) {
    return { code: 'A', interpretation: 'ARIZA' };
  }

  // 3. DURUM KONTROLÜ
  if (durumStr === 'FAAL' || durumStr === 'F') return { code: 'F', interpretation: 'FAAL' };

  const isGayriFaal = durumStr.includes('GAYRİ') || durumStr.includes('GAYRI') || durumStr.includes('G.FAAL');
  if (isGayriFaal) return { code: 'A', interpretation: 'ARIZA' };

  return { code: 'F', interpretation: 'FAAL' };
};

/**
 * Saat değerini HH:mm formatına çevirir
 */
export const formatToHHMM = (totalHours: number | null, aircraftType?: string): string => {
  if (totalHours === null) return '-';
  
  const hours = Math.floor(Math.abs(totalHours));
  const minutes = Math.round((Math.abs(totalHours) - hours) * 60);
  const sign = totalHours < 0 ? '-' : '';
  
  const result = `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  
  return result;
};

/**
 * Hücre değerini sayısal saate çevirir
 */
export const parseSingleCellToHour = (val: any, aircraftType: string): number | null => {
  if (val === undefined || val === null || val === "" || val === "0" || val === "00:00") return null;

  let d: Date | null = null;
  if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
    d = new Date(val);
  } else if (val instanceof Date || (val && typeof val.getTime === 'function')) {
    d = new Date(val);
  } else if (typeof val === 'string' && /^\d{1,2}\.\d{1,2}\.\d{4}/.test(val)) {
    // Handle DD.MM.YYYY strings from getDisplayValues()
    const parts = val.split(/[.\s:]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      const hour = parseInt(parts[3]) || 0;
      const min = parseInt(parts[4]) || 0;
      d = new Date(Date.UTC(year, month, day, hour, min));
    }
  }

  if (d && !isNaN(d.getTime())) {
    const year = d.getUTCFullYear();
    if (year <= 1905) {
      // Robust duration calculation: milliseconds since Sheets epoch (1899-12-30)
      const base = new Date(Date.UTC(1899, 11, 30, 0, 0, 0));
      const diffMs = d.getTime() - base.getTime();
      let totalHours = diffMs / (1000 * 60 * 60);
      return totalHours > 0 ? totalHours : null;
    }
  }

  if (typeof val === 'number') {
    if (val <= 0) return null;
    let n = val;
    // AT-802 correction for numeric hours (days or hours)
    if (aircraftType === 'AT-802') {
      if (n < 100) n = n * 24; // If it's days
    }
    return n;
  }

  if (typeof val === 'string') {
    const s = val.trim().replace(',', '.');
    if (s.includes(':')) {
      const parts = s.split(':').map(Number);
      if (parts.length >= 2) {
        const h = parts[0] || 0;
        const m = parts[1] || 0;
        let total = h + m / 60;
        
        return total;
      }
    }
    const n = parseFloat(s);
    if (!isNaN(n)) {
      let total = n;
      // Special case for Bell-429: decimal part is literal minutes
      if (aircraftType === 'Bell-429' && s.includes('.')) {
        const parts = s.split('.');
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        total = h + m / 60;
      }
      
      return total;
    }
  }

  return null;
};

const formatGovdeHour = (val: any, aircraftType: string): string => {
  const deepFlatten = (v: any): any => {
    if (Array.isArray(v)) return v.length > 0 ? deepFlatten(v[0]) : null;
    return v;
  };
  
  const raw = deepFlatten(val);
  if (raw === undefined || raw === null || String(raw).trim() === "" || String(raw).trim() === "0") return "-";
  
  const s = String(raw).trim();

  // For AT-802, if it looks like a date or a shifted duration, we must parse and correct it
  if (aircraftType === 'AT-802') {
    const parsed = parseSingleCellToHour(raw, aircraftType);
    if (parsed !== null) {
      return formatToHHMM(parsed, aircraftType);
    }
    return s;
  }

  if (aircraftType === 'B-360' || aircraftType === 'Bell-429') {
    if (s.includes(':')) return s.replace(':', ',');
    return s.replace('.', ',');
  }

  // For C-650, truncate if it's a number
  if (aircraftType === 'C-650') {
    const n = parseFloat(s.replace(',', '.'));
    if (!isNaN(n)) return Math.floor(n).toString();
  }

  const parsed = parseSingleCellToHour(raw, aircraftType);
  if (parsed !== null) {
    return formatToHHMM(parsed, aircraftType);
  }
  return s;
};

const formatValueToString = (val: any): string => {
  if (val === undefined || val === null) return '-';
  if (Array.isArray(val)) return formatValueToString(val[0]);
  return String(val).trim() || '-';
};

const formatDateIfISO = (val: any): string => {
  if (!val) return '-';
  const s = formatValueToString(val);
  if (s === '-' || s === '') return '-';
  
  // If it's already in DD.MM.YYYY format, return it
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;
  
  // If it's in YYYY-MM-DD format, convert to DD.MM.YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const parts = s.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  // Handle MM/DD/YYYY or M/D/YYYY -> DD.MM.YYYY
  // User specifically requested to convert Month/Day/Year to Day.Month.Year
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split('/');
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    
    // If month > 12, it's likely already in DD/MM/YYYY format
    if (parseInt(month) > 12) {
      return `${month}.${day}.${year}`;
    }
    
    return `${day}.${month}.${year}`;
  }

  if (typeof s === 'string' && s.includes('T') && s.includes('Z')) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('tr-TR');
    }
  }
  return s;
};

export const fetchAircraftDataFromAppsScript = async (url: string, config: SheetConfig): Promise<Partial<Aircraft>[]> => {
  const cleanUrl = url?.trim();
  if (!cleanUrl || !cleanUrl.startsWith('http')) {
    console.warn(`Geçersiz veya boş Apps Script URL'si (${config.aircraftType}). Lütfen konfigürasyonu kontrol edin.`);
    return [];
  }
  if (!cleanUrl.includes('script.google.com/macros/')) {
    console.error(`Hatalı URL Formatı (${config.aircraftType}): Lütfen Google Sheets URL'si yerine Google Apps Script Web App URL'sini girin. URL: ${cleanUrl}`);
    return [];
  }
  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      redirect: 'follow',
      body: JSON.stringify({
        sheetId: config.sheetId,
        sheetName: config.sheetName || '',
        mapping: config.mapping,
        action: 'getAircraftData',
        fetchTechnicalDetails: config.aircraftType === 'AT-802'
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let result;
    const text = await response.text();
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error(`fetchAircraftDataFromAppsScript JSON Parse Error (${config.aircraftType}):`, e, "Raw response:", text.substring(0, 200));
      return [];
    }
    
    const data = (result && (result.success || result.status === 'success') && Array.isArray(result.data)) 
      ? result.data 
      : (Array.isArray(result) ? result : []);
    
    if (data.length === 0) return [];

    // AT-802 için Geliş Tarihi eşleştirme haritası oluştur
    const arrivalMap = new Map<string, string>();
    if (config.aircraftType === 'AT-802') {
      data.forEach((item: any) => {
        const rawGelisKNo = String(item.gelisKuyrukNo || '').trim();
        const rawGelisTarihi = item.gelisTarihi;
        
        // Kuyruk no formatını temizle: "OR-2021 / 802-1051 (EC-OEK)" -> "OR-2021"
        const match = rawGelisKNo.match(/OR-\d+/i);
        if (match) {
          const cleanKNo = match[0].toUpperCase();
          let dateStr = '-';
          if (Array.isArray(rawGelisTarihi)) {
            // U24:V35 birleşik hücre olabilir, ilk değeri al
            dateStr = formatDateIfISO(rawGelisTarihi[0]);
          } else {
            dateStr = formatDateIfISO(rawGelisTarihi);
          }
          if (dateStr && dateStr !== '-') {
            arrivalMap.set(cleanKNo, dateStr);
          }
        }
      });
    }

    const now = new Date();
    const timestamp = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return data.map((item: any): Partial<Aircraft> | null => {
      if (!item || typeof item !== 'object') return null;
      const analysis = analyzeStatus(item);
      const kuyrukNo = String(item.kuyrukNo || '').trim();
      const cleanKuyrukNo = kuyrukNo.toUpperCase();
      
      let finalMinHour: number | null = null;
      let maintenanceHours: { bakimTuru: string, kalanSaat: number }[] = [];

      if (config.aircraftType === 'T-70') {
        const h40 = parseSingleCellToHour(item.bakim40H, 'T-70');
        const h120 = parseSingleCellToHour(item.bakim120H, 'T-70');
        
        const validHours = [h40, h120].filter((h): h is number => h !== null);
        finalMinHour = validHours.length > 0 ? Math.min(...validHours) : null;
        
        maintenanceHours = [
          { bakimTuru: 'Bakıma Kalan Saat (40 Saat)', kalanSaat: h40 ?? 0 },
          { bakimTuru: 'Bakıma Kalan Saat (120 Saat)', kalanSaat: h120 ?? 0 }
        ];
      } else {
        const faydaliRawCells = Array.isArray(item.faydaliSaat) ? item.faydaliSaat.flat(Infinity) : [item.faydaliSaat];
        const validFaydaliHours = faydaliRawCells
          .map(cell => parseSingleCellToHour(cell, config.aircraftType))
          .filter((h): h is number => h !== null);
        finalMinHour = validFaydaliHours.length > 0 ? Math.min(...validFaydaliHours) : null;
        
        const hourInt = (config.aircraftType === 'C-650' && finalMinHour !== null) 
          ? Math.floor(finalMinHour) 
          : (finalMinHour !== null ? Math.floor(finalMinHour) : null);
          
        maintenanceHours = [{ bakimTuru: 'KALAN', kalanSaat: hourInt || 0 }];
      }

      const govdeStr = formatGovdeHour(item.govdeUcusSaati ?? item.E ?? item.e ?? item[4], config.aircraftType);

      const aircraft: Partial<Aircraft> = {
        kuyrukNo: kuyrukNo,
        cagriKodu: getCallSignByTail(kuyrukNo),
        durum: (analysis.code !== 'F') ? Status.GAYRI_FAAL : Status.FAAL,
        durumTipi: (analysis.code === 'B' || analysis.code === 'BB' || analysis.code === 'KM') ? StatusType.BAKIM : 
                   (analysis.code === 'A' || analysis.code === 'PB') ? StatusType.ARIZA : StatusType.NONE,
        durumAyrintisi: String(item.durumAyrintisi || '-'),
        konum: String(item.konum || 'ANKARA'),
        faydaliSaat: finalMinHour, 
        govdeUcusSaati: govdeStr,
        aciklama: String(item.aciklama || ''),
        guncellemeTarihi: timestamp,
        durumBaslangic: new Date().toISOString().split('T')[0],
        maintenanceHours: maintenanceHours,
        photos: (function() {
          // Bell-429
          if (cleanKuyrukNo === 'OR-3125') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvt3kY_8IMmrxMHeZA6by8UcjfIBqYrHXMsA&s'];
          if (cleanKuyrukNo === 'OR-3126') return ['https://www.aeroboek.nl/429/57126_OR3126_2C.png'];
          if (cleanKuyrukNo === 'OR-3127') return ['https://www.aeroboek.nl/429/57127_OR3127_2C.png'];
          if (cleanKuyrukNo === 'OR-3131') return ['https://www.aeroboek.nl/429/57131_OR3131_2C.png'];
          if (cleanKuyrukNo === 'OR-3133') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Ix2Vg56aGbtiaEuyeIKn6vxmzUfKeenUdA&s'];
          if (cleanKuyrukNo === 'OR-3192') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZDPlRVm2GNg92mR_vxy64-OnWbGpSuX4SAg&s'];
          
          // AT-802
          if (cleanKuyrukNo === 'OR-2021') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTL-8GZxuw44CRtssZbFPtEJnBnOpshon3jbQ&s'];
          if (cleanKuyrukNo === 'OR-2022') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRya0ta5-xDnrJFtDhAip3sscgA9EW-MxCRHA&s'];
          if (cleanKuyrukNo === 'OR-2023') return ['https://cdn.plnspttrs.net/25248/or-2023-turkey-ministry-of-forests-air-tractor-at-802a_PlanespottersNet_1463290_c1b1206c5b_o.jpg'];
          if (cleanKuyrukNo === 'OR-2024') return ['https://www.netairspace.cc/photos/OR-2024/Turkey_Ministry_of_Forest/Air_Tractor_AT-802AF_Fire_Boss/LTXE_Karain/photo_588028/medium.jpg?uq=0001'];
          if (cleanKuyrukNo === 'OR-2025') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwcIOn-Pq1MeMvlD_-fteyqPXOPuijaQWICg&s'];
          if (cleanKuyrukNo === 'OR-2026') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8rif05gm_jcUO_UEoJk7dK8gfBtHDERys0g&s'];
          if (cleanKuyrukNo === 'OR-2027') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPGyBLfdgPD6t6vakU_zeOOeLsaTKlxuTffg&s'];
          if (cleanKuyrukNo === 'OR-2028') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvPc4V_HPLcPw1TqgfhnB5EaSveJB7UzjRsg&s'];
          if (cleanKuyrukNo === 'OR-2029') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7kN1pPOG7CIqz74KQ954o5Rdcs_IEKKehjA&s'];
          if (cleanKuyrukNo === 'OR-2036') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_AAtp-RURmWZw2ErwXRPtQ9_mMFkoyZDVYQ&s'];
          if (cleanKuyrukNo === 'OR-2037') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4UdGU4EmGc6clWyUgjrKbgV20gj1MhxhB2g&s'];
          if (cleanKuyrukNo === 'OR-2038') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBa8tE1C4927j_K-P1iyvIS7H_39G3ZBI9RQ&s'];

          // T-70
          if (cleanKuyrukNo === 'OR-1018') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi1OwUDKJ49qRHjiBDnrDS0XCGgYBLKUFaqw&s'];
          if (cleanKuyrukNo === 'OR-1019') return ['https://cdn.plnspttrs.net/37181/or-1019-turkey-ministry-of-forests-tai-t-70-gmh_PlanespottersNet_1793797_54766d7ce5_o.jpg'];
          if (cleanKuyrukNo === 'OR-1020') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTulq5ghRw_RiWWmf_12fo-QxLLQ8OFYi7pww&s'];

          // B-360 & C-650
          if (config.aircraftType === 'B-360') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxrYd7ZIDto6tE5Th_geHmrHuBt_LpwW5KQA&s'];
          if (config.aircraftType === 'C-650') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4BEPoTgUJXnE7relY8W3lmY7oqRW9_U1OSQ&s'];

          return [`https://picsum.photos/seed/${kuyrukNo}/800/600`];
        })(),
        platformTipi: (function() {
          if (config.aircraftType === 'Bell-429') return 'H';
          if (config.aircraftType === 'T-70') return 'H';
          if (config.aircraftType === 'B-360') return 'SL';
          if (config.aircraftType === 'C-650') return 'SL';
          if (config.aircraftType === 'AT-802') {
             const tail = cleanKuyrukNo;
             if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return 'DA';
             if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) return 'SA';
             if (tail === 'OR-2036') return 'DL';
             if (tail === 'OR-2038') return 'SL';
             return 'SA';
          }
          return 'SA';
        })(),
        tip: config.aircraftType,
        assignedCode: analysis.code,
        aiInterpretation: analysis.interpretation,
        sheetId: config.sheetId,
        sheetName: config.sheetName,
        appsScriptUrl: config.appsScriptUrl,
        mapping: config.mapping,
        seriNo: formatValueToString(item.govdeSN ?? item.B ?? item.seriNo),
        motor: config.aircraftType === 'Bell-429' ? '2x Pratt & Whitney PW207D1' : 
               config.aircraftType === 'T-70' ? '2x General Electric T700-TEI-701D' :
               (config.aircraftType === 'B-360' || config.aircraftType === 'C-650') ? undefined :
               formatValueToString(item.motor1SN ?? item.motor),
        uretimYili: (function() {
          const val = String(item.uretimYili || '');
          const match = val.match(/\d{4}/);
          return match ? parseInt(match[0]) : (Number(item.uretimYili) || 0);
        })(),
        gelisTarihi: arrivalMap.get(cleanKuyrukNo) || '-'
      };

      if (config.aircraftType === 'Bell-429') {
        aircraft.govdeSN = formatValueToString(item.govdeSN);
        aircraft.motor1SN = formatValueToString(item.motor1SN);
        aircraft.motor2SN = formatValueToString(item.motor2SN);
        aircraft.motor1UcusSaati = formatGovdeHour(item.motor1UcusSaati, config.aircraftType);
        aircraft.motor2UcusSaati = formatGovdeHour(item.motor2UcusSaati, config.aircraftType);
        aircraft.bakim50H = formatValueToString(item.bakim50H);
        aircraft.bakimTakvim = formatDateIfISO(item.bakimTakvim);
      } else if (config.aircraftType === 'AT-802') {
        aircraft.acTT = formatValueToString(item.acTT);
        aircraft.landings = formatValueToString(item.landings);
        aircraft.engineStarts = formatValueToString(item.engineStarts);
        aircraft.engineFlights = formatValueToString(item.engineFlights);
        aircraft.bakimTakvimTarih = formatDateIfISO(item.bakimTakvimTarih);
        
        // Prioritize technical sheet data (item.frdsTestDate or item.frdsTest) over main sheet data
        const techDate = item.frdsTestDate || item.frdsTest;
        const mainDate = (aircraft.kuyrukNo === 'OR-2030' || aircraft.kuyrukNo === 'OR-2031' || aircraft.kuyrukNo === 'OR-2036') 
          ? (item.frdsTestDateAlt || item.frdsTestDateMain)
          : item.frdsTestDateMain;

        if (techDate && techDate !== '-' && techDate !== 'N/A' && techDate !== '') {
          aircraft.frdsTestDate = formatDateIfISO(techDate);
        } else {
          aircraft.frdsTestDate = formatDateIfISO(mainDate);
        }
        
        const techMotor = item.motorRunDate || item.motorCalisma;
        if (techMotor && techMotor !== '-' && techMotor !== 'N/A' && techMotor !== '') {
          aircraft.motorRunDate = formatDateIfISO(techMotor);
        }
      } else if (config.aircraftType === 'T-70') {
        aircraft.govdeSN = formatValueToString(item.govdeSN);
        aircraft.motor1SN = formatValueToString(item.motor1SN);
        aircraft.motor2SN = formatValueToString(item.motor2SN);
        // T-70 için veriyi dönüştürmeden aynen al
        aircraft.govdeUcusSaati = formatValueToString(item.govdeUcusSaati ?? item.E ?? item.e ?? item[4]);
        aircraft.bakim40H = formatValueToString(item.bakim40H);
        aircraft.bakim120H = formatValueToString(item.bakim120H);
        aircraft.bakim480H = formatValueToString(item.bakim480H);
        aircraft.bakimTakvimTarih = formatValueToString(item.bakimTakvimTarih);
        aircraft.bakimKalanSaat = formatValueToString(item.bakimKalanSaat);
      } else if (config.aircraftType === 'B-360' || config.aircraftType === 'C-650') {
        aircraft.govdeSN = formatValueToString(item.govdeSN);
        aircraft.motor1SN = formatValueToString(item.motor1SN);
        aircraft.motor2SN = formatValueToString(item.motor2SN);
        aircraft.landings = formatValueToString(item.landings);
        aircraft.bakim200H = formatGovdeHour(item.bakim200H, config.aircraftType);
        aircraft.bakimTakvimTarih = formatDateIfISO(item.bakimTakvimTarih);
      }

      return aircraft;
    }).filter((a): a is Partial<Aircraft> => a !== null);
  } catch (error) {
    console.error(`fetchAircraftDataFromAppsScript Hatası (${config.aircraftType}):`, error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`Olası CORS hatası veya geçersiz URL. Lütfen Apps Script'in "Herkes" (Anyone) erişimiyle dağıtıldığından emin olun. URL: ${url}`);
    }
    return [];
  }
};

/**
 * ÖPL verilerini Apps Script üzerinden çeker.
 * Google Apps Script'e 'text/plain' olarak gönderim preflight CORS hatalarını önler.
 */
export const fetchOPLData = async (
  scriptUrl: string,
  sheetId: string,
  kuyrukNo: string
): Promise<OPLItem[]> => {
  const cleanUrl = scriptUrl?.trim();
  if (!cleanUrl || !cleanUrl.startsWith('http')) {
    console.warn("fetchOPLData: Geçersiz URL", scriptUrl);
    return [];
  }
  if (!cleanUrl.includes('script.google.com/macros/')) {
    console.error(`fetchOPLData: Hatalı URL Formatı. Lütfen Google Sheets URL'si yerine Google Apps Script Web App URL'sini girin. URL: ${cleanUrl}`);
    return [];
  }
  try {
    const response = await fetch(cleanUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      redirect: 'follow',
      body: JSON.stringify({
        action: "getOPLData",
        sheetId,
        kuyrukNo
      })
    });

    if (!response.ok) {
      console.warn(`fetchOPLData: HTTP Hatası ${response.status} - ${scriptUrl}`);
      return [];
    }

    const result = await response.json();
    if (!result || !result.success || !Array.isArray(result.data)) {
      console.warn("fetchOPLData: Geçersiz veri yapısı", result);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error(`fetchOPLData Hatası (${kuyrukNo} - ${scriptUrl}):`, error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`fetchOPLData: Olası CORS hatası veya geçersiz URL. Lütfen Apps Script'in "Herkes" (Anyone) erişimiyle dağıtıldığından emin olun. URL: ${scriptUrl}`);
    }
    return [];
  }
};

export const fetchAircraftSpecificData = async (
  url: string,
  sheetId: string,
  kuyrukNo: string
): Promise<any> => {
  const cleanUrl = url?.trim();
  if (!cleanUrl || !cleanUrl.startsWith('http')) return { success: false };
  if (!cleanUrl.includes('script.google.com/macros/')) return { success: false };
  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'getAircraftSpecificData',
        sheetId,
        kuyrukNo
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("fetchAircraftSpecificData error:", error);
    return { success: false };
  }
};

export const updateAircraftData = async (
  url: string,
  sheetId: string,
  kuyrukNo: string,
  updates: Record<string, any>,
  mapping: any,
  sheetName?: string,
  aircraftType?: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = url?.trim();
  if (!cleanUrl || !cleanUrl.includes('script.google.com/macros/')) return { success: false, message: 'Geçersiz URL formatı.' };
  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'updateAircraftData',
        sheetId,
        sheetName,
        kuyrukNo,
        updates,
        mapping,
        aircraftType
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    const message = typeof result.data === 'string' ? result.data : (result.data?.message || result.message || result.error);
    return {
      success: result.success || result.status === 'success' || false,
      message: message || (result.success ? 'Başarıyla güncellendi.' : 'Güncelleme başarısız.')
    };
  } catch (error) {
    console.error('updateAircraftData Hatası:', error);
    return { success: false, message: 'Sunucu bağlantı hatası.' };
  }
};

export const updatePastEnvanterLog = async (
  url: string,
  sheetId: string,
  kuyrukNo: string,
  date: string,
  newHours: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = url?.trim();
  if (!cleanUrl || !cleanUrl.includes('script.google.com/macros/')) return { success: false, message: 'Geçersiz URL formatı.' };
  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'updatePastEnvanterLog',
        sheetId,
        kuyrukNo,
        date,
        newHours
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    const message = typeof result.data === 'string' ? result.data : (result.data?.message || result.message || result.error);
    return {
      success: result.success || result.status === 'success' || false,
      message: message || (result.success ? 'Geçmiş gün verisi güncellendi.' : 'Güncelleme başarısız.')
    };
  } catch (error) {
    console.error('updatePastEnvanterLog Hatası:', error);
    return { success: false, message: 'Sunucu bağlantı hatası.' };
  }
};
