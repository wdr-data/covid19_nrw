const fetch = require('node-fetch')

const get_data = async () => {
  await fetch('https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html')
  .then((response) => {
    return response.text();
  })
  .then((data) => {
    console.log(data);
  });
}

get_data();