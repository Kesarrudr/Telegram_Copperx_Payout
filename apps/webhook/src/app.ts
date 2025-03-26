import { fastifyAutoload } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";
import { join } from "path";
import path from "path";

const app: FastifyPluginAsync = async (fastify): Promise<void> => {
  console.log(`path ${path.join(__dirname, "routes")}`);

  await fastify.register(fastifyAutoload, {
    dir: join(__dirname, "routes"),
    options: { prefix: "/" },
    routeParams: true,
  });

  fastify.ready(() => fastify.log.info(fastify.printRoutes()));
};

export { app };
