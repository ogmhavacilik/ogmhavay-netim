import fetch from 'node-fetch';

const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";

async function test() {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'getHistoricalData',
      sheetId: '1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg',
      date: '2024-02-25'
    })
  });
  console.log(await res.text());
}
test();
