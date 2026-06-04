function getAT802Cells(kNo) {
  var frdsCell = "M10";
  var motorCell = "J16";
  
  if (kNo === "OR-2021" || kNo === "OR-2022") {
    frdsCell = "M11";
    motorCell = "J16";
  } else if (kNo === "OR-2023") {
    frdsCell = "L9";
    motorCell = "J15";
  } else if (kNo === "OR-2024") {
    frdsCell = "M7";
    motorCell = "K13";
  } else if (kNo === "OR-2025" || kNo === "OR-2026") {
    frdsCell = "L8";
    motorCell = "J14";
  } else if (kNo === "OR-2027") {
    frdsCell = "N12";
    motorCell = "K19";
  } else if (kNo === "OR-2028" || kNo === "OR-2029") {
    frdsCell = "M8";
    motorCell = "J14";
  } else if (kNo === "OR-2030" || kNo === "OR-2031") {
    frdsCell = "N11";
    motorCell = "K17:Q17";
  } else if (kNo === "OR-2036") {
    frdsCell = "N11";
    motorCell = "J16";
  } else if (kNo === "OR-2037") {
    frdsCell = "M12";
    motorCell = "J18";
  } else if (kNo === "OR-2038") {
    frdsCell = "M10";
    motorCell = "J16";
  }
  
  return { frds: frdsCell, motor: motorCell };
}

