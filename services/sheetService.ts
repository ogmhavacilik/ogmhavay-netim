import { SheetConfig, Aircraft, Status, StatusType, DailyStatusCode, OPLItem } from '../types';
import { getCallSignByTail, MOCK_AIRCRAFT, YAKIT_SCRIPT_URL, YAKIT_SHEET_ID, LOG_SCRIPT_URL, MAIL_LOG_SHEET_ID } from '../constants';

/**
 * Durum metinlerini analiz ederek faaliyet kodunu belirler.
 */
export const analyzeStatus = (item: any): { code: DailyStatusCode, interpretation: string } => {
  if (!item) return { code: 'F', interpretation: 'FAAL' };
  
  const getVal = (keys: string[]) => {
    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null && item[key] !== '') return String(item[key]);
    }
    return '';
  };

  const durumStr = (getVal(['durum', 'Durum', 'DURUM', 'N', 'n', 'B', 'b']) || '').toLocaleUpperCase('tr-TR').trim();
  const detail = (getVal(['durumAyrintisi', 'Durum Ayrıntısı', 'DURUM AYRINTISI', 'O', 'o', 'C', 'c', 'durum_ayrintisi']) || '').trim();
  const detailUpper = detail.toLocaleUpperCase('tr-TR');
  const desc = (getVal(['aciklama', 'Açıklama', 'AÇIKLAMA', 'P', 'p', 'D', 'd', 'aciklama']) || '').trim();
  const descUpper = desc.toLocaleUpperCase('tr-TR');

  // Adım 0: KESİN DURUM KONTROLÜ (Eğer FAAL ise öncelikle F veya K dönmeliyiz)
  if (durumStr === 'FAAL' || durumStr === 'F') {
    if (detailUpper.includes('KARMA') || detailUpper.includes('HEM FAAL') || descUpper.includes('KARMA') || descUpper.includes('HEM FAAL')) {
      return { code: 'K', interpretation: 'KARMA GÜN' };
    }
    return { code: 'F', interpretation: 'FAAL' };
  }

  const normalizeTurkish = (str: string): string => {
    return str
      .replace(/İ/g, "I")
      .replace(/ı/g, "I")
      .replace(/Ğ/g, "G")
      .replace(/ğ/g, "G")
      .replace(/Ü/g, "U")
      .replace(/ü/g, "U")
      .replace(/Ş/g, "S")
      .replace(/ş/g, "S")
      .replace(/Ö/g, "O")
      .replace(/ö/g, "O")
      .replace(/Ç/g, "C")
      .replace(/ç/g, "C");
  };

  const findCodeInText = (text: string): { code: DailyStatusCode, interpretation: string } | null => {
    const t = text.toLocaleUpperCase('tr-TR');
    if (!t) return null;
    
    // Normalize string for matching: replace all Turkish accented letters
    const n = normalizeTurkish(t);

    // Exact Code Match (Highest Priority)
    const exactMap: Record<string, { code: DailyStatusCode, interpretation: string }> = {
      'B': { code: 'B', interpretation: 'BAKIM' },
      'BB': { code: 'BB', interpretation: 'BAKIM BEKLER' },
      'TBU': { code: 'TBU', interpretation: 'TEKNİK BÜLTEN UYGULAMASI' },
      'KM': { code: 'KM', interpretation: 'KABUL MUAYENESİ' },
      'A': { code: 'A', interpretation: 'ARIZA' },
      'PB': { code: 'PB', interpretation: 'PARÇA BEKLER' },
      'KK': { code: 'KK', interpretation: 'KAZA KIRIM' },
      'X': { code: 'X', interpretation: 'OLMADIĞI GÜNLER' },
      'TB': { code: 'TB', interpretation: 'TECRÜBE BEKLER' }
    };

    if (exactMap[t]) return exactMap[t];

    // Keyword Match - Use Normalized version 'n'
    if (n.includes('TEKNIK BULTEN') || n.includes('TBU')) return { code: 'TBU', interpretation: 'TEKNİK BÜLTEN UYGULAMASI' };
    if (n.includes('BAKIM BEKLER') || n === 'BB') return { code: 'BB', interpretation: 'BAKIM BEKLER' };
    if (n.includes('BAKIM')) return { code: 'B', interpretation: 'BAKIM' };
    if (n.includes('PARCA BEKLER') || n === 'PB') return { code: 'PB', interpretation: 'PARÇA BEKLER' };
    if (n.includes('TECRUBE BEKLER') || n === 'TB' || n.includes('TECRUBE') || n.includes('TEST')) return { code: 'TB', interpretation: 'TECRÜBE BEKLER' };
    if (n.includes('KABUL MUAYENE') || n === 'KM') return { code: 'KM', interpretation: 'KABUL MUAYENESİ' };
    if (n.includes('KAZA KIRIM') || n === 'KK') return { code: 'KK', interpretation: 'KAZA KIRIM' };
    if (n.includes('OLMADIGI GUNLER') || n === 'X') return { code: 'X', interpretation: 'OLMADIĞI GÜNLER' };
    if (n.includes('ARIZA') || n.includes('ARZ') || n === 'A' || n.includes('OVERSPEED') || n.includes('NG')) return { code: 'A', interpretation: 'ARIZA' };
    
    return null;
  };

  // Adım 1: Durum Ayrıntısı (DURUM_AYRINTISI) - ÖNCELİKLİ
  const detailMatch = findCodeInText(detail);
  if (detailMatch) return detailMatch;

  // Adım 2: Durum (DURUM)
  const durumMatch = findCodeInText(durumStr);
  if (durumMatch) return durumMatch;

  const isGayriFaalStatus = durumStr.includes('GAYRİ') || durumStr.includes('GAYRI') || durumStr.includes('GF') || durumStr === 'G.FAAL' || durumStr.includes('ARIZA') || durumStr.includes('ARZ') || durumStr === 'A';
  if (isGayriFaalStatus) {
    return { code: 'A', interpretation: 'ARIZA' };
  }

  // Adım 3: Açıklama (ACIKLAMA)
  const descMatch = findCodeInText(desc);
  if (descMatch) return descMatch;

  // Adım 4: Karma Kontrolü
  if (detailUpper.includes('KARMA') || detailUpper.includes('HEM FAAL') || descUpper.includes('KARMA') || descUpper.includes('HEM FAAL')) {
    return { code: 'K', interpretation: 'KARMA GÜN' };
  }

  return { code: 'F', interpretation: 'FAAL' };
};

