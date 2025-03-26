import ngrok from "@ngrok/ngrok";
import closeWithGrace from "close-with-grace";
import fastify from "fastify";
import { app as Server } from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || "0.0.0.0";

const app = fastify({
  logger: true,
});

app.register(Server);

app.listen({ host: HOST, port: PORT }, async (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on ${address}`);

  try {
    const listener = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTHTOKEN,
      domain: process.env.NGROK_DOMAIN,
    });
    console.log(`Ingress established at: ${listener.url()}`);
  } catch (error) {
    console.error("Ngrok connection failed:", error);
  }
});

// Graceful Shutdown
const closeListeners = closeWithGrace({ delay: 500 }, async ({ err }) => {
  if (err) {
    app.log.error(err);
  }
  await app.close();
});

app.addHook("onClose", function (_instance, done) {
  closeListeners.uninstall();
  done();
});