function getTechSheet(allSheets, kNo) {
  var searchKNo = kNo.toUpperCase().replace(/[\s\.-]/g, "");
  for (var s = 0; s < allSheets.length; s++) {
    var sName = allSheets[s].getName().toUpperCase().replace(/[\s\.-]/g, "");
    if (sName.indexOf(searchKNo) !== -1 && (sName.indexOf("GENEL") !== -1 || sName.indexOf("TEKNIK") !== -1)) {
      return allSheets[s];
    }
  }
  for (var s = 0; s < allSheets.length; s++) {
    var sName = allSheets[s].getName().toUpperCase().replace(/[\s\.-]/g, "");
    if (sName === searchKNo) {
      return allSheets[s];
    }
  }
  return null;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents)
      return jsonError("Post verisi alınamadı.");
    var params = JSON.parse(e.postData.contents);

    // Debug logging
    Logger.log("Action: " + params.action);
    if (params.kuyrukNo) Logger.log("Kuyruk No: " + params.kuyrukNo);

    var ss = SpreadsheetApp.openById(params.sheetId);
    var action = (params.action || "getAircraftData").toString().trim();

    // 🟡 PDF EXPORT AKSİYONU (AT-802 ÇIKTI - 100 SAAT TAKİP)
    if (action === "exportAT802CiktiPDF") {
      try {
        var sheet = findSheet(ss, "ÇIKTI");
        if (!sheet) return jsonError("ÇIKTI sayfası bulunamadı.");
        
        var gid = sheet.getSheetId();
        // A1:AM18 range - Landscape, Fit to Page, Centered
        var url = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=pdf&gid=" + gid + "&range=A1:AM18&portrait=false&scale=4&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&gridlines=false&horizontal_alignment=CENTER&vertical_alignment=CENTER";
        
        var token = ScriptApp.getOAuthToken();
        var response = UrlFetchApp.fetch(url, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        var blob = response.getBlob();
        var base64 = Utilities.base64Encode(blob.getBytes());
        return jsonSuccess({
          filename: "AT802_100_Saat_Takip_" + Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd") + ".pdf",
          base64: base64
        });
      } catch (e) {
        return jsonError("PDF oluşturma hatası: " + e.toString());
      }
    }

    // 🟡 PDF EXPORT AKSİYONU (GÜNLÜK DURUM RAPORU)
    if (action === "exportAT802PDF") {
      try {
        var sheet = findSheet(ss, "GÜNLÜK DURUM");
        if (!sheet) return jsonError("GÜNLÜK DURUM sayfası bulunamadı.");
        
        var gid = sheet.getSheetId();
        var url = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=pdf&gid=" + gid + "&range=A1:AL18&portrait=false&scale=4&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&gridlines=false";
        
        var token = ScriptApp.getOAuthToken();
        var response = UrlFetchApp.fetch(url, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        var blob = response.getBlob();
        var base64 = Utilities.base64Encode(blob.getBytes());
        return jsonSuccess({
          filename: "AT802_Gunluk_Durum_" + Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd") + ".pdf",
          base64: base64
        });
      } catch (e) {
        return jsonError("PDF oluşturma hatası: " + e.toString());
      }
    }

    if (action === "cleanupAllLogs") {
      var logSheet = findSheet(ss, "Envanter Log");
      var faalLogSheet = findSheet(ss, "Faaliyet Log");
      var cleanupResult = "Cleanup completed: ";

      var normalizeDate = function(d) {
        if (!d && d !== 0) return "";
        if (d instanceof Date) return Utilities.formatDate(d, "GMT+3", "dd.MM.yyyy");
        var s = String(d).trim();
        if (!s) return "";
        if (s.includes("-") || s.includes(".") || s.includes("/")) {
          var p = s.split(/[- ./:]/);
          if (p.length >= 3) {
            // YYYY-MM-DD or YYYY.MM.DD
            if (p[0].length === 4) {
              return (p[2].length < 2 ? "0" + p[2] : p[2]) + "." + (p[1].length < 2 ? "0" + p[1] : p[1]) + "." + p[0];
            }
            // DD-MM-YYYY or DD.MM.YYYY
            if (p[2].split(" ")[0].length === 4) {
              return (p[0].length < 2 ? "0" + p[0] : p[0]) + "." + (p[1].length < 2 ? "0" + p[1] : p[1]) + "." + p[2].split(" ")[0];
            }
          }
        }
        return s;
      };

      if (logSheet) {
        var data = logSheet.getDataRange().getValues();
        var seen = {};
        var toDelete = [];
        
        // Pass 1: Identify best row for each key (Day_Tail)
        // Prefer rows that have Govde Ucus Saati or Durum
        for (var i = 1; i < data.length; i++) {
          var date = normalizeDate(data[i][1]);
          var tail = String(data[i][2]).trim().toUpperCase();
          if (!date || !tail) continue;
          
          var key = date + "_" + tail;
          var score = 0;
          var govdeVal = String(data[i][4] || "").trim();
          if (govdeVal !== "" && govdeVal !== "-" && govdeVal !== "0" && govdeVal !== "00:00") score += 10;
          if (data[i][7] && String(data[i][7]).trim() !== "") score += 5;
          if (data[i][8] && String(data[i][8]).trim() !== "") score += 3;
          
          if (!seen[key] || score >= seen[key].score) {
            if (seen[key]) toDelete.push(seen[key].index); // Mark previous worse row for deletion
            seen[key] = { index: i + 1, score: score };
          } else {
            toDelete.push(i + 1);
          }
        }
        
        // Also find truly empty/invalid rows
        for (var i = 1; i < data.length; i++) {
          var date = normalizeDate(data[i][1]);
          var tail = String(data[i][2]).trim().toUpperCase();
          if (!date || !tail) {
            if (toDelete.indexOf(i + 1) === -1) toDelete.push(i + 1);
          }
        }
        
        toDelete.sort(function(a, b) { return b - a; });
        var uniqueToDelete = [];
        for (var i = 0; i < toDelete.length; i++) {
          if (uniqueToDelete.indexOf(toDelete[i]) === -1) uniqueToDelete.push(toDelete[i]);
        }
        uniqueToDelete.forEach(function(row) { logSheet.deleteRow(row); });
        cleanupResult += "Envanter Log: " + uniqueToDelete.length + " duplicates/orphans removed. ";
      }

      if (faalLogSheet) {
        var data = faalLogSheet.getDataRange().getValues();
        var seen = {};
        var toDelete = [];
        for (var i = 1; i < data.length; i++) {
          var date = normalizeDate(data[i][1]);
          var tail = String(data[i][2]).trim().toUpperCase();
          if (!date || !tail) {
             toDelete.push(i + 1);
             continue;
          }
          
          var key = date + "_" + tail;
          // For Faaliyet Log, we prefer rows with Analiz Kodu
          var score = 0;
          if (data[i][4] && String(data[i][4]).trim() !== "") score += 5;
          if (data[i][5] && String(data[i][5]).trim() !== "") score += 10;

          if (!seen[key] || score >= seen[key].score) {
            if (seen[key]) toDelete.push(seen[key].index);
            seen[key] = { index: i + 1, score: score };
          } else {
            toDelete.push(i + 1);
          }
        }
        toDelete.sort(function(a, b) { return b - a; });
        var uniqueToDelete = [];
        for (var i = 0; i < toDelete.length; i++) {
          if (uniqueToDelete.indexOf(toDelete[i]) === -1) uniqueToDelete.push(toDelete[i]);
        }
        uniqueToDelete.forEach(function(row) { faalLogSheet.deleteRow(row); });
        cleanupResult += "Faaliyet Log: " + uniqueToDelete.length + " duplicates/orphans removed.";
      }
      return jsonSuccess(cleanupResult);
    }

    // -----------------------------------------------------
    // 🟡 AKSİYON: ÖPL VERİSİ (ARŞİV) SORGULAMA
    // -----------------------------------------------------
    if (action === "getOPLData") {
      var searchKuyruk = String(params.kuyrukNo || "")
        .trim()
        .toUpperCase();
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
        var rawB = String(row[1] || "")
          .trim()
          .toUpperCase();
        var rawC = String(row[2] || "")
          .trim()
          .toUpperCase();
        var ownerB = rawB;
        var ownerC = rawC;
        var isMerged = false;

        // Merge Kontrolü (B sütunu - Kuyruk No ana kaynağı)
        if (ownerB === "") {
          for (var m = 0; m < colBRanges.length; m++) {
            var mr = colBRanges[m];
            if (rowIndex >= mr.getRow() && rowIndex <= mr.getLastRow()) {
              ownerB = mr.getDisplayValue().trim().toUpperCase();
              isMerged = true;
              break;
            }
          }
        }
        // Merge Kontrolü (C sütunu - Alternatif kaynak)
        if (ownerC === "") {
          for (var m = 0; m < colCRanges.length; m++) {
            var mr = colCRanges[m];
            if (rowIndex >= mr.getRow() && rowIndex <= mr.getLastRow()) {
              ownerC = mr.getDisplayValue().trim().toUpperCase();
              isMerged = true;
              break;
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
            hasContent = true;
            break;
          }
        }

        if (hasContent) {
          var obj = { IS_MERGED_RECORD: isMerged ? "BİRLEŞİK" : "" };
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
      var expectedHeaders = [
        "ID",
        "PERSONEL ADI",
        "PERSONEL MAİL ADRESİ",
        "MAİL GÖNDERME TÜRÜ",
        "SAAT",
        "GÜN SEÇENEĞİ",
        "GÖNDERİLECEK MAİLİN EKİ",
        "SON GÖNDERİM",
      ];

      if (!mailSheet) {
        mailSheet = ss.insertSheet("mail log");
        mailSheet.appendRow(expectedHeaders);
        mailSheet
          .getRange("A1:H1")
          .setFontWeight("bold")
          .setBackground("#d9ead3")
          .setBorder(true, true, true, true, true, true);
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
        rowData[7] = data[foundRow - 1][7];
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
      var intraDaySheet = findSheet(ss, "Saatlik Faaliyet Günlüğü");

      var results = [];
      if (faalLogSheet) {
        var data = faalLogSheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          if (!row[1] && !row[2]) continue;

          var tarihVal = row[1];
          var tarihStr = "";
          if (tarihVal instanceof Date) {
            tarihStr = Utilities.formatDate(
              tarihVal,
              ss.getSpreadsheetTimeZone(),
              "dd.MM.yyyy",
            );
          } else {
            tarihStr = String(tarihVal).trim();
          }

          results.push({
            id: String(row[0]).trim(),
            tarih: tarihStr,
            kuyrukNo: String(row[2] || "").trim(),
            tip: String(row[3] || "").trim(),
            durum: String(row[4] || "").trim(),
            analizKodu: row[5] ? String(row[5]).trim() : "",
          });
        }
      }

      var intraDayResults = [];
      if (intraDaySheet) {
        var intraData = intraDaySheet.getDataRange().getValues();
        for (var j = 1; j < intraData.length; j++) {
          var iRow = intraData[j];
          if (!iRow[1] && !iRow[2]) continue; // Skip if both Tarih and Kuyruk No are empty

          var iTarihVal = iRow[1];
          var iTarihStr = "";
          if (iTarihVal instanceof Date) {
            iTarihStr = Utilities.formatDate(
              iTarihVal,
              ss.getSpreadsheetTimeZone(),
              "yyyy-MM-dd",
            );
          } else {
            iTarihStr = String(iTarihVal).trim();
          }

          intraDayResults.push({
            id: String(iRow[0]).trim(),
            tarih: iTarihStr,
            kuyrukNo: String(iRow[2] || "").trim(),
            tip: String(iRow[3] || "").trim(),
            startTime: String(iRow[4] || "").trim(),
            endTime: String(iRow[5] || "").trim(),
            status: String(iRow[6] || "").trim(),
            description: String(iRow[7] || "").trim(),
          });
        }
      }

      var envanterResults = [];
      var envanterSheet = findSheet(ss, "Envanter Log");
      if (envanterSheet) {
        var envData = envanterSheet.getDataRange().getDisplayValues();
        for (var k = 1; k < envData.length; k++) {
          var eRow = envData[k];
          if (!eRow[1] && !eRow[2]) continue;

          var eTarihStr = String(eRow[1]).trim();
          // If it's in dd.MM.yyyy format, normalize it to yyyy-MM-dd for the frontend if needed, 
          // but GovdeSorgulaModal has its own normalizeDate function that handles dd.MM.yyyy.
          
          envanterResults.push({
            id: String(eRow[0]).trim(),
            tarih: eTarihStr,
            kuyrukNo: String(eRow[2] || "").trim(),
            govdeUcusSaati: eRow[4],
            faydaliSaat: eRow[5],
            konum: String(eRow[6] || "").trim(),
            durum: String(eRow[7] || "").trim(),
            durumAyrintisi: String(eRow[8] || "").trim(),
            aciklama: String(eRow[9] || "").trim(),
          });
        }
      }

      return jsonSuccess({
        faaliyetLog: results,
        intraDayLog: intraDayResults,
        envanterLog: envanterResults,
      });
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

      var bugun = new Date();
      var bugunStr = Utilities.formatDate(
        bugun,
        Session.getScriptTimeZone(),
        "dd.MM.yyyy",
      );
      if (dateStr === bugunStr) {
        faalLogSheet.appendRow([
          id,
          dateStr,
          kuyrukNo,
          params.tip || "",
          "MANUEL GÜNCELLEME",
          newCode,
        ]);
        return jsonSuccess("Yeni log girişi oluşturuldu: " + id);
      }

      return jsonError("Güncellenecek log kaydı bulunamadı: " + id);
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
      var recipientId = String(params.id || "").trim();
      var customAttachments = params.customAttachments || [];
      var mailSheet = findSheet(ss, "mail log");
      if (!mailSheet) return jsonError("Alıcı listesi bulunamadı.");

      var data = mailSheet.getDataRange().getValues();
      var headers = data[0].map(function (h) {
        return String(h).trim();
      });
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

      if (!recipient)
        return jsonError("Alıcı bulunamadı. Aranan ID: " + recipientId);

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
        "GÖNDERİLECEK MAİLİN EKİ": "ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU,FAALİYET ÇİZELGESİ",
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
      return ContentService.createTextOutput(
        JSON.stringify(values),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getAircraftData") {
      var sheetName = params.sheetName;
      var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı.");
      var mapping = params.mapping;
      var rawData = {};

      Object.keys(mapping).forEach(function (key) {
        rawData[key] = sheet.getRange(mapping[key]).getDisplayValues();
      });

      var numRows = rawData.kuyrukNo.length;
      var inventoryResults = [];

      var lookupData = null;
      if (params.aircraftType === "AT-802") {
        try {
          lookupData = {
            keys: sheet.getRange("T24:T45").getDisplayValues(),
            vals: sheet.getRange("U24:V45").getDisplayValues(),
          };
        } catch (e) {}
      }

      var allSheets = (params.fetchTechnicalDetails || params.aircraftType === "AT-802") ? ss.getSheets() : [];
      for (var i = 0; i < numRows; i++) {
        var item = {};
        Object.keys(rawData).forEach(function (key) {
          var rowVals = rawData[key] ? rawData[key][i] : null;
          if (rowVals) {
            item[key] = rowVals.length === 1 ? rowVals[0] : rowVals;
          } else {
            item[key] = null;
          }
        });

        if (item.kuyrukNo && String(item.kuyrukNo).trim() !== "") {
          if (
            params.fetchTechnicalDetails ||
            params.aircraftType === "AT-802"
          ) {
            var kNo = String(item.kuyrukNo).trim();
            var match = kNo.match(/OR-\d+/i);
            if (match) {
              kNo = match[0].toUpperCase();
            }
            var techSheet = getTechSheet(allSheets, kNo);
            
            if (techSheet) {
              try {
                item.govdeSN = techSheet.getRange("H10").getDisplayValue();
                item.motor1SN = techSheet.getRange("H14").getDisplayValue();
                item.uretimYili = techSheet.getRange("F7:H7").getDisplayValue();
                
                // AT-802 Gövde Uçuş Saati (Önce ana sayfadan geleni koru, yoksa B11 hücresinden oku)
                if (!item.govdeUcusSaati || item.govdeUcusSaati === "-" || item.govdeUcusSaati === "") {
                  var techGovdeSaat = techSheet.getRange("B11").getDisplayValue();
                  if (techGovdeSaat && techGovdeSaat !== "" && techGovdeSaat !== "-") {
                    item.govdeUcusSaati = techGovdeSaat;
                  }
                }

                var cells = getAT802Cells(kNo);
                var frdsCell = cells.frds;
                var motorCell = cells.motor;

                var techFrds = getFirstNonEmpty(techSheet, frdsCell);
                
                if (techFrds && techFrds !== "-") {
                  item.frdsTestDate = techFrds;
                  item.frdsTest = techFrds;
                }
                
                var techMotor = getFirstNonEmpty(techSheet, motorCell);
                if (techMotor && techMotor !== "-") {
                  item.motorRunDate = techMotor;
                  item.motorCalisma = techMotor;
                }
                
                // Bakım Takvim Tarihi (Eğer teknik sayfada varsa alalım)
                // Bazı uçaklarda M12 veya N12 gibi yerlerde olabilir
                var techBakim = techSheet.getRange("M12").getDisplayValue();
                if (techBakim && techBakim !== "-" && techBakim !== "") {
                   if (!item.bakimTakvimTarih || item.bakimTakvimTarih === "-") {
                     item.bakimTakvimTarih = techBakim;
                   }
                }
              } catch (e) {
                item.techError = e.toString();
              }
            }

            if (lookupData) {
              var searchKNo = kNo.toUpperCase();
              for (var k = 0; k < lookupData.keys.length; k++) {
                var keyStr = String(lookupData.keys[k][0]).toUpperCase();
                if (keyStr.indexOf(searchKNo) === 0) {
                  item.gelisTarihi =
                    lookupData.vals[k][0] || lookupData.vals[k][1];
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
      
      var techSheet = null;
      var allSheets = ss.getSheets();
      var searchKNo = kNo.toUpperCase().replace(/[\s\.-]/g, "");
      for (var s = 0; s < allSheets.length; s++) {
        var sName = allSheets[s].getName().toUpperCase().replace(/[\s\.-]/g, "");
        if (sName.indexOf(searchKNo) !== -1 && sName.indexOf("GENEL") !== -1) {
          techSheet = allSheets[s];
          break;
        }
      }
      if (!techSheet) {
        for (var s = 0; s < allSheets.length; s++) {
          var sName = allSheets[s].getName().toUpperCase().replace(/[\s\.-]/g, "");
          if (sName === searchKNo) {
            techSheet = allSheets[s];
            break;
          }
        }
      }

      if (!techSheet)
        return jsonError("Teknik sayfa bulunamadı: " + kNo);

      var data = {};
      try {
        data.acTT = techSheet.getRange("B11").getDisplayValue();
        data.landings = techSheet.getRange("E11").getDisplayValue();
        data.starts = techSheet.getRange("F15").getDisplayValue();
        data.flights = techSheet.getRange("H15").getDisplayValue();

        var cells = getAT802Cells(kNo);
        var frdsCell = cells.frds;
        var motorCell = cells.motor;

        var techFrds = getFirstNonEmpty(techSheet, frdsCell);
        
        data.frdsTest = techFrds;
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
        var decodedData = Utilities.base64Decode(
          fileData.split(",")[1] || fileData,
        );
        var blob = Utilities.newBlob(
          decodedData,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "temp.xlsx",
        );

        // Google Drive API kullanarak dosyayı dönüştür ve mevcut ID'nin üzerine yaz
        var fileId = ss.getId();
        Drive.Files.update(
          {
            title: ss.getName(),
            mimeType: MimeType.GOOGLE_SHEETS,
          },
          fileId,
          blob,
        );

        return jsonSuccess("Excel başarıyla yüklendi.");
      } catch (e) {
        return jsonError("Excel yükleme hatası: " + e.toString());
      }
    }

    if (action === "updatePastEnvanterLog") {
      var date = params.date; // dd.MM.yyyy
      var kuyrukNo = params.kuyrukNo;
      var newHours = params.newHours;

      var logSheet = findSheet(ss, "Envanter Log");
      if (!logSheet) {
        logSheet = ss.insertSheet("Envanter Log");
        logSheet.appendRow(["ID", "Tarih", "Kuyruk No", "Tip", "Gövde Uçuş Saati", "Faydalı Saat", "Konum", "Durum", "Durum Ayrıntısı", "Açıklama"]);
      }

      var data = logSheet.getDataRange().getValues();
      var foundRowIndex = -1;
      var tip = params.tip || "";
      
      for (var i = 1; i < data.length; i++) {
        var rowDate = data[i][1];
        if (rowDate instanceof Date) {
          rowDate = Utilities.formatDate(rowDate, ss.getSpreadsheetTimeZone(), "dd.MM.yyyy");
        }
        var rowKuyruk = String(data[i][2]).trim().toUpperCase();
        var targetKuyruk = String(kuyrukNo).trim().toUpperCase();

        // Match tail number to find tip if not provided
        if (rowKuyruk === targetKuyruk && !tip) {
          tip = data[i][3];
        }

        if (rowDate === date && rowKuyruk === targetKuyruk) {
          foundRowIndex = i + 1;
        }
      }

      // If tip still not found, try to find it in the data one last time
      if (!tip) {
        for (var j = 1; j < data.length; j++) {
           if (String(data[j][2]).trim().toUpperCase() === String(kuyrukNo).trim().toUpperCase()) {
              tip = data[j][3];
              break;
           }
        }
      }

      if (foundRowIndex > 0) {
        setLogTimeValue(logSheet, foundRowIndex, 5, newHours, tip);
      } else {
        var id = date + "_" + kuyrukNo;
        
        logSheet.appendRow([
          id,
          date,
          kuyrukNo,
          tip,
          "", // Temporary place for hours
          0,
          "",
          "FAAL",
          "-",
          "GERİYE DÖNÜK GİRİŞ"
        ]);
        foundRowIndex = logSheet.getLastRow();
        setLogTimeValue(logSheet, foundRowIndex, 5, newHours, tip);
      }

      // --- GERİYE DÖNÜK SAAT DEĞİŞİMİNDEN SONRAKİ GÜNLERİ GÜNCELLEME MANTIĞI ---
      // Eğer past saat değiştiyse, sonraki günlerdeki saat ondan az olamaz.
      // Eğer sonraki günün saati az ise, o girilen geçmiş saatle eşitlenir.
      // Eğer fazla ise, hiçbir değişiklik yapılmaz. This means personnel entered today first, then yesterday.
      
      var newHoursVal = 0;
      if (newHours !== undefined && newHours !== null && newHours !== "") {
        var hStr = String(newHours).replace(',', '.');
        if (hStr.indexOf(':') !== -1) {
          var pts = hStr.split(':').map(Number);
          newHoursVal = (pts[0] || 0) + (pts[1] || 0) / 60;
        } else {
          newHoursVal = parseFloat(hStr) || 0;
        }
      }

      var getYYYYMMDDLocal = function(val) {
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
        var p = str.split('.');
        if (p.length === 3) {
          var d = p[0];
          var m = p[1];
          var y = p[2];
          if (d.length === 1) d = "0" + d;
          if (m.length === 1) m = "0" + m;
          return "" + y + m + d;
        }
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
      };

      var targetYMD = getYYYYMMDDLocal(date);
      var targetKuyruk = String(kuyrukNo).trim().toUpperCase();

      // Refresh data to get appended rows
      var refreshedData = logSheet.getDataRange().getValues();
      for (var r = 1; r < refreshedData.length; r++) {
        var rowKuyruk = String(refreshedData[r][2]).trim().toUpperCase();
        if (rowKuyruk !== targetKuyruk) continue;

        var rowDateVal = refreshedData[r][1];
        var rowYMD = getYYYYMMDDLocal(rowDateVal);

        if (rowYMD > targetYMD) {
          var rowHoursRaw = refreshedData[r][4];
          var rowHoursVal = 0;
          if (rowHoursRaw !== undefined && rowHoursRaw !== null && rowHoursRaw !== "") {
            if (rowHoursRaw instanceof Date) {
              rowHoursVal = rowHoursRaw.getHours() + rowHoursRaw.getMinutes() / 60;
            } else {
              var rStr = String(rowHoursRaw).replace(',', '.');
              if (rStr.indexOf(':') !== -1) {
                var pts = rStr.split(':').map(Number);
                rowHoursVal = (pts[0] || 0) + (pts[1] || 0) / 60;
              } else {
                rowHoursVal = parseFloat(rStr) || 0;
              }
            }
          }

          if (rowHoursVal < newHoursVal) {
            setLogTimeValue(logSheet, r + 1, 5, newHours, tip);
          }
        }
      }

      return jsonSuccess("Geçmiş gün verisi ve takip eden günlerin saatleri başarıyla eşitlendi/güncellendi (" + date + " - " + kuyrukNo + ")");
    }

    if (action === "updateAircraftData") {
      var sheetName = params.sheetName;
      var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı.");

      var kuyrukNo = params.kuyrukNo;
      var updates = params.updates;
      var mapping = params.mapping;

      if (
        updates.acTT !== undefined ||
        updates.landings !== undefined ||
        updates.starts !== undefined ||
        updates.flights !== undefined ||
        updates.frdsTest !== undefined ||
        updates.motorCalisma !== undefined
      ) {
        var kNo = String(kuyrukNo).trim();
        var match = kNo.match(/OR-\d+/i);
        if (match) {
          kNo = match[0].toUpperCase();
        }
        var techSheetName = kNo + " Genel";
        var techSheet = ss.getSheetByName(techSheetName);
        if (techSheet) {
          if (updates.acTT !== undefined)
            setLogTimeValue(techSheet, 11, 2, updates.acTT, params.aircraftType);
          if (updates.landings !== undefined)
            techSheet.getRange("E11").setValue(updates.landings);
          if (updates.starts !== undefined)
            techSheet.getRange("F15").setValue(updates.starts);
          if (updates.flights !== undefined)
            techSheet.getRange("H15").setValue(updates.flights);

          var cells = getAT802Cells(kNo);
          var frdsCell = cells.frds;
          var motorCell = cells.motor;

          if (updates.frdsTest !== undefined)
            updateLastInLog(techSheet, frdsCell, updates.frdsTest);
          if (updates.motorCalisma !== undefined)
            updateLastInLog(techSheet, motorCell, updates.motorCalisma);
        }
      }

      var kuyrukNoRangeStr = mapping.kuyrukNo || "A3:A30";
      var range = sheet.getRange(kuyrukNoRangeStr);
      var values = range.getValues();
      var rowIndex = -1;

      var startRow = parseInt(kuyrukNoRangeStr.match(/\d+/)[0]) || 3;
      var searchKNo = String(kuyrukNo).trim().toUpperCase();

      for (var i = 0; i < values.length; i++) {
        var rowKNo = String(values[i][0]).trim().toUpperCase();
        if (rowKNo === searchKNo) {
          rowIndex = i + startRow;
          break;
        }
      }

      if (rowIndex > 0) {
        var updateErrors = [];
        Object.keys(updates).forEach(function (key) {
          if (mapping[key]) {
            try {
              // Sadece sütun harfini al ve rowIndex ile birleştir (Örn: "C3:C40" -> "C" + 5 -> "C5")
              var colPart = mapping[key].split(":")[0];
              var colLetter = colPart.replace(/[0-9]/g, "");
              if (colLetter) {
                // If the key is 'aciklama' and the value is empty string or null, set it to empty string
                var valToSet = updates[key];
                if (key === 'aciklama' && (valToSet === '' || valToSet === null || valToSet === undefined)) {
                  valToSet = '';
                } else if (valToSet === undefined || valToSet === null) {
                  return; // Skip other undefined/null values
                }
                
                // AT-802 için GÜNLÜK DURUM sayfasında gövde uçuş saati güncellemesini engelle
                if (params.aircraftType === "AT-802" && key === "govdeUcusSaati" && (sheetName === "GÜNLÜK DURUM" || !sheetName)) {
                  return;
                }
                
                // Saat bazlı alanları setLogTimeValue ile güvenli şekilde güncelle
                var hourKeys = ["govdeUcusSaati", "acTT", "motor1UcusSaati", "motor2UcusSaati", "bakim200H", "bakim50H"];
                if (hourKeys.indexOf(key) !== -1 && valToSet) {
                   setLogTimeValue(sheet, rowIndex, sheet.getRange(colLetter + rowIndex).getColumn(), valToSet, params.aircraftType);
                } else {
                   sheet.getRange(colLetter + rowIndex).setValue(valToSet);
                }
                
                Logger.log(
                  "Updated " +
                    key +
                    " at " +
                    colLetter +
                    rowIndex +
                    " with " +
                    valToSet,
                );
              }
            } catch (e) {
              updateErrors.push(key + ": " + e.toString());
            }
          }
        });

        if (updateErrors.length > 0) {
          return jsonError(
            "Bazı alanlar güncellenemedi: " + updateErrors.join(", "),
          );
        }

        return jsonSuccess({
          message: "Veri başarıyla güncellendi",
          rowIndex: rowIndex,
        });
      } else {
        return jsonError(
          "Kuyruk numarası (" +
            searchKNo +
            ") " +
            kuyrukNoRangeStr +
            " aralığında bulunamadı.",
        );
      }
    }

    if (action === "logAllAircraftActivity") {
      var fleetData = params.fleetData;
      if (!fleetData || !Array.isArray(fleetData)) return jsonError("Filo verisi eksik.");
      
      var logSheet = findSheet(ss, "Envanter Log");
      if (!logSheet) {
        logSheet = ss.insertSheet("Envanter Log");
        logSheet.appendRow([
          "ID", "Tarih", "Kuyruk No", "Tip", "Gövde Uçuş Saati", 
          "Faydalı Saat", "Konum", "Durum", "Durum Ayrıntısı", "Açıklama"
        ]);
      }

      var faalLogSheet = findSheet(ss, "Faaliyet Log");
      if (!faalLogSheet) {
        faalLogSheet = ss.insertSheet("Faaliyet Log");
        faalLogSheet.appendRow([
          "ID", "Tarih", "Kuyruk No", "Tip", "Durum", "Analiz Kodu"
        ]);
      }
      
      var dateStr = params.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy");
      // Normalize date string
      if (dateStr.includes('-')) {
        var parts = dateStr.split('-');
        if (parts[0].length === 4) dateStr = parts[2] + "." + parts[1] + "." + parts[0];
      }

      var normalizeDate = function(d) {
        if (!d && d !== 0) return "";
        if (d instanceof Date) return Utilities.formatDate(d, "GMT+3", "dd.MM.yyyy");
        var s = String(d).trim();
        if (!s) return "";
        if (s.includes("-") || s.includes(".") || s.includes("/")) {
          var p = s.split(/[- ./:]/);
          if (p.length >= 3) {
            if (p[0].length === 4) {
              return (p[2].length < 2 ? "0" + p[2] : p[2]) + "." + (p[1].length < 2 ? "0" + p[1] : p[1]) + "." + p[0];
            }
            if (p[2].split(" ")[0].length === 4) {
              return (p[0].length < 2 ? "0" + p[0] : p[0]) + "." + (p[1].length < 2 ? "0" + p[1] : p[1]) + "." + p[2].split(" ")[0];
            }
          }
        }
        return s;
      };

      var targets = {};
      fleetData.forEach(function(d) {
        var k = String(d.kuyrukNo || "").trim().toUpperCase();
        if (k) targets[dateStr + "_" + k] = true;
      });

      var cleanupSheet = function(sheet) {
        var dataRows = sheet.getDataRange().getValues();
        var rowsToDelete = [];
        var seenOnThisPass = {};
        
        // Pass 1: Identify duplicate rows for the same Date_Tail
        // We scan from top to bottom keep the FIRST one, or the one with MOST data.
        // Actually, for cleanup, keeping the last one is usually best as it's the most recent.
        for (var i = dataRows.length - 1; i >= 1; i--) {
          var rDate = normalizeDate(dataRows[i][1]);
          var rKNo = String(dataRows[i][2]).trim().toUpperCase();
          
          if (!rDate || !rKNo) {
            rowsToDelete.push(i + 1);
            continue;
          }
          
          var key = rDate + "_" + rKNo;
          if (seenOnThisPass[key]) {
            rowsToDelete.push(i + 1);
          } else {
            seenOnThisPass[key] = true;
          }
        }
        
        if (rowsToDelete.length > 0) {
          rowsToDelete.sort(function(a, b) { return b - a; });
          // Batch delete to avoid flickering
          rowsToDelete.forEach(function(idx) { 
            try { sheet.deleteRow(idx); } catch(e) {}
          });
        }
      };

      // cleanupSheet(logSheet);
      // cleanupSheet(faalLogSheet);
      // --- DUPLICATE REMOVAL COMPLETELY DISABLED DURING AUTO-SYNC ---

      // Populate ID maps after rows have been deleted/moved
      var logIdMap = {};
      var logDataRows = logSheet.getDataRange().getValues();
      for (var i = 1; i < logDataRows.length; i++) {
        var rId = String(logDataRows[i][0]).trim();
        if (rId) logIdMap[rId] = { row: i + 1, data: logDataRows[i] };
      }
      var nextLogFullRow = logDataRows.length + 1;

      var faalIdMap = {};
      var faalDataRows = faalLogSheet.getDataRange().getValues();
      for (var i = 1; i < faalDataRows.length; i++) {
        var rId = String(faalDataRows[i][0]).trim();
        if (rId) faalIdMap[rId] = { row: i + 1, data: faalDataRows[i] };
      }
      var nextFaalFullRow = faalDataRows.length + 1;
      
      var updatedCount = 0;
      
      fleetData.forEach(function(data) {
        var kuyrukNo = String(data.kuyrukNo || "").trim().toUpperCase();
        if (!kuyrukNo) return;
        var logId = dateStr + "_" + kuyrukNo;
        var newAyrinti = String(data.durumAyrintisi || "").trim().toUpperCase();
        var finalAnaliz = data.analizKodu || analyzeStatusGS(data);

        // --- 1. Envanter Log Güncelleme ---
        var logEntry = logIdMap[logId];
        var faydaliVal = data.faydaliSaat;
        if (typeof faydaliVal === 'string') {
          faydaliVal = parseFloat(faydaliVal.replace(/\./g, "").replace(',', '.')) || 0;
        }

        var newGovdeRaw = data.govdeUcusSaati;
        var newGovdeFormatted = formatToHHMM(newGovdeRaw, data.tip);

        if (!logEntry) {
          var targetRow = nextLogFullRow;
          logSheet.getRange(targetRow, 1, 1, 10).setValues([[
            logId, 
            dateStr, 
            kuyrukNo, 
            data.tip, 
            "", // Placeholder
            faydaliVal,
            data.konum,
            data.durum,
            data.durumAyrintisi,
            data.aciklama ? "'" + String(data.aciklama) : ""
          ]]);
          
          setLogTimeValue(logSheet, targetRow, 5, newGovdeRaw, data.tip);
          logSheet.getRange(targetRow, 6).setNumberFormat("0.0#");
          
          logIdMap[logId] = { 
            row: targetRow, 
            data: [
              logId, dateStr, kuyrukNo, data.tip, 
              newGovdeRaw, faydaliVal, data.konum, data.durum, 
              data.durumAyrintisi, data.aciklama
            ] 
          };
          nextLogFullRow++;
          updatedCount++;
        } else {
          var oldRow = logEntry.data;
          var oldFaydali = parseFloat(oldRow[5]) || 0;
          var newFaydali = parseFloat(faydaliVal) || 0;
          
          var oldKonum = String(oldRow[6]).trim().toUpperCase();
          var newKonum = String(data.konum || "").trim().toUpperCase();
          
          var oldDurum = String(oldRow[7]).trim().toUpperCase();
          var newDurum = String(data.durum || "").trim().toUpperCase();
          
          var oldAyrinti = String(oldRow[8]).trim().toUpperCase();
          
          var oldAciklama = String(oldRow[9] || "").trim();
          if (oldAciklama.indexOf("'") === 0) oldAciklama = oldAciklama.substring(1);
          var newAciklama = String(data.aciklama || "").trim();
          
          var oldGovdeRaw = oldRow[4];
          var oldGovde = formatToHHMM(oldGovdeRaw, data.tip);
          
          // "0 SIFIR/BOŞ" Guard: Mevcut veri varsa sıfır/boş ile güncelleme
          var skipGovdeUpdate = (newGovdeFormatted === "00:00" || newGovdeFormatted === "0,0" || !newGovdeRaw) && (oldGovde !== "00:00" && oldGovde !== "0,0" && oldGovdeRaw);
          var skipFaydaliUpdate = (newFaydali === 0) && (oldFaydali !== 0);

          var finalGovdeToUpdate = skipGovdeUpdate ? oldGovdeRaw : newGovdeRaw;
          var finalFaydaliToUpdate = skipFaydaliUpdate ? oldFaydali : newFaydali;

          // Check if significant changes exist
          if (Math.abs(oldFaydali - finalFaydaliToUpdate) > 0.01 || oldKonum !== newKonum || 
              oldDurum !== newDurum || oldAyrinti !== newAyrinti || 
              oldAciklama !== newAciklama || oldGovde !== formatToHHMM(finalGovdeToUpdate, data.tip)) {
            
            logSheet.getRange(logEntry.row, 6, 1, 5).setValues([[
              finalFaydaliToUpdate,
              data.konum,
              data.durum,
              data.durumAyrintisi,
              data.aciklama ? "'" + String(data.aciklama) : ""
            ]]);
            logSheet.getRange(logEntry.row, 6).setNumberFormat("0.0#");
            setLogTimeValue(logSheet, logEntry.row, 5, finalGovdeToUpdate, data.tip);
            
            // Map datasını güncelle
            logEntry.data[4] = finalGovdeToUpdate;
            logEntry.data[5] = finalFaydaliToUpdate;
            logEntry.data[6] = data.konum;
            logEntry.data[7] = data.durum;
            logEntry.data[8] = data.durumAyrintisi;
            logEntry.data[9] = data.aciklama;
            updatedCount++;
          }
        }


        // --- 2. Faaliyet Log Güncelleme & Değişiklik Kontrolü ---
        var faalEntry = faalIdMap[logId];
        
        if (!faalEntry) {
          var targetFaalRow = nextFaalFullRow;
          faalLogSheet.getRange(targetFaalRow, 1, 1, 6).setValues([[
            logId,
            dateStr,
            kuyrukNo,
            data.tip,
            data.durumAyrintisi,
            finalAnaliz
          ]]);
          // Update the map
          faalIdMap[logId] = { row: targetFaalRow, data: [logId, dateStr, kuyrukNo, data.tip, data.durumAyrintisi, finalAnaliz] };
          nextFaalFullRow++;
        } else {
          var oldFaalRow = faalEntry.data;
          var oldAyrintiLog = String(oldFaalRow[4]).trim().toUpperCase();
          var oldAnalizLog = String(oldFaalRow[5]).trim().toUpperCase();
          
          if (oldAyrintiLog !== newAyrinti || oldAnalizLog !== finalAnaliz) {
             faalLogSheet.getRange(faalEntry.row, 5, 1, 2).setValues([[newAyrinti, finalAnaliz]]);
             faalEntry.data[4] = newAyrinti;
             faalEntry.data[5] = finalAnaliz;
          }
        }
      });
      
      return jsonSuccess("Filo logları işlendi. Güncellenen kayıt sayısı: " + updatedCount);
    }

    if (action === "logSingleAircraftActivity") {
      var data = params.data;
      var rawDate =
        data.date ||
        Utilities.formatDate(
          new Date(),
          Session.getScriptTimeZone(),
          "dd.MM.yyyy",
        );
      
      var dateStr = rawDate;
      if (rawDate.includes('-')) {
        var dParts = rawDate.split('-');
        if (dParts[0].length === 4) {
          dateStr = dParts[2] + "." + dParts[1] + "." + dParts[0];
        }
      }
      
      var kuyrukNo = String(data.kuyrukNo || "").trim();
      var id = dateStr + "_" + kuyrukNo;

      var logSheet = findSheet(ss, "Envanter Log");
      if (!logSheet) {
        logSheet = ss.insertSheet("Envanter Log");
        logSheet.appendRow([
          "ID", "Tarih", "Kuyruk No", "Tip", "Gövde Uçuş Saati", 
          "Faydalı Saat", "Konum", "Durum", "Durum Ayrıntısı", "Açıklama"
        ]);
      }
      
      var faydaliVal = data.faydaliSaat;
      if (typeof faydaliVal === 'string') faydaliVal = parseFloat(faydaliVal.replace(',', '.')) || 0;

      var logData = logSheet.getRange("A:A").getValues();
      var foundLog = false;
      for (var i = 1; i < logData.length; i++) {
        if (String(logData[i][0]).trim() === id) {
          logSheet.getRange(i + 1, 1, 1, 4).setValues([[id, dateStr, kuyrukNo, data.tip]]);
          logSheet
            .getRange(i + 1, 6, 1, 5)
            .setValues([
              [
                faydaliVal,
                data.konum,
                data.durum,
                data.durumAyrintisi,
                data.aciklama ? "'" + String(data.aciklama) : "",
              ],
            ]);
          setLogTimeValue(logSheet, i + 1, 5, data.govdeUcusSaati, data.tip);
          logSheet.getRange(i + 1, 6).setNumberFormat("0.0#");
          logSheet.getRange(i + 1, 10).setNumberFormat("@");
          foundLog = true;
          break;
        }
      }
      if (!foundLog) {
        logSheet.appendRow([
          id,
          dateStr,
          kuyrukNo,
          data.tip,
          "", // Gövde Uçuş Saati (set below)
          faydaliVal,
          data.konum,
          data.durum,
          data.durumAyrintisi,
          data.aciklama ? "'" + String(data.aciklama) : "",
        ]);
        var lastRowIdx = logSheet.getLastRow();
        setLogTimeValue(logSheet, lastRowIdx, 5, data.govdeUcusSaati, data.tip);
        logSheet.getRange(lastRowIdx, 6).setNumberFormat("0.0#");
        logSheet.getRange(lastRowIdx, 10).setNumberFormat("@");
      }

      var faalLogSheet = findSheet(ss, "Faaliyet Log");
      if (!faalLogSheet) {
        faalLogSheet = ss.insertSheet("Faaliyet Log");
        faalLogSheet.appendRow([
          "ID",
          "Tarih",
          "Kuyruk No",
          "Tip",
          "Durum",
          "Analiz Kodu",
        ]);
      }
      var faalData = faalLogSheet.getRange("A:A").getValues();
      var foundFaal = false;
      for (var j = 1; j < faalData.length; j++) {
        if (String(faalData[j][0]).trim() === id) {
          faalLogSheet
            .getRange(j + 1, 5, 1, 2)
            .setValues([[data.durumAyrintisi, finalAnaliz]]);
          foundFaal = true;
          break;
        }
      }
      if (!foundFaal) {
        faalLogSheet.appendRow([
          id,
          dateStr,
          kuyrukNo,
          data.tip,
          data.durumAyrintisi,
          finalAnaliz,
        ]);
      }

      return jsonSuccess("Loglar güncellendi.");
    }

    if (action === "saveIntraDayActivity") {
      var intraDaySheet = findSheet(ss, "Saatlik Faaliyet Günlüğü");
      if (!intraDaySheet) {
        intraDaySheet = ss.insertSheet("Saatlik Faaliyet Günlüğü");
        intraDaySheet.appendRow([
          "ID",
          "Tarih",
          "Kuyruk No",
          "Tip",
          "GAYRI FAAL BAŞLANGIÇ SAATİ",
          "FAAL BAŞLANGIÇ SAATİ",
          "Durum",
          "Açıklama",
        ]);
      }
      var data = params.data;
      var dateStr = data.date;
      // Normalize date if needed
      if (dateStr.includes('-')) {
        var p = dateStr.split('-');
        if (p[0].length === 4) dateStr = p[2] + "." + p[1] + "." + p[0];
      }
      
      var id = dateStr + "_" + data.kuyrukNo + "_" + data.startTime;
      
      var dataRows = intraDaySheet.getDataRange().getValues();
      var existingRow = -1;
      for (var i = 1; i < dataRows.length; i++) {
        if (String(dataRows[i][0]) === id) {
          existingRow = i + 1;
          break;
        }
      }
      
      if (existingRow !== -1) {
        intraDaySheet.getRange(existingRow, 1, 1, 8).setValues([[
          id, dateStr, data.kuyrukNo, data.tip, data.startTime, data.endTime, data.status, data.description
        ]]);
      } else {
        intraDaySheet.appendRow([
          id, dateStr, data.kuyrukNo, data.tip, data.startTime, data.endTime, data.status, data.description
        ]);
      }
      return jsonSuccess("Gün içi faaliyet kaydedildi.");
    }

    if (action === "setupAutoMailTrigger") {
      return jsonSuccess(setupAutoMailTrigger());
    }

    if (action === "setupMidnightTrigger") {
      return jsonSuccess(setupMidnightTrigger());
    }

    if (action === "performDailyMidnightLogging") {
      performDailyMidnightLogging();
      return jsonSuccess("Gece yarısı loglaması manuel tetiklendi.");
    }

    if (action === "debugAutoMail") {
      return jsonSuccess(debugAutoMail());
    }

    return jsonError("Bilinmeyen işlem: " + action);
  } catch (err) {
    return jsonError(err.toString());
  }
}

function jsonError(msg) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "error", success: false, error: msg }),
  ).setMimeType(ContentService.MimeType.JSON);
}
function jsonSuccess(data) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", success: true, data: data }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function updateLastInLog(sheet, rangeStr, value) {
  var range = sheet.getRange(rangeStr);
  if (range.getNumRows() === 1 && range.getNumColumns() === 1) {
    range.setValue(value);
    return;
  }

  var values = range.getValues();
  var row = range.getRow();
  var col = range.getColumn();
  var lastR = -1;
  var lastC = -1;

  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < values[r].length; c++) {
      if (
        values[r][c] !== "" &&
        values[r][c] !== null &&
        values[r][c] !== undefined &&
        values[r][c] !== "-"
      ) {
        lastR = r;
        lastC = c;
      }
    }
  }

  if (lastR !== -1) {
    sheet.getRange(row + lastR, col + lastC).setValue(value);
  } else {
    sheet.getRange(row, col).setValue(value);
  }
}

function getFirstNonEmpty(sheet, rangeStr) {
  try {
    if (!rangeStr.includes(":")) {
      var val = sheet.getRange(rangeStr).getValue();
      if (val instanceof Date) {
        return Utilities.formatDate(
          val,
          Session.getScriptTimeZone(),
          "yyyy-MM-dd",
        );
      }
      var displayVal = sheet.getRange(rangeStr).getDisplayValue();
      return displayVal ? displayVal.toString().trim() : "";
    }

    var values = sheet.getRange(rangeStr).getValues();
    var displayValues = sheet.getRange(rangeStr).getDisplayValues();
    // Scan backwards to get the latest entry in a log range
    for (var r = values.length - 1; r >= 0; r--) {
      for (var c = values[r].length - 1; c >= 0; c--) {
        if (
          values[r][c] !== "" &&
          values[r][c] !== null &&
          values[r][c] !== undefined &&
          values[r][c] !== "-"
        ) {
          if (values[r][c] instanceof Date) {
            return Utilities.formatDate(
              values[r][c],
              Session.getScriptTimeZone(),
              "yyyy-MM-dd",
            );
          }
          if (
            displayValues[r][c] &&
            displayValues[r][c].toString().trim() !== "" &&
            displayValues[r][c].toString().trim() !== "-"
          ) {
            return displayValues[r][c].toString().trim();
          }
        }
      }
    }
  } catch (e) {}
  return "";
}

function findSheet(ss, name) {
  var sheets = ss.getSheets();
  var target = name.toUpperCase().replace(/[\s\.]/g, "");
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i]
      .getName()
      .toUpperCase()
      .replace(/[\s\.]/g, "");
    if (sName === target) return sheets[i];
  }
  return null;
}

