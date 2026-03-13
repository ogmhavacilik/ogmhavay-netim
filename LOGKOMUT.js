function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return jsonError("Post verisi alınamadı.");
    var params = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(params.sheetId);
    var action = (params.action || "getAircraftData").toString().trim();

    // -----------------------------------------------------
    // 🔵 AKSİYON: ÖPL VERİSİ (ARŞİV) SORGULAMA
    // -----------------------------------------------------
    if (action === "getOPLData") {
      var searchKuyruk = String(params.kuyrukNo || "").trim().toUpperCase();
      var cleanSearch = searchKuyruk.replace(/[-\s]/g, ""); // Örn: "OR2021"
      
      var sheet = findSheet(ss, "ÖPL") || findSheet(ss, "Ö.P.L.");
      if (!sheet) return jsonError("ÖPL sayfası bulunamadı.");

      var headers = sheet.getRange("A2:AB2").getDisplayValues()[0];
      var dataRange = sheet.getRange("A3:AB1236");
      var dataValues = dataRange.getDisplayValues();
      
      // B ve C sütunlarındaki birleşmiş alanları tek seferde al (Performans için)
      var colBRanges = sheet.getRange("B3:B1236").getMergedRanges();
      var colCRanges = sheet.getRange("C3:C1236").getMergedRanges();

      var results = [];

      for (var i = 0; i < dataValues.length; i++) {
        var rowIndex = i + 3; 
        var row = dataValues[i];
        
        // 1. SATIR SAHİBİNİ TESPİT ET
        var rawB = String(row[1] || "").trim().toUpperCase(); 
        var rawC = String(row[2] || "").trim().toUpperCase(); 
        var ownerB = rawB;
        var ownerC = rawC;
        var isMerged = false;

        // Merge Kontrolü (B sütunu - Kuyruk No ana kaynağı)
        if (ownerB === "") {
          for (var m = 0; m < colBRanges.length; m++) {
            var mr = colBRanges[m];
            if (rowIndex >= mr.getRow() && rowIndex <= mr.getLastRow()) {
              ownerB = mr.getDisplayValue().trim().toUpperCase();
              isMerged = true; break;
            }
          }
        }
        // Merge Kontrolü (C sütunu - Alternatif kaynak)
        if (ownerC === "") {
          for (var m = 0; m < colCRanges.length; m++) {
            var mr = colCRanges[m];
            if (rowIndex >= mr.getRow() && rowIndex <= mr.getLastRow()) {
              ownerC = mr.getDisplayValue().trim().toUpperCase();
              isMerged = true; break;
            }
          }
        }

        // 2. KESİN FİLTRELEME (TAM EŞİTLİK ŞARTI)
        var cleanB = ownerB.replace(/[-\s]/g, "");
        var cleanC = ownerC.replace(/[-\s]/g, "");
        
        // Eğer aranan uçak varsa ve sahibi bu uçak değilse (TAM EŞİTLİK), satırı atla
        if (cleanSearch !== "") {
          if (cleanB !== cleanSearch && cleanC !== cleanSearch) {
             continue; 
          }
        } else {
          if (cleanB === "" && cleanC === "") continue;
        }

        // 3. VERİ KONTROLÜ (Boş ara satırları ele)
        var hasContent = false;
        for (var k = 3; k < row.length; k++) {
          var val = String(row[k] || "").trim();
          if (val !== "" && val !== "-" && val !== "0" && val !== "00:00") {
            hasContent = true; break;
          }
        }

        if (hasContent) {
          var obj = { "IS_MERGED_RECORD": isMerged ? "BİRLEŞİK" : "" };
          for (var c = 0; c < headers.length; c++) {
            var hName = String(headers[c] || "KOLON_" + (c + 1)).trim();
            if (c === 1) obj[hName] = ownerB;
            else if (c === 2) obj[hName] = ownerC;
            else obj[hName] = row[c] || "";
          }
          results.push(obj);
        }
      }
      return jsonSuccess(results);
    }

    // -----------------------------------------------------
    // 🟠 AKSİYON: MAİL ALICI YÖNETİMİ
    // -----------------------------------------------------
    if (action === "saveMailRecipient") {
      var mailSheet = findSheet(ss, "mail log");
      var expectedHeaders = ["ID", "PERSONEL ADI", "PERSONEL MAİL ADRESİ", "MAİL GÖNDERME TÜRÜ", "SAAT", "GÜN SEÇENEĞİ", "GÖNDERİLECEK MAİLİN EKİ", "SON GÖNDERİM"];
      
      if (!mailSheet) {
        mailSheet = ss.insertSheet("mail log");
        mailSheet.appendRow(expectedHeaders);
        mailSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#d9ead3").setBorder(true, true, true, true, true, true);
      }
      
      var id = params.id || Utilities.getUuid();
      var name = params.name || "";
      var email = params.email || "";
      var type = params.type || "MANUEL";
      var time = params.time || "";
      var days = params.days || "";
      var attachments = params.attachments || "";
      
      var data = mailSheet.getDataRange().getValues();
      var foundRow = -1;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
          foundRow = i + 1;
          break;
        }
      }
      
      var rowData = [id, name, email, type, time, days, attachments, ""];
      if (foundRow > 0) {
        // Mevcut kaydı güncelle (SON GÖNDERİM'i koru)
        rowData[7] = data[foundRow-1][7]; 
        mailSheet.getRange(foundRow, 1, 1, 8).setValues([rowData]);
      } else {
        // Yeni kayıt ekle
        mailSheet.appendRow(rowData);
      }
      return jsonSuccess({ id: id });
    }

    // 🔵 AKSİYON: FAALİYET LOGU ÇEKME
    if (action === "getFaaliyetLog") {
      var faalLogSheet = findSheet(ss, "Faaliyet Log");
      if (!faalLogSheet) return jsonSuccess({ faaliyetLog: [], intraDayLog: [] });
      
      var data = faalLogSheet.getDataRange().getValues();
      var results = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0]) continue; // ID yoksa atla
        
        var tarihVal = row[1];
        var tarihStr = "";
        if (tarihVal instanceof Date) {
          tarihStr = Utilities.formatDate(tarihVal, Session.getScriptTimeZone(), "dd.MM.yyyy");
        } else {
          tarihStr = String(tarihVal).trim();
        }

        results.push({
          id: String(row[0]).trim(),
          tarih: tarihStr,
          kuyrukNo: String(row[2] || '').trim(),
          tip: String(row[3] || '').trim(),
          durum: String(row[4] || '').trim(),
          analizKodu: row[5] ? String(row[5]).trim() : ''
        });
      }
      return jsonSuccess({ faaliyetLog: results, intraDayLog: [] });
    }

    // 🔵 AKSİYON: LOG GÜNCELLEME (Analiz Kodu vb.)
    if (action === "updateLogEntry") {
      var faalLogSheet = findSheet(ss, "Faaliyet Log");
      if (!faalLogSheet) return jsonError("Faaliyet Log sayfası bulunamadı.");

      var kuyrukNo = String(params.kuyrukNo || "").trim();
      var dateStr = String(params.date || "").trim(); // dd.MM.yyyy
      var newCode = String(params.newCode || "").trim();
      var id = dateStr + "_" + kuyrukNo;

      var data = faalLogSheet.getRange("A:A").getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === id) {
          faalLogSheet.getRange(i + 1, 6).setValue(newCode);
          return jsonSuccess("Log güncellendi: " + id + " -> " + newCode);
        }
      }
      
      // Eğer log yoksa yeni satır ekle (Bugün için manuel override yapılmış olabilir)
      var bugun = new Date();
      var bugunStr = Utilities.formatDate(bugun, Session.getScriptTimeZone(), "dd.MM.yyyy");
      if (dateStr === bugunStr) {
        faalLogSheet.appendRow([id, dateStr, kuyrukNo, params.tip || "", params.durum || "MANUEL GÜNCELLEME", newCode]);
        return jsonSuccess("Yeni log girişi oluşturuldu: " + id);
      }

      return jsonError("Güncellenecek log kaydı bulunamadı: " + id);
    }

    // 🔵 AKSİYON: SİSTEM LOGLARI (ENVANTER VE FAALİYET)
    // BU BLOK KULLANICI İSTEĞİ ÜZERİNE KALDIRILDI.

    if (action === "getMailRecipients") {
      var mailSheet = findSheet(ss, "mail log");
      if (!mailSheet) return jsonSuccess([]);
      
      var data = mailSheet.getDataRange().getDisplayValues();
      var headers = data[0];
      var recipients = [];
      
      for (var i = 1; i < data.length; i++) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = data[i][j];
        }
        recipients.push(obj);
      }
      return jsonSuccess(recipients);
    }

    if (action === "deleteMailRecipient") {
      var mailSheet = findSheet(ss, "mail log");
      if (!mailSheet) return jsonError("Sayfa bulunamadı.");
      
      var idToDelete = params.id;
      var data = mailSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == idToDelete) {
          mailSheet.deleteRow(i + 1);
          return jsonSuccess("Silindi");
        }
      }
      return jsonError("Alıcı bulunamadı.");
    }

    if (action === "sendManualEmail") {
      var recipientId = String(params.id || "").trim();
      var customAttachments = params.customAttachments || [];
      var mailSheet = findSheet(ss, "mail log");
      if (!mailSheet) return jsonError("Alıcı listesi bulunamadı.");
      
      var data = mailSheet.getDataRange().getValues();
      var headers = data[0].map(function(h) { return String(h).trim(); });
      var recipient = null;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === recipientId) {
          recipient = {};
          for (var j = 0; j < headers.length; j++) {
            recipient[headers[j]] = data[i][j];
          }
          break;
        }
      }
      
      if (!recipient) return jsonError("Alıcı bulunamadı. Aranan ID: " + recipientId);
      
      sendReportEmail(recipient, customAttachments);
      return jsonSuccess("E-posta gönderildi.");
    }

    if (action === "testMail") {
      var email = params.email;
      if (!email) return jsonError("E-posta adresi belirtilmedi.");
      
      // Test mailini ekli olarak gönder
      var testRecipient = {
        "PERSONEL ADI": "Test Kullanıcısı",
        "PERSONEL MAİL ADRESİ": email,
        "GÖNDERİLECEK MAİLİN EKİ": "ENVANTER RAPORU,FAALİYET ÇİZELGESİ"
      };
      
      try {
        sendReportEmail(testRecipient);
        return jsonSuccess("Test e-postası (ekli) gönderildi.");
      } catch (e) {
        return jsonError("Test maili hatası: " + e.toString());
      }
    }

    // 🟢 ENVANTER AKSİYONU (App.tsx için)
    if (action === "getRawData") {
      var sheetName = params.sheetName;
      var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı.");
      var range = params.range || "A1:AL200";
      var values = sheet.getRange(range).getDisplayValues();
      return ContentService.createTextOutput(JSON.stringify(values)).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getAircraftData") {
      var sheetName = params.sheetName;
      var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı.");
      var mapping = params.mapping;
      var rawData = {};
      
      Object.keys(mapping).forEach(function(key) {
        rawData[key] = sheet.getRange(mapping[key]).getDisplayValues();
      });
      
      var numRows = rawData.kuyrukNo.length;
      var inventoryResults = [];

      var lookupData = null;
      if (params.aircraftType === 'AT-802') {
        try {
          lookupData = {
            keys: sheet.getRange("T24:T35").getDisplayValues(),
            vals: sheet.getRange("U24:V35").getDisplayValues()
          };
        } catch (e) {}
      }

      for (var i = 0; i < numRows; i++) {
        var item = {};
        Object.keys(rawData).forEach(function(key) {
          var rowVals = rawData[key][i];
          item[key] = rowVals.length === 1 ? rowVals[0] : rowVals;
        });
        
        if (item.kuyrukNo && String(item.kuyrukNo).trim() !== "") {
          if (params.fetchTechnicalDetails || params.aircraftType === 'AT-802') {
            var kNo = String(item.kuyrukNo).trim();
            var match = kNo.match(/OR-\d+/i);
            if (match) {
              kNo = match[0].toUpperCase();
            }
            var techSheetName = kNo + " Genel";
            var techSheet = ss.getSheetByName(techSheetName);
            if (techSheet) {
              try {
                item.govdeSN = techSheet.getRange("H10").getDisplayValue();
                item.motor1SN = techSheet.getRange("H14").getDisplayValue();
                item.uretimYili = techSheet.getRange("F7:H7").getDisplayValue();
                
                var frdsCell = "M10";
                var motorCell = "J16";
                if (kNo === "OR-2023") { frdsCell = "L9"; motorCell = "J15:P15"; }
                else if (kNo === "OR-2024") { frdsCell = "M7"; motorCell = "K13:Q13"; }
                else if (kNo === "OR-2025") { frdsCell = "L8"; motorCell = "J14:P14"; }
                else if (kNo === "OR-2026") { frdsCell = "L8"; motorCell = "J14:P14"; }
                else if (kNo === "OR-2027") { frdsCell = "N12"; motorCell = "K19:Q19"; }
                else if (kNo === "OR-2028") { frdsCell = "M8"; motorCell = "J14:P14"; }
                else if (kNo === "OR-2037") { frdsCell = "M12"; motorCell = "J18:P18"; }
                
                item.frdsTestDate = getFirstNonEmpty(techSheet, frdsCell);
                item.motorRunDate = getFirstNonEmpty(techSheet, motorCell);
              } catch (e) {
                item.techError = e.toString();
              }
            }

            if (lookupData) {
              var searchKNo = kNo.toUpperCase();
              for (var k = 0; k < lookupData.keys.length; k++) {
                var keyStr = String(lookupData.keys[k][0]).toUpperCase();
                if (keyStr.indexOf(searchKNo) === 0) {
                  item.gelisTarihi = lookupData.vals[k][0] || lookupData.vals[k][1];
                  break;
                }
              }
            }
          }
          inventoryResults.push(item);
        }
      }
      return jsonSuccess(inventoryResults);
    }

    if (action === "getAircraftSpecificData") {
      var kNo = String(params.kuyrukNo).trim();
      var match = kNo.match(/OR-\d+/i);
      if (match) {
        kNo = match[0].toUpperCase();
      }
      var techSheetName = kNo + " Genel";
      var techSheet = ss.getSheetByName(techSheetName);
      if (!techSheet) return jsonError("Teknik sayfa bulunamadı: " + techSheetName);
      
      var data = {};
      try {
        data.acTT = techSheet.getRange("B11").getDisplayValue();
        data.landings = techSheet.getRange("E11").getDisplayValue();
        data.starts = techSheet.getRange("F15").getDisplayValue();
        data.flights = techSheet.getRange("H15").getDisplayValue();
        
        var frdsCell = "M10";
        var motorCell = "J16";
        
        if (kNo === "OR-2023") { frdsCell = "L9"; motorCell = "J15:P15"; }
        else if (kNo === "OR-2024") { frdsCell = "M7"; motorCell = "K13:Q13"; }
        else if (kNo === "OR-2025") { frdsCell = "L8"; motorCell = "J14:P14"; }
        else if (kNo === "OR-2026") { frdsCell = "L8"; motorCell = "J14:P14"; }
        else if (kNo === "OR-2027") { frdsCell = "N12"; motorCell = "K19:Q19"; }
        else if (kNo === "OR-2028") { frdsCell = "M8"; motorCell = "J14:P14"; }
        else if (kNo === "OR-2037") { frdsCell = "M12"; motorCell = "J18:P18"; }
        
        data.frdsTest = getFirstNonEmpty(techSheet, frdsCell);
        data.motorCalisma = getFirstNonEmpty(techSheet, motorCell);
      } catch (e) {
        return jsonError("Veri okuma hatası: " + e.toString());
      }
      return jsonSuccess(data);
    }

    // 🟡 EXCEL YÜKLEME AKSİYONU
    if (action === "replaceEntireSpreadsheet") {
      var fileData = params.fileData; // base64 string
      if (!fileData) return jsonError("Dosya verisi eksik.");
      
      try {
        var decodedData = Utilities.base64Decode(fileData.split(',')[1] || fileData);
        var blob = Utilities.newBlob(decodedData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'temp.xlsx');
        
        // Google Drive API kullanarak dosyayı dönüştür ve mevcut ID'nin üzerine yaz
        var fileId = ss.getId();
        Drive.Files.update({
          title: ss.getName(),
          mimeType: MimeType.GOOGLE_SHEETS
        }, fileId, blob);
        
        return jsonSuccess("Excel başarıyla yüklendi.");
      } catch (e) {
        return jsonError("Excel yükleme hatası: " + e.toString());
      }
    }

    if (action === "updateAircraftData") {
      var sheetName = params.sheetName;
      var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı.");
      
      var kuyrukNo = params.kuyrukNo;
      var updates = params.updates;
      var mapping = params.mapping;
      
      if (updates.acTT !== undefined || updates.landings !== undefined) {
        var kNo = String(kuyrukNo).trim();
        var match = kNo.match(/OR-\d+/i);
        if (match) {
          kNo = match[0].toUpperCase();
        }
        var techSheetName = kNo + " Genel";
        var techSheet = ss.getSheetByName(techSheetName);
        if (techSheet) {
          if (updates.acTT !== undefined) techSheet.getRange("B11").setValue(updates.acTT);
          if (updates.landings !== undefined) techSheet.getRange("E11").setValue(updates.landings);
          if (updates.starts !== undefined) techSheet.getRange("F15").setValue(updates.starts);
          if (updates.flights !== undefined) techSheet.getRange("H15").setValue(updates.flights);
          
          var frdsCell = "M10";
          var motorCell = "J16";
          
          if (kNo === "OR-2023") { frdsCell = "L9"; motorCell = "J15"; }
          else if (kNo === "OR-2024") { frdsCell = "M7"; motorCell = "K13"; }
          else if (kNo === "OR-2025") { frdsCell = "L8"; motorCell = "J14"; }
          else if (kNo === "OR-2026") { frdsCell = "L8"; motorCell = "J14"; }
          else if (kNo === "OR-2027") { frdsCell = "N12"; motorCell = "K19"; }
          else if (kNo === "OR-2028") { frdsCell = "M8"; motorCell = "J14"; }
          else if (kNo === "OR-2037") { frdsCell = "M12"; motorCell = "J18"; }

          if (updates.frdsTest !== undefined) techSheet.getRange(frdsCell.split(':')[0]).setValue(updates.frdsTest);
          if (updates.motorCalisma !== undefined) {
            techSheet.getRange(motorCell.split(':')[0]).setValue(updates.motorCalisma);
          }
        }
      }
      
      var kuyrukNoRangeStr = mapping.kuyrukNo || "A3:A30";
      var range = sheet.getRange(kuyrukNoRangeStr);
      var values = range.getValues();
      var rowIndex = -1;
      
      var startRow = parseInt(kuyrukNoRangeStr.match(/\d+/)[0]) || 3;
      
      for (var i = 0; i < values.length; i++) {
        if (values[i][0] == kuyrukNo) {
          rowIndex = i + startRow;
          break;
        }
      }
      
      if (rowIndex === -1) {
        if (updates.acTT !== undefined) return jsonSuccess("Sadece teknik veriler güncellendi.");
        return jsonError("Kuyruk numarası bulunamadı.");
      }
      
      Object.keys(updates).forEach(function(key) {
        if (mapping[key] && updates[key] !== undefined) {
          var colLetter = mapping[key].split(':')[0].replace(/[0-9]/g, '');
          var cellAddress = colLetter + rowIndex;
          sheet.getRange(cellAddress).setValue(updates[key]);
        }
      });
      
      return jsonSuccess("Veriler güncellendi.");
    }
    
    return jsonError("Bilinmeyen işlem: " + action);
  } catch (err) {
    return jsonError(err.toString());
  }
}

