// Inspired by https://blog.logrocket.com/nodejs-expressjs-postgresql-crud-rest-api-example/

// Reads in environmental variables for db configuration.
require('dotenv').config()

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const { pool } = require('./db/pool');
const { createAllTables, dropAllTables } = require('./db/queries');

app.listen(port, () => {
    console.log("server is listening...");
    createAllTables()
});

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})