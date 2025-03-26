import {
  JobQueue,
  redisPuherSocketId,
  redisSessionClient,
} from "@repo/queue-config/jobQueue";
import { JobDataMap, JobMethods } from "@repo/queue-config/jobTypes";
import axios, { isAxiosError } from "axios";
import { Context } from "vm";
import { MeResponseData, QuoteData } from "../types/types";
import { axiosPostRequest } from "../axios/axios.config";
import { AxiosResponse } from "axios";
import Pusher from "pusher-js";

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

class Convert {
  public static toQuoteData(json: string): QuoteData {
    return JSON.parse(json);
  }

  public static quoteDataToJson(value: QuoteData): string {
    return JSON.stringify(value);
  }
}

const pusherClient = async (data: MeResponseData) => {
  try {
    const client = new Pusher(
      process.env.PUSHER_KEY || "e089376087cac1a62785",
      {
        cluster: process.env.PUSHER_CLUSTER || "ap1",
        authorizer: (channel) => ({
          authorize: async (socketId, callback) => {
            try {
              const response = await axiosPostRequest<any, any>(
                "/notifications/auth",
                {
                  socket_id: socketId,
                  channel_name: `private-org-${data.organizationId}`,
                },
              );

              if (response.status === 200) {
                callback(null, response.data);
              } else {
                callback(new Error("Pusher Authentication failed"), null);
              }
            } catch (error) {
              console.error("Pusher authorization error:", error);
              callback(new Error("Pusher authorization error"), null);
            }
          },
        }),
      },
    );

    return client;
  } catch (error) {
    console.error("Error initializing Pusher client:", error);
    throw error;
  }
};

const handleDepositEvent = async (eventData: {
  socketId: string;
  amount: number;
}) => {
  try {
    const userData = await redisPuherSocketId.get(
      `pusherKey:${eventData.socketId}`,
    );

    if (!userData) {
      console.warn(`No chat ID found for socketId: ${eventData.socketId}`);
      return;
    }

    const { chatId } = JSON.parse(userData);
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || ""}/sendMessage`;

    await axios.post(url, {
      chat_id: chatId,
      text: `💰 *New Deposit Received*\n\n${eventData.amount} USDC deposited on Solana`,
      parse_mode: "Markdown",
    });

    console.log(`✅ Notification sent to chatId: ${chatId}`);
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

export {
  handleDepositEvent,
  pushToJobQueue,
  getAuthKey,
  getAuthToken,
  safeExecute,
  Convert,
  pusherClient,
};
