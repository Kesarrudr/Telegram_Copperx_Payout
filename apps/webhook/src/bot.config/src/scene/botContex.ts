import { Context, Scenes } from "telegraf";
import { TransferWizardSession, TransferWizardSessionData } from "./transfer";
import { AuthWizardSession, AuthWizardSessionData } from "./Authscene";

interface BotContest extends Context {
  session: TransferWizardSession & AuthWizardSession;
  scene: Scenes.SceneContextScene<
    BotContest,
    AuthWizardSessionData & TransferWizardSessionData
  >;
  wizard: Scenes.WizardContextWizard<BotContest>;
}

export { type BotContest };