function jsonError(msg) { return ContentService.createTextOutput(JSON.stringify({status: 'error', success: false, error: msg})).setMimeType(ContentService.MimeType.JSON); }
function jsonSuccess(data) { return ContentService.createTextOutput(JSON.stringify({status: 'success', success: true, data: data})).setMimeType(ContentService.MimeType.JSON); }

function getFirstNonEmpty(sheet, rangeStr) {
  try {
    if (!rangeStr.includes(':')) {
      var val = sheet.getRange(rangeStr).getValue();
      if (val instanceof Date) {
        return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      var displayVal = sheet.getRange(rangeStr).getDisplayValue();
      return displayVal ? displayVal.toString().trim() : "";
    }
    
    var values = sheet.getRange(rangeStr).getValues();
    var displayValues = sheet.getRange(rangeStr).getDisplayValues();
    for (var r = 0; r < values.length; r++) {
      for (var c = 0; c < values[r].length; c++) {
        if (values[r][c] !== "" && values[r][c] !== null && values[r][c] !== undefined) {
          if (values[r][c] instanceof Date) {
            return Utilities.formatDate(values[r][c], Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          if (displayValues[r][c] && displayValues[r][c].toString().trim() !== "") {
            return displayValues[r][c].toString().trim();
          }
        }
      }
    }
  } catch(e) {}
  return "";
}

function findSheet(ss, name) {
  var sheets = ss.getSheets();
  var target = name.toUpperCase().replace(/[\s\.]/g, "");
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().toUpperCase().replace(/[\s\.]/g, "");
    if (sName === target) return sheets[i];
  }
  return null;
}

function sendDailyReports() {
  var logSsId = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg"; // Merkezi Log Tablosu ID
  var ss = SpreadsheetApp.openById(logSsId);
  var mailSheet = findSheet(ss, "mail log");
  if (!mailSheet) {
    console.error("Mail log sayfası bulunamadı.");
    return;
  }
  
  var lastCol = mailSheet.getLastColumn();
  var headers = mailSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var lastSentIdx = -1;
  for(var h=0; h<headers.length; h++) {
    if(headers[h].toString().toUpperCase().includes("SON GÖNDERİM")) {
      lastSentIdx = h;
      break;
    }
  }
  
  if (lastSentIdx === -1) {
    mailSheet.getRange(1, lastCol + 1).setValue("SON GÖNDERİM").setFontWeight("bold");
    headers.push("SON GÖNDERİM");
    lastSentIdx = headers.length - 1;
  }
  
  var data = mailSheet.getDataRange().getDisplayValues();
  var now = new Date();
  var timeZone = "GMT+3"; 
  var daysTR = ["PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ"];
  
  var todayStr = Utilities.formatDate(now, timeZone, "yyyy-MM-dd");
  var currentTime = Utilities.formatDate(now, timeZone, "HH:mm");
  
  // GMT+3'e göre gün hesaplama
  var dateParts = todayStr.split("-");
  var d = new Date(dateParts[0], dateParts[1]-1, dateParts[2]);
  var currentDay = daysTR[d.getDay()];
  
  console.log("--- OTO MAİL KONTROLÜ ---");
  console.log("Sistem Saati: " + currentTime + ", Gün: " + currentDay);

  for (var i = 1; i < data.length; i++) {
    var recipient = {};
    for (var j = 0; j < headers.length; j++) {
      recipient[headers[j]] = data[i][j];
    }
    
    var type = "";
    var days = "";
    var time = "";
    var lastSent = "";
    var personName = recipient["PERSONEL ADI"] || "Bilinmeyen";
    
    for (var key in recipient) {
      var k = key.toUpperCase();
      if (k.includes("TÜR")) type = recipient[key];
      if (k.includes("GÜN")) days = (recipient[key] || "").toUpperCase();
      if (k.includes("SAAT")) time = recipient[key];
      if (k.includes("SON GÖNDERİM")) lastSent = recipient[key];
    }
    
    if (type === "OTOMATİK") {
      var shouldSend = false;
      if (days.includes("HER GÜN")) shouldSend = true;
      else if (days.includes(currentDay)) shouldSend = true;
      
      if (shouldSend && time) {
        try {
          var tMin = timeToMinutes(time);
          var cMin = timeToMinutes(currentTime);
          var diff = Math.abs(cMin - tMin);
          
          if (diff <= 15) {
            if (lastSent !== todayStr) {
              console.log("GÖNDERİLİYOR: " + personName + " (Hedef: " + time + ", Fark: " + diff + " dk)");
              sendReportEmail(recipient);
              mailSheet.getRange(i + 1, lastSentIdx + 1).setValue(todayStr);
            } else {
              console.log("ATLANDI (Bugün zaten gitti): " + personName);
            }
          } else {
            // Sadece çok uzak değilse logla ki kalabalık yapmasın
            if (diff < 120) {
              console.log("BEKLEMEDE: " + personName + " (Hedef: " + time + ", Şu an: " + currentTime + ", Fark: " + diff + " dk)");
            }
          }
        } catch(e) {
          console.error("Hata (Satır " + (i+1) + "): " + e.toString());
        }
      } else {
        console.log("EKSİK VERİ: " + personName + " (Gün: " + days + ", Saat: " + time + ")");
      }
    }
  }
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  var s = String(timeStr).trim();
  if (!s.includes(':')) return 0;
  var parts = s.split(':');
  var h = parseInt(parts[0]) || 0;
  var m = parseInt(parts[1]) || 0;
  return h * 60 + m;
}

function debugAutoMail() {
  var now = new Date();
  var timeZone = "GMT+3";
  var daysTR = ["PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ"];
  var currentDay = daysTR[now.getDay()];
  var currentTime = Utilities.formatDate(now, timeZone, "HH:mm");
  
  var log = "--- OTO MAİL DEBUG ---\n";
  log += "Şu anki Zaman (GMT+3): " + currentTime + "\n";
  log += "Şu anki Gün: " + currentDay + "\n";
  log += "Script Zaman Dilimi: " + Session.getScriptTimeZone() + "\n";
  
  return log;
}

function setupAutoMailTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendDailyReports") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("sendDailyReports")
    .timeBased()
    .everyMinutes(15)
    .create();
  return "Otomatik mail tetikleyicisi kuruldu (15 dk bir kontrol edilecek).";
}

function sendReportEmail(recipient, customAttachments) {
  var attachments = [];
  var logSsId = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg"; // Merkezi Log Tablosu ID
  
  // Custom attachments from client (e.g. generated HTML-Excel)
  var skipEnvanter = false;
  if (customAttachments && customAttachments.length > 0) {
    customAttachments.forEach(function(att) {
      attachments.push(Utilities.newBlob(Utilities.base64Decode(att.data), att.mimeType, att.name));
      if (att.name.includes("ENVANTER RAPORU")) skipEnvanter = true;
    });
  }
  
  // Header isimleri değişmiş olabilir, esnek kontrol yapalım
  var selectedReports = "";
  for (var key in recipient) {
    if (key.toUpperCase().includes("EK") || key.toUpperCase().includes("ATTACHMENT") || key.toUpperCase().includes("RAPOR")) {
      selectedReports = recipient[key] || "";
      break;
    }
  }
  
  var targetEmail = "";
  for (var key in recipient) {
    if (key.toUpperCase().includes("MAİL") || key.toUpperCase().includes("EMAIL")) {
      targetEmail = recipient[key];
      break;
    }
  }

  var targetName = "";
  for (var key in recipient) {
    if (key.toUpperCase().includes("AD") || key.toUpperCase().includes("NAME")) {
      targetName = recipient[key];
      break;
    }
  }

  if (!targetEmail) {
    console.error("Target email not found in recipient object");
    return;
  }

  console.log("Sending email to: " + targetEmail + " with reports: " + selectedReports);

  if (!skipEnvanter && (selectedReports.includes("ENVANTER RAPORU") || selectedReports.includes("ENVANTER HAVA ARACI DURUM RAPORU"))) {
    try {
      var blob = generateEnvanterExcelBlob();
      if (blob) attachments.push(blob);
    } catch (e) {
      console.error("Error attaching Envanter Raporu: " + e.toString());
    }
  }
  
  if (selectedReports.includes("FAALİYET ÇİZELGESİ")) {
    try {
      var blob = getSheetAsExcel(logSsId, "Faaliyet_Cizelgesi.xlsx");
      if (blob) attachments.push(blob);
    } catch (e) {
      console.error("Error attaching Faaliyet Cizelgesi: " + e.toString());
    }
  }

  if (selectedReports.includes("HAVA ARACI EXCELİ (ONLİNE)")) {
    var platformIds = {
      "Bell-429": "1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ",
      "AT-802": "1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4",
      "T-70": "10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw",
      "B-360": "1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0",
      "C-650": "1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE"
    };
    
    for (var platform in platformIds) {
      try {
        var blob = getSheetAsExcel(platformIds[platform], platform + "_Online_Excel.xlsx");
        if (blob) {
          attachments.push(blob);
        }
      } catch (e) {
        console.error("Error attaching " + platform + ": " + e.toString());
      }
    }
  }
  
  if (attachments.length === 0 && selectedReports.trim() !== "") {
    console.warn("No attachments were successfully generated despite being selected.");
  }

  var body = "Sayın " + recipient["PERSONEL ADI"] + ",\n\n" +
             "Günlük hava aracı durum raporları ekte sunulmuştur.\n\n" +
             "İyi çalışmalar.";
             
  MailApp.sendEmail({
    to: targetEmail,
    subject: "OGM Hava Aracı Durum Raporu - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy"),
    body: body,
    attachments: attachments
  });
}

