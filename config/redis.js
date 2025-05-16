import Redis from "ioredis";

const uri = process.env.REDIS_URI;
const redis = new Redis(uri);

export default redis;
