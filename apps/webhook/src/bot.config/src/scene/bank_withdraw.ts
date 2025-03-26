import { CountryEnum, PurposeCode } from "@repo/queue-config/constant";
import { Markup, Scenes } from "telegraf";
import { BotContest } from "./botContext";
import {
  getKYCDetails,
  getQuote,
  offRampTx,
} from "../../../helperfunction/hook/hook";
import { Convert } from "../../../helperfunction/functions";

interface OfframpTransferData {
  quotePayload: string;
  quoteSignature: string;
  purposeCode: PurposeCode.SELF;
  amount: number;
  destinationCountry: CountryEnum;
}

interface OffRampWizardSessionData extends Scenes.WizardSessionData {}

interface OffRamWizardSession
  extends Scenes.WizardSession<OffRampWizardSessionData> {
  offrampData: OfframpTransferData;
}

const offRampScene = new Scenes.WizardScene<BotContest>(
  "bank_transfer",

  async (ctx) => {
    if (!ctx.chat) {
      await ctx.reply(
        "❌ Error: Unable to identify your chat. Please try again.",
      );
      return ctx.scene.leave();
    }
    ctx.session.offrampData = {} as OfframpTransferData;

    await ctx.reply("🔍 Retrieving your KYC details...");
    const kycData = await getKYCDetails(ctx, ctx.chat.id);

    if (kycData && kycData.data) {
      //TODO: check length
      await ctx.reply(
        "💰 Please enter the amount (in USDC) that you want to withdraw.\n\n" +
          "⚠️ Minimum: **10 USDC** | Maximum: **5,000,000 USDC**",
      );
      return ctx.wizard.next();
    }

    await ctx.reply(
      "🚀 No KYC records found. To proceed with off-ramping, please complete your KYC verification at [Copperx](https://copperx.io).",
    );
    return ctx.scene.leave();
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply(
        "⚠️ Invalid input. Please enter a numeric amount in USDC.",
      );
    }

    const amountInput = ctx.message.text.trim();
    const amount = Number(amountInput) * Math.pow(10, 8);

    if (isNaN(amount) || amount <= 0) {
      return ctx.reply(
        "❌ Invalid amount. Please enter a positive numeric value.",
      );
    }

    const MIN_AMOUNT = 10 * Math.pow(10, 8);
    const MAX_AMOUNT = 5_000_000 * Math.pow(10, 8);

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return ctx.reply(
        `❌ The amount must be between **10 USDC** and **5,000,000 USDC**.\n\n` +
          "Please enter a valid amount.",
      );
    }

    ctx.session.offrampData = {} as OfframpTransferData;
    ctx.session.offrampData.amount = amount;

    const countryButtons = Object.values(CountryEnum).map((country) =>
      Markup.button.callback(country, `country_${country}`),
    );

    await ctx.reply(
      "🌍 Please select your destination country from the list below:",
      Markup.inlineKeyboard(countryButtons, { columns: 2 }),
    );

    return ctx.wizard.next();
  },

  async (ctx) => {
    await ctx.reply(
      `🔍 Fetching the best conversion quote for **${ctx.session.offrampData.amount / Math.pow(10, 8)} USDC** to **${ctx.session.offrampData.destinationCountry}**...`,
    );

    const quote = await getQuote(
      ctx,
      ctx.session.offrampData.amount,
      ctx.session.offrampData.destinationCountry,
    );

    if (!quote) {
      await ctx.reply(
        "❌ Unable to generate a quote at the moment. Please try again later.",
      );
      return ctx.scene.leave();
    }
    const quoteData = Convert.toQuoteData(quote.quotePayload);

    ctx.session.offrampData.quoteSignature = quote.quoteSignature;
    ctx.session.offrampData.quotePayload = quote.quotePayload;

    const amount = Number(quoteData.amount) / 1e8;
    const toAmount = Number(quoteData.toAmount) / 1e8;
    const fixedFee = Number(quoteData.fixedFee);
    const feePercentage = Number(quoteData.feePercentage) / 100;
    const totalFee = fixedFee + feePercentage * amount;

    await ctx.reply(
      `💰 **Quote Details** 💰\n\n` +
        `🔹 **You are sending:** ${amount.toFixed(2)} USDC\n` +
        `🔹 **You will receive:** ${toAmount.toFixed(2)} ${quoteData.toCurrency}\n` +
        `🔹 **Exchange Rate:** 1 USDC = ${quoteData.rate} ${quoteData.toCurrency}\n` +
        `🔹 **Google Rate:** 1 USDC = ${quoteData.googleRate} ${quoteData.toCurrency}\n\n` +
        `💸 **Fees & Deductions:**\n` +
        `🔹 **Total Fee:** ${totalFee.toFixed(2)} USDC\n` +
        `🔹 **Fixed Fee:** ${fixedFee.toFixed(2)} USDC\n` +
        `🔹 **Fee Percentage:** ${quoteData.feePercentage}%\n\n` +
        `🚀 Do you want to proceed with this off-ramp transaction?`,
      Markup.inlineKeyboard([
        Markup.button.callback("✅ Yes, Confirm", "confirm_offramp"),
        Markup.button.callback("❌ No, Cancel", "cancel_offramp"),
      ]),
    );
  },
);

offRampScene.action(/^country_(.+)$/, async (ctx, next) => {
  await ctx.answerCbQuery();
  const selectedCountry = ctx.match[1] as CountryEnum;

  if (!Object.values(CountryEnum).includes(selectedCountry)) {
    return ctx.reply(
      "⚠️ Invalid country selection. Please choose from the available options.",
    );
  }

  ctx.session.offrampData = {
    ...ctx.session.offrampData,
    destinationCountry: selectedCountry,
  };
  await ctx.editMessageText(
    `✅ You selected **${selectedCountry}** as your destination country.`,
  );
  if (typeof ctx.wizard.step === "function") {
    return ctx.wizard.step(ctx, next);
  }
});

offRampScene.action("confirm_offramp", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🛠️ Processing your off-ramp transaction...");

  const tx = await offRampTx(
    ctx,
    ctx.session.offrampData.purposeCode,
    ctx.session.offrampData.quotePayload,
    ctx.session.offrampData.quoteSignature,
  );

  if (tx) {
    await ctx.reply(
      `✅ **Transaction Successful!**\n\n` +
        `📌 **Transaction ID:** ${tx.id}\n` +
        `🔍 You can track your transaction in the recent transactions section.`,
    );
    return ctx.scene.leave();
  }

  await ctx.reply(
    "❌ Failed to process the transaction. Please try again later.",
  );
  return ctx.scene.leave();
});

offRampScene.action("cancel_offramp", async (ctx) => {
  await ctx.reply(
    "❌ Transaction cancelled. If you wish to try again, restart the process.",
  );
  return ctx.scene.leave();
});

offRampScene.command("cancel", async (ctx) => {
  await ctx.reply("❌ Process cancelled.");
  return ctx.scene.leave();
});

offRampScene.use(async (ctx, next) => {
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
  offRampScene,
  type OffRamWizardSession,
  type OffRampWizardSessionData,
};
