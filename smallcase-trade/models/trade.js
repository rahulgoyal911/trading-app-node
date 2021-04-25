const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  tickerSymbol: {
    type: String,
    minlength: 4,
  },
  shares: {
    type: Number,
    min: 0,
  },
  price: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    default: 'buy',
  },
});

module.exports = mongoose.model('Trade', tradeSchema);
