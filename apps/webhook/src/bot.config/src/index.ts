import { Scenes, session, Telegraf } from "telegraf";
import {
  getAuthToken,
  handleDepositEvent,
  pusherClient,
  pushToJobQueue,
} from "../../helperfunction/functions";
import { JobMethods } from "@repo/queue-config/jobTypes";
import { transferScene } from "./scene/transfer";
import { BotContest } from "./scene/botContext";
import { otpScene } from "./scene/Authscene";
import { withDrawWalletScene } from "./scene/WalletWithdraw";
import { offRampScene } from "./scene/bank_withdraw";
import { getUserDetails } from "../../helperfunction/hook/hook";
import { redisPuherSocketId } from "@repo/queue-config/jobQueue";

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  //WARNING: change this
  "";

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("❌ Missing TELEGRAM_BOT_TOKEN in environment variables.");
}

const bot = new Telegraf<BotContest>(TELEGRAM_BOT_TOKEN);

async function setupBot() {
  try {
    await bot.telegram.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "help", description: "Get help and available commands" },
      { command: "auth", description: "Authenticate your account" },
      { command: "balance", description: "Check your balance" },
      { command: "cancel", description: "Cancel any ongoing process" },
      { command: "me", description: "Get details about your data" },
      { command: "kyc", description: "Get the KYC status" },
      { command: "wallets", description: "Wallet Details" },
      { command: "default_wallet", description: "Default Wallet Details" },
      { command: "transaction_history", description: "Transcation Details" },
      { command: "recent_tx", description: "Recent tx details" },
      { command: "transfer", description: "Send funds to an email address" },
      {
        command: "wallet_withdraw",
        description: "Send funds to an external wallet",
      },
      { command: "bank_transfer", description: "With funds to a Bank Account" },
      {
        command: "subscibe_notification",
        description: "Subscibe to the desposite notification to your account",
      },
    ]);

    console.log("✅ Bot commands set successfully!");
  } catch (error) {
    console.error("❌ Failed to set bot commands:", error);
  }
}

setupBot();

bot.use(session());

const stage = new Scenes.Stage<BotContest>([
  otpScene,
  transferScene,
  withDrawWalletScene,
  offRampScene,
]);

bot.use(stage.middleware());

bot.use(async (ctx, next) => {
  if (
    ctx.message &&
    "text" in ctx.message &&
    ctx.message.text.startsWith("/") &&
    ctx.from
  ) {
    console.log(`📩 Command received: ${ctx.message.text}`);

    if (ctx.scene.current) {
      await ctx.scene.leave();
    }
  }
  await next();
});

bot.use(async (ctx, next) => {
  if (
    ctx.message &&
    "text" in ctx.message &&
    ctx.message.text.startsWith("/")
  ) {
    return next();
  }
  if (!ctx.from) {
    await ctx.reply("❌ Unable to process your request. Please try again.");
    return;
  }

  const authToken = await getAuthToken(ctx.from.id.toString());
  if (!authToken) {
    await ctx.reply("No auth token found. First, run /auth command.");
    return;
  }

  await next();
});

bot.start(async (ctx) => {
  await ctx.reply(
    `👋 Welcome to Copperx Payout Bot, ${ctx.update.message.from.first_name}!`,
  );
});

bot.help(async (ctx) =>
  ctx.reply("📌 Available commands:\n/payment\n/auth\n/balance\n/generate_otp"),
);

bot.command("auth", async (ctx) => ctx.scene.enter("generate_otp"));
bot.command("balance", async (ctx) => {
  try {
    await ctx.reply("💰 Fetching your balance...");

    await pushToJobQueue(JobMethods.GetWalletsBalances, {
      userId: ctx.from.id.toString(),
    });

    await ctx.reply("🔄 Request received! You will be notified shortly.");
  } catch (error) {
    console.error("Error fetching balance:", error);
    await ctx.reply(
      "❌ An error occurred while fetching your balance. Please try again later.",
    );
  }
});

bot.command("me", async (ctx) => {
  try {
    await pushToJobQueue(JobMethods.ABOUTME, {
      userId: ctx.from.id.toString(),
    });
    await ctx.reply("🔍 Retrieving your profile information... Please wait.");
  } catch (error) {
    console.error("❌ Error processing /me command:", error);
    await ctx.reply("⚠️ Failed to fetch your data. Please try again later.");
  }
});

bot.command("kyc", async (ctx) => {
  try {
    await pushToJobQueue(JobMethods.GETKYC, {
      userId: ctx.from.id.toString(),
    });
    ctx.reply("🔍 Retrieving your KYC information... Please wait.");
  } catch (error) {
    console.log("❌ Error processing /KYC command:", error);
    await ctx.reply("Some thing went wrong. Try again...");
    return;
  }
});

bot.command("wallets", async (ctx) => {
  try {
    await pushToJobQueue(JobMethods.GetWallets, {
      userId: ctx.from.id.toString(),
    });
    await ctx.reply("🔍 Retrieving your Wallet information... Please wait.");
  } catch (error) {
    await ctx.reply("Some thing went wrong. Try again...");
  }
});

bot.command("default_wallet", async (ctx) => {
  try {
    await pushToJobQueue(JobMethods.GetDefaultWallet, {
      userId: ctx.from.id.toString(),
    });

    await ctx.reply("🔄 Fetching your default wallet..."); // Acknowledge request
  } catch (error) {
    console.error("Error pushing to job queue:", error);
    await ctx.reply(
      "❌ Failed to fetch default wallet. Please try again later.",
    );
  }
});

bot.command("recent_tx", async (ctx) => {
  try {
    await pushToJobQueue(JobMethods.RecentTranscation, {
      userId: ctx.from.id.toString(),
    });

    await ctx.reply("📜 Fetching your transaction history... ⏳");
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    await ctx.reply(
      "❌ Failed to fetch transaction history. Please try again.",
    );
  }
});

bot.command("transaction_history", async (ctx) => {
  try {
    await pushToJobQueue(JobMethods.GetTransfers, {
      userId: ctx.from.id.toString(),
    });

    await ctx.reply("📜 Fetching your transaction history... ⏳");
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    await ctx.reply(
      "❌ Failed to fetch transaction history. Please try again.",
    );
  }
});

bot.command("transfer", async (ctx) => {
  ctx.scene.enter("transfer_wizard");
});
bot.command("wallet_withdraw", async (ctx) => {
  ctx.scene.enter("walletWithDrawScene");
});
bot.command("bank_transfer", async (ctx) => {
  ctx.scene.enter("bank_transfer");
});

bot.command("subscibe_notification", async (ctx) => {
  const userDetails = await getUserDetails(ctx);
  if (!userDetails) {
    return ctx.reply("Can't proces you request. Try again...");
  }
  const { organizationId } = userDetails;

  const pusherClientInstance = await pusherClient(userDetails);
  const socketId = pusherClientInstance.connection.socket_id;

  await redisPuherSocketId.set(
    `pusherKey:${socketId}`,
    JSON.stringify({ socketId, chatId: ctx.chat.id }),
  );
  const channel = pusherClientInstance.subscribe(
    `private-org-${organizationId}`,
  );

  channel.bind(
    "deposit",
    async (eventData: { socketId: string; amount: number }) => {
      console.log("🔔 New deposit event received for user:", eventData);
      await handleDepositEvent(eventData);
    },
  );

  return ctx.reply("✅ You are now subscribed to deposit notifications!");
});

process.once("SIGINT", () => {
  console.log("🛑 Bot shutting down (SIGINT)...");
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  console.log("🛑 Bot shutting down (SIGTERM)...");
  bot.stop("SIGTERM");
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

export default bot;