function sendReportEmail(recipient, customAttachments, ss) {
  var attachments = Array.isArray(customAttachments) ? customAttachments : [];
  var currentSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var logSsId = currentSs ? currentSs.getId() : "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg";

  // 1. Get reports and email from recipient object
  var selectedReports = "";
  for (var key in recipient) {
    if (key.toUpperCase().includes("EK") || key.toUpperCase().includes("ATTACHMENT") || key.toUpperCase().includes("RAPOR")) {
      selectedReports = String(recipient[key] || "");
      break;
    }
  }

  var targetEmail = "";
  for (var key in recipient) {
    if (key.toUpperCase().includes("MAİL") || key.toUpperCase().includes("EMAIL")) {
      targetEmail = String(recipient[key] || "");
      break;
    }
  }

  if (!targetEmail) {
    console.error("Target email not found in recipient: " + JSON.stringify(recipient));
    return;
  }

  var upperReports = selectedReports.toUpperCase();
  console.log("Sending email to: " + targetEmail + " | Reports: " + upperReports);

  // 2. Attachments matching
  
  // A) ENVANTER RAPORU
  if (upperReports.includes("ENVANTER") && (upperReports.includes("RAPOR") || upperReports.includes("DURUM"))) {
    try {
      var blob = generateFormattedEnvanterExcel(logSsId);
      if (blob) attachments.push(blob);
    } catch (e) {
      console.error("Error attaching Envanter: " + e.toString());
    }
  }

  // B) FAALİYET ÇİZELGESİ
  if (upperReports.includes("FAALİYET") || upperReports.includes("FAALIYET") || upperReports.includes("ÇİZELGE") || upperReports.includes("CIZELGE")) {
    try {
      var blob = generateFormattedFaaliyetExcel(logSsId);
      if (blob) attachments.push(blob);
    } catch (e) {
      console.error("Error attaching Faaliyet: " + e.toString());
    }
  }

  // C) ONLINE EXCEL DOSYALARI
  if (upperReports.includes("ONLİNE") || upperReports.includes("ONLINE") || upperReports.includes("HAVA ARACI EXCELİ")) {
    var platformIds = {
      "Bell-429": "1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ",
      "AT-802": "1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4",
      "T-70": "10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw",
      "B-360": "1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0",
      "C-650": "1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE",
    };

    for (var platform in platformIds) {
      try {
        var blob = getSheetAsExcel(platformIds[platform], platform + "_Online_Excel.xlsx");
        if (blob) attachments.push(blob);
      } catch (e) {
        console.error("Error attaching " + platform + ": " + e.toString());
      }
    }
  }

  console.log("Total attachments for " + targetEmail + ": " + attachments.length);

  if (attachments.length === 0) {
    console.error("No attachments to send for: " + targetEmail + ". Skipping email.");
    return;
  }

  if (attachments.length === 0) {
    console.error("No attachments found for " + targetEmail + ". Skipping email.");
    return;
  }

  var liveAppUrl = "https://filodurumlar-bakimsube.netlify.app";
  var body = "Sayın " + (recipient["PERSONEL ADI"] || "Yetkili") + ",\n" +
             "Günlük hava aracı operasyonel durum raporları ekte bilgilerinize sunulmuştur.\n" +
             "Bununla birlikte, aşağıdaki adresi tarayıcınıza kopyalayarak en güncel durum raporunu canlı olarak da takip edebilirsiniz:\n" +
             "👉 filodurumlar-bakimsube.netlify.app\n" +
             "İyi çalışmalar dilerim.";

  var htmlBody = "<div style='font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #333;'>" +
                 "<p>Sayın " + (recipient["PERSONEL ADI"] || "Yetkili") + ",</p>" +
                 "<p>Günlük hava aracı operasyonel durum raporları ekte bilgilerinize sunulmuştur.</p>" +
                 "<p>Bununla birlikte, aşağıdaki adresi tarayıcınıza kopyalayarak en güncel durum raporunu canlı olarak da takip edebilirsiniz:<br>" +
                 "👉 <strong>filodurumlar-bakimsube.netlify.app</strong></p>" +
                 "<p>İyi çalışmalar dilerim.</p>" +
                 "</div>";

  MailApp.sendEmail({
    to: targetEmail,
    subject: "OGM Hava Aracı Durum Raporu - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy"),
    body: body,
    htmlBody: htmlBody,
    attachments: attachments,
  });
}

