const { client } = require("../utils/redisClient");
const logger = require("../utils/logger");

const cache = (key, ttl = 60 * 60) => {
  return async (req, res, next) => {
    try {
      const cached = await client.get(key);

      if (cached) {
        logger.info(`Cache HIT: ${key}`);
        return res.status(200).json(JSON.parse(cached));
      }

      logger.info(`Cache MISS: ${key}`);

      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        // await client.set(key , JSON.stringify(body))
        await client.setEx(key, ttl, JSON.stringify(body));
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.error(`Cache Error: ${err}`);
      next(err);
    }
  };
};

module.exports = cache;
