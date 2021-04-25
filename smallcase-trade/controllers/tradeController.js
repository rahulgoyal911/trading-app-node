/* eslint-disable no-plusplus */
/* eslint-disable radix */
const got = require('got');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logging');
const Trade = require('../models/trade');
const Portfolio = require('../models/portfolio');

// inserting a new trade [buy or sell]
async function insertTrade(tickerSymbol, shares, type, price) {
  try {
    const newtrade = new Trade({
      tickerSymbol, shares, type, price,
    });
    await newtrade.save();
  } catch (error) {
    throw new Error(error);
  }
}

// get list of all trades happened till now
exports.getTrades = async (req, res) => {
  try {
    logger.info('getTradesCalled');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }
    const trades = await Trade.find({});
    return res.json(trades);
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};

// get all items listed in portfolio corresponding to its details
exports.getPortfolio = async (req, res) => {
  try {
    logger.info('getPortfolioCalled');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }
    const portfolios = await Portfolio.find({});
    return res.json(portfolios);
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};

// add item to portfolio
exports.addPortfolio = async (req, res) => {
  try {
    logger.info('gaddPortfolioCalled');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }

    const { tickerSymbol, avgBuyPrice, shares } = req.body;

    const isTickerExists = await Portfolio.findOne({ tickerSymbol });
    if (isTickerExists) return res.sendAlreadyExists({ message: 'Ticker already exists!' });

    const newPortfolio = new Portfolio({ tickerSymbol, avgBuyPrice, shares });
    const savedPortfolio = await newPortfolio.save();
    return res.sendCreated(savedPortfolio);
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};

// remove any trade corresponding to trade id
exports.removeTrade = async (req, res) => {
  try {
    logger.info('removeTradeCalled');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }
    const { id } = req.body;
    const existingTrade = await Trade.findOne({ _id: id });
    if (!existingTrade) {
      return res.sendNotFound();
    }
    if (existingTrade.type === 'buy') {
      const portfolioItem = await Portfolio.findOne({ tickerSymbol: existingTrade.tickerSymbol });
      if (!portfolioItem) {
        return res.sendNotFound();
      }
      // rollbacking
      const currentShares = portfolioItem.shares;
      const currentPrice = portfolioItem.avgBuyPrice;

      const tradeShares = existingTrade.shares;
      const tradePrice = existingTrade.price;

      // eslint-disable-next-line max-len
      portfolioItem.avgBuyPrice = (currentPrice * currentShares - tradeShares * tradePrice) / (currentShares - tradeShares);
      portfolioItem.shares = currentShares - tradeShares;
      await portfolioItem.save();
    } else {
      const portfolioItem = await Portfolio.findOne({ tickerSymbol: existingTrade.tickerSymbol });
      if (!portfolioItem) {
        return res.sendNotFound();
      }
      portfolioItem.shares += existingTrade.shares;
      await portfolioItem.save();
    }
    await Trade.deleteOne({ _id: id });
    return res.status(200).send({ message: 'deleted successfully and changes reverted back!' });
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};

// updating any trade with rollbacking feature
exports.updateTrade = async (req, res) => {
  try {
    logger.info('updateTradeCalled');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }
    const existingTrade = await Trade.findOne({ _id: req.body.id });
    if (!existingTrade) {
      return res.sendNotFound();
    }
    // rollbacking
    if (existingTrade.type === 'buy') {
      const portfolioItem = await Portfolio.findOne({ tickerSymbol: existingTrade.tickerSymbol });
      if (!portfolioItem) {
        return res.sendNotFound();
      }
      const currentShares = portfolioItem.shares;
      const currentPrice = portfolioItem.avgBuyPrice;

      const tradeShares = existingTrade.shares;
      const tradePrice = existingTrade.price;

      // eslint-disable-next-line max-len
      portfolioItem.avgBuyPrice = (currentPrice * currentShares - tradeShares * tradePrice) / (currentShares - tradeShares);
      portfolioItem.shares = currentShares - tradeShares;
      await portfolioItem.save();
    } else {
      const portfolioItem = await Portfolio.findOne({ tickerSymbol: existingTrade.tickerSymbol });
      if (!portfolioItem) {
        return res.sendNotFound();
      }
      portfolioItem.shares += existingTrade.shares;
      await portfolioItem.save();
    }
    await Trade.deleteOne({ _id: req.body.id });
    const { type } = req.body;
    if (type === 'sell') {
      if (req.body.tickerSymbol === undefined || req.body.shares === undefined) {
        return res
          .status(400)
          .send({ message: 'body must contain tickerSymbol and shares' });
      }
      const { tickerSymbol } = req.body;
      const existinngPortfolio = await Portfolio.findOne({ tickerSymbol });
      if (!existinngPortfolio) {
        return res.sendNotFound();
      }
      existinngPortfolio.shares -= Number.parseInt(req.body.shares);
      if (existinngPortfolio.shares < 0) {
        return res
          .status(400)
          .send({ message: 'cannot sell as value will become negative' });
      }
      await existinngPortfolio.save();
      await insertTrade(tickerSymbol, req.body.shares, 'sell', existinngPortfolio.avgBuyPrice);
      return res.status(200).send(existinngPortfolio);
    } if (type === 'buy') {
      if (!(req.body.tickerSymbol && req.body.shares && req.body.avgPrice)) {
        return res
          .status(400)
          .send({ message: 'body must contain tickerSymbol ,shares, avgBuyPrice' });
      }
      const { tickerSymbol } = req.body;
      const existinngPortfolio = await Portfolio.findOne({ tickerSymbol });
      if (!existinngPortfolio) {
        return res.sendNotFound();
      }
      const initialBuy = existinngPortfolio.avgBuyPrice;
      const initialShares = existinngPortfolio.shares;
      let sum = initialShares * initialBuy;
      sum += Number.parseInt(req.body.shares) * Number.parseFloat(req.body.buyPrice);
      existinngPortfolio.shares += Number.parseInt(req.body.shares);
      existinngPortfolio.buyPrice = sum / existinngPortfolio.shares;

      await existinngPortfolio.save();
      await insertTrade(tickerSymbol, req.body.shares, 'buy', req.body.buyPrice);
      return res.status(200).json(existinngPortfolio);
    }
    return res.status(400).send({ message: 'type must be buy or sell' });
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};

