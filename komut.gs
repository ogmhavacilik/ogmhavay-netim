/**
 * OGM HAVACILIK - GENEL VERİ ÇEKME SCRİPTİ (V6 - ABSOLUTE ISOLATION)
 * Bu sürümde filtreleme "Tam Eşleşme" esasına dayanır.
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return jsonError("Post verisi alınamadı.");
    var params = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(params.sheetId);
    var action = params.action || "getAircraftData";

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

    // 🟠 GÜNCELLEME AKSİYONU
    if (action === "updateAircraftData") {
      var sheetName = params.sheetName;
      var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
      if (!sheet) return jsonError("Sayfa bulunamadı.");
      
      var kuyrukNo = params.kuyrukNo;
      var updates = params.updates;
      var mapping = params.mapping;
      
      // AT-802 için teknik verileri "Genel" sayfasına yaz
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
      
      // Ana sayfa için kuyruk numarasını bul
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
        // Sadece teknik veriler güncellenmiş olabilir
        if (updates.acTT !== undefined) return jsonSuccess("Sadece teknik veriler güncellendi.");
        return jsonError("Kuyruk numarası bulunamadı.");
      }
      
      // Güncellemeleri uygula (Ana sayfa)
      Object.keys(updates).forEach(function(key) {
        if (mapping[key] && updates[key] !== undefined) {
          var colLetter = mapping[key].split(':')[0].replace(/[0-9]/g, ''); // Sadece harfi al (örn: "E3:E14" -> "E")
          var cellAddress = colLetter + rowIndex;
          sheet.getRange(cellAddress).setValue(updates[key]);
        }
      });
      
      return jsonSuccess("Veriler güncellendi.");
    }
  } catch (err) {
    return jsonError(err.toString());
  }
}

function jsonError(msg) { return ContentService.createTextOutput(JSON.stringify({success: false, error: msg})).setMimeType(ContentService.MimeType.JSON); }
function jsonSuccess(data) { return ContentService.createTextOutput(JSON.stringify({success: true, data: data})).setMimeType(ContentService.MimeType.JSON); }

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
  var sheets = ss.getSheets();
  var target = name.toUpperCase().replace(/\./g, "");
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().toUpperCase().replace(/\./g, "");
    if (sName === target) return sheets[i];
  }
  return null;
}
function doGet() { return ContentService.createTextOutput("OGM Servis Aktif."); }