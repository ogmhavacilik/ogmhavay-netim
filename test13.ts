import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
  const sheetNames = ['Sayfa1', 'Sheet1', 'Log', 'Geçmiş', 'Veriler'];
  
  for (const sheetName of sheetNames) {
    console.log(`Testing sheetName: ${sheetName}`);
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'getAircraftData',
        sheetId: '1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg',
        sheetName: sheetName,
        mapping: {
          tarih: 'A2:A5',
          kuyrukNo: 'B2:B5',
          tip: 'C2:C5',
          govdeUcusSaati: 'D2:D5',
          durum: 'E2:E5',
          durumAyrintisi: 'F2:F5',
          konum: 'G2:G5',
          faydaliSaat: 'H2:H5'
        }
      })
    });
    console.log(await res.text());
  }
}
test();
