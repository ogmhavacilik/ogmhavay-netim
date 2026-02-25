function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    
    // KULLANICI BURAYA KENDİ OLUŞTURDUĞU BOŞ GOOGLE E-TABLO ID'SİNİ YAZMALIDIR.
    var LOG_SHEET_ID = "BURAYA_HEDEF_TABLO_ID_YAZILACAK"; 
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
        results.push({
          tarih: row[0],
          kuyrukNo: row[1],
          tip: row[2],
          durum: row[3],
          analizKodu: row[4] || ''
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify(results))
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

function kayitAl() {
  try {
    // 1. Envanter ve Faaliyet verilerinin kaydedileceği hedef tablo ID'si
    // KULLANICI BURAYA KENDİ OLUŞTURDUĞU BOŞ GOOGLE E-TABLO ID'SİNİ YAZMALIDIR.
    var LOG_SHEET_ID = "BURAYA_HEDEF_TABLO_ID_YAZILACAK"; 
    
    var logSs = SpreadsheetApp.openById(LOG_SHEET_ID);
    
    // 2. Sayfaları kontrol et, yoksa oluştur
    var envanterLogSheet = logSs.getSheetByName("Envanter Log");
    if (!envanterLogSheet) {
      envanterLogSheet = logSs.insertSheet("Envanter Log");
      // Başlıkları ekle
      envanterLogSheet.appendRow([
        "Tarih", "Kuyruk No", "Tip", "Gövde Uçuş Saati", "Faydalı Saat", 
        "Konum", "Durum", "Durum Ayrıntısı", "Açıklama"
      ]);
      envanterLogSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#d9ead3");
    }

    var faaliyetLogSheet = logSs.getSheetByName("Faaliyet Log");
    if (!faaliyetLogSheet) {
      faaliyetLogSheet = logSs.insertSheet("Faaliyet Log");
      // Başlıkları ekle
      faaliyetLogSheet.appendRow([
        "Tarih", "Kuyruk No", "Tip", "Günlük Durum (Faal/Gayrı Faal vb.)", "Analiz Kodu"
      ]);
      faaliyetLogSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#cfe2f3");
    }

    // Tetikleyici gece 00:00 - 01:00 arası çalışacağı için aslında "dünün" verisini kaydediyoruz.
    // Bu yüzden mevcut zamandan 2 saat çıkararak dünün tarihini elde ediyoruz.
    var bugun = new Date();
    var kayitTarihi = new Date(bugun.getTime() - 2 * 60 * 60 * 1000);
    var tarihStr = Utilities.formatDate(kayitTarihi, Session.getScriptTimeZone(), "dd.MM.yyyy");
    var gun = kayitTarihi.getDate();

    // 3. Kaynak tabloların ID'leri ve sayfa bilgileri
    var kaynakTablolar = [
      {
        tip: "Bell-429",
        id: "1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ",
        sheetName: null,
        kuyrukCol: 0, // A
        govdeUcusCol: 4, // E
        faydaliSaatCol: 8, // I
        konumCol: 11, // L
        durumCol: 12, // M
        durumAyrintisiCol: 13, // N
        aciklamaCol: 14, // O
        startRow: 3,
        endRow: 8
      },
      {
        tip: "AT-802",
        id: "1vyGHaD5k1H11Fokl5wUKB0fadJGmOugjbd42zLdtDz4",
        sheetName: "GÜNLÜK DURUM",
        kuyrukCol: 1, // B
        govdeUcusCol: 5, // F
        faydaliSaatCol: 21, // V
        konumCol: 4, // E
        durumCol: 2, // C
        durumAyrintisiCol: 3, // D
        aciklamaCol: 37, // AL
        startRow: 3,
        endRow: 14,
        gunlukDurumStartCol: 21 // V kolonu ayın 1'i
      },
      {
        tip: "T-70",
        id: "10Zsl_8A-7zx0lI-qCj5YDvVxMJlJsWI0TY7vetnkpsw",
        sheetName: null,
        kuyrukCol: 0, // A
        govdeUcusCol: 4, // E
        faydaliSaatCol: 13, // N
        konumCol: 15, // P
        durumCol: 16, // Q
        durumAyrintisiCol: 17, // R
        aciklamaCol: 18, // S
        startRow: 4,
        endRow: 6
      },
      {
        tip: "B-360",
        id: "1KB2pplUH4H9CYlkHjkkC2uQfSCHy1G5rXSFzraKTLk0",
        sheetName: null,
        kuyrukCol: 0, // A
        govdeUcusCol: 4, // E
        faydaliSaatCol: 8, // I
        konumCol: 12, // M
        durumCol: 13, // N
        durumAyrintisiCol: 14, // O
        aciklamaCol: 15, // P
        startRow: 3,
        endRow: 10
      },
      {
        tip: "C-650",
        id: "1hlNZdkyBzVsj_zf-ES_CNfear0Ju80qAx6S1R-GKSyE",
        sheetName: null,
        kuyrukCol: 0, // A
        govdeUcusCol: 4, // E
        faydaliSaatCol: 8, // I
        konumCol: 12, // M
        durumCol: 13, // N
        durumAyrintisiCol: 14, // O
        aciklamaCol: 15, // P
        startRow: 3,
        endRow: 10
      }
    ];

    var envanterVerileri = [];
    var faaliyetVerileri = [];

    for (var i = 0; i < kaynakTablolar.length; i++) {
      var kaynak = kaynakTablolar[i];
      try {
        var ss = SpreadsheetApp.openById(kaynak.id);
        var sheet = kaynak.sheetName ? ss.getSheetByName(kaynak.sheetName) : ss.getSheets()[0];
        if (!sheet) continue;

        var range = sheet.getRange(kaynak.startRow, 1, kaynak.endRow - kaynak.startRow + 1, 40);
        var values = range.getValues();

        for (var j = 0; j < values.length; j++) {
          var row = values[j];
          var kuyrukNo = row[kaynak.kuyrukCol];
          
          if (!kuyrukNo || String(kuyrukNo).trim() === "") continue;

          var govdeUcus = row[kaynak.govdeUcusCol] || "";
          var faydaliSaat = row[kaynak.faydaliSaatCol] || "";
          var konum = row[kaynak.konumCol] || "";
          var durum = row[kaynak.durumCol] || "";
          var durumAyrintisi = row[kaynak.durumAyrintisiCol] || "";
          var aciklama = row[kaynak.aciklamaCol] || "";

          // Envanter Log
          envanterVerileri.push([
            tarihStr, kuyrukNo, kaynak.tip, govdeUcus, faydaliSaat, konum, durum, durumAyrintisi, aciklama
          ]);

          // Faaliyet Log
          var gunlukDurum = durumAyrintisi;
          if (kaynak.tip === "AT-802" && kaynak.gunlukDurumStartCol) {
             gunlukDurum = row[kaynak.gunlukDurumStartCol + gun - 1] || durumAyrintisi;
          }
          
          var analizKodu = "F";
          var durumUpper = String(gunlukDurum).toUpperCase();
          if (durumUpper.indexOf("BAKIM") !== -1) {
            analizKodu = "B";
          } else if (durumUpper.indexOf("ARIZA") !== -1 || durumUpper.indexOf("PARÇA BEKLER") !== -1 || durumUpper.indexOf("KAZA KIRIM") !== -1) {
            analizKodu = "A";
          } else if (durumUpper.indexOf("OLMADIĞI GÜNLER") !== -1) {
            analizKodu = "X";
          } else if (durumUpper !== "-" && durumUpper !== "" && durumUpper !== "FAAL") {
            analizKodu = "B";
          }
          
          faaliyetVerileri.push([
            tarihStr, kuyrukNo, kaynak.tip, gunlukDurum, analizKodu
          ]);
        }
      } catch (e) {
        Logger.log("Hata (" + kaynak.tip + "): " + e.toString());
      }
    }

    // Verileri tablolara yaz
    if (envanterVerileri.length > 0) {
      envanterLogSheet.getRange(envanterLogSheet.getLastRow() + 1, 1, envanterVerileri.length, envanterVerileri[0].length).setValues(envanterVerileri);
    }
    if (faaliyetVerileri.length > 0) {
      faaliyetLogSheet.getRange(faaliyetLogSheet.getLastRow() + 1, 1, faaliyetVerileri.length, faaliyetVerileri[0].length).setValues(faaliyetVerileri);
    }

    Logger.log("Kayıt işlemi başarıyla tamamlandı.");
  } catch (err) {
    Logger.log("Genel Hata: " + err.toString());
  }
}
