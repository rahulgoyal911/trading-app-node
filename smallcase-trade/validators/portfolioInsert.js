const { check } = require('express-validator');

exports.portfolioInsertValidation = [
  check('tickerSymbol', 'tickerSymbol is required')
    .exists()
    .isLength({ min: 4 })
    .withMessage('tickerSymbol is invalid'),
  check('avgBuyPrice', 'avgBuyPrice is required')
    .exists()
    .isLength({ min: 1 })
    .isDecimal()
    .withMessage('avguyPrice must be a number'),
  check('shares', 'shares is required')
    .exists()
    .isLength({ min: 1 })
    .withMessage('shares must be a number'),
];
