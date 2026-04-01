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

    // -----------------------------------------------------
    // 🔵 AKSİYON: ÖPL VERİSİ (ARŞİV) SORGULAMA
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
      if (!logSheet) return jsonError("Envanter Log sayfası bulunamadı.");

      var data = logSheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < data.length; i++) {
        // data[i][1] is Tarih, data[i][2] is Kuyruk No
        var rowDate = data[i][1];
        if (rowDate instanceof Date) {
          rowDate = Utilities.formatDate(
            rowDate,
            ss.getSpreadsheetTimeZone(),
            "dd.MM.yyyy",
          );
        }
        if (
          rowDate === date &&
          String(data[i][2]).trim().toUpperCase() ===
            String(kuyrukNo).trim().toUpperCase()
        ) {
          logSheet.getRange(i + 1, 5).setValue(newHours); // 5. sütun: Gövde Uçuş Saati
          found = true;
          // break; // Birden fazla kayıt varsa hepsini güncellesin mi? Genelde bir tane olur.
        }
      }
      if (found) return jsonSuccess("Geçmiş gün verisi güncellendi.");
      else
        return jsonError(
          "Belirtilen tarih (" +
            date +
            ") ve kuyruk numarası (" +
            kuyrukNo +
            ") için kayıt bulunamadı.",
        );
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
            techSheet.getRange("B11").setValue(updates.acTT);
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
                
                sheet.getRange(colLetter + rowIndex).setValue(valToSet);
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
      
      var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy");
      var logData = logSheet.getRange("A:A").getValues();
      var idMap = {};
      for (var i = 1; i < logData.length; i++) {
        var id = String(logData[i][0]).trim();
        if (id) idMap[id] = i + 1;
      }
      
      fleetData.forEach(function(data) {
        var kuyrukNo = data.kuyrukNo;
        var logId = dateStr + "_" + kuyrukNo;
        var rowData = [
          logId,
          dateStr,
          kuyrukNo,
          data.tip,
          data.govdeUcusSaati || 0,
          data.faydaliSaat || 0,
          data.konum,
          data.durum,
          data.durumAyrintisi,
          data.aciklama || ""
        ];
        
        if (idMap[logId]) {
          logSheet.getRange(idMap[logId], 1, 1, 10).setValues([rowData]);
          logSheet.getRange(idMap[logId], 10).setNumberFormat("@");
        } else {
          logSheet.appendRow(rowData);
          logSheet.getRange(logSheet.getLastRow(), 10).setNumberFormat("@");
        }
      });
      
      return jsonSuccess("Filo logları başarıyla güncellendi.");
    }

    if (action === "logSingleAircraftActivity") {
      var data = params.data;
      var dateStr =
        data.date ||
        Utilities.formatDate(
          new Date(),
          Session.getScriptTimeZone(),
          "dd.MM.yyyy",
        );
      var kuyrukNo = data.kuyrukNo;
      var id = dateStr + "_" + kuyrukNo;

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
      var logData = logSheet.getRange("A:A").getValues();
      var foundLog = false;
      for (var i = 1; i < logData.length; i++) {
        if (String(logData[i][0]).trim() === id) {
          logSheet
            .getRange(i + 1, 5, 1, 6)
            .setValues([
              [
                data.govdeUcusSaati || 0,
                data.faydaliSaat || 0,
                data.konum,
                data.durum,
                data.durumAyrintisi,
                data.aciklama || "",
              ],
            ]);
          // Açıklama sütununu (10. kolon) metin formatına zorla
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
          data.govdeUcusSaati || 0,
          data.faydaliSaat || 0,
          data.konum,
          data.durum,
          data.durumAyrintisi,
          data.aciklama || "",
        ]);
        // Yeni eklenen satırın açıklama hücresini metin yap
        logSheet.getRange(logSheet.getLastRow(), 10).setNumberFormat("@");
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
            .setValues([[data.durumAyrintisi, data.analizKodu]]);
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
          data.analizKodu,
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
      var id = data.date + "_" + data.kuyrukNo + "_" + data.startTime;
      intraDaySheet.appendRow([
        id,
        data.date,
        data.kuyrukNo,
        data.tip,
        data.startTime,
        data.endTime,
        data.status,
        data.description,
      ]);
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
  var attachments = [];
  var currentSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var currentSsId = currentSs
    ? currentSs.getId()
    : "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg";

  // Custom attachments from client (e.g. generated HTML-Excel)
  var skipEnvanter = false;
  if (customAttachments && customAttachments.length > 0) {
    customAttachments.forEach(function (att) {
      attachments.push(
        Utilities.newBlob(
          Utilities.base64Decode(att.data),
          att.mimeType,
          att.name,
        ),
      );
      if (att.name.toUpperCase().includes("ENVANTER RAPOR") || att.name.toUpperCase().includes("ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU")) skipEnvanter = true;
    });
  }

  var selectedReports = "";
  for (var key in recipient) {
    if (
      key.toUpperCase().includes("EK") ||
      key.toUpperCase().includes("ATTACHMENT") ||
      key.toUpperCase().includes("RAPOR")
    ) {
      selectedReports = recipient[key] || "";
      break;
    }
  }

  var targetEmail = "";
  for (var key in recipient) {
    if (
      key.toUpperCase().includes("MAİL") ||
      key.toUpperCase().includes("EMAIL")
    ) {
      targetEmail = recipient[key];
      break;
    }
  }

  if (!targetEmail) {
    console.error("Target email not found in recipient object");
    return;
  }

  var upperReports = selectedReports.toUpperCase();
  if (
    !skipEnvanter &&
    (upperReports.includes("ENVANTER RAPORU") ||
      upperReports.includes("ENVANTER HAVA ARACI DURUM RAPORU") ||
      upperReports.includes("ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU") ||
      upperReports.includes("ENVANTER RAPOR"))
  ) {
    try {
      var blob = generateEnvanterExcelBlob();
      if (blob) attachments.push(blob);
    } catch (e) {
      console.error("Error attaching Envanter Raporu: " + e.toString());
    }
  }

  // Faaliyet Çizelgesi ve diğer online excellere dokunmuyoruz ama log sayfalarını dahil etmiyoruz
  if (upperReports.includes("HAVA ARACI EXCELİ (ONLİNE)") || upperReports.includes("HAVA ARACI EXCELI")) {
    var platformIds = {
      "Bell-429": "1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ",
      "AT-802": "1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4",
      "T-70": "10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw",
      "B-360": "1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0",
      "C-650": "1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE",
    };

    for (var platform in platformIds) {
      try {
        var blob = getSheetAsExcel(
          platformIds[platform],
          platform + "_Online_Excel.xlsx",
        );
        if (blob) {
          attachments.push(blob);
        }
      } catch (e) {
        console.error("Error attaching " + platform + ": " + e.toString());
      }
    }
  }

  var body =
    "Sayın " +
    (recipient["PERSONEL ADI"] || "") +
    ",\n\n" +
    "Günlük hava aracı durum raporları ekte sunulmuştur.\n\n" +
    "İyi çalışmalar.";

  MailApp.sendEmail({
    to: targetEmail,
    subject:
      "OGM Hava Aracı Durum Raporu - " +
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "dd.MM.yyyy",
      ),
    body: body,
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
    "OR-1018": "ORMAN-18",
    "OR-1019": "ORMAN-19",
    "OR-1020": "ORMAN-20",
  };
  return mapping[tail] || "ORMAN-" + (tail.split("-")[1] || "XX");
}

