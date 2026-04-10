
export enum PlatformType {
  H = 'H',
  SA = 'SA',
  DA = 'DA',
  SL = 'SL',
  DL = 'DL'
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
  sheetName?: string;
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

export type DailyStatusCode = 'B' | 'BB' | 'TBU' | 'KM' | 'A' | 'PB' | 'KK' | 'X' | 'F' | 'TB' | '';

export interface LogEvent {
  hour: number;
  exactMins: number;
  type: 'down' | 'up';
  status: string;
  desc: string;
}

export interface AircraftActivity {
  kuyrukNo: string;
  cagriKodu: string;
  tip: string;
  dailyStatuses: { [dateStr: string]: DailyStatusCode };
  hourlyStatuses?: { [dateStr: string]: { [hour: string]: DailyStatusCode } };
  hourlyDescriptions?: { [dateStr: string]: { [hour: string]: string } };
  intraDayCompletions?: { [dateStr: string]: boolean };
  intraDayDurations?: { [dateStr: string]: number };
  intraDayEvents?: { [dateStr: string]: LogEvent[] };
}

export interface SheetMapping {
  kuyrukNo: string;
  durum: string;
  durumAyrintisi: string;
  konum: string;
  faydaliSaat?: string;
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
  starts?: string;
  flights?: string;
  frdsTestDate?: string;
  frdsTestDateMain?: string;
  frdsTestDateAlt?: string;
  motorRunDate?: string;
  bakimTakvimTarih?: string;

  // T-70 mappings
  bakim40H?: string;
  bakim120H?: string;
  bakim480H?: string;
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
