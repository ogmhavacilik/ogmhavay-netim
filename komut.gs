/**
 * OGM HAVACILIK - GENEL VERİ ÇEKME SCRİPTİ (V6 - ABSOLUTE ISOLATION)
 * Bu sürümde filtreleme "Tam Eşleşme" esasına dayanır.
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return jsonError("Post verisi alınamadı.");
    var params = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(params.sheetId);
    var action = (params.action || "getAircraftData").toString().trim();
    var logSsId = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg";

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
          // Önemli: 'indexOf' yerine '===' kullanıyoruz. 
          // Böylece "OR2021" ararken içinde "20" geçen "OR2023" asla gelmez.
          if (cleanB !== cleanSearch && cleanC !== cleanSearch) {
             continue; 
          }
        } else {
          // Arama yoksa ve satır tamamen boşsa (sahipsizse) atla
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
            // Tabloya her zaman güncel (merged ise üstten gelen) sahip ismini yaz
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
    // 🟠 AKSİYON: GÜN İÇİ FAALİYET KAYDI
    // -----------------------------------------------------
    if (action === "saveIntraDayActivity") {
      var logSs = SpreadsheetApp.openById(logSsId);
      var logSheet = findSheet(logSs, "Saatlik Faaliyet Günlüğü");
      if (!logSheet) {
        logSheet = logSs.insertSheet("Saatlik Faaliyet Günlüğü");
        logSheet.appendRow(["ID", "TARİH", "KUYRUK NO", "TİP", "BAŞLANGIÇ SAATİ", "BİTİŞ SAATİ", "DURUM", "AÇIKLAMA", "KAYIT TARİHİ"]);
        logSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fce5cd").setBorder(true, true, true, true, true, true);
      }
      
      var id = params.id || Utilities.getUuid();
      var tarih = params.tarih || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy");
      var kNo = params.kuyrukNo || "";
      var tip = params.tip || "";
      var bSaat = params.baslangicSaati || "";
      var bitSaat = params.bitisSaati || "";
      var durum = params.durum || "";
      var aciklama = params.aciklama || "";
      var kayitTarihi = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy HH:mm:ss");

      logSheet.appendRow([id, tarih, kNo, tip, bSaat, bitSaat, durum, aciklama, kayitTarihi]);
      return jsonSuccess({ id: id });
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

    if (action === "cleanupAllLogs") {
      var logSs = SpreadsheetApp.openById(logSsId);
      var logSheet = findSheet(logSs, "Envanter Log");
      var faalLogSheet = findSheet(logSs, "Faaliyet Log");
      var cleanupResult = "Cleanup completed: ";

      var normalizeDate = function(d) {
        if (!d) return "";
        if (d instanceof Date) return Utilities.formatDate(d, "GMT+3", "dd.MM.yyyy");
        var s = String(d).trim();
        if (s.includes('-')) {
          var p = s.split('-');
          if (p[0].length === 4) return p[2] + "." + p[1] + "." + p[0];
        }
        return s;
      };

      if (logSheet) {
        var data = logSheet.getDataRange().getValues();
        var seen = {};
        var toDelete = [];
        for (var i = data.length - 1; i >= 1; i--) {
          var date = normalizeDate(data[i][1]);
          var tail = String(data[i][2]).trim().toUpperCase();
          if (!date || !tail) continue;
          var key = date + "_" + tail;
          if (seen[key]) {
            toDelete.push(i + 1);
          } else {
            seen[key] = true;
          }
        }
        toDelete.sort(function(a, b) { return b - a; });
        toDelete.forEach(function(row) { logSheet.deleteRow(row); });
        cleanupResult += "Envanter Log: " + toDelete.length + " removed. ";
      }

      if (faalLogSheet) {
        var data = faalLogSheet.getDataRange().getValues();
        var seen = {};
        var toDelete = [];
        for (var i = data.length - 1; i >= 1; i--) {
          var date = normalizeDate(data[i][1]);
          var tail = String(data[i][2]).trim().toUpperCase();
          if (!date || !tail) continue;
          var key = date + "_" + tail;
          if (seen[key]) {
            toDelete.push(i + 1);
          } else {
            seen[key] = true;
          }
        }
        toDelete.sort(function(a, b) { return b - a; });
        toDelete.forEach(function(row) { faalLogSheet.deleteRow(row); });
        cleanupResult += "Faaliyet Log: " + toDelete.length + " removed.";
      }
      return jsonSuccess(cleanupResult);
    }

    // 🔵 AKSİYON: FAALİYET LOGU ÇEKME
    if (action === "getFaaliyetLog") {
      var logSs = SpreadsheetApp.openById(logSsId);
      var faalLogSheet = findSheet(logSs, "Faaliyet Log");
      var intraDaySheet = findSheet(logSs, "Saatlik Faaliyet Günlüğü");

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
      var envanterSheet = findSheet(logSs, "Envanter Log");
      if (envanterSheet) {
        var envData = envanterSheet.getDataRange().getDisplayValues();
        for (var k = 1; k < envData.length; k++) {
          var eRow = envData[k];
          if (!eRow[1] && !eRow[2]) continue;

          var eTarihStr = String(eRow[1]).trim();
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
      var logSs = SpreadsheetApp.openById(logSsId);
      var faalLogSheet = findSheet(logSs, "Faaliyet Log");
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

    // 🔵 AKSİYON: TEKİL HAVA ARACI LOGLAMA
    if (action === "logSingleAircraftActivity") {
      var logSs = SpreadsheetApp.openById(logSsId);
      var aircraftData = params.data || {};
      if (!aircraftData.kuyrukNo) return jsonError("Kuyruk no eksik.");
      
      saveLogsToSheets(logSs, [aircraftData], params.date || params.tarih);
      return jsonSuccess("Log başarıyla kaydedildi.");
    }

    // 🔵 AKSİYON: TÜM FİLO LOGLAMA (App.tsx'den gelir)
    if (action === "logAllAircraftActivity") {
      var logSs = SpreadsheetApp.openById(logSsId);
      var fleetData = params.fleetData;
      if (!fleetData || !Array.isArray(fleetData)) return jsonError("Filo verisi eksik.");
      
      saveLogsToSheets(logSs, fleetData, params.date);
      return jsonSuccess("Tüm filo logları başarıyla işlendi.");
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
      return ContentService.createTextOutput(JSON.stringify(values)).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getAircraftData") {
      var sheetName = params.sheetName;
      var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı.");
      var mapping = params.mapping;
      var rawData = {};
      
      // Use getDisplayValues for everything to match what the user sees in the sheet
      // This avoids timezone shifts and duration wrapping issues
      Object.keys(mapping).forEach(function(key) {
        rawData[key] = sheet.getRange(mapping[key]).getDisplayValues();
      });
      
      var numRows = rawData.kuyrukNo.length;
      var inventoryResults = [];

      // AT-802 için Geliş Tarihi lookup tablosunu çek
      var lookupData = null;
      if (params.aircraftType === 'AT-802') {
        try {
          lookupData = {
            keys: sheet.getRange("T24:T41").getDisplayValues(),
            vals: sheet.getRange("U24:V41").getDisplayValues()
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
          // AT-802 için teknik detayları bireysel sayfalardan çek
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
                item.acTT = techSheet.getRange("B11").getDisplayValue();
                item.landings = techSheet.getRange("E11").getDisplayValue();
                item.engineStarts = techSheet.getRange("F15").getDisplayValue();
                item.engineFlights = techSheet.getRange("H15").getDisplayValue();
                
                var frdsCell = "M10";
                var motorCell = "J16:P16";
                
                if (kNo === "OR-2023") { frdsCell = "L9"; motorCell = "J15:P15"; }
                else if (kNo === "OR-2024") { frdsCell = "M7"; motorCell = "K13:Q13"; }
                else if (kNo === "OR-2025") { frdsCell = "L8"; motorCell = "J14:P14"; }
                else if (kNo === "OR-2026") { frdsCell = "L8"; motorCell = "J14:P14"; }
                else if (kNo === "OR-2027") { frdsCell = "N12"; motorCell = "K19:Q19"; }
                else if (kNo === "OR-2030") { frdsCell = "N11"; motorCell = "K17:Q17"; }
                else if (kNo === "OR-2031") { frdsCell = "N11"; motorCell = "K17:Q17"; }
                else if (kNo === "OR-2028") { frdsCell = "M8"; motorCell = "J14:P14"; }
                else if (kNo === "OR-2037") { frdsCell = "M12"; motorCell = "J18:P18"; }
                
                item.frdsTestDate = getFirstNonEmpty(techSheet, frdsCell);
                item.motorRunDate = getFirstNonEmpty(techSheet, motorCell);
              } catch (e) {
                item.techError = e.toString();
              }
            }

            // Geliş Tarihi Lookup
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

    // 🟡 SENKRONİZASYON AKSİYONU
    if (action === "sync") {
      return jsonSuccess({ message: "Senkronizasyon kanalı aktif." });
    }

    // 🟡 PDF EXPORT AKSİYONU (GÜNLÜK DURUM RAPORU)
    if (action === "exportAT802PDF") {
      try {
        var sheet = findSheet(ss, "GÜNLÜK DURUM");
        if (!sheet) return jsonError("GÜNLÜK DURUM sayfası bulunamadı.");
        
        var gid = sheet.getSheetId();
        // Range: A1:AL18 as per user request
        var url = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=pdf&gid=" + gid + "&range=A1:AL18&portrait=false&scale=4&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&gridlines=false&horizontal_alignment=CENTER&vertical_alignment=CENTER";
        
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

    // 🟡 PDF EXPORT AKSİYONU (AT-802 ÇIKTI / 100 SAAT TAKİP)
    if (action === "exportAT802CiktiPDF") {
      try {
        var sheet = findSheet(ss, "ÇIKTI");
        if (!sheet) return jsonError("ÇIKTI sayfası bulunamadı.");
        
        var gid = sheet.getSheetId();
        // A1:AM18 range as per user request - Landscape, Fit to Page, Centered
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

    // 🟡 ÖZEL VERİ ÇEKME AKSİYONU (AT-802 Step 1 için)
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
        var motorCell = "J16:P16";
        
        if (kNo === "OR-2023") { frdsCell = "L9"; motorCell = "J15:P15"; }
        else if (kNo === "OR-2024") { frdsCell = "M7"; motorCell = "K13:Q13"; }
        else if (kNo === "OR-2025") { frdsCell = "L8"; motorCell = "J14:P14"; }
        else if (kNo === "OR-2026") { frdsCell = "L8"; motorCell = "J14:P14"; }
        else if (kNo === "OR-2027") { frdsCell = "N12"; motorCell = "K19:Q19"; }
        else if (kNo === "OR-2030") { frdsCell = "N11"; motorCell = "K17:Q17"; }
        else if (kNo === "OR-2031") { frdsCell = "N11"; motorCell = "K17:Q17"; }
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


    // 🟠 GÜNCELLEME AKSİYONU
    if (action === "updateAircraftData") {
      var sheetName = params.sheetName || "";
      var sheet = findSheet(ss, sheetName) || ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı: " + sheetName);
      
      var kuyrukNo = String(params.kuyrukNo || "").trim();
      var updates = params.updates || {};
      var mapping = params.mapping || {};
      
      // AT-802 için teknik verileri "Genel" sayfasına yaz
      var isAT802 = params.aircraftType === 'AT-802' || (sheet.getName().toUpperCase().replace(/\./g, "").indexOf('GÜNLÜK DURUM') !== -1);
      
      var hasTechUpdates = updates.acTT !== undefined || 
                           updates.landings !== undefined || 
                           updates.starts !== undefined || 
                           updates.flights !== undefined || 
                           updates.frdsTest !== undefined || 
                           updates.motorCalisma !== undefined;

      if (isAT802 && hasTechUpdates) {
        var kNo = kuyrukNo;
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
          else if (kNo === "OR-2030") { frdsCell = "N11"; motorCell = "K17"; }
          else if (kNo === "OR-2031") { frdsCell = "N11"; motorCell = "K17"; }
          else if (kNo === "OR-2028") { frdsCell = "M8"; motorCell = "J14"; }
          else if (kNo === "OR-2037") { frdsCell = "M12"; motorCell = "J18"; }

          if (updates.frdsTest !== undefined) techSheet.getRange(frdsCell.split(':')[0]).setValue(updates.frdsTest);
          if (updates.motorCalisma !== undefined) {
            techSheet.getRange(motorCell.split(':')[0]).setValue(updates.motorCalisma);
          }
        }
      }
      
      // Ana sayfa için kuyruk numarasını bul
      var kuyrukNoRangeStr = mapping.kuyrukNo || "A3:A100";
      var range = sheet.getRange(kuyrukNoRangeStr);
      var displayValues = range.getDisplayValues();
      var rowIndex = -1;
      
      var startRowMatch = kuyrukNoRangeStr.match(/\d+/);
      var startRow = startRowMatch ? parseInt(startRowMatch[0]) : 3;
      
      var targetMatch = kuyrukNo.match(/OR-\d+/i);
      var targetClean = targetMatch ? targetMatch[0].toUpperCase() : kuyrukNo.toUpperCase();

      for (var i = 0; i < displayValues.length; i++) {
        var cellVal = String(displayValues[i][0] || "").trim();
        if (cellVal === "") continue;

        if (cellVal.toUpperCase() === kuyrukNo.toUpperCase()) {
          rowIndex = i + startRow;
          break;
        }
        
        // Fallback: Eğer tam eşleşme yoksa OR-XXXX kısmına bak
        var cellMatch = cellVal.match(/OR-\d+/i);
        if (cellMatch && targetMatch && cellMatch[0].toUpperCase() === targetMatch[0].toUpperCase()) {
          rowIndex = i + startRow;
          break;
        }
      }
      
      if (rowIndex === -1) {
        // Eğer hala bulunamadıysa tüm sayfada ara (Daha geniş kapsamlı)
        var fullSearchRange = sheet.getRange("A1:E100").getDisplayValues();
        for (var r = 0; r < fullSearchRange.length; r++) {
          for (var c = 0; c < fullSearchRange[r].length; c++) {
            var val = String(fullSearchRange[r][c] || "").trim();
            if (val === "") continue;
            
            if (val.toUpperCase() === kuyrukNo.toUpperCase()) {
              rowIndex = r + 1;
              break;
            }
            
            var m = val.match(/OR-\d+/i);
            if (m && targetMatch && m[0].toUpperCase() === targetMatch[0].toUpperCase()) {
              rowIndex = r + 1;
              break;
            }
          }
          if (rowIndex !== -1) break;
        }
      }

      if (rowIndex === -1) {
        var msg = "Kuyruk numarası (" + kuyrukNo + ") ana listede (" + sheet.getName() + ") bulunamadı.";
        if (hasTechUpdates) return jsonSuccess("Teknik veriler güncellendi ancak " + msg);
        return jsonError(msg + " (Aranan Aralık: " + (mapping.kuyrukNo || "A3:A100") + ")");
      }
      
    // Güncellemeleri uygula (Ana sayfa)
    var updatedCount = 0;
    var updatedFields = [];
    Object.keys(updates).forEach(function(key) {
      if (mapping[key]) {
        var val = updates[key];
        
        // AÇIKLAMA alanı özel kontrolü: Eğer açıkça boş gönderilmişse, hücreyi temizle
        if (key === 'aciklama' && (val === "" || val === null || val === undefined)) {
            val = "";
        } else if (val === undefined || val === null) {
            // Diğer alanlar için undefined/null ise atla
            return;
        }

        var colLetter = mapping[key].split(':')[0].replace(/[0-9]/g, ''); 
        var cellAddress = colLetter + rowIndex;
        try {
          sheet.getRange(cellAddress).setValue(val);
          updatedFields.push(key + " (" + cellAddress + ")");
          updatedCount++;
        } catch (e) {
          updatedFields.push(key + " (HATA: " + e.toString() + ")");
        }
      }
    });
    
    // Değişikliklerin kaydedildiğinden emin ol
    SpreadsheetApp.flush();

    // GERÇEK ZAMANLI LOGLAMA (Kullanıcı İsteği)
    try {
      var logSsId = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg";
      var logSs = SpreadsheetApp.openById(logSsId);
      
      // Güncel veriyi tekrar oku (tüm satırı)
      var rowValues = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      
      // Mapping'den kolon harflerini index'e çevir
      var getColIdx = function(mapStr) {
        if (!mapStr) return -1;
        var letter = mapStr.split(':')[0].replace(/[0-9]/g, '');
        var column = 0;
        for (var i = 0; i < letter.length; i++) {
          column += (letter.charCodeAt(i) - 64) * Math.pow(26, letter.length - i - 1);
        }
        return column - 1;
      };

      var aircraft = {
        kuyrukNo: rowValues[getColIdx(mapping.kuyrukNo)] || kuyrukNo,
        tip: params.aircraftType || "",
        durum: rowValues[getColIdx(mapping.durum)] || "",
        durumAyrintisi: rowValues[getColIdx(mapping.durumAyrintisi)] || "",
        aciklama: rowValues[getColIdx(mapping.aciklama)] || "",
        konum: rowValues[getColIdx(mapping.konum)] || "",
        govdeUcusSaati: rowValues[getColIdx(mapping.govdeUcusSaati)] || "",
        faydaliSaat: rowValues[getColIdx(mapping.faydaliSaat)] || "",
        assignedCode: updates.assignedCode || updates.analizKodu // Honor manual override from caller if present
      };
      
      if (!aircraft.assignedCode) {
        aircraft.assignedCode = analyzeStatusGS(aircraft);
      }
      saveLogsToSheets(logSs, [aircraft]);
    } catch (logErr) {
      console.error("Real-time logging error: " + logErr.toString());
    }
    
    return jsonSuccess("Veriler başarıyla güncellendi. (Sayfa: " + sheet.getName() + ", Satır: " + rowIndex + ", Alan: " + updatedCount + ")");
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
    // If it's a single cell, just get its display value
    if (!rangeStr.includes(':')) {
      var val = sheet.getRange(rangeStr).getValue();
      if (val instanceof Date) {
        return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      var displayVal = sheet.getRange(rangeStr).getDisplayValue();
      return displayVal ? displayVal.toString().trim() : "";
    }
    
    // If it's a range, iterate through it
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
  if (!name) return null;
  var sheets = ss.getSheets();
  var target = name.toUpperCase().replace(/\./g, "").trim();
  
  // 1. Tam eşleşme ara
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().toUpperCase().replace(/\./g, "").trim();
    if (sName === target) return sheets[i];
  }
  
  // 2. Kısmi eşleşme ara (Eğer tam eşleşme yoksa)
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().toUpperCase().replace(/\./g, "").trim();
    if (sName.indexOf(target) !== -1 || target.indexOf(sName) !== -1) return sheets[i];
  }
  
  return null;
}
function sendDailyReports() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mailSheet = findSheet(ss, "mail log");
  if (!mailSheet) return;
  
  var data = mailSheet.getDataRange().getDisplayValues();
  var headers = data[0].map(function(h) { return String(h).trim(); });
  
  var now = new Date();
  // Bugünün tarihi: "13.04.2026" formatında
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd.MM.yyyy");
  var currentDay = ["PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ"][now.getDay()];
  var currentTime = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm");
  
  // Sütunların yerini başlığa göre bulalım
  var colLastSent = headers.indexOf("SON GÖNDERİM");

  if (colLastSent === -1) {
    // Eğer başlık bulunamazsa manuel olarak 8. sütunu (H) kullanması için güvenlik önlemi
    colLastSent = 7; 
  }

  for (var i = 1; i < data.length; i++) {
    var recipient = {};
    for (var j = 0; j < headers.length; j++) {
      recipient[headers[j]] = data[i][j];
    }
    
    // --- 1. KİLİT MEKANİZMASI ---
    // Bugün zaten gönderilmişse bu personeli doğrudan atla
    var lastSentValue = data[i][colLastSent] ? String(data[i][colLastSent]).trim() : "";
    if (lastSentValue === todayStr) continue;

    if (recipient["MAİL GÖNDERME TÜRÜ"] === "OTOMATİK") {
      var days = recipient["GÜN SEÇENEĞİ"].toUpperCase();
      var targetTime = recipient["SAAT"];
      
      var isRightDay = false;
      if (days.includes("HER GÜN")) isRightDay = true;
      else if (days.includes(currentDay)) isRightDay = true;
      
      if (isRightDay && targetTime) {
        var diff = timeToMinutes(currentTime) - timeToMinutes(targetTime);
        
        // --- 2. ZAMAN KONTROLÜ ---
        // diff >= 0: Saat tam geldiyse veya geçtiyse (Erken atmayı önler)
        // diff <= 10: Belirlenen saatin üzerinden en fazla 10 dk geçtiyse (Tetikleyici kaçırmasın diye)
        if (diff >= 0 && diff <= 10) { 
          sendReportEmail(recipient);
          
          // --- 3. DAMGALAMA ---
          // Mail başarıyla gittikten sonra hücreye bugünün tarihini yazıyoruz
          mailSheet.getRange(i + 1, colLastSent + 1).setValue("'" + todayStr);
          
          // Sayfayı anlık olarak zorla güncelle (Flush), mükerrerliği %100 engeller
          SpreadsheetApp.flush();
        }
      }
    }
  }
}

function timeToMinutes(timeStr) {
  var parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function sendReportEmail(recipient, customAttachments, ss) {
  var attachments = Array.isArray(customAttachments) ? customAttachments : [];
  var logSsId = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg"; // Merkezi Log Tablosu ID
  var selectedReports = String(recipient["GÖNDERİLECEK MAİLİN EKİ"] || "").trim().toUpperCase();
  
  console.log("Sending email to: " + recipient["PERSONEL MAİL ADRESİ"] + " | Reports: " + selectedReports);
  
  // 1. ENVANTER RAPORU (Daha esnek eşleşme: 'ENVANTER' ve 'RAPOR' geçiyorsa)
  if (selectedReports.includes("ENVANTER") && (selectedReports.includes("RAPOR") || selectedReports.includes("DURUM"))) {
    var blob = generateFormattedEnvanterExcel(logSsId);
    if (blob) {
      attachments.push(blob);
    } else {
      console.error("Envanter blob could not be generated.");
    }
  }

  // 2. FAALİYET ÇİZELGESİ
  if (selectedReports.includes("FAALİYET")) {
    var blob = generateFormattedFaaliyetExcel(logSsId);
    if (blob) {
      attachments.push(blob);
    } else {
      console.error("Faaliyet blob could not be generated.");
    }
  }
  
  // 3. ONLINE EXCEL DOSYALARI
  if (selectedReports.includes("ONLİNE") || selectedReports.includes("HAVA ARACI EXCELİ")) {
    var platformConfigs = {
      "Bell-429": { id: "1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ", sheet: null },
      "AT-802": { id: "1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4", sheet: "GÜNLÜK DURUM" },
      "T-70": { id: "10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw", sheet: null },
      "B-360": { id: "1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0", sheet: null },
      "C-650": { id: "1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE", sheet: null }
    };
    
    for (var platform in platformConfigs) {
      try {
        var config = platformConfigs[platform];
        var blob = getSheetAsExcel(config.id, platform + "_Online_Excel.xlsx", config.sheet);
        if (blob) attachments.push(blob);
      } catch (e) {
        console.error("Error attaching " + platform + ": " + e.toString());
      }
    }
  }
  
  console.log("Total attachments to send: " + attachments.length);
  
  if (attachments.length === 0) {
    console.error("No attachments to send for: " + recipient["PERSONEL MAİL ADRESİ"] + ". Skipping email.");
    return;
  }
  
  var liveAppUrl = "https://filodurumlar-bakimsube.netlify.app/";
  var body = "Sayın " + (recipient["PERSONEL ADI"] || "Yetkili") + ",\n\n" +
             "Günlük hava aracı operasyonel durum raporları ekte bilgilerinize sunulmuştur.\n\n" +
             "Bununla birlikte, aşağıdaki bağlantıya tıklayarak en güncel durum raporunu canlı olarak da takip edebilirsiniz:\n\n" +
             "👉 Buraya tıklayarak en güncel durum raporunu canlı olarak izleyebilirsiniz:\n" + liveAppUrl + "\n\n" +
             "İyi çalışmalar dilerim.";

  var htmlBody = "<div style='font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #333;'>" +
                 "<p>Sayın <strong>" + (recipient["PERSONEL ADI"] || "Yetkili") + "</strong>,</p>" +
                 "<p>Günlük hava aracı operasyonel durum raporları ekte bilgilerinize sunulmuştur.</p>" +
                 "<p>Bununla birlikte, aşağıdaki bağlantıya tıklayarak en güncel durum raporunu canlı olarak da takip edebilirsiniz:</p>" +
                 "<p style='margin: 20px 0;'>👉 <strong><a href='" + liveAppUrl + "' target='_blank' style='color: #059669; text-decoration: underline;'>Buraya tıklayarak en güncel durum raporunu canlı olarak izleyebilirsiniz.</a></strong></p>" +
                 "<p>İyi çalışmalar dilerim.</p>" +
                 "</div>";

  MailApp.sendEmail({
    to: recipient["PERSONEL MAİL ADRESİ"],
    subject: "OGM Hava Aracı Durum Raporu - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy"),
    body: body,
    htmlBody: htmlBody,
    attachments: attachments
  });
}

function getSheetAsExcel(ssId, name, sheetName) {
  try {
    var ss = SpreadsheetApp.openById(ssId);
    var sourceSheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
    
    if (!sourceSheet) {
      console.error("Source sheet not found for " + name);
      return null;
    }
    
    // Create a temporary spreadsheet
    var tempSs = SpreadsheetApp.create("Temp_Export_" + name);
    
    // Copy the source sheet to the temporary spreadsheet
    var copiedSheet = sourceSheet.copyTo(tempSs);
    copiedSheet.setName(sourceSheet.getName());
    
    // Delete the default "Sheet1" that comes with a new spreadsheet
    var defaultSheet = tempSs.getSheets()[0];
    tempSs.deleteSheet(defaultSheet);
    
    SpreadsheetApp.flush();
    
    var url = "https://docs.google.com/spreadsheets/d/" + tempSs.getId() + "/export?format=xlsx";
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      },
      muteHttpExceptions: true
    });
    
    // Delete the temporary spreadsheet
    DriveApp.getFileById(tempSs.getId()).setTrashed(true);
    
    if (response.getResponseCode() !== 200) {
      console.error("Error fetching spreadsheet " + ssId + " (" + name + "): " + response.getContentText());
      return null;
    }
    
    return response.getBlob().setName(name);
  } catch (e) {
    console.error("Exception in getSheetAsExcel for " + ssId + " (" + name + "): " + e.toString());
    return null;
  }
}

/**
 * Gece yarısı otomatik loglama yapan fonksiyon.
 * Bu fonksiyonun her gece 00:00 - 01:00 arasında çalışacak şekilde tetiklenmesi gerekir.
 */
