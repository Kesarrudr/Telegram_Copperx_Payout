import {
  AuthenticateData,
  AboutMeData,
  LogoutData,
  KycData,
  SetDefaultWalletData,
  OnlyUserIdData,
  GetTransfersData,
} from "@repo/queue-config/jobTypes";

import {
  axiosGetRequest,
  axiosPostRequest,
  sendMessageToTelegram,
} from "../axios-config/config";
import {
  deleteAuthToken,
  getSid,
  setSid,
  storeAuthToken,
} from "../function/functions";
import {
  AboutMeResponseData,
  AuthicateResponseData,
  generateOtpReqestData,
  getTransferResponseData,
  KYCresponseData,
  LoginOtpResponseData,
  setDefaultWalletRequestBody,
  SetDefaultWalletResponseData,
  VerifyEmailOtpRequestData,
  WalletBalanceResponseData,
  WalletsResponseData,
} from "../type/type";

const generateOtp = async (data: generateOtpReqestData, userId: string) => {
  const response = await axiosPostRequest<
    generateOtpReqestData,
    LoginOtpResponseData
  >("/auth/email-otp/request", data);
  if (response) {
    await setSid(response.email, response.sid);
    await sendMessageToTelegram("📨 OTP sent! Enter it now:", userId);
  }
};

const authicateOTP = async (data: AuthenticateData) => {
  const sid = await getSid(data.email);
  if (!sid) {
    await sendMessageToTelegram(
      "❌ Can't authenticate now! Please try again later.",
      data.userId.toString(),
    );
    return;
  }
  const response = await axiosPostRequest<
    VerifyEmailOtpRequestData,
    AuthicateResponseData
  >("/auth/email-otp/authenticate", {
    email: data.email,
    sid: sid,
    otp: data.otp,
  });
  if (response) {
    //TODO: implement some time of refresh logic
    await storeAuthToken(data.userId.toString(), response.accessToken);
    await sendMessageToTelegram(
      "✅ Authentication Successful!",
      data.userId.toString(),
    );
  }
};

const aboutMe = async (data: AboutMeData) => {
  const response = await axiosGetRequest<any, AboutMeResponseData>("/auth/me", {
    headers: {
      "X-User-Id": data.userId,
    },
  });

  if (response) {
    await sendMessageToTelegram(
      `Your details:\n\n📝 First Name: ${response.firstName}\n👤 Last Name: ${response.lastName}\n📧 Email: ${response.email}\n💰 Wallet Address: ${response.walletAddress}`,
      data.userId,
    );
  }
};

const logoutUser = async (data: LogoutData) => {
  const flag = await deleteAuthToken(data.userId);
  if (flag) {
    await sendMessageToTelegram(`Logged Out successfully`, data.userId);
    return;
  } else {
    await sendMessageToTelegram(
      `Can't LougOut now. Try after some time...`,
      data.userId,
    );
    return;
  }
};

const getKycUpdate = async (data: KycData) => {
  const response = await axiosGetRequest<any, KYCresponseData>("/kycs", {
    headers: {
      "X-User-Id": data.userId,
    },
  });

  if (response.data && response.data.length > 0) {
    const kyc = response.data[0];
    await sendMessageToTelegram(
      `🔍 *KYC Status Update*:\n\n📌 Status: *${kyc.status}*\n📝 Updates: *${kyc.statusUpdates || "No updates available"}*`,
      data.userId,
    );
  } else {
    await sendMessageToTelegram(
      `🚀 No KYC records found. Please complete your KYC at [Copperx](https://copperx.io).`,
      data.userId,
    );
  }
};

const setDefaultWallet = async (data: SetDefaultWalletData) => {
  const response = await axiosPostRequest<
    setDefaultWalletRequestBody,
    SetDefaultWalletResponseData
  >(
    "/wallets/default",
    { walletId: data.walletId },
    {
      headers: {
        "X-User-Id": data.userId,
      },
    },
  );
  if (response) {
    await sendMessageToTelegram(
      `✅ Your default wallet has been successfully updated!  
    \n🔹 **Wallet Address:** \`${response.walletAddress}\`  
    🔹 **Network:** ${response.network}  
    🔹 **Wallet Type:** ${response.walletType}  
    \nYou can now use this wallet for all transactions. 🚀`,
      data.userId,
    );
  }
};

const getDefaultWallet = async (data: OnlyUserIdData) => {
  const response = await axiosGetRequest<any, SetDefaultWalletResponseData>(
    "/wallets/default",
    {
      headers: {
        "X-User-Id": data.userId,
      },
    },
  );
  if (response) {
    await sendMessageToTelegram(
      `✅ Your default wallet!  
    \n🔹 **Wallet Address:** \`${response.walletAddress}\`  
    🔹 **Network:** ${response.network}  
    🔹 **Wallet Type:** ${response.walletType}  
    \nYou can now use this wallet for all transactions. 🚀`,
      data.userId,
    );
  }
};

const getUserWallets = async (data: OnlyUserIdData) => {
  const response = await axiosGetRequest<any, WalletsResponseData>("/wallets", {
    headers: {
      "X-User-Id": data.userId,
    },
  });

  if (response && response.length > 0) {
    const message = response
      .map((wallet, index) => {
        return (
          `🔹 *Wallet ${index + 1}:*\n` +
          `🏦 *Wallet ID:* \`${wallet.id}\`\n` +
          `📌 *Type:* ${wallet.walletType}\n` +
          `🌍 *Network:* ${wallet.network}\n` +
          `🏦 *Address:* \`${wallet.walletAddress}\`\n` +
          `⭐ *Default:* ${wallet.isDefault ? "✅ Yes" : "❌ No"}`
        );
      })
      .join("\n\n"); // Add spacing between wallets

    await sendMessageToTelegram(
      `Here are your wallets:\n\n${message}`,
      data.userId,
    );
  } else {
    await sendMessageToTelegram(
      "No wallets found. Please add a wallet.",
      data.userId,
    );
  }
};

