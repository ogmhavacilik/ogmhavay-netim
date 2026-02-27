import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'getAircraftData',
      sheetId: '1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg',
      sheetName: 'Geçmiş',
      mapping: {
        id: 'A2:A1000',
        tarih: 'B2:B1000',
        kuyrukNo: 'C2:C1000',
        tip: 'D2:D1000',
        govdeUcusSaati: 'E2:E1000',
        durum: 'F2:F1000',
        durumAyrintisi: 'G2:G1000',
        aciklama: 'H2:H1000',
        analizKodu: 'I2:I1000',
        konum: 'J2:J1000',
        faydaliSaat: 'K2:K1000'
      }
    })
  });
  console.log(await res.text());
}
test();