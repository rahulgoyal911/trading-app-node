require('dotenv').config();
const { logger } = require('./utils/logging');

let app = require('./index');

app = app.server;
const { connectDB } = require('./config/db');

connectDB(process.env.MONGO_URI);

app.listen(process.env.PORT, () => {
  logger.info(`Server is up on ${process.env.PORT}`);
});
