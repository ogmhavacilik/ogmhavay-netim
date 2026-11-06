function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(contents.sheetId);
    var sheetName = contents.sheetName;
    var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
    
    if (contents.action === 'getFileMetadata' || contents.action === 'getVersionHistory' || contents.action === 'getSurumGecmisi') {
      var targetFileId = contents.sheetId || ss.getId();
      var lastUpdated = "";
      var isoDate = "";
      var lastUser = "";
      var firstSheetDate = "";
      
      // 0. ÖNCELİK: İlk sayfadaki (1. sıradaki sayfa) veri güncelleme tarihini doğrudan oku
      try {
        var firstSheet = ss.getSheets()[0];
        if (firstSheet) {
          var p1Val = firstSheet.getRange("P1").getValue();
          if (p1Val instanceof Date && !isNaN(p1Val.getTime())) {
            firstSheetDate = Utilities.formatDate(p1Val, "Europe/Istanbul", "dd.MM.yyyy");
            isoDate = Utilities.formatDate(p1Val, "Europe/Istanbul", "yyyy-MM-dd");
          } else {
            var p1Str = firstSheet.getRange("P1").getDisplayValue().trim();
            if (p1Str && (p1Str.match(/^\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4}/) || p1Str.match(/^\d{4}-\d{2}-\d{2}/))) {
              firstSheetDate = p1Str;
            }
          }
        }
      } catch(eSheet) {}
      
      try {
        var token = ScriptApp.getOAuthToken();
        var revUrl = "https://www.googleapis.com/drive/v3/files/" + targetFileId + "/revisions?fields=revisions(id,modifiedTime,lastModifyingUser)&pageSize=1000";
        var res = UrlFetchApp.fetch(revUrl, {
          headers: { "Authorization": "Bearer " + token },
          muteHttpExceptions: true
        });
        if (res.getResponseCode() === 200) {
          var parsed = JSON.parse(res.getContentText());
          if (parsed.revisions && parsed.revisions.length > 0) {
            for (var rIdx = parsed.revisions.length - 1; rIdx >= 0; rIdx--) {
              var rev = parsed.revisions[rIdx];
              if (rev.modifiedTime) {
                var d = new Date(rev.modifiedTime);
                var revDisplay = Utilities.formatDate(d, "Europe/Istanbul", "dd.MM.yyyy HH:mm");
                var revIso = Utilities.formatDate(d, "Europe/Istanbul", "yyyy-MM-dd");
                
                if (firstSheetDate) {
                  var timePart = Utilities.formatDate(d, "Europe/Istanbul", "HH:mm");
                  lastUpdated = firstSheetDate.indexOf(":") === -1 ? (firstSheetDate + " " + timePart) : firstSheetDate;
                  if (!isoDate) {
                    var pParts = firstSheetDate.split(/[\.\/\-]/);
                    if (pParts.length >= 3 && pParts[2].length === 4) {
                      isoDate = pParts[2] + "-" + pParts[1] + "-" + pParts[0];
                    } else {
                      isoDate = revIso;
                    }
                  }
                } else {
                  lastUpdated = revDisplay;
                  isoDate = revIso;
                }
                lastUser = (rev.lastModifyingUser && rev.lastModifyingUser.displayName) || "";
                break;
              }
            }
          }
        }
      } catch (errRev) {}

      if (!lastUpdated) {
        if (firstSheetDate) {
          lastUpdated = firstSheetDate;
        } else {
          try {
            var file = DriveApp.getFileById(targetFileId);
            var lu = file.getLastUpdated();
            lastUpdated = Utilities.formatDate(lu, "Europe/Istanbul", "dd.MM.yyyy HH:mm");
            isoDate = Utilities.formatDate(lu, "Europe/Istanbul", "yyyy-MM-dd");
          } catch (err) {
            lastUpdated = Utilities.formatDate(new Date(), "Europe/Istanbul", "dd.MM.yyyy HH:mm");
            isoDate = Utilities.formatDate(new Date(), "Europe/Istanbul", "yyyy-MM-dd");
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        success: true,
        data: {
          sheetId: targetFileId,
          name: ss.getName(),
          lastUpdated: lastUpdated,
          isoDate: isoDate,
          lastUser: lastUser
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }


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
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "C-650 verileri başarıyla işlendi." }))
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
  return ContentService.createTextOutput("C-650 Script Aktif.");
}
