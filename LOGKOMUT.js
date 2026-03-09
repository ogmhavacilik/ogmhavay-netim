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
      if (!mailSheet) {
        mailSheet = ss.insertSheet("mail log");
        mailSheet.appendRow(["ID", "PERSONEL ADI", "PERSONEL MAİL ADRESİ", "MAİL GÖNDERME TÜRÜ", "SAAT", "GÜN SEÇENEĞİ", "GÖNDERİLECEK MAİLİN EKİ"]);
        mailSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d9ead3").setBorder(true, true, true, true, true, true);
      }
      
      var id = params.id || Utilities.getUuid();
      var name = params.name || "";
      var email = params.email || "";
      var type = params.type || "MANUEL";
      var time = params.time || "";
      var days = params.days || "";
      var attachments = params.attachments || "";
      
      mailSheet.appendRow([id, name, email, type, time, days, attachments]);
      return jsonSuccess({ id: id });
    }

    // 🔵 AKSİYON: FAALİYET LOGU ÇEKME
    if (action === "getFaaliyetLog") {
      var faalLogSheet = findSheet(ss, "Faaliyet Log");
      if (!faalLogSheet) return jsonSuccess([]);
      
      var data = faalLogSheet.getDataRange().getValues();
      var results = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var tarihVal = row[1];
        var tarihStr = "";
        if (tarihVal instanceof Date) {
          tarihStr = Utilities.formatDate(tarihVal, Session.getScriptTimeZone(), "dd.MM.yyyy");
        } else {
          tarihStr = String(tarihVal).trim();
        }

        results.push({
          id: row[0],
          tarih: tarihStr,
          kuyrukNo: row[2],
          tip: row[3],
          durum: row[4],
          analizKodu: row[5] || ''
        });
      }
      return jsonSuccess(results);
    }

    // 🔵 AKSİYON: SİSTEM LOGLARI (ENVANTER VE FAALİYET)
    if (action === "saveSystemLogs" || action === "saveLogs") {
      var fleetData = params.fleetData;
      if (!fleetData || fleetData.length === 0) return jsonError("Log verisi boş.");

      var envLogSheet = findSheet(ss, "Envanter Log");
      if (!envLogSheet) {
        envLogSheet = ss.insertSheet("Envanter Log");
        envLogSheet.appendRow(["ID", "Tarih", "Kuyruk No", "Tip", "Gövde Uçuş Saati", "Faydalı Saat", "Konum", "Durum", "Durum Ayrıntısı", "Açıklama"]);
        envLogSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#cfe2f3").setBorder(true, true, true, true, true, true);
      }

      var faalLogSheet = findSheet(ss, "Faaliyet Log");
      if (!faalLogSheet) {
        faalLogSheet = ss.insertSheet("Faaliyet Log");
        faalLogSheet.appendRow(["ID", "Tarih", "Kuyruk No", "Tip", "Günlük Durum (Faal/Gayrı Faal vb.)", "Analiz Kodu"]);
        faalLogSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#fff2cc").setBorder(true, true, true, true, true, true);
      }

      var bugun = new Date();
      var tarihStr = Utilities.formatDate(bugun, Session.getScriptTimeZone(), "dd.MM.yyyy");
      
      fleetData.forEach(function(aircraft) {
        var kNo = String(aircraft.kuyrukNo || "").trim();
        if (!kNo) return;

        var envKey = tarihStr + "_" + kNo;
        envLogSheet.appendRow([
          envKey, tarihStr, kNo, aircraft.tip || "", aircraft.govdeUcusSaati || "", 
          aircraft.faydaliSaat || "", aircraft.konum || "", aircraft.durum || "", 
          aircraft.durumAyrintisi || "", aircraft.aciklama || ""
        ]);

        faalLogSheet.appendRow([
          envKey, tarihStr, kNo, aircraft.tip || "", aircraft.durumAyrintisi || "", aircraft.assignedCode || "F"
        ]);
      });

      return jsonSuccess("Loglar kaydedildi.");
    }

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
      var recipientId = params.id;
      var mailSheet = findSheet(ss, "mail log");
      if (!mailSheet) return jsonError("Alıcı listesi bulunamadı.");
      
      var data = mailSheet.getDataRange().getDisplayValues();
      var headers = data[0];
      var recipient = null;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == recipientId) {
          recipient = {};
          for (var j = 0; j < headers.length; j++) {
            recipient[headers[j]] = data[i][j];
          }
          break;
        }
      }
      
      if (!recipient) return jsonError("Alıcı bulunamadı.");
      
      sendReportEmail(recipient);
      return jsonSuccess("E-posta gönderildi.");
    }

    if (action === "testMail") {
      var email = params.email;
      if (!email) return jsonError("E-posta adresi belirtilmedi.");
      
      MailApp.sendEmail({
        to: email,
        subject: "OGM Otomail Test Mesajı",
        body: "Bu bir test mesajıdır. Otomail sistemi aktif durumdadır.\n\nTarih: " + new Date().toLocaleString()
      });
      return jsonSuccess("Test e-postası gönderildi.");
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
  var target = name.toUpperCase().replace(/\./g, "");
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().toUpperCase().replace(/\./g, "");
    if (sName === target) return sheets[i];
  }
  return null;
}

