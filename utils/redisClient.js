const redis = require("redis");
const logger = require("./logger");

const client = redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        logger.error("Redis max retries reached, stopping...");
        return false; // وقف المحاولات
      }
      return retries * 500; // انتظر 500ms بين كل محاولة
    },
  },
});

client.on("error", (err) => {
  logger.error("Redis Client Error:", err);
});

client.on("connect", () => {
  logger.info("Redis Connected Successfully");
});

const connectRedis = async () => {
  try {
    await client.connect();
  } catch (err) {
    logger.error("Redis connection failed:", err);
    return err;
  }
};

module.exports = { client, connectRedis };
