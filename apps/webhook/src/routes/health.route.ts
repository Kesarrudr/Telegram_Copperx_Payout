import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import { GetApiTypes } from "../common";

export const HealthRouteResponeSchema = Type.Object({
  status: Type.String(),
  uptime: Type.Number(),
});

const healthRouteSchema = {
  tags: ["Check"],
  summary: "Check the health of the server",
  response: {
    200: HealthRouteResponeSchema,
  },
};

type HealthRouteApi = GetApiTypes<typeof healthRouteSchema>;

const HealthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Reply: HealthRouteApi["response"];
  }>(
    "/health",
    {
      schema: healthRouteSchema,
    },
    async (_, reply) => {
      return reply.send({
        status: "ok",
        uptime: process.uptime(),
      });
    },
  );
};

export default HealthRoute;
