const fetch = require('node-fetch');
const {
  JSDOM
} = require('jsdom');

const stringify = require('csv-stringify/lib/sync');
const moment = require('moment-timezone');

const inhabitantsData = require('./inhabitants');

const url = `https://www.mags.nrw/coronavirus-fallzahlen-nrw`

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
  const rows = tableBody.querySelectorAll('tr');

  const data = [
    ['Landkreis/Kreisfreie Stadt', 'Bestätigte Fälle', 'Einwohner', 'Infizierte pro 100.000 Einwohner', 'Stand']
  ];
  for (const row of rows) {
    const columns = Array.from(row.querySelectorAll('td'));
    const area = (
      columns[0].textContent
      .replace('(Kreis)', '')
      .replace('Aachen & ', '')
      .replace('Mülheim / Ruhr', 'Mühlheim an der Ruhr')
      .replace(/\s+$/, ''))
    const infected = (
      columns[1].textContent
      .replace('.', '')
    )
    const inhabitants = inhabitantsData[area];
    const infectedPer100K = Math.round(infected * 10000000 / inhabitants + Number.EPSILON) / 100
    const day = moment.tz('Europe/Berlin').format('DD.MM.YYYY')
    data.push([area, infected, inhabitants, infectedPer100K, day])
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