import fetch from 'node-fetch';

async function test() {
  const res = await fetch("https://docs.google.com/spreadsheets/d/1Fw-l_O3vW45_TZs9GPQ19dt_NF0LagyWez4mVBvu6Bg/gviz/tq?tqx=out:csv");
  console.log(res.status);
  console.log(await res.text());
}
test();
