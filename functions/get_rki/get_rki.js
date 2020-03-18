const fetch = require('node-fetch');
const {
  JSDOM
} = require('jsdom')

const stringify = require('csv-stringify/lib/sync');

const url = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html`

const getData = async () => {
  const resp = await fetch(url);
  if (!resp.ok) {
    console.log('Cannot fetch repo files:', resp.status, await resp.text());
    return
  }
  // Examine the text in the response
  const html = await resp.text();
  const doc = new JSDOM(html);
  const tables = doc.window.document.getElementsByTagName('table');
  const table = tables[0];
  const tableBody = table.querySelector('tbody');
  const columns = tableBody.querySelectorAll('tr');
  const data = [
    ['Bundesland', 'Erkrankte', 'Dif­fe­renz zum Vor­tag', 'Erkrankte pro 100.000 Einw.', 'Todes­fälle', 'Beson­ders be­trof­fene Gebiete']
  ];
  for (const col of columns) {
    const rows = Array.from(col.querySelectorAll('td'));
    data.push(rows.map(row => row.textContent.replace('.', '')))
  }
  return data;
}

// Look at the data
exports.handler = async () => {
  const checkData = await getData();
  console.log(checkData);
  return {
    statusCode: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "max-age=3600"
    },
    body: stringify(checkData, {
      header: false
    }),
  }
}