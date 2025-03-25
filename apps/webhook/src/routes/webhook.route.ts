import { FastifyPluginAsync } from "fastify";
import { GetApiTypes } from "../common";
import { TelegramMessageSchema, TelegramResponseSchema } from "../schema";
import { Update } from "telegraf/types";
import bot from "../bot.config/src";

const schema = {
  tags: ["Telegram"],
  summary: "Handle Telegram bot messages",
  body: TelegramMessageSchema,
  response: {
    200: TelegramResponseSchema,
  },
};

type TelegramWebhookApi = GetApiTypes<typeof schema>;

const telegramWebhookRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: Update;
    Reply: TelegramWebhookApi["response"];
  }>("/", {}, async (request, reply) => {
    const body = request.body;

    if (!body) {
      return reply.send({ status: "no message text" });
    }

    await bot.handleUpdate(body);

    return reply.send({ status: "ok" });
  });
};

export default telegramWebhookRoute;
