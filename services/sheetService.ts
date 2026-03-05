import { SheetConfig, Aircraft, Status, StatusType, DailyStatusCode, OPLItem } from '../types';

/**
 * Durum metinlerini analiz ederek faaliyet kodunu belirler.
 */
export const analyzeStatus = (item: any): { code: DailyStatusCode, interpretation: string } => {
  if (!item) return { code: 'F', interpretation: 'Bilinmeyen durum.' };
  
  const detail = String(item.durumAyrintisi || '').toLocaleLowerCase('tr-TR').trim();
  const desc = String(item.aciklama || '').toLocaleLowerCase('tr-TR').trim();
  const durumStr = String(item.durum || '').toLocaleUpperCase('tr-TR').trim();
  const fullText = `${detail} ${desc}`;

  if (fullText.includes('kaza') || fullText.includes('kırım') || fullText.includes('hasar')) 
    return { code: 'KK', interpretation: 'Kaza/Kırım tespiti.' };

  if (fullText.includes('parça') && (fullText.includes('bekle') || fullText.includes('sipariş'))) {
    return { code: 'PB', interpretation: 'Parça Bekler.' };
  }
  
  if (fullText.includes('bakım') || fullText.includes('yıllık') || fullText.includes('periyodik') || /\b\d+h\b/.test(fullText)) {
    if (fullText.includes('bekliyor') || fullText.includes('sıra')) {
      return { code: 'BB', interpretation: 'Bakım Bekler.' };
    }
    return { code: 'B', interpretation: 'Bakımda.' };
  }

  if (fullText.includes('arıza') || fullText.includes('problem')) 
    return { code: 'A', interpretation: 'Arıza.' };

  const isGayriFaalExplicit = durumStr.includes('GAYRİ') || durumStr.includes('GAYRI') || durumStr.includes('G.FAAL');
  if (isGayriFaalExplicit) return { code: 'X', interpretation: 'Gayrı Faal.' };

  return { code: 'F', interpretation: 'Faal.' };
};

/**
 * Saat değerini HH:mm formatına çevirir
 */
