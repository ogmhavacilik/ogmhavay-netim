import { Aircraft, YoklamaPerson, AttendanceRecord, AircraftCrewInfo } from '../types';
import { PILOT_YOKLAMA_SCRIPT_URL, TEKNISYEN_YOKLAMA_SCRIPT_URL } from '../constants';
import { proxyFetch } from './sheetService';
import initialPersonnelData from '../src/data/yoklamaInitialPersonnel.json';
import initialAttendanceData from '../src/data/yoklamaInitialAttendance.json';

// In-memory store separated by group to guarantee that one group never overwrites or wipes the other
let cachedPilots: YoklamaPerson[] = [];
let cachedTechs: YoklamaPerson[] = [];
let cachedPilotAttendance: AttendanceRecord[] = [];
let cachedTechAttendance: AttendanceRecord[] = [];

let cachedPersonnel: YoklamaPerson[] = [];
let cachedAttendance: AttendanceRecord[] = [];
let attendanceByPersonMap = new Map<string, AttendanceRecord[]>();

let isSyncing = false;
let lastSyncTime = 0;

const rebuildAttendanceIndex = () => {
  const map = new Map<string, AttendanceRecord[]>();
  for (let i = 0; i < cachedAttendance.length; i++) {
    const att = cachedAttendance[i];
    if (!att.personId) continue;
    let list = map.get(att.personId);
    if (!list) {
      list = [];
      map.set(att.personId, list);
    }
    list.push(att);
  }
  attendanceByPersonMap = map;
};

const listeners: Array<() => void> = [];

export const addYoklamaListener = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const notifyListeners = () => {
  listeners.forEach(cb => {
    try { cb(); } catch (e) { console.error('Yoklama listener error:', e); }
  });
};

export const getCachedPersonnel = (): YoklamaPerson[] => cachedPersonnel;
export const getCachedAttendance = (): AttendanceRecord[] => cachedAttendance;

/**
 * Normalizes an aircraft model string to one of the 5 standard units:
 * B-360, C-650, AT-802, BELL-429, T-70
 */
export const normalizeAircraftUnit = (tip?: string): string => {
  if (!tip) return '';
  const clean = tip.toLocaleUpperCase('tr-TR').replace(/[\s-_]/g, '');
  if (clean.includes('360') || clean.includes('KINGAIR')) return 'B-360';
  if (clean.includes('650') || clean.includes('CITATION')) return 'C-650';
  if (clean.includes('802') || clean.includes('AIRTRACTOR')) return 'AT-802';
  if (clean.includes('429') || clean.includes('BELL')) return 'BELL-429';
  if (clean.includes('70') || clean.includes('SIKORSKY')) return 'T-70';
  return tip.trim().toLocaleUpperCase('tr-TR');
};

/**
 * Normalizes location / city names for Turkish comparison
 */
