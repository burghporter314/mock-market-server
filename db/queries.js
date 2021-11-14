
const { pool } = require('./pool');
const { getCurrentPrice } = require('../market/queries');

pool.on('connect', () => {
  console.log('connected to the db');
});

pool.on('error', (err) => {
  console.log(err);
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
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username) ON DELETE CASCADE
    );`;
    const val = await pool.query(createQuery);
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
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username) ON DELETE CASCADE
    );`;
    const val = await pool.query(createQuery);
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
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username) ON DELETE CASCADE
    );`;
    const val = await pool.query(createQuery);
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
        FOREIGN KEY(account_username) REFERENCES ACCOUNT(username) ON DELETE CASCADE
    );`;
    const val = await pool.query(createQuery);
  };


/**
 * Drop Account Table
 */
const dropAccountTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS ACCOUNT';
    const val = await pool.query(dropQuery);
  };

/**
 * Drop Sale Table
 */
const dropSaleTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS SALE';
    const val = await pool.query(dropQuery);
  };

/**
 * Drop Purchase Table
 */
const dropPurchaseTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS PURCHASE';
    const val = await pool.query(dropQuery);
  };



/**
 * Drop Withdrawal Table
 */
const dropWithdrawalTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS WITHDRAWAL';
    const val = await pool.query(dropQuery);
  };

/**
 * Drop Deposit Table
 */
const dropDepositTable = async () => {
    const dropQuery = 'DROP TABLE IF EXISTS DEPOSIT';
    const val = await pool.query(dropQuery);
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

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  }

  const createQuery = `INSERT INTO ACCOUNT (username) VALUES ($1) ON CONFLICT DO NOTHING;`;  
  const val = await pool.query(createQuery, [username], (err) => {
    if(err) {
      response.status(400).send(err);
    } else {
      response.status(200).send({
        username: username,
      });
    }
  });
};

/**
 * Delete an account
 */
const deleteAccountEntry = async (request, response) => {
  const username = request.query.username;

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  }

  const createQuery = `DELETE FROM ACCOUNT WHERE username = $1`;  
  const val = await pool.query(createQuery, [username], (err) => {
    if(err) {
      response.status(400).send(err);
    } else {
      response.status(200).send({
        username: username,
      });
    }
  });

};

/**
 * Check if account exists
 */
const checkAccount = async (request, response) => {
  const username = request.query.username;

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  }

  const createQuery = `SELECT * FROM ACCOUNT WHERE username=$1;`
  const val = await pool.query(createQuery, [username], (err, res) => {
    if(err) {
      response.status(400).send(err);
    } else {
      response.status(200).json(res.rows);
    }
  });
}

/**
 * Add a withdrawal
 */
const addWithdrawalEntry = async (request, response) => {
  const username = request.query.username;
  const amount = request.query.amount;

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  } else if(!amount) {
    response.status(400).send("Amount is not defined in request body.");
    return;
  }

  const accountDetails = await getAccountDetails(username);

  const checkAccount = `SELECT * FROM ACCOUNT WHERE username=$1;`
  const accountExists = await pool.query(checkAccount, [username]);

  if((accountExists.rows[0] == undefined)) {
    response.status(400).send("Username does not exist in the system");
    return;
  }

  if(amount > accountDetails.total) {
    response.status(400).send("Unable to withdraw more than what is in the account.");
  } else {
    if(amount > 0) {
      const createQuery = `INSERT INTO WITHDRAWAL (account_username, date, amount) VALUES ($1, NOW(), $2);`;  
      const val = await pool.query(createQuery, [username, amount], async (err) => {
        if(err) {
          response.status(400).send(err.detail);
        } else {
          response.status(200).send({
            username: username,
            amount: amount,
            account_value: Number(accountDetails.total) - Number(amount),
          });
        }
      });
    } else {
      response.status(400).send("Amount must be positive");
    }
  }
};

/**
 * Add a deposit
 */
