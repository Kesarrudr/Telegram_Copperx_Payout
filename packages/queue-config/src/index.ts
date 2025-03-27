import { Queue } from "bullmq";
import IORedis from "ioredis";
import { JobMethods, JobsData } from "./job.type/types";

const redisConnection = new IORedis(process.env.REDIS_URL || "", {
  connectTimeout: 10000,
  maxRetriesPerRequest: null,
  tls: {},
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redisConnection.on("error", (err) => {
  console.error("[Redis Error]:", err);
});

const JobQueue = new Queue<JobsData<JobMethods>>("jobQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

const redisSessionClient = redisConnection;
const redisPuherSocketId = redisConnection;

export { redisConnection, redisPuherSocketId, redisSessionClient, JobQueue };