function getSheetAsExcel(ssId, name) {
  try {
    var ss = SpreadsheetApp.openById(ssId);
    var sheets = ss.getSheets();
    var hasLogSheets = sheets.some(function (s) {
      var n = s.getName().toUpperCase();
      return (
        n.includes("ENVANTER LOG") ||
        n.includes("FAALİYET LOG") ||
        n.includes("FAALIYET LOG") ||
        n.includes("SAATLİK FAALİYET GÜNLÜĞÜ") ||
        n.includes("SAATLIK FAALIYET GUNLUGU") ||
        n.includes("LOG KAYITLARI") ||
        n.includes("LOG KAYITLARI") ||
        n.includes("LOG")
      );
    });

    var targetSsId = ssId;
    var tempFile = null;

    if (hasLogSheets) {
      try {
        var originalFile = DriveApp.getFileById(ssId);
        tempFile = originalFile.makeCopy("TEMP_EXPORT_" + name);
        targetSsId = tempFile.getId();
        var tempSs = SpreadsheetApp.openById(targetSsId);
        var tempSheets = tempSs.getSheets();
        tempSheets.forEach(function (s) {
          var n = s.getName().toUpperCase();
          if (
            n.includes("ENVANTER LOG") ||
            n.includes("FAALİYET LOG") ||
            n.includes("FAALIYET LOG") ||
            n.includes("SAATLİK FAALİYET GÜNLÜĞÜ") ||
            n.includes("SAATLIK FAALIYET GUNLUGU") ||
            n.includes("LOG KAYITLARI") ||
            n.includes("LOG KAYITLARI") ||
            n.includes("LOG")
          ) {
            if (tempSs.getSheets().length > 1) {
              tempSs.deleteSheet(s);
            }
          }
        });
        SpreadsheetApp.flush();
      } catch (copyErr) {
        console.error(
          "Error creating filtered copy for " +
            name +
            ": " +
            copyErr.toString(),
        );
        // Fallback to original if copy fails
        targetSsId = ssId;
      }
    }

    var url =
      "https://docs.google.com/spreadsheets/d/" +
      targetSsId +
      "/export?format=xlsx";
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() !== 200) {
      console.error(
        "Failed to fetch Excel for ID " +
          targetSsId +
          ". Status: " +
          response.getResponseCode(),
      );
      if (tempFile) tempFile.setTrashed(true);
      return null;
    }

    var blob = response.getBlob().setName(name);

    if (tempFile) {
      tempFile.setTrashed(true);
    }

    return blob;
  } catch (e) {
    console.error(
      "Exception in getSheetAsExcel for ID " + ssId + ": " + e.toString(),
    );
    return null;
  }
}