function sendDailyReports() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mailSheet = findSheet(ss, "mail log");
  if (!mailSheet) return;
  
  var data = mailSheet.getDataRange().getDisplayValues();
  var headers = data[0];
  var now = new Date();
  var currentDay = ["PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ"][now.getDay()];
  var currentTime = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm");
  
  for (var i = 1; i < data.length; i++) {
    var recipient = {};
    for (var j = 0; j < headers.length; j++) {
      recipient[headers[j]] = data[i][j];
    }
    
    if (recipient["MAİL GÖNDERME TÜRÜ"] === "OTOMATİK") {
      var days = recipient["GÜN SEÇENEĞİ"].toUpperCase();
      var time = recipient["SAAT"];
      
      var shouldSend = false;
      if (days.includes("HER GÜN")) shouldSend = true;
      else if (days.includes(currentDay)) shouldSend = true;
      
      if (shouldSend && time) {
        var diff = Math.abs(timeToMinutes(currentTime) - timeToMinutes(time));
        if (diff <= 15) {
          sendReportEmail(recipient);
        }
      }
    }
  }
}

function timeToMinutes(timeStr) {
  var parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function sendReportEmail(recipient) {
  var attachments = [];
  var logSsId = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg"; // Merkezi Log Tablosu ID
  var selectedReports = recipient["GÖNDERİLECEK MAİLİN EKİ"] || "";
  
  if (selectedReports.includes("ENVANTER HAVA ARACI DURUM RAPORU")) {
    attachments.push(getSheetAsExcel(logSsId, "Envanter_Raporu.xlsx"));
  }
  
  if (selectedReports.includes("FAALİYET ÇİZELGESİ")) {
    attachments.push(getSheetAsExcel(logSsId, "Faaliyet_Cizelgesi.xlsx")); 
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
        } else {
          console.error("Could not fetch blob for " + platform);
        }
      } catch (e) {
        console.error("Error attaching " + platform + ": " + e.toString());
      }
    }
  }
  
  var body = "Sayın " + recipient["PERSONEL ADI"] + ",\n\n" +
             "Günlük hava aracı durum raporları ekte sunulmuştur.\n\n" +
             "İyi çalışmalar.";
             
  MailApp.sendEmail({
    to: recipient["PERSONEL MAİL ADRESİ"],
    subject: "OGM Hava Aracı Durum Raporu - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy"),
    body: body,
    attachments: attachments
  });
}

function getSheetAsExcel(ssId, name) {
  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export?format=xlsx";
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    },
    muteHttpExceptions: true
  });
  return response.getBlob().setName(name);
}

function doGet() { return ContentService.createTextOutput("OGM Servis Aktif."); }
