const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}
const redis = new Redis(redisConfig);

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.ping((err, result) => {
  if (err) {
    console.error("Unable to connect to Redis:", err);
  } else {
    console.log("Redis connection successful:", result);
  }
});

module.exports = redis;
