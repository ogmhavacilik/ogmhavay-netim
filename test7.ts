import fetch from 'node-fetch';

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbzgBWsS3BDcfba2NM9CJi9W9Q5Dn0Fh5KO31wCb0vRygcH2z9F0FatqoxbZ5BotioPnrQ/exec";
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'getHistoricalData' })
  });
  console.log(await res.text());
}
test();
