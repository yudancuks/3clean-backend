const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT || 6379  
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Successfully connected to Redis'));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

module.exports = client;
