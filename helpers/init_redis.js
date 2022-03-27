const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: 6379,
    legacyMode: true,
});

client.connect();

client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('ready', () => {
    console.log('Redis client ready');
})

client.on('error', (err) => {
    console.log('Something went wrong ' + err.message);
});

client.on('end', () => {
    console.log('Redis client disconnected');
});
process.on('SIGINT', () => {
    client.quit();
});

module.exports = client;