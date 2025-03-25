import { JobQueue, redisSessionClient } from "@repo/queue-config/jobQueue";
import { JobDataMap, JobMethods } from "@repo/queue-config/jobTypes";
import { isAxiosError } from "axios";
import { Context } from "vm";

const pushToJobQueue = async <T extends JobMethods>(
  method: T,
  data: JobDataMap[T],
) => {
  try {
    await JobQueue.add("job", {
      method: method,
      data: data,
    });
  } catch (error) {
    console.log("can't add job to the queue:", error);
  }
};

const getAuthKey = (userId: string) => `auth:${userId}`;

const getAuthToken = async (userId: string) => {
  const key = getAuthKey(userId);
  return await redisSessionClient.get(key);
};

const safeExecute = async <T>(
  ctx: Context | null,
  fn: () => Promise<T>,
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    if (isAxiosError(error)) {
      if (ctx) {
        await ctx.reply(`❌ ${error.message}`);
      }
    } else {
      console.error("Unexpected Error:", error);
    }
    return null;
  }
};

export { pushToJobQueue, getAuthKey, getAuthToken, safeExecute };
