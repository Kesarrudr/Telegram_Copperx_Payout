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

export {
  type PayeeDetails,
  type PayeeResponseData,
  WalletType,
  type WalletData,
};
