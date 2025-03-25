import { Queue } from "bullmq";
import IORedis, { Redis } from "ioredis";
import { JobMethods, JobsData } from "./job.type/types";

export const connection = new IORedis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
  tls: {},
});

export const JobQueue = new Queue<JobsData<JobMethods>>("jobQueue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    //WARNING: currenly removing falied jobs
    removeOnFail: true,
  },
});

export const redisSessionClient = new Redis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
  tls: {},
});