const addDepositEntry = async (request, response) => {
  const username = request.query.username;
  const amount = request.query.amount;

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  } else if(!amount) {
    response.status(400).send("Amount is not defined in request body.");
    return;
  }

  if(amount > 0) {

    const checkAccount = `SELECT * FROM ACCOUNT WHERE username=$1;`
    const accountExists = await pool.query(checkAccount, [username]);

    if((accountExists.rows[0] == undefined)) {
      response.status(400).send("Username does not exist in the system");
      return;
    }

    const createQuery = `INSERT INTO DEPOSIT (account_username, date, amount) VALUES ($1, NOW(), $2);`;  
    const val = await pool.query(createQuery, [username, amount], async (err) => {
      if(err) {
        response.status(400).send(err);
      } else {
        const newTotal = await getAccountDetails(username);
        response.status(200).send({
          username: username,
          amount: amount,
          account_value: newTotal.total,
        });
      }
    });
  } else {
    response.status(400).send("Amount must be positive");
  }
};

/**
 * Add a purchase
 */
const addPurchaseEntry = async (request, response) => {
  const username = request.query.username;
  const amount = request.query.amount;
  const ticker = request.query.ticker;

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  } else if(!amount) {
    response.status(400).send("Amount is not defined in request body.");
    return;
  } else if(!ticker) {
    response.status(400).send("Ticker is not defined in request body.");
    return;
  }

  const currentPrice = await getCurrentPrice(ticker);
  const accountDetails = await getAccountDetails(username);

  const checkAccount = `SELECT * FROM ACCOUNT WHERE username=$1;`
  const accountExists = await pool.query(checkAccount, [username]);

  if((accountExists.rows[0] == undefined)) {
    response.status(400).send("Username does not exist in the system");
    return;
  }

  if(currentPrice.c) {
    if((Number(amount) * Number(currentPrice.c)) > Number(accountDetails.total)) {
      response.status(400).send("Cannot buy more than what's available in account");
      return;
    }
  } else {
    response.status(400).send("Cannot get current price for stock. Unable to make purchase");
    return;
  }

  if(amount > 0) {

    const createQuery = `INSERT INTO PURCHASE (account_username, date, amount_purchased, average_cost, ticker) VALUES ($1, NOW(), $2, $3, $4);`;  
    const val = await pool.query(createQuery, [username, amount, currentPrice.c, ticker], async (err) => {
      if(err) {
        response.status(400).send(err);
      } else {
        response.status(200).send({
          username: username,
          amount: amount,
          average_cost: currentPrice.c,
          ticker: ticker,
          account_value: Number(accountDetails.total) - (Number(amount) * Number(currentPrice.c))
        });
      }
    });
  } else {
    response.status(400).send("Amount must be positive");
  }
};

/**
 * Add a sale
 */
const addSaleEntry = async (request, response) => {
  const username = request.query.username;
  const amount = request.query.amount;
  const ticker = request.query.ticker;

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  } else if(!amount) {
    response.status(400).send("Amount is not defined in request body.");
    return;
  } else if(!ticker) {
    response.status(400).send("Ticker is not defined in request body.");
    return;
  }

  const currentPrice = await getCurrentPrice(ticker);
  const accountDetails = await getAccountDetails(username);
  const totalCurrentStock = await getTickerTotal(username, ticker);

  const checkAccount = `SELECT * FROM ACCOUNT WHERE username=$1;`
  const accountExists = await pool.query(checkAccount, [username]);

  if((accountExists.rows[0] == undefined)) {
    response.status(400).send("Username does not exist in the system");
    return;
  }

  if(currentPrice.c) {
    if(Number(amount) > totalCurrentStock) {
      response.status(400).send("Cannot sell more stock than you currently own.");
      return;
    }
  } else {
    response.status(400).send("Cannot get current price for stock. Unable to make sale");
    return;
  }

  if(amount > 0) {

    const createQuery = `INSERT INTO SALE (account_username, date, amount_sold, average_cost, ticker) VALUES ($1, NOW(), $2, $3, $4);`;  
    const val = await pool.query(createQuery, [username, amount, currentPrice.c, ticker], async (err) => {
      if(err) {
        response.status(400).send(err);
      } else {
        response.status(200).send({
          username: username,
          amount: amount,
          average_cost: currentPrice.c,
          ticker: ticker,
          account_value: Number(accountDetails.total) + (Number(amount) * Number(currentPrice.c))
        });
      }
    });
  } else {
    response.status(400).send("Amount must be positive");
  }
};