function getCallSignByTail(tail) {
  if (!tail) return "ORMAN-XX";
  var cleanTail = String(tail).trim().toUpperCase();
  
  if (cleanTail === "" || cleanTail === "-" || cleanTail.indexOf("XX") !== -1 || cleanTail.indexOf("YENİ") !== -1) {
    return "ORMAN-XX";
  }

  var mapping = {
    "OR-0177": "ORMAN-01",
    "OR-1839": "ORMAN-02",
    "OR-3125": "ORMAN-03",
    "OR-3126": "ORMAN-04",
    "OR-3127": "ORMAN-05",
    "OR-3131": "ORMAN-06",
    "OR-3133": "ORMAN-07",
    "OR-3192": "ORMAN-08",
    "OR-2021": "ORMAN-21",
    "OR-2022": "ORMAN-22",
    "OR-2023": "ORMAN-23",
    "OR-2024": "ORMAN-24",
    "OR-2025": "ORMAN-25",
    "OR-2026": "ORMAN-26",
    "OR-2027": "ORMAN-27",
    "OR-2028": "ORMAN-28",
    "OR-2029": "ORMAN-29",
    "OR-2030": "ORMAN-30",
    "OR-2031": "ORMAN-31",
    "OR-2036": "ORMAN-36",
    "OR-2037": "ORMAN-37",
    "OR-2038": "ORMAN-38",
    "OR-2039": "ORMAN-39",
    "OR-2040": "ORMAN-40",
    "OR-1018": "ORMAN-18",
    "OR-1019": "ORMAN-19",
    "OR-1020": "ORMAN-20",
  };

  var match = cleanTail.match(/OR-\d+/i);
  if (match) {
    var key = match[0].toUpperCase();
    return mapping[key] || "ORMAN-" + key.split('-')[1];
  }
  
  return "ORMAN-XX";
}

function analyzeStatusGS(item) {
  if (!item) return "F";

  var toUpperTR = function (s) {
    if (!s) return "";
    return String(s)
      .replace(/i/g, "İ")
      .replace(/ı/g, "I")
      .toUpperCase()
      .trim();
  };

  var detailUpper = toUpperTR(item.durumAyrintisi);
  var descUpper = toUpperTR(item.aciklama);
  var durumUpper = toUpperTR(item.durum);

  // 1. KESİN DURUM KONTROLÜ (Eğer FAAL ise öncelikle F veya K dönmeliyiz)
  // Kullanıcı Talebi: Eğer uçak FAAL ise TB vs. olsa bile FAAL kalmalı (Karma değilse)
  if (durumUpper === "FAAL" || durumUpper === "F") {
    if (
      detailUpper.indexOf("KARMA") !== -1 ||
      detailUpper.indexOf("HEM FAAL") !== -1 ||
      descUpper.indexOf("KARMA") !== -1 ||
      descUpper.indexOf("HEM FAAL") !== -1
    ) {
      return "K";
    }
    return "F";
  }

  var normalizeTurkish = function(str) {
    return str
      .replace(/İ/g, "I")
      .replace(/ı/g, "I")
      .replace(/Ğ/g, "G")
      .replace(/ğ/g, "G")
      .replace(/Ü/g, "U")
      .replace(/ü/g, "U")
      .replace(/Ş/g, "S")
      .replace(/ş/g, "S")
      .replace(/Ö/g, "O")
      .replace(/ö/g, "O")
      .replace(/Ç/g, "C")
      .replace(/ç/g, "C");
  };

  var findCodeInText = function(t) {
    if (!t) return null;
    
    // Normalize string for matching: replace all Turkish accented letters
    var n = normalizeTurkish(t);

    // Exact Code Match (Highest Priority)
    var exactCodes = ['B', 'BB', 'TBU', 'KM', 'A', 'PB', 'KK', 'X', 'TB'];
    if (exactCodes.indexOf(t) !== -1) return t;

    // Keyword Match - Use Normalized version 'n' for better matching
    if (n.indexOf('TEKNİK BÜLTEN') !== -1 || n.indexOf('TEKNIK BULTEN') !== -1 || n.indexOf('TBU') !== -1) return 'TBU';
    if (n.indexOf('BAKIM BEKLER') !== -1 || n === 'BB') return 'BB';
    if (n.indexOf('BAKIM') !== -1) return 'B';
    if (n.indexOf('PARÇA BEKLER') !== -1 || n.indexOf('PARCA BEKLER') !== -1 || n === 'PB') return 'PB';
    if (n.indexOf('TECRÜBE BEKLER') !== -1 || n.indexOf('TECRUBE BEKLER') !== -1 || n === 'TB' || n.indexOf('TECRÜBE') !== -1 || n.indexOf('TECRUBE') !== -1 || n.indexOf('TEST') !== -1) return 'TB';
    if (n.indexOf('KABUL MUAYENE') !== -1 || n === 'KM') return 'KM';
    if (n.indexOf('KAZA KIRIM') !== -1 || n === 'KK') return 'KK';
    if (n.indexOf('OLMADIĞI GÜNLER') !== -1 || n.indexOf('OLMADIGI GUNLER') !== -1 || n === 'X') return 'X';
    
    // ARIZA last as it's the most general catch-all for failures
    if (n.indexOf('ARIZA') !== -1 || n.indexOf('ARZ') !== -1 || n === 'A' || n.indexOf('OVERSPEED') !== -1 || n.indexOf('NG') !== -1) return 'A';
    
    return null;
  };

  // Adım 1: Durum Ayrıntısı (DURUM_AYRINTISI) - ÖNCELİKLİ (Kullanıcı Talebi)
  var detailMatch = findCodeInText(detailUpper);
  if (detailMatch) return detailMatch;

  // Adım 2: Durum (DURUM)
  var durumMatch = findCodeInText(durumUpper);
  if (durumMatch) return durumMatch;
  
  // Eğer Durumda GAYRİ FAAL yazıyorsa ve ayrıntıda bir şey bulunamadıysa A (Arıza) dönelim
  if (DURUM_IS_GAYRI_FAAL(durumUpper)) return 'A';

  return "F";
}

function DURUM_IS_GAYRI_FAAL(s) {
  if (!s) return false;
  var n = s.toLocaleUpperCase('tr-TR').replace(/İ/g, "I").replace(/ı/g, "I");
  return n.indexOf("GAYRI") !== -1 || n.indexOf("GF") !== -1 || n === "G.FAAL" || n.indexOf("ARIZA") !== -1 || n.indexOf("ARZ") !== -1 || n === "A";
}

