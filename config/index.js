const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: './.env.dev' });

// const serviceKey = "./config/keys.json";
const serviceKey = process.env.GCP_KEY;
console.log("Servicxe key is: ", serviceKey);
const parsedKey = JSON.parse(serviceKey);

const storage = new Storage({
  credentials: parsedKey,
  projectId: 'rare-mechanic-407521',
});

module.exports = storage;