export const normalizeCityName = (city?: string): string => {
  if (!city) return '';
  const c = city.toLocaleUpperCase('tr-TR').trim();
  
  // Muğla ve İstasyonları (Bodrum, Güvercinlik, Fethiye, Yanıklar, Milas, Dalaman, vb.)
  if (
    c.includes('MUĞLA') || c.includes('MUGLA') ||
    c.includes('GÜVERCİNLİK') || c.includes('GUVERCINLIK') ||
    c.includes('BODRUM') ||
    c.includes('YANIKLAR') ||
    c.includes('FETHİYE') || c.includes('FETHIYE') ||
    c.includes('MİLAS') || c.includes('MILAS') ||
    c.includes('DALAMAN') || c.includes('MARMARİS') || c.includes('MARMARIS') ||
    c.includes('KÖYCEĞİZ') || c.includes('KOYCEGIZ') || c.includes('YATAĞAN') || c.includes('YATAGAN')
  ) {
    return 'MUĞLA';
  }

  // Antalya ve İstasyonları (Karain, Gazipaşa, Alanya, Manavgat, vb.)
  if (
    c.includes('ANTALYA') ||
    c.includes('KARAİN') || c.includes('KARAIN') ||
    c.includes('GAZİPAŞA') || c.includes('GAZIPASA') ||
    c.includes('ALANYA') || c.includes('MANAVGAT') || c.includes('KUMLUCA')
  ) {
    return 'ANTALYA';
  }

  // İzmir ve İstasyonları (Selçuk, Gaziemir, Menderes, Çiğli, Çeşme, vb.)
  if (
    c.includes('İZMİR') || c.includes('IZMIR') ||
    c.includes('SELÇUK') || c.includes('SELCUK') ||
    c.includes('GAZİEMİR') || c.includes('GAZIEMIR') ||
    c.includes('MENDERES') || c.includes('ÇİĞLİ') || c.includes('CIGLI') ||
    c.includes('ÇEŞME') || c.includes('CESME')
  ) {
    return 'İZMİR';
  }

  // Çanakkale ve İstasyonları (Dardanos, Gökçeada, Bozcaada, Ezine, vb.)
  if (
    c.includes('ÇANAKKALE') || c.includes('CANAKKALE') ||
    c.includes('DARDANOS') || c.includes('GÖKÇEADA') || c.includes('GOKCEADA') ||
    c.includes('BOZCAADA') || c.includes('EZİNE') || c.includes('EZINE')
  ) {
    return 'ÇANAKKALE';
  }

  // Ankara ve Meydanları
  if (
    c.includes('ANKARA') ||
    c.includes('ETİMESGUT') || c.includes('ETIMESGUT') ||
    c.includes('ESENBOĞA') || c.includes('ESENBOGA') ||
    c.includes('GÖLBAŞI') || c.includes('GOLBASI') ||
    c.includes('TEMELLİ') || c.includes('TEMELLI')
  ) {
    return 'ANKARA';
  }

  if (c.includes('ADANA')) return 'ADANA';
  if (c.includes('DENİZLİ') || c.includes('DENIZLI')) return 'DENİZLİ';
  if (c.includes('BURSA')) return 'BURSA';
  if (c.includes('BALIKESİR') || c.includes('BALIKESIR')) return 'BALIKESİR';
  if (c.includes('ESKİŞEHİR') || c.includes('ESKISEHIR')) return 'ESKİŞEHİR';
  if (c.includes('KAHRAMANMARAŞ') || c.includes('MARAS') || c.includes('MARAŞ')) return 'KAHRAMANMARAŞ';

  let base = c;
  if (base.includes('/')) base = base.split('/')[0].trim();
  if (base.includes('(')) base = base.split('(')[0].trim();
  return base;
};

/**
 * Maps and assigns personnel unit & role, including explicit user exceptions:
 * 1. Murat Akmeşe (Teknisyen yönetim grubunda ama C-650 Pilotudur)
 * 2. Alper Özmetin (Yönetim biriminde ama C-650 Birimidir)
 * 3. Tezcan Güzer (B-360 ekibidir)
 */
