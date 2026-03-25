const { setServers } = require("node:dns/promises");
setServers(["8.8.4.4", "8.8.8.8"]); // To Using Google DNS ==> Error From My Device

const mongoose = require("mongoose");
const logger = require("../utils/logger");
const URL = process.env.MONGO_URL || "mongodb://localhost:27017/restaurant";

module.exports = () => {
  mongoose
    .connect(URL)
    .then(() => {
      logger.info("DataBase Connected Successfully");
    })
    .catch((error) => {
      logger.error("Connected Fail Because:", error.message);
    });
};
