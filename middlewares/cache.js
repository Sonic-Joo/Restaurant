const { client } = require("../utils/redisClient");
const logger = require("../utils/logger");

const cache = (key, ttl = 3600) => {
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

const cacheWithPagenation = (key, ttl = 3600) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page === 1 && limit === 10) {
      return cache(key, ttl)(req, res, next);
    }

    return next();
  };
};

module.exports = { cache, cacheWithPagenation };
