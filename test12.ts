import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec";
  const res = await fetch(url + "?action=getAircraftData&sheetId=1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg");
  console.log(await res.text());
}
test();
