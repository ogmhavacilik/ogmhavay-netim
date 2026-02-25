
import { PlatformType, Status, StatusType, Aircraft, AircraftActivity } from './types';

export const MOCK_AIRCRAFT: Aircraft[] = [
  {
    cagriKodu: 'ORMAN-01',
    kuyrukNo: 'OR-0177',
    platformTipi: PlatformType.H,
    durum: Status.FAAL,
    durumTipi: StatusType.NONE,
    durumAyrintisi: '-',
    konum: 'ANKARA',
    faydaliSaat: 76,
    durumBaslangic: '2025-01-01',
    aciklama: '',
    guncellemeTarihi: '2025-05-12 09:00',
    seriNo: 'SN-0177',
    motor: 'T700',
    uretimYili: 2021,
    base: 'Etimesgut',
    maintenanceHours: [{ bakimTuru: '500H', kalanSaat: 76 }],
    photos: ['https://picsum.photos/seed/or0177/800/600']
  },
  {
    cagriKodu: 'ORMAN-08',
    kuyrukNo: 'OR-3192',
    platformTipi: PlatformType.SA,
    durum: Status.GAYRI_FAAL,
    durumTipi: StatusType.BAKIM,
    durumAyrintisi: '200H / YILLIK',
    konum: 'ANKARA',
    faydaliSaat: 19,
    durumBaslangic: '2025-02-05',
    aciklama: 'YILLIK BAKIM BAŞLANGIÇ TARİHİ: 05.02.2026. TAHMİNİ BİTİŞ TARİHİ: 20.02.2026',
    guncellemeTarihi: '2025-05-12 10:00',
    seriNo: 'SN-3192',
    motor: 'PT6A',
    uretimYili: 2020,
    base: 'Etimesgut',
    maintenanceHours: [{ bakimTuru: '200H', kalanSaat: 19 }],
    photos: ['https://picsum.photos/seed/or3192/800/600']
  },
  {
    cagriKodu: 'ORMAN-21',
    kuyrukNo: 'OR-2021',
    platformTipi: PlatformType.DA,
    durum: Status.GAYRI_FAAL,
    durumTipi: StatusType.DIGER,
    durumAyrintisi: 'KAZA KIRIM',
    konum: 'ANTALYA',
    faydaliSaat: 59,
    durumBaslangic: '2025-08-25',
    aciklama: 'KAZA-KIRIM (ANTALYA/KARAİN). 25.08.2025-12:15 CİVARI KARACAÖREN BARAJI (EĞİTİM UÇUŞU)',
    guncellemeTarihi: '2025-05-12 08:30',
    seriNo: 'SN-2021',
    motor: 'PT6A-67F',
    uretimYili: 2021,
    base: 'Antalya',
    maintenanceHours: [{ bakimTuru: '500H', kalanSaat: 59 }],
    photos: ['https://picsum.photos/seed/or2021/800/600']
  },
  {
    cagriKodu: 'ORMAN-37',
    kuyrukNo: 'OR-2037',
    platformTipi: PlatformType.DA,
    durum: Status.GAYRI_FAAL,
    durumTipi: StatusType.ARIZA,
    durumAyrintisi: 'PARÇA BEKLER',
    konum: 'ANKARA',
    faydaliSaat: 100,
    durumBaslangic: '2025-08-11',
    aciklama: '11.08.2025 TARİHİNDE EBYS NO: 16551868 PARÇA BEKLER. 1-)P/N 71029-1 PUSHROD ASSEMBLY, AILERON (2 ADET)',
    guncellemeTarihi: '2025-05-12 11:30',
    seriNo: 'SN-2037',
    motor: 'PT6A-67F',
    uretimYili: 2023,
    base: 'Etimesgut',
    maintenanceHours: [{ bakimTuru: '200H', kalanSaat: 100 }],
    photos: ['https://picsum.photos/seed/or2037/800/600']
  },
  {
    cagriKodu: 'ORMAN-19',
    kuyrukNo: 'OR-1019',
    platformTipi: PlatformType.SA,
    durum: Status.GAYRI_FAAL,
    durumTipi: StatusType.ARIZA,
    durumAyrintisi: 'PARÇA BEKLER',
    konum: 'ANKARA',
    faydaliSaat: 33,
    durumBaslangic: '2025-11-03',
    aciklama: 'BAŞLANGIÇ TARİHİ: 03.11.2025 BİTİŞ TARİHİ:17.12.2025. 1 ADET MOTOR PARÇA BEKLER (TUSAŞ)',
    guncellemeTarihi: '2025-05-12 12:00',
    seriNo: 'SN-1019',
    motor: 'PT6A',
    uretimYili: 2019,
    base: 'Etimesgut',
    maintenanceHours: [{ bakimTuru: '200H', kalanSaat: 33 }],
    photos: ['https://picsum.photos/seed/or1019/800/600']
  }
];

export const MOCK_ACTIVITY_GRID: AircraftActivity[] = [
  {
    kuyrukNo: 'OR-2021',
    cagriKodu: 'ORMAN-21',
    tip: 'AT-802',
    dailyStatuses: { 1: 'PB', 2: 'PB', 3: 'PB', 4: 'PB', 5: 'PB', 6: 'PB', 7: 'PB', 23: 'B', 24: 'B', 25: 'B' }
  },
  {
    kuyrukNo: 'OR-2022',
    cagriKodu: 'ORMAN-22',
    tip: 'AT-802',
    dailyStatuses: { 1: 'PB', 2: 'PB', 3: 'PB', 4: 'PB', 10: 'B', 11: 'B', 12: 'B', 13: 'B' }
  },
  {
    kuyrukNo: 'OR-2027',
    cagriKodu: 'ORMAN-27',
    tip: 'AT-802',
    dailyStatuses: { 1: 'X', 2: 'X', 3: 'X', 4: 'X', 5: 'X', 30: 'KM', 31: 'KM' }
  },
  {
    kuyrukNo: 'OR-1019',
    cagriKodu: 'ORMAN-19',
    tip: 'T-70',
    dailyStatuses: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 14: 'B' }
  },
  {
    kuyrukNo: 'OR-0177',
    cagriKodu: 'ORMAN-01',
    tip: 'C-650',
    dailyStatuses: { 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'B', 8: 'B' }
  },
  {
    kuyrukNo: 'OR-1839',
    cagriKodu: 'ORMAN-02',
    tip: 'B-360',
    dailyStatuses: { }
  },
  {
    kuyrukNo: 'OR-3125',
    cagriKodu: 'ORMAN-03',
    tip: 'Bell-429',
    dailyStatuses: { }
  }
];