function syncFleetToLogs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var platformConfigs = [
    { type: 'Bell-429', id: '1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ', range: 'A3:O8', map: {kNo:0, durum:12, detail:13, desc:14, loc:11, gHour:4, fHour:8} },
    { type: 'AT-802', id: '1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4', sheet: 'GÜNLÜK DURUM', range: 'B3:AL16', map: {kNo:0, durum:1, detail:2, desc:36, loc:3, gHour:4, fHour:20} },
    { type: 'T-70', id: '10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw', range: 'A4:S6', map: {kNo:0, durum:16, detail:17, desc:18, loc:15, gHour:4, fHour:13} },
    { type: 'B-360', id: '1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0', range: 'A3:P10', map: {kNo:0, durum:13, detail:14, desc:15, loc:12, gHour:4, fHour:8} },
    { type: 'C-650', id: '1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE', range: 'A3:P10', map: {kNo:0, durum:13, detail:14, desc:15, loc:12, gHour:4, fHour:8} }
  ];

  var fleetData = [];

  platformConfigs.forEach(function(config) {
    try {
      var pSs = SpreadsheetApp.openById(config.id);
      var pSheet = config.sheet ? pSs.getSheetByName(config.sheet) : pSs.getSheets()[0];
      var values = pSheet.getRange(config.range).getDisplayValues();
      
      values.forEach(function(row) {
        var kNo = row[config.map.kNo];
        if (kNo && kNo.trim() !== "") {
          var item = {
            kuyrukNo: kNo,
            tip: config.type,
            durum: row[config.map.durum],
            durumAyrintisi: row[config.map.detail],
            aciklama: row[config.map.desc],
            konum: row[config.map.loc],
            govdeUcusSaati: row[config.map.gHour],
            faydaliSaat: row[config.map.fHour]
          };
          item.assignedCode = analyzeStatusGS(item);
          fleetData.push(item);
        }
      });
    } catch (e) {
      console.error("Error logging " + config.type + ": " + e.toString());
    }
  });

  if (fleetData.length > 0) {
    var logSsId = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg";
    var logSs = SpreadsheetApp.openById(logSsId);
    saveLogsToSheets(logSs, fleetData);
    console.log("Fleet logs synced successfully to central sheet. Total aircraft: " + fleetData.length);
  }
}

