import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      sheetId: '1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg',
      mapping: {
        id: 'A2:A10000',
        tarih: 'B2:B10000',
        kuyrukNo: 'C2:C10000',
        tip: 'D2:D10000',
        govdeUcusSaati: 'E2:E10000',
        faydaliSaat: 'F2:F10000',
        konum: 'G2:G10000',
        durum: 'H2:H10000',
        durumAyrintisi: 'I2:I10000',
        aciklama: 'J2:J10000',
        analizKodu: 'K2:K10000'
      }
    })
  });
  const data = await res.json();
  console.log(data.length);
}
test();