/**
 * This retrieves the account information for all stocks, deposits, and withdraws on the account
 */
const getAccountDetailsSummary = async (request, response) => {
  const username = request.query.username;

  if(!username) {
    response.status(400).send("Username is not defined in request body.");
    return;
  }

  const checkAccount = `SELECT * FROM ACCOUNT WHERE username=$1;`
  const accountExists = await pool.query(checkAccount, [username]);

  if((accountExists.rows[0] == undefined)) {
    await addAccountEntry(request, response);
    return;
  }

  const accountDetails = await getAccountDetails(username);
  response.status(200).send(accountDetails);

}

/**
 * Calculate the total profit or loss of a given portfolio
 */
const calculateStockProfitOrLoss = async(username) => {

  const createPurchasesQuery = `SELECT * FROM PURCHASE WHERE account_username=$1;`
  const purchases = await pool.query(createPurchasesQuery, [username]);
  
  const createSalesQuery = `SELECT * FROM SALE WHERE account_username=$1;`
  const sales = await pool.query(createSalesQuery, [username]);

  // Need to concatenate the two results so that we can perform the FIFO algorithm to determine profit.
  // contains fields: account_username, date, amount_sold, average_cost, ticker
  const actions = purchases.rows.concat(sales.rows);

  // We need to map all of the stock tickers to their associated buy and sell actions
  let map = {};
  for(let i = 0; i < actions.length; i++) {
    let stockAction = [];
    if(map.hasOwnProperty(actions[i].ticker)) {
      // If the ticker entry already exists, simply append to the existing map
      map[actions[i].ticker].push(actions[i]);
    } else {
      // If the ticker entry does not exist, create a new array with that action entry.
      map[actions[i].ticker] = [actions[i]];
    }
  }
  
  let results = {stocks: {}};
  let accountProfit = 0;
  let accountStockTotal = 0;
  for (const [item, itemActions] of Object.entries(map)) {

    // Seperate the type of actions so that they can be applied in a FIFO order.
    buyActions = [];
    sellActions = [];

    // Iterate through the item actions and seperate them by buy and sell.
    while(itemActions.length != 0) {
      let item = itemActions.pop();
      if(item.hasOwnProperty('amount_purchased')) {
        buyActions.push(item);
      } else {
        sellActions.push(item);
      }
    }

    // This calculates profit for already sold stocks
    let soldProfit = 0;
    while(sellActions.length != 0) {

      // To calculate profit for a given stock, we need the average price and amount purchased or sold for all actions.
      let buyActionBoughtAt = parseFloat(buyActions.slice(-1)[0].average_cost);
      let buyActionAmount = parseFloat(buyActions.slice(-1)[0].amount_purchased);

      let sellActionBoughtAt = parseFloat(sellActions.slice(-1)[0].average_cost);
      let sellActionAmount = parseFloat(sellActions.slice(-1)[0].amount_sold);
      
      // In this case, the first buyAction amount is greater than the sell that we are processing. Because of this, we can close out the entire sell.
      if(buyActionAmount > sellActionAmount) {
        soldProfit = soldProfit + (sellActionAmount * (sellActionBoughtAt - buyActionBoughtAt));
        buyActions[buyActions.length - 1].amount_purchased = (buyActionAmount - sellActionAmount).toString();
        sellActions.pop();

      // In this case, the first buyAction amount is less than the sell amount. Because of this, we close out the buy and move on to the next.
      } else if (buyActionAmount < sellActionAmount) {
        soldProfit = soldProfit + (buyActionAmount * (sellActionBoughtAt - buyActionBoughtAt));
        sellActions[sellActions.length - 1].amount_sold = (sellActionAmount - buyActionAmount).toString();
        buyActions.pop();

      // In this case, the buy amount and sell amount are equal, so we close out both.
      } else {
        soldProfit = soldProfit + (sellActionAmount * (sellActionBoughtAt - buyActionBoughtAt));
        buyActions.pop();
        sellActions.pop();
      }
    }
    
    // This calculates the current profit with the actively purchased stocks.
    let currentProfit = 0;
    let currentPrice;
    let totalStockAmount = 0;

    // Get the current price of the stock
    currentPrice = await getCurrentPrice(item);
    
    while(buyActions.length != 0) {
      let entry = buyActions.pop();
      totalStockAmount = totalStockAmount + parseFloat(entry.amount_purchased);
      currentProfit = currentProfit + (parseFloat(entry.amount_purchased) * (currentPrice.c - entry.average_cost));
    }

    let totalProfit = currentProfit + soldProfit;
    accountProfit = accountProfit + totalProfit;

    if(currentPrice) {
      accountStockTotal = accountStockTotal + (totalStockAmount * currentPrice.c);
    }

    results.stocks[item] = {
      currentProfit,
      soldProfit,
      totalStockAmount,
      totalProfit,
      ...currentPrice
    }
  }
  
  results.accountProfit = accountProfit;
  results.accountStockTotal = accountStockTotal;

  return results;
}

