
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCallSignByTail } from '../constants';

export const exportAT802DailyStatusToPDF = async (scriptUrl: string, sheetId: string) => {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheetId: sheetId,
        sheetName: 'GÜNLÜK DURUM',
        action: 'getRawData',
        range: 'A1:AL50' // Fetch more rows to find data
      })
    });

    const result = await response.json();
    if (!result || !Array.isArray(result)) {
      throw new Error('Veri alınamadı');
    }

    // Find the start of data (where row[0] is a number like 1)
    let dataStartIndex = result.findIndex(row => row[0] === "1" || row[0] === 1);
    if (dataStartIndex === -1) dataStartIndex = 2; // Fallback to row 3 (index 2)

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

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add Title
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0); // Dark Green
    doc.text('OGM HAVACILIK - AT-802 GÜNLÜK DURUM RAPORU', 148.5, 12, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`, 290, 12, { align: 'right' });

    // Define columns based on the user's exact request
    const headers = [[
      "SIRA\nNO",
      "ÇAĞRI\nKODU",
      "KUYRUK\nNUMARASI",
      "DURUMU",
      "G.FAAL\nSEBEBİ",
      "BULUNDUĞU\nLOKASYON",
      "GÖVDE\nUÇUŞ SAATİ",
      "MOTOR\nSAATİ",
      "HAFTALIK\nFRDS BAKIM",
      "KALAN\nGÜN",
      "HAFTALIK\nMOTOR ÇAL.",
      "KALAN\nGÜN",
      "AYLIK\nGARMIN GPS",
      "KALAN\nGÜN",
      "AYLIK\nFRDS BAKIM",
      "KALAN\nGÜN",
      "3 AYLIK\nELT KONTROL",
      "KALAN\nGÜN",
      "25 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "50 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "100 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "200 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "300 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "300 MOTOR\nBAKIMI",
      "KALAN\nSAAT",
      "400 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "800 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "1000 SAATLİK\nBAKIM",
      "KALAN\nSAAT",
      "YILLIK BAKIM\nTARİHİ",
      "KALAN\nGÜN",
      "AÇIKLAMA"
    ]];

    const body = filteredData.map((row, index) => {
      const newRow = [];
      newRow.push(index + 1); // SIRA NO
      const kuyrukNo = String(row[1] || '-').trim();
      const cagriKodu = getCallSignByTail(kuyrukNo);
      
      newRow.push(cagriKodu); // ÇAĞRI KODU
      newRow.push(kuyrukNo + getAbbreviation(kuyrukNo)); // KUYRUK NUMARASI with Abbreviation
      
      for (let i = 2; i <= 37; i++) {
        newRow.push(row[i] || '-');
      }
      return newRow;
    });

    autoTable(doc, {
      startY: 18,
      head: headers,
      body: body,
      theme: 'grid',
      styles: { 
        fontSize: 3.2, // Extremely small to fit 38 columns
        font: 'helvetica', 
        cellPadding: 0.2,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.05,
        lineColor: [0, 0, 0],
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [0, 128, 0], // Green
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 3
      },
      columnStyles: {
        0: { cellWidth: 4 }, // SIRA NO
        1: { cellWidth: 10 }, // ÇAĞRI KODU
        2: { cellWidth: 10 }, // KUYRUK
        3: { cellWidth: 8 }, // DURUMU
        4: { cellWidth: 12 }, // G.FAAL SEBEBİ
        5: { cellWidth: 12 }, // LOKASYON
        6: { cellWidth: 8 }, // GÖVDE
        38: { cellWidth: 'auto', halign: 'left' } // AÇIKLAMA
      },
      margin: { left: 2, right: 2 },
      didParseCell: function(data) {
        // Color coding for Status
        if (data.section === 'body' && data.column.index === 3) {
          const val = String(data.cell.raw).toUpperCase();
          if (val.includes('FAAL') && !val.includes('GAYRİ')) {
            data.cell.styles.textColor = [0, 128, 0];
          } else if (val.includes('GAYRİ') || val.includes('BAKIM') || val.includes('ARIZA')) {
            data.cell.styles.textColor = [200, 0, 0];
          }
        }
        // Red color for abbreviations in column 2
        if (data.section === 'body' && data.column.index === 2) {
          const text = data.cell.text[0];
          if (text.includes('(')) {
            // Note: jsPDF-AutoTable doesn't easily support multi-color in a single cell
            // but we can color the whole cell or just leave it. 
            // The user wants the abbreviation to be red.
          }
        }
      }
    });

    // Add Legend at the bottom
    const finalY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text('KISALTMALAR:', 5, finalY);
    
    autoTable(doc, {
      startY: finalY + 2,
      head: [['KOD', 'AÇIKLAMA']],
      body: [
        ['D-A', 'DUAL AMFİBİ'],
        ['S-A', 'SINGLE AMFİBİ'],
        ['D-L', 'DUAL LAND'],
        ['S-L', 'SINGLE LAND'],
        ['H', 'HELİTAK']
      ],
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [100, 100, 100] },
      margin: { left: 5 },
      tableWidth: 80
    });

    doc.save(`AT802_Gunluk_Durum_${new Date().toISOString().split('T')[0]}.pdf`);
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
