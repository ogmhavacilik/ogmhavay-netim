function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    
    // KULLANICI BURAYA KENDİ OLUŞTURDUĞU BOŞ GOOGLE E-TABLO ID'SİNİ YAZMALIDIR.
    var LOG_SHEET_ID = "1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg"; 
    var logSs = SpreadsheetApp.openById(LOG_SHEET_ID);
    
    if (action === 'getFaaliyetLog') {
      var faaliyetLogSheet = logSs.getSheetByName("Faaliyet Log");
      if (!faaliyetLogSheet) {
        return ContentService.createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var data = faaliyetLogSheet.getDataRange().getValues();
      var results = [];
      
      // Başlıkları atla (ilk satır)
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
      
      return ContentService.createTextOutput(JSON.stringify(results))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (action === 'saveLogs') {
      var fleetData = contents.fleetData;
      if (fleetData && fleetData.length > 0) {
        kayitAlFromApp(logSs, fleetData);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Loglar güncellendi" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: "Bilinmeyen işlem" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Log Script Aktif.");
}

function kayitAlFromApp(logSs, fleetData) {
  var envanterLogSheet = logSs.getSheetByName("Envanter Log");
  if (!envanterLogSheet) {
    envanterLogSheet = logSs.insertSheet("Envanter Log");
    envanterLogSheet.appendRow([
      "ID", "Tarih", "Kuyruk No", "Tip", "Gövde Uçuş Saati", "Faydalı Saat", 
      "Konum", "Durum", "Durum Ayrıntısı", "Açıklama"
    ]);
    envanterLogSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#d9ead3");
  }

  var faaliyetLogSheet = logSs.getSheetByName("Faaliyet Log");
  if (!faaliyetLogSheet) {
    faaliyetLogSheet = logSs.insertSheet("Faaliyet Log");
    faaliyetLogSheet.appendRow([
      "ID", "Tarih", "Kuyruk No", "Tip", "Günlük Durum (Faal/Gayrı Faal vb.)", "Analiz Kodu"
    ]);
    faaliyetLogSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#cfe2f3");
  }

  var bugun = new Date();
  var tarihStr = Utilities.formatDate(bugun, Session.getScriptTimeZone(), "dd.MM.yyyy");

  var envanterData = envanterLogSheet.getDataRange().getValues();
  var faaliyetData = faaliyetLogSheet.getDataRange().getValues();

  var envanterRowMap = {};
  for (var r = 1; r < envanterData.length; r++) {
    var id = String(envanterData[r][0]).trim();
    if (id) envanterRowMap[id] = r + 1;
  }

  var faaliyetRowMap = {};
  for (var r = 1; r < faaliyetData.length; r++) {
    var id = String(faaliyetData[r][0]).trim();
    if (id) faaliyetRowMap[id] = r + 1;
  }

  var envanterVerileri = [];
  var faaliyetVerileri = [];

  for (var i = 0; i < fleetData.length; i++) {
    var aircraft = fleetData[i];
    var kuyrukNo = String(aircraft.kuyrukNo || "").trim();
    if (!kuyrukNo) continue;

    var tip = aircraft.tip || "";
    var govdeUcus = aircraft.govdeUcusSaati || "";
    var faydaliSaat = aircraft.faydaliSaat !== null && aircraft.faydaliSaat !== undefined ? aircraft.faydaliSaat : "";
    var konum = aircraft.konum || "";
    var durum = aircraft.durum || "";
    var durumAyrintisi = aircraft.durumAyrintisi || "";
    var aciklama = aircraft.aciklama || "";
    var analizKodu = aircraft.assignedCode || "F";

    // Envanter Log
    var envKey = tarihStr + "_" + kuyrukNo;
    var envRow = [envKey, tarihStr, kuyrukNo, tip, govdeUcus, faydaliSaat, konum, durum, durumAyrintisi, aciklama];
    
    if (envanterRowMap[envKey]) {
      envanterLogSheet.getRange(envanterRowMap[envKey], 1, 1, envRow.length).setValues([envRow]);
    } else {
      envanterVerileri.push(envRow);
    }

    // Faaliyet Log
    var faalKey = tarihStr + "_" + kuyrukNo;
    var faalRow = [faalKey, tarihStr, kuyrukNo, tip, durumAyrintisi, analizKodu];

    if (faaliyetRowMap[faalKey]) {
      faaliyetLogSheet.getRange(faaliyetRowMap[faalKey], 1, 1, faalRow.length).setValues([faalRow]);
    } else {
      faaliyetVerileri.push(faalRow);
    }
  }

  if (envanterVerileri.length > 0) {
    envanterLogSheet.getRange(envanterLogSheet.getLastRow() + 1, 1, envanterVerileri.length, envanterVerileri[0].length).setValues(envanterVerileri);
  }
  if (faaliyetVerileri.length > 0) {
    faaliyetLogSheet.getRange(faaliyetLogSheet.getLastRow() + 1, 1, faaliyetVerileri.length, faaliyetVerileri[0].length).setValues(faaliyetVerileri);
  }
}
