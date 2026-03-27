const { Worker } = require("bullmq");
const verifyEmail = require("../utils/verifyEmail");
const logger = require("../utils/logger");

const connection = {
  username: "default",
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html } = job.data;
    await verifyEmail(to, subject, html);
    logger.info(`Email sent to ${to}`);
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts: ${err.message}`);
});

module.exports = emailWorker;
