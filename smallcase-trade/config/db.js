const mongoose = require('mongoose');
const { logger } = require('../utils/logging');

const connectDB = async (dbUrl) => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    logger.info('Db is running');
  } catch (err) {
    logger.error({ message: new Error(err) });
  }
};

const disConnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Db disconnected');
  } catch (err) {
    logger.error({ message: new Error(err) });
  }
};

module.exports = { connectDB, disConnectDB };