// get calculated returns
exports.getReturns = async (req, res) => {
  try {
    logger.info('getreturnsCalled');
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }
    let todayPrice = 100;
    const portfolios = await Portfolio.find();
    const tickerSymbols = [];
    for (let i = 0; i < portfolios.length; i++) {
      tickerSymbols.push(portfolios[i].tickerSymbol);
    }
    const response = await got('https://quotes-api.tickertape.in/quotes', {
      searchParams: {
        sids: tickerSymbols.toString(),
      },
    });
    if (response.statusCode !== 200) {
      return res.sendServerError();
    }
    const jsonRes = JSON.parse(response.body);
    const stockDetails = jsonRes.data;
    let i;
    let returns = 0;
    for (i = 0; i < portfolios.length; ++i) {
      const currPortfolioTickerSymbol = portfolios[i].tickerSymbol;
      todayPrice = 0;
      for (let stockDetail = 0; stockDetail < stockDetails.length; ++stockDetail) {
        if (stockDetails[stockDetail].sid === currPortfolioTickerSymbol) {
          todayPrice = stockDetails[stockDetail].price;
        }
      }
      returns += (todayPrice - portfolios[i].avgBuyPrice) * portfolios[i].shares;
    }
    const responsejson = {
      returns,
    };
    return res.json(responsejson);
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};

// buy any share to portfolio
exports.buyShares = async (req, res) => {
  try {
    logger.info('buySharesCalled');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }
    const { tickerSymbol } = req.body;
    let existinngPortfolio = await Portfolio.findOne({ tickerSymbol });
    if (!existinngPortfolio) {
      existinngPortfolio = new Portfolio({
        tickerSymbol,
        avgBuyPrice: 0,
        shares: 0,
      });
    }
    const initialBuy = existinngPortfolio.avgBuyPrice;
    const initialShares = existinngPortfolio.shares;
    let sum = initialShares * initialBuy;
    sum += Number.parseInt(req.body.shares) * Number.parseFloat(req.body.buyPrice);
    existinngPortfolio.shares += Number.parseInt(req.body.shares);
    existinngPortfolio.avgBuyPrice = sum / existinngPortfolio.shares;

    await existinngPortfolio.save();
    await insertTrade(tickerSymbol, req.body.shares, 'buy', req.body.buyPrice);
    return res.status(200).json(existinngPortfolio);
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};

// sell any share from portfolio with feature cant make -ve
exports.sellShares = async (req, res) => {
  try {
    logger.info('sellSharesCalled');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.errors[0].msg,
      });
    }
    const { tickerSymbol } = req.body;
    const existinngPortfolio = await Portfolio.findOne({ tickerSymbol });
    if (!existinngPortfolio) {
      return res.sendNotFound();
    }
    existinngPortfolio.shares -= Number.parseInt(req.body.shares);
    if (existinngPortfolio.shares < 0) {
      return res
        .status(400)
        .send({ message: 'cannot sell  as value will become negative' });
    }
    await existinngPortfolio.save();
    await insertTrade(tickerSymbol, req.body.shares, 'sell', existinngPortfolio.avgBuyPrice);
    return res.status(200).json(existinngPortfolio);
  } catch (err) {
    logger.error({ message: new Error(err) });
    return res.sendServerError();
  }
};
