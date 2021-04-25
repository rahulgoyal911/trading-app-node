const { check } = require('express-validator');

exports.portfolioDeleteValidation = [
  check('tickerSymbol', 'tickerSymbol is required')
    .exists()
    .isLength({ min: 4 })
    .withMessage('tickerSymbol is invalid'),
];
