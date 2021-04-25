const { check } = require('express-validator');

exports.tradeBuyValidation = [
  check('tickerSymbol', 'tickerSymbol is required')
    .exists()
    .isLength({ min: 4 })
    .withMessage('tickerSymbol is invalid'),
  check('buyPrice', 'buyPrice is required')
    .exists()
    .isLength({ min: 1 })
    .isDecimal()
    .withMessage('buyPrice must be a number'),
  check('shares', 'shares is required')
    .exists()
    .isLength({ min: 1 })
    .withMessage('shares cannot be empty'),
];