/**
 * Saat değerini HH:mm formatına çevirir
 */
export const formatToHHMM = (totalHours: number | null, aircraftType?: string): string => {
  if (totalHours === null) return '-';
  
  // Specific types should remain as decimal (with comma) for both Useful Hours and Airframe Hours
  const cleanTip = (aircraftType || '').toUpperCase().replace(/[\s-]/g, '');
  if (cleanTip.includes('B360') || cleanTip.includes('C650') || cleanTip.includes('BELL') || cleanTip.includes('B429')) {
    // Preserve at least 1, up to 2 decimal places to respect "ham veri" (raw data) as requested.
    let s = totalHours.toFixed(2);
    if (s.endsWith('.00')) {
      s = totalHours.toFixed(1);
    } else if (s.endsWith('0')) {
      s = totalHours.toFixed(1);
    }
    return s.replace('.', ',');
  }
  
  // Standard conversion for others: convert decimals (e.g. 1692.5) to HH:mm format (1692:30)
  const positiveHours = Math.abs(totalHours);
  const hours = Math.floor(positiveHours);
  // Using Math.round to avoid 5:59 due to floating point precision issues (e.g. 0.999999)
  const minutes = Math.round((positiveHours - hours) * 60);
  
  const finalHours = minutes === 60 ? hours + 1 : hours;
  const finalMinutes = minutes === 60 ? 0 : minutes;
  
  const sign = totalHours < 0 ? '-' : '';
  
  return `${sign}${finalHours}:${finalMinutes.toString().padStart(2, '0')}`;
};

/**
 * Hücre değerini sayısal saate çevirir
 */
