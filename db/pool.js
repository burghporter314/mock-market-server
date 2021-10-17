// Reads in environmental variables for db configuration.
require('dotenv').config()

const Pool = require('pg').Pool;

// This creates a remote connection to the heroku database.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = { pool };