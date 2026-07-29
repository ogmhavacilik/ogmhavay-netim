
import { Aircraft, Status, DailyStatusCode } from '../../types';
import { cleanDescription } from '../../services/cleanUtils';

export const formatToHHMM = (decimalHours: number | string, aircraftType?: string): string => {
  if (decimalHours === null || decimalHours === undefined || decimalHours === '') return '-';
  
  const cleanType = (aircraftType || '').toUpperCase().replace(/[\s-]/g, '');
  const isDecimalType = cleanType.indexOf('B360') !== -1 || 
                        cleanType.indexOf('C650') !== -1 || 
                        cleanType.indexOf('BELL429') !== -1;

  let hours = 0;
  if (typeof decimalHours === 'number') {
    hours = decimalHours;
  } else {
    const s = String(decimalHours).trim().replace(',', '.');
    if (s.includes(':')) {
      const parts = s.split(':').map(Number);
      hours = (parts[0] || 0) + (parts[1] || 0) / 60;
    } else {
      hours = parseFloat(s) || 0;
    }
  }

  if (isNaN(hours)) return String(decimalHours);

  if (isDecimalType) {
    return hours.toFixed(1).replace('.', ',');
  }

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
    if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031', 'OR-2039', 'OR-2040'].includes(tail)) return ' (SA)';
    if (tail === 'OR-2036') return ' (DL)';
    if (tail === 'OR-2038') return ' (SL)';
    if (tail === 'OR-1020') return ' (H)';
    return '';
  };

  const rowSpans: number[] = [];
  let idx = 0;
  while (idx < sortedFleet.length) {
    let span = 1;
    while (idx + span < sortedFleet.length && sortedFleet[idx + span].tip === sortedFleet[idx].tip) {
      span++;
    }
    rowSpans.push(span);
    for (let s = 1; s < span; s++) {
      rowSpans.push(0);
    }
    idx += span;
  }

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1.5px solid black; padding: 8px; text-align: center; vertical-align: middle; font-size: 12px; }
        .title-row { font-weight: bold; font-size: 24px; text-align: center; padding: 15px; color: #1f2937; }
        .header-row th { font-weight: bold; background-color: #d9d9d9; color: black; }
        .date-text { color: #dc2626; font-weight: bold; text-align: right; font-size: 20px; padding-bottom: 10px; }
        .faal { background-color: #e8f5e9; color: #2e7d32; font-weight: bold; }
        .gayrifaal { background-color: #ffebee; color: #c62828; font-weight: bold; }
        .abbr-text { color: #dc2626; font-weight: bold; margin-left: 4px; }
        .aciklama-cell { text-align: left; font-style: italic; white-space: pre-wrap; color: #4b5563; font-size: 11px; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="3" style="border: none;"></td>
          <td colspan="4" class="title-row" style="border: none;">ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU</td>
          <td colspan="3" class="date-text" style="border: none;">${dateStr.split(' ')[0]}</td>
        </tr>
        <tr class="header-row">
          <th>SIRA NO</th>
          <th>HAVA ARACI TİPİ</th>
          <th>ÇAĞRI KODU</th>
          <th>KUYRUK NUMARASI</th>
          <th>GÖVDE SAATİ</th>
          <th>DURUM</th>
          <th>DURUM AYRINTISI</th>
          <th>KONUM</th>
          <th>FAYDALI SAAT</th>
          <th style="text-align: left;">AÇIKLAMA</th>
        </tr>
  `;

  sortedFleet.forEach((aircraft, index) => {
    const aciklama = cleanDescription(aircraft.aciklama).replace(/\n/g, '<br>');
    const faydaliSaat = (aircraft.faydaliSaat !== null && aircraft.faydaliSaat !== undefined) ? formatToHHMM(aircraft.faydaliSaat, aircraft.tip) : '';
    const abbr = getAbbreviation(aircraft.kuyrukNo || '');
    
    const dUpper = String(aircraft.durum || '').toUpperCase();
    const dAyr = String(aircraft.durumAyrintisi || '').toUpperCase();
    const isFirebossGoreviYapamaz = dUpper.includes("FIREBOSS") || dUpper.includes("YANGIN GÖREVİ YAPAMAZ") || 
                                  dUpper.includes("YANGIN GOREVI YAPAMAZ") ||
                                  dAyr.includes("FIREBOSS") ||
                                  dAyr.includes("YANGIN GÖREVİ YAPAMAZ") ||
                                  dAyr.includes("YANGIN GOREVI YAPAMAZ");

    const isFaal = isFirebossGoreviYapamaz || (dUpper.includes("FAAL") && !dUpper.includes("GAYRİ") && !dUpper.includes("GAYRI"));
    const durumText = aircraft.durum ? String(aircraft.durum).toUpperCase() : '';
    const alertText = aircraft.durumAyrintisi && aircraft.durumAyrintisi !== '-' ? String(aircraft.durumAyrintisi).toUpperCase() : '';
    
    let durumTdHtml = '';
    if (isFirebossGoreviYapamaz) {
      durumTdHtml = `<td style="background-color: #e8f5e9; font-weight: bold; text-align: center; vertical-align: middle; padding: 4px;">
        <div style="color: #2e7d32; font-size: 12px; font-weight: 900; line-height: 1.2;">FAAL</div>
        <div style="color: #c62828; font-size: 10px; font-weight: 900; line-height: 1.1;">FIREBOSS<br/>GÖREVİ<br/>YAPAMAZ</div>
      </td>`;
    } else {
      const durumClass = isFaal ? "faal" : "gayrifaal";
      durumTdHtml = `<td class="${durumClass}">${durumText}</td>`;
    }

    const span = rowSpans[index];
    let typeTd = '';
    if (span > 0) {
      typeTd = `<td rowspan="${span}" style="font-weight: bold; color: #111827; background-color: #f9fafb;">${aircraft.tip || ''}</td>`;
    }

    html += `
      <tr>
        <td style="font-weight: bold; color: #111827;">${index + 1}</td>
        ${typeTd}
        <td style="font-weight: bold; color: #111827;">${aircraft.cagriKodu || ''}</td>
        <td style="font-weight: bold; color: #111827;">${aircraft.kuyrukNo || ''} <span class="abbr-text">${abbr}</span></td>
        <td style="mso-number-format:'\\@'; font-weight: bold; color: #FF6B00; font-size: 16px;">${(!aircraft.govdeUcusSaati || aircraft.govdeUcusSaati === '-' || aircraft.govdeUcusSaati === '0') ? '-' : formatToHHMM(aircraft.govdeUcusSaati, aircraft.tip)}</td>
        ${durumTdHtml}
        <td style="font-weight: bold; color: #111827;">${alertText}</td>
        <td style="font-weight: bold; color: #111827; text-transform: uppercase;">${aircraft.konum || ''}</td>
        <td style="mso-number-format:'\\@'; font-weight: bold; color: #1a73e8; font-size: 16px;">${faydaliSaat}</td>
        <td class="aciklama-cell">${aciklama}</td>
      </tr>
    `;
  });

  html += `
      </table>
      <br />
      <table style="width: 100%; border: none;">
        <tr>
          <td style="border: none; text-align: left; font-size: 12px; font-weight: bold; padding: 2px;"><span style="color: #dc2626;">H:</span> HELİTAK</td>
          <td style="border: none; text-align: left; font-size: 12px; font-weight: bold; padding: 2px;"><span style="color: #dc2626;">SA:</span> SINGLE AMFİBİ</td>
          <td style="border: none; text-align: left; font-size: 12px; font-weight: bold; padding: 2px;"><span style="color: #dc2626;">DA:</span> DUAL AMFİBİ</td>
          <td style="border: none; text-align: left; font-size: 12px; font-weight: bold; padding: 2px;"><span style="color: #dc2626;">SL:</span> SINGLE LAND</td>
          <td style="border: none; text-align: left; font-size: 12px; font-weight: bold; padding: 2px;"><span style="color: #dc2626;">DL:</span> DUAL LAND</td>
        </tr>
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
