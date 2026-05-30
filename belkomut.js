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

      var isPastDate = false;
      if (updates.islemTarihi) {
        var todayStr = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
        if (updates.islemTarihi < todayStr) {
          isPastDate = true;
        }
      }
      
      if (updates.govdeUcusSaati !== undefined) {
        if (!isPastDate) {
          sheet.getRange(rowIndex, 5).setValue(updates.govdeUcusSaati);
        } else {
          // Geriye dönük güncelleme ise, Column E'yi geçmiş saat değeriyle ezmiyoruz.
          // Envanter Log'daki en son/güncel değeri koruyoruz.
          var latestLogs = getLatestLogs();
          var kNoClean = String(kuyrukNo).trim().toUpperCase();
          if (latestLogs[kNoClean]) {
            var latestHours = latestLogs[kNoClean].govdeUcusSaati;
            if (latestHours !== undefined && latestHours !== "" && latestHours !== null) {
              sheet.getRange(rowIndex, 5).setValue(latestHours);
            }
          }
        }
      }
      if (updates.konum !== undefined) sheet.getRange(rowIndex, 12).setValue(updates.konum);
      if (updates.durum !== undefined) sheet.getRange(rowIndex, 13).setValue(updates.durum);
      if (updates.durumAyrintisi !== undefined) sheet.getRange(rowIndex, 14).setValue(updates.durumAyrintisi);
      if (updates.aciklama !== undefined) sheet.getRange(rowIndex, 15).setValue(updates.aciklama);
      if (updates.bakim50H !== undefined) sheet.getRange(rowIndex, 16).setValue(updates.bakim50H);
      if (updates.bakimTakvim !== undefined) sheet.getRange(rowIndex, 17).setValue(updates.bakimTakvim);
      
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

    var latestLogs = getLatestLogs();
    var startRow = 3;
    if (mapping && mapping.kuyrukNo) {
      var match = mapping.kuyrukNo.match(/\d+/);
      if (match) {
        startRow = parseInt(match[0]);
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
        var kNoClean = String(item.kuyrukNo).trim().toUpperCase();
        if (latestLogs[kNoClean]) {
          var logInfo = latestLogs[kNoClean];
          if (logInfo.govdeUcusSaati !== undefined && logInfo.govdeUcusSaati !== "" && logInfo.govdeUcusSaati !== null) {
            item.govdeUcusSaati = logInfo.govdeUcusSaati;
            // E-Bölümünü de senkronize tut
            var cellVal = sheet.getRange(i + startRow, 5).getValue();
            if (String(cellVal) !== String(logInfo.govdeUcusSaati)) {
              sheet.getRange(i + startRow, 5).setValue(logInfo.govdeUcusSaati);
            }
          }
          if (logInfo.durum !== undefined && logInfo.durum !== "" && logInfo.durum !== null) {
            item.durum = logInfo.durum;
            var cellVal = sheet.getRange(i + startRow, 13).getValue();
            if (String(cellVal) !== String(logInfo.durum)) {
              sheet.getRange(i + startRow, 13).setValue(logInfo.durum);
            }
          }
          if (logInfo.durumAyrintisi !== undefined && logInfo.durumAyrintisi !== "" && logInfo.durumAyrintisi !== null) {
            if (String(logInfo.durumAyrintisi).trim() !== "") {
              item.durumAyrintisi = logInfo.durumAyrintisi;
              var cellVal = sheet.getRange(i + startRow, 14).getValue();
              if (String(cellVal) !== String(logInfo.durumAyrintisi)) {
                sheet.getRange(i + startRow, 14).setValue(logInfo.durumAyrintisi);
              }
            }
          }
          if (logInfo.konum !== undefined && logInfo.konum !== "" && logInfo.konum !== null) {
            item.konum = logInfo.konum;
            var cellVal = sheet.getRange(i + startRow, 12).getValue();
            if (String(cellVal) !== String(logInfo.konum)) {
              sheet.getRange(i + startRow, 12).setValue(logInfo.konum);
            }
          }
          if (logInfo.aciklama !== undefined && logInfo.aciklama !== null) {
            item.aciklama = logInfo.aciklama;
            var cellVal = sheet.getRange(i + startRow, 15).getValue();
            if (String(cellVal) !== String(logInfo.aciklama)) {
              sheet.getRange(i + startRow, 15).setValue(logInfo.aciklama);
            }
          }
        }
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

// Envanter Log dosyasından en güncel uçar/uçuş durum/saat kayıtlarını çeker
function getLatestLogs() {
  var latestLogs = {};
  try {
    var logSs = SpreadsheetApp.openById("1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg");
    var logSheet = logSs.getSheetByName("Envanter Log");
    if (logSheet) {
      var logData = logSheet.getDataRange().getValues();
      for (var i = 1; i < logData.length; i++) {
        var kNo = String(logData[i][2]).trim().toUpperCase();
        if (!kNo) continue;
        
        var rDate = logData[i][1];
        var dateObj;
        if (rDate instanceof Date) {
          dateObj = rDate;
        } else {
          var p = String(rDate).split('.');
          if (p.length === 3) {
            dateObj = new Date(p[2], p[1] - 1, p[0]);
          } else {
            dateObj = new Date(rDate);
          }
        }
        
        if (!latestLogs[kNo] || dateObj > latestLogs[kNo].dateObj) {
          latestLogs[kNo] = {
            dateObj: dateObj,
            govdeUcusSaati: logData[i][4],
            faydaliSaat: logData[i][5],
            konum: logData[i][6],
            durum: logData[i][7],
            durumAyrintisi: logData[i][8],
            aciklama: logData[i][9]
          };
        }
      }
    }
  } catch (err) {
    Logger.log("getLatestLogs error: " + err.toString());
  }
  return latestLogs;
}

function doGet(e) {
  return ContentService.createTextOutput("Script Aktif. Dinamik Eşleme ve Güncelleme Modu Çalışıyor.");
}
