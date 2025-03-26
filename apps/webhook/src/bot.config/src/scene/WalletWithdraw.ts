import { Currency, PurposeCode } from "@repo/queue-config/constant";
import { Scenes } from "telegraf";
import { BotContest } from "./botContext";
import { withDrawWallet } from "../../../helperfunction/hook/hook";

interface WalletWithDrawData {
  walletAddress: string;
  amount: string;
  purposeCode: PurposeCode;
  currency: Currency;
}

interface WithDrawWalletSessionData extends Scenes.WizardSessionData {}

interface WithDrawWalletSession
  extends Scenes.WizardSession<WithDrawWalletSessionData> {
  withDrawData: WalletWithDrawData;
}

const MIN_AMOUNT = 100 * 1e6; // 100 USDC in smallest unit
const MAX_AMOUNT = 5_000_000 * 1e6; // 5,000,000 USDC in smallest unit

const withDrawWalletScene = new Scenes.WizardScene<BotContest>(
  "walletWithDrawScene",
  async (ctx) => {
    if (!ctx.chat || !ctx.session) {
      await ctx.reply("❌ Chat session not found. Please try again later.");
      return ctx.scene.leave();
    }
    ctx.session.withDrawData = {} as WalletWithDrawData;

    await ctx.reply("🔹 Please enter the withdrawal wallet address:");
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply(
        "⚠️ Invalid input. Please enter a valid wallet address.",
      );
    }

    ctx.session.withDrawData.walletAddress = ctx.message.text.trim();

    await ctx.reply("💰 Enter the amount (in USDC) you want to withdraw:");
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("⚠️ Please enter a valid numeric amount.");
    }

    const amountInput = ctx.message.text.trim();
    const amount = Number(amountInput) * 1e6; // Convert to smallest unit

    if (isNaN(amount) || amount <= 0) {
      return ctx.reply("❌ Amount must be a positive number.");
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return ctx.reply(
        `❌ Amount must be between **100 USDC** and **5,000,000 USDC**. Try again.`,
      );
    }

    ctx.session.withDrawData.amount = amount.toString();

    await ctx.reply(
      "📌 Select a purpose for this transfer:" +
        Object.values(PurposeCode)
          .map((code) => `- ${code}`)
          .join("\n") +
        "\n\n(Type the purpose from the list above ⬆️)",
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("⚠️ Please enter a valid purpose from the list.");
    }

    const purposeInput = ctx.message.text.trim().toLowerCase();
    const validPurposes = Object.values(PurposeCode).map((p) =>
      p.toLowerCase(),
    );

    if (!validPurposes.includes(purposeInput)) {
      return ctx.reply("❌ Invalid purpose. Please select from the list.");
    }

    ctx.session.withDrawData.purposeCode = purposeInput as PurposeCode;
    ctx.session.withDrawData.currency = Currency.USDC;

    if (!ctx.from) {
      await ctx.reply(
        "❌ Unable to process your request at the moment. Try again later.",
      );
      return ctx.scene.leave();
    }

    await ctx.reply("⏳ Processing your withdrawal request...");
    const withTxDetails = await withDrawWallet(
      ctx,
      ctx.session.withDrawData,
      ctx.from.id,
    );

    if (withTxDetails) {
      await ctx.reply(
        "✅ Withdrawal request submitted successfully! You will be notified once it is processed.",
      );
    }
    return ctx.scene.leave();
  },
);

withDrawWalletScene.command("cancel", async (ctx) => {
  await ctx.reply("❌ Process cancelled.");
  return ctx.scene.leave();
});

withDrawWalletScene.use(async (ctx, next) => {
  if (
    ctx.message &&
    "text" in ctx.message &&
    ctx.message.text.toLowerCase() === "cancel"
  ) {
    await ctx.reply("❌ Process cancelled.");
    return ctx.scene.leave();
  }
  return next();
});

export {
  type WithDrawWalletSessionData,
  type WalletWithDrawData,
  type WithDrawWalletSession,
  withDrawWalletScene,
};