export const mapPersonData = (raw: any, sourceType: 'pilot' | 'teknisyen'): YoklamaPerson => {
  const fullName = String(raw.fullName || raw.adSoyad || raw.name || '').trim();
  const upperName = fullName.toLocaleUpperCase('tr-TR');
  const titleRaw = String(raw.title || raw.unvan || '').trim();
  const upperTitle = titleRaw.toLocaleUpperCase('tr-TR');
  const roleRaw = String(raw.role || (sourceType === 'pilot' ? 'Pilot' : 'Teknisyen')).trim();
  const upperRole = roleRaw.toLocaleUpperCase('tr-TR');

  let unit = 'DİĞER';
  let role = sourceType === 'pilot' ? 'Pilot' : 'Teknisyen';

  // --- ÖZEL İSTİSNALAR (Kullanıcı Direktifleri) ---
  if (upperName.includes('MURAT AKMEŞE') || upperName.includes('MURAT AKMESE')) {
    unit = 'C-650';
    role = 'Pilot';
  } else if (upperName.includes('ALPER ÖZMETİN') || upperName.includes('ALPER OZMETIN')) {
    unit = 'C-650';
    role = 'Teknisyen';
  } else if (upperName.includes('TEZCAN GÜZER') || upperName.includes('TEZCAN GUZER')) {
    unit = 'B-360';
    role = 'Teknisyen';
  } else {
    // Standart Birim Tespiti
    if (upperTitle.includes('B-360') || upperTitle.includes('B360')) unit = 'B-360';
    else if (upperTitle.includes('C-650') || upperTitle.includes('C650')) unit = 'C-650';
    else if (upperTitle.includes('AT-802') || upperTitle.includes('AT802') || upperTitle.includes('802')) unit = 'AT-802';
    else if (upperTitle.includes('BELL-429') || upperTitle.includes('BELL 429') || upperTitle.includes('429') || upperTitle.includes('BELL')) unit = 'BELL-429';
    else if (upperTitle.includes('T-70') || upperTitle.includes('T70')) unit = 'T-70';
    else if (upperTitle.includes('YÖNETİM') || upperTitle.includes('YONETIM')) unit = 'YÖNETİM';

    // Rol tespiti
    if (sourceType === 'pilot' || upperRole.includes('PİLOT') || upperTitle.includes('PİLOT')) {
      role = 'Pilot';
    } else if (sourceType === 'teknisyen' || upperRole.includes('TEKNİSYEN') || upperRole.includes('TEKNİKER') || upperTitle.includes('TEKNİSYEN')) {
      role = 'Teknisyen';
    }
  }

  // Fotoğraf URL düzenleme (Google Drive export formatı)
  let photoUrl = raw.photoUrl || '';
  if (photoUrl) {
    const match = photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || photoUrl.match(/id=([a-zA-Z0-9_-]+)/) || photoUrl.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      photoUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  const rawId = String(raw.id || `p_${Math.random()}`);
  const uniqueId = rawId.startsWith(`${sourceType}_`) ? rawId : `${sourceType}_${rawId}`;

  const rawRankStr = raw.rank !== undefined && raw.rank !== null ? String(raw.rank).trim() : '';
  const cleanRank = rawRankStr && isNaN(Number(rawRankStr)) ? rawRankStr : undefined;

  return {
    id: uniqueId,
    rank: cleanRank,
    fullName,
    role,
    title: titleRaw || `${unit} ${role.toUpperCase()}`,
    unit,
    city: raw.city || 'Ankara',
    activeFrom: raw.activeFrom,
    activeUntil: raw.activeUntil,
    tcNo: raw.tcNo,
    photoUrl,
    sourceType
  };
};

/**
 * Maps attendance raw record from Google Apps Script / Sheet
 */
export const mapAttendanceRecord = (raw: any, sourceType: 'pilot' | 'teknisyen'): AttendanceRecord => {
  let dateVal = raw.date || raw.DATE || '';
  if (dateVal && typeof dateVal === 'string' && dateVal.includes('T')) {
    dateVal = dateVal.slice(0, 10);
  } else if (dateVal instanceof Date) {
    dateVal = dateVal.toISOString().slice(0, 10);
  }

  const rawPersonId = String(raw.personId || raw.PERSON_ID || raw.person_id || '');
  const uniquePersonId = rawPersonId ? (rawPersonId.startsWith(`${sourceType}_`) ? rawPersonId : `${sourceType}_${rawPersonId}`) : '';

  return {
    id: String(raw.id || raw.ID || ''),
    personId: uniquePersonId,
    date: String(dateVal),
    status: String(raw.status || raw.STATUS || 'Mevcut'),
    dutyLocation: raw.dutyLocation || raw.DUTY_LOCATION || raw.DUTY_LOC || raw.duty_location || raw.dutyLoc || '',
    dutyLocationDetail: raw.dutyLocationDetail || raw.DUTY_LOCATION_DETAIL || raw.duty_location_detail || raw.dutyLocationDetail || '',
    dutyType: raw.dutyType || raw.DUTY_TYPE || raw.duty_type || 'Planlı',
    leaveType: raw.leaveType || raw.LEAVE_TYPE || raw.LEAVE_TYP || raw.leave_type || '',
    note: raw.note || raw.NOTE || ''
  };
};

/**
 * Initialize Personnel and Attendance Store with local bundled fallback + localStorage
 */
const initStore = () => {
  // 1. Solid bundled baseline
  const baselinePilots = (initialPersonnelData.pilots || []).map((p: any) => mapPersonData(p, 'pilot'));
  const baselineTechs = (initialPersonnelData.techs || []).map((p: any) => mapPersonData(p, 'teknisyen'));
  const baselinePAtt = (initialAttendanceData.pilotAttendance || []).map((a: any) => mapAttendanceRecord(a, 'pilot'));
  const baselineTAtt = (initialAttendanceData.techAttendance || []).map((a: any) => mapAttendanceRecord(a, 'teknisyen'));

  cachedPilots = baselinePilots;
  cachedTechs = baselineTechs;
  cachedPilotAttendance = baselinePAtt;
  cachedTechAttendance = baselineTAtt;

  // 2. Safely merge with localStorage if available
  try {
    if (typeof localStorage !== 'undefined') {
      const v8Saved = localStorage.getItem('ogm_yoklama_cache_v8');
      if (v8Saved) {
        const parsed = JSON.parse(v8Saved);
        if (Array.isArray(parsed.pilots) && parsed.pilots.length >= 10) {
          cachedPilots = parsed.pilots;
        }
        if (Array.isArray(parsed.techs) && parsed.techs.length >= 10) {
          cachedTechs = parsed.techs;
        }
        if (Array.isArray(parsed.pilotAttendance) && parsed.pilotAttendance.length >= 10) {
          cachedPilotAttendance = parsed.pilotAttendance;
        }
        if (Array.isArray(parsed.techAttendance) && parsed.techAttendance.length >= 10) {
          cachedTechAttendance = parsed.techAttendance;
        }
        lastSyncTime = parsed.timestamp || 0;
      } else {
        // Migration from v7 if it had both
        const v7Saved = localStorage.getItem('ogm_yoklama_cache_v7');
        if (v7Saved) {
          const parsed = JSON.parse(v7Saved);
          if (Array.isArray(parsed.personnel)) {
            const v7Pilots = parsed.personnel.filter((p: any) => p.role === 'Pilot' || p.sourceType === 'pilot');
            const v7Techs = parsed.personnel.filter((p: any) => p.role === 'Teknisyen' || p.sourceType === 'teknisyen');
            if (v7Pilots.length >= 10) cachedPilots = v7Pilots;
            if (v7Techs.length >= 10) cachedTechs = v7Techs;
          }
          if (Array.isArray(parsed.attendance)) {
            const v7PAtt = parsed.attendance.filter((a: any) => a.personId && a.personId.startsWith('pilot_'));
            const v7TAtt = parsed.attendance.filter((a: any) => a.personId && a.personId.startsWith('teknisyen_'));
            if (v7PAtt.length >= 10) cachedPilotAttendance = v7PAtt;
            if (v7TAtt.length >= 10) cachedTechAttendance = v7TAtt;
          }
        }
      }
    }
  } catch (e) {
    console.warn('LocalStorage yoklama read error:', e);
  }

  // 3. Assemble combined state and index
  cachedPersonnel = [...cachedPilots, ...cachedTechs];
  cachedAttendance = [...cachedPilotAttendance, ...cachedTechAttendance];
  rebuildAttendanceIndex();
};

initStore();

/**
 * Normalizes person status string from Sheet / Form
 */
export const normalizeStatus = (stRaw?: string): string => {
  if (!stRaw) return 'Mevcut';
  const st = stRaw.trim().toLocaleUpperCase('tr-TR');
  if (st === 'MEVCUT' || st === 'MESAİ' || st === 'MESAI' || st === 'X' || st === 'M') return 'Mevcut';
  if (st.includes('GÖREV') || st.includes('GOREV') || st === 'G') return 'Görev';
  if (st.includes('İZİN') || st.includes('IZIN') || st.includes('İZİNLİ') || st === 'İ' || st === 'I') return 'İzin';
  if (st.includes('RAPOR') || st.includes('HASTA') || st === 'R') return 'Rapor';
  if (st.includes('BEKLEME') || st.includes('DİĞER') || st.includes('DIGER') || st === 'D') return 'Diğer';
  return stRaw.trim();
};

/**
 * Resolves person's status for a given target date using the attendance system logic.
 */
export const resolvePersonStatus = (
  person: YoklamaPerson,
  dateStr: string,
  attendanceList: AttendanceRecord[]
): { status: string; dutyLocation?: string; dutyLocationDetail?: string; dutyType?: string; leaveType?: string; note?: string } => {
  // Fast O(1) indexed lookup for this person
  const personRecords = attendanceByPersonMap.get(person.id) || attendanceList.filter(a => a.personId === person.id);

  // 1. Direct record for that date (search latest entry)
  const matches = personRecords.filter(a => a.date === dateStr && a.status && a.status.trim() !== '');
  const direct = matches[matches.length - 1];
  if (direct) {
    return {
      status: normalizeStatus(direct.status),
      dutyLocation: direct.dutyLocation ? direct.dutyLocation.trim() : undefined,
      dutyLocationDetail: direct.dutyLocationDetail ? direct.dutyLocationDetail.trim() : undefined,
      dutyType: direct.dutyType,
      leaveType: direct.leaveType,
      note: direct.note
    };
  }

  // 2. Check if weekend
  const dObj = new Date(dateStr + 'T12:00:00');
  const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;

  // 3. Lookback for latest past record
  const pastRecords = personRecords
    .filter(x => x.date < dateStr && x.status && x.status.trim() !== '')
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestPast = pastRecords[0];

  if (isWeekend) {
    if (latestPast && (normalizeStatus(latestPast.status) === 'Görev')) {
      return {
        status: 'Görev',
        dutyLocation: latestPast.dutyLocation ? latestPast.dutyLocation.trim() : undefined,
        dutyLocationDetail: latestPast.dutyLocationDetail ? latestPast.dutyLocationDetail.trim() : undefined,
        dutyType: latestPast.dutyType || 'Planlı',
        leaveType: latestPast.leaveType,
        note: latestPast.note
      };
    }
    return { status: 'Hafta Sonu' };
  } else {
    if (latestPast) {
      const pastNorm = normalizeStatus(latestPast.status);
      if (pastNorm === 'Mevcut' || pastNorm === 'Görev') {
        return {
          status: pastNorm,
          dutyLocation: latestPast.dutyLocation ? latestPast.dutyLocation.trim() : undefined,
          dutyLocationDetail: latestPast.dutyLocationDetail ? latestPast.dutyLocationDetail.trim() : undefined,
          dutyType: latestPast.dutyType || 'Planlı',
          leaveType: latestPast.leaveType,
          note: latestPast.note
        };
      }
    }
    return { status: 'Mevcut' };
  }
};

/**
 * Checks whether a person is exempt from being shown on aircraft when "Mevcut"
 * As instructed by user:
 * "DİPNOT C-650 BİR PİLOTU MURAT AKMEŞE İSTİSA O TEKNİSYEN YÖNETİM GRUBUNDA DİĞER İSTİSNA YÖNETİM BİRİMİNDE ALPER ÖZMETİN C-650 BİRİMİ ;
 * TEZCAN GÜZER B-360 EKİBİDİR YANİ YOKLAMDA BUNLAR MEVCUT DIŞINDA GÖREV YAZARSA HANGİ BİRİME ATACAĞINI BİL EĞERR MEVCUT YAZARSA BİR YERDE GÖSTERME"
 */
export const isPersonExcludedWhenMevcut = (person: YoklamaPerson): boolean => {
  const upper = (person.fullName || '').toLocaleUpperCase('tr-TR');
  if (upper.includes('MURAT AKMEŞE') || upper.includes('MURAT AKMESE')) return true;
  if (upper.includes('ALPER ÖZMETİN') || upper.includes('ALPER OZMETIN')) return true;
  if (upper.includes('TEZCAN GÜZER') || upper.includes('TEZCAN GUZER')) return true;
  if (person.unit === 'YÖNETİM') return true;
  return false;
};

/**
 * Get the flight crew (Pilots & Technicians) assigned to a given aircraft.
 * 
 * STRICT RULES:
 * 1. Unit Isolation:
 *    - AT-802 personnel can ONLY be assigned to AT-802 aircraft.
 *    - BELL-429 personnel can ONLY be assigned to BELL-429 aircraft.
 *    - T-70 personnel can ONLY be assigned to T-70 aircraft.
 *    - B-360 personnel can ONLY be assigned to B-360 aircraft.
 *    - C-650 personnel can ONLY be assigned to C-650 aircraft.
 *    - (General workshop / Teknik Ekip on Görev can support corresponding station aircraft).
 * 
 * 2. For aircraft in ANKARA:
 *    - ONLY personnel who are on "Mevcut" (Mesai / X) in Ankara AND belong to THIS aircraft's unit
 *      are assigned!
 *    - Anyone on Görev (e.g. Muğla, Antalya), Leave, Rapor, Bekleme or other units is STRICTLY EXCLUDED.
 *    - Excludes management exceptions (Murat Akmeşe, Alper Özmetin, Tezcan Güzer).
 * 
 * 3. For aircraft OUTSIDE ANKARA (e.g. MUĞLA, ANTALYA, İZMİR, ÇANAKKALE):
 *    - ONLY personnel whose status is "Görev", whose DUTY_LOCATION matches the aircraft city,
 *      and whose unit matches the aircraft type!
 *    - Sub-location matching (DUTY_LOCATION_DETAIL):
 *      - Muğla / Yanıklar -> T-70 personnel with DUTY_LOCATION_DETAIL 'YANIKLAR'
 *      - Muğla / Güvercinlik -> T-70 personnel with DUTY_LOCATION_DETAIL 'GÜVERCİNLİK'
 *      - Muğla / Milas -> AT-802 personnel with DUTY_LOCATION_DETAIL 'MİLAS'
 *      - Çanakkale -> AT-802 or Bell-429 personnel assigned to Çanakkale
 *      - İzmir -> Bell-429 personnel assigned to İzmir
 *      - Antalya -> AT-802, B-360, Bell-429 personnel assigned to Antalya
 */
export const getAircraftCrew = (
  aircraft: Aircraft,
  targetDate?: string
): AircraftCrewInfo => {
  const now = new Date();
  const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dateStr = targetDate || todayLocalStr;
  const acUnit = normalizeAircraftUnit(aircraft.tip);
  const rawLoc = (aircraft.konum || '').trim();
  const acCity = normalizeCityName(rawLoc);
  
  const acFullLocationText = (
    rawLoc + ' ' + 
    (aircraft.durumAyrintisi || '') + ' ' + 
    (aircraft.aciklama || '') + ' ' + 
    ((aircraft as any).meydan || '')
  ).toLocaleUpperCase('tr-TR');

  const kuyrukUpper = aircraft.kuyrukNo.toLocaleUpperCase('tr-TR').trim();
  const cagriUpper = (aircraft.cagriKodu || '').toLocaleUpperCase('tr-TR').trim();

  const assignedPilots: YoklamaPerson[] = [];
  const assignedTechs: YoklamaPerson[] = [];

  const isAnkaraAircraft = acCity === 'ANKARA';

  for (const person of cachedPersonnel) {
    if (person.activeUntil && person.activeUntil < dateStr) continue;
    if (person.activeFrom && person.activeFrom > dateStr) continue;

    const resolved = resolvePersonStatus(person, dateStr, cachedAttendance);
    const stNorm = normalizeStatus(resolved.status);

    // Skip if on leave or sick (İzin, Rapor, Hafta Sonu)
    if (stNorm === 'İzin' || stNorm === 'Rapor' || stNorm === 'Hafta Sonu') {
      continue;
    }

    const isUnitExactMatch = person.unit === acUnit;
    const isTeknikEkip = person.unit === 'TEKNİK EKİP' || person.unit === 'DİĞER' || (person.title && (person.title.includes('UÇAK TEKNİSYENİ') || person.title.includes('UÇAK TEKNİKERİ')));
    const isYonetim = person.unit === 'YÖNETİM';

    const personWithStatus: YoklamaPerson = {
      ...person,
      status: resolved.status,
      dutyLocation: resolved.dutyLocation,
      dutyLocationDetail: resolved.dutyLocationDetail,
      dutyType: resolved.dutyType,
      leaveType: resolved.leaveType,
      note: resolved.note
    };

    // Explicit tail number match in note or detail
    const noteAndDetail = `${resolved.dutyLocationDetail || ''} ${resolved.note || ''}`.toLocaleUpperCase('tr-TR');
    if (kuyrukUpper && (noteAndDetail.includes(kuyrukUpper) || (cagriUpper && noteAndDetail.includes(cagriUpper)))) {
      if (person.role === 'Pilot') assignedPilots.push(personWithStatus);
      else assignedTechs.push(personWithStatus);
      continue;
    }

    // ==========================================
    // CASE 1: Aircraft in ANKARA
    // ==========================================
    if (isAnkaraAircraft) {
      // Must be "Mevcut" (Mesai / X) or Ankara Standby/Nöbet
      const isAnkaraPresent = stNorm === 'Mevcut' || stNorm === 'Diğer' || (resolved.note && resolved.note.toLocaleUpperCase('tr-TR').includes('BEKLEME'));
      
      if (isAnkaraPresent) {
        // Must NOT have a duty location outside Ankara
        if (resolved.dutyLocation && normalizeCityName(resolved.dutyLocation) !== 'ANKARA') {
          continue; // On duty in another city! Cannot be in Ankara!
        }

        // Exclude special exceptions (Murat Akmeşe, Alper Özmetin, Tezcan Güzer, Yönetim)
        if (isPersonExcludedWhenMevcut(person)) {
          continue;
        }

        // STRICT UNIT MATCH: Only personnel whose unit matches THIS aircraft's unit are assigned!
        // AT-802 -> AT-802 only, T-70 -> T-70 only, Bell-429 -> Bell-429 only, B-360 -> B-360 only, C-650 -> C-650 only!
        if (isUnitExactMatch) {
          if (person.role === 'Pilot') assignedPilots.push(personWithStatus);
          else assignedTechs.push(personWithStatus);
        }
      }
    } 
    // ==========================================
    // CASE 2: Aircraft OUTSIDE ANKARA (Görev Üsleri)
    // ==========================================
    else {
      // Must be on "Görev"
      if (stNorm === 'Görev') {
        const dutyCity = normalizeCityName(resolved.dutyLocation);
        
        // Duty city MUST match aircraft's city
        if (dutyCity === acCity) {
          // Check unit compatibility
          let isEligible = isUnitExactMatch;

          // Special management on duty (e.g. Mehmet Sefa Yücedağ is Bell-429 in title)
          if (isYonetim) {
            const titleUpper = (person.title || '').toLocaleUpperCase('tr-TR');
            if (titleUpper.includes(acUnit)) isEligible = true;
          }

          // General workshop technician (Zekeriya Evirgen, M. Zahid Dursun) supporting duty location
          if (isTeknikEkip && person.role === 'Teknisyen') {
            isEligible = true;
          }

          if (isEligible) {
            const detail = (resolved.dutyLocationDetail || '').toLocaleUpperCase('tr-TR').trim();
            
            // Kural: Teknik Ekip biriminde çalışan personeller Antalya görevine giderse, detay yok ise AT-802'dir
            if (dutyCity === 'ANTALYA' && isTeknikEkip && person.role === 'Teknisyen' && !detail) {
              if (acUnit !== 'AT-802') {
                continue; // Detaysız Antalya teknik ekip görevlendirmeleri yalnızca AT-802'ye atanır
              }
            }
            
            if (detail) {
              // Check if aircraft matches this specific station with synonym support
              let isStationMatch = acFullLocationText.includes(detail);

              // Muğla / Güvercinlik <-> Bodrum synonym match
              if ((detail.includes('GÜVERCİNLİK') || detail.includes('GUVERCINLIK') || detail.includes('BODRUM')) &&
                  (acFullLocationText.includes('GÜVERCİNLİK') || acFullLocationText.includes('GUVERCINLIK') || acFullLocationText.includes('BODRUM'))) {
                isStationMatch = true;
              }

              // Muğla / Yanıklar <-> Fethiye synonym match
              if ((detail.includes('YANIKLAR') || detail.includes('FETHİYE') || detail.includes('FETHIYE')) &&
                  (acFullLocationText.includes('YANIKLAR') || acFullLocationText.includes('FETHİYE') || acFullLocationText.includes('FETHIYE'))) {
                isStationMatch = true;
              }

              // Muğla / Milas match
              if ((detail.includes('MİLAS') || detail.includes('MILAS')) &&
                  (acFullLocationText.includes('MİLAS') || acFullLocationText.includes('MILAS') || acUnit === 'AT-802')) {
                isStationMatch = true;
              }
              
              if (isStationMatch) {
                if (person.role === 'Pilot') assignedPilots.push(personWithStatus);
                else assignedTechs.push(personWithStatus);
              } else {
                // If aircraft has a different specific station, don't assign to wrong station!
                const isGuvercinlikAircraft = acFullLocationText.includes('GÜVERCİNLİK') || acFullLocationText.includes('GUVERCINLIK') || acFullLocationText.includes('BODRUM');
                const isYaniklarAircraft = acFullLocationText.includes('YANIKLAR') || acFullLocationText.includes('FETHİYE') || acFullLocationText.includes('FETHIYE');
                const isMilasAircraft = acFullLocationText.includes('MİLAS') || acFullLocationText.includes('MILAS');

                const isGuvercinlikPerson = detail.includes('GÜVERCİNLİK') || detail.includes('GUVERCINLIK') || detail.includes('BODRUM');
                const isYaniklarPerson = detail.includes('YANIKLAR') || detail.includes('FETHİYE') || detail.includes('FETHIYE');
                const isMilasPerson = detail.includes('MİLAS') || detail.includes('MILAS');

                const isConflictingStation = (isGuvercinlikAircraft && (isYaniklarPerson || isMilasPerson)) ||
                                             (isYaniklarAircraft && (isGuvercinlikPerson || isMilasPerson)) ||
                                             (isMilasAircraft && (isGuvercinlikPerson || isYaniklarPerson));

                if (!isConflictingStation) {
                  if (person.role === 'Pilot') assignedPilots.push(personWithStatus);
                  else assignedTechs.push(personWithStatus);
                }
              }
            } else {
              // No sub-station detail on person (assigned to general city crew, e.g. Bell-429 in Muğla)
              const isGuvercinlikAircraft = acFullLocationText.includes('GÜVERCİNLİK') || acFullLocationText.includes('GUVERCINLIK') || acFullLocationText.includes('BODRUM');
              const isYaniklarAircraft = acFullLocationText.includes('YANIKLAR') || acFullLocationText.includes('FETHİYE') || acFullLocationText.includes('FETHIYE');

              // If it's a Bell-429 or aircraft in city with matching unit, assign
              if (person.role === 'Pilot') assignedPilots.push(personWithStatus);
              else assignedTechs.push(personWithStatus);
            }
          }
        }
      }
    }
  }

  const uniquePilots = Array.from(new Map(assignedPilots.map(p => [p.id, p])).values());
  const uniqueTechs = Array.from(new Map(assignedTechs.map(t => [t.id, t])).values());

  let dutyLocationLabel = acCity;
  if (isAnkaraAircraft) {
    dutyLocationLabel = 'ANKARA (MESAİ / NÖBETÇİ EKİP)';
  } else {
    const sub = uniquePilots.find(p => p.dutyLocationDetail)?.dutyLocationDetail || 
                uniqueTechs.find(t => t.dutyLocationDetail)?.dutyLocationDetail;
    if (sub) {
      dutyLocationLabel = `${acCity} / ${sub}`;
    }
  }

  return {
    pilots: uniquePilots,
    technicians: uniqueTechs,
    allPersonnel: [...uniquePilots, ...uniqueTechs],
    dutyLocationLabel,
    isAnkaraBaseCrew: isAnkaraAircraft
  };
};

/**
 * Fetch latest live attendance data from Google Apps Script via proxy
 */
export const syncYoklamaData = async (): Promise<boolean> => {
  if (isSyncing) return false;
  const now = Date.now();
  // If recent sync occurred and both groups have valid data, keep cache
  if (now - lastSyncTime < 60000 && cachedPilots.length >= 10 && cachedTechs.length >= 10) {
    return true;
  }

  isSyncing = true;
  try {
    const [pInitRes, pAttRes, tInitRes, tAttRes] = await Promise.allSettled([
      proxyFetch(PILOT_YOKLAMA_SCRIPT_URL, { action: 'get_init_data' }),
      proxyFetch(PILOT_YOKLAMA_SCRIPT_URL, { action: 'get_attendance' }),
      proxyFetch(TEKNISYEN_YOKLAMA_SCRIPT_URL, { action: 'get_init_data' }),
      proxyFetch(TEKNISYEN_YOKLAMA_SCRIPT_URL, { action: 'get_attendance' }),
    ]);

    let hasChanges = false;

    // 1. Process Pilot Personnel independently (never clear if response is invalid)
    if (pInitRes.status === 'fulfilled' && pInitRes.value) {
      const pilotsRaw = pInitRes.value?.data?.personnel || pInitRes.value?.personnel;
      if (Array.isArray(pilotsRaw) && pilotsRaw.length >= 5) {
        cachedPilots = pilotsRaw.map((p: any) => mapPersonData(p, 'pilot'));
        hasChanges = true;
      }
    }

    // 2. Process Technician Personnel independently (never clear if response is invalid)
    if (tInitRes.status === 'fulfilled' && tInitRes.value) {
      const techsRaw = tInitRes.value?.data?.personnel || tInitRes.value?.personnel;
      if (Array.isArray(techsRaw) && techsRaw.length >= 5) {
        cachedTechs = techsRaw.map((p: any) => mapPersonData(p, 'teknisyen'));
        hasChanges = true;
      }
    }

    // 3. Process Pilot Attendance independently
    if (pAttRes.status === 'fulfilled' && pAttRes.value) {
      const pAtt = Array.isArray(pAttRes.value?.data) ? pAttRes.value.data : (Array.isArray(pAttRes.value) ? pAttRes.value : []);
      if (pAtt.length >= 5) {
        cachedPilotAttendance = pAtt.map((a: any) => mapAttendanceRecord(a, 'pilot'));
        hasChanges = true;
      }
    }

    // 4. Process Technician Attendance independently
    if (tAttRes.status === 'fulfilled' && tAttRes.value) {
      const tAtt = Array.isArray(tAttRes.value?.data) ? tAttRes.value.data : (Array.isArray(tAttRes.value) ? tAttRes.value : []);
      if (tAtt.length >= 5) {
        cachedTechAttendance = tAtt.map((a: any) => mapAttendanceRecord(a, 'teknisyen'));
        hasChanges = true;
      }
    }

    if (hasChanges) {
      cachedPersonnel = [...cachedPilots, ...cachedTechs];
      cachedAttendance = [...cachedPilotAttendance, ...cachedTechAttendance];
      rebuildAttendanceIndex();
      lastSyncTime = Date.now();

      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('ogm_yoklama_cache_v8', JSON.stringify({
            pilots: cachedPilots,
            techs: cachedTechs,
            pilotAttendance: cachedPilotAttendance.slice(-4000),
            techAttendance: cachedTechAttendance.slice(-4000),
            timestamp: lastSyncTime
          }));
        } catch (e) {
          console.warn('LocalStorage save failed:', e);
        }
      }

      notifyListeners();
    }

    return true;
  } catch (err) {
    console.error('Error syncing yoklama data:', err);
    return false;
  } finally {
    isSyncing = false;
  }
};

export const getAllYoklamaPersonnel = (): YoklamaPerson[] => cachedPersonnel;
export const getAllYoklamaAttendance = (): AttendanceRecord[] => cachedAttendance;