function analyzeStatusGS(item) {
  if (!item) return 'F';
  
  var toUpperTR = function(s) {
    if (!s) return "";
    return String(s).replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase().trim();
  };
  
  var durumUpper = toUpperTR(item.durum);
  var detailUpper = toUpperTR(item.durumAyrintisi);
  var descUpper = toUpperTR(item.aciklama);
  
  // 1. KESİN DURUM KONTROLÜ (Eğer FAAL veya F ise diğerlerine bakmaya gerek yok - Karma hariç)
  if (durumUpper === 'FAAL' || durumUpper === 'F') {
     if (detailUpper.indexOf('KARMA') !== -1 || detailUpper.indexOf('HEM FAAL') !== -1 || descUpper.indexOf('KARMA') !== -1 || descUpper.indexOf('HEM FAAL') !== -1) {
       return 'K';
     }
     return 'F';
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
    if (n.indexOf('TEKNIK BULTEN') !== -1 || n.indexOf('TBU') !== -1) return 'TBU';
    if (n.indexOf('BAKIM BEKLER') !== -1 || n === 'BB') return 'BB';
    if (n.indexOf('BAKIM') !== -1) return 'B';
    if (n.indexOf('PARCA BEKLER') !== -1 || n === 'PB') return 'PB';
    if (n.indexOf('TECRUBE BEKLER') !== -1 || n === 'TB' || n.indexOf('TECRUBE') !== -1 || n.indexOf('TEST') !== -1) return 'TB';
    if (n.indexOf('KABUL MUAYENE') !== -1 || n === 'KM') return 'KM';
    if (n.indexOf('KAZA KIRIM') !== -1 || n === 'KK') return 'KK';
    if (n.indexOf('OLMADIGI GUNLER') !== -1 || n === 'X') return 'X';
    if (n.indexOf('ARIZA') !== -1 || n.indexOf('ARZ') !== -1 || n === 'A' || n.indexOf('OVERSPEED') !== -1 || n.indexOf('NG') !== -1) return 'A';
    
    return null;
  };

  // Adım 1: Durum Ayrıntısı (DURUM_AYRINTISI) - ÖNCELİKLİ
  var detailMatch = findCodeInText(detailUpper);
  if (detailMatch) return detailMatch;

  // Adım 2: Durum (DURUM)
  var durumMatch = findCodeInText(durumUpper);
  if (durumMatch) return durumMatch;
  
  var isGayriFaalStatus = durumUpper.indexOf('GAYRİ') !== -1 || durumUpper.indexOf('GAYRI') !== -1 || durumUpper.indexOf('GF') !== -1 || durumUpper === 'G.FAAL' || durumUpper.indexOf('ARIZA') !== -1 || durumUpper.indexOf('ARZ') !== -1 || durumUpper === 'A';
  if (isGayriFaalStatus) return 'A';

  return 'F';
}


