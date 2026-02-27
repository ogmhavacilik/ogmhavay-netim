import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      sheetId: '1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg',
      mapping: {
        id: 'A2:A10',
        tarih: 'B2:B10',
        kuyrukNo: 'C2:C10',
        tip: 'D2:D10',
        govdeUcusSaati: 'E2:E10',
        durum: 'F2:F10',
        durumAyrintisi: 'G2:G10',
        aciklama: 'H2:H10',
        analizKodu: 'I2:I10',
        konum: 'J2:J10',
        faydaliSaat: 'K2:K10'
      }
    })
  });
  console.log(await res.text());
}
test();
