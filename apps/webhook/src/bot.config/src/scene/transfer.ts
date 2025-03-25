import { Currency, PurposeCode } from "@repo/queue-config/constant";
import { Scenes } from "telegraf";
import { BotContest } from "./botContex";
import {
  createPayee,
  getDefaultWallet,
  getPayeeDetails,
  sendTx,
} from "../../../helperfunction/hook/hook";

interface TransferData {
  email: string;
  payeeId: string;
  walletAddress: string;
  amount: string; // Should be a string representing an int64 value
  purposeCode: PurposeCode;
  currency: Currency;
}

export interface TransferWizardSessionData extends Scenes.WizardSessionData {}

export interface TransferWizardSession
  extends Scenes.WizardSession<TransferWizardSessionData> {
  transferData: TransferData;
}

const transferScene = new Scenes.WizardScene<BotContest>(
  "transfer_wizard",

  // Step 1: Get Email
  async (ctx) => {
    if (!ctx.chat) {
      await ctx.reply("❌ Chat not found. Please try again.");
      return ctx.scene.leave();
    }

    ctx.session.transferData = {} as TransferData;
    await ctx.reply("📧 Enter your email to send USDC:");
    return ctx.wizard.next();
  },

  // Step 2: Validate Email & Get Payee
  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("⚠️ Please enter a valid email address.");
    }

    const email = ctx.message.text.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return ctx.reply("❌ Invalid email format. Try again.");
    }

    if (!ctx.from) {
      await ctx.reply("⚠️ Unable to process request. Try again...");
      return ctx.scene.leave();
    }

    ctx.session.transferData.email = email;

    const payeeData = await getPayeeDetails(email, ctx.from.id);
    if (!payeeData || payeeData.length === 0) {
      await ctx.reply(
        "⚠️ No payee found with this email. Please enter a new payee name.",
      );
      return ctx.wizard.selectStep(2);
    }
    ctx.session.transferData.payeeId = payeeData[0].id;
    await ctx.reply("💰 Enter the amount (in USDC) you want to send:");
    return ctx.wizard.selectStep(3);
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("⚠️ Please enter a valid name.");
    }

    const nickName = ctx.message.text.trim();
    const newPayee = await createPayee(
      ctx,
      {
        nickName,
        email: ctx.session.transferData.email,
      },
      ctx.from!.id,
    );

    if (!newPayee) {
      await ctx.reply("❌ Failed to create payee. Please try again.");
      return ctx.scene.leave();
    }

    ctx.session.transferData.payeeId = newPayee.id;
    await ctx.reply(
      "✅ Payee created successfully! Now enter the amount to send:",
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("⚠️ Please enter a valid numeric amount.");
    }

    const amountInput = ctx.message.text.trim();
    const amount = Number(amountInput) * Math.pow(10, 6); // Convert to smallest unit

    if (isNaN(amount) || amount <= 0) {
      return ctx.reply("❌ Amount must be a positive number.");
    }

    const MIN_AMOUNT = 100000000; // 100 USDC
    const MAX_AMOUNT = 5000000000000; // 5,000,000 USDC

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return ctx.reply(
        `❌ Amount must be between **100 USDC** and **5,000,000 USDC**. Try again.`,
      );
    }

    ctx.session.transferData.amount = amount.toString();

    await ctx.reply(
      "📌 Select a purpose for this transfer:\n" +
        Object.values(PurposeCode)
          .map((code) => `- ${code}`)
          .join("\n") +
        "\n\n(Type the purpose from the list above ⬆️)",
    );
    return ctx.wizard.next();
  },

  // Step 4: Validate Purpose
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

    ctx.session.transferData.purposeCode = purposeInput as PurposeCode;
    ctx.session.transferData.currency = Currency.USDC;

    const defaultWallet = await getDefaultWallet(ctx.from!.id);
    if (!defaultWallet) {
      await ctx.reply("⚠️ No wallet found. Please set up a wallet first.");
      return ctx.scene.leave();
    }

    ctx.session.transferData.walletAddress = defaultWallet.walletAddress;

    await ctx.reply(
      `✅ **Transaction Details:**\n\n` +
        `📧 **Email:** ${ctx.session.transferData.email}\n` +
        `💰 **Amount:** ${Number(ctx.session.transferData.amount) / 10 ** 6} USDC\n` +
        `🏦 **Wallet Address:** ${ctx.session.transferData.walletAddress}\n` +
        `🎯 **Purpose:** ${ctx.session.transferData.purposeCode}\n\n` +
        `💳 Proceeding with the transfer... ⏳`,
    );
    if (!ctx.from) {
      await ctx.reply("❌ Unable to retrieve your user ID. Please try again.");
      return ctx.scene.leave();
    }

    const txDetails = await sendTx(ctx, ctx.session.transferData, ctx.from.id);
    if (txDetails) {
      await ctx.reply(
        `✅ **Transaction Completed!**\n\n` +
          `🔗 **Transaction ID:** ${txDetails.id}\n\n` +
          `🛠️ Use /recent_tx to check your latest transactions.`,
      );
    }
    return ctx.scene.leave();
  },
);
transferScene.command("cancel", async (ctx) => {
  await ctx.reply("❌ Process cancelled.");
  return ctx.scene.leave();
});

transferScene.use(async (ctx, next) => {
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

export { transferScene, type TransferData };
