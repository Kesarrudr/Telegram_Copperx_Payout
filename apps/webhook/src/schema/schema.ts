import { Type } from "@sinclair/typebox";

const TelegramMessageSchema = Type.Object({
  update_id: Type.Number(),
  message: Type.Object({
    message_id: Type.Number(),
    from: Type.Object({
      id: Type.Number(),
      is_bot: Type.Boolean(),
      first_name: Type.String(),
      last_name: Type.Optional(Type.String()), // Optional
      language_code: Type.Optional(Type.String()),
    }),
    chat: Type.Object({
      id: Type.Number(),
      first_name: Type.String(),
      last_name: Type.Optional(Type.String()), // Optional
      type: Type.String(),
    }),
    date: Type.Number(),
    text: Type.Optional(Type.String()), // Optional
    entities: Type.Optional(
      Type.Array(
        Type.Object({
          offset: Type.Number(),
          length: Type.Number(),
          type: Type.String(),
        }),
      ),
    ),
  }),
});

const TelegramResponseSchema = Type.Object({
  status: Type.String(),
});

const HealthRouteResponeSchema = Type.Object({
  status: Type.String(),
});

export {
  TelegramResponseSchema,
  TelegramMessageSchema,
  HealthRouteResponeSchema,
};
