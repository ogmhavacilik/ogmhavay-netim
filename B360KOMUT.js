function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(contents.sheetId);
    var sheetName = contents.sheetName;
    var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
    
    if (contents.action === 'updateAircraftData') {
      var kuyrukNo = contents.kuyrukNo;
      var updates = contents.updates;
      
      var range = sheet.getRange("A3:A30"); 
      var values = range.getValues();
      var rowIndex = -1;
      
      for (var i = 0; i < values.length; i++) {
        if (values[i][0] == kuyrukNo) {
          rowIndex = i + 3;
          break;
        }
      }
      
      if (rowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Kuyruk No bulunamadı: " + kuyrukNo }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // E (5): Gövde Uçuş Saati
      // H (8): Landing
      // J (10): Saat Esaslı Bakım (200H)
      // K (11): Takvim Esaslı Bakım
      // M (13): Konum
      // N (14): Durum
      // O (15): Durum Ayrıntısı
      // P (16): Açıklama
      
      if (updates.govdeUcusSaati !== undefined) sheet.getRange(rowIndex, 5).setValue(updates.govdeUcusSaati);
      if (updates.landings !== undefined) sheet.getRange(rowIndex, 8).setValue(updates.landings);
      if (updates.bakim200H !== undefined) sheet.getRange(rowIndex, 10).setValue(updates.bakim200H);
      if (updates.bakimTakvimTarih !== undefined) sheet.getRange(rowIndex, 11).setValue(updates.bakimTakvimTarih);
      if (updates.konum !== undefined) sheet.getRange(rowIndex, 13).setValue(updates.konum);
      if (updates.durum !== undefined) sheet.getRange(rowIndex, 14).setValue(updates.durum);
      if (updates.durumAyrintisi !== undefined) sheet.getRange(rowIndex, 15).setValue(updates.durumAyrintisi);
      if (updates.aciklama !== undefined) sheet.getRange(rowIndex, 16).setValue(updates.aciklama);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "B-360 verileri başarıyla işlendi." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var mapping = contents.mapping;
    var fieldData = {};
    var maxRows = 0;

    for (var key in mapping) {
      if (mapping[key]) {
        try {
          var range = sheet.getRange(mapping[key]);
          var vals = range.getValues();
          fieldData[key] = vals;
          if (vals.length > maxRows) maxRows = vals.length;
        } catch(e) {}
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
          if (key === 'kuyrukNo' && dataRow[0]) hasKuyruk = true;
        }
      }
      if (hasKuyruk) results.push(item);
    }

    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("B-360 Script Aktif.");
}
