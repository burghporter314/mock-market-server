require('dotenv').config()
const fetch = require('cross-fetch');
const moment = require('moment')

/**
 * Get the results based on the query for tickers
 */
const getTickerResults = async (request, response) => {
    const query = request.query.query;
  
    // Make API request to retrieve destination options based on location.
    url = `https://api.polygon.io/v3/reference/tickers?` +
                `search=${query}&active=true&sort=ticker&order=asc&limit=10&` +
                `apiKey=${process.env.STOCK_MARKET_API_KEY}`

    fetch(url, {
        method: 'GET',
        headers: {
            useQueryString: true
        }
    })
    // Resolves the response object and retrieves the actual body response
    .then(responseJson => responseJson.json())
    .then(responseBody => {
        // We had a successful request
        response.status(200).send(responseBody);
    }).catch(error => {
        // There was an error with the request
        response.status(400).send(error)
    });
};

/**
 * Get the information needed for ticker
 */
const getTickerDailyInfo = async (request, response) => {

    const ticker = request.query.ticker;

    const currentPrice = await getCurrentPrice(ticker.toUpperCase());

    // Make API request to retrieve destination options based on location.
    url = `https://api.polygon.io/v1/meta/symbols/${ticker.toUpperCase()}/company?`+
                `apiKey=${process.env.STOCK_MARKET_API_KEY}`

    fetch(url, {
        method: 'GET',
        headers: {
            useQueryString: true
        }
    })
    // Resolves the response object and retrieves the actual body response
    .then(responseJson => responseJson.json())
    .then(responseBody => {
        // We had a successful request
        if(currentPrice) {
            response.status(200).send(Object.assign(responseBody, currentPrice));
        } else {
            response.status(200).send(responseBody);
        }
    }).catch(error => {
        // There was an error with the request
        response.status(400).send(error)
    });
};

/**
 * Get the current price of the stock ticker. 
 */
const getCurrentPrice = async (ticker) => {

    // Make API request to retrieve destination options based on location.
    url = `https://finnhub.io/api/v1/quote?` +
                `symbol=${ticker.toUpperCase()}&` +
                `token=${process.env.FINNHUB_API_KEY}`

    const result = fetch(url, {
        method: 'GET',
        headers: {
            useQueryString: true
        }
    })

    // Resolves the response object and retrieves the actual body response
    .then(responseJson => responseJson.json())
    .then(responseBody => {
        // We had a successful request
        return responseBody;
    }).catch(error => {
        // There was an error with the request
        return error;
    });
    return result;
}

module.exports =  {
    getCurrentPrice,
    getTickerDailyInfo,
    getTickerResults
};