function analyzeStatusGS(item) {
  if (!item) return "F";

  var toLowerTR = function (s) {
    return String(s || "")
      .replace(/I/g, "ı")
      .replace(/İ/g, "i")
      .toLowerCase()
      .trim();
  };
  var toUpperTR = function (s) {
    return String(s || "")
      .replace(/i/g, "İ")
      .replace(/ı/g, "I")
      .toUpperCase()
      .trim();
  };

  var detailUpper = toUpperTR(item.durumAyrintisi);
  var detail = toLowerTR(item.durumAyrintisi);
  var desc = toLowerTR(item.aciklama);
  var durumStr = toUpperTR(item.durum);

  // 1. ÖNCELİK: SADECE DURUM AYRINTISI İÇİNDE ARAMA
  if (
    detail.indexOf("kabul muayene") !== -1 ||
    detail.indexOf("kabul mua") !== -1
  )
    return "KM";
  if (
    detail.indexOf("kaza") !== -1 ||
    detail.indexOf("kırım") !== -1 ||
    detail.indexOf("kirim") !== -1
  )
    return "KK";
  if (
    detail.indexOf("parça bekler") !== -1 ||
    detail.indexOf("parca bekler") !== -1 ||
    detail === "pb"
  )
    return "PB";

  // TB İSTİSNASI: Durum ayrıntısında "tecrübe bekler" yazıyorsa kesinlikle TB
  if (
    detail.indexOf("tecrübe bekler") !== -1 ||
    detail.indexOf("tecrube bekler") !== -1 ||
    detail === "tb"
  )
    return "TB";

  if (
    detail.indexOf("bakım bekler") !== -1 ||
    detail.indexOf("bakim bekler") !== -1 ||
    (detail.indexOf("bakım") !== -1 &&
      (detail.indexOf("sıra") !== -1 || detail.indexOf("bekliyor") !== -1))
  )
    return "BB";
  if (detail.indexOf("arıza") !== -1 || detail.indexOf("ariza") !== -1)
    return "A";
  if (
    detail.indexOf("bakım") !== -1 ||
    detail.indexOf("bakim") !== -1 ||
    detail.indexOf("yıllık") !== -1 ||
    detail.indexOf("yillik") !== -1 ||
    detail.indexOf("periyodik") !== -1
  )
    return "B";
  if (detailUpper === "OLMADIĞI GÜNLER") return "X";

  // 2. AÇIKLAMA VE DURUM AYRINTISI İÇİNDE ARAMA (Fallback)
  var fullText = detail + " " + desc + " " + toLowerTR(item.durum);

  // KABUL MUAYENESİ -> KM
  if (
    fullText.indexOf("kabul muayenelerı") !== -1 ||
    fullText.indexOf("kabul muayeneleri") !== -1 ||
    fullText.indexOf("kabul mua") !== -1
  ) {
    return "KM";
  }

  // KAZA KIRIM -> KK
  if (
    fullText.indexOf("kaza") !== -1 ||
    fullText.indexOf("kırım") !== -1 ||
    fullText.indexOf("kirim") !== -1 ||
    fullText.indexOf("hasar") !== -1
  )
    return "KK";

  // PARÇA BEKLER -> PB (Öncelikli)
  if (
    fullText.indexOf("parça") !== -1 &&
    (fullText.indexOf("bekle") !== -1 ||
      fullText.indexOf("sipariş") !== -1 ||
      fullText.indexOf("siparis") !== -1)
  ) {
    return "PB";
  }

  // TECRÜBE BEKLER -> TB
  if (
    fullText.indexOf("tecrübe") !== -1 ||
    fullText.indexOf("tecrube") !== -1 ||
    fullText.indexOf("test") !== -1
  ) {
    if (
      detail.indexOf("test uçuşu") !== -1 ||
      detail.indexOf("test/tecrübe") !== -1 ||
      detail.indexOf("test/tecrube") !== -1 ||
      fullText.indexOf("bekliyor") !== -1 ||
      fullText.indexOf("bekler") !== -1 ||
      fullText.indexOf("sıra") !== -1
    ) {
      return "TB";
    }
  }

  // BAKIM BEKLER -> BB
  if (
    fullText.indexOf("bakım") !== -1 ||
    fullText.indexOf("bakim") !== -1 ||
    fullText.indexOf("yıllık") !== -1 ||
    fullText.indexOf("yillik") !== -1 ||
    fullText.indexOf("periyodik") !== -1 ||
    /\b\d+h\b/.test(fullText)
  ) {
    if (
      fullText.indexOf("bekliyor") !== -1 ||
      fullText.indexOf("bekler") !== -1 ||
      fullText.indexOf("sıra") !== -1 ||
      fullText.indexOf("sira") !== -1
    ) {
      return "BB";
    }
  }

  // ARIZA -> A
  if (
    fullText.indexOf("arıza") !== -1 ||
    fullText.indexOf("ariza") !== -1 ||
    fullText.indexOf("problem") !== -1
  ) {
    return "A";
  }

  // BAKIM -> B
  if (
    fullText.indexOf("bakım") !== -1 ||
    fullText.indexOf("bakim") !== -1 ||
    fullText.indexOf("yıllık") !== -1 ||
    fullText.indexOf("yillik") !== -1 ||
    fullText.indexOf("periyodik") !== -1 ||
    /\b\d+h\b/.test(fullText)
  ) {
    return "B";
  }

  // GAYRİ FAAL -> A (Eğer yukarıdakilerden hiçbiri değilse ama durum Gayri Faal ise)
  var isGayriFaalExplicit =
    durumStr.indexOf("GAYRİ") !== -1 ||
    durumStr.indexOf("GAYRI") !== -1 ||
    durumStr.indexOf("G.FAAL") !== -1;
  if (isGayriFaalExplicit) return "A";

  return "F";
}

