
import { getCallSignByTail } from '../constants';

export const exportAT802DailyStatusToPDF = async (scriptUrl: string, sheetId: string) => {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheetId: sheetId,
        action: 'exportAT802PDF'
      })
    });

    const result = await response.json();
    if (!result || result.status !== 'success') {
      throw new Error(result?.message || 'PDF oluşturulamadı');
    }

    // Convert base64 to blob and download
    const byteCharacters = atob(result.data.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.data.filename || 'AT802_Gunluk_Durum.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('PDF Export Error:', error);
    return { success: false, message: 'PDF oluşturulurken hata oluştu' };
  }
};

export const exportAT802DailyStatusToExcel = async (scriptUrl: string, sheetId: string) => {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheetId: sheetId,
        sheetName: 'GÜNLÜK DURUM',
        action: 'getRawData',
        range: 'A1:AL50'
      })
    });

    const result = await response.json();
    if (!result || !Array.isArray(result)) {
      throw new Error('Veri alınamadı');
    }

    let dataStartIndex = result.findIndex(row => row[0] === "1" || row[0] === 1);
    if (dataStartIndex === -1) dataStartIndex = 2;

    const filteredData = result.slice(dataStartIndex).filter(row => row[0] && !isNaN(Number(row[0])));

    // Custom Sorting based on ORMAN-XX
    const getOrder = (cagriKodu: string) => {
      const match = String(cagriKodu).match(/ORMAN-(\d+)/i);
      if (match) return parseInt(match[1]);
      return 999;
    };

    filteredData.sort((a, b) => getOrder(a[1]) - getOrder(b[1]));

    const getAbbreviation = (kuyrukNo: string) => {
      const tail = String(kuyrukNo).trim().toUpperCase();
      if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return ' (D-A)';
      if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) return ' (S-A)';
      if (tail === 'OR-2036') return ' (D-L)';
      if (tail === 'OR-2038') return ' (S-L)';
      if (tail === 'OR-1020') return ' (H)';
      return '';
    };

    const headers = [
      "SIRA NO", "ÇAĞRI KODU", "KUYRUK NUMARASI", "DURUMU", "G.FAAL SEBEBİ", "BULUNDUĞU LOKASYON", 
      "GÖVDE UÇUŞ SAATİ", "MOTOR SAATİ", "HAFTALIK FRDS BAKIM", "KALAN GÜN", 
      "HAFTALIK MOTOR ÇAL.", "KALAN GÜN", "AYLIK GARMIN GPS", "KALAN GÜN", 
      "AYLIK FRDS BAKIM", "KALAN GÜN", "3 AYLIK ELT KONTROL", "KALAN GÜN", 
      "25 SAATLİK BAKIM", "KALAN SAAT", "50 SAATLİK BAKIM", "KALAN SAAT", 
      "100 SAATLİK BAKIM", "KALAN SAAT", "200 SAATLİK BAKIM", "KALAN SAAT", 
      "300 SAATLİK BAKIM", "KALAN SAAT", "300 MOTOR BAKIMI", "KALAN SAAT", 
      "400 SAATLİK BAKIM", "KALAN SAAT", "800 SAATLİK BAKIM", "KALAN SAAT", 
      "1000 SAATLİK BAKIM", "KALAN SAAT", "YILLIK BAKIM TARİHİ", "KALAN GÜN", "AÇIKLAMA"
    ];

    let tableHtml = `
      <table border="1">
        <thead>
          <tr style="background-color: #008000; color: #ffffff; font-weight: bold;">
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    filteredData.forEach((row, index) => {
      tableHtml += '<tr>';
      tableHtml += `<td>${index + 1}</td>`; // SIRA NO
      const kuyrukNo = String(row[1] || '-').trim();
      const cagriKodu = getCallSignByTail(kuyrukNo);
      const abbr = getAbbreviation(kuyrukNo);
      
      tableHtml += `<td>${cagriKodu}</td>`; // ÇAĞRI KODU
      tableHtml += `<td>${kuyrukNo}<span style="color: red;">${abbr}</span></td>`; // KUYRUK with Red Abbreviation
      
      for (let i = 2; i <= 37; i++) {
        const val = row[i] || '-';
        let style = '';
        if (i === 2) { // DURUMU
          const v = String(val).toUpperCase();
          if (v.includes('FAAL') && !v.includes('GAYRİ')) style = 'color: green; font-weight: bold;';
          else if (v.includes('GAYRİ') || v.includes('BAKIM') || v.includes('ARIZA')) style = 'color: red; font-weight: bold;';
        }
        tableHtml += `<td style="${style}">${val}</td>`;
      }
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';

    // Add Legend Table for Excel
    const legendHtml = `
      <br/>
      <table border="1" style="width: 300px; font-size: 9px;">
        <tr style="background-color: #646464; color: white; font-weight: bold;">
          <th>KOD</th>
          <th>AÇIKLAMA</th>
        </tr>
        <tr><td>D-A</td><td>DUAL AMFİBİ</td></tr>
        <tr><td>S-A</td><td>SINGLE AMFİBİ</td></tr>
        <tr><td>D-L</td><td>DUAL LAND</td></tr>
        <tr><td>S-L</td><td>SINGLE LAND</td></tr>
        <tr><td>H</td><td>HELİTAK</td></tr>
      </table>
    `;

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10px; }
          th, td { border: 1px solid black; padding: 4px; text-align: center; }
        </style>
      </head>
      <body>
        <h2 style="text-align: center; color: #006400;">OGM HAVACILIK - AT-802 GÜNLÜK DURUM RAPORU</h2>
        <p style="text-align: right;">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</p>
        ${tableHtml}
        ${legendHtml}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `AT802_Gunluk_Durum_${new Date().toISOString().split('T')[0]}.xls`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Excel Export Error:', error);
    return { success: false, message: 'Excel oluşturulurken hata oluştu' };
  }
};
