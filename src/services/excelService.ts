
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
        th, td { border: 1px solid black; padding: 8px; text-align: center; vertical-align: middle; font-size: 11px; }
        .title-row { background-color: #1a472a; color: white; font-weight: bold; font-size: 16px; }
        .header-row th { background-color: #2d5a27; color: white; font-weight: bold; }
        .date-text { color: #d32f2f; font-weight: bold; text-align: right; font-size: 14px; }
        .faal { background-color: #c6efce; color: #006100; }
        .gayrifaal { background-color: #ffc7ce; color: #9c0006; }
        .kuyruk-cell { background-color: #f8f9fa; font-weight: bold; }
        .abbr-text { color: #d32f2f; font-weight: bold; margin-left: 4px; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="6" class="date-text" style="border: none;">${dateStr}</td>
        </tr>
        <tr>
          <td colspan="6" class="title-row">OGM HAVA ARAÇLARI GÜNLÜK DURUM RAPORU</td>
        </tr>
        <tr class="header-row">
          <th>ÇAĞRI KODU</th>
          <th>KUYRUK NO</th>
          <th>DURUM</th>
          <th>KONUM</th>
          <th>FAYDALİ SAAT</th>
          <th>AÇIKLAMA</th>
        </tr>
  `;

  sortedFleet.forEach(aircraft => {
    const aciklama = (aircraft.aciklama || '').replace(/\n/g, ' ');
    const faydaliSaat = aircraft.faydaliSaat ? formatToHHMM(aircraft.faydaliSaat) : '';
    const abbr = getAbbreviation(aircraft.kuyrukNo);
    
    const isFaal = String(aircraft.durum).toUpperCase().includes("FAAL") && !String(aircraft.durum).toUpperCase().includes("GAYRİ") && !String(aircraft.durum).toUpperCase().includes("GAYRI");
    const durumClass = isFaal ? "faal" : "gayrifaal";

    let durumText = aircraft.durum || '';
    const alertText = aircraft.durumAyrintisi || '';
    if (alertText && alertText !== '-') {
      durumText += ` (${alertText})`;
    }
    
    html += `
      <tr>
        <td>${aircraft.cagriKodu || ''}</td>
        <td class="kuyruk-cell">${aircraft.kuyrukNo || ''}<span class="abbr-text">${abbr}</span></td>
        <td class="${durumClass}" style="font-weight: bold;">${durumText}</td>
        <td>${aircraft.konum || ''}</td>
        <td style="mso-number-format:'\\@'; font-weight: bold; color: #1a73e8;">${faydaliSaat}</td>
        <td style="text-align: left; font-style: italic;">${aciklama}</td>
      </tr>
    `;
  });

  html += `
      </table>
    </body>
    </html>
  `;

  return html;
};

export const exportTableToExcel = (tableId: string, fileName: string) => {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Clone the table to modify it without affecting the UI
  const clone = table.cloneNode(true) as HTMLTableElement;

  // Clean up vertical text divs for Excel readability
  const verticalDivs = clone.querySelectorAll('div[class*="writing-mode"]');
  verticalDivs.forEach((div: any) => {
    div.style.writingMode = 'horizontal-tb';
    div.style.transform = 'none';
    div.style.height = 'auto';
    div.style.width = 'auto';
  });

  // Ensure styles are preserved in the export
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid black; padding: 5px; font-size: 10pt; text-align: center; vertical-align: middle; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .bg-yellow { background-color: #FFFF00 !important; }
        .bg-red { background-color: #FF0000 !important; color: white !important; }
        .bg-purple { background-color: #7030A0 !important; color: white !important; }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xls`;
  link.click();
  URL.revokeObjectURL(url);
};