/**
 * Gets the 'net' total of the ticker. I.E. how many outstanding shares left.
 */
getTickerTotal = async (username, ticker) => {
  let purchaseTotal = await getTickerPurchaseTotal(username, ticker);
  let saleTotal = await getTickerSaleTotal(username, ticker);

  if(purchaseTotal == null) {
    purchaseTotal = 0;
  }

  if(saleTotal == null) {
    saleTotal = 0;
  }

  // Our total value is deposit minus withdrawal
  const total = Number(purchaseTotal) - Number(saleTotal);
  return total;
}

/**
 * Get the total amount of withdrawals.
 */
const getTickerPurchaseTotal = async (username, ticker) => {
  if(username) {
    const createQuery = `SELECT sum(amount_purchased) FROM PURCHASE where account_username=$1 AND ticker=$2;`
    const val = await pool.query(createQuery, [username, ticker]);
    return val.rows[0].sum;
  } else {
    return new Error("Must specify username");
  }
};

/**
 * Get the total amount of deposits.
 */
const getTickerSaleTotal = async (username, ticker) => {
  if(username) {
    const createQuery = `SELECT sum(amount_sold) FROM SALE where account_username=$1 AND ticker=$2;`
    const val = await pool.query(createQuery, [username, ticker]);
    return val.rows[0].sum;
  } else {
    return new Error("Must specify username");
  }
};


/**
 * Get the total account details by adding withdrawals and deposits and returning stock information
 */
const getAccountDetails = async (username) => {
  let withdrawalTotal = await getWithdrawalTotal(username);
  let depositTotal = await getDepositTotal(username);
  let stockTotal = await calculateStockProfitOrLoss(username);

  if(withdrawalTotal == null) {
    withdrawalTotal = 0;
  }

  if(depositTotal == null) {
    depositTotal = 0;
  }

  // Our total value is deposit minus withdrawal minus existing securities plus any profits made on stocks.
  const total = Number(depositTotal) - Number(withdrawalTotal) - Number(stockTotal.accountStockTotal) + Number(stockTotal.accountProfit);
  const accountDetails = {
    total,
    withdrawalTotal,
    depositTotal,
    ...stockTotal,
  }
  return accountDetails;
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

module.exports =  {
    addAccountEntry,
    addDepositEntry,
    addPurchaseEntry,
    addSaleEntry,
    addWithdrawalEntry,
    checkAccount,
    createAllTables,
    deleteAccountEntry,
    dropAllTables,
    getAccountDetailsSummary,
};