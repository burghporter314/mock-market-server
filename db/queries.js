
const { pool } = require('./pool');

pool.on('connect', () => {
  console.log('connected to the db');
});

/**
 * Create Account Table
 */
const createAccountTable = async () => {
  const createQuery = `CREATE TABLE IF NOT EXISTS ACCOUNT(
      username VARCHAR(50) NOT NULL,
      PRIMARY KEY(username)
  );`;
  const val = await pool.query(createQuery);
  console.log(val);
};

/**
 * Create Sale Table
 */
const createSaleTable = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS SALE(
        id SERIAL PRIMARY KEY,
        account_username VARCHAR(50) NOT NULL,
        date TIMESTAMP NOT NULL,
        amount_sold INTEGER NOT NULL,
        average_cost FLOAT NOT NULL,
        ticker VARCHAR(20) NOT NULL,
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username)
    );`;
    const val = await pool.query(createQuery);
    console.log(val);
  };

/**
 * Create Purchase Table
 */
const createPurchaseTable = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS PURCHASE(
        id SERIAL PRIMARY KEY,
        account_username VARCHAR(50) NOT NULL,
        date TIMESTAMP NOT NULL,
        amount_purchased INTEGER NOT NULL,
        average_cost FLOAT NOT NULL,
        ticker VARCHAR(20) NOT NULL,
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username)
    );`;
    const val = await pool.query(createQuery);
    console.log(val);
  };

/**
 * Create Withdrawal Table
 */
const createWithdrawalTable = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS WITHDRAWAL(
        id SERIAL PRIMARY KEY,
        account_username VARCHAR(50) NOT NULL,
        date TIMESTAMP NOT NULL,
        amount INTEGER NOT NULL,
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username)
    );`;
    const val = await pool.query(createQuery);
    console.log(val);
  };

/**
 * Create Deposit Table
 */
const createDepositTable = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS DEPOSIT(
        id SERIAL PRIMARY KEY,
        account_username VARCHAR(50) NOT NULL,
        date TIMESTAMP NOT NULL,
        amount INTEGER NOT NULL,
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username)
    );`;
    const val = await pool.query(createQuery);
    console.log(val);
  };


/**
 * Drop Account Table
 */
const dropAccountTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS ACCOUNT';
    const val = await pool.query(dropQuery);
    console.log(val);
  };

/**
 * Drop Sale Table
 */
const dropSaleTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS SALE';
    const val = await pool.query(dropQuery);
    console.log(val);
  };

/**
 * Drop Purchase Table
 */
const dropPurchaseTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS PURCHASE';
    const val = await pool.query(dropQuery);
    console.log(val);
  };



/**
 * Drop Withdrawal Table
 */
const dropWithdrawalTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS WITHDRAWAL';
    const val = await pool.query(dropQuery);
    console.log(val);
  };

/**
 * Drop Deposit Table
 */
const dropDepositTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS DEPOSIT';
    const val = await pool.query(dropQuery);
    console.log(val);
  };

/**
 * Drop Deposit Table
 */
const printTables = async () => {
  const query = 'SELECT * FROM information_schema.tables;';
  const val = await pool.query(query);
};

/**
 * Create All Tables
 */
const createAllTables = async () => {
  await createAccountTable();
  await createSaleTable();
  await createPurchaseTable();
  await createWithdrawalTable();
  await createDepositTable();
  pool.end();
};


/**
 * Drop All Tables
 */
const dropAllTables = async () => {
  await dropDepositTable();
  await dropWithdrawalTable();
  await dropPurchaseTable();
  await dropSaleTable();
  await dropAccountTable();
  pool.end();
};

module.exports =  {
    createAllTables,
    dropAllTables,
};