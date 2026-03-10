
import { Aircraft, Status, DailyStatusCode } from '../../types';

export const formatToHHMM = (decimalHours: number | string): string => {
  if (decimalHours === null || decimalHours === undefined || decimalHours === '') return '-';
  const hours = parseFloat(decimalHours.toString());
  if (isNaN(hours)) return decimalHours.toString();
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

export const getCallSignByTail = (tail: string): string => {
  const mapping: Record<string, string> = {
    'OR-2021': 'ORMAN-21',
    'OR-2022': 'ORMAN-22',
    'OR-2023': 'ORMAN-23',
    'OR-2024': 'ORMAN-24',
    'OR-2025': 'ORMAN-25',
    'OR-2026': 'ORMAN-26',
    'OR-2027': 'ORMAN-27',
    'OR-2028': 'ORMAN-28',
    'OR-2029': 'ORMAN-29',
    'OR-2030': 'ORMAN-30',
    'OR-2031': 'ORMAN-31',
    'OR-2032': 'ORMAN-32',
    'OR-2033': 'ORMAN-33',
    'OR-2034': 'ORMAN-34',
    'OR-2035': 'ORMAN-35',
    'OR-2036': 'ORMAN-36',
    'OR-2037': 'ORMAN-37',
    'OR-2038': 'ORMAN-38',
    'OR-1020': 'ORMAN-1020',
  };
  return mapping[tail.trim().toUpperCase()] || tail;
};

export const generateFleetExcelHtml = (fleet: Aircraft[], dateStr: string) => {
  const typeOrder = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
  
  const sortedFleet = [...fleet].sort((a, b) => {
    const indexA = typeOrder.indexOf(a.tip || '');
    const indexB = typeOrder.indexOf(b.tip || '');
    
    if (indexA !== indexB) {
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return (a.tip || '').localeCompare(b.tip || '');
    }

    const getOrder = (cagriKodu: string) => {
      const match = String(cagriKodu).match(/ORMAN-(\d+)/i);
      if (match) return parseInt(match[1]);
      return 999;
    };
    return getOrder(a.cagriKodu) - getOrder(b.cagriKodu);
  });

  const getAbbreviation = (kuyrukNo: string) => {
    const tail = String(kuyrukNo).trim().toUpperCase();
    if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return ' (DA)';
    if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) return ' (SA)';
    if (tail === 'OR-2036') return ' (DL)';
    if (tail === 'OR-2038') return ' (SL)';
    if (tail === 'OR-1020') return ' (H)';
    return '';
  };

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid black; padding: 5px; text-align: center; vertical-align: middle; font-size: 12px; }
        .title-row { background-color: #f2f2f2; font-weight: bold; font-size: 14px; }
        .header-row th { background-color: #d9d9d9; font-weight: bold; }
        .date-text { color: red; font-weight: bold; text-align: right; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="7" class="date-text" style="border: none; text-align: right; color: red; font-weight: bold;">${dateStr}</td>
        </tr>
        <tr>
          <td colspan="7" class="title-row" style="text-align: center; font-weight: bold; background-color: #f2f2f2;">OGM HAVA ARAÇLARI DURUM ÖZETLERİ</td>
        </tr>
        <tr class="header-row">
          <th style="background-color: #d9d9d9;">ÇAĞRI KODU</th>
          <th style="background-color: #d9d9d9;">KUYRUK NUMARASI</th>
          <th style="background-color: #d9d9d9;">DURUM</th>
          <th style="background-color: #d9d9d9;">DURUM AYRINTISI</th>
          <th style="background-color: #d9d9d9;">KONUM</th>
          <th style="background-color: #d9d9d9;">FAYDALI SAAT</th>
          <th style="background-color: #d9d9d9;">AÇIKLAMA</th>
        </tr>
  `;

  sortedFleet.forEach(aircraft => {
    const aciklama = (aircraft.aciklama || '').replace(/\n/g, '<br/>');
    const faydaliSaat = aircraft.faydaliSaat ? formatToHHMM(aircraft.faydaliSaat) : '';
    const abbr = getAbbreviation(aircraft.kuyrukNo);
    
    html += `
      <tr>
        <td style="background-color: #e6e6e6;">${aircraft.cagriKodu || ''}</td>
        <td style="background-color: #e6e6e6;">${aircraft.kuyrukNo || ''}<span style="color: red; font-weight: bold;">${abbr}</span></td>
        <td style="background-color: ${aircraft.durum === Status.FAAL ? '#c6efce' : '#ffc7ce'}; color: ${aircraft.durum === Status.FAAL ? '#006100' : '#9c0006'}; font-weight: bold;">${aircraft.durum || ''}</td>
        <td>${aircraft.durumAyrintisi || ''}</td>
        <td>${aircraft.konum || ''}</td>
        <td style="mso-number-format:'\\@'; font-weight: bold; color: #0000ff;">${faydaliSaat}</td>
        <td style="text-align: left; vertical-align: top; font-style: italic; font-size: 10px;">${aciklama}</td>
      </tr>
    `;
  });

  html += `
        <tr><td colspan="7" style="border: none;">&nbsp;</td></tr>
        <tr>
          <td colspan="7" style="border: none; text-align: left; font-weight: bold;">KISALTMALAR:</td>
        </tr>
        <tr>
          <td colspan="7" style="border: none; text-align: left;">(DA): DUAL AMFİBİ</td>
        </tr>
        <tr>
          <td colspan="7" style="border: none; text-align: left;">(SA): SINGLE AMFİBİ</td>
        </tr>
        <tr>
          <td colspan="7" style="border: none; text-align: left;">(DL): DUAL LAND</td>
        </tr>
        <tr>
          <td colspan="7" style="border: none; text-align: left;">(SL): SINGLE LAND</td>
        </tr>
        <tr>
          <td colspan="7" style="border: none; text-align: left;">(H): HELİTAK</td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return html;
};
