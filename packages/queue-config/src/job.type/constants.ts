enum CountryEnum {
  USA = "usa",
  IND = "ind",
  ARE = "are",
  IDN = "idn",
  PAK = "pak",
  SGP = "sgp",
  ESP = "esp",
  CAN = "can",
  CYM = "cym",
  LBN = "lbn",
  MYS = "mys",
  PAN = "pan",
  TUR = "tur",
  VCT = "vct",
  VGB = "vgb",
  VNM = "vnm",
  BEL = "bel",
  THA = "tha",
  HKG = "hkg",
  AUT = "aut",
  HRV = "hrv",
  CYP = "cyp",
  EST = "est",
  FIN = "fin",
  FRA = "fra",
  GRE = "gre",
  IRL = "irl",
  ITA = "ita",
  LVA = "lva",
  LTU = "ltu",
  LUX = "lux",
  MLT = "mlt",
  NLD = "nld",
  PRT = "prt",
  SVK = "svk",
  SVN = "svn",
  DEU = "deu",
  BGD = "bgd",
  PHL = "phl",
  KHM = "khm",
  AUS = "aus",
  GBR = "gbr",
  NPL = "npl",
  LKA = "lka",
  BEN = "ben",
  CMR = "cmr",
  GHA = "gha",
  KEN = "ken",
  MOZ = "moz",
  SEN = "sen",
  TZA = "tza",
  UGA = "uga",
  NZL = "nzl",
  KOR = "kor",
  MMR = "mmr",
  JPN = "jpn",
  BRA = "bra",
  CHN = "chn",
  NONE = "none",
}

enum TransferStatus {
  PENDING = "pending",
  INITIATED = "initiated",
  PROCESSING = "processing",
  SUCCESS = "success",
  CANCELED = "canceled",
  FAILED = "failed",
  REFUNDED = "refunded",
}

enum TransferType {
  SEND = "send",
  RECEIVE = "receive",
  WITHDRAW = "withdraw",
  DEPOSIT = "deposit",
  BRIDGE = "bridge",
  BANK_DEPOSIT = "bank_deposit",
}

enum Currency {
  USD = "USD",
  INR = "INR",
  AED = "AED",
  IDR = "IDR",
  PKR = "PKR",
  SGD = "SGD",
  EUR = "EUR",
  MYR = "MYR",
  CAD = "CAD",
  KYD = "KYD",
  LBP = "LBP",
  TRY = "TRY",
  XCD = "XCD",
  VND = "VND",
  THB = "THB",
  HKD = "HKD",
  BDT = "BDT",
  PHP = "PHP",
  KHR = "KHR",
  AUD = "AUD",
  GBP = "GBP",
  NPR = "NPR",
  LKR = "LKR",
  XOF = "XOF",
  XAF = "XAF",
  GHS = "GHS",
  KES = "KES",
  MZN = "MZN",
  TZS = "TZS",
  UGX = "UGX",
  NZD = "NZD",
  KRW = "KRW",
  MMK = "MMK",
  JPY = "JPY",
  BRL = "BRL",
  CNY = "CNY",
  USDC = "USDC",
  USDT = "USDT",
  DAI = "DAI",
  ETH = "ETH",
  USDCE = "USDCE",
  STRK = "STRK",
}

enum PurposeCode {
  SELF = "self",
  SALARY = "salary",
  GIFT = "gift",
  INCOME = "income",
  SAVING = "saving",
  EDUCATION_SUPPORT = "education_support",
  FAMILY = "family",
  HOME_IMPROVEMENT = "home_improvement",
  REIMBURSEMENT = "reimbursement",
}

export { CountryEnum, TransferType, TransferStatus, Currency, PurposeCode };