export const parseSingleCellToHour = (val: any, aircraftType: string): number | null => {
  if (val === undefined || val === null || val === "" || val === "0" || val === "00:00") return null;

  // 1. Handle ISO string from Sheets duration (e.g. 1900-01-05T13:53:04.000Z)
  if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
    const s = val.trim();
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const y = parseInt(match[1]);
      const m = parseInt(match[2]);
      const d = parseInt(match[3]);
      const hh = parseInt(match[4]);
      const mm = parseInt(match[5]);
      const ss = parseInt(match[6]);

      let totalDays = 0;
      const isLeap = (yr: number) => (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);
      const daysInMonth = (month: number, year: number) => {
        if (month === 2) return isLeap(year) ? 29 : 28;
        if ([4, 6, 9, 11].includes(month)) return 30;
        return 31;
      };

      if (y === 1899 && m === 12) {
        totalDays = d - 30;
      } else if (y >= 1900) {
        totalDays = 1; // Dec 31 1899
        for (let yr = 1900; yr < y; yr++) {
          totalDays += isLeap(yr) ? 366 : 365;
          if (yr === 1900) totalDays += 1;
        }
        for (let mon = 1; mon < m; mon++) {
          totalDays += daysInMonth(mon, y);
        }
        totalDays += d;
        if (y === 1900 && m > 2) totalDays += 1;
      }
      
      return totalDays * 24 + hh + mm / 60 + ss / 3600;
    }
  }

  // 2. Handle number (could be fraction of days or absolute hours)
  if (typeof val === 'number') {
    if (val <= 0) return null;
    let n = val;

    const cleanTip = (aircraftType || '').toUpperCase().replace(/[\s-]/g, '');
    const isDecimalType = cleanTip.includes('B360') || 
                          cleanTip.includes('C650') || 
                          cleanTip.includes('BELL') ||
                          cleanTip.includes('B429');

    // Heuristic: If it's a small decimal fraction (0 < n < 1), it's likely a day fraction (time of day)
    // If it's > 400 it's likely absolute hours. 
    // BUT some maintenance intervals are short (e.g. 40, 100).
    // Let's use a smarter check: if it comes from a sheet where duration is used, we usually get a fraction.
    if (n > 0 && n < 400 && n % 1 !== 0 && !isDecimalType) {
       // Only convert if it doesn't look like a manual decimal entry (e.g. 1.1 might be 1.1 hours or 1.1 days?)
       // Actually most absolute hours in these logs are either integers or specific decimals like .1, .2, .5
       // Day fractions from Sheets usually have many decimal places.
       const s = String(n);
       if (s.split('.')[1]?.length > 4) {
         n = n * 24;
       }
    }
    return n;
  }

  // 3. Handle string (HH:mm or decimal with comma/dot)
  if (typeof val === 'string') {
    let s = val.trim();
    if (s === '-' || s === '0' || s === '00:00' || s === 'N/A') return null;

    if (s.includes(':')) {
      const parts = s.split(':').map(Number);
      if (parts.length >= 2) {
        return (parts[0] || 0) + (parts[1] || 0) / 60 + (parts[2] || 0) / 3600;
      }
    }

    // Replace Turkish separators: 1.728,5 -> 1728.5
    if (s.includes('.') && s.includes(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.includes(',')) {
      s = s.replace(',', '.');
    }

    const n = parseFloat(s);
    if (!isNaN(n)) return n;
  }

  return null;
};

export const formatGovdeHour = (val: any, aircraftType: string): string => {
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
  
  if (val instanceof Date) {
    const d = val;
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }
  }

  const s = formatValueToString(val);
  if (s === '-' || s === '') return '-';
  
  // If it's already in DD.MM.YYYY format, return it
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;
  
  // Handle YYYY-MM-DD (optionally with time)
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  }

  // Handle DD.MM.YYYY HH:mm:ss
  const dotMatch = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (dotMatch) {
    return `${dotMatch[1]}.${dotMatch[2]}.${dotMatch[3]}`;
  }

  // Handle MM/DD/YYYY or DD/MM/YYYY
  if (s.includes('/')) {
    const parts = s.split(' ')[0].split('/');
    if (parts.length === 3) {
      let day, month, year;
      if (parts[2].length === 4) { // month/day/year
        month = parts[0].padStart(2, '0');
        day = parts[1].padStart(2, '0');
        year = parts[2];
      } else { // day/month/year?
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2];
      }

      if (parseInt(month) > 12) { // swap if it looks like dd/mm
        const tmp = month;
        month = day;
        day = tmp;
      }
      return `${day}.${month}.${year}`;
    }
  }

  if (s.includes('T') && s.includes('Z')) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }
  }

  return s;
};

