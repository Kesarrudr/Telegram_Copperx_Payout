import { Static, TSchema } from "@sinclair/typebox";
import { FastifySchema } from "fastify";

type StatacSchemaOrType<T> = T extends TSchema ? Static<T> : T;

interface GetApiRequest<T extends FastifySchema> {
  body?: StatacSchemaOrType<T["body"]>;
  querystring?: StatacSchemaOrType<T["querystring"]>;
  params?: StatacSchemaOrType<T["params"]>;
  headers?: StatacSchemaOrType<T["headers"]>;
}

type GetApiResponse<T extends FastifySchema> = T["response"] extends {
  200: infer U;
}
  ? StatacSchemaOrType<U>
  : never;

interface GetApiTypes<T extends FastifySchema> {
  request: GetApiRequest<T>;
  response: GetApiResponse<T>;
}

export { type GetApiResponse, type GetApiTypes, type GetApiRequest };
