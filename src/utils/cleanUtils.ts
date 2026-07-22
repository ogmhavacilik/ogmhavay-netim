export const cleanDescription = (text: any): string => {
  if (!text && text !== 0) return '';
  const trimmed = String(text).trim();
  if (!trimmed || trimmed === '-' || trimmed === '--' || trimmed === 'N/A' || trimmed === 'NA' || trimmed === 'NULL' || trimmed === 'UNDEFINED') {
    return '';
  }

  // Normalize upper TR
  const upper = trimmed.toLocaleUpperCase('tr-TR').trim();

  // Known status codes, short codes, status names, synthetic interpreted labels, and abbreviations that are not raw descriptive notes
  const INVALID_STATUS_DESCS = [
    'A', 'B', 'F', 'BB', 'PB', 'KK', 'TB', 'TBU', 'KM', 'AA', 'X', 'K', '?', 'GF',
    'FAAL', 'ARIZA', 'BAKIM', 'PARÇA BEKLER', 'PARCA BEKLER',
    'KAZA KIRIM', 'KAZA-KIRIM', 'TEKNİK BÜLTEN', 'TEKNIK BULTEN',
    'KABUL MUAYENE', 'KABUL MUAYENESİ', 'KABUL MUAYENESI', 'KABUL MUA.', 'BAKIM BEKLER', 'TECRÜBE UÇUŞU', 'TECRUBE UCUSU',
    'GAYRİ FAAL', 'GAYRI FAAL', 'GAYRI-FAAL', 'GAYRİ-FAAL',
    'GAYRİ FAAL DURUM DEVAM EDİYOR', 'GAYRI FAAL DURUM DEVAM EDIYOR',
    'GAYRİ FAAL DURUM', 'GAYRI FAAL DURUM', 'FAAL DURUM',
    'UÇUŞA ELVERİŞLİ / FAAL', 'UCUSA ELVERISLI / FAAL', 'UÇUŞA ELVERİŞLİ', 'UCUSA ELVERISLI'
  ];

  if (INVALID_STATUS_DESCS.includes(upper)) {
    return '';
  }

  // Remove whitespace and common delimiters to test raw alphanumerics
  const alphaNumericOnly = upper.replace(/[\s\.\,\-\(\)\[\]\:\;\_\/\\]/g, '');

  // Filter out 1 or 2 letter codes or repeating letter pairs (e.g. "KK", "AA", "A", "B", "F", "XX")
  if (alphaNumericOnly.length <= 2) {
    return '';
  }

  // Filter out if solely digits (e.g., "123", "001")
  if (/^\d{1,4}$/.test(alphaNumericOnly)) {
    return '';
  }

  return trimmed;
};

export const isValidDescription = (text: any): boolean => {
  return cleanDescription(text).length > 0;
};