function getSheetAsExcel(ssId, name) {
  try {
    var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export?format=xlsx";
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      console.error("Failed to fetch Excel for ID " + ssId + ". Status: " + response.getResponseCode());
      return null;
    }
    
    return response.getBlob().setName(name);
  } catch (e) {
    console.error("Exception in getSheetAsExcel for ID " + ssId + ": " + e.toString());
    return null;
  }
}

function getCallSignByTail(tail) {
  var mapping = {
    'OR-0177': 'ORMAN-01', 'OR-1839': 'ORMAN-02', 'OR-3125': 'ORMAN-03',
    'OR-3126': 'ORMAN-04', 'OR-3127': 'ORMAN-05', 'OR-3131': 'ORMAN-06',
    'OR-3133': 'ORMAN-07', 'OR-3192': 'ORMAN-08', 'OR-2021': 'ORMAN-21',
    'OR-2022': 'ORMAN-22', 'OR-2023': 'ORMAN-23', 'OR-2024': 'ORMAN-24',
    'OR-2025': 'ORMAN-25', 'OR-2026': 'ORMAN-26', 'OR-2027': 'ORMAN-27',
    'OR-2028': 'ORMAN-28', 'OR-2029': 'ORMAN-29', 'OR-2030': 'ORMAN-30',
    'OR-2031': 'ORMAN-31', 'OR-2036': 'ORMAN-36', 'OR-2037': 'ORMAN-37',
    'OR-2038': 'ORMAN-38', 'OR-1018': 'ORMAN-18', 'OR-1019': 'ORMAN-19',
    'OR-1020': 'ORMAN-20'
  };
  return mapping[tail] || "ORMAN-" + (tail.split('-')[1] || 'XX');
}

