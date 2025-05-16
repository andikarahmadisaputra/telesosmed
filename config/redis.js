import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.REDIS_URI;
const redis = new Redis(uri);

export default redis;
