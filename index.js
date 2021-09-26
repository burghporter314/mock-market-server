// Inspired by https://blog.logrocket.com/nodejs-expressjs-postgresql-crud-rest-api-example/

// Reads in environmental variables for db configuration.
require('dotenv').config()

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const { Client } = require('pg');

// This creates a remote connection to the heroku database.
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

app.listen(port, () => {
    console.log("server is listening...");
});

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})