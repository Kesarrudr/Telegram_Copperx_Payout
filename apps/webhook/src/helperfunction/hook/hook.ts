import { Context } from "telegraf";
import { axiosGetRequest, axiosPostRequest } from "../../axios/axios.config";
import { TransferData } from "../../bot.config/src/scene/transfer";
import { PayeeDetails, PayeeResponseData, WalletData } from "../../types/types";
import { safeExecute } from "../functions";
import { AxiosResponse } from "axios";

const getPayeeDetails = async (email: string, userId: number) => {
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
};

const getDefaultWallet = async (userId: number) => {
  const response = await axiosGetRequest<any, WalletData>("/wallets/default", {
    headers: {
      "X-User-Id": userId,
    },
  });

  if (response) {
    return response;
  }
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

export { getPayeeDetails, getDefaultWallet, sendTx, createPayee };
