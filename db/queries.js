
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
        amount_sold DECIMAL NOT NULL,
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
        amount_purchased DECIMAL NOT NULL,
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
        amount DECIMAL NOT NULL,
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
        amount DECIMAL NOT NULL,
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
const createAllTables = async (request, response) => {
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
const dropAllTables = async (request, response) => {
  await dropDepositTable();
  await dropWithdrawalTable();
  await dropPurchaseTable();
  await dropSaleTable();
  await dropAccountTable();
  pool.end();
};

/**
 * Add an account
 */
const addAccountEntry = async (request, response) => {
  const username = request.query.username;
  if(username) {
    const createQuery = `INSERT INTO ACCOUNT (username) VALUES ($1);`;  
    const val = await pool.query(createQuery, [username], (err) => {
      if(err) {
        response.status(400).send(err);
      } else {
        response.status(200).send({
          username: username,
        });
      }
    });
    console.log(val);
  } else {
    response.status(400).send("Username is not defined in request body.");
  }
};

/**
 * Check if account exists
 */
const checkAccount = async (request, response) => {
  const username = request.query.username;
  if(username) {
    const createQuery = `SELECT * FROM ACCOUNT WHERE username=$1;`
    const val = await pool.query(createQuery, [username], (err, res) => {
      if(err) {
        response.status(400).send(err);
      } else {
        response.status(200).json(res.rows);
      }
    });
    console.log(val);
  } else {
    response.status(400).send("Username is not defined in request body.");
  }
}

/**
 * Add a withdrawal
 */
const addWithdrawalEntry = async (request, response) => {
  const username = request.query.username;
  const amount = request.query.amount;
  const total = await getAccountTotal(username);

  if(amount > total) {
    response.status(400).send("Unable to withdraw more than what is in the account.");
  } else {
    if(username && amount > 0) {
      const createQuery = `INSERT INTO WITHDRAWAL (account_username, date, amount) VALUES ($1, NOW(), $2);`;  
      const val = await pool.query(createQuery, [username, amount], async (err) => {
        if(err) {
          response.status(400).send(err.detail);
        } else {
          response.status(200).send({
            username: username,
            amount: amount,
            account_value: Number(total) - Number(amount),
          });
        }
      });
      console.log(val);
    } else {
      if(!username) {
        response.status(400).send("Username is not defined in request body.");
      } else {
        response.status(400).send("Amount must be postitive");
      }
    }
  }
};

/**
 * Add a withdrawal
 */
const addDepositEntry = async (request, response) => {
  const username = request.query.username;
  const amount = request.query.amount;

  if(username && amount > 0) {
    const createQuery = `INSERT INTO DEPOSIT (account_username, date, amount) VALUES ($1, NOW(), $2);`;  
    const val = await pool.query(createQuery, [username, amount], async (err) => {
      if(err) {
        response.status(400).send(err);
      } else {
        const newTotal = await getAccountTotal(username);
        response.status(200).send({
          username: username,
          amount: amount,
          account_value: newTotal,
        });
      }
    });
  } else {
    if(!username) {
      response.status(400).send("Username is not defined in request body.");
    } else {
      response.status(400).send("Amount must be postitive");
    }
  }
};

/**
 * Get the total account value by adding withdrawals and deposits
 */
const getAccountTotal = async (username) => {
  let withdrawalTotal = await getWithdrawalTotal(username);
  let depositTotal = await getDepositTotal(username);

  if(withdrawalTotal == null) {
    withdrawalTotal = 0;
  }

  if(depositTotal == null) {
    depositTotal = 0;
  }

  // Our total value is deposit minus withdrawal
  const total = Number(depositTotal) - Number(withdrawalTotal);
  return total;
}

/**
 * Get the total amount of withdrawals.
 */
const getWithdrawalTotal = async (username) => {
  if(username) {
    const createQuery = `SELECT sum(amount) FROM WITHDRAWAL where account_username=$1;`
    const val = await pool.query(createQuery, [username]);
    return val.rows[0].sum;
  } else {
    return new Error("Must specify username");
  }
};

/**
 * Get the total amount of deposits.
 */
const getDepositTotal = async (username) => {
  if(username) {
    const createQuery = `SELECT sum(amount) FROM DEPOSIT where account_username=$1;`
    const val = await pool.query(createQuery, [username]);
    return val.rows[0].sum;
  } else {
    return new Error("Must specify username");
  }
};

const printWithdrawalTable = async () => {
  const query = 'SELECT * FROM WITHDRAWAL;';
  const val = await pool.query(query);
  console.log(val);
};

module.exports =  {
    addAccountEntry,
    addDepositEntry,
    addWithdrawalEntry,
    checkAccount,
    createAllTables,
    dropAllTables,
};