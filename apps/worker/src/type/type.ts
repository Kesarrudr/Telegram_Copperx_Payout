import {
  CountryEnum,
  Currency,
  TransferStatus,
  TransferType,
} from "@repo/queue-config/constant";

interface generateOtpReqestData {
  email: string;
}

interface LoginOtpResponseData {
  email: string;
  sid: string;
}

interface VerifyEmailOtpRequestData {
  email: string;
  otp: string;
  sid: string;
}

interface AuthicateResponseData {
  schema: string;
  accessToken: string;
  accessTokenId: string;
  expireAt: string;
  user: {};
}

interface AboutMeResponseData {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  walletAddress: string;
}

enum KycStatus {
  pending,
  initiated,
  inprogress,
  review_pending,
  review,
  provider_manual_review,
  manual_review,
  provider_on_hold,
  on_hold,
  expired,
  approved,
  rejected,
}

interface KYCresponseData {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: [
    {
      statusUpdates: string;
      status: KycStatus;
    },
  ];
}

enum WalletType {
  WEB3_AUTH_COPPERX = "web3_auth_copperx",
  SAFE = "safe",
  CIRCLE_DEV = "circle_dev",
  EOA = "eoa",
  OTHER = "other",
  QUANTUM = "quantum",
}

interface WalletData {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  walletType: WalletType;
  network: string;
  walletAddress: string;
  isDefault: boolean;
}

type WalletsResponseData = WalletData[];

enum SymbolEnum {
  USDC = "usdc",
  USDT = "usdt",
  DAI = "dai",
  ETH = "eth",
  USDCE = "usdce",
  STRK = "strk",
}

interface BalanceData {
  decimals: number;
  balance: string;
  symbol: SymbolEnum;
  address: string;
}

interface WalletBalanceData {
  walletId: string;
  isDefault: boolean;
  network: string;
  balances: BalanceData[];
}

type WalletBalanceResponseData = WalletBalanceData[];

type SetDefaultWalletResponseData = WalletData;

interface setDefaultWalletRequestBody {
  walletId: string;
}

interface TransferData {
  id: string;
  createdAt: string;
  type: TransferType;
  amount: string;
  currency: Currency;
  sourceCountry: CountryEnum;
  destinationCountry: CountryEnum;
  status: TransferStatus;
  totalFee: string;
  sourceAccountId: string;
}

interface getTransferResponseData {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: TransferData[];
}

export {
  type getTransferResponseData,
  type TransferData,
  type WalletBalanceData,
  type setDefaultWalletRequestBody,
  type WalletBalanceResponseData,
  type SetDefaultWalletResponseData,
  type BalanceData,
  SymbolEnum,
  type WalletData,
  WalletType,
  type WalletsResponseData,
  type generateOtpReqestData,
  type LoginOtpResponseData,
  type VerifyEmailOtpRequestData,
  type AuthicateResponseData,
  type AboutMeResponseData,
  KycStatus,
  type KYCresponseData,
};