function formatToHHMM(val) {
  if (val === null || val === undefined || val === "") return "00:00";
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
    val === "0" ||
    val === "00:00"
  )
    return null;
  if (typeof val === "number") {
    if (val <= 0) return null;
    if (aircraftType === "AT-802" && val < 100) return val * 24;
    return val;
  }
  if (typeof val === "string") {
    var s = val.trim().replace(",", ".");
    if (s.includes(":")) {
      var parts = s.split(":").map(Number);
      return (parts[0] || 0) + (parts[1] || 0) / 60;
    }
    var n = parseFloat(s);
    if (!isNaN(n)) {
      if (aircraftType === "Bell-429" && s.includes(".")) {
        var parts = s.split(".");
        return (parseInt(parts[0]) || 0) + (parseInt(parts[1]) || 0) / 60;
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
    var lastSent = recipient["SON GÖNDERİM"] || recipient["Son Gönderim"];

    if (type.includes("OTOMAT")) {
      var shouldSend = days.includes("HER") || days.includes(currentDay);
      if (shouldSend && time) {
        var tMin = timeToMinutes(time);
        var cMin = timeToMinutes(currentTime);
        if (Math.abs(cMin - tMin) <= 15 && lastSent !== todayStr) {
          sendReportEmail(recipient, [], ss);
          mailSheet.getRange(i + 1, lastSentIdx + 1).setValue(todayStr);
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

  var fleetData = getFleetDataFromServer();
  var dateStr = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd.MM.yyyy",
  );

  fleetData.forEach(function (item) {
    var id = dateStr + "_" + item.kuyrukNo;
    logSheet.appendRow([
      id,
      dateStr,
      item.kuyrukNo,
      item.tip,
      item.govdeUcusSaati || 0,
      item.faydaliSaat || 0,
      item.konum,
      item.durum,
      item.durumAyrintisi,
      item.aciklama,
    ]);
    // Açıklama sütununu (10. kolon) metin formatına zorla
    logSheet.getRange(logSheet.getLastRow(), 10).setNumberFormat("@");
  });

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

  fleetData.forEach(function (item) {
    var id = dateStr + "_" + item.kuyrukNo;
    faalLogSheet.appendRow([
      id,
      dateStr,
      item.kuyrukNo,
      item.tip,
      item.durumAyrintisi,
      analyzeStatusGS(item),
    ]);
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
        kuyrukNo: "B3:B40",
        durum: "C3:C40",
        durumAyrintisi: "D3:D40",
        konum: "E3:E40",
        faydaliSaat: "V3:AI40",
        govdeUcusSaati: "F3:F40",
        aciklama: "AL3:AL40",
      },
    },
    {
      type: "T-70",
      id: "10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw",
      mapping: {
        kuyrukNo: "A4:A6",
        faydaliSaat: "N4:N6",
        konum: "P4:P6",
        durum: "Q4:Q6",
        durumAyrintisi: "R4:R6",
        aciklama: "S4:S6",
        govdeUcusSaati: "E4:E6",
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
              // AT-802 range handling
              var validHours = data[key][i]
                .map(function (cell) {
                  return parseSingleCellToHour(cell, config.type);
                })
                .filter(function (h) {
                  return h !== null;
                });
              item[key] =
                validHours.length > 0 ? Math.min.apply(null, validHours) : 0;
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

function generateEnvanterExcelBlob() {
  var fleet = getFleetDataFromServer();
  var typeOrder = ["C-650", "B-360", "Bell-429", "AT-802", "T-70"];

  fleet.sort(function (a, b) {
    var indexA = typeOrder.indexOf(a.tip);
    var indexB = typeOrder.indexOf(b.tip);
    if (indexA !== indexB) return indexA - indexB;

    var getOrder = function (cagri) {
      var m = String(cagri).match(/ORMAN-(\d+)/i);
      return m ? parseInt(m[1]) : 999;
    };
    return getOrder(a.cagriKodu) - getOrder(b.cagriKodu);
  });

  var dateStr = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd.MM.yyyy",
  );

  var html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8" /><style>' +
    "table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }" +
    "th, td { border: 1px solid black; padding: 8px; text-align: center; vertical-align: middle; font-size: 11px; }" +
    ".title-row { font-weight: bold; font-size: 14px; text-align: center; }" +
    ".header-row th { font-weight: bold; background-color: #ffffff; color: black; }" +
    ".date-text { color: #d32f2f; font-weight: bold; text-align: right; font-size: 12px; }" +
    ".faal { background-color: #c6efce; color: #006100; font-weight: bold; }" +
    ".gayrifaal { background-color: #ffc7ce; color: #9c0006; font-weight: bold; }" +
    ".abbr-text { color: #d32f2f; font-weight: bold; margin-left: 4px; }" +
    ".aciklama-cell { text-align: left; font-style: italic; white-space: pre-wrap; }" +
    "</style></head><body><table>" +
    '<tr><td colspan="8" class="date-text" style="border: none;">' +
    dateStr +
    "</td></tr>" +
    '<tr><td colspan="8" class="title-row">ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU</td></tr>' +
    '<tr class="header-row">' +
    "<th>ÇAĞRI KODU</th>" +
    "<th>KUYRUK NUMARASI</th>" +
    "<th>DURUM</th>" +
    "<th>DURUM AYRINTISI</th>" +
    "<th>GÖVDE SAATİ</th>" +
    "<th>KONUM</th>" +
    "<th>FAYDALİ SAAT</th>" +
    "<th>AÇIKLAMA</th></tr>";

  var currentTip = "";
  var isGray = false;

  fleet.forEach(function (a) {
    if (a.tip !== currentTip) {
      currentTip = a.tip || "";
      isGray = !isGray;
    }
    var bgClass = isGray ? "background-color: #f2f2f2;" : "background-color: #ffffff;";

    var abbr = "";
    var tail = String(a.kuyrukNo).trim().toUpperCase();
    if (["OR-2021", "OR-2022", "OR-2023", "OR-2037"].includes(tail))
      abbr = " (DA)";
    else if (
      [
        "OR-2024",
        "OR-2025",
        "OR-2026",
        "OR-2027",
        "OR-2028",
        "OR-2029",
        "OR-2030",
        "OR-2031",
      ].includes(tail)
    )
      abbr = " (SA)";
    else if (tail === "OR-2036") abbr = " (DL)";
    else if (tail === "OR-2038") abbr = " (SL)";
    else if (tail === "OR-1020") abbr = " (H)";

    var isFaal =
      String(a.durum).toUpperCase().includes("FAAL") &&
      !String(a.durum).toUpperCase().includes("GAYRİ") &&
      !String(a.durum).toUpperCase().includes("GAYRI");
    var durumClass = isFaal ? "faal" : "gayrifaal";
    var faydali = a.tip === "T-70" ? (a.bakimKalanSaat || "-") : formatToHHMM(a.faydaliSaat);
    var aciklama = (a.aciklama || "").replace(/\n/g, "<br>");

    var durumText = a.durum || "";
    var alertText = a.durumAyrintisi && a.durumAyrintisi !== "-" ? a.durumAyrintisi : "";

    html +=
      "<tr>" +
      '<td style="' + bgClass + ' font-weight: bold;">' +
      (a.cagriKodu || "") +
      "</td>" +
      '<td style="' + bgClass + ' font-weight: bold;">' +
      (a.kuyrukNo || "") +
      ' <span class="abbr-text">' +
      abbr +
      "</span></td>" +
      '<td class="' +
      durumClass +
      '">' +
      durumText +
      "</td>" +
      '<td style="font-weight: bold; text-transform: uppercase;">' +
      alertText +
      "</td>" +
      '<td style="font-weight: bold; color: #FF6B00; mso-number-format:\'\\@\';">' +
      (a.govdeUcusSaati || "-") +
      "</td>" +
      '<td style="font-weight: bold; text-transform: uppercase;">' +
      (a.konum || "") +
      "</td>" +
      "<td style=\"mso-number-format:'\\@'; font-weight: bold; color: #1a73e8;\">" +
      faydali +
      "</td>" +
      '<td class="aciklama-cell">' +
      aciklama +
      "</td></tr>";
  });

  html += "</table><br/>";
  html += '<table style="width: 300px; border: none;">';
  html += '<tr><td style="border: none; text-align: left; font-weight: bold; font-size: 11px; padding: 2px;">KISALTMALAR:</td></tr>';
  html += '<tr><td style="border: none; text-align: left; font-size: 11px; padding: 2px;">(DA): DUAL AMFİBİ</td></tr>';
  html += '<tr><td style="border: none; text-align: left; font-size: 11px; padding: 2px;">(SA): SINGLE AMFİBİ</td></tr>';
  html += '<tr><td style="border: none; text-align: left; font-size: 11px; padding: 2px;">(DL): DUAL LAND</td></tr>';
  html += '<tr><td style="border: none; text-align: left; font-size: 11px; padding: 2px;">(SL): SINGLE LAND</td></tr>';
  html += '<tr><td style="border: none; text-align: left; font-size: 11px; padding: 2px;">(H): HELİTAK</td></tr>';
  html += "</table></body></html>";

  return Utilities.newBlob(
    html,
    "application/vnd.ms-excel",
    "ENVANTER HAVA ARAÇLARI GÜNLÜK DURUM RAPORU.xls",
  );
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
