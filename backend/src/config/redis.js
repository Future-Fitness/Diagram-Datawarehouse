require("dotenv").config();
const redis = require("redis");

const client = redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

client.on("connect", () => {
    console.log("Connected to our redis instance!");
    client.set("Greatest Basketball Player", "Lebron James");
});