function analyzeStatusGS(item) {
  if (!item) return 'F';
  
  var toLowerTR = function(s) {
    return String(s || '').replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().trim();
  };
  
  var detail = toLowerTR(item.durumAyrintisi);
  var desc = toLowerTR(item.aciklama);
  var durumStr = String(item.durum || '').replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase().trim();
  var fullText = detail + " " + desc + " " + toLowerTR(item.durum);

  // KABUL MUAYENESİ -> KM
  if (fullText.indexOf('kabul muayenelerı') !== -1 || fullText.indexOf('kabul muayeneleri') !== -1 || fullText.indexOf('kabul mua') !== -1) {
    return 'KM';
  }

  // KAZA KIRIM -> KK
  if (fullText.indexOf('kaza') !== -1 || fullText.indexOf('kırım') !== -1 || fullText.indexOf('kirim') !== -1 || fullText.indexOf('hasar') !== -1) 
    return 'KK';

  // PARÇA BEKLER -> PB (Öncelikli)
  if (fullText.indexOf('parça') !== -1 && (fullText.indexOf('bekle') !== -1 || fullText.indexOf('sipariş') !== -1 || fullText.indexOf('siparis') !== -1)) {
    return 'PB';
  }

  // TECRÜBE BEKLER -> TB
  if (fullText.indexOf('tecrübe') !== -1 || fullText.indexOf('tecrube') !== -1 || fullText.indexOf('test') !== -1) {
    if (detail.indexOf('test uçuşu') !== -1 || detail.indexOf('test/tecrübe') !== -1 || detail.indexOf('test/tecrube') !== -1) {
      return 'TB';
    }
  }

  // BAKIM BEKLER -> BB
  if (fullText.indexOf('bakım') !== -1 || fullText.indexOf('bakim') !== -1 || fullText.indexOf('yıllık') !== -1 || fullText.indexOf('yillik') !== -1 || fullText.indexOf('periyodik') !== -1 || /\b\d+h\b/.test(fullText)) {
    if (fullText.indexOf('bekliyor') !== -1 || fullText.indexOf('bekler') !== -1 || fullText.indexOf('sıra') !== -1 || fullText.indexOf('sira') !== -1) {
      return 'BB';
    }
  }

  // ARIZA -> A
  if (fullText.indexOf('arıza') !== -1 || fullText.indexOf('ariza') !== -1 || fullText.indexOf('problem') !== -1) {
    return 'A';
  }

  // BAKIM -> B
  if (fullText.indexOf('bakım') !== -1 || fullText.indexOf('bakim') !== -1 || fullText.indexOf('yıllık') !== -1 || fullText.indexOf('yillik') !== -1 || fullText.indexOf('periyodik') !== -1 || /\b\d+h\b/.test(fullText)) {
    return 'B';
  }

  // GAYRİ FAAL -> X
  var isGayriFaalExplicit = durumStr.indexOf('GAYRİ') !== -1 || durumStr.indexOf('GAYRI') !== -1 || durumStr.indexOf('G.FAAL') !== -1;
  if (isGayriFaalExplicit) return 'X';

  return 'F';
}

