const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: './.env.dev' });

// const serviceKey = "./config/keys.json";
console.log("before the env variable");
const serviceKey = process.env.GCP_KEY;
const parsedKey = JSON.parse(serviceKey);

const storage = new Storage({
  credentials: parsedKey,
  projectId: 'rare-mechanic-407521',
});

module.exports = storage;