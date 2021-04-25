const { check } = require('express-validator');

exports.tradeDeleteValidation = [
  check('id', 'id is required')
    .exists()
    .isMongoId()
    .withMessage('id must be a valid mongo id'),
];
