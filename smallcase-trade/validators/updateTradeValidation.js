const { check } = require('express-validator');

exports.tradeUpdateValidation = [
  check('id', 'id is required')
    .exists()
    .isMongoId()
    .withMessage('id must be a valid mongo id'),
  check('type', 'type is required')
    .exists()
    .isLength({ min: 1 })
    .isIn(['buy', 'sell'])
    .withMessage('type bust be buy or sell'),
  check('tickerSymbol', 'tickerSymbol is required')
    .exists()
    .isLength({ min: 4 })
    .withMessage('tickerSymbol is invalid'),
  check('shares', 'shares is required')
    .exists()
    .isLength({ min: 1 })
    .withMessage('shares must be a number'),
];
