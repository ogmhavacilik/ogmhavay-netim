// Otomatik derlenmiş Saatlik Faaliyet Günlüğü Başlangıç Verileri
export interface IntraDayLogEntry {
  id: string;
  tarih: string;
  kuyrukNo: string;
  tip: string;
  startTime: string;
  endTime: string;
  status: string;
  description: string;
}

export const DEFAULT_INTRA_DAY_LOGS: IntraDayLogEntry[] = [
  {
    "id": "2026-03-31_OR-3133_",
    "tarih": "2026-03-31",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 11:20:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": ""
  },
  {
    "id": "2026-04-06_OR-1020_09:00",
    "tarih": "2026-04-06",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 09:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "960 SAATLİK BAKIM\nBAŞLANGIÇ TARİHİ: 20.01.2026 \n*4 ADET M/R BLADE BOYA (5 ABFM)\n*NOSE DOOR ONARIM BOYA(TUSAŞ)"
  },
  {
    "id": "2026-04-09_OR-2031_18:01",
    "tarih": "2026-04-09",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 18:01:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "SOL ÖN İNİŞ TAKIMI SPRING DE ÇATLAK MEVCUT."
  },
  {
    "id": "2026-04-13_OR-1018_13:00",
    "tarih": "2026-04-13",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 13:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "6 AYLIK KONTROLLER\nBİTİŞ TARİHİ 15.04.2026"
  },
  {
    "id": "2026-04-15_OR-1019_16:00",
    "tarih": "2026-04-15",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 16:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "XMSN FİLİTRE ARIZASI"
  },
  {
    "id": "2026-04-15_OR-1019_16:00",
    "tarih": "2026-04-15",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 16:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "XMSN FİLİTRE ARIZASI"
  },
  {
    "id": "2026-04-15_OR-1019_16:00",
    "tarih": "2026-04-15",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 16:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "XMSN FİLİTRE ARIZASI"
  },
  {
    "id": "2026-04-16_OR-1019_",
    "tarih": "2026-04-16",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 15:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "A",
    "description": ""
  },
  {
    "id": "2026-04-16_OR-1018_",
    "tarih": "2026-04-16",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 16:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": ""
  },
  {
    "id": "2026-04-17_OR-1019_",
    "tarih": "2026-04-17",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 10:40:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": "20-23 Nisan 2026 120FH Bakım Planlı"
  },
  {
    "id": "2026-04-20_OR-1019_09:00",
    "tarih": "2026-04-20",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 09:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 08:42:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": "120 FH BAKIM\nBAKIM GİRİŞ TARİHİ 20.04.2026"
  },
  {
    "id": "2026-04-24_OR-1019_",
    "tarih": "2026-04-24",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 11:37:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": ""
  },
  {
    "id": "2026-04-28_OR-1019_12:00",
    "tarih": "2026-04-28",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 12:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "3 NOLU SMFD ARIZASI MEVCUT MALZEME İSTEĞİ YAPILDI 28.04.2026"
  },
  {
    "id": "2026-04-29_OR-1019_14:00",
    "tarih": "2026-04-29",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 14:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 16:46:00 GMT+0156 (Türkiye Standard Time)",
    "status": "A",
    "description": ""
  },
  {
    "id": "2026-04-29_OR-1019_",
    "tarih": "2026-04-29",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 14:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "A",
    "description": ""
  },
  {
    "id": "2026-04-30_OR-2023_16:45",
    "tarih": "2026-04-30",
    "kuyrukNo": "OR-2023",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 16:45:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "TBU",
    "description": "1) HAVA ARACI GUS:1040:00'A KADAR UÇUŞUNA MÜSAADE EDİLMİŞTİR.\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ."
  },
  {
    "id": "2026-05-06_OR-1839_",
    "tarih": "2026-05-06",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 09:39:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": ""
  },
  {
    "id": "2026-05-07_OR-3131_11:00",
    "tarih": "2026-05-07",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 11:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "900 H FUEL NOZZLE DEĞİŞİMİ ( SKYLINE)"
  },
  {
    "id": "2026-05-08_OR-2022_10:28",
    "tarih": "2026-05-08",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 10:28:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1)  SL-414 UYGULAMASINDA DOLAYI PARÇA DEĞİŞİMİ GEREKLİ.\nİSPANYOL TEKNİK DANIŞMANA 02.02.2026 TARİHİNDE İSTEK YAPILDI.\nBÜLTEN GEREĞİ OLDUĞU İÇİN ÜCRETSİZ OLARAK TESLİM EDİLECEK.\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)HAVA ARACI GUS:884:25'E KADAR UÇUŞUNA MÜSAADE EDİLMİŞTİR."
  },
  {
    "id": "2026-05-08_OR-3131_",
    "tarih": "2026-05-08",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 14:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "2026-05-10_OR-2030_11:45",
    "tarih": "2026-05-10",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 11:45:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Asimetrik scoop ikaz ışığı yanıyor."
  },
  {
    "id": "2026-05-10_OR-0177_13:32",
    "tarih": "2026-05-08",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Sat Dec 30 1899 13:32:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "08.05.2026 TARİHİNDE YILLIK BAKIMLARI YAPILMAK ÜZERE EMAIR BAKIM MERKEZİNE TESLİM EDİLMİŞTİR"
  },
  {
    "id": "2026-05-10_OR-2030_",
    "tarih": "2026-05-10",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 14:41:00 GMT+0156 (Türkiye Standard Time)",
    "status": "A",
    "description": ""
  },
  {
    "id": "2026-05-10_OR-2040_10:00",
    "tarih": "2026-05-10",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 10:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": ""
  },
  {
    "id": "2026-05-10_OR-2040_",
    "tarih": "2026-05-10",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 11:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "A",
    "description": ""
  },
  {
    "id": "2026-05-11_OR-2026_",
    "tarih": "2026-05-11",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 20:15:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": "1) 11.05.2026 TARİNDE TEST UÇUŞUNA BAŞLANMIŞTIR.\n2) SL 421 UYGULANMASI GEREKLİ"
  },
  {
    "id": "2026-05-11_OR-2026_20:23",
    "tarih": "2026-05-11",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 20:23:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:21:00 GMT+0156 (Türkiye Standard Time)",
    "status": "TB",
    "description": "1) 11.05.2026 TARİNDE TEST UÇUŞUNA BAŞLANMIŞTIR.\n2) SL 421 UYGULANMASI GEREKLİ"
  },
  {
    "id": "2026-05-11_OR-2037_08:30",
    "tarih": "2026-05-11",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 08:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) YILLIK BAKIM TAMALANDI.\nBAŞLANGIÇ TARİHİ: 17.10.2025 / BİTİŞ TARİHİ: 25.12.2025\n2)11.03.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUP İPTAL EDİLMİŞTİR.08.05.2026 TARİHLİ MEKTUBA GÖRE TEKNİK İNCELEME SONUCU BEKLENMEKTEDİR."
  },
  {
    "id": "2026-05-11_OR-2026_16:45",
    "tarih": "2026-05-11",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 16:45:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "TB",
    "description": "1) 11.05.2026 TARİNDE TEST UÇUŞUNA BAŞLANMIŞTIR.\n2) SL 421 UYGULANMASI GEREKLİ"
  },
  {
    "id": "2026-05-16_OR-2030_",
    "tarih": "2026-05-15",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 17:52:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.05.2026_OR-2027_2026-05-18",
    "tarih": "2026-05-18",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon May 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.05.2026_OR-2030_2026-05-18",
    "tarih": "2026-05-18",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Mon May 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.05.2026_OR-2029_2026-05-19",
    "tarih": "2026-05-19",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue May 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.05.2026_OR-2040_2026-05-19",
    "tarih": "2026-05-19",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Tue May 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.05.2026_OR-3125_2026-05-20",
    "tarih": "2026-05-20",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Wed May 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.05.2026_OR-3192_2026-05-20",
    "tarih": "2026-05-20",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Wed May 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.05.2026_OR-1019_2026-05-22",
    "tarih": "2026-05-22",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri May 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.05.2026_OR-1020_2026-05-22",
    "tarih": "2026-05-22",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri May 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "960 SAATLİK BAKIM\nBAŞLANGIÇ TARİHİ: 20.01.2026\nPOWER ON CHECK BAŞLANGIÇ TARİHİ : 14.05.2026"
  },
  {
    "id": "22.05.2026_OR-3125_2026-05-22",
    "tarih": "2026-05-22",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Fri May 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.05.2026_OR-3192_2026-05-22",
    "tarih": "2026-05-22",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri May 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.05.2026_OR-2027_2026-05-22",
    "tarih": "2026-05-22",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 09:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "AYLIK BAKIM"
  },
  {
    "id": "22.05.2026_OR-2027_2026-05-22",
    "tarih": "2026-05-22",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 10:30:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "AYLIK BAKIM"
  },
  {
    "id": "23.05.2026_OR-2029_2026-05-23",
    "tarih": "2026-05-23",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat May 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.05.2026_OR-2029_2026-05-24",
    "tarih": "2026-05-24",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sun May 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.05.2026_OR-2040_2026-05-24",
    "tarih": "2026-05-24",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sun May 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.05.2026_OR-1019_2026-05-24",
    "tarih": "2026-05-24",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun May 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.05.2026_OR-2027_2026-05-25",
    "tarih": "2026-05-25",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon May 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.05.2026_OR-2030_2026-05-25",
    "tarih": "2026-05-25",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Mon May 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.05.2026_OR-2029_2026-05-26",
    "tarih": "2026-05-26",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue May 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.05.2026_OR-2040_2026-05-26",
    "tarih": "2026-05-26",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Tue May 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.05.2026_OR-2029_2026-05-29",
    "tarih": "2026-05-29",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Fri May 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.05.2026_OR-2040_2026-05-29",
    "tarih": "2026-05-29",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Fri May 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.05.2026_OR-3127_2026-05-30",
    "tarih": "2026-05-30",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat May 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.05.2026_OR-3125_2026-05-30",
    "tarih": "2026-05-30",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Sat May 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.05.2026_OR-0177_2026-05-30",
    "tarih": "2026-05-30",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Sat May 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "08.05.2026 TARİHİNDE YILLIK BAKIMLARI YAPILMAK ÜZERE EMAIR BAKIM MERKEZİNE TESLİM EDİLMİŞTİR"
  },
  {
    "id": "31.05.2026_OR-3127_2026-05-31",
    "tarih": "2026-05-31",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun May 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.05.2026_OR-3125_2026-05-31",
    "tarih": "2026-05-31",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Sun May 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.06.2026_OR-1018_2026-06-01",
    "tarih": "2026-06-01",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Mon Jun 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.06.2026_OR-1019_2026-06-01",
    "tarih": "2026-06-01",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Mon Jun 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.06.2026_OR-1020_2026-06-01",
    "tarih": "2026-06-01",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Mon Jun 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "960 SAATLİK BAKIM\nBAŞLANGIÇ TARİHİ: 20.01.2026\nPOWER ON CHECK BAŞLANGIÇ TARİHİ : 14.05.2026 \nA.C./H:969:00-971:00 DA 9-11 TORQUE CHECK UYGULAMALARI YAPILACAK"
  },
  {
    "id": "01.06.2026_OR-1018_08:00",
    "tarih": "2026-06-01",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 08:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": ""
  },
  {
    "id": "02.06.2026_OR-3133_2026-06-02",
    "tarih": "2026-06-02",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Tue Jun 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.06.2026_OR-1839_2026-06-02",
    "tarih": "2026-06-02",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Tue Jun 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.06.2026_OR-1020_2026-06-02",
    "tarih": "2026-06-02",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Tue Jun 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "TB",
    "description": "960 SAATLİK BAKIM\nBAŞLANGIÇ TARİHİ: 20.01.2026\nPOWER ON CHECK BAŞLANGIÇ TARİHİ : 14.05.2026 \nA.C./H:969:00-971:00 DA 9-11 TORQUE CHECK UYGULAMALARI YAPILACAK"
  },
  {
    "id": "03.06.2026_OR-3131_2026-06-03",
    "tarih": "2026-06-03",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Jun 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.06.2026_OR-2040_16:30",
    "tarih": "2026-06-03",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 16:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "25H Bakım"
  },
  {
    "id": "03.06.2026_OR-2040_2026-06-03",
    "tarih": "2026-06-03",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Wed Jun 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 22:28:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "25H Bakım"
  },
  {
    "id": "04.06.2026_OR-1020_2026-06-03",
    "tarih": "2026-06-04",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Wed Jun 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "960 SAATLİK BAKIM\nBAŞLANGIÇ TARİHİ: 20.01.2026\nA.C./H:969:00-971:00 DA 9-11 TORQUE CHECK"
  },
  {
    "id": "04.06.2026_OR-1839_2026-06-04",
    "tarih": "2026-06-04",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Jun 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.06.2026_OR-3131_2026-06-04",
    "tarih": "2026-06-04",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Jun 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.06.2026_OR-3192_2026-06-04",
    "tarih": "2026-06-04",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Thu Jun 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.06.2026_OR-1018_2026-06-04",
    "tarih": "2026-06-04",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Thu Jun 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.06.2026_OR-1020_2026-06-04",
    "tarih": "2026-06-04",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Thu Jun 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "960 SAATLİK BAKIM\nBAŞLANGIÇ TARİHİ: 20.01.2026\nBİTİŞ TARİHİ : 09.06.2026\nA.C./H:969:00-971:00 DA 9-11 TORQUE CHECK"
  },
  {
    "id": "05.06.2026_OR-1020_2026-06-05",
    "tarih": "2026-06-05",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Jun 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "960 SAATLİK BAKIM\nBAŞLANGIÇ TARİHİ: 20.01.2026\nBİTİŞ TARİHİ : 09.06.2026"
  },
  {
    "id": "05.06.2026_OR-3192_2026-06-05",
    "tarih": "2026-06-05",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Jun 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.06.2026_OR-3126_2026-06-05",
    "tarih": "2026-06-05",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Jun 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.06.2026_OR-1019_2026-06-07",
    "tarih": "2026-06-07",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Jun 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.06.2026_OR-1020_2026-06-08",
    "tarih": "2026-06-08",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Mon Jun 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.06.2026_OR-2027_2026-06-08",
    "tarih": "2026-06-08",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon Jun 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.06.2026_OR-2030_2026-06-08",
    "tarih": "2026-06-08",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Mon Jun 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.06.2026_OR-2037_2026-06-08",
    "tarih": "2026-06-08",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Mon Jun 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 15:33:00 GMT+0156 (Türkiye Standard Time)",
    "status": "A",
    "description": "1) YILLIK BAKIM TAMAMLANDI.\nBAŞLANGIÇ TARİHİ: 17.10.2025 / BİTİŞ TARİHİ: 20.05.2026 TEST UÇUŞU YAPILACAK.\n2)08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "08.06.2026_OR-2037_15:25",
    "tarih": "2026-06-08",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 15:25:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "TB",
    "description": "1) YILLIK BAKIM TAMAMLANDI.\nBAŞLANGIÇ TARİHİ: 17.10.2025 / BİTİŞ TARİHİ: 20.05.2026 TEST UÇUŞU YAPILACAK.\n2)08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "09.06.2026_OR-1020_2026-06-09",
    "tarih": "2026-06-09",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Tue Jun 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.06.2026_OR-1018_2026-06-09",
    "tarih": "2026-06-09",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Tue Jun 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.06.2026_OR-3127_2026-06-09",
    "tarih": "2026-06-09",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Tue Jun 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.06.2026_OR-3125_2026-06-09",
    "tarih": "2026-06-09",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Tue Jun 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.06.2026_OR-2027_2026-06-10",
    "tarih": "2026-06-10",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Wed Jun 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.06.2026_OR-2030_2026-06-10",
    "tarih": "2026-06-10",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Wed Jun 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.06.2026_OR-2029_2026-06-10",
    "tarih": "2026-06-10",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Wed Jun 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.06.2026_OR-2040_2026-06-10",
    "tarih": "2026-06-10",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Wed Jun 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.06.2026_OR-1019_2026-06-11",
    "tarih": "2026-06-11",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Thu Jun 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.06.2026_OR-3131_2026-06-11",
    "tarih": "2026-06-11",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Jun 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.06.2026_OR-3127_2026-06-11",
    "tarih": "2026-06-11",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Thu Jun 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.06.2026_OR-3125_2026-06-11",
    "tarih": "2026-06-11",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Thu Jun 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.06.2026_OR-3192_2026-06-11",
    "tarih": "2026-06-11",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Thu Jun 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.06.2026_OR-3131_2026-06-12",
    "tarih": "2026-06-12",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Fri Jun 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.06.2026_OR-3192_2026-06-12",
    "tarih": "2026-06-12",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Jun 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.06.2026_OR-2022_15:00",
    "tarih": "2026-06-12",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 15:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 01.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMANA BİLGİ VERİLDİ."
  },
  {
    "id": "12.06.2026_OR-1020_2026-06-12",
    "tarih": "2026-06-12",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Jun 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "EFES MEYDANA TÖREN MAKSATLI İNTİKAL (12-13.06.2026)"
  },
  {
    "id": "12.06.2026_OR-2022_2026-06-12",
    "tarih": "2026-06-12",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Fri Jun 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 17:11:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 01.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMANA BİLGİ VERİLDİ."
  },
  {
    "id": "12.06.2026_OR-3126_2026-06-12",
    "tarih": "2026-06-12",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Jun 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.06.2026_OR-2040_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.06.2026_OR-2029_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.06.2026_OR-2022_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 01.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMANA BİLGİ VERİLDİ."
  },
  {
    "id": "13.06.2026_OR-1018_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.06.2026_OR-1020_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.06.2026_OR-3126_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.06.2026_OR-3192_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.06.2026_OR-3131_2026-06-13",
    "tarih": "2026-06-13",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Jun 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.06.2026_OR-2027_2026-06-14",
    "tarih": "2026-06-14",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sun Jun 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.06.2026_OR-2030_2026-06-14",
    "tarih": "2026-06-14",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sun Jun 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.06.2026_OR-2026_2026-06-14",
    "tarih": "2026-06-14",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sun Jun 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.06.2026_OR-2039_2026-06-14",
    "tarih": "2026-06-14",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sun Jun 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.06.2026_OR-1018_2026-06-14",
    "tarih": "2026-06-14",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sun Jun 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.06.2026_OR-1020_2026-06-14",
    "tarih": "2026-06-14",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sun Jun 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.06.2026_OR-2027_2026-06-15",
    "tarih": "2026-06-15",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon Jun 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.06.2026_OR-2030_2026-06-15",
    "tarih": "2026-06-15",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Mon Jun 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.06.2026_OR-3126_2026-06-15",
    "tarih": "2026-06-15",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Mon Jun 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.06.2026_OR-3133_2026-06-15",
    "tarih": "2026-06-15",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Mon Jun 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.06.2026_OR-3192_2026-06-15",
    "tarih": "2026-06-15",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Mon Jun 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.06.2026_OR-2022_2026-06-15",
    "tarih": "2026-06-15",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Mon Jun 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 01.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMANA BİLGİ VERİLDİ."
  },
  {
    "id": "15.06.2026_OR-3125_2026-06-15",
    "tarih": "2026-06-15",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Mon Jun 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.06.2026_OR-2031_2026-06-16",
    "tarih": "2026-06-16",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Tue Jun 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.06.2026_OR-3192_2026-06-16",
    "tarih": "2026-06-16",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Tue Jun 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.06.2026_OR-3133_2026-06-16",
    "tarih": "2026-06-16",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Tue Jun 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.06.2026_OR-2022_2026-06-16",
    "tarih": "2026-06-16",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Tue Jun 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 16.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMAN MALZEMEYİ GETİRDİ. ANTALYA'YA GÖNDERİLECEK. ORDA UYGULANACAK."
  },
  {
    "id": "16.06.2026_OR-2023_2026-06-16",
    "tarih": "2026-06-16",
    "kuyrukNo": "OR-2023",
    "tip": "AT-802",
    "startTime": "Tue Jun 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 11.03.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUP İPTAL EDİLMİŞTİR. 08.05.2026 TARİHLİ MEKTUBA GÖRE LIGHT OVERHAUL GÖNDERİLMESİ İSTENMİŞTİR."
  },
  {
    "id": "16.06.2026_OR-2026_2026-06-16",
    "tarih": "2026-06-16",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Tue Jun 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.06.2026_OR-2039_2026-06-16",
    "tarih": "2026-06-16",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Tue Jun 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.06.2026_OR-2023_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-2023",
    "tip": "AT-802",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 11.03.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUP İPTAL EDİLMİŞTİR. 08.05.2026 TARİHLİ MEKTUBA GÖRE LIGHT OVERHAUL GÖNDERİLMESİ İSTENMİŞTİR."
  },
  {
    "id": "17.06.2026_OR-2037_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "17.06.2026_OR-2038_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-2038",
    "tip": "AT-802",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "SON KONTROL UÇUŞU OLACAK."
  },
  {
    "id": "17.06.2026_OR-3192_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.06.2026_OR-3125_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.06.2026_OR-1839_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.06.2026_OR-2022_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 16.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMAN MALZEMEYİ GETİRDİ. ANTALYA'YA GÖNDERİLECEK. ORDA UYGULANACAK."
  },
  {
    "id": "17.06.2026_OR-2027_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.06.2026_OR-2030_2026-06-17",
    "tarih": "2026-06-17",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Wed Jun 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-2025_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2025",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "KK",
    "description": "KAZA-KIRIM (HIRVATİSTAN/SENJ)\n13.11.2025-18:25 CİVARI SENJ KENTİ YAKINLARI"
  },
  {
    "id": "18.06.2026_OR-3125_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-0177_10:17",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Sat Dec 30 1899 10:17:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 13:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-3126_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-2024_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "1) 12.11.2025 TARİHİNDE HIRVATİSTANA BOYA İÇİN GİTTİ. \n2) 13.02.2026 TARİHİNDE GÖVDE BOYA VE YILLIK BAKIM İŞLEMİ İÇİN ZAGREB'DE BULUNAN ZTC BAKIM MERKEZİNE TESLİM EDİLDİ.\n3) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ."
  },
  {
    "id": "18.06.2026_OR-2023_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2023",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 11.03.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUP İPTAL EDİLMİŞTİR. 08.05.2026 TARİHLİ MEKTUBA GÖRE LIGHT OVERHAUL GÖNDERİLMESİ İSTENMİŞTİR.\n3) 18.06.2026 TARİHİNDE MOTOR SÖKÜMÜNE BAŞLANMIŞTIR.DORMAK FİRMASI İLE GÖNDERİLECEK."
  },
  {
    "id": "18.06.2026_OR-2022_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 16.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMAN MALZEMEYİ GETİRDİ. ANTALYA'YA GÖNDERİLECEK. ORDA UYGULANACAK."
  },
  {
    "id": "18.06.2026_OR-2030_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-2027_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-2040_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-2029_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.06.2026_OR-1018_2026-06-18",
    "tarih": "2026-06-18",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Thu Jun 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.06.2026_OR-3127_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.06.2026_OR-2024_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 19.06.2026 TARİHİNDE HIRVATİSTAN'DA YILLIK BAKIM BİTİRİLDİ.UÇAK TESLİM ALINDI.UYGUN ZAMANDA TÜRKİYE'YE İNTİKAL EDECEK\n3) UÇUŞA ELVERİŞLİLİK DOSYASI İMZA İÇİN GÖNDERİLDİ.İMZALANMASINA MÜTAKİP UÇAK FAAL OLACAK."
  },
  {
    "id": "19.06.2026_OR-2029_07:30",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 07:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "25-50 SAATLİK BAKIM"
  },
  {
    "id": "19.06.2026_OR-2029_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 12:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.06.2026_OR-2022_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 16.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMAN MALZEMEYİ GETİRDİ. ANTALYA'YA GÖNDERİLECEK. ORDA UYGULANACAK."
  },
  {
    "id": "19.06.2026_OR-1839_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Çanakkale Anafartalar yangını ve keşif uçuşu"
  },
  {
    "id": "19.06.2026_OR-1018_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.06.2026_OR-2027_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.06.2026_OR-2030_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.06.2026_OR-1019_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.06.2026_OR-1020_2026-06-19",
    "tarih": "2026-06-19",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-2029_2026-06-20",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Jun 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-2040_10:02",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 10:02:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-2040_2026-06-20",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Jun 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-3126_2026-06-19",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Jun 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-3131_2026-06-20",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Jun 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-1018_2026-06-20",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Jun 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-3126_2026-06-20",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Jun 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.06.2026_OR-2024_2026-06-20",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sat Jun 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ."
  },
  {
    "id": "20.06.2026_OR-2022_2026-06-20",
    "tarih": "2026-06-20",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Jun 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) SL-422 UYGULANDI. P/N:13504-1 SUPPORT STRAP İSİMLİ MALZEMENİN OLMADIĞI TESPİT EDİLDİ. 16.06.2026 TARİHİNDE İSPANYOL TEKNİK DANIŞMAN MALZEMEYİ GETİRDİ. ANTALYA'YA GÖNDERİLECEK. ORDA UYGULANACAK."
  },
  {
    "id": "21.06.2026_OR-2027_08:00",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 08:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": ""
  },
  {
    "id": "21.06.2026_OR-2024_07:00",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 07:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ."
  },
  {
    "id": "21.06.2026_OR-2030_08:30",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 08:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Test ucusu gerekli"
  },
  {
    "id": "21.06.2026_OR-2030_2026-06-21",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sun Jun 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.06.2026_OR-2027_2026-06-21",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sun Jun 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Frds sistem arizasi"
  },
  {
    "id": "21.06.2026_OR-1019_06:00",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 06:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "40 Saat /30 Günlük  ve korozyon önleyici bakım"
  },
  {
    "id": "21.06.2026_OR-2027_12:09",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 12:09:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Frds sistem arizasi"
  },
  {
    "id": "21.06.2026_OR-2024_2026-06-21",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sun Jun 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ."
  },
  {
    "id": "21.06.2026_OR-1839_2026-06-21",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sun Jun 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "İzmir kuzeyi ve Balıkesir keşif gözetleme-Esenboğa"
  },
  {
    "id": "21.06.2026_OR-1019_2026-06-21",
    "tarih": "2026-06-21",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 20:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.06.2026_OR-2026_2026-06-22",
    "tarih": "2026-06-22",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Mon Jun 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.06.2026_OR-2039_2026-06-22",
    "tarih": "2026-06-22",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Mon Jun 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.06.2026_OR-3133_10:00",
    "tarih": "2026-06-22",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 10:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "900H FUEL NOZZLE DEĞİŞİMİ (SKYLİNE)"
  },
  {
    "id": "22.06.2026_OR-3133_2026-06-22",
    "tarih": "2026-06-22",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Mon Jun 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "900H FUEL NOZZLE DEĞİŞİMİ (SKYLİNE)"
  },
  {
    "id": "22.06.2026_OR-1020_2026-06-22",
    "tarih": "2026-06-22",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Mon Jun 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.06.2026_OR-1019_2026-06-22",
    "tarih": "2026-06-22",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-2027_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-2024_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ."
  },
  {
    "id": "23.06.2026_OR-2040_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-2029_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-2022_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "23.06.2026_OR-2037_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "23.06.2026_OR-1839_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-3126_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-3127_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-1020_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-3133_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 14:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.06.2026_OR-2023_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2023",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 11.03.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUP İPTAL EDİLMİŞTİR. 08.05.2026 TARİHLİ MEKTUBA GÖRE LIGHT OVERHAUL GÖNDERİLMESİ İSTENMİŞTİR.\n3) 23.06.2026 TARİHİNDE LIGHT OVERHAUL GİTMESİ İÇİN MOTOR SÖKÜLMÜŞTÜR. DORMAK FİRMASI İLE GÖNDERİLECEK."
  },
  {
    "id": "23.06.2026_OR-2030_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1- VENTRAL FIN  HASARLANMASI"
  },
  {
    "id": "23.06.2026_OR-2039_2026-06-23",
    "tarih": "2026-06-23",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Tue Jun 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.06.2026_OR-2029_10:15",
    "tarih": "2026-06-24",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 10:15:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Motor yjkamasi"
  },
  {
    "id": "24.06.2026_OR-2029_2026-06-24",
    "tarih": "2026-06-24",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Wed Jun 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 11:04:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.06.2026_OR-2040_11:06",
    "tarih": "2026-06-24",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 11:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Motor yıkaması"
  },
  {
    "id": "24.06.2026_OR-2040_2026-06-24",
    "tarih": "2026-06-24",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Wed Jun 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 12:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.06.2026_OR-2025_2026-06-24",
    "tarih": "2026-06-24",
    "kuyrukNo": "OR-2025",
    "tip": "AT-802",
    "startTime": "Wed Jun 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "KK",
    "description": "KAZA-KIRIM (HIRVATİSTAN/SENJ)\n13.11.2025-18:25 CİVARI SENJ KENTİ YAKINLARI"
  },
  {
    "id": "25.06.2026_OR-3125_2026-06-24",
    "tarih": "2026-06-25",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Wed Jun 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.06.2026_OR-3131_2026-06-25",
    "tarih": "2026-06-25",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Jun 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.06.2026_OR-3126_2026-06-25",
    "tarih": "2026-06-25",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Thu Jun 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.06.2026_OR-3127_2026-06-25",
    "tarih": "2026-06-25",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Thu Jun 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.06.2026_OR-1020_2026-06-26",
    "tarih": "2026-06-26",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Jun 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.06.2026_OR-2031_11:08",
    "tarih": "2026-06-26",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 11:08:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Inis takimi arizasi"
  },
  {
    "id": "26.06.2026_OR-2031_2026-06-26",
    "tarih": "2026-06-26",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Fri Jun 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 12:25:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.06.2026_OR-2024_16:00",
    "tarih": "2026-06-26",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 16:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 26.06.2026 TARİHİNDE YANGIN GÖREVİ ESNASINDA DENİZDEN SU ALIMI YAPARKEN SOL KANAT SUYLA TEMAS ETMİŞ VE HASARLANMIŞTIR. MÜTEAKİBEN UÇAĞI SUDAN KURTARMAK İÇİN TEKRAR SUDA KOŞTURULDUĞUNDA GÖVDEDE DE HASARLAR OLUŞMUŞTUR. UÇAK, DENİZDE UYGUN BİR NOKTAYA ÇEKİLEREK EMNİYETE ALINMIŞTIR."
  },
  {
    "id": "27.06.2026_OR-2031_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-2030_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 12:20:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-2026_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-2037_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "27.06.2026_OR-2022_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "27.06.2026_OR-2027_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-2039_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-3192_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-3127_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-3125_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.06.2026_OR-1018_2026-06-27",
    "tarih": "2026-06-27",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Jun 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.06.2026_OR-1839_2026-06-28",
    "tarih": "2026-06-28",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sun Jun 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Esenboğa’dan Balıkesir merkez havalimanına intikal"
  },
  {
    "id": "28.06.2026_OR-1019_2026-06-28",
    "tarih": "2026-06-28",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Jun 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.06.2026_OR-1020_2026-06-28",
    "tarih": "2026-06-28",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sun Jun 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.06.2026_OR-2029_2026-06-28",
    "tarih": "2026-06-28",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sun Jun 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.06.2026_OR-2040_2026-06-28",
    "tarih": "2026-06-28",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sun Jun 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.06.2026_OR-2039_2026-06-28",
    "tarih": "2026-06-28",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sun Jun 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.06.2026_OR-3125_2026-06-28",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Sun Jun 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.06.2026_OR-3127_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.06.2026_OR-2030_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) 23.06.2026 TARİHİNDE ÇANAKKALE'DE SU ALIMI ESNASINDA SUYLASERT TEMAS YAPILMIŞ VENTRAL FİN VE KİCKER STRUT HASARLANMIŞTIR."
  },
  {
    "id": "29.06.2026_OR-2022_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "29.06.2026_OR-2037_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "29.06.2026_OR-2026_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.06.2026_OR-2027_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.06.2026_OR-2024_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 26.06.2026 TARİHİNDE  DENİZDEN SU ALIMI ESNASINDA  SOL KANAT SUYLA TEMAS ETMİŞ KANAT VE GÖVDE HASARLANMIŞTIR. 27.06.2026 TARİHİNDE UÇAK DENİZDEN KURTARILIP KARAYA ALINARAK  EMNİYETE ALINMIŞTIR.\n3)28.06.2026 TARİHİNDE UÇAK GENEL KONTROLLERİ YAPILDI.MOTOR BAROSKOP KONTOLÜ VE PROPELLER HASAR YÖNÜNDEN KONTROL YAPILDI.SIKINTI GÖRÜLMEDİ.\n4) 29.06.2026 TARİHİNDE  MOTOR YIKAMASI YAPILDI. \n5) 29.06.2026 TARİHİNDE AİLERON,FLAP,FLOAT,WİNG TİP LEFT VE VENTRAL FİN ONARIMI İÇİN TALEP FORMU OLUŞTURULDU.DESTEK HİZMETLERİNE GÖNDERİLDİ."
  },
  {
    "id": "29.06.2026_OR-2039_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.06.2026_OR-3131_2026-06-29",
    "tarih": "2026-06-29",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Mon Jun 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.06.2026_OR-2039_09:00",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 09:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "25H BAKIM"
  },
  {
    "id": "30.06.2026_OR-2040_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.06.2026_OR-3133_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.06.2026_OR-3126_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.06.2026_OR-2022_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "30.06.2026_OR-2026_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.06.2026_OR-2037_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "30.06.2026_OR-2027_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.06.2026_OR-3127_2026-06-30",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Tue Jun 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.06.2026_OR-2039_",
    "tarih": "2026-06-30",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 13:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.07.2026_OR-0177_2026-07-01",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Wed Jul 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.07.2026_OR-1018_07:00",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 07:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 11:38:00 GMT+0156 (Türkiye Standard Time)",
    "status": "B",
    "description": "40 SAAT/ 30 GÜNLÜK- 90 GÜNLÜK KOROZYON ÖNLEYİCİ BAKIM"
  },
  {
    "id": "01.07.2026_OR-2030_2026-07-01",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Wed Jul 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.07.2026_OR-2022_2026-07-01",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Wed Jul 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "01.07.2026_OR-1018_2026-07-01",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Wed Jul 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.07.2026_OR-2037_2026-07-01",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Wed Jul 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "01.07.2026_OR-2026_2026-07-01",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Wed Jul 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.07.2026_OR-3131_2026-07-01",
    "tarih": "2026-07-01",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Jul 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.07.2026_OR-2039_2026-07-02",
    "tarih": "2026-07-02",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Thu Jul 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.07.2026_OR-2027_2026-07-02",
    "tarih": "2026-07-02",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Thu Jul 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.07.2026_OR-3127_2026-07-03",
    "tarih": "2026-07-02",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.07.2026_OR-3192_2026-07-03",
    "tarih": "2026-07-02",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.07.2026_OR-3192_2026-07-03",
    "tarih": "2026-07-03",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.07.2026_OR-3127_2026-07-03",
    "tarih": "2026-07-03",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.07.2026_OR-2022_2026-07-03",
    "tarih": "2026-07-03",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "03.07.2026_OR-2026_2026-07-03",
    "tarih": "2026-07-03",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.07.2026_OR-2037_2026-07-03",
    "tarih": "2026-07-03",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "03.07.2026_OR-2024_2026-07-03",
    "tarih": "2026-07-03",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Fri Jul 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 26.06.2026 TARİHİNDE  DENİZDEN SU ALIMI ESNASINDA  SOL KANAT SUYLA TEMAS ETMİŞ KANAT VE GÖVDE HASARLANMIŞTIR. 27.06.2026 TARİHİNDE UÇAK DENİZDEN KURTARILIP KARAYA ALINARAK  EMNİYETE ALINMIŞTIR.\n3)28.06.2026 TARİHİNDE UÇAK GENEL KONTROLLERİ YAPILDI.MOTOR BAROSKOP KONTOLÜ VE PROPELLER HASAR YÖNÜNDEN KONTROL YAPILDI.SIKINTI GÖRÜLMEDİ.\n4) 29.06.2026 TARİHİNDE  MOTOR YIKAMASI YAPILDI. \n5) 29.06.2026 TARİHİNDE AİLERON,FLAP,FLOAT,WİNG TİP LEFT VE VENTRAL FİN ONARIMI İÇİN TALEP FORMU OLUŞTURULDU.DESTEK HİZMETLERİNE GGÖNDERİLDİ."
  },
  {
    "id": "04.07.2026_OR-1020_09:00",
    "tarih": "2026-07-04",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 09:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "40 saat/30 gün bakım, TUSAŞ yazılım güncellemesi"
  },
  {
    "id": "04.07.2026_OR-1020_2026-07-04",
    "tarih": "2026-07-04",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Jul 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.07.2026_OR-1019_20:00",
    "tarih": "2026-07-04",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 20:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "TUSAŞ servis bülten uygulaması"
  },
  {
    "id": "04.07.2026_OR-1019_2026-07-04",
    "tarih": "2026-07-04",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Jul 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 21:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.07.2026_OR-2022_2026-07-05",
    "tarih": "2026-07-05",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sun Jul 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "05.07.2026_OR-3126_2026-07-05",
    "tarih": "2026-07-05",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sun Jul 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.07.2026_OR-3127_2026-07-05",
    "tarih": "2026-07-05",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Jul 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.07.2026_OR-2039_2026-07-05",
    "tarih": "2026-07-05",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sun Jul 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.07.2026_OR-1839_2026-07-05",
    "tarih": "2026-07-05",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sun Jul 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "İzmir Milas arası görüntü aktarımı"
  },
  {
    "id": "05.07.2026_OR-3133_2026-07-05",
    "tarih": "2026-07-05",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sun Jul 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.07.2026_OR-1019_2026-07-05",
    "tarih": "2026-07-05",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Jul 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.07.2026_OR-3127_2026-07-06",
    "tarih": "2026-07-06",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Mon Jul 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.07.2026_OR-3131_2026-07-06",
    "tarih": "2026-07-06",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Mon Jul 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.07.2026_OR-3126_2026-07-06",
    "tarih": "2026-07-06",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Mon Jul 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.07.2026_OR-2027_2026-07-07",
    "tarih": "2026-07-07",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Tue Jul 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.07.2026_OR-2030_2026-07-07",
    "tarih": "2026-07-07",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Tue Jul 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.07.2026_OR-2039_2026-07-07",
    "tarih": "2026-07-07",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Tue Jul 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.07.2026_OR-3126_2026-07-07",
    "tarih": "2026-07-07",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Tue Jul 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.07.2026_OR-3125_2026-07-07",
    "tarih": "2026-07-07",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Tue Jul 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.07.2026_OR-3133_2026-07-07",
    "tarih": "2026-07-07",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Tue Jul 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.07.2026_OR-3127_2026-07-07",
    "tarih": "2026-07-07",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Tue Jul 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.07.2026_OR-2029_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.07.2026_OR-1020_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.07.2026_OR-2022_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "08.07.2026_OR-2024_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 26.06.2026 TARİHİNDE  DENİZDEN SU ALIMI ESNASINDA  SOL KANAT SUYLA TEMAS ETMİŞ KANAT VE GÖVDE HASARLANMIŞTIR. 27.06.2026 TARİHİNDE UÇAK DENİZDEN KURTARILIP KARAYA ALINARAK  EMNİYETE ALINMIŞTIR.\n3)28.06.2026 TARİHİNDE UÇAK GENEL KONTROLLERİ YAPILDI.MOTOR BAROSKOP KONTOLÜ VE PROPELLER HASAR YÖNÜNDEN KONTROL YAPILDI.SIKINTI GÖRÜLMEDİ.\n4) 08.07.2026 TARİHİNDE  MOTOR YIKAMASI YAPILDI. \n5) 29.06.2026 TARİHİNDE AİLERON,FLAP,FLOAT,WİNG TİP LEFT VE VENTRAL FİN ONARIMI İÇİN TALEP FORMU OLUŞTURULDU.DESTEK HİZMETLERİNE GÖNDERİLDİ.\n6)08.07 2026 TARİHİNDE TUSAŞ EKİBİ TARAFINDAN ÇANAKKALE'DE PARÇALARIN DEĞİŞİMİNE VE ONARIMINA BAŞLANMIŞTIR."
  },
  {
    "id": "08.07.2026_OR-3126_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.07.2026_OR-3131_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.07.2026_OR-3133_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.07.2026_OR-3127_2026-07-08",
    "tarih": "2026-07-08",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Wed Jul 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.07.2026_OR-2022_2026-07-09",
    "tarih": "2026-07-09",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Thu Jul 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "09.07.2026_OR-3125_2026-07-09",
    "tarih": "2026-07-09",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Thu Jul 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.07.2026_OR-3127_2026-07-09",
    "tarih": "2026-07-09",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Thu Jul 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.07.2026_OR-3192_2026-07-09",
    "tarih": "2026-07-09",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Thu Jul 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.07.2026_OR-1839_2026-07-09",
    "tarih": "2026-07-09",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Jul 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Balıkesir merkez havalimanından Ankara meydanına dönüş."
  },
  {
    "id": "10.07.2026_OR-3127_09:00",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 09:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50H BAKIM"
  },
  {
    "id": "10.07.2026_OR-1019_2026-07-10",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri Jul 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.07.2026_OR-2022_15:50",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 15:50:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n4) 25 H BAKIM"
  },
  {
    "id": "10.07.2026_OR-3127_2026-07-10",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Jul 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 16:40:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.07.2026_OR-0177_2026-07-10",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Fri Jul 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.07.2026_OR-2022_2026-07-10",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Fri Jul 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 17:34:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "10.07.2026_OR-3192_2026-07-10",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Jul 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.07.2026_OR-3126_2026-07-10",
    "tarih": "2026-07-10",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Jul 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.07.2026_OR-1019_2026-07-11",
    "tarih": "2026-07-11",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Jul 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.07.2026_OR-1020_2026-07-11",
    "tarih": "2026-07-11",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Jul 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.07.2026_OR-3192_2026-07-11",
    "tarih": "2026-07-11",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Jul 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.07.2026_OR-3131_2026-07-11",
    "tarih": "2026-07-11",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Jul 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.07.2026_OR-3125_2026-07-11",
    "tarih": "2026-07-11",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Sat Jul 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.07.2026_OR-3126_2026-07-11",
    "tarih": "2026-07-11",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Jul 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "11.07.2026_OR-3133_2026-07-11",
    "tarih": "2026-07-11",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sat Jul 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.07.2026_OR-2024_2026-07-12",
    "tarih": "2026-07-12",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sun Jul 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) 26.06.2026 TARİHİNDE  DENİZDEN SU ALIMI ESNASINDA  SOL KANAT SUYLA TEMAS ETMİŞ KANAT VE GÖVDE HASARLANMIŞTIR. 27.06.2026 TARİHİNDE UÇAK DENİZDEN KURTARILIP KARAYA ALINARAK  EMNİYETE ALINMIŞTIR.\n3)28.06.2026 TARİHİNDE UÇAK GENEL KONTROLLERİ YAPILDI.MOTOR BAROSKOP KONTOLÜ VE PROPELLER HASAR YÖNÜNDEN KONTROL YAPILDI.SIKINTI GÖRÜLMEDİ.\n4) 12.07.2026 TARİHİNDE  MOTOR YIKAMASI YAPILDI. \n5) 29.06.2026 TARİHİNDE AİLERON,FLAP,FLOAT,WİNG TİP LEFT VE VENTRAL FİN ONARIMI İÇİN TALEP FORMU OLUŞTURULDU.DESTEK HİZMETLERİNE GÖNDERİLDİ.\n6)08.07 2026 TARİHİNDE TUSAŞ EKİBİ TARAFINDAN ÇANAKKALE'DE PARÇALARIN DEĞİŞİMİNE VE ONARIMINA BAŞLANMIŞTIR."
  },
  {
    "id": "12.07.2026_OR-3133_2026-07-12",
    "tarih": "2026-07-12",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sun Jul 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.07.2026_OR-3126_2026-07-12",
    "tarih": "2026-07-12",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sun Jul 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.07.2026_OR-3192_2026-07-12",
    "tarih": "2026-07-12",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sun Jul 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.07.2026_OR-1019_2026-07-13",
    "tarih": "2026-07-13",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Mon Jul 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.07.2026_OR-1020_2026-07-13",
    "tarih": "2026-07-13",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Mon Jul 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.07.2026_OR-3126_2026-07-13",
    "tarih": "2026-07-13",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Mon Jul 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-0177_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-3125_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-2027_18:15",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 18:15:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "25H bakim"
  },
  {
    "id": "14.07.2026_OR-2026_18:34",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 18:34:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "Motor Yıkaması"
  },
  {
    "id": "14.07.2026_OR-2037_18:35",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 18:35:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\nMotor Yıkaması"
  },
  {
    "id": "14.07.2026_OR-2026_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-2037_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "14.07.2026_OR-2022_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "14.07.2026_OR-2030_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-2039_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-3126_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-3192_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-2024_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 21:16:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) FIREBOSS GÖREVİ YAPAMAZ."
  },
  {
    "id": "14.07.2026_OR-2029_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-2040_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.07.2026_OR-2031_2026-07-14",
    "tarih": "2026-07-14",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Tue Jul 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.07.2026_OR-1020_2026-07-15",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Wed Jul 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.07.2026_OR-1019_2026-07-15",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Wed Jul 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.07.2026_OR-1018_2026-07-15",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Wed Jul 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.07.2026_OR-2040_12:42",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 12:42:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "25H Bakım Motor yıkaması burun lastik degisimi"
  },
  {
    "id": "15.07.2026_OR-2029_14:17",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 14:17:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Asimetrik scoop ikazi"
  },
  {
    "id": "15.07.2026_OR-2029_14:18",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 14:18:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "ASİMETRİK SCOOP ARIZASI"
  },
  {
    "id": "15.07.2026_OR-2040_2026-07-15",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Wed Jul 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 17:18:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.07.2026_OR-3126_2026-07-15",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Wed Jul 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.07.2026_OR-2029_2026-07-15",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Wed Jul 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:02:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.07.2026_OR-3131_2026-07-15",
    "tarih": "2026-07-15",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Jul 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.07.2026_OR-1019_2026-07-16",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Thu Jul 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.07.2026_OR-1020_2026-07-16",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Thu Jul 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.07.2026_OR-1018_2026-07-16",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Thu Jul 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.07.2026_OR-1839_2026-07-16",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Jul 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.07.2026_OR-3131_2026-07-16",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Jul 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.07.2026_OR-2030_16:41",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 16:41:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "25 H BAKIM"
  },
  {
    "id": "16.07.2026_OR-2031_18:30",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 18:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "Motor Yıkaması"
  },
  {
    "id": "16.07.2026_OR-2030_2026-07-16",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Thu Jul 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 19:44:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.07.2026_OR-2031_2026-07-16",
    "tarih": "2026-07-16",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Thu Jul 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:22:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-2029_08:30",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 08:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "Motor Yıkaması"
  },
  {
    "id": "17.07.2026_OR-3127_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-3131_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 17:30:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-2029_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 21:10:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-1019_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-1020_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Helitak Sistemi Arızası Mevcut"
  },
  {
    "id": "17.07.2026_OR-3131_13:15",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 13:15:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 H BAKIM"
  },
  {
    "id": "17.07.2026_OR-0177_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-3126_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-2031_18:56",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 18:56:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "17.07.2027 TARİHİNDE SÖKE YANGININDA SU ALMA ESNASINDA SOL FLOAT HASARLANMIŞTIR."
  },
  {
    "id": "17.07.2026_OR-2029_19:19",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 19:19:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "25 H BAKIM"
  },
  {
    "id": "17.07.2026_OR-2037_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "17.07.2026_OR-2026_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.07.2026_OR-2022_2026-07-17",
    "tarih": "2026-07-17",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Fri Jul 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)  İLK 100 SAATLİK BAKIMDA SL-414 UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3)13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "18.07.2026_OR-2029_2026-07-18",
    "tarih": "2026-07-18",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Jul 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.07.2026_OR-2040_2026-07-18",
    "tarih": "2026-07-18",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Jul 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.07.2026_OR-2027_2026-07-18",
    "tarih": "2026-07-18",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Jul 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.07.2026_OR-2030_2026-07-18",
    "tarih": "2026-07-18",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Jul 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.07.2026_OR-2039_2026-07-18",
    "tarih": "2026-07-18",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sat Jul 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.07.2026_OR-2026_15:51",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 15:51:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "YAKIT FİLTRESİ ARIZASI"
  },
  {
    "id": "19.07.2026_OR-2026_2026-07-19",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sun Jul 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.07.2026_OR-2031_2026-07-19",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sun Jul 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 17:42:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "17.07.2027 TARİHİNDE SÖKE YANGININDA SU ALMA ESNASINDA SOL FLOAT HASARLANMIŞTIR. FIREBOSS GOREVI YAPAMAZ."
  },
  {
    "id": "19.07.2026_OR-3126_2026-07-19",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sun Jul 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.07.2026_OR-3125_2026-07-19",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Sun Jul 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.07.2026_OR-3127_2026-07-19",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Jul 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.07.2026_OR-3192_2026-07-19",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sun Jul 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.07.2026_OR-2037_2026-07-19",
    "tarih": "2026-07-19",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sun Jul 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "20.07.2026_OR-0177_2026-07-20",
    "tarih": "2026-07-20",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Mon Jul 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.07.2026_OR-1019_06:00",
    "tarih": "2026-07-20",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 06:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "40 SAAT/30 GÜNLÜK BAKIM\nTUSAŞ TEKNİK İNCELEME\nHİDROLİK POMPA FİLİTRE DEĞİŞİMİ\nIVHMS KAYIT İNDİRME"
  },
  {
    "id": "20.07.2026_OR-1020_2026-07-20",
    "tarih": "2026-07-20",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Mon Jul 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.07.2026_OR-3192_2026-07-20",
    "tarih": "2026-07-20",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Mon Jul 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.07.2026_OR-1019_2026-07-20",
    "tarih": "2026-07-20",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Mon Jul 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:35:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.07.2026_OR-1020_2026-07-21",
    "tarih": "2026-07-21",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Tue Jul 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.07.2026_OR-1019_2026-07-21",
    "tarih": "2026-07-21",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Tue Jul 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.07.2026_OR-3192_2026-07-22",
    "tarih": "2026-07-22",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Wed Jul 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.07.2026_OR-3126_2026-07-22",
    "tarih": "2026-07-22",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Wed Jul 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.07.2026_OR-3125_2026-07-22",
    "tarih": "2026-07-22",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Wed Jul 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.07.2026_OR-3127_2026-07-22",
    "tarih": "2026-07-22",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Wed Jul 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.07.2026_OR-1018_2026-07-23",
    "tarih": "2026-07-23",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Thu Jul 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.07.2026_OR-3126_2026-07-23",
    "tarih": "2026-07-23",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Thu Jul 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 17:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.07.2026_OR-3131_2026-07-23",
    "tarih": "2026-07-23",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Jul 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.07.2026_OR-1020_2026-07-23",
    "tarih": "2026-07-23",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Thu Jul 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.07.2026_OR-3126_12:00",
    "tarih": "2026-07-23",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 12:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 H BAKIM"
  },
  {
    "id": "23.07.2026_OR-3192_2026-07-23",
    "tarih": "2026-07-23",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Thu Jul 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.07.2026_OR-1018_2026-07-24",
    "tarih": "2026-07-24",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Fri Jul 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.07.2026_OR-1839_2026-07-24",
    "tarih": "2026-07-24",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Fri Jul 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Aydın Manisa İzmir keşif gözetleme Adnan Menderes iniş"
  },
  {
    "id": "24.07.2026_OR-3131_2026-07-24",
    "tarih": "2026-07-24",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Fri Jul 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.07.2026_OR-1839_2026-07-25",
    "tarih": "2026-07-25",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sat Jul 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Muğla Yerkesik yangını, İzmir Manisa keşif gözetleme, Torbalı Yakacık yangını görüntü aktarımı"
  },
  {
    "id": "25.07.2026_OR-1020_08:00",
    "tarih": "2026-07-25",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 08:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "40 Saat 30 Günlük Bakım ve Sağ Pitot Tube Değişimi"
  },
  {
    "id": "25.07.2026_OR-1020_06:00",
    "tarih": "2026-07-25",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 06:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "40 Saat 30 Günlük Bakım ve Sağ Pitot Tube Değişimi"
  },
  {
    "id": "25.07.2026_OR-1020_2026-07-25",
    "tarih": "2026-07-25",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Jul 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.07.2026_OR-1019_2026-07-25",
    "tarih": "2026-07-25",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Jul 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.07.2026_OR-3131_2026-07-25",
    "tarih": "2026-07-25",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Jul 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.07.2026_OR-3127_2026-07-26",
    "tarih": "2026-07-26",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Jul 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.07.2026_OR-1839_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Adnan Menderes’ten Ankara meydanına intikal"
  },
  {
    "id": "27.07.2026_OR-1018_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.07.2026_OR-3127_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.07.2026_OR-3131_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.07.2026_OR-2024_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 00:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "FY",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) FIREBOSS GÖREVİ YAPAMAZ.\n3)LH/RH FLOAD SCOOP KEPÇE DEĞİŞİMİ GEREKLİ.\n4)LH/RH KILLER UÇ KISMI HASARLI DEĞİŞİMİ GEREKLİ.\n5)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n6)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "27.07.2026_OR-2031_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 00:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "FY",
    "description": "1) 17.07.2027 TARİHİNDE SÖKE YANGININDA SU ALMA ESNASINDA SOL FLOAT HASARLANMIŞTIR. FIREBOSS GOREVI YAPAMAZ.\n2) 20.07.2026 TARİHİNDE FLOAT ONARIMI İÇİN ANKARA'YA GELDİ."
  },
  {
    "id": "27.07.2026_OR-0177_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.07.2026_OR-3133_2026-07-27",
    "tarih": "2026-07-27",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Mon Jul 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.07.2026_OR-3127_2026-07-28",
    "tarih": "2026-07-28",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Tue Jul 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.07.2026_OR-3192_2026-07-28",
    "tarih": "2026-07-28",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Tue Jul 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.07.2026_OR-1839_2026-07-29",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.07.2026_OR-3192_2026-07-29",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.07.2026_OR-3126_2026-07-29",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.07.2026_OR-3192_13:00",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 13:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 H BAKIM"
  },
  {
    "id": "29.07.2026_OR-3125_2026-07-29",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.07.2026_OR-3127_2026-07-29",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.07.2026_OR-3133_2026-07-29",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.07.2026_OR-3131_2026-07-29",
    "tarih": "2026-07-29",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-1018_2026-07-29",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-1019_2026-07-29",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-1020_2026-07-29",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Wed Jul 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-0177_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-1839_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-1018_15:00",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 15:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "SMFD Arızası (Malzeme isteği TUSAŞ tan yapıldı Havayoluyla nakil ediliyor)"
  },
  {
    "id": "30.07.2026_OR-3127_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-3126_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-3192_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-3125_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-3133_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-3131_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-2024_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "FY",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2) FIREBOSS GÖREVİ YAPAMAZ.\n3)LH/RH FLOAD SCOOP KEPÇE DEĞİŞİMİ GEREKLİ.\n4)LH/RH KILLER UÇ KISMI HASARLI DEĞİŞİMİ GEREKLİ.\n5)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n6)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "30.07.2026_OR-2031_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "FY",
    "description": "1) 17.07.2027 TARİHİNDE SÖKE YANGININDA SU ALMA ESNASINDA SOL FLOAT HASARLANMIŞTIR. FIREBOSS GOREVI YAPAMAZ.\n2) 20.07.2026 TARİHİNDE FLOAT ONARIMI İÇİN ANKARA'YA GELDİ."
  },
  {
    "id": "30.07.2026_OR-1019_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.07.2026_OR-1018_2026-07-30",
    "tarih": "2026-07-30",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 23:48:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-1839_2026-07-30",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-1020_2026-07-30",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Thu Jul 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-3131_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-3133_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-1839_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-3192_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-3127_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-3126_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-1019_2026-07-31",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-1020_2026-07-31",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-1018_2026-07-31",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Fri Jul 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-2037_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 17:45:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2. 31.07.2026 tarihinde yangin ucusu esnasında pilot tarafından motor ng aşımı oldugu beyan edildi. Yapılan kontrolde 106 NG görüldüğü tespit edildi."
  },
  {
    "id": "01.08.2026_OR-0177_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-3133_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 00:30:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-3192_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 00:30:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-3131_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.07.2026_OR-2037_2026-07-31",
    "tarih": "2026-07-31",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "",
    "endTime": "Sat Dec 30 1899 17:44:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-1839_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-1020_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-1019_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-3131_21:15",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 21:15:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 H BAKIM"
  },
  {
    "id": "02.08.2026_OR-3131_2026-08-01",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 00:30:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-3126_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 00:30:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.08.2026_OR-3127_2026-08-01",
    "tarih": "2026-08-01",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat Aug 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-3192_2026-08-02",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sun Aug 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-3133_2026-08-02",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sun Aug 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-3126_2026-08-02",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sun Aug 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-3127_2026-08-02",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Aug 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-3125_2026-08-02",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Sun Aug 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-1018_2026-08-02",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sun Aug 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.08.2026_OR-1839_2026-08-02",
    "tarih": "2026-08-02",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sun Aug 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.08.2026_OR-1839_2026-08-03",
    "tarih": "2026-08-03",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Mon Aug 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Pilot tazeleme uçuşu"
  },
  {
    "id": "03.08.2026_OR-1018_20:00",
    "tarih": "2026-08-03",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 20:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "120 HOURS INSPECTION\nTUSAŞ YAZILIM GÜNCELLEMESİ\nTAI-SB-GMHP-0178M UYGULAMASI"
  },
  {
    "id": "03.08.2026_OR-1018_2026-08-03",
    "tarih": "2026-08-03",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Mon Aug 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "120 HOURS INSPECTION\nTUSAŞ YAZILIM GÜNCELLEMESİ\nTAI-SB-GMHP-0178M UYGULAMASI"
  },
  {
    "id": "03.08.2026_OR-3192_2026-08-03",
    "tarih": "2026-08-03",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Mon Aug 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.08.2026_OR-2029_2026-08-04",
    "tarih": "2026-08-04",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue Aug 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 100 SAATLİK BAKIM GUS: 388:30'A KADAR 10:00 SAAT UZATILMIŞTIR."
  },
  {
    "id": "04.08.2026_OR-2029_17:47",
    "tarih": "2026-08-04",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 17:47:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "1) 100 SAATLİK BAKIM"
  },
  {
    "id": "05.08.2026_OR-2030_2026-08-05",
    "tarih": "2026-08-05",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 08:28:00 GMT+0156 (Türkiye Standard Time)",
    "status": "FY",
    "description": "Scoop asimetrik arizasi"
  },
  {
    "id": "05.08.2026_OR-3192_2026-08-05",
    "tarih": "2026-08-05",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.08.2026_OR-3125_2026-08-05",
    "tarih": "2026-08-04",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.08.2026_OR-3125_2026-08-05",
    "tarih": "2026-08-05",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.08.2026_OR-3133_2026-08-05",
    "tarih": "2026-08-04",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.08.2026_OR-3133_2026-08-05",
    "tarih": "2026-08-03",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.08.2026_OR-3126_2026-08-05",
    "tarih": "2026-08-05",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.08.2026_OR-3127_2026-08-05",
    "tarih": "2026-08-05",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.08.2026_OR-2039_18:00",
    "tarih": "2026-08-05",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 18:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "05.08.2026 tarihinde kirazlı bölgesi yangını görevi esnasında gölden su alırken sert iniş yapmıştır."
  },
  {
    "id": "05.08.2026_OR-2039_2026-08-05",
    "tarih": "2026-08-05",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Wed Aug 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "KK",
    "description": "05.08.2026 tarihinde yangın gorevinde Beydağı barajından su alma esnasında Kaptan pilot Mustafa Alp kaza kırım yapmıştır."
  },
  {
    "id": "06.08.2026_OR-1018_2026-08-06",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Thu Aug 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 14:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.08.2026_OR-3131_2026-08-06",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Aug 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.08.2026_OR-3127_2026-08-06",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Thu Aug 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.08.2026_OR-2027_2026-08-06",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Thu Aug 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.08.2026_OR-2022_2026-08-06",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Thu Aug 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "06.08.2026_OR-2030_2026-08-06",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Thu Aug 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "FY",
    "description": "1) ASSİMETRİK SCOOP ARIZASI"
  },
  {
    "id": "06.08.2026_OR-2037_2026-08-06",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Thu Aug 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "07.08.2026_OR-1018_2026-08-07",
    "tarih": "2026-08-07",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Fri Aug 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.08.2026_OR-3127_2026-08-07",
    "tarih": "2026-08-07",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Aug 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.08.2026_OR-3192_2026-08-07",
    "tarih": "2026-08-06",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Aug 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.08.2026_OR-3192_2026-08-07",
    "tarih": "2026-08-07",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Aug 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.08.2026_OR-1839_2026-08-07",
    "tarih": "2026-08-07",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Fri Aug 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Denizli TK-9 çekimi ardından Ankara için Adnan Menderes’ten AT-802 bakım ekibi alındı."
  },
  {
    "id": "07.08.2026_OR-0177_2026-08-07",
    "tarih": "2026-08-07",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Fri Aug 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.08.2026_OR-2029_2026-08-07",
    "tarih": "2026-08-07",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Fri Aug 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:45:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.08.2026_OR-2030_09:00",
    "tarih": "2026-08-08",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 09:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "1)100 H BAKIM 08.08.2026 TARİHİNDE BAŞLANMIŞTIR.\n2) ASSİMETRİK SCOOP ARIZASI"
  },
  {
    "id": "08.08.2026_OR-2029_2026-08-08",
    "tarih": "2026-08-08",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Aug 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.08.2026_OR-2026_2026-08-08",
    "tarih": "2026-08-08",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Aug 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.08.2026_OR-2022_2026-08-08",
    "tarih": "2026-08-08",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Aug 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "08.08.2026_OR-2037_2026-08-08",
    "tarih": "2026-08-08",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Aug 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "08.08.2026_OR-2040_2026-08-08",
    "tarih": "2026-08-08",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Aug 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.08.2026_OR-2027_2026-08-08",
    "tarih": "2026-08-08",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Aug 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-2029_2026-08-09",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sun Aug 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-2040_2026-08-09",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sun Aug 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-1020_2026-08-09",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sun Aug 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-1019_2026-08-09",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Aug 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-3131_2026-08-09",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sun Aug 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-3192_2026-08-09",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sun Aug 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.08.2026_OR-2026_2026-08-10",
    "tarih": "2026-08-10",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Mon Aug 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.08.2026_OR-2027_2026-08-10",
    "tarih": "2026-08-10",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon Aug 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-3192_2026-08-10",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Mon Aug 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.08.2026_OR-3125_2026-08-10",
    "tarih": "2026-08-09",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Mon Aug 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.08.2026_OR-3131_2026-08-10",
    "tarih": "2026-08-10",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Mon Aug 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "10.08.2026_OR-2022_2026-08-10",
    "tarih": "2026-08-10",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Mon Aug 10 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "11.08.2026_OR-2027_09:46",
    "tarih": "2026-08-11",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 09:46:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "HİDROLİK SİSTEMDE KAÇAK MEVCUT."
  },
  {
    "id": "11.08.2026_OR-2022_2026-08-11",
    "tarih": "2026-08-11",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Tue Aug 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "11.08.2026_OR-2037_2026-08-11",
    "tarih": "2026-08-11",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Tue Aug 11 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "12.08.2026_OR-3131_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-3127_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-2040_15:54",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 15:54:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "TORQUE ARIZASI MEVCUT"
  },
  {
    "id": "12.08.2026_OR-2040_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-2022_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "12.08.2026_OR-2037_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "12.08.2026_OR-0177_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-2029_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-1839_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Kuyucak yangını TK-9 çekimi ardından Adnan Menderes havalimanı yangın bekleme görevi."
  },
  {
    "id": "12.08.2026_OR-2026_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-3192_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-1018_2026-08-12",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Wed Aug 12 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.08.2026_OR-3127_07:30",
    "tarih": "2026-08-13",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 07:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 H BAKIM"
  },
  {
    "id": "13.08.2026_OR-0177_2026-08-13",
    "tarih": "2026-08-13",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Thu Aug 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "12.08.2026_OR-1839_2026-08-13",
    "tarih": "2026-08-12",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Aug 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 12:10:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "Kuyucak yangını TK-9 çekimi ardından Adnan Menderes havalimanı yangın bekleme görevi."
  },
  {
    "id": "13.08.2026_OR-3127_2026-08-13",
    "tarih": "2026-08-13",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Thu Aug 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.08.2026_OR-3192_2026-08-13",
    "tarih": "2026-08-13",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Thu Aug 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "13.08.2026_OR-3126_2026-08-13",
    "tarih": "2026-08-13",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Thu Aug 13 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.08.2026_OR-2022_06:00",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 06:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR.\n25-50H BAKIM YAPILACAK"
  },
  {
    "id": "14.08.2026_OR-2037_2026-08-14",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Fri Aug 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)14.08.2026 TARİHİNDE KARAİNDE EĞİTİM ESNASINDA NG 105:7 4 SN. LİMİT AŞIMI OLMUŞTUR."
  },
  {
    "id": "14.08.2026_OR-2022_2026-08-14",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Fri Aug 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 12:09:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "14.08.2026_OR-1019_2026-08-14",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri Aug 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.08.2026_OR-1020_2026-08-14",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Aug 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.08.2026_OR-3127_2026-08-14",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Aug 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.08.2026_OR-3192_2026-08-14",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Fri Aug 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 23:36:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "14.08.2026_OR-3192_2026-08-14",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 21:13:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 H BAKIM"
  },
  {
    "id": "14.08.2026_OR-2037_15:56",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 15:56:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)14.08.2026 TARİHİNDE KARAİNDE EĞİTİM ESNASINDA NG 105:7 4 SN. LİMİT AŞIMI OLMUŞTUR."
  },
  {
    "id": "15.08.2026_OR-1839_2026-08-14",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Fri Aug 14 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Çanakkale Balıkesir Bursa hattında görüntü aktarımı ve tarama faaliyeti ardından Adnan Menderes havalimanı yangın bekleme görevi."
  },
  {
    "id": "14.08.2026_OR-3192_21:00",
    "tarih": "2026-08-14",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 21:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 23:55:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.08.2026_OR-3126_2026-08-15",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Aug 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.08.2026_OR-2022_2026-08-15",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Aug 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "15.08.2026_OR-2040_2026-08-15",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Aug 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.08.2026_OR-2029_2026-08-15",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Aug 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.08.2026_OR-2026_2026-08-15",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Aug 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.08.2026_OR-2027_2026-08-15",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Aug 15 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "15.08.2026_OR-3127_2026-08-16",
    "tarih": "2026-08-15",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-3127_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-1839_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-1018_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-3131_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-2027_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-2040_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-2029_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "16.08.2026_OR-2026_2026-08-16",
    "tarih": "2026-08-16",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-1019_2026-08-16",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-1020_2026-08-16",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-1018_2026-08-16",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sun Aug 16 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-1019_06:00",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 06:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "40 SAAT/30 GÜNLÜK BAKIM\nIVHMS VERİ İNDİRME\nDMAP GÜNCELLEME\n6 AYLIK KONTROLLER"
  },
  {
    "id": "17.08.2026_OR-2024_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 10:02:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "17.08.2026_OR-2039_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "KK",
    "description": "05.08.2026 tarihinde yangın görevinde  Beydağı barajından su alma esnasında Kaptan pilot Mustafa Alp kaza kırım yapmıştır."
  },
  {
    "id": "17.08.2026_OR-1839_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-3125_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-1019_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-2026_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-2027_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "17.08.2026_OR-2022_2026-08-17",
    "tarih": "2026-08-17",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Mon Aug 17 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "18.08.2026_OR-2022_2026-08-18",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Tue Aug 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "18.08.2026_OR-2037_2026-08-18",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Tue Aug 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "18.08.2026_OR-2026_11:13",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 11:13:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR."
  },
  {
    "id": "18.08.2026_OR-1018_2026-08-18",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Tue Aug 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.08.2026_OR-2030_2026-08-18",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Tue Aug 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "18.08.2026_OR-2024_2026-08-18",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Tue Aug 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "18.08.2026_OR-2031_2026-08-18",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Tue Aug 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 17.07.2027 TARİHİNDE SÖKE YANGININDA SU ALMA ESNASINDA SOL FLOAT HASARLANMIŞTIR. FIREBOSS GOREVI YAPAMAZ.\n2) 20.07.2026 TARİHİNDE FLOAT ONARIMI İÇİN ANKARA'YA GELDİ."
  },
  {
    "id": "18.08.2026_OR-2027_2026-08-18",
    "tarih": "2026-08-18",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Tue Aug 18 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.08.2026_OR-1020_09:00",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 09:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "40 saat/30 günlük bakım gerekleri"
  },
  {
    "id": "19.08.2026_OR-2029_14:09",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 14:09:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "İNİŞ TAKIM ARIZASI"
  },
  {
    "id": "19.08.2026_OR-1020_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:30:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.08.2026_OR-1839_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Balıkesir bölgesi İzmir kuzeyi TK-9 çekimi- Sındırgı yangını TK-9 çekimi ve görüntü aktarımı"
  },
  {
    "id": "19.08.2026_OR-3131_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.08.2026_OR-3127_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.08.2026_OR-1019_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.08.2026_OR-2027_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "19.08.2026_OR-2037_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "19.08.2026_OR-2024_2026-08-19",
    "tarih": "2026-08-19",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Wed Aug 19 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "20.08.2026_OR-1839_2026-08-20",
    "tarih": "2026-08-20",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Aug 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Balıkesir bölgesi İzmir kuzeyi TK-9 çekimi"
  },
  {
    "id": "20.08.2026_OR-3131_2026-08-20",
    "tarih": "2026-08-20",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Aug 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "20.08.2026_OR-2037_2026-08-20",
    "tarih": "2026-08-20",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Thu Aug 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "20.08.2026_OR-1019_2026-08-20",
    "tarih": "2026-08-20",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Thu Aug 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.08.2026_OR-2030_11:56",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 11:56:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "Scoop Arızası Var"
  },
  {
    "id": "21.08.2026_OR-2030_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 13:34:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.08.2026_OR-3125_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.08.2026_OR-3127_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.08.2026_OR-1839_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Balıkesir bölgesi İzmir kuzeyi TK-9 çekimi"
  },
  {
    "id": "21.08.2026_OR-1019_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.08.2026_OR-1020_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.08.2026_OR-2037_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "21.08.2026_OR-2027_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "21.08.2026_OR-2024_2026-08-21",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Fri Aug 21 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "21.08.2026_OR-3126_2026-08-20",
    "tarih": "2026-08-21",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Thu Aug 20 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.08.2026_OR-2024_11:21",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 11:21:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "22.08.2026_OR-2024_2026-08-22",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sat Aug 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 14:50:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "22.08.2026_OR-3126_2026-08-22",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Aug 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.08.2026_OR-1839_2026-08-22",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sat Aug 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Balıkesir bölgesi İzmir kuzeyi TK-9 çekimi"
  },
  {
    "id": "22.08.2026_OR-3127_2026-08-22",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat Aug 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.08.2026_OR-2040_17:41",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Dec 30 1899 17:41:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "KK",
    "description": "22.08.2026 tarihinde Milas yangını esnasında Ağaç sürmesi mevcut."
  },
  {
    "id": "22.08.2026_OR-2040_2026-08-22",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sat Aug 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "22.08.2026 tarihinde Milas yangını esnasında Ağaç sürmesi mevcut."
  },
  {
    "id": "22.08.2026_OR-1020_2026-08-22",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Aug 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "22.08.2026_OR-1019_2026-08-22",
    "tarih": "2026-08-22",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Aug 22 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.08.2026_OR-2040_2026-08-23",
    "tarih": "2026-08-23",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "FİREBOSS GÖREVİ YAPAMAZ 22.08.2026 tarihinde Milas yangını esnasında Sol float,flap,stabilize aileron Ağaç sürtmesi mevcut."
  },
  {
    "id": "23.08.2026_OR-3127_2026-08-23",
    "tarih": "2026-08-23",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.08.2026_OR-2030_2026-08-23",
    "tarih": "2026-08-23",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "23.08.2026_OR-2037_2026-08-23",
    "tarih": "2026-08-23",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "23.08.2026_OR-2024_2026-08-23",
    "tarih": "2026-08-23",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "23.08.2026_OR-2022_2026-08-23",
    "tarih": "2026-08-23",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "23.08.2026_OR-1019_2026-08-23",
    "tarih": "2026-08-23",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.08.2026_OR-1839_2026-08-23",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sun Aug 23 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Balıkesir bölgesi İzmir kuzeyi TK-9 çekimi"
  },
  {
    "id": "24.08.2026_OR-2029_2026-08-24",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Mon Aug 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.08.2026_OR-2030_2026-08-24",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Mon Aug 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.08.2026_OR-2024_2026-08-24",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Mon Aug 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "24.08.2026_OR-3131_2026-08-24",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Mon Aug 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.08.2026_OR-1839_2026-08-24",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Mon Aug 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "24.08.2026_OR-2040_2026-08-24",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Mon Aug 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "FİREBOSS GÖREVİ YAPAMAZ 22.08.2026 tarihinde Milas yangını esnasında Sol float,flap,stabilize aileron Ağaç sürtmesi mevcut."
  },
  {
    "id": "24.08.2026_OR-3127_2026-08-24",
    "tarih": "2026-08-24",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Mon Aug 24 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.08.2026_OR-2037_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "25.08.2026_OR-2029_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.08.2026_OR-2024_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "25.08.2026_OR-2030_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.08.2026_OR-2026_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR."
  },
  {
    "id": "25.08.2026_OR-3192_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.08.2026_OR-3126_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 20:33:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.08.2026_OR-3125_2026-08-25",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Tue Aug 25 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "25.08.2026_OR-3126_17:02",
    "tarih": "2026-08-25",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 17:02:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 Saatlik Bakım"
  },
  {
    "id": "26.08.2026_OR-2037_2026-08-26",
    "tarih": "2026-08-26",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Wed Aug 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "26.08.2026_OR-2027_2026-08-26",
    "tarih": "2026-08-26",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Wed Aug 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.08.2026_OR-2030_2026-08-26",
    "tarih": "2026-08-26",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Wed Aug 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "26.08.2026_OR-2038_2026-08-26",
    "tarih": "2026-08-26",
    "kuyrukNo": "OR-2038",
    "tip": "AT-802",
    "startTime": "Wed Aug 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "SON KONTROL UÇUŞU OLACAK."
  },
  {
    "id": "26.08.2026_OR-2040_2026-08-26",
    "tarih": "2026-08-26",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Wed Aug 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "FİREBOSS GÖREVİ YAPAMAZ 22.08.2026 tarihinde Milas yangını esnasında Sol float,flap,stabilize aileron Ağaç sürtmesi mevcut.\n26.08.2026 TARİHİNDE 100H BAKIMA ALINMIŞTIR."
  },
  {
    "id": "26.08.2026_OR-1839_2026-08-26",
    "tarih": "2026-08-26",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Wed Aug 26 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "GPS test uçuşu"
  },
  {
    "id": "27.08.2026_OR-2037_2026-08-27",
    "tarih": "2026-08-27",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Thu Aug 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "27.08.2026_OR-1839_2026-08-27",
    "tarih": "2026-08-27",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Thu Aug 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Milas intikal"
  },
  {
    "id": "27.08.2026_OR-3131_2026-08-27",
    "tarih": "2026-08-27",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Thu Aug 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "27.08.2026_OR-3127_2026-08-27",
    "tarih": "2026-08-27",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Thu Aug 27 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.08.2026_OR-2024_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "28.08.2026_OR-2030_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.08.2026_OR-0177_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.08.2026_OR-2031_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.08.2026_OR-2026_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 14:57:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir."
  },
  {
    "id": "28.08.2026_OR-3133_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.08.2026_OR-3127_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.08.2026_OR-3131_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "28.08.2026_OR-1019_2026-08-28",
    "tarih": "2026-08-28",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-1839_2026-08-28",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Fri Aug 28 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Milas bekleme"
  },
  {
    "id": "29.08.2026_OR-2029_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-2031_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-2030_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-2024_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "29.08.2026_OR-2037_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "29.08.2026_OR-2026_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir."
  },
  {
    "id": "29.08.2026_OR-2027_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-1018_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-3133_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-3131_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-3126_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-3127_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "29.08.2026_OR-3192_2026-08-29",
    "tarih": "2026-08-29",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-1839_2026-08-29",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sat Aug 29 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Taşocağı ve Seydikemer yangınları TK-9 çekimi ve görüntü aktarımı"
  },
  {
    "id": "30.08.2026_OR-2029_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-2022_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "30.08.2026_OR-2037_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "30.08.2026_OR-1019_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-1020_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-1018_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-3126_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-3127_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-3133_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "30.08.2026_OR-2039_2026-08-30",
    "tarih": "2026-08-30",
    "kuyrukNo": "OR-2039",
    "tip": "AT-802",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "KK",
    "description": "05.08.2026 tarihinde yangın görevinde  Beydağı barajından su alma esnasında Kaptan pilot Mustafa Alp kaza kırım yapmıştır."
  },
  {
    "id": "31.08.2026_OR-1839_2026-08-30",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sun Aug 30 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Manavgat yangını TK-9 çekimi ve goruntu aktarımı"
  },
  {
    "id": "31.08.2026_OR-2029_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-2037_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "31.08.2026_OR-2026_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir."
  },
  {
    "id": "31.08.2026_OR-2027_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-3127_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 16:32:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-3127_11:30",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 11:30:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50H Bakım"
  },
  {
    "id": "31.08.2026_OR-0177_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-3125_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-3192_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-3126_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-3133_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "31.08.2026_OR-1839_2026-08-31",
    "tarih": "2026-08-31",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Mon Aug 31 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Milas meydandan Ankara Havalimanı intikal."
  },
  {
    "id": "01.09.2026_OR-2027_2026-09-01",
    "tarih": "2026-09-01",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Tue Sep 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.09.2026_OR-2026_2026-09-01",
    "tarih": "2026-09-01",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Tue Sep 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir."
  },
  {
    "id": "01.09.2026_OR-2037_2026-09-01",
    "tarih": "2026-09-01",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Tue Sep 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR."
  },
  {
    "id": "01.09.2026_OR-2029_2026-09-01",
    "tarih": "2026-09-01",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue Sep 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "01.09.2026_OR-2031_2026-09-01",
    "tarih": "2026-09-01",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Tue Sep 01 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.09.2026_OR-2037_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n4)02.09.2026 TARİHİNDE MOTOR NG OVERSPEED OLMUŞTUR MAX. %106,0 GÖRÜLMÜŞTÜR."
  },
  {
    "id": "02.09.2026_OR-2031_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.09.2026_OR-2024_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "02.09.2026_OR-2030_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.09.2026_OR-0177_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "02.09.2026_OR-2040_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "FİREBOSS GÖREVİ YAPAMAZ 22.08.2026 tarihinde Milas yangını esnasında Sol float,flap,stabilize aileron Ağaç sürtmesi mevcut."
  },
  {
    "id": "02.09.2026_OR-2026_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir.\naaaa\naaaaa\naaaa\naaaa\naaaa\naaaa"
  },
  {
    "id": "02.09.2026_OR-3131_2026-09-02",
    "tarih": "2026-09-02",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Wed Sep 02 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.09.2026_OR-2030_2026-09-03",
    "tarih": "2026-09-03",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Thu Sep 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.09.2026_OR-2024_2026-09-03",
    "tarih": "2026-09-03",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Thu Sep 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "03.09.2026_OR-2038_2026-09-03",
    "tarih": "2026-09-03",
    "kuyrukNo": "OR-2038",
    "tip": "AT-802",
    "startTime": "Thu Sep 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "SON KONTROL UÇUŞU OLACAK."
  },
  {
    "id": "03.09.2026_OR-3125_2026-09-03",
    "tarih": "2026-09-03",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Thu Sep 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "03.09.2026_OR-3126_2026-09-03",
    "tarih": "2026-09-03",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Thu Sep 03 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.09.2026_OR-3126_2026-09-04",
    "tarih": "2026-09-04",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Sep 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.09.2026_OR-2022_2026-09-04",
    "tarih": "2026-09-04",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Fri Sep 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ (MALZEME TEMİN EDİLDİ YILLK BAKIMDA UYGULANACAK)\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "04.09.2026_OR-2029_2026-09-04",
    "tarih": "2026-09-04",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Fri Sep 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.09.2026_OR-2030_2026-09-04",
    "tarih": "2026-09-04",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Fri Sep 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.09.2026_OR-2024_2026-09-04",
    "tarih": "2026-09-04",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Fri Sep 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "03.09.2026_OR-3126_2026-09-04",
    "tarih": "2026-09-03",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Fri Sep 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "04.09.2026_OR-0177_2026-09-04",
    "tarih": "2026-09-04",
    "kuyrukNo": "OR-0177",
    "tip": "C-650",
    "startTime": "Fri Sep 04 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.09.2026_OR-1020_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.09.2026_OR-1019_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.09.2026_OR-2022_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ (MALZEME TEMİN EDİLDİ YILLK BAKIMDA UYGULANACAK)\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "05.09.2026_OR-2030_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.09.2026_OR-2031_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.09.2026_OR-2026_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir."
  },
  {
    "id": "05.09.2026_OR-2024_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "05.09.2026_OR-2027_2026-09-05",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.09.2026_OR-1018_08:00",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sat Dec 30 1899 08:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "40 saat/30 günlük bakım\nIVHMS kayıt indirme\nT/R toz botu değişimi"
  },
  {
    "id": "06.09.2026_OR-1839_2026-09-05",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Sat Sep 05 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "05.09.2026_OR-3126_2026-09-06",
    "tarih": "2026-09-05",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-1019_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-1020_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-1020",
    "tip": "T-70",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-1018_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 06:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-2040_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-2040",
    "tip": "AT-802",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1)FIREBOSS GÖREVİ YAPAMAZ 22.08.2026 tarihinde Milas yangını esnasında Sol float,flap,stabilize aileron Ağaç sürtmesi mevcut.\n2)FIREBOSS GÖREVİ YAPAMAZ. SOL FLAP VE SOL TRIMBOOST OR-2036 KUYRUK NUAMRALI UÇAKTAN AKTARILARAK DEĞİŞTİRİLDİ."
  },
  {
    "id": "06.09.2026_OR-2027_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-2029_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-3192_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-3127_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "06.09.2026_OR-2036_2026-09-06",
    "tarih": "2026-09-06",
    "kuyrukNo": "OR-2036",
    "tip": "AT-802",
    "startTime": "Sun Sep 06 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) NG LİMİT AŞIMINDAN DOLAYI YURTDIŞINDA LIGHT OVERHAUL İŞLEMİ İÇİN MOTOR 18.03.2026 TARİHİNDE SÖKÜLDÜ. TEİ'YE 03.04.2026 TARİHİNDE TESLİM EDİLDİ.\n2) 07.08.2026 TARİHİNDE FUEL BOOST PUMP OR-2029 KUYRUK NUMARALI UÇAĞA AKTARILMAK ÜZERE SÖKÜLMÜŞTÜR.\n3) 06.09.2026 TARİHİNDE LH FLAP VE LH AILERON BOOST TAB ASSY OR-2040 KUYRUK NUMARALI UÇAĞA AKTARILMAK ÜZERE SÖKÜLMÜŞTÜR."
  },
  {
    "id": "07.09.2026_OR-1839_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Antalya Serik yangını TK-9 çekimi ve görüntü aktarımı"
  },
  {
    "id": "07.09.2026_OR-2022_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-2022",
    "tip": "AT-802",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) 414 MALZEME TEMİNİNE MÜTEAKİP UYGULAMASI GEREKLİ (MALZEME TEMİN EDİLDİ YILLK BAKIMDA UYGULANACAK)\n2)  SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  10.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n3) 13.05.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-01184) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 884 H) KADAR UÇUŞA MUSADE EDİLMİŞTİR."
  },
  {
    "id": "07.09.2026_OR-2037_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-2037",
    "tip": "AT-802",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "A",
    "description": "1) 08.06.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0603) TEKNİK İNCELEME SONUCU 200 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n2) 03.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-0928-RZ0413) TEKNİK İNCELEME SONUCU 154 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n3)18.08.2026 TARİHİNDE PRAT&WHITNEY'DEN GELEN MEKTUPTA ( DAA2026-1003-RZ0413) TEKNİK İNCELEME SONUCU 148 SAAT ( GUS: 313:35 H) KADAR UÇUŞA MUSADE \nEDİLMİŞTİR.\n4)02.09.2026 TARİHİNDE MOTOR NG OVERSPEED OLMUŞTUR MAX. %106,0 GÖRÜLMÜŞTÜR."
  },
  {
    "id": "07.09.2026_OR-3127_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.09.2026_OR-3192_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.09.2026_OR-3126_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.09.2026_OR-1019_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-1019",
    "tip": "T-70",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "07.09.2026_OR-1018_2026-09-07",
    "tarih": "2026-09-07",
    "kuyrukNo": "OR-1018",
    "tip": "T-70",
    "startTime": "Mon Sep 07 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-2026_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir."
  },
  {
    "id": "08.09.2026_OR-2029_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-2027_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-2030_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-2024_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "08.09.2026_OR-2031_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-1839_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Antalya Aksu-Serik,Adana Kozan yangını TK-9 çekimi ve görüntü aktarımı"
  },
  {
    "id": "08.09.2026_OR-3125_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-3125",
    "tip": "Bell-429",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-3131_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "Sat Dec 30 1899 22:00:00 GMT+0156 (Türkiye Standard Time)",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-3133_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-3133",
    "tip": "Bell-429",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-3131_17:00",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-3131",
    "tip": "Bell-429",
    "startTime": "Sat Dec 30 1899 17:00:00 GMT+0156 (Türkiye Standard Time)",
    "endTime": "",
    "status": "B",
    "description": "50 H BAKIM"
  },
  {
    "id": "08.09.2026_OR-3126_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-3126",
    "tip": "Bell-429",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-3192_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-3192",
    "tip": "Bell-429",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "08.09.2026_OR-3127_2026-09-08",
    "tarih": "2026-09-08",
    "kuyrukNo": "OR-3127",
    "tip": "Bell-429",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.09.2026_OR-1839_2026-09-08",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Tue Sep 08 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Antalya Aksu-Kumluca,Adana Kozan Mersin yangını TK-9 çekimi ve görüntü aktarımı"
  },
  {
    "id": "09.09.2026_OR-1839_2026-09-09",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-1839",
    "tip": "B-360",
    "startTime": "Wed Sep 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "Antalya Aksu-Kumluca,Adana Kozan yangını TK-9 çekimi ve görüntü aktarımı"
  },
  {
    "id": "09.09.2026_OR-2026_2026-09-09",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-2026",
    "tip": "AT-802",
    "startTime": "Wed Sep 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "30.06.2026 TARİHİNDE KARAİN YANGIN SÖNDÜRME UÇUŞU ESNASINDA NG:105.7 LİMİT AŞIMI TESPİT EDİLMİŞTİR.28.06.2026 tarihinde gelen DAA2026-1010-PT6A-67F-RZ0357  uçuşa verilmiştir."
  },
  {
    "id": "09.09.2026_OR-2029_2026-09-09",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-2029",
    "tip": "AT-802",
    "startTime": "Wed Sep 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.09.2026_OR-2027_2026-09-09",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-2027",
    "tip": "AT-802",
    "startTime": "Wed Sep 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.09.2026_OR-2024_2026-09-09",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-2024",
    "tip": "AT-802",
    "startTime": "Wed Sep 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": "1) SL-420 GEREĞİ MVP YAZILIM SORUNU İSPANYOL TEKNİK DANIŞMA  13.02.2026 TARİHİNDE BİLGİ VERİLDİ.\n2)DGF-0993-052 GEREĞİ GUS:610:20,YE KADAR HER UÇUŞDAN SONRA RGB CHIP DEDECTOR KONTOLÜ GEREKLİ. \n3)DGF-0993-052 GEREĞİ GUS:610:20'DE MAIN OİL FİLTER KONTOLÜ GEREKLİ"
  },
  {
    "id": "09.09.2026_OR-2030_2026-09-09",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-2030",
    "tip": "AT-802",
    "startTime": "Wed Sep 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  },
  {
    "id": "09.09.2026_OR-2031_2026-09-09",
    "tarih": "2026-09-09",
    "kuyrukNo": "OR-2031",
    "tip": "AT-802",
    "startTime": "Wed Sep 09 2026 00:00:00 GMT+0300 (Türkiye Standard Time)",
    "endTime": "",
    "status": "F",
    "description": ""
  }
];
