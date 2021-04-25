const express = require('express');

const router = express.Router();

// importing required vallidators
const { portfolioInsertValidation } = require('../validators/portfolioInsert');
const { tradeBuyValidation } = require('../validators/tradeBuy');
const { tradeSellValidation } = require('../validators/tradeSell');
const { tradeDeleteValidation } = require('../validators/tradeDeleteValidation');
const { tradeUpdateValidation } = require('../validators/updateTradeValidation');
// importing required controllers functions
const {
  addPortfolio,
  getPortfolio,
  getTrades,
  buyShares,
  sellShares,
  removeTrade,
  getReturns,
  updateTrade,

} = require('../controllers/tradeController');

router.post('/addPortfolio',
  portfolioInsertValidation,
  addPortfolio);

router.get('/getPortfolio',
  getPortfolio);

router.get('/getTrades',
  getTrades);

router.post('/buy',
  tradeBuyValidation,
  buyShares);

router.post('/sell',
  tradeSellValidation,
  sellShares);

router.delete('/deleteTrade',
  tradeDeleteValidation,
  removeTrade);

router.get('/returns',
  getReturns);

router.put('/updateTrade',
  tradeUpdateValidation,
  updateTrade);
router.use('/', (req, res) => res.status(404).json({
  error: 'REQUEST NOT FOUND',
}));

module.exports = router;
