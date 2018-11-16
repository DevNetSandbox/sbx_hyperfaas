'use strict';

const rp = require('request-promise-native');

module.exports = async function (context) {
    var body = context.request.body;
    console.log(`body = ${body}`);
    var symbol = body.symbol;

    console.log(`Got symbol: ${symbol}`);

    if (!symbol) {
        return makeResponse(400, { error: { message: "You must provide a stock symbol." } });
    }

    var postData;
    try {
        postData = await iexStockPrice(symbol);
        if (postData.price == 0) {
            postData = await alphavantageStockPrice(symbol)
        }
        return makeResponse(200, postData)
    }
    catch (e) {
        console.log(e.message)
        return makeResponse(200, { symbol: symbol, price: 0 });
    }
}

function makeResponse(status, body) {
    return {
        status: status,
        body: body,
        headers: { 'Content-Type': 'application/json' }
    };
};

async function alphavantageStockPrice(symbol) {
    var lastTrade = 0;
    var response = await rp(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=1CO1PK6HLSYTH26F`);
    var parsed = JSON.parse(response);
    var timeSeries = parsed["Time Series (1min)"];
    if (timeSeries) {
        lastTrade = timeSeries[Object.keys(timeSeries)[0]]["2. high"];
    }
    return { symbol: symbol, price: lastTrade };
};

async function iexStockPrice(symbol) {
    var lastTrade = 0;
    var response = await rp(`https://api.iextrading.com/1.0/stock/${symbol}/price`);
    if (!isNaN(+response)) {
        lastTrade = +response;
    }
    return { symbol: symbol, price: lastTrade };
};
