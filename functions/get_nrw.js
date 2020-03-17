const fetch = require('node-fetch')

const getData = async () => {
  await fetch('https://www.mags.nrw/coronavirus-fallzahlen-nrw')
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }

      // Examine the text in the response
      response.text().then(function(data) {
        console.log(data.getElementsByTagName('table'));
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}

// Look at the data
async function run() {
  const checkData = await getData();
  console.log(checkData);
}

run();