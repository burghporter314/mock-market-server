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
        addPurchaseEntry,
        addSaleEntry,
        addWithdrawalEntry,
        checkAccount,
        createAllTables,
        dropAllTables,
        getAccountDetailsSummary} = require('./db/queries');

const { getTickerDailyInfo, getTickerResults } = require('./market/queries');

app.listen(port, () => {
    console.log("server is listening...");
    // Creates all the tables if they do not exist already in the database. The operations must not be concurrent due to the foreign key nature of the tables.
    // createAllTables()
});

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

// APP-SPECIFIC API GET CALLS

app.get('/account', checkAccount);

app.get('/account/details', getAccountDetailsSummary)

// APP-SPECIFIC API POST CALLS

app.post('/account', addAccountEntry);

app.post('/deposit', addDepositEntry);

app.post('/withdrawal', addWithdrawalEntry);

app.post('/purchase', addPurchaseEntry);

app.post('/sale', addSaleEntry);

// MARKET API

app.get('/query', getTickerResults);

app.get('/ticker/info', getTickerDailyInfo);