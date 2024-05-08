// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// In-memory storage for CSV data
let energyData = [];

// Load data from CSV into memory
function loadData() {
  const tempData = [];
  fs.createReadStream('./data/device-saving.csv')
    .pipe(csv())
    .on('data', (row) => {
      // Convert date strings to Date objects and numbers to float
      row.device_id = parseInt(row.device_id, 10);
      row.timestamp = new Date(row.timestamp);
      row.device_timestamp = new Date(row.device_timestamp);
      row.carbon_saved = parseFloat(row.carbon_saved);
      row.fueld_saved = parseFloat(row.fueld_saved);
      tempData.push(row);
    })
    .on('end', () => {
      energyData = tempData; // Replace old data
      console.log('CSV data loaded into memory.');
    });
}

// Call loadData to initialize data
loadData();

// Define API routes
app.get('/', (req, res) => {
  res.send('Hello, World! This is the Root of API.');
});

// Endpoint to get all data
app.get('/api/energy-data', (req, res) => {
  res.json(energyData);
});

// Endpoint to get data by device ID
app.get('/api/energy-data/:id', (req, res) => {
  const { id } = req.params;
  const filteredData = energyData.filter(item => item.device_id === Number(id));
  if (filteredData.length > 0) {
    res.json(filteredData);
  } else {
    res.status(404).json({ error: 'Device not found' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});