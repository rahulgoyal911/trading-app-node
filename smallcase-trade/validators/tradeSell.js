const { check } = require('express-validator');

exports.tradeSellValidation = [
  check('tickerSymbol', 'tickerSymbol is required')
    .exists()
    .isLength({ min: 4 })
    .withMessage('tickerSymbol is invalid'),
  check('shares', 'shares is required')
    .exists()
    .isLength({ min: 1 })
    .withMessage('shares cannot be empty'),
];