function saveLogsToSheets(ss, fleetData, customDateStr) {
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
  var tarihStr = customDateStr || Utilities.formatDate(bugun, Session.getScriptTimeZone(), "dd.MM.yyyy");
  
  var normalizeDate = function(d) {
    if (!d) return "";
    if (d instanceof Date) return Utilities.formatDate(d, "GMT+3", "dd.MM.yyyy");
    var s = String(d).trim();
    if (s.includes('-')) {
      var p = s.split('-');
      if (p.length >= 3 && p[0].length === 4) return p[2] + "." + p[1] + "." + p[0];
    }
    return s;
  };

  // --- SURGICAL UPDATE INSTEAD OF DELETE-AND-APPEND ---
  var envDataRows = envLogSheet.getDataRange().getValues();
  var envIdMap = {};
  for (var i = 1; i < envDataRows.length; i++) {
    var rId = String(envDataRows[i][0]).trim();
    if (rId) envIdMap[rId] = { row: i + 1, data: envDataRows[i] };
  }
  var nextEnvRow = envLogSheet.getLastRow() + 1;

  var faalDataRows = faalLogSheet.getDataRange().getValues();
  var faalIdMap = {};
  for (var i = 1; i < faalDataRows.length; i++) {
    var rId = String(faalDataRows[i][0]).trim();
    if (rId) faalIdMap[rId] = { row: i + 1, data: faalDataRows[i] };
  }
  var nextFaalRow = faalLogSheet.getLastRow() + 1;

  fleetData.forEach(function(aircraft) {
    var kNo = String(aircraft.kuyrukNo || "").trim().toUpperCase();
    if (!kNo) return;

    var logId = tarihStr + "_" + kNo;
    var assignedCode = aircraft.assignedCode || aircraft.analizKodu || analyzeStatusGS(aircraft);
    
    // 1. ENVANTER LOG
    var envEntry = envIdMap[logId];
    var faydaliVal = aircraft.faydaliSaat;
    if (typeof faydaliVal === 'string') {
      faydaliVal = parseFloat(faydaliVal.replace(/\./g, "").replace(',', '.')) || 0;
    }

    if (!envEntry) {
      envLogSheet.getRange(nextEnvRow, 1, 1, 10).setValues([[
        logId, tarihStr, kNo, aircraft.tip || "", "", 
        faydaliVal, aircraft.konum || "", aircraft.durum || "", 
        aircraft.durumAyrintisi || "", aircraft.aciklama ? "'" + String(aircraft.aciklama) : ""
      ]]);
      setLogTimeValueGS(envLogSheet, nextEnvRow, 5, aircraft.govdeUcusSaati, aircraft.tip);
      envLogSheet.getRange(nextEnvRow, 6).setNumberFormat("0.0#");
      
      // Update map to avoid duplicates if same tail processed twice (unlikely but safe)
      envIdMap[logId] = { row: nextEnvRow, data: [logId, tarihStr, kNo, aircraft.tip, aircraft.govdeUcusSaati, faydaliVal, aircraft.konum || "", aircraft.durum || "", aircraft.durumAyrintisi || "", aircraft.aciklama] };
      nextEnvRow++;
    } else {
      // Surgical Update - Only if changed
      var oldRow = envEntry.data;
      var oldFaydali = parseFloat(oldRow[5]) || 0;
      var oldDurum = String(oldRow[7] || "").trim().toUpperCase();
      var newDurum = String(aircraft.durum || "").trim().toUpperCase();
      var oldAyrinti = String(oldRow[8] || "").trim().toUpperCase();
      var newAyrinti = String(aircraft.durumAyrintisi || "").trim().toUpperCase();
      var oldKonum = String(oldRow[6] || "").trim().toUpperCase();
      var newKonum = String(aircraft.konum || "").trim().toUpperCase();
      var oldAciklama = String(oldRow[9] || "").trim();
      var newAciklama = String(aircraft.aciklama || "").trim();
      
      if (Math.abs(oldFaydali - faydaliVal) > 0.001 || oldDurum !== newDurum || oldAyrinti !== newAyrinti || oldKonum !== newKonum || oldAciklama !== newAciklama) {
        envLogSheet.getRange(envEntry.row, 1, 1, 4).setValues([[logId, tarihStr, kNo, aircraft.tip || ""]]);
        envLogSheet.getRange(envEntry.row, 6, 1, 5).setValues([[
          faydaliVal, aircraft.konum || "", aircraft.durum || "", 
          aircraft.durumAyrintisi || "", aircraft.aciklama ? "'" + String(aircraft.aciklama) : ""
        ]]);
        setLogTimeValueGS(envLogSheet, envEntry.row, 5, aircraft.govdeUcusSaati, aircraft.tip);
        envLogSheet.getRange(envEntry.row, 6).setNumberFormat("0.0#");
      }
    }

    // 2. FAALİYET LOG
    var faalEntry = faalIdMap[logId];
    if (!faalEntry) {
      faalLogSheet.getRange(nextFaalRow, 1, 1, 6).setValues([[
        logId, tarihStr, kNo, aircraft.tip || "", aircraft.durumAyrintisi || "", assignedCode
      ]]);
      faalIdMap[logId] = { row: nextFaalRow };
      nextFaalRow++;
    } else {
      faalLogSheet.getRange(faalEntry.row, 1, 1, 6).setValues([[
        logId, tarihStr, kNo, aircraft.tip || "", aircraft.durumAyrintisi || "", assignedCode
      ]]);
    }
  });
  
  SpreadsheetApp.flush();
}

