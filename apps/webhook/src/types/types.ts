interface PayeeResponseData {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: PayeeDetails[];
}

interface PayeeDetails {
  id: string;
  email: string;
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

interface QuoteData {
  amount: string;
  toAmount: string;
  toCurrency: string;
  rate: string;
  googleRate: string;
  totalFee: string;
  totalTax: string;
  fixedFee: string;
  feePercentage: string;
  sourceCountry: string;
  destinationCountry: string;
  createdAt: Date;
  organizationId: string;
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

enum KycStatus {
  PENDING = "pending",
  INITIATED = "initiated",
  IN_PROGRESS = "in_progress",
  REVIEW_PENDING = "review_pending",
  UNDER_REVIEW = "under_review",
  PROVIDER_MANUAL_REVIEW = "provider_manual_review",
  MANUAL_REVIEW = "manual_review",
  PROVIDER_ON_HOLD = "provider_on_hold",
  ON_HOLD = "on_hold",
  EXPIRED = "expired",
  APPROVED = "approved",
  REJECTED = "rejected",
}

interface QuoteResponseData {
  quotePayload: "string";
  quoteSignature: "string";
}

interface MeResponseData {
  id: string;
  organizationId: string;
}

export {
  type MeResponseData,
  type QuoteData,
  type PayeeDetails,
  type QuoteResponseData,
  type KYCresponseData,
  type PayeeResponseData,
  WalletType,
  type KycStatus,
  type WalletData,
};
