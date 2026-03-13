
export enum PlatformType {
  H = 'H',
  SA = 'S-A',
  DA = 'D-A',
  SL = 'S-L',
  DL = 'D-L'
}

export enum Status {
  FAAL = 'FAAL',
  GAYRI_FAAL = 'GAYRI FAAL'
}

export enum StatusType {
  BAKIM = 'BAKIM',
  ARIZA = 'ARIZA',
  DIGER = 'DIGER',
  NONE = '-'
}

export interface MaintenanceHour {
  bakimTuru: string;
  kalanSaat: number;
}

export interface Aircraft {
  cagriKodu: string;
  kuyrukNo: string;
  platformTipi: string;
  durum: Status;
  durumTipi: StatusType;
  durumAyrintisi: string;
  konum: string;
  faydaliSaat: number | null;
  govdeUcusSaati?: string;
  durumBaslangic: string;
  durumBitis?: string;
  aciklama: string;
  guncellemeTarihi: string;
  seriNo: string;
  motor: string;
  uretimYili: number;
  gelisTarihi?: string;
  base: string;
  maintenanceHours: MaintenanceHour[];
  photos: string[];
  tip?: string;
  assignedCode?: DailyStatusCode;
  aiInterpretation?: string;
  sheetId?: string;
  appsScriptUrl?: string;
  mapping?: SheetMapping;
  oplAlerts?: string[];
  
  // Bell-429 Special Fields
  govdeSN?: string;
  motor1SN?: string;
  motor2SN?: string;
  motor1UcusSaati?: string;
  motor2UcusSaati?: string;
  bakim50H?: string;
  bakimTakvim?: string;

  // AT-802 Special Fields
  acTT?: string;
  landings?: string;
  engineStarts?: string;
  engineFlights?: string;
  frdsTestDate?: string;
  motorRunDate?: string;

  // T-70 Special Fields
  bakim40H?: string;
  bakim120H?: string;
  bakim480H?: string;
  bakimTakvimTarih?: string;
  bakimKalanSaat?: string;

  // B-360 & C-650 Special Fields
  bakim200H?: string;
}

export type DailyStatusCode = 'B' | 'BB' | 'KM' | 'A' | 'PB' | 'KK' | 'X' | 'F' | 'TB' | '';

export interface AircraftActivity {
  kuyrukNo: string;
  cagriKodu: string;
  tip: string;
  dailyStatuses: { [dateStr: string]: DailyStatusCode };
  hourlyStatuses?: { [dateStr: string]: { [hour: string]: DailyStatusCode } };
  intraDayCompletions?: { [dateStr: string]: boolean };
}

export interface SheetMapping {
  kuyrukNo: string;
  durum: string;
  durumAyrintisi: string;
  konum: string;
  faydaliSaat: string;
  aciklama: string;
  govdeUcusSaati?: string;
  gelisTarihi?: string;
  gelisKuyrukNo?: string;
  
  // Extended mappings
  govdeSN?: string;
  motor1SN?: string;
  motor2SN?: string;
  motor1UcusSaati?: string;
  motor2UcusSaati?: string;
  bakim50H?: string;
  bakimTakvim?: string;

  // AT-802 mappings
  acTT?: string;
  landings?: string;
  engineStarts?: string;
  engineFlights?: string;
  frdsTestDate?: string;
  motorRunDate?: string;

  // T-70 mappings
  bakim40H?: string;
  bakim120H?: string;
  bakim480H?: string;
  bakimTakvimTarih?: string;
  bakimKalanSaat?: string;

  // B-360 & C-650 mappings
  bakim200H?: string;
}

export interface SheetConfig {
  aircraftType: string;
  sheetId: string;
  sheetName?: string;
  appsScriptUrl: string;
  mapping: SheetMapping;
}

export interface AppNotification {
  id: string;
  platform: string;
  kuyrukNo: string;
  mesaj: string;
  tarih: string;
  oncekiDeger: string;
  yeniDeger: string;
  kolon: string;
}

export interface SnapshotPreview {
  kuyrukNo: string;
  tarih: string;
  kod: DailyStatusCode;
  aciklamaOzeti: string;
  gerekce: string;
  originalData: Partial<Aircraft>;
}

export interface OPLItem {
  [key: string]: any;
}
