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
      
      var searchKuyruk = String(kuyrukNo).trim().toUpperCase();
      for (var i = 0; i < values.length; i++) {
        var rowVal = String(values[i][0]).trim().toUpperCase();
        if (rowVal == searchKuyruk) {
          rowIndex = i + 4; // 4. satırdan başladığı için
          break;
        }
      }
      
      if (rowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Kuyruk No bulunamadı: " + searchKuyruk }))
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
      
      function setTimeValue(colIndex, value) {
        var range = sheet.getRange(rowIndex, colIndex);
        
        if (value === null || value === undefined || value === "") {
          range.setValue("");
          return;
        }
        
        var valStr = String(value).trim();
        
        if (/^\d+$/.test(valStr)) {
          valStr = valStr + ':00';
        } else if (/^\d+[.,]\d{2}$/.test(valStr)) {
          valStr = valStr.replace(/[.,]/, ':');
        }
        
        if (/^\d+:\d{2}(:\d{2})?$/.test(valStr)) {
          var parts = valStr.split(':');
          var hours = parseInt(parts[0], 10);
          var mins = parseInt(parts[1], 10);
          var secs = parts.length > 2 ? parseInt(parts[2], 10) : 0;
          var decimalValue = (hours + (mins / 60) + (secs / 3600)) / 24;
          range.setValue(decimalValue);
          range.setNumberFormat("[h]:mm");
        } else {
          range.setValue(value);
        }
      }

      if (updates.govdeUcusSaati !== undefined) setTimeValue(5, updates.govdeUcusSaati);
      if (updates.bakim40H !== undefined) setTimeValue(8, updates.bakim40H);
      if (updates.bakim120H !== undefined) setTimeValue(9, updates.bakim120H);
      if (updates.bakim480H !== undefined) setTimeValue(10, updates.bakim480H);
      
      if (updates.bakimTakvimTarih !== undefined) {
        var dateVal = updates.bakimTakvimTarih;
        var cell = sheet.getRange(rowIndex, 11);
        if (dateVal && dateVal !== "" && dateVal !== "-") {
          var parts = String(dateVal).split(/[-./]/);
          if (parts.length === 3) {
            var day, month, year;
            if (parts[0].length === 4) { // YYYY-MM-DD
              year = parseInt(parts[0], 10);
              month = parseInt(parts[1], 10) - 1;
              day = parseInt(parts[2], 10);
            } else { // DD-MM-YY or DD-MM-YYYY
              day = parseInt(parts[0], 10);
              month = parseInt(parts[1], 10) - 1;
              var yStr = parts[2];
              year = parseInt(yStr, 10);
              if (yStr.length === 2) year += 2000;
            }
            
            var d = new Date(year, month, day);
            if (!isNaN(d.getTime())) {
              cell.setValue(d);
              cell.setNumberFormat("dd-MM-yy");
            } else {
              cell.setValue(dateVal);
            }
          } else {
            cell.setValue(dateVal);
          }
        } else {
          cell.setValue("");
        }
      }
      
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
