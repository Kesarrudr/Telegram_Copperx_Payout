import { Context, Scenes } from "telegraf";
import { TransferWizardSession, TransferWizardSessionData } from "./transfer";
import { AuthWizardSession, AuthWizardSessionData } from "./Authscene";
import {
  WithDrawWalletSession,
  WithDrawWalletSessionData,
} from "./WalletWithdraw";
import { OffRampWizardSessionData, OffRamWizardSession } from "./bank_withdraw";

interface BotContest extends Context {
  session: TransferWizardSession &
    AuthWizardSession &
    WithDrawWalletSession &
    OffRamWizardSession;
  scene: Scenes.SceneContextScene<
    BotContest,
    AuthWizardSessionData &
      TransferWizardSessionData &
      WithDrawWalletSessionData &
      OffRampWizardSessionData
  >;
  wizard: Scenes.WizardContextWizard<BotContest>;
}

export { type BotContest };