function formatToHHMM(val, aircraftType) {
  if (val === null || val === undefined || val === "") return "00:00";
  
  var cleanTip = (aircraftType || "").toUpperCase().replace(/[\s-]/g, "");
  var isDecimalType = cleanTip.indexOf("B360") !== -1 || 
                      cleanTip.indexOf("C650") !== -1 || 
                      cleanTip.indexOf("BELL") !== -1 ||
                      cleanTip.indexOf("B429") !== -1;

  var hours = 0;
  if (typeof val === "number") {
    hours = val;
  } else {
    var s = String(val).trim().replace(",", ".");
    if (s.includes(":")) {
      var parts = s.split(":").map(Number);
      hours = (parts[0] || 0) + (parts[1] || 0) / 60;
    } else {
      hours = parseFloat(s) || 0;
    }
  }
  
  if (isDecimalType) {
    return hours.toFixed(1).replace(".", ",");
  }

  var h = Math.floor(hours);
  var m = Math.round((hours - h) * 60);
  if (m === 60) {
    h++;
    m = 0;
  }
  return h + ":" + m.toString().padStart(2, "0");
}

function parseSingleCellToHour(val, aircraftType) {
  if (
    val === undefined ||
    val === null ||
    val === "" ||
    val === "-"
  )
    return null;
  
  if (typeof val === "number") {
    // If it's a number, trust it. 0 is valid.
    if (aircraftType === "AT-802" && val > 0 && val < 5) return val * 24;
    return val;
  }

  if (typeof val === "string") {
    var s = val.trim().replace(",", ".");
    if (s === "" || s === "-") return null;
    
    if (s.includes(":")) {
      var parts = s.split(":").map(Number);
      return (parts[0] || 0) + (parts[1] || 0) / 60;
    }
    
    var n = parseFloat(s);
    if (!isNaN(n)) {
      // Aviation format check: if it has a dot and the part after the dot is <= 59, 
      // it might be HH.MM instead of decimal hours.
      // E.g. 1.30 -> 1:30 (1.5 hours)
      // We apply this heuristic if it's not a Bell-429/B-360 etc. which explicitly use decimals.
      var cleanTip = (aircraftType || "").toUpperCase().replace(/[\s-]/g, "");
      var isDecimalType = cleanTip.indexOf("B360") !== -1 || 
                          cleanTip.indexOf("C650") !== -1 || 
                          cleanTip.indexOf("BELL") !== -1 ||
                          cleanTip.indexOf("B429") !== -1;
      
      if (!isDecimalType && s.includes(".")) {
        var dotParts = s.split(".");
        var mins = parseInt(dotParts[1]);
        if (mins >= 0 && mins <= 59 && dotParts[1].length <= 2) {
           return (parseInt(dotParts[0]) || 0) + (mins / 60);
        }
      }
      return n;
    }
  }
  return null;
}

function sendDailyReports() {
  var ss =
    SpreadsheetApp.getActiveSpreadsheet() ||
    SpreadsheetApp.openById("1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg");
  var mailSheet = findSheet(ss, "mail log");
  if (!mailSheet) return;

  var lastCol = mailSheet.getLastColumn();
  var headers = mailSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var lastSentIdx = -1;
  for (var h = 0; h < headers.length; h++) {
    if (headers[h].toString().toUpperCase().includes("SON GÖNDERİM")) {
      lastSentIdx = h;
      break;
    }
  }

  if (lastSentIdx === -1) {
    mailSheet
      .getRange(1, lastCol + 1)
      .setValue("SON GÖNDERİM")
      .setFontWeight("bold");
    headers.push("SON GÖNDERİM");
    lastSentIdx = headers.length - 1;
  }

  var data = mailSheet.getDataRange().getDisplayValues();
  var now = new Date();
  var timeZone = "GMT+3";
  var daysTR = [
    "PAZAR",
    "PAZARTESİ",
    "SALI",
    "ÇARŞAMBA",
    "PERŞEMBE",
    "CUMA",
    "CUMARTESİ",
  ];
  var todayStr = Utilities.formatDate(now, timeZone, "yyyy-MM-dd");
  var currentTime = Utilities.formatDate(now, timeZone, "HH:mm");

  var d = new Date();
  var currentDay = daysTR[d.getDay()];

  for (var i = 1; i < data.length; i++) {
    var recipient = {};
    for (var j = 0; j < headers.length; j++) {
      recipient[headers[j]] = data[i][j];
    }

    var type = (
      recipient["MAİL GÖNDERME TÜRÜ"] ||
      recipient["TÜR"] ||
      recipient["Tür"] ||
      ""
    ).toUpperCase();
    var days = (
      recipient["GÜN SEÇENEĞİ"] ||
      recipient["GÜNLER"] ||
      recipient["Günler"] ||
      ""
    ).toUpperCase();
    var time = recipient["SAAT"] || recipient["Saat"];
    
    // --- 1. KİLİT MEKANİZMASI ---
    var lastSentValue = data[i][lastSentIdx] ? String(data[i][lastSentIdx]).trim() : "";
    if (lastSentValue === todayStr) continue;

    if (type.includes("OTOMAT")) {
      var shouldSend = days.includes("HER") || days.includes(currentDay);
      if (shouldSend && time) {
        var tMin = timeToMinutes(time);
        var cMin = timeToMinutes(currentTime);
        var diff = cMin - tMin;
        
        // --- 2. ZAMAN KONTROLÜ ---
        if (diff >= 0 && diff <= 10) {
          sendReportEmail(recipient, [], ss);
          
          // --- 3. DAMGALAMA ---
          mailSheet.getRange(i + 1, lastSentIdx + 1).setValue("'" + todayStr);
          SpreadsheetApp.flush();
        }
      }
    }
  }
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  var parts = String(timeStr).split(":");
  return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
}

function setupAutoMailTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendDailyReports")
      ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("sendDailyReports")
    .timeBased()
    .everyMinutes(15)
    .create();
  return "Otomatik mail tetikleyicisi kuruldu (15 dk).";
}

function setupMidnightTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "performDailyMidnightLogging")
      ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("performDailyMidnightLogging")
    .timeBased()
    .atHour(0)
    .nearMinute(5)
    .everyDays(1)
    .create();
  return "Gece yarısı loglama tetikleyicisi kuruldu (00:05).";
}

function debugAutoMail() {
  var now = new Date();
  var timeZone = "GMT+3";
  var daysTR = [
    "PAZAR",
    "PAZARTESİ",
    "SALI",
    "ÇARŞAMBA",
    "PERŞEMBE",
    "CUMA",
    "CUMARTESİ",
  ];
  return (
    "Zaman: " +
    Utilities.formatDate(now, timeZone, "HH:mm") +
    ", Gün: " +
    daysTR[now.getDay()]
  );
}

function performDailyMidnightLogging() {
  var ss =
    SpreadsheetApp.getActiveSpreadsheet() ||
    SpreadsheetApp.openById("1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg");
  var logSheet = findSheet(ss, "Envanter Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Envanter Log");
    logSheet.appendRow([
      "ID",
      "Tarih",
      "Kuyruk No",
      "Tip",
      "Gövde Uçuş Saati",
      "Faydalı Saat",
      "Konum",
      "Durum",
      "Durum Ayrıntısı",
      "Açıklama",
    ]);
  }

  var faalLogSheet = findSheet(ss, "Faaliyet Log");
  if (!faalLogSheet) {
    faalLogSheet = ss.insertSheet("Faaliyet Log");
    faalLogSheet.appendRow([
      "ID",
      "Tarih",
      "Kuyruk No",
      "Tip",
      "Durum",
      "Analiz Kodu",
    ]);
  }

  var fleetData = getFleetDataFromServer();
  var dateStr = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd.MM.yyyy",
  );

  // Cache full data for de-duplication and change detection
  var lastRowLog = logSheet.getLastRow();
  var logFullData = lastRowLog > 1 ? logSheet.getRange(1, 1, lastRowLog, 10).getValues() : [];
  var logMap = {};
  logFullData.forEach(function(row, idx) {
    logMap[String(row[0]).trim()] = { row: idx + 1, data: row };
  });

  var lastRowFaal = faalLogSheet.getLastRow();
  var faalFullData = lastRowFaal > 1 ? faalLogSheet.getRange(1, 1, lastRowFaal, 6).getValues() : [];
  var faalMap = {};
  faalFullData.forEach(function(row, idx) {
    faalMap[String(row[0]).trim()] = { row: idx + 1, data: row };
  });

  fleetData.forEach(function (item) {
    var id = dateStr + "_" + item.kuyrukNo;
    
    var faydaliVal = item.faydaliSaat;
    if (typeof faydaliVal === 'string') faydaliVal = parseFloat(faydaliVal.replace(',', '.')) || 0;

    // Values for Log
    var newLogValues = [
      id,
      dateStr,
      item.kuyrukNo,
      item.tip,
      "", // Placeholder for govde - set via setLogTimeValue
      faydaliVal,
      item.konum,
      item.durum,
      item.durumAyrintisi,
      item.aciklama ? "'" + String(item.aciklama) : "",
    ];

    // De-duplicate Envanter Log
    if (!logMap[id]) {
      logSheet.appendRow(newLogValues);
      var lastR = logSheet.getLastRow();
      setLogTimeValue(logSheet, lastR, 5, item.govdeUcusSaati, item.tip);
      logSheet.getRange(lastR, 6).setNumberFormat("0.0#");
      logSheet.getRange(lastR, 10).setNumberFormat("@");
      logMap[id] = { row: lastR, data: newLogValues };
    } else {
      var entry = logMap[id];
      var targetRow = entry.row;
      var existingData = entry.data;

      var hasChanged = false;
      // Check for changes (Tip to Aciklama)
      for (var i = 3; i < 10; i++) { 
         if (i === 4) continue; // Govde handled separately
         var existingVal = String(existingData[i] || "");
         var newVal = String(newLogValues[i] || "");
         if (i === 9 && newVal.indexOf("'") === 0) newVal = newVal.substring(1);
         if (i === 9 && existingVal.indexOf("'") === 0) existingVal = existingVal.substring(1);

         if (existingVal !== newVal) {
           hasChanged = true;
           break;
         }
      }
      
      // Also check Govde
      if (formatToHHMM(existingData[4]) !== formatToHHMM(item.govdeUcusSaati)) hasChanged = true;

      if (hasChanged) {
        logSheet.getRange(targetRow, 1, 1, 4).setValues([[id, dateStr, item.kuyrukNo, item.tip]]);
        logSheet.getRange(targetRow, 6, 1, 5).setValues([[
          faydaliVal,
          item.konum,
          item.durum,
          item.durumAyrintisi,
          item.aciklama ? "'" + String(item.aciklama) : ""
        ]]);
        setLogTimeValue(logSheet, targetRow, 5, item.govdeUcusSaati, item.tip);
        logSheet.getRange(targetRow, 6).setNumberFormat("0.0#");
        logSheet.getRange(targetRow, 10).setNumberFormat("@");
      }
    }

    // De-duplicate Faaliyet Log
    var targetFaalEntry = faalMap[id];
    var analysisCode = item.analizKodu || '?';
    
    var newFaalValues = [
      id,
      dateStr,
      item.kuyrukNo,
      item.tip,
      item.durumAyrintisi,
      analysisCode,
    ];

    if (!targetFaalEntry) {
      faalLogSheet.appendRow(newFaalValues);
      faalMap[id] = { row: faalLogSheet.getLastRow(), data: newFaalValues };
    } else {
      var entry = targetFaalEntry;
      var targetRow = entry.row;
      var existingData = entry.data;

      var hasChanged = false;
      for (var i = 3; i < 6; i++) {
        if (String(existingData[i] || "").trim().toUpperCase() !== String(newFaalValues[i] || "").trim().toUpperCase()) {
          hasChanged = true;
          break;
        }
      }

      if (hasChanged) {
        faalLogSheet.getRange(targetRow, 1, 1, 6).setValues([newFaalValues]);
      }
    }
  });
}

