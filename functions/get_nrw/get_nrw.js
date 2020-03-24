const fetch = require('node-fetch');
const {
  JSDOM
} = require('jsdom');

const stringify = require('csv-stringify/lib/sync');
const moment = require('moment');

const inhabitantsData = require('./inhabitants');
const studioData = require('./studios');

const url = `https://www.mags.nrw/coronavirus-fallzahlen-nrw`

const getData = async (params) => {
  // Unpack GET params
  const {
    studio: studioFilter,
  } = params;

  const resp = await fetch(url);
  if (!resp.ok) {
    console.log('Cannot fetch repo files:', resp.status, await resp.text());
    return
  }
  // Examine the text in the response
  const html = await resp.text();
  const doc = new JSDOM(html);

  // Get date of last update from text
  const textBlocks = doc.window.document.querySelectorAll('.field-item p');
  let textDate;
  for (const block of textBlocks) {
    const match = block.textContent.match(/Aktueller Stand: (.*)\./);
    if (match) {
      textDate = match[1];
      break;
    }
  }
  if (!textDate) {
    textDate = doc.window.document.querySelector('meta[name="dc.date.modified"]').content;
    textDate = moment(textDate).format('DD.MM.YYYY');
  }

  // Get data table
  const tables = doc.window.document.getElementsByTagName('table');
  const table = tables[0];
  const tableBody = table.querySelector('tbody');
  const rows = tableBody.querySelectorAll('tr');

  const data = [
    ['Landkreis/ kreisfreie Stadt', 'Infizierte', 'Tote', 'Einwohner', 'Infizierte pro 100.000 Einwohner', 'Stand']
  ];
  for (const row of rows) {
    const columns = Array.from(row.querySelectorAll('td'));
    const area = (
      columns[0].textContent
      .replace('(Kreis)', '')
      .replace('Aachen & ', '')
      .replace('Mülheim / Ruhr', 'Mülheim an der Ruhr')
      .replace(/\s+$/, ''));

    // Skip area if it's not in our filter
    if (area === 'Gesamt' || studioFilter && !studioData[studioFilter].includes(area)) {
      continue;
    }

    const infected = (
      columns[1].textContent
      .replace('.', '')
    );
    const dead = (
      columns[2].textContent
      .trim()
      .replace(',,', 0)
    );
    const inhabitants = inhabitantsData[area];

    const infectedPer100K = Math.round(infected * 10000000 / inhabitants + Number.EPSILON) / 100;

    data.push([area, infected, dead, inhabitants, infectedPer100K, textDate]);
  }
  return data;
}

// Look at the data
exports.handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));

  //const params = event.queryStringParameters || {};
  const params = {}; // disable filtering until caching problems are sorted out
  const checkData = await getData(params);
  // console.log(checkData);
  return {
    statusCode: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "max-age=300",
    },
    body: stringify(checkData, {
      header: false
    }),
  }
}