function formatToHHMM(val) {
  if (val === null || val === undefined || val === "") return "00:00";
  var hours = 0;
  if (typeof val === 'number') {
    hours = val;
  } else {
    var s = String(val).trim().replace(',', '.');
    if (s.includes(':')) {
      var parts = s.split(':').map(Number);
      hours = (parts[0] || 0) + (parts[1] || 0) / 60;
    } else {
      hours = parseFloat(s) || 0;
    }
  }
  var h = Math.floor(hours);
  var m = Math.round((hours - h) * 60);
  if (m === 60) { h++; m = 0; }
  return h + ":" + m.toString().padStart(2, '0');
}

function parseSingleCellToHour(val, aircraftType) {
  if (val === undefined || val === null || val === "" || val === "0" || val === "00:00") return null;
  if (typeof val === 'number') {
    if (val <= 0) return null;
    if (aircraftType === 'AT-802' && val < 100) return val * 24;
    return val;
  }
  if (typeof val === 'string') {
    var s = val.trim().replace(',', '.');
    if (s.includes(':')) {
      var parts = s.split(':').map(Number);
      return (parts[0] || 0) + (parts[1] || 0) / 60;
    }
    var n = parseFloat(s);
    if (!isNaN(n)) {
      if (aircraftType === 'Bell-429' && s.includes('.')) {
        var parts = s.split('.');
        return (parseInt(parts[0]) || 0) + (parseInt(parts[1]) || 0) / 60;
      }
      return n;
    }
  }
  return null;
}

