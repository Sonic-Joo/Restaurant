const { setServers } = require("node:dns/promises");
setServers(["8.8.4.4", "8.8.8.8"]); // To Using Google DNS

const mongoose = require("mongoose");
const URL = process.env.MONGO_URL || "http://localhost:8000";

module.exports = () => {
  mongoose
    .connect(URL)
    .then(() => {
      console.log("DataBase Connected Successfully");
    })
    .catch((error) => {
      console.log("Connected Fail Because:", error.message);
    });
};