export const proxyFetch = async (url: string, body: any, options?: { method?: 'GET' | 'POST' }) => {
  const method = options?.method || 'POST';
  // 1. Try local proxy first (AI Studio environment)
  // This is preferred in AI Studio to avoid CORS and handle redirects server-side
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, body, method }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
    // If it's a 404, we are likely on Netlify/Vercel without the backend
    if (response.status === 404) {
      console.log('Proxy endpoint not found (likely on Netlify), falling back to direct fetch.');
    } else {
      console.warn(`Proxy returned error ${response.status}, falling back to direct fetch.`);
    }
  } catch (error) {
    // console.log('Local proxy call failed, will try direct fetch.');
  }

  // 2. Fallback to direct fetch (Netlify/Production environment)
  try {
    let targetUrl = url.trim();
    let fetchOpts: RequestInit = { redirect: 'follow' };

    if (method === 'GET') {
      fetchOpts.method = 'GET';
      if (body && typeof body === 'object') {
        const params = new URLSearchParams();
        Object.keys(body).forEach(k => {
          if (body[k] !== undefined && body[k] !== null) params.append(k, String(body[k]));
        });
        targetUrl = targetUrl.includes('?') ? `${targetUrl}&${params.toString()}` : `${targetUrl}?${params.toString()}`;
      }
    } else {
      fetchOpts.method = 'POST';
      fetchOpts.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
      fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(targetUrl, fetchOpts);

    if (!response.ok) {
      throw new Error(`Direct Fetch HTTP ${response.status}`);
    }

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return json;
    } catch (e) {
      return text;
    }
  } catch (error) {
    console.error('Direct Fetch Error (Netlify Fallback):', error);
    throw error;
  }
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
    const result = await proxyFetch(cleanUrl, {
      sheetId: config.sheetId,
      sheetName: config.sheetName || '',
      mapping: config.mapping,
      action: 'getAircraftData',
      fetchTechnicalDetails: config.aircraftType === 'AT-802'
    });
    
    const data = (result && (result.success || result.status === 'success') && Array.isArray(result.data)) 
      ? result.data 
      : (Array.isArray(result) ? result : []);
    
    if (data.length === 0) return [];

    // AT-802 için Geliş Tarihi eşleştirme haritası oluştur - Artık sunucu tarafındaki lookup'ı doğrudan kullandığımız için bu haritaya gerek kalmadı
    const arrivalMap = new Map<string, string>();

    const now = new Date();
    const timestamp = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return data.map((item: any): Partial<Aircraft> | null => {
      if (!item || typeof item !== 'object') return null;
      const analysis = analyzeStatus(item);
      let kuyrukNo = String(item.kuyrukNo || '').trim();
      
      // Clean tail number to remove model numbers and Spanish tescil (ignore parenthetical additions)
      const orMatch = kuyrukNo.match(/OR-\d+/i);
      if (orMatch && config.aircraftType === 'AT-802') {
        kuyrukNo = orMatch[0].toUpperCase();
      }
      
      const cleanKuyrukNo = kuyrukNo.toUpperCase();
      
      let finalMinHour: number | null = null;
      let maintenanceHours: { bakimTuru: string, kalanSaat: number }[] = [];

      if (config.aircraftType === 'T-70') {
        const h40 = parseSingleCellToHour(item.bakim40H, 'T-70');
        const h120 = parseSingleCellToHour(item.bakim120H, 'T-70');
        const h480 = parseSingleCellToHour(item.bakim480H, 'T-70');
        const k40 = parseSingleCellToHour(item.bakim40HKalan, 'T-70');
        const k120 = parseSingleCellToHour(item.bakim120HKalan, 'T-70');
        const k480 = parseSingleCellToHour(item.bakim480HKalan, 'T-70');
        
        // finalMinHour should only consider remaining hours (Kalan Saat)
        const validKalanHours = [k40, k120, k480].filter((h): h is number => h !== null);
        finalMinHour = validKalanHours.length > 0 ? Math.min(...validKalanHours) : null;
        
        maintenanceHours = [
          { bakimTuru: 'Bakıma Kalan Saat (40 Saat)', kalanSaat: k40 ?? 0 },
          { bakimTuru: 'Bakıma Kalan Saat (120 Saat)', kalanSaat: k120 ?? 0 },
          { bakimTuru: 'Bakıma Kalan Saat (480 Saat)', kalanSaat: k480 ?? 0 }
        ];
      } else {
        const faydaliRawCells = Array.isArray(item.faydaliSaat) ? item.faydaliSaat.flat(Infinity) : [item.faydaliSaat];
        const validFaydaliHours = faydaliRawCells
          .map(cell => parseSingleCellToHour(cell, config.aircraftType))
          .filter((h): h is number => h !== null);
        finalMinHour = validFaydaliHours.length > 0 ? Math.min(...validFaydaliHours) : null;
        
        // Use decimal for specific types, floor for others (like T-70 if not specified otherwise)
        const isDecimalType = config.aircraftType === 'B-360' || config.aircraftType === 'C-650' || config.aircraftType === 'Bell-429';
        const displayHour = (isDecimalType && finalMinHour !== null) 
          ? finalMinHour 
          : (finalMinHour !== null ? Math.floor(finalMinHour) : null);
          
        maintenanceHours = [{ bakimTuru: 'KALAN', kalanSaat: displayHour || 0 }];
      }

      const parsedGovde = parseSingleCellToHour(item.govdeUcusSaati ?? item.E ?? item.e ?? item[4], config.aircraftType);
      const govdeStr = formatGovdeHour(item.govdeUcusSaati ?? item.E ?? item.e ?? item[4], config.aircraftType);

      const aircraft: Partial<Aircraft> = {
        kuyrukNo: kuyrukNo,
        cagriKodu: getCallSignByTail(kuyrukNo),
        durum: (analysis.code !== 'F') ? Status.GAYRI_FAAL : Status.FAAL,
        durumTipi: (analysis.code === 'B' || analysis.code === 'BB' || analysis.code === 'TBU' || analysis.code === 'KM') ? StatusType.BAKIM : 
                   (analysis.code === 'A' || analysis.code === 'PB') ? StatusType.ARIZA : StatusType.NONE,
        durumAyrintisi: String(item.durumAyrintisi || '-'),
        konum: String(item.konum || 'ANKARA'),
        faydaliSaat: finalMinHour, 
        govdeUcusSaati: govdeStr,
        govdeUcusSaatiRaw: parsedGovde,
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
          if (cleanKuyrukNo === 'OR-2030') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7owB3R6Jnw61F9UDe7ww_vma77LjceWkpGA&s'];
          if (cleanKuyrukNo === 'OR-2031') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7owB3R6Jnw61F9UDe7ww_vma77LjceWkpGA&s'];
          if (cleanKuyrukNo === 'OR-2039') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7owB3R6Jnw61F9UDe7ww_vma77LjceWkpGA&s'];
          if (cleanKuyrukNo === 'OR-2040') return ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7owB3R6Jnw61F9UDe7ww_vma77LjceWkpGA&s'];



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
             if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031', 'OR-2039', 'OR-2040'].includes(tail)) return 'SA';
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
        gelisTarihi: (function() {
          const mockAc = MOCK_AIRCRAFT.find(a => a.kuyrukNo === kuyrukNo);
          if (mockAc && mockAc.gelisTarihi && mockAc.gelisTarihi !== '-') {
            return mockAc.gelisTarihi;
          }
          return item.gelisTarihi ? formatDateIfISO(item.gelisTarihi) : '-';
        })()
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
        aircraft.engineStarts = formatValueToString(item.starts || item.engineStarts);
        aircraft.engineFlights = formatValueToString(item.flights || item.engineFlights);
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
        aircraft.bakimTakvimTarih = formatDateIfISO(item.bakimTakvimTarih);
        
        // T-70 bakıma kalan saatlerin en küçüğünü hesapla
        const k40 = formatGovdeHour(item.bakim40HKalan, 'T-70');
        const k120 = formatGovdeHour(item.bakim120HKalan, 'T-70');
        const k480 = formatGovdeHour(item.bakim480HKalan, 'T-70');
        
        const parseToMins = (val: string) => {
          if (!val || val === '-' || val === 'N/A') return null;
          const parts = val.split(':').map(Number);
          if (parts.length < 2) return null;
          return parts[0] * 60 + parts[1];
        };
        
        const m40 = parseToMins(k40);
        const m120 = parseToMins(k120);
        const m480 = parseToMins(k480);
        
        const validMins = [m40, m120, m480].filter((v): v is number => v !== null);
        
        if (validMins.some(m => m === 0)) {
          aircraft.bakimKalanSaat = "0:00";
          aircraft.faydaliSaat = 0;
        } else if (validMins.length > 0) {
          const minMins = Math.min(...validMins);
          const hh = Math.floor(minMins / 60);
          const mm = minMins % 60;
          aircraft.bakimKalanSaat = `${hh}:${mm.toString().padStart(2, '0')}`;
          aircraft.faydaliSaat = minMins / 60;
        } else {
          aircraft.bakimKalanSaat = formatValueToString(item.bakimKalanSaat);
          aircraft.faydaliSaat = aircraft.bakimKalanSaat && aircraft.bakimKalanSaat !== '-' ? (parseToMins(aircraft.bakimKalanSaat) || 0) / 60 : null;
        }
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
    const result = await proxyFetch(cleanUrl, {
      action: "getOPLData",
      sheetId,
      kuyrukNo
    });

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
    return await proxyFetch(cleanUrl, {
      action: 'getAircraftSpecificData',
      sheetId,
      kuyrukNo
    });
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
    const result = await proxyFetch(cleanUrl, {
      action: 'updateAircraftData',
      sheetId,
      sheetName,
      kuyrukNo,
      updates,
      mapping,
      aircraftType
    });
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
  newHours: string,
  tip?: string,
  konum?: string,
  durum?: string,
  durumAyrintisi?: string,
  aciklama?: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = url?.trim();
  if (!cleanUrl || !cleanUrl.includes('script.google.com/macros/')) return { success: false, message: 'Geçersiz URL formatı.' };
  try {
    const result = await proxyFetch(cleanUrl, {
      action: 'updatePastEnvanterLog',
      sheetId,
      kuyrukNo,
      date,
      newHours,
      tip,
      konum,
      durum,
      durumAyrintisi,
      aciklama
    });
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

export interface YakitKaydi {
  tarih: string;
  kuyrukNo: string;
  miktar: number;
  ikmalYeri?: string;
  aciklama?: string;
  faturaNo?: string;
}

export const parseCSV = (csvText: string): string[][] => {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/);
  const rows: string[][] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.trim().replace(/^"|"$/g, ''));
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim().replace(/^"|"$/g, ''));
    rows.push(row);
  }
  return rows;
};

