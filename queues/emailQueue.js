const { Queue } = require("bullmq");

const connection = {
  username: "default",
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

const emailQueue = new Queue("emailQueue", { connection });

module.exports = emailQueue;
