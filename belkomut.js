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
        var valGovde = updates.govdeUcusSaati;
        if (valGovde !== null && valGovde !== undefined && valGovde !== "") {
          var formattedGovde = String(valGovde).trim().replace(',', '.');
          var nGovde = parseFloat(formattedGovde);
          var currentCellVal = sheet.getRange(rowIndex, 5).getValue();
          var currentFormatted = String(currentCellVal).trim().replace(',', '.');
          var nCurrent = parseFloat(currentFormatted);

          if (!isNaN(nGovde)) {
            // Geçmiş tarih olsa bile saati ileri doğru güncelleme yapılıyorsa (nGovde >= nCurrent), E-Tablo'daki saat de güncellenir.
            if (!isPastDate || isNaN(nCurrent) || nGovde >= nCurrent) {
              sheet.getRange(rowIndex, 5).setValue(nGovde);
            }
          } else {
            if (!isPastDate) {
              sheet.getRange(rowIndex, 5).setValue(valGovde);
            }
          }
        } else {
          if (!isPastDate) {
            sheet.getRange(rowIndex, 5).setValue("");
          }
        }
      }
      if (updates.konum !== undefined && (!isPastDate || updates.forceUpdate)) sheet.getRange(rowIndex, 12).setValue(updates.konum);
      if (updates.durum !== undefined && (!isPastDate || updates.forceUpdate)) sheet.getRange(rowIndex, 13).setValue(updates.durum);
      if (updates.durumAyrintisi !== undefined && (!isPastDate || updates.forceUpdate)) sheet.getRange(rowIndex, 14).setValue(updates.durumAyrintisi);
      if (updates.aciklama !== undefined && (!isPastDate || updates.forceUpdate)) sheet.getRange(rowIndex, 15).setValue(updates.aciklama);
      
      // Corrected to save directly to Column H (8) for Saat Esaslı Bakım (50H)
      if (updates.bakim50H !== undefined) {
        var val50H = updates.bakim50H;
        if (val50H !== null && val50H !== undefined && val50H !== "") {
          var formatted50H = String(val50H).trim().replace(',', '.');
          var n50H = parseFloat(formatted50H);
          if (!isNaN(n50H)) {
            sheet.getRange(rowIndex, 8).setValue(n50H);
          } else {
            sheet.getRange(rowIndex, 8).setValue(val50H);
          }
        } else {
          sheet.getRange(rowIndex, 8).setValue("");
        }
      }

      // Corrected to save directly to Column J (10) for Takvim Esaslı Bakım (Tarih) as proper Date object
      if (updates.bakimTakvim !== undefined) {
        var dateVal = updates.bakimTakvim;
        var cell = sheet.getRange(rowIndex, 10);
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
            
            var d = new Date(year, month, day, 12, 0, 0);
            if (!isNaN(d.getTime())) {
              cell.setValue(d);
              cell.setNumberFormat("dd.MM.yyyy");
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
        
        var ymd = getYYYYMMDD(logData[i][1]);
        if (!ymd) continue;
        
        if (!latestLogs[kNo] || ymd >= latestLogs[kNo].ymd) {
          latestLogs[kNo] = {
            ymd: ymd,
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

// Tarih hücresini güvenli bir şekilde YYYYMMDD string formatına dönüştüren yardımcı fonksiyondur
function getYYYYMMDD(val) {
  if (!val) return "";
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = (val.getMonth() + 1).toString();
    var d = val.getDate().toString();
    if (m.length === 1) m = "0" + m;
    if (d.length === 1) d = "0" + d;
    return "" + y + m + d;
  }
  
  var str = String(val).trim();
  // gg.aa.yyyy formatı
  var p = str.split('.');
  if (p.length === 3) {
    var d = p[0];
    var m = p[1];
    var y = p[2];
    if (d.length === 1) d = "0" + d;
    if (m.length === 1) m = "0" + m;
    return "" + y + m + d;
  }
  // yyyy-aa-gg formatı
  var p2 = str.split('-');
  if (p2.length === 3) {
    if (p2[0].length === 4) {
      var y = p2[0];
      var m = p2[1];
      var d = p2[2];
      if (d.length === 1) d = "0" + d;
      if (m.length === 1) m = "0" + m;
      return "" + y + m + d;
    } else {
      var d = p2[0];
      var m = p2[1];
      var y = p2[2];
      if (d.length === 1) d = "0" + d;
      if (m.length === 1) m = "0" + m;
      return "" + y + m + d;
    }
  }
  return "";
}

function doGet(e) {
  return ContentService.createTextOutput("Script Aktif. Dinamik Eşleme ve Güncelleme Modu Çalışıyor.");
}
