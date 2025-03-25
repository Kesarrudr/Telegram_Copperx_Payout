import { CountryEnum, TransferStatus, TransferType } from "./constants";

enum JobMethods {
  GENERATE_OTP = "generate_otp",
  AUTHENTICATE = "authenticate",
  ABOUTME = "about_me",
  LOGOUT = "logout",
  GETKYC = "kyc",
  SetDefaultWallet = "set_default_wallet",
  GetDefaultWallet = "get_default_wallet",
  GetWallets = "get_wallets",
  GetWalletsBalances = "get_wallets_balances",
  GetTransfers = "get_transfers",
  RecentTranscation = "recentTranscation",
}

interface GenerateOtpData {
  email: string;
  userId: number;
}

interface AuthenticateData {
  userId: number;
  email: string;
  otp: string;
}

interface AboutMeData {
  userId: string;
}

interface LogoutData {
  userId: string;
}

interface KycData {
  userId: string;
}

interface SetDefaultWalletData {
  userId: string;
  walletId: string;
}

interface OnlyUserIdData {
  userId: string;
}

interface GetTransfersData {
  userId: string;
  page?: number;
  limit?: number;
  sourceCountry?: CountryEnum;
  destinationCountry?: CountryEnum;
  status?: TransferStatus;
  sync?: boolean;
  type?: TransferType;
  startDate?: string;
  endDate?: string;
}

type JobDataMap = {
  [JobMethods.GENERATE_OTP]: GenerateOtpData;
  [JobMethods.AUTHENTICATE]: AuthenticateData;
  [JobMethods.ABOUTME]: AboutMeData;
  [JobMethods.LOGOUT]: LogoutData;
  [JobMethods.GETKYC]: KycData;
  [JobMethods.SetDefaultWallet]: SetDefaultWalletData;
  [JobMethods.GetDefaultWallet]: OnlyUserIdData;
  [JobMethods.GetWallets]: OnlyUserIdData;
  [JobMethods.GetWalletsBalances]: OnlyUserIdData;
  [JobMethods.GetTransfers]: GetTransfersData;
  [JobMethods.RecentTranscation]: OnlyUserIdData;
};

interface JobsData<T extends JobMethods> {
  method: T;
  data: JobDataMap[T];
}

export {
  type GetTransfersData,
  type OnlyUserIdData,
  JobMethods,
  type SetDefaultWalletData,
  type JobsData,
  type JobDataMap,
  type GenerateOtpData,
  type AuthenticateData,
  type AboutMeData,
  type LogoutData,
  type KycData,
};
