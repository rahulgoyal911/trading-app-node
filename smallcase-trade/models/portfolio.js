const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  tickerSymbol: {
    type: String,
    unique: true,
    minlength: 4,
  },
  avgBuyPrice: {
    type: Number,
    min: 0,
  },
  shares: {
    type: Number,
    min: 0,
  },
});

portfolioSchema.index({ tickerSymbol: 1 }, { background: true });
module.exports = mongoose.model('Portfolio', portfolioSchema);
