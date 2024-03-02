import { Redis } from "ioredis";
import dotenv from 'dotenv'

dotenv.config();

const key: any = process.env.REDIS_STRING || undefined;

export const redisClient = new Redis(key);
