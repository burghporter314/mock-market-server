// Inspired by https://blog.logrocket.com/nodejs-expressjs-postgresql-crud-rest-api-example/

// Reads in environmental variables for db configuration.
require('dotenv').config()

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const { pool } = require('./db/pool');
const { addAccountEntry,
        addDepositEntry,
        addWithdrawalEntry,
        checkAccount,
        createAllTables,
        dropAllTables} = require('./db/queries');

app.listen(port, () => {
    console.log("server is listening...");
    // Creates all the tables if they do not exist already in the database. The operations must not be concurrent due to the foreign key nature of the tables.
    // createAllTables()
});

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/account', checkAccount);

app.post('/account', addAccountEntry);

app.post('/deposit', addDepositEntry);

app.post('/withdrawal', addWithdrawalEntry);