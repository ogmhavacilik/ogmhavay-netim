function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(contents.sheetId);
    var sheetName = contents.sheetName;
    var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
    
    // GÜNCELLEME AKSİYONU
    if (contents.action === 'replaceEntireSpreadsheet') {
      var fileData = contents.fileData;
      if (!fileData) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Dosya verisi eksik." })).setMimeType(ContentService.MimeType.JSON);
      }
      try {
        var decodedData = Utilities.base64Decode(fileData.split(',')[1] || fileData);
        var blob = Utilities.newBlob(decodedData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'temp.xlsx');
        var fileId = ss.getId();
        Drive.Files.update({
          title: ss.getName(),
          mimeType: MimeType.GOOGLE_SHEETS
        }, fileId, blob);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Excel başarıyla yüklendi." })).setMimeType(ContentService.MimeType.JSON);
      } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Excel yükleme hatası: " + e.toString() })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (contents.action === 'updateAircraftData') {
      var kuyrukNo = contents.kuyrukNo;
      var updates = contents.updates;
      
      // Kuyruk numarasını bul (A sütununda ara)
      var range = sheet.getRange("A4:A30"); 
      var values = range.getValues();
      var rowIndex = -1;
      
      for (var i = 0; i < values.length; i++) {
        if (values[i][0] == kuyrukNo) {
          rowIndex = i + 4; // 4. satırdan başladığı için
          break;
        }
      }
      
      if (rowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Kuyruk No bulunamadı: " + kuyrukNo }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // T-70 Sütun Eşleşmeleri:
      // E (5): Gövde Saati
      // H (8): 40 Saat Bakım
      // I (9): 120 Saat Bakım
      // J (10): 480 Saat Bakım
      // K (11): Takvim Bakım (Tarih)
      // N (14): Faydalı Saat
      // P (16): Konum
      // Q (17): Durumu
      // R (18): Durumu Ayrıntı
      // S (19): Açıklama
      
      if (updates.govdeUcusSaati !== undefined) sheet.getRange(rowIndex, 5).setValue(updates.govdeUcusSaati);
      if (updates.bakim40H !== undefined) sheet.getRange(rowIndex, 8).setValue(updates.bakim40H);
      if (updates.bakim120H !== undefined) sheet.getRange(rowIndex, 9).setValue(updates.bakim120H);
      if (updates.bakim480H !== undefined) sheet.getRange(rowIndex, 10).setValue(updates.bakim480H);
      if (updates.bakimTakvimTarih !== undefined) sheet.getRange(rowIndex, 11).setValue(updates.bakimTakvimTarih);
      if (updates.faydaliSaat !== undefined) sheet.getRange(rowIndex, 14).setValue(updates.faydaliSaat);
      if (updates.konum !== undefined) sheet.getRange(rowIndex, 16).setValue(updates.konum);
      if (updates.durum !== undefined) sheet.getRange(rowIndex, 17).setValue(updates.durum);
      if (updates.durumAyrintisi !== undefined) sheet.getRange(rowIndex, 18).setValue(updates.durumAyrintisi);
      if (updates.aciklama !== undefined) sheet.getRange(rowIndex, 19).setValue(updates.aciklama);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "T-70 verileri başarıyla Google E-Tablo'ya işlendi." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // VERİ ÇEKME AKSİYONU
    var mapping = contents.mapping;
    var fieldData = {};
    var maxRows = 0;

    for (var key in mapping) {
      if (mapping[key]) {
        try {
          var range = sheet.getRange(mapping[key]);
          var vals = range.getDisplayValues(); // getValues yerine getDisplayValues kullanıldı
          fieldData[key] = vals;
          if (vals.length > maxRows) maxRows = vals.length;
        } catch(e) {
          // Bazı alanlar eksik olabilir, sessizce geç
        }
      }
    }

    var results = [];
    for (var i = 0; i < maxRows; i++) {
      var item = {};
      var hasKuyruk = false;
      
      for (var key in fieldData) {
        var dataRow = fieldData[key][i];
        if (dataRow) {
          item[key] = (dataRow.length === 1) ? dataRow[0] : dataRow;
          if (key === 'kuyrukNo' && dataRow[0]) {
            hasKuyruk = true;
          }
        }
      }
      
      if (hasKuyruk) {
        results.push(item);
      }
    }

    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("T-70 Script Aktif.");
}
