import { Markup, Scenes } from "telegraf";
import { pushToJobQueue } from "../../../helperfunction/functions";
import { JobMethods } from "@repo/queue-config/jobTypes";
import { BotContest } from "./botContext";

export interface UserData {
  userId: number;
  email?: string;
  otp?: string;
}

export interface AuthWizardSessionData extends Scenes.WizardSessionData {}

export interface AuthWizardSession
  extends Scenes.WizardSession<AuthWizardSessionData> {
  userData: UserData;
}

const otpScene = new Scenes.WizardScene<BotContest>(
  "generate_otp",

  async (ctx) => {
    if (!ctx.chat) {
      await ctx.reply("❌ Chat not found.");
      return ctx.scene.leave();
    }

    ctx.session.userData = ctx.session.userData || {
      userId: ctx.chat.id,
    };
    await ctx.reply("📧 Enter your email to receive an OTP:");
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("❌ Please enter a valid email.");
    }

    const email = ctx.message.text.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return ctx.reply("❌ Invalid email format.");
    }

    ctx.session.userData.email = email;

    await ctx.reply(
      `📩 You entered: ${email}. Is this correct?`,
      Markup.inlineKeyboard([
        Markup.button.callback("✅ Yes", "confirm_email"),
        Markup.button.callback("❌ No", "reject_email"),
      ]),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return ctx.reply("❌ Please enter the OTP.");
    }

    const otp = ctx.message.text.trim();
    if (!otp) return ctx.reply("❌ Invalid OTP.");

    ctx.session.userData.otp = otp;

    if (!ctx.session.userData.email) {
      await ctx.reply("❌ Email is missing. Cannot authenticate.");
      ctx.wizard.selectStep(1);
      return;
    }
    await pushToJobQueue(JobMethods.AUTHENTICATE, {
      userId: ctx.session.userData.userId,
      email: ctx.session.userData.email as string,
      otp: ctx.session.userData.otp as string,
    });

    await ctx.reply("✅ OTP received. Authenticating...");

    return ctx.scene.leave();
  },
);

otpScene.action("confirm_email", async (ctx) => {
  await ctx.answerCbQuery();

  if (ctx.session && ctx.session.userData.email) {
    await pushToJobQueue(JobMethods.GENERATE_OTP, {
      email: ctx.session.userData.email,
      userId: ctx.session.userData.userId,
    });
    await ctx.editMessageText("⏳ Generating OTP...");
    ctx.wizard.selectStep(2);
  }
  if (!ctx.session.userData.email) {
    ctx.wizard.selectStep(1);
  }
});

otpScene.action("reject_email", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("❌ Email rejected. Enter a new email:");
  ctx.wizard.selectStep(1);
});

otpScene.command("cancel", async (ctx) => {
  await ctx.reply("❌ Process cancelled.");
  return ctx.scene.leave();
});

otpScene.use(async (ctx, next) => {
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

export { otpScene };