function getFleetDataFromServer() {
  var configs = [
    { type: 'Bell-429', id: '1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ', mapping: { kuyrukNo: 'A3:A8', konum: 'L3:L8', durum: 'M3:M8', durumAyrintisi: 'N3:N8', faydaliSaat: 'I3:I8', aciklama: 'O3:O8' } },
    { type: 'AT-802', id: '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4', mapping: { kuyrukNo: 'B3:B16', durum: 'C3:C16', durumAyrintisi: 'D3:D16', konum: 'E3:E16', faydaliSaat: 'V3:AI16', aciklama: 'AL3:AL16' } },
    { type: 'T-70', id: '10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw', mapping: { kuyrukNo: 'A4:A6', faydaliSaat: 'N4:N6', konum: 'P4:P6', durum: 'Q4:Q6', durumAyrintisi: 'R4:R6', aciklama: 'S4:S6' } },
    { type: 'B-360', id: '1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0', mapping: { kuyrukNo: 'A3:A10', faydaliSaat: 'I3:I10', konum: 'M3:M10', durum: 'N3:N10', durumAyrintisi: 'O3:O10', aciklama: 'P3:P10' } },
    { type: 'C-650', id: '1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE', mapping: { kuyrukNo: 'A3:A10', faydaliSaat: 'I3:I10', konum: 'M3:M10', durum: 'N3:N10', durumAyrintisi: 'O3:O10', aciklama: 'P3:P10' } }
  ];

  var fleet = [];
  configs.forEach(function(config) {
    try {
      var ss = SpreadsheetApp.openById(config.id);
      var sheet = ss.getSheets()[0];
      if (config.type === 'AT-802') {
        sheet = ss.getSheetByName('GÜNLÜK DURUM') || sheet;
      }
      
      var data = {};
      for (var key in config.mapping) {
        data[key] = sheet.getRange(config.mapping[key]).getDisplayValues();
      }
      
      var numRows = data.kuyrukNo.length;
      for (var i = 0; i < numRows; i++) {
        var kNo = data.kuyrukNo[i][0];
        if (kNo && kNo.trim() !== "") {
          var item = { tip: config.type };
          for (var key in data) {
            if (key === 'faydaliSaat' && Array.isArray(data[key][i]) && data[key][i].length > 1) {
               // AT-802 range handling
               var validHours = data[key][i].map(function(cell) { return parseSingleCellToHour(cell, config.type); }).filter(function(h) { return h !== null; });
               item[key] = validHours.length > 0 ? Math.min.apply(null, validHours) : 0;
            } else {
               var val = data[key][i];
               item[key] = val.length === 1 ? val[0] : val;
            }
          }
          item.cagriKodu = getCallSignByTail(item.kuyrukNo);
          fleet.push(item);
        }
      }
    } catch (e) {
      console.error("Error fetching " + config.type + ": " + e.toString());
    }
  });
  return fleet;
}

