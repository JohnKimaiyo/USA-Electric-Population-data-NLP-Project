const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Data Engineer Kimaiyo!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const apiUrl = 'https://data.wa.gov/api/views/f6w7-q2d2/rows.json?accessType=DOWNLOAD';

// Function to fetch data from the API
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (error) {
          reject(`Error parsing JSON: ${error.message}`);
        }
      });
    }).on('error', (err) => {
      reject(`Error fetching data: ${err.message}`);
    });
  });
}

// Function to write data to a JSON file
function writeToFile(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(`Error writing to file: ${err.message}`);
      } else {
        console.log(`Data successfully written to ${filename}`);
        resolve();
      }
    });
  });
}

// Main function to fetch, save, and optionally process the data
async function main() {
  try {
    console.log('Fetching data from API...');
    const data = await fetchData(apiUrl);
    console.log('Data fetched successfully. Writing to files...');

    const outputDir = path.join(__dirname, 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write JSON file
    const jsonFilename = path.join(outputDir, 'usa_electric_car_data.json');
    await writeToFile(jsonFilename, data);

    console.log('All tasks completed successfully!');
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}
// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));


// Call the main function immediately
main();

// Schedule the main function to run every 24 hours (86,400,000 milliseconds)
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
setInterval(main, ONE_DAY_IN_MS);
