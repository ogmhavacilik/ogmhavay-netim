import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'getAircraftData',
      sheetId: '1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg',
      mapping: {
        kuyrukNo: 'A3:A10',
        govdeSN: 'B3:B10',
        motor1SN: 'C3:C10',
        motor2SN: 'D3:D10',
        govdeUcusSaati: 'E3:E10',
        landings: 'H3:H10',
        faydaliSaat: 'I3:I10',
        bakim200H: 'J3:J10',
        bakimTakvimTarih: 'K3:K10',
        konum: 'M3:M10',
        durum: 'N3:N10',
        durumAyrintisi: 'O3:O10',
        aciklama: 'P3:P10'
      },
      date: '25.02.2026'
    })
  });
  console.log(await res.text());
}
test();