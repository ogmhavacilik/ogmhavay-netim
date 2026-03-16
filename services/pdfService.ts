import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OPLItem } from '../types';

export const exportOPLToPDF = async (aircraftTail: string, oplData: any[], dynamicHeaders: string[]) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Başlık ve Bilgiler
    const cleanTitle = `${aircraftTail} ÖMÜRLÜ PARÇA LİSTESİ (OPL)`.replace(/İ/g, 'I').replace(/ı/g, 'i').replace(/Ş/g, 'S').replace(/ş/g, 's').replace(/Ğ/g, 'G').replace(/ğ/g, 'g').replace(/Ü/g, 'U').replace(/ü/g, 'u').replace(/Ö/g, 'O').replace(/ö/g, 'o');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(cleanTitle, 14, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}`, 14, 22);

    // PDF'de gösterilecek başlıklar
    const pdfHeaders = [["DURUM", ...dynamicHeaders].map(h => h.replace(/İ/g, 'I').replace(/ı/g, 'i').replace(/Ş/g, 'S').replace(/ş/g, 's').replace(/Ğ/g, 'G').replace(/ğ/g, 'g').replace(/Ü/g, 'U').replace(/ü/g, 'u').replace(/Ö/g, 'O').replace(/ö/g, 'o'))];

    const body = oplData.map(item => {
      const row = [item['IS_MERGED_RECORD'] || ''];
      dynamicHeaders.forEach(header => {
        const val = String(item[header] || '-');
        row.push(val.replace(/İ/g, 'I').replace(/ı/g, 'i').replace(/Ş/g, 'S').replace(/ş/g, 's').replace(/Ğ/g, 'G').replace(/ğ/g, 'g').replace(/Ü/g, 'U').replace(/ü/g, 'u').replace(/Ö/g, 'O').replace(/ö/g, 'o'));
      });
      return row;
    });

    autoTable(doc, {
      startY: 28,
      head: pdfHeaders,
      body: body,
      theme: 'grid',
      styles: {
        fontSize: dynamicHeaders.length > 15 ? 7 : 8,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
        font: 'helvetica',
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 15 }, // DURUM
        1: { halign: 'left', cellWidth: 50 }, // Parça Adı
      },
      margin: { top: 25, bottom: 20, left: 10, right: 10 },
      didParseCell: (data) => {
        // Red highlighting removed as per user request
      },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(
          `Sayfa ${data.pageNumber}`,
          doc.internal.pageSize.width - 25,
          doc.internal.pageSize.height - 10
        );
      }
    });

    doc.save(`${aircraftTail}_OPL_Listesi.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert("PDF oluşturulurken bir hata oluştu.");
  }
};

export const exportAT802DailyStatusToPDF = async (scriptUrl: string, sheetId: string) => {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'exportAT802PDF',
        sheetId: sheetId
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (result.success && result.data && result.data.base64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.data.base64}`;
      link.download = result.data.filename || 'AT802_Daily_Status.pdf';
      link.click();
      return { success: true, message: 'PDF başarıyla indirildi.' };
    }
    return { success: false, message: result.error || 'PDF oluşturulamadı.' };
  } catch (error: any) {
    console.error("exportAT802DailyStatusToPDF error:", error);
    return { success: false, message: error.message || 'Sunucu bağlantı hatası.' };
  }
};
