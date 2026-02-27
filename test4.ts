import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbxh6SyGVZfoby2CYc7FNk3JJQQW-P4Uh-Wx4ZupaRydrpY74FDblcyQBGac9XrphnQW/exec?action=getAircraftData&sheetId=1D83TF8K1QG30kBv2sCqnPCMYsdSbaJfcsw-E3S5A9VQ&fetchTechnicalDetails=false";
  const res = await fetch(url);
  console.log(res.status);
  console.log(await res.text());
}
test();