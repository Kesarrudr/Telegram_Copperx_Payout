import { Context } from "telegraf";
import { axiosGetRequest, axiosPostRequest } from "../../axios/axios.config";
import { TransferData } from "../../bot.config/src/scene/transfer";
import {
  KYCresponseData,
  MeResponseData,
  PayeeDetails,
  PayeeResponseData,
  QuoteResponseData,
  WalletData,
} from "../../types/types";
import { Convert, safeExecute } from "../functions";
import { AxiosResponse } from "axios";
import { WalletWithDrawData } from "../../bot.config/src/scene/WalletWithdraw";
import { CountryEnum, PurposeCode } from "@repo/queue-config/constant";
import { AxiosError } from "axios";

const getPayeeDetails = async (ctx: Context, email: string, userId: number) => {
  return safeExecute(ctx, async () => {
    let payeeData: PayeeDetails[] = [];
    let hasMore: boolean;
    let page = 1;

    do {
      const response = await axiosGetRequest<any, PayeeResponseData>(
        `/payees?searchText=${email}&page=${page}`, // Ensure correct API request
        {
          headers: {
            "X-User-Id": userId,
          },
        },
      );

      payeeData = [...payeeData, ...response.data];
      hasMore = response.hasMore;
      page++;
    } while (hasMore);

    return payeeData;
  });
};

const getDefaultWallet = async (ctx: Context, userId: number) => {
  return safeExecute(ctx, async () => {
    const response = await axiosGetRequest<any, WalletData>(
      "/wallets/default",
      {
        headers: {
          "X-User-Id": userId,
        },
      },
    );

    if (response) {
      return response;
    }
  });
};

const sendTx = async (ctx: Context, data: TransferData, userId: number) => {
  return safeExecute(ctx, async () => {
    const response = await axiosPostRequest<any, AxiosResponse>(
      "/transfers/send",
      data,
      {
        headers: { "X-User-Id": userId },
      },
    );
    return response.data;
  });
};

const createPayee = async (
  ctx: Context,
  data: { nickName: string; email: string },
  userId: number,
) => {
  return safeExecute(ctx, async () => {
    const response = await axiosPostRequest<any, any>(`/payees`, data, {
      headers: {
        "X-User-Id": userId,
      },
    });

    return response;
  });
};

const withDrawWallet = async (
  ctx: Context,
  data: WalletWithDrawData,
  userId: number,
) => {
  return safeExecute(ctx, async () => {
    const response = await axiosPostRequest<any, any>(
      "/transfers/wallet-withdraw",
      data,
      {
        headers: {
          "X-User-Id": userId,
        },
      },
    );
    return response;
  });
};

const getKYCDetails = async (ctx: Context, userId: number) => {
  return safeExecute(ctx, async () => {
    const response = await axiosGetRequest<any, KYCresponseData>("/kycs", {
      headers: {
        "X-User-Id": userId,
      },
    });

    return response;
  });
};

const getQuote = async (
  ctx: Context,
  amount: number,
  destinationCountry: CountryEnum,
) => {
  return safeExecute(ctx, async () => {
    const response = await axiosPostRequest<any, QuoteResponseData>(
      "/quotes/public-offramp",
      {
        amount: amount,
        sourceCountry: "none",
        destinationCountry: destinationCountry,
      },
      {
        headers: {
          "X-User-Id": ctx.chat?.id,
        },
      },
    );

    return response;
  });
};

const offRampTx = async (
  ctx: Context,
  purpose: PurposeCode.SELF,
  quotePayload: string,
  quoteSignature: string,
) => {
  return safeExecute(ctx, async () => {
    if (!ctx.from) {
      throw new AxiosError("Something Went wrong try again...", "500");
    }
    const response = await axiosPostRequest<any, any>(
      `/transfers/offramp`,
      {
        purposeCode: purpose,
        quotePayload: quotePayload,
        quoteSignature: quoteSignature,
      },
      {
        headers: {
          "X-User-Id": ctx.from?.id,
        },
      },
    );

    return response;
  });
};

const getUserDetails = async (ctx: Context) => {
  return safeExecute(ctx, async () => {
    if (!ctx.from) {
      throw new AxiosError("Something Went wrong try again...", "500");
    }
    const reponse = await axiosGetRequest<any, MeResponseData>("/auth/me", {
      headers: {
        "X-User-Id": ctx.from.id,
      },
    });

    return reponse;
  });
};

export {
  offRampTx,
  getQuote,
  getKYCDetails,
  getPayeeDetails,
  getDefaultWallet,
  sendTx,
  createPayee,
  withDrawWallet,
  getUserDetails,
};