function setLogTimeValueGS(sheet, row, col, value, tip) {
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
                      cleanTip.indexOf("BELL429") !== -1;

  if (!valStr.includes(":") && (valStr.includes(",") || valStr.includes(".") || /^\d+(\.\d+)?$/.test(valStr))) {
    var n = parseFloat(valStr.replace(",", "."));
    if (!isNaN(n)) {
      if (isDecimalType) {
        range.setValue(n);
        range.setNumberFormat("#,##0.0#");
      } else {
        range.setValue(n / 24);
        range.setNumberFormat("[h]:mm");
      }
      return;
    }
  }

  if (isDecimalType) {
    var n;
    if (valStr.includes(',') && valStr.includes('.')) n = parseFloat(valStr.replace(/\./g, "").replace(',', '.'));
    else if (valStr.includes(',')) n = parseFloat(valStr.replace(',', '.'));
    else if (valStr.includes(':')) {
      var parts = valStr.split(':').map(Number);
      n = (parts[0] || 0) + (parts[1] || 0) / 60;
    }
    else n = parseFloat(valStr);
    
    if (!isNaN(n)) {
      range.setValue(n);
      range.setNumberFormat("#,##0.0#");
      return;
    }
  }

  if (/^\d+:\d{2}(:\d{2})?$/.test(valStr)) {
    var parts = valStr.split(':');
    var hours = parseInt(parts[0], 10);
    var mins = parseInt(parts[1], 10);
    var decimalValue = (hours + (mins / 60)) / 24;
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

/**
 * Formatted Excel Generation for Envanter - Matches App.tsx exportFleetToExcel
 */
function generateFormattedEnvanterExcel(ssId) {
  try {
    var ss = SpreadsheetApp.openById(ssId);
    
    // Fetch fresh data from all platforms to match the app's "EXCEL İNDİR" behavior
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
        var values = pSheet.getRange(config.range).getDisplayValues();
        var rawValues = pSheet.getRange(config.range).getValues();
        
        values.forEach(function(row, rIdx) {
          var kNo = String(row[config.map.kNo] || "").trim();
          var durum = String(row[config.map.durum] || "").trim();
          
          // Skip empty or placeholder rows
          if (kNo === "" || kNo.toUpperCase().indexOf("XX") !== -1) return;
          if (durum === "" || durum === "-") return;

          var cagriKodu = getCallSignByTailGS(kNo);
          if (String(cagriKodu || "").toUpperCase().indexOf("XX") !== -1) return;

          if (kNo && kNo.trim() !== "") {
            var faydaliSaat = null;
            if (config.type === 'AT-802') {
              // Find min value in V3:AI16 range
              var minVal = null;
              for (var c = config.map.fHourStart; c <= config.map.fHourEnd; c++) {
                var val = values[rIdx][c];
                var parsed = parseSingleCellToHourGS(val, config.type);
                if (parsed === null) parsed = parseSingleCellToHourGS(rawValues[rIdx][c], config.type);
                if (parsed !== null) {
                  if (minVal === null || parsed < minVal) minVal = parsed;
                }
              }
              faydaliSaat = minVal;
            } else if (config.type === 'T-70') {
              // Find min value across columns L (11), N (13), and O (14)
              var minVal = null;
              var t70Cols = [11, 13, 14];
              for (var i = 0; i < t70Cols.length; i++) {
                var c = t70Cols[i];
                var val = values[rIdx][c];
                var parsed = parseSingleCellToHourGS(val, config.type);
                if (parsed === null) parsed = parseSingleCellToHourGS(rawValues[rIdx][c], config.type);
                if (parsed !== null) {
                  if (minVal === null || parsed < minVal) minVal = parsed;
                }
              }
              faydaliSaat = minVal;
            } else {
              var val = values[rIdx][config.map.fHour];
              var parsed = parseSingleCellToHourGS(val, config.type);
              if (parsed === null) parsed = parseSingleCellToHourGS(rawValues[rIdx][config.map.fHour], config.type);
              faydaliSaat = parsed;
            }

            var item = {
              kuyrukNo: kNo,
              tip: config.type,
              durum: row[config.map.durum],
              durumAyrintisi: row[config.map.detail],
              aciklama: row[config.map.desc],
              konum: row[config.map.loc],
              govdeUcusSaati: row[config.map.gHour],
              faydaliSaat: faydaliSaat
            };
            fleetData.push(item);
          }
        });
      } catch (e) {
        console.error("Error fetching " + config.type + " for Excel: " + e.toString());
      }
    });

    if (fleetData.length === 0) return null;

    // Sort fleetData: C-650, B-360, Bell-429, AT-802, T-70 then ORMAN-XX
    var typeOrder = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
    fleetData.sort(function(a, b) {
      var indexA = typeOrder.indexOf(a.tip);
      var indexB = typeOrder.indexOf(b.tip);
      if (indexA !== indexB) {
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.tip.localeCompare(b.tip);
      }
      
      var getOrder = function(kNo) {
        var cagri = getCallSignByTailGS(kNo);
        var match = String(cagri).match(/ORMAN-(\d+)/i);
        if (match) return parseInt(match[1]);
        return 999;
      };
      return getOrder(a.kuyrukNo) - getOrder(b.kuyrukNo);
    });

    var tempSs = SpreadsheetApp.create("Envanter_Raporu_Temp");
    var tempSheet = tempSs.getSheets()[0];
    
    var bugun = new Date();
    var tarihStr = Utilities.formatDate(bugun, Session.getScriptTimeZone(), "dd.MM.yyyy");
    
    // Set Font to Arial for all potential content cells
    tempSheet.getRange("A1:I250").setFontFamily("Arial");

    // Date Row (Merged H2:I2 for 9-column layout alignment)
    tempSheet.getRange("H2:I2").merge().setValue(tarihStr).setFontColor("#dc2626").setFontWeight("bold").setHorizontalAlignment("right").setFontSize(14);
    
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
      var cagriKodu = getCallSignByTailGS(kNo);
      
      var durumStr = String(item.durum || "").toUpperCase();
      var isFaal = durumStr.indexOf("FAAL") !== -1 && durumStr.indexOf("GAYRİ") === -1 && durumStr.indexOf("GAYRI") === -1;
      var durumText = item.durum ? String(item.durum).toUpperCase() : (isFaal ? "FAAL" : "GAYRİ FAAL");
      
      var abbr = getAbbreviationGS(kNo);
      var faydaliSaatFormatted = formatToHHMMGS(item.faydaliSaat, item.tip);
      
      // Rich Text for Kuyruk No with Red Abbreviation
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
        (!item.govdeUcusSaati || item.govdeUcusSaati === "-" || item.govdeUcusSaati === "0" || item.govdeUcusSaati === "") ? "-" : formatToHHMMGS(item.govdeUcusSaati, item.tip), // GÖVDE SAATİ
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

function parseSingleCellToHourGS(val, aircraftType) {
  if (val === undefined || val === null || val === "" || val === "0" || val === "00:00") return null;

  if (val instanceof Date) {
    var base = new Date(Date.UTC(1899, 11, 30));
    var totalHours = (val.getTime() - base.getTime()) / (1000 * 60 * 60);
    return totalHours > 0 ? totalHours : null;
  }

  if (typeof val === 'number') {
    if (val <= 0) return null;
    var n = val;
    if (aircraftType === 'AT-802' && n < 100) n = n * 24;
    return n;
  }

  if (typeof val === 'string') {
    var s = val.trim().replace(',', '.');
    if (s.indexOf(':') !== -1) {
      var parts = s.split(':').map(Number);
      return (parts[0] || 0) + (parts[1] || 0) / 60;
    }
    var n = parseFloat(s);
    if (!isNaN(n)) {
      if (aircraftType === 'Bell-429' && s.indexOf('.') !== -1) {
        var parts = s.split('.');
        var h = parseInt(parts[0]) || 0;
        var m = parseInt(parts[1]) || 0;
        return h + m / 60;
      }
      return n;
    }
  }
  return null;
}

function formatToHHMMGS(val, aircraftType) {
  if (val === null || val === undefined || val === "" || val === "0") return "-";
  
  var totalHours = null;
  if (typeof val === 'number') {
    totalHours = val;
    // AT-802 correction if it's days
    if (aircraftType === 'AT-802' && totalHours < 100) totalHours *= 24;
  } else if (val instanceof Date) {
    var base = new Date(Date.UTC(1899, 11, 30));
    totalHours = (val.getTime() - base.getTime()) / (1000 * 60 * 60);
  } else {
    var s = String(val).trim().replace(',', '.');
    if (s.indexOf(':') !== -1) {
      var parts = s.split(':').map(Number);
      totalHours = (parts[0] || 0) + (parts[1] || 0) / 60;
    } else {
      totalHours = parseFloat(s);
    }
  }
  
  if (totalHours === null || isNaN(totalHours)) return String(val);
  
  var cleanType = String(aircraftType || '').toUpperCase().replace(/[\s-]/g, '');
  var isDecimalType = cleanType.indexOf('B360') !== -1 || 
                      cleanType.indexOf('C650') !== -1 || 
                      cleanType.indexOf('BELL429') !== -1;

  if (isDecimalType) {
    return totalHours.toFixed(1).replace('.', ',');
  }
  
  var hours = Math.floor(Math.abs(totalHours));
  var minutes = Math.round((Math.abs(totalHours) - hours) * 60);
  if (minutes === 60) { hours++; minutes = 0; }
  var sign = totalHours < 0 ? '-' : '';
  
  return sign + hours + ":" + (minutes < 10 ? "0" + minutes : minutes);
}


function getAbbreviationGS(kuyrukNo) {
  var tail = String(kuyrukNo).trim().toUpperCase();
  if (['OR-2021', 'OR-2022', 'OR-2023', 'OR-2037'].includes(tail)) return ' (DA)';
  if (['OR-2024', 'OR-2025', 'OR-2026', 'OR-2027', 'OR-2028', 'OR-2029', 'OR-2030', 'OR-2031'].includes(tail)) return ' (SA)';
  if (tail === 'OR-2036') return ' (DL)';
  if (tail === 'OR-2038') return ' (SL)';
  if (tail === 'OR-1020') return ' (H)';
  return '';
}

function getCallSignByTailGS(tail) {
  if (!tail) return "ORMAN-XX";
  var cleanTail = String(tail).trim().toUpperCase();
  
  if (cleanTail === "" || cleanTail === "-" || cleanTail.indexOf("XX") !== -1 || cleanTail.indexOf("YENİ") !== -1) {
    return "ORMAN-XX";
  }

  var mapping = {
    'OR-0177': 'ORMAN-01', 'OR-1839': 'ORMAN-02', 'OR-3125': 'ORMAN-03',
    'OR-3126': 'ORMAN-04', 'OR-3127': 'ORMAN-05', 'OR-3131': 'ORMAN-06',
    'OR-3133': 'ORMAN-07', 'OR-3192': 'ORMAN-08', 'OR-2021': 'ORMAN-21',
    'OR-2022': 'ORMAN-22', 'OR-2023': 'ORMAN-23', 'OR-2024': 'ORMAN-24',
    'OR-2025': 'ORMAN-25', 'OR-2026': 'ORMAN-26', 'OR-2027': 'ORMAN-27',
    'OR-2028': 'ORMAN-28', 'OR-2029': 'ORMAN-29', 'OR-2030': 'ORMAN-30',
    'OR-2031': 'ORMAN-31', 'OR-2036': 'ORMAN-36', 'OR-2037': 'ORMAN-37',
    'OR-2038': 'ORMAN-38', 'OR-2039': 'ORMAN-39', 'OR-2040': 'ORMAN-40',
    'OR-1018': 'ORMAN-18', 'OR-1019': 'ORMAN-19',
    'OR-1020': 'ORMAN-20'
  };

  var match = cleanTail.match(/OR-\d+/i);
  if (match) {
    var key = match[0].toUpperCase();
    return mapping[key] || "ORMAN-" + key.split('-')[1];
  }
  
  return "ORMAN-XX";
}

/**
 * Formatted Excel Generation for Faaliyet - Matches ActivityGrid.tsx
 */
function generateFormattedFaaliyetExcel(ssId) {
  try {
    var ss = SpreadsheetApp.openById(ssId);
    var logSheet = findSheet(ss, "Faaliyet Log");
    if (!logSheet) return null;

    var tempSs = SpreadsheetApp.create("Faaliyet_Cizelgesi_Temp");
    var tempSheet = tempSs.getSheets()[0];
    
    var data = logSheet.getDataRange().getDisplayValues();
    var dates = [];
    var aircrafts = [];
    var grid = {}; // {kNo: {date: code}}
    var aircraftInfo = {}; // {kNo: {tip: string, cagri: string}}

    for (var i = 1; i < data.length; i++) {
      var d = data[i][1];
      var k = data[i][2];
      var tip = data[i][3];
      var c = data[i][5];
      if (dates.indexOf(d) === -1) dates.push(d);
      if (aircrafts.indexOf(k) === -1) {
        aircrafts.push(k);
        aircraftInfo[k] = { tip: tip, cagri: getCallSignByTailGS(k) };
      }
      if (!grid[k]) grid[k] = {};
      grid[k][d] = c;
    }
    
    dates.sort(function(a, b) {
      var partsA = a.split('.');
      var partsB = b.split('.');
      return new Date(partsA[2], partsA[1]-1, partsA[0]) - new Date(partsB[2], partsB[1]-1, partsB[0]);
    });
    
    // Sort aircrafts by type order then callsign
    var typeOrder = ['C-650', 'B-360', 'Bell-429', 'AT-802', 'T-70'];
    aircrafts.sort(function(a, b) {
      var infoA = aircraftInfo[a];
      var infoB = aircraftInfo[b];
      var indexA = typeOrder.indexOf(infoA.tip);
      var indexB = typeOrder.indexOf(infoB.tip);
      if (indexA !== indexB) {
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return infoA.tip.localeCompare(infoB.tip);
      }
      return infoA.cagri.localeCompare(infoB.cagri);
    });

    // Header Construction
    // Row 1: KUYRUK NO, ÇAĞRI KODU, TİP, Dates..., TOPLAM G.FAAL (colSpan 3), TOPLAM G.FAAL, TOPLAM FAAL, FAALİYET %
    var header1 = ["KUYRUK NO", "ÇAĞRI KODU", "HAVA ARACI TİPİ"];
    dates.forEach(function(d) { header1.push(d); });
    header1.push("TOPLAM G.FAAL", "", "", "TOPLAM G.FAAL", "TOPLAM FAAL", "FAALİYET %");
    
    tempSheet.getRange(1, 1, 1, header1.length).setValues([header1]);
    tempSheet.getRange(1, 1, 2, 3).mergeVertically().setBackground("white").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    
    var dateStartCol = 4;
    var dateEndCol = dateStartCol + dates.length - 1;
    tempSheet.getRange(1, dateStartCol, 2, dates.length).mergeVertically().setBackground("white").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    
    // Rotate dates
    for (var c = dateStartCol; c <= dateEndCol; c++) {
      tempSheet.getRange(1, c).setTextRotation(90);
    }

    var statsStartCol = dateEndCol + 1;
    tempSheet.getRange(1, statsStartCol, 1, 3).merge().setValue("TOPLAM G.FAAL").setBackground("#00b0f0").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center");
    tempSheet.getRange(1, statsStartCol + 3, 2, 1).merge().setValue("TOPLAM G.FAAL").setBackground("#00b0f0").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    tempSheet.getRange(1, statsStartCol + 4, 2, 1).merge().setValue("TOPLAM FAAL").setBackground("#ffc000").setFontColor("black").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
    tempSheet.getRange(1, statsStartCol + 5, 2, 1).merge().setValue("FAALİYET %").setBackground("#f3f4f6").setFontColor("black").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");

    // Row 2 for stats
    var header2 = ["", "", ""];
    dates.forEach(function() { header2.push(""); });
    header2.push("Bakım", "Arıza", "Olmadığı", "", "", "");
    tempSheet.getRange(2, 1, 1, header2.length).setValues([header2]);
    tempSheet.getRange(2, statsStartCol).setBackground("#ffff00").setFontWeight("bold").setHorizontalAlignment("center");
    tempSheet.getRange(2, statsStartCol + 1).setBackground("#ff0000").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center");
    tempSheet.getRange(2, statsStartCol + 2).setBackground("#7030a0").setFontColor("white").setFontWeight("bold").setHorizontalAlignment("center");

    // Body
    var startRow = 3;
    aircrafts.forEach(function(k, idx) {
      var currentRow = startRow + idx;
      var info = aircraftInfo[k];
      var rowData = [k + getAbbreviationGS(k), info.cagri, info.tip];
      
      var bakim = 0, ariza = 0, olmadi = 0, faal = 0;
      dates.forEach(function(d) {
        var code = grid[k][d] || "";
        rowData.push(code === "F" ? "" : code);
        if (['B', 'BB', 'KM'].includes(code)) bakim++;
        else if (['A', 'PB', 'KK'].includes(code)) ariza++;
        else if (code === 'X') olmadi++;
        else if (code === 'F') faal++;
      });
      
      var totalGF = bakim + ariza + olmadi;
      var totalDays = dates.length;
      var baseDays = totalDays - olmadi;
      // Simplified percentage for script (ActivityGrid has complex 3-day rule, but here we just do basic)
      var percentage = baseDays > 0 ? Math.round(((baseDays - (bakim + ariza)) / baseDays) * 100) : 0;
      
      rowData.push(bakim, ariza, olmadi, totalGF, faal, percentage + "%");
      
      var range = tempSheet.getRange(currentRow, 1, 1, rowData.length);
      range.setValues([rowData]);
      range.setBorder(true, true, true, true, true, true);
      
      // Color coding for status cells
      for (var c = 0; c < dates.length; c++) {
        var cell = tempSheet.getRange(currentRow, dateStartCol + c);
        var val = cell.getValue();
        if (['B', 'BB', 'KM'].includes(val)) cell.setBackground("#ffff00").setFontColor("black");
        else if (['A', 'PB', 'KK'].includes(val)) cell.setBackground("#ff0000").setFontColor("white");
        else if (val === 'X') cell.setBackground("#7030a0").setFontColor("white");
      }
      
      // Stats colors
      tempSheet.getRange(currentRow, statsStartCol).setBackground("#ffffcc");
      tempSheet.getRange(currentRow, statsStartCol + 1).setBackground("#ffcccc");
      tempSheet.getRange(currentRow, statsStartCol + 2).setBackground("#e2efda");
      tempSheet.getRange(currentRow, statsStartCol + 3).setBackground("#ddebf7");
      tempSheet.getRange(currentRow, statsStartCol + 4).setBackground("#fff2cc");
    });

    var lastBodyRow = startRow + aircrafts.length;
    var legendRow = lastBodyRow + 2;
    
    tempSheet.getRange(legendRow, 1).setValue("KISALTMALAR").setFontWeight("bold");
    var legendData = [
      ["B: BAKIM", "ARI: ARIZA", "X: OLMADIĞI GÜNLER"],
      ["BB: BAKIM BEKLER", "PB: PARÇA BEKLER", ""],
      ["KM: KABUL MUAYENESİ", "KK: KAZA KIRIM", ""]
    ];
    tempSheet.getRange(legendRow + 1, 1, 3, 3).setValues(legendData);
    tempSheet.getRange(legendRow + 1, 1, 3, 1).setBackground("#ffff00");
    tempSheet.getRange(legendRow + 1, 2, 3, 1).setBackground("#ff0000").setFontColor("white");
    tempSheet.getRange(legendRow + 1, 3, 1, 1).setBackground("#7030a0").setFontColor("white");

    tempSheet.autoResizeColumns(1, header1.length);
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

function setupTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var midnightExists = false;
  var periodicExists = false;
  
  for (var i = 0; i < triggers.length; i++) {
    var handler = triggers[i].getHandlerFunction();
    if (handler === 'syncFleetToLogs') {
      // We'll manage triggers by name, but since they have same handler, 
      // we might need to be careful. For simplicity, if any exists, we check.
      // Actually, let's just clear and recreate to be sure of the schedule.
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Midnight Trigger (Daily)
  ScriptApp.newTrigger('syncFleetToLogs')
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create();
    
  // Periodic Trigger (Every 15 minutes for intra-day updates)
  ScriptApp.newTrigger('syncFleetToLogs')
    .timeBased()
    .everyMinutes(15)
    .create();
}

function doGet(e) { 
  setupTriggers(); // Ensure triggers are set up
  
  var action = e.parameter.action;
  if (action === 'sync') {
    syncFleetToLogs();
    return ContentService.createTextOutput("Sync completed successfully.");
  }
  
  return ContentService.createTextOutput("OGM Servis Aktif. Triggers updated."); 
}