export const formatToHHMM = (totalHours: number | null, aircraftType?: string): string => {
  if (totalHours === null) return '-';
  
  // C-650 Faydalı Saat should be integer
  if (aircraftType === 'C-650') {
    return Math.floor(Math.abs(totalHours)).toString();
  }

  const hours = Math.floor(Math.abs(totalHours));
  const minutes = Math.round((Math.abs(totalHours) - hours) * 60);
  const sign = totalHours < 0 ? '-' : '';
  
  const result = `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  
  // For B-360 and Bell-429, use comma if requested (handled in formatGovdeHour usually)
  return result;
};

/**
 * Hücre değerini sayısal saate çevirir
 */
const parseSingleCellToHour = (val: any, aircraftType: string): number | null => {
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
      
      // AT-802 9:57 (9.95h) correction for date-based durations
      if (aircraftType === 'AT-802') {
        totalHours -= 9.95;
      }

      return totalHours > 0 ? totalHours : null;
    }
  }

  if (typeof val === 'number') {
    if (val <= 0) return null;
    let n = val;
    // AT-802 correction for numeric hours (days or hours)
    if (aircraftType === 'AT-802') {
      if (n < 100) n = n * 24; // If it's days
      n -= 9.95;
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
        
        // AT-802 correction for duration strings
        if (aircraftType === 'AT-802' && total > 10) {
          total -= 9.95;
        }
        
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
      
      // AT-802 correction for numeric strings
      if (aircraftType === 'AT-802' && total > 10) {
        total -= 9.95;
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
  const s = formatValueToString(val);
  if (typeof s === 'string' && s.includes('T') && s.includes('Z')) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('tr-TR');
    }
  }
  return s;
};

export const fetchAircraftDataFromAppsScript = async (url: string, config: SheetConfig): Promise<Partial<Aircraft>[]> => {
  if (!url || !url.startsWith('http')) {
    console.warn(`Geçersiz veya boş Apps Script URL'si (${config.aircraftType}). Lütfen konfigürasyonu kontrol edin.`);
    return [];
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheetId: config.sheetId,
        sheetName: config.sheetName || '',
        mapping: config.mapping,
        action: 'getAircraftData',
        fetchTechnicalDetails: config.aircraftType === 'AT-802'
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    
    const data = result && result.success && Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
    
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
      
      const faydaliRawCells = Array.isArray(item.faydaliSaat) ? item.faydaliSaat.flat(Infinity) : [item.faydaliSaat];
      const validFaydaliHours = faydaliRawCells
        .map(cell => parseSingleCellToHour(cell, config.aircraftType))
        .filter((h): h is number => h !== null);
      const finalMinHour = validFaydaliHours.length > 0 ? Math.min(...validFaydaliHours) : null;
      
      // C-650 Faydalı Saat should be integer
      const hourInt = (config.aircraftType === 'C-650' && finalMinHour !== null) 
        ? Math.floor(finalMinHour) 
        : (finalMinHour !== null ? Math.floor(finalMinHour) : null);

      const govdeStr = formatGovdeHour(item.govdeUcusSaati ?? item.E ?? item.e ?? item[4], config.aircraftType);

      const aircraft: Partial<Aircraft> = {
        kuyrukNo: kuyrukNo,
        cagriKodu: `ORMAN-${kuyrukNo.split('-')[1] || 'XX'}`,
        durum: (analysis.code !== 'F') ? Status.GAYRI_FAAL : Status.FAAL,
        durumTipi: (analysis.code === 'B' || analysis.code === 'BB') ? StatusType.BAKIM : 
                   (analysis.code === 'A' || analysis.code === 'PB') ? StatusType.ARIZA : StatusType.NONE,
        durumAyrintisi: String(item.durumAyrintisi || '-'),
        konum: String(item.konum || 'ANKARA'),
        faydaliSaat: finalMinHour, 
        govdeUcusSaati: govdeStr,
        aciklama: String(item.aciklama || ''),
        guncellemeTarihi: timestamp,
        durumBaslangic: new Date().toISOString().split('T')[0],
        maintenanceHours: [{ bakimTuru: 'KALAN', kalanSaat: hourInt || 0 }],
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
        platformTipi: config.aircraftType === 'Bell-429' ? 'H' : 'S-A',
        tip: config.aircraftType,
        assignedCode: analysis.code,
        aiInterpretation: analysis.interpretation,
        sheetId: config.sheetId,
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
        aircraft.frdsTestDate = formatDateIfISO(item.frdsTestDate);
        aircraft.motorRunDate = formatDateIfISO(item.motorRunDate);
      } else if (config.aircraftType === 'T-70') {
        aircraft.govdeSN = formatValueToString(item.govdeSN);
        aircraft.motor1SN = formatValueToString(item.motor1SN);
        aircraft.motor2SN = formatValueToString(item.motor2SN);
        aircraft.bakim40H = formatGovdeHour(item.bakim40H, config.aircraftType);
        aircraft.bakim120H = formatGovdeHour(item.bakim120H, config.aircraftType);
        aircraft.bakim480H = formatGovdeHour(item.bakim480H, config.aircraftType);
        aircraft.bakimTakvimTarih = formatDateIfISO(item.bakimTakvimTarih);
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
    console.error(`fetchAircraftDataFromAppsScript Hatası:`, error);
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
  if (!scriptUrl || !scriptUrl.startsWith('http')) return [];
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "getOPLData",
        sheetId,
        kuyrukNo
      })
    });

    if (!response.ok) return [];

    const result = await response.json();
    if (!result || !result.success || !Array.isArray(result.data)) return [];

    return result.data;
  } catch (error) {
    console.error("fetchOPLData Hatası:", error);
    return [];
  }
};

export const fetchAircraftSpecificData = async (
  url: string,
  sheetId: string,
  kuyrukNo: string
): Promise<any> => {
  if (!url || !url.startsWith('http')) return { success: false };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
  mapping: any
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'updateAircraftData',
        sheetId,
        kuyrukNo,
        updates,
        mapping
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    return {
      success: result.success || false,
      message: result.message || (result.success ? 'Başarıyla güncellendi.' : 'Güncelleme başarısız.')
    };
  } catch (error) {
    console.error('updateAircraftData Hatası:', error);
    return { success: false, message: 'Sunucu bağlantı hatası.' };
  }
};