export const fetchYakitData = async (): Promise<YakitKaydi[]> => {
  try {
    const scriptUrls = [YAKIT_SCRIPT_URL, LOG_SCRIPT_URL];
    const actions = ["onGetAdminPanelData", "getYakitData", "getFaaliyetLog", "getLogs", "getFuelData", "getAircraftData", "getData", "read"];
    const sheetNames = ["yakıt kayıtları verisi", "yakit kayitlari verisi", "yakit", ""];

    let rawList: any[] = [];

    const extractList = (res: any): any[] => {
      if (!res) return [];
      if (typeof res === 'string') {
        try {
          const parsed = JSON.parse(res);
          const sub = extractList(parsed);
          if (sub.length > 0) return sub;
        } catch (e) {
          if (res.includes(',') || res.includes('\n')) {
            const parsed = parseCSV(res);
            if (parsed.length > 0) return parsed;
          }
        }
      }
      if (Array.isArray(res)) return res;
      if (res.data) {
        if (Array.isArray(res.data)) return res.data;
        if (typeof res.data === 'string') {
          try {
            const parsed = JSON.parse(res.data);
            const sub = extractList(parsed);
            if (sub.length > 0) return sub;
          } catch (e) {
            const parsed = parseCSV(res.data);
            if (parsed.length > 0) return parsed;
          }
        }
        if (typeof res.data === 'object') {
          if (Array.isArray(res.data.fuelRecords)) return res.data.fuelRecords;
          if (Array.isArray(res.data.yakitKayitlari)) return res.data.yakitKayitlari;
          if (Array.isArray(res.data.envanterLog)) return res.data.envanterLog;
          if (Array.isArray(res.data.data)) return res.data.data;
          if (Array.isArray(res.data.rows)) return res.data.rows;
          if (Array.isArray(res.data.records)) return res.data.records;
          if (Array.isArray(res.data.items)) return res.data.items;
          if (Array.isArray(res.data.logs)) return res.data.logs;
          const vals = Object.values(res.data);
          for (const v of vals) {
            if (Array.isArray(v) && v.length > 0) return v;
          }
        }
      }
      if (Array.isArray(res.fuelRecords)) return res.fuelRecords;
      if (Array.isArray(res.yakitKayitlari)) return res.yakitKayitlari;
      if (Array.isArray(res.envanterLog)) return res.envanterLog;
      if (Array.isArray(res.logs)) return res.logs;
      if (Array.isArray(res.rows)) return res.rows;
      if (Array.isArray(res.records)) return res.records;
      return [];
    };

    // 1. First priority: POST onGetAdminPanelData
    try {
      const pData = await proxyFetch(YAKIT_SCRIPT_URL, { action: "onGetAdminPanelData", payload: null }, { method: 'POST' });
      const list = extractList(pData);
      if (list && list.length > 0) {
        rawList = list;
      }
    } catch (e) {
      // fallback
    }

    // 2. Try POST requests across URLs and actions
    if (rawList.length === 0) {
      for (const url of scriptUrls) {
        if (rawList.length > 0) break;
        for (const action of actions) {
          if (rawList.length > 0) break;
          for (const sName of sheetNames) {
            try {
              const body: any = { action, sheetId: YAKIT_SHEET_ID };
              if (sName) body.sheetName = sName;
              const result = await proxyFetch(url, body, { method: 'POST' });
              const list = extractList(result);
              if (list && list.length > 0) {
                rawList = list;
                break;
              }
            } catch (e) {
              // continue
            }
          }
        }
      }
    }

    // 3. Try GET requests if POST yielded nothing
    if (rawList.length === 0) {
      for (const url of scriptUrls) {
        if (rawList.length > 0) break;
        for (const action of actions) {
          try {
            const result = await proxyFetch(url, { action, sheetId: YAKIT_SHEET_ID, sheetName: "yakıt kayıtları verisi" }, { method: 'GET' });
            const list = extractList(result);
            if (list && list.length > 0) {
              rawList = list;
              break;
            }
          } catch (e) {
            // continue
          }
        }
      }
    }

    // 4. Try direct Google Sheets CSV export URLs
    if (rawList.length === 0) {
      const sheetIdsToTry = [YAKIT_SHEET_ID, "1ifdtoxjdr1U0YmDeeByBEpHbLwEa7OTMoTLbm97WDq", MAIL_LOG_SHEET_ID];
      for (const sheetId of sheetIdsToTry) {
        if (!sheetId) continue;
        if (rawList.length > 0) break;
        const csvUrls = [
          `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
          `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
        ];
        for (const csvUrl of csvUrls) {
          if (rawList.length > 0) break;
          try {
            const result = await proxyFetch(csvUrl, {}, { method: 'GET' });
            const list = extractList(result);
            if (list && list.length > 0) {
              rawList = list;
              break;
            }
          } catch (e) {
            // continue
          }
        }
      }
    }

    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    const parseFuelAmount = (val: any): number => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      let s = String(val).trim();
      if (!s || s === '-') return 0;
      if (s.includes(',') && s.includes('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else if (s.includes(',')) {
        s = s.replace(',', '.');
      }
      const num = parseFloat(s);
      return isNaN(num) ? 0 : num;
    };

    const items: YakitKaydi[] = rawList.map((row: any) => {
      if (!row) return null;

      if (Array.isArray(row)) {
        let rawTarih = '';
        let faturaNo = '';
        let rawMiktar: any = 0;
        let kNo = '';
        let ikmalYeri = '';
        let aciklama = '';

        if (row.length >= 6) {
          rawTarih = String(row[0] || '').trim();
          faturaNo = String(row[2] || '').trim();
          rawMiktar = row[4];
          kNo = String(row[5] || '').trim();
          ikmalYeri = String(row[10] || row[9] || '').trim();
          aciklama = String(row[6] || row[1] || '').trim();
        }

        if (!kNo || (!kNo.includes('OR-') && !kNo.includes('ORMAN') && !kNo.includes('TC-'))) {
          for (const cell of row) {
            const sCell = String(cell || '').trim();
            const match = sCell.match(/\b(OR-\d{4}|ORMAN-\d{2,4}|TC-[A-Z0-9]{3,5})\b/i);
            if (match) {
              kNo = match[0].toUpperCase();
              break;
            }
          }
        }

        if (!rawTarih || !/\d/.test(rawTarih)) {
          for (const cell of row) {
            const sCell = String(cell || '').trim();
            if ((sCell.includes('-') || sCell.includes('.') || sCell.includes('/')) && /\d{2,4}/.test(sCell) && !sCell.includes('ID-') && !sCell.includes('OGM')) {
              rawTarih = sCell;
              break;
            }
          }
        }

        return {
          tarih: rawTarih,
          kuyrukNo: kNo,
          miktar: parseFuelAmount(rawMiktar),
          ikmalYeri,
          aciklama,
          faturaNo
        };
      }

      const getVal = (keys: string[]) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
        }
        const rowKeys = Object.keys(row || {});
        for (const k of keys) {
          const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          const foundKey = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === normK);
          if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
            return row[foundKey];
          }
        }
        return '';
      };

      let kNo = String(getVal([
        'kuyrukNo', 'Kuyruk Numarası', 'KUYRUK NUMARASI', 'Kuyruk No', 'KUYRUK NO',
        'kuyruk_numarasi', 'kuyruk_no', 'tailNumber', 'Hava Aracı', 'HAVA ARACI',
        'Kuyruk', 'kuyruk', 'CagriKodu', 'Çağrı Kodu', 'ÇAGRİ KODU', 'TAIL', 'Tail',
        'F', 'f', '5'
      ]) || '').trim();

      if (!kNo || (!kNo.includes('OR-') && !kNo.includes('ORMAN') && !kNo.includes('TC-'))) {
        for (const val of Object.values(row)) {
          if (val && typeof val === 'string') {
            const match = val.match(/\b(OR-\d{4}|ORMAN-\d{2,4}|TC-[A-Z0-9]{3,5})\b/i);
            if (match) {
              kNo = match[0].toUpperCase();
              break;
            }
          }
        }
      }

      const rawTarih = String(getVal([
        'tarih', 'Tarih', 'TARİH', 'date', 'Date', 'İkmal Tarihi', 'İKMAL TARİHİ',
        'TARIH', 'Tarihi', 'A', 'a', '0'
      ]) || '').trim();

      const rawMiktar = getVal([
        'yakitMiktari', 'Yakıt Miktarı (lt)', 'Yakıt Miktarı(lt)', 'Yakıt Miktarı',
        'YAKIT MİKTARI (LT)', 'YAKIT MİKTARI', 'miktar', 'Miktar', 'MİKTAR',
        'litre', 'Litre', 'LT', 'Lt', 'yakit', 'Yakıt', 'Miktarı', 'YAKIT',
        'Alınan Yakıt', 'ALINAN YAKIT', 'E', 'e', '4'
      ]);

      const ikmalYeri = String(getVal([
        'ikmalYeri', 'İkmal Konumu', 'İKMAL KONUMU', 'İkmal Yeri', 'İKMAL YERİ',
        'İkmal Tipi', 'konum', 'Konum', 'İkmal Noktası', 'İstasyon', 'istasyon', 'Yeri',
        'K', 'k', '10', 'J', 'j', '9'
      ]) || '').trim();

      const aciklama = String(getVal([
        'aciklama', 'Açıklama', 'AÇIKLAMA', 'Personel Adı', 'Kayıt Tipi', 'not',
        'Not', 'NOT', 'detay', 'Detay', 'G', 'g', '6'
      ]) || '').trim();

      const faturaNo = String(getVal([
        'faturaNo', 'Makbuz Numarası', 'MAKBUZ NUMARASI', 'Makbuz No', 'Fatura No',
        'FATURA NO', 'fişNo', 'Fiş No', 'Belge No', 'Fiş/Fatura', 'C', 'c', '2'
      ]) || '').trim();

      const res: YakitKaydi = {
        tarih: rawTarih,
        kuyrukNo: kNo,
        miktar: parseFuelAmount(rawMiktar),
        ikmalYeri,
        aciklama,
        faturaNo
      };
      return res;
    }).filter((item): item is YakitKaydi => item !== null && item.miktar > 0);

    return items;
  } catch (err) {
    console.error("fetchYakitData error:", err);
    return [];
  }
};
