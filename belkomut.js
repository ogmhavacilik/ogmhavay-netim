function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(contents.sheetId);
    var sheetName = contents.sheetName;
    // Sayfa ismi varsa onu al, yoksa ilk sayfayı al
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
      var range = sheet.getRange("A3:A30"); 
      var values = range.getValues();
      var rowIndex = -1;
      
      for (var i = 0; i < values.length; i++) {
        if (values[i][0] == kuyrukNo) {
          rowIndex = i + 3; // 3. satırdan başladığı için
          break;
        }
      }
      
      if (rowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Kuyruk No bulunamadı: " + kuyrukNo }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Bell-429 Sütun Eşleşmeleri (İlgili hücrelere yazım):
      // E (5): Gövde Saati
      // L (12): Konum (Görev Yeri)
      // M (13): Durum
      // N (14): Durum Ayrıntısı
      // O (15): Açıklama
      // P (16): Saat Esaslı Bakım (50H)
      // Q (17): Takvim Esaslı Bakım (Tarih)
      
      if (updates.govdeUcusSaati) sheet.getRange(rowIndex, 5).setValue(updates.govdeUcusSaati);
      if (updates.konum) sheet.getRange(rowIndex, 12).setValue(updates.konum);
      if (updates.durum) sheet.getRange(rowIndex, 13).setValue(updates.durum);
      if (updates.durumAyrintisi) sheet.getRange(rowIndex, 14).setValue(updates.durumAyrintisi);
      if (updates.aciklama) sheet.getRange(rowIndex, 15).setValue(updates.aciklama);
      if (updates.bakim50H) sheet.getRange(rowIndex, 16).setValue(updates.bakim50H);
      if (updates.bakimTakvim) sheet.getRange(rowIndex, 17).setValue(updates.bakimTakvim);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Veriler başarıyla Google E-Tablo'ya işlendi." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // VERİ ÇEKME AKSİYONU (Dinamik Eşleme)
    var mapping = contents.mapping;
    var fieldData = {};
    var maxRows = 0;

    for (var key in mapping) {
      if (mapping[key]) {
        var range = sheet.getRange(mapping[key]);
        var vals = range.getValues();
        fieldData[key] = vals;
        if (vals.length > maxRows) maxRows = vals.length;
      }
    }

    var results = [];
    for (var i = 0; i < maxRows; i++) {
      var item = {};
      var hasKuyruk = false;
      
      for (var key in fieldData) {
        var dataRow = fieldData[key][i];
        if (dataRow) {
          // Tek kolon ise direkt değer, çoklu kolon ise dizi olarak döndür
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
  return ContentService.createTextOutput("Script Aktif. Dinamik Eşleme ve Güncelleme Modu Çalışıyor.");
}