const getWalletsBalance = async (data: OnlyUserIdData) => {
  const response = await axiosGetRequest<any, WalletBalanceResponseData>(
    "/wallets/balances",
    {
      headers: {
        "X-User-Id": data.userId,
      },
    },
  );

  if (response && response.length > 0) {
    const message = response
      .map((wallet, index) => {
        const balances = wallet.balances
          .map((bal) => {
            const formattedBalance = (
              parseFloat(bal.balance) /
              10 ** bal.decimals
            ).toFixed(4); // Format balance correctly
            return `💰 *${bal.symbol}:* ${formattedBalance} (${bal.address})`;
          })
          .join("\n");

        return (
          `🔹 *Wallet ${index + 1}:*\n` +
          `🌍 *Network:* ${wallet.network}\n` +
          `🏦 *Wallet ID:* \`${wallet.walletId}\`\n` +
          `⭐ *Default:* ${wallet.isDefault ? "✅ Yes" : "❌ No"}\n` +
          `📊 *Balances:*\n${balances || "No balance available"}`
        );
      })
      .join("\n\n");

    await sendMessageToTelegram(
      `Here are your wallet balances:\n\n${message}`,
      data.userId,
    );
  } else {
    await sendMessageToTelegram("No wallet balances found.", data.userId);
  }
};

const getTransfer = async (data: GetTransfersData) => {
  //TODO: add additional query para meter
  // if (data) {
  //   const queryParams = new URLSearchParams({
  //     page: data.page.toString(),
  //     limit: data.limit.toString(),
  //     sourceCountry: data.sourceCountry,
  //     destinationCountry: data.destinationCountry,
  //     status: data.status,
  //     sync: data.sync.toString(),
  //     type: data.type,
  //     startDate: data.startDate.toString(),
  //     endDate: data.endDate.toString(),
  //   });
  // }

  const response = await axiosGetRequest<any, getTransferResponseData>(
    "/transfers",
    {
      headers: {
        "X-User-Id": data.userId,
      },
    },
  );
  if (response.data && response.data.length > 0) {
    const transfers = response.data
      .map(
        (transfer) =>
          `🔹 *Transfer ID:* ${transfer.id}\n` +
          `📅 *Date:* ${new Date(transfer.createdAt).toLocaleString()}\n` +
          `💰 *Amount:* ${transfer.amount} ${transfer.currency}\n` +
          `🔄 *Type:* ${transfer.type}\n` +
          `🌍 *From:* ${transfer.sourceCountry} ➡️ *To:* ${transfer.destinationCountry}\n` +
          `📌 *Status:* ${transfer.status}\n` +
          `💸 *Total Fee:* ${transfer.totalFee}\n` +
          `🏦 *Source Account ID:* ${transfer.sourceAccountId}`,
      )
      .join("\n\n");

    const message = `📢 *Transfer Summary*\n\n${transfers}\n\n📊 *Page:* ${response.page}/${Math.ceil(response.count / response.limit)}\n📈 *Total Transfers:* ${response.count}\n${
      response.hasMore
        ? "🔜 More transfers available..."
        : "✅ No more transfers."
    }`;

    await sendMessageToTelegram(message, data.userId);
    return;
  } else {
    await sendMessageToTelegram(
      "🚫 *No transfers found.* You haven't made any transfers yet.",
      data.userId,
    );
    return;
  }
};

const getlast_10_transfers = async (data: OnlyUserIdData) => {
  const response = await axiosGetRequest<any, getTransferResponseData>(
    "/transfers?page=1&limit=10",
    {
      headers: {
        "X-User-Id": data.userId,
      },
    },
  );
  if (response.data && response.data.length > 0) {
    const transfers = response.data
      .map(
        (transfer) =>
          `🔹 *Transfer ID:* ${transfer.id}\n` +
          `📅 *Date:* ${new Date(transfer.createdAt).toLocaleString()}\n` +
          `💰 *Amount:* ${transfer.amount} ${transfer.currency}\n` +
          `🔄 *Type:* ${transfer.type}\n` +
          `🌍 *From:* ${transfer.sourceCountry} ➡️ *To:* ${transfer.destinationCountry}\n` +
          `📌 *Status:* ${transfer.status}\n` +
          `💸 *Total Fee:* ${transfer.totalFee}\n` +
          `🏦 *Source Account ID:* ${transfer.sourceAccountId}`,
      )
      .join("\n\n");

    const message = `📢 *Transfer Summary*\n\n${transfers}\n\n📊 *Page:* ${response.page}/${Math.ceil(response.count / response.limit)}\n📈 *Total Transfers:* ${response.count}\n${
      response.hasMore
        ? "🔜 More transfers available..."
        : "✅ No more transfers."
    }`;

    await sendMessageToTelegram(message, data.userId);
    return;
  } else {
    await sendMessageToTelegram(
      "🚫 *No transfers found.* You haven't made any transfers yet.",
      data.userId,
    );
    return;
  }
};

export {
  getlast_10_transfers,
  getTransfer,
  getWalletsBalance,
  getUserWallets,
  generateOtp,
  getDefaultWallet,
  authicateOTP,
  aboutMe,
  logoutUser,
  getKycUpdate,
  setDefaultWallet,
};