function getFleetDataFromServer() {
  var configs = [
    {
      type: "Bell-429",
      id: "1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ",
      mapping: {
        kuyrukNo: "A3:A8",
        konum: "L3:L8",
        durum: "M3:M8",
        durumAyrintisi: "N3:N8",
        faydaliSaat: "I3:I8",
        aciklama: "O3:O8",
        govdeUcusSaati: "E3:E8",
      },
    },
    {
      type: "AT-802",
      id: "1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4",
      mapping: {
        kuyrukNo: "B3:B50",
        durum: "C3:C50",
        durumAyrintisi: "D3:D50",
        konum: "E3:E50",
        faydaliSaat: "V3:AI50",
        govdeUcusSaati: "F3:F50",
        aciklama: "AL3:AL50",
      },
    },
    {
      type: "T-70",
      id: "10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw",
      mapping: {
        kuyrukNo: "A4:A10",
        faydaliSaat: "L4:O10", // Includes 40H, 120H, 480H remainders (L, N, O columns)
        konum: "P4:P10",
        durum: "Q4:Q10",
        durumAyrintisi: "R4:R10",
        bakimTakvimTarih: "K4:K10",
        bakim40H: "H4:H10",
        bakim120H: "I4:I10",
        bakim480H: "J4:J10",
        aciklama: "S4:S10",
        govdeUcusSaati: "E4:E10",
      },
    },
    {
      type: "B-360",
      id: "1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0",
      mapping: {
        kuyrukNo: "A3:A10",
        faydaliSaat: "I3:I10",
        konum: "M3:M10",
        durum: "N3:N10",
        durumAyrintisi: "O3:O10",
        aciklama: "P3:P10",
        govdeUcusSaati: "E3:E10",
      },
    },
    {
      type: "C-650",
      id: "1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE",
      mapping: {
        kuyrukNo: "A3:A10",
        faydaliSaat: "I3:I10",
        konum: "M3:M10",
        durum: "N3:N10",
        durumAyrintisi: "O3:O10",
        aciklama: "P3:P10",
        govdeUcusSaati: "E3:E10",
      },
    },
  ];

  var fleet = [];
  configs.forEach(function (config) {
    try {
      var ss = SpreadsheetApp.openById(config.id);
      var sheet = ss.getSheets()[0];
      if (config.type === "AT-802") {
        sheet = ss.getSheetByName("GÜNLÜK DURUM") || sheet;
      }

      var data = {};
      for (var key in config.mapping) {
        var range = sheet.getRange(config.mapping[key]);
        if (key === "aciklama" || key === "durumAyrintisi") {
          data[key] = range.getValues(); // Raw values for text fields
        } else {
          data[key] = range.getDisplayValues();
        }
      }

      var numRows = data.kuyrukNo.length;
      var allSheets = config.type === "AT-802" ? ss.getSheets() : [];

      for (var i = 0; i < numRows; i++) {
        var kNoRaw = data.kuyrukNo[i][0];
        if (kNoRaw && String(kNoRaw).trim() !== "") {
          var kNo = String(kNoRaw).trim();
          var kNoMatch = kNo.match(/OR-\d+/i);
          if (kNoMatch) {
            kNo = kNoMatch[0].toUpperCase();
          }
          var item = { tip: config.type, kuyrukNo: kNo };
          for (var key in data) {
            if (key === "kuyrukNo") {
              item[key] = kNo; // Use cleaned tail number
            } else if (
              key === "faydaliSaat" &&
              Array.isArray(data[key][i]) &&
              data[key][i].length > 1
            ) {
              // Special handling for T-70 and AT-802 cross-cell remainders
              var cellsToProcess = data[key][i];
              
              // T-70 uses columns L (0), N (2), O (3). M (1) is skipped.
              if (config.type === "T-70") {
                cellsToProcess = [cellsToProcess[0], cellsToProcess[2], cellsToProcess[3]];
              }

              var zeroFound = false;
              var validHours = cellsToProcess
                .map(function (cell) {
                  var h = parseSingleCellToHour(cell, config.type);
                  if (h === 0) zeroFound = true;
                  return h;
                })
                .filter(function (h) {
                  return h !== null;
                });
              
              if (config.type === "T-70" && zeroFound) {
                item[key] = 0; // If any maintenance is 0:00, the available flight hours are 0
              } else {
                item[key] =
                  validHours.length > 0 ? Math.min.apply(null, validHours) : 0;
              }
            } else {
              var val = data[key][i];
              item[key] = val.length === 1 ? val[0] : val;
              if (key === "aciklama" || key === "durumAyrintisi") {
                item[key] = String(item[key]); // Force string
              }
            }
          }

          // AT-802 için gövde uçuş saati zaten mapping üzerinden okundu
          if (config.type === "AT-802" && (!item.govdeUcusSaati || item.govdeUcusSaati === "-" || item.govdeUcusSaati === "0")) {
            var techSheet = getTechSheet(allSheets, kNo);
            if (techSheet) {
              var techGovdeSaat = techSheet.getRange("B11").getDisplayValue();
              if (techGovdeSaat && techGovdeSaat !== "" && techGovdeSaat !== "-") {
                item.govdeUcusSaati = techGovdeSaat;
              }
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

/**
 * Formatted Excel Generation for Envanter - High Quality Output for Emails
 */
function generateFormattedEnvanterExcel(ssId) {
  try {
    // Fetch fresh data from all platforms
    var platformConfigs = [
      { type: 'C-650', id: '1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE', range: 'A3:P20', map: {kNo:0, durum:13, detail:14, desc:15, loc:12, gHour:4, fHour:8} },
      { type: 'B-360', id: '1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0', range: 'A3:P20', map: {kNo:0, durum:13, detail:14, desc:15, loc:12, gHour:4, fHour:8} },
      { type: 'Bell-429', id: '1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ', range: 'A3:O30', map: {kNo:0, durum:12, detail:13, desc:14, loc:11, gHour:4, fHour:8} },
      { type: 'AT-802', id: '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4', sheet: 'GÜNLÜK DURUM', range: 'B3:AL200', map: {kNo:0, durum:1, detail:2, desc:36, loc:3, gHour:4, fHourStart:20, fHourEnd:33} },
      { type: 'T-70', id: '10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw', range: 'A4:S30', map: {kNo:0, durum:16, detail:17, desc:18, loc:15, gHour:4, fHour:13} }
    ];

    var fleetData = [];
    platformConfigs.forEach(function(config) {
      try {
        var pSs = SpreadsheetApp.openById(config.id);
        var pSheet = config.sheet ? pSs.getSheetByName(config.sheet) : pSs.getSheets()[0];
        var displayValues = pSheet.getRange(config.range).getDisplayValues();
        var rawValues = pSheet.getRange(config.range).getValues();
        
        displayValues.forEach(function(row, rIdx) {
          var kNo = String(row[config.map.kNo] || "").trim();
          var durum = String(row[config.map.durum] || "").trim();
          
          // Skip empty or placeholder rows
          if (kNo === "" || kNo.toUpperCase().indexOf("XX") !== -1) return;
          if (durum === "" || durum === "-") return;

          var cagriKodu = getCallSignByTail(kNo.match(/OR-\d+/i) ? kNo.match(/OR-\d+/i)[0].toUpperCase() : kNo);
          if (String(cagriKodu || "").toUpperCase().indexOf("XX") !== -1) return;

          if (kNo && kNo.trim() !== "") {
            var faydaliSaatFormatted = "-";
            if (config.type === 'AT-802') {
              var minVal = null;
              for (var c = config.map.fHourStart; c <= config.map.fHourEnd; c++) {
                var p = parseSingleCellToHour(displayValues[rIdx][c], config.type);
                if (p === null) p = parseSingleCellToHour(rawValues[rIdx][c], config.type);
                if (p !== null && (minVal === null || p < minVal)) minVal = p;
              }
              faydaliSaatFormatted = formatToHHMM(minVal, config.type);
            } else if (config.type === 'T-70') {
              var minVal = null;
              var t70Cols = [11, 13, 14]; // Columns L (11), N (13), O (14)
              for (var i = 0; i < t70Cols.length; i++) {
                var c = t70Cols[i];
                var p = parseSingleCellToHour(displayValues[rIdx][c], config.type);
                if (p === null) p = parseSingleCellToHour(rawValues[rIdx][c], config.type);
                if (p !== null && (minVal === null || p < minVal)) minVal = p;
              }
              faydaliSaatFormatted = formatToHHMM(minVal, config.type);
            } else {
              var p = parseSingleCellToHour(displayValues[rIdx][config.map.fHour], config.type);
              if (p === null) p = parseSingleCellToHour(rawValues[rIdx][config.map.fHour], config.type);
              faydaliSaatFormatted = formatToHHMM(p, config.type);
            }

            fleetData.push({
              kuyrukNo: kNo,
              cagriKodu: getCallSignByTail(kNo.match(/OR-\d+/i) ? kNo.match(/OR-\d+/i)[0].toUpperCase() : kNo),
              tip: config.type,
              durum: row[config.map.durum],
              durumAyrintisi: row[config.map.detail],
              aciklama: row[config.map.desc],
              konum: row[config.map.loc],
              govdeUcusSaati: row[config.map.gHour],
              faydaliSaat: faydaliSaatFormatted
            });
          }
        });
      } catch (e) {
        console.error("Error fetching " + config.type + ": " + e.toString());
      }
    });

    if (fleetData.length === 0) return null;

    // Sorting
    var typeOrder = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
    fleetData.sort(function(a, b) {
      var iA = typeOrder.indexOf(a.tip);
      var iB = typeOrder.indexOf(b.tip);
      if (iA !== iB) return iA - iB;
      var getOrd = function(c) { var m = String(c).match(/ORMAN-(\d+)/i); return m ? parseInt(m[1]) : 999; };
      return getOrd(a.cagriKodu) - getOrd(b.cagriKodu);
    });

    var tempSs = SpreadsheetApp.create("Envanter_Raporu_Temp");
    var tempSheet = tempSs.getSheets()[0];
    
    var tariStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy");
    
    // Set Font to Arial for all potential content cells
    tempSheet.getRange("A1:I250").setFontFamily("Arial");

    // Date Row (Merged H2:I2 for 9-column layout alignment)
    tempSheet.getRange("H2:I2").merge().setValue(tariStr).setFontColor("#dc2626").setFontWeight("bold").setHorizontalAlignment("right").setFontSize(14);
    
    // Title Row (Merged A2:G2)
    tempSheet.getRange("A2:G2").merge().setValue("ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(16).setFontColor("#1f2937");
    
    // Header Row (9 Columns to perfectly match standard status report)
    var headers = ["SIRA NO", "ÇAĞRI KODU", "KUYRUK NUMARASI", "GÖVDE SAATİ", "DURUM", "DURUM AYRINTISI", "KONUM", "FAYDALI SAAT", "AÇIKLAMA"];
    var headerRange = tempSheet.getRange("A3:I3");
    headerRange.setValues([headers]).setBackground("#d9d9d9").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle").setFontSize(10).setFontColor("black");
    tempSheet.setRowHeight(3, 30);

    var startRow = 4;
    fleetData.forEach(function(item, idx) {
      var currentRow = startRow + idx;
      
      // Calculate dynamic row height based on description text length to prevent clipping of description text
      var textToMeasure = item.aciklama || "";
      var textLines = textToMeasure.split("\n");
      var calculatedLinesCount = 0;
      textLines.forEach(function(line) {
        calculatedLinesCount += Math.max(1, Math.ceil(line.length / 75));
      });
      var calculatedHeight = Math.max(25, calculatedLinesCount * 14 + 10);
      tempSheet.setRowHeight(currentRow, calculatedHeight);
      
      var kNo = item.kuyrukNo;
      var cagriKodu = item.cagriKodu;
      
      var durumStr = String(item.durum || "").toUpperCase();
      var isFaal = durumStr.indexOf("FAAL") !== -1 && durumStr.indexOf("GAYRİ") === -1 && durumStr.indexOf("GAYRI") === -1;
      var durumText = item.durum ? String(item.durum).toUpperCase() : (isFaal ? "FAAL" : "GAYRİ FAAL");
      
      var abbr = getAbbreviation(kNo);
      var faydaliSaatFormatted = item.faydaliSaat; // Already formatted as string
      
      // Rich text with abbreviation in red and bold
      var kNoValue = SpreadsheetApp.newRichTextValue()
        .setText(kNo + abbr)
        .build();
      
      if (abbr) {
        kNoValue = SpreadsheetApp.newRichTextValue()
          .setText(kNo + abbr)
          .setTextStyle(kNo.length, (kNo + abbr).length, SpreadsheetApp.newTextStyle().setForegroundColor("#dc2626").setBold(true).build())
          .build();
      }

      var rowData = [
        idx + 1,               // SIRA NO
        cagriKodu,             // ÇAĞRI KODU
        "",                    // Placeholder for Kuyruk Numarası
        (!item.govdeUcusSaati || item.govdeUcusSaati === "-" || item.govdeUcusSaati === "0" || item.govdeUcusSaati === "") ? "-" : formatToHHMM(item.govdeUcusSaati, item.tip), // GÖVDE SAATİ
        durumText,             // DURUM
        item.durumAyrintisi && item.durumAyrintisi !== "-" ? String(item.durumAyrintisi).toUpperCase() : "", // DURUM AYRINTISI
        String(item.konum || "").toUpperCase(), // KONUM
        faydaliSaatFormatted,  // FAYDALI SAAT
        item.aciklama          // AÇIKLAMA
      ];
      
      var range = tempSheet.getRange(currentRow, 1, 1, 9);
      range.setValues([rowData]);
      range.setBorder(true, true, true, true, true, true);
      range.setVerticalAlignment("middle").setHorizontalAlignment("center").setFontSize(10);
      
      // Set Rich Text for Kuyruk No with styling
      tempSheet.getRange(currentRow, 3).setRichTextValue(kNoValue).setFontWeight("bold").setFontColor("#111827");
      
      // Style specific columns
      tempSheet.getRange(currentRow, 1).setFontWeight("bold").setFontColor("#111827");
      tempSheet.getRange(currentRow, 2).setFontWeight("bold").setFontColor("#111827");
      
      // Govde Saati Style (#FF6B00, bold, size 12)
      tempSheet.getRange(currentRow, 4).setNumberFormat("@").setFontWeight("bold").setFontColor("#FF6B00").setFontSize(12);
      
      // Durum Cell Background & Typography color
      var durumCell = tempSheet.getRange(currentRow, 5);
      if (isFaal) {
        durumCell.setBackground("#e8f5e9").setFontColor("#2e7d32").setFontWeight("bold");
      } else {
        durumCell.setBackground("#ffebee").setFontColor("#c62828").setFontWeight("bold");
      }
      
      tempSheet.getRange(currentRow, 6).setFontWeight("bold").setFontColor("#111827");
      tempSheet.getRange(currentRow, 7).setFontWeight("bold").setFontColor("#111827");
      
      // Faydali Saat Style (#1a73e8, bold, size 12)
      var faydaliCell = tempSheet.getRange(currentRow, 8);
      faydaliCell.setNumberFormat("@").setFontColor("#1a73e8").setFontWeight("bold").setFontSize(12);
      
      // Aciklama Cell (left aligned, italic, small, wrapped, top-aligned)
      var aciklamaCell = tempSheet.getRange(currentRow, 9);
      aciklamaCell.setFontStyle("italic").setFontSize(9).setFontColor("#4b5563").setHorizontalAlignment("left").setVerticalAlignment("top").setWrap(true);
    });
    
    var lastDataRow = startRow + fleetData.length;
    var footerRow = lastDataRow + 2;
    
    tempSheet.getRange(footerRow, 1, 1, 9).merge().setValue("KISALTMALAR:").setFontWeight("bold").setFontSize(11);
    tempSheet.getRange(footerRow + 1, 1, 1, 9).merge().setValue("H: HELİTAK  |  SA: SINGLE AMFİBİ  |  DA: DUAL AMFİBİ  |  SL: SINGLE LAND  |  DL: DUAL LAND")
      .setFontWeight("bold")
      .setFontSize(10)
      .setFontColor("#dc2626");

    // Set precise column widths to prevent cell overflows or clipping
    tempSheet.setColumnWidth(1, 65);   // SIRA NO
    tempSheet.setColumnWidth(2, 110);  // ÇAĞRI KODU
    tempSheet.setColumnWidth(3, 140);  // KUYRUK NUMARASI
    tempSheet.setColumnWidth(4, 110);  // GÖVDE SAATİ
    tempSheet.setColumnWidth(5, 110);  // DURUM
    tempSheet.setColumnWidth(6, 145);  // DURUM AYRINTISI
    tempSheet.setColumnWidth(7, 120);  // KONUM
    tempSheet.setColumnWidth(8, 110);  // FAYDALI SAAT
    tempSheet.setColumnWidth(9, 450);  // AÇIKLAMA

    // Thick border style for the headers
    headerRange.setBorder(true, true, true, true, true, true, "solid_medium", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    SpreadsheetApp.flush();

    var url = "https://docs.google.com/spreadsheets/d/" + tempSs.getId() + "/export?format=xlsx";
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    var blob = response.getBlob().setName("ENVANTER RAPORU.xlsx");
    DriveApp.getFileById(tempSs.getId()).setTrashed(true);
    return blob;
  } catch (e) {
    console.error("Envanter Excel Error: " + e.toString());
    return null;
  }
}

function generateFormattedFaaliyetExcel(ssId) {
  try {
    var ss = SpreadsheetApp.openById(ssId);
    var logSheet = findSheet(ss, "Faaliyet Log");
    if (!logSheet) return null;

    var tempSs = SpreadsheetApp.create("Faaliyet_Cizelgesi_Temp");
    var tempSheet = tempSs.getSheets()[0];
    var data = logSheet.getDataRange().getDisplayValues();
    var dates = [], aircrafts = [], grid = {}, aircraftInfo = {};

    for (var i = 1; i < data.length; i++) {
      var d = data[i][1], k = data[i][2], tip = data[i][3], c = data[i][5];
      if (dates.indexOf(d) === -1) dates.push(d);
      if (aircrafts.indexOf(k) === -1) {
        aircrafts.push(k);
        aircraftInfo[k] = { tip: tip, cagri: getCallSignByTail(k) };
      }
      if (!grid[k]) grid[k] = {};
      grid[k][d] = c;
    }
    
    dates.sort(function(a, b) {
      var pA = a.split('.'), pB = b.split('.');
      return new Date(pA[2], pA[1]-1, pA[0]) - new Date(pB[2], pB[1]-1, pB[0]);
    });
    
    var typeOrder = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
    aircrafts.sort(function(a, b) {
      var iA = typeOrder.indexOf(aircraftInfo[a].tip), iB = typeOrder.indexOf(aircraftInfo[b].tip);
      if (iA !== iB) return iA - iB;
      return aircraftInfo[a].cagri.localeCompare(aircraftInfo[b].cagri);
    });

    var h1 = ["KUYRUK NO", "ÇAĞRI KODU", "HAVA ARACI TİPİ"];
    dates.forEach(function(d) { h1.push(d); });
    h1.push("TOPLAM G.FAAL", "", "", "TOPLAM G.FAAL", "TOPLAM FAAL", "FAALİYET %");
    
    tempSheet.getRange(1, 1, 1, h1.length).setValues([h1]);
    tempSheet.getRange(1, 1, 2, 3).mergeVertically().setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    tempSheet.getRange(1, 4, 2, dates.length).mergeVertically().setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    for (var c = 4; c < 4 + dates.length; c++) tempSheet.getRange(1, c).setTextRotation(90);

    var sCol = 4 + dates.length;
    tempSheet.getRange(1, sCol, 1, 3).merge().setValue("TOPLAM G.FAAL").setBackground("#00b0f0").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center");
    tempSheet.getRange(1, sCol + 3, 2, 1).merge().setValue("TOPLAM G.FAAL").setBackground("#00b0f0").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    tempSheet.getRange(1, sCol + 4, 2, 1).merge().setValue("TOPLAM FAAL").setBackground("#ffc000").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    tempSheet.getRange(1, sCol + 5, 2, 1).merge().setValue("FAALİYET %").setBackground("#f3f4f6").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");

    var h2 = ["", "", ""];
    dates.forEach(function() { h2.push(""); });
    h2.push("Bakım", "Arıza", "Olmadığı", "", "", "");
    tempSheet.getRange(2, 1, 1, h2.length).setValues([h2]);
    tempSheet.getRange(2, sCol).setBackground("#ffff00").setFontWeight("bold");
    tempSheet.getRange(2, sCol+1).setBackground("#ff0000").setFontColor("white").setFontWeight("bold");
    tempSheet.getRange(2, sCol+2).setBackground("#7030a0").setFontColor("white").setFontWeight("bold");

    aircrafts.forEach(function(k, idx) {
      var r = 3 + idx, info = aircraftInfo[k], row = [k + getAbbreviation(k), info.cagri, info.tip];
      var b = 0, a = 0, o = 0, f = 0;
      dates.forEach(function(d) {
        var c = grid[k][d] || ""; row.push(c === "F" ? "" : c);
        if (['B', 'BB', 'KM'].indexOf(c) !== -1) b++;
        else if (['A', 'PB', 'KK'].indexOf(c) !== -1) a++;
        else if (c === 'X') o++;
        else if (c === 'F') f++;
      });
      var totalGF = b + a + o, valDays = dates.length - o;
      var perc = valDays > 0 ? Math.round(((valDays - (b + a)) / valDays) * 100) : 0;
      row.push(b, a, o, totalGF, f, perc + "%");
      tempSheet.getRange(r, 1, 1, row.length).setValues([row]).setBorder(true, true, true, true, true, true);
      for (var c = 0; c < dates.length; c++) {
        var cell = tempSheet.getRange(r, 4 + c), val = cell.getValue();
        if (['B', 'BB', 'KM'].indexOf(val) !== -1) cell.setBackground("#ffff00");
        else if (['A', 'PB', 'KK'].indexOf(val) !== -1) cell.setBackground("#ff0000").setFontColor("white");
        else if (val === 'X') cell.setBackground("#7030a0").setFontColor("white");
      }
    });

    tempSheet.autoResizeColumns(1, h1.length);
    SpreadsheetApp.flush();
    var url = "https://docs.google.com/spreadsheets/d/" + tempSs.getId() + "/export?format=xlsx";
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    var blob = response.getBlob().setName("Faaliyet_Cizelgesi.xlsx");
    DriveApp.getFileById(tempSs.getId()).setTrashed(true);
    return blob;
  } catch (e) {
    console.error("Faaliyet Excel Error: " + e.toString());
    return null;
  }
}

function getAbbreviation(kuyrukNo) {
  var t = String(kuyrukNo).trim().toUpperCase();
  if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].indexOf(t) !== -1) return ' (DA)';
  if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].indexOf(t) !== -1) return ' (SA)';
  if (t === 'OR-2036') return ' (DL)';
  if (t === 'OR-2038') return ' (SL)';
  if (t === 'OR-1020') return ' (H)';
  return '';
}

function getMailRecipientsGS(ss) {
  var mailSheet = findSheet(ss, "mail log");
  if (!mailSheet) return [];
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
  return recipients;
}

function doGet() {
  return ContentService.createTextOutput("OGM Servis Aktif.");
}

function setLogTimeValue(sheet, row, col, value, tip) {
  var range = sheet.getRange(row, col);
  if (value === null || value === undefined || value === "") {
    range.setValue("");
    return;
  }
  var valStr = String(value).trim();
  var tipUpper = (tip || "").toUpperCase();
  
  var cleanTip = tipUpper.replace(/[\s-]/g, "");
  var isDecimalType = cleanTip.indexOf("B360") !== -1 || 
                      cleanTip.indexOf("C650") !== -1 || 
                      cleanTip.indexOf("BELL") !== -1 ||
                      cleanTip.indexOf("B429") !== -1;

  // PRIORITY: If the value is a number (float), treat it according to aircraft preference
  if (!valStr.includes(":") && (valStr.includes(",") || valStr.includes(".") || /^\d+(\.\d+)?$/.test(valStr))) {
    var n = parseFloat(valStr.replace(",", "."));
    if (!isNaN(n)) {
      if (isDecimalType) {
        range.setValue(n);
        range.setNumberFormat("#,##0.0#");
      } else {
        // Standard aviation types (T-70, AT-802) store as days for [h]:mm formatting
        range.setValue(n / 24);
        range.setNumberFormat("[h]:mm");
      }
      return;
    }
  }

  if (isDecimalType) {
    var n;
    if (valStr.includes(',') && valStr.includes('.')) {
      n = parseFloat(valStr.replace(/\./g, "").replace(',', '.'));
    } else if (valStr.includes(',')) {
      n = parseFloat(valStr.replace(',', '.'));
    } else if (valStr.includes(':')) {
      var parts = valStr.split(':').map(Number);
      n = (parts[0] || 0) + (parts[1] || 0) / 60;
    } else {
      n = parseFloat(valStr);
    }
    
    if (!isNaN(n)) {
      range.setValue(n);
      range.setNumberFormat("#,##0.0#");
      return;
    }
  }

  // Duration based parsing for [h]:mm types
  if (/^\d+:\d{2}(:\d{2})?$/.test(valStr)) {
    var parts = valStr.split(':');
    var hours = parseInt(parts[0], 10);
    var mins = parseInt(parts[1], 10);
    var secs = parts.length > 2 ? parseInt(parts[2], 10) : 0;
    var decimalValue = (hours + (mins / 60) + (secs / 3600)) / 24;
    range.setValue(decimalValue);
    range.setNumberFormat("[h]:mm");
  } else {
    var n = parseFloat(String(value).replace(',', '.'));
    if (!isNaN(n)) {
      range.setValue(n / 24);
      range.setNumberFormat("[h]:mm");
    } else {
      range.setValue(value);
    }
  }
}