function generateEnvanterExcelBlob() {
  var fleet = getFleetDataFromServer();
  var typeOrder = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
  
  fleet.sort(function(a, b) {
    var indexA = typeOrder.indexOf(a.tip);
    var indexB = typeOrder.indexOf(b.tip);
    if (indexA !== indexB) return indexA - indexB;
    
    var getOrder = function(cagri) {
      var m = String(cagri).match(/ORMAN-(\d+)/i);
      return m ? parseInt(m[1]) : 999;
    };
    return getOrder(a.cagriKodu) - getOrder(b.cagriKodu);
  });

  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy");
  
  var html = '<html><head><meta charset="utf-8" /><style>' +
    'table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }' +
    'th, td { border: 1px solid black; padding: 5px; text-align: center; vertical-align: middle; font-size: 12px; }' +
    '.title-row { background-color: #f2f2f2; font-weight: bold; font-size: 14px; }' +
    '.header-row th { background-color: #d9d9d9; font-weight: bold; }' +
    '.date-text { color: red; font-weight: bold; text-align: right; }' +
    '</style></head><body><table>' +
    '<tr><td colspan="7" class="date-text" style="border: none; text-align: right; color: red; font-weight: bold;">' + dateStr + '</td></tr>' +
    '<tr><td colspan="7" class="title-row" style="text-align: center; font-weight: bold; background-color: #f2f2f2;">OGM HAVA ARAÇLARI DURUM ÖZETLERİ</td></tr>' +
    '<tr class="header-row">' +
    '<th style="background-color: #d9d9d9;">ÇAĞRI KODU</th>' +
    '<th style="background-color: #d9d9d9;">KUYRUK NUMARASI</th>' +
    '<th style="background-color: #d9d9d9;">DURUM</th>' +
    '<th style="background-color: #d9d9d9;">DURUM AYRINTISI</th>' +
    '<th style="background-color: #d9d9d9;">KONUM</th>' +
    '<th style="background-color: #d9d9d9;">FAYDALI SAAT</th>' +
    '<th style="background-color: #d9d9d9;">AÇIKLAMA</th></tr>';

  fleet.forEach(function(a) {
    var abbr = "";
    var tail = String(a.kuyrukNo).trim().toUpperCase();
    if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) abbr = ' (DA)';
    else if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) abbr = ' (SA)';
    else if (tail === 'OR-2036') abbr = ' (DL)';
    else if (tail === 'OR-2038') abbr = ' (SL)';
    else if (tail === 'OR-1020') abbr = ' (H)';

    var isFaal = String(a.durum).toUpperCase().includes("FAAL") && !String(a.durum).toUpperCase().includes("GAYRİ") && !String(a.durum).toUpperCase().includes("GAYRI");
    var durumColor = isFaal ? "#c6efce" : "#ffc7ce";
    var durumTextColor = isFaal ? "#006100" : "#9c0006";
    var faydali = formatToHHMM(a.faydaliSaat);
    var aciklama = (a.aciklama || "").replace(/\n/g, "<br/>");

    var durumAyrintisi = a.durumAyrintisi || "";
    if (durumAyrintisi && durumAyrintisi !== "-") {
      durumAyrintisi = "(" + durumAyrintisi + ")";
    }

    html += '<tr>' +
      '<td style="background-color: #e6e6e6;">' + (a.cagriKodu || "") + '</td>' +
      '<td style="background-color: #e6e6e6;">' + (a.kuyrukNo || "") + '<span style="color: red; font-weight: bold;">' + abbr + '</span></td>' +
      '<td style="background-color: ' + durumColor + '; color: ' + durumTextColor + '; font-weight: bold;">' + (a.durum || "") + '</td>' +
      '<td>' + durumAyrintisi + '</td>' +
      '<td>' + (a.konum || "") + '</td>' +
      '<td style="mso-number-format:\'@\'; font-weight: bold; color: #0000ff;">' + faydali + '</td>' +
      '<td style="text-align: left; vertical-align: top; font-style: italic; font-size: 10px;">' + aciklama + '</td></tr>';
  });

  html += '<tr><td colspan="7" style="border: none;">&nbsp;</td></tr>' +
    '<tr><td colspan="7" style="border: none; text-align: left; font-weight: bold;">KISALTMALAR:</td></tr>' +
    '<tr><td colspan="7" style="border: none; text-align: left;">(DA): DUAL AMFİBİ</td></tr>' +
    '<tr><td colspan="7" style="border: none; text-align: left;">(SA): SINGLE AMFİBİ</td></tr>' +
    '<tr><td colspan="7" style="border: none; text-align: left;">(DL): DUAL LAND</td></tr>' +
    '<tr><td colspan="7" style="border: none; text-align: left;">(SL): SINGLE LAND</td></tr>' +
    '<tr><td colspan="7" style="border: none; text-align: left;">(H): HELİTAK</td></tr>' +
    '</table></body></html>';

  return Utilities.newBlob(html, 'application/vnd.ms-excel', 'ENVANTER RAPORU.xls');
}

function doGet() { return ContentService.createTextOutput("OGM Servis Aktif."); }
