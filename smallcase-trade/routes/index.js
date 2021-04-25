const router = require('express').Router();
const tradeRoutes = require('./tradeRoutes');

router.use('/trade', tradeRoutes);

module.exports = router;
