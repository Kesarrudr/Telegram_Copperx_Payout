import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getAuthToken } from "../function/functions";

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL || `https://income-api.copperx.io/api`,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  //TODO: add better logic
  const userId: string = config.headers["X-User-Id"];

  if (userId) {
    const authToken = await getAuthToken(userId);
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const errorResponse = error.response?.data as {
      message?: any;
      statusCode?: number;
      error?: string;
    };

    //WARNING: logging error
    console.log("error", errorResponse);

    const statusCode = errorResponse.statusCode;
    if (statusCode && statusCode === 401) {
      //TODO: remove the Stored AuthToken
      //and tell user to verify again
    }
    const errorMessage =
      typeof errorResponse?.message === "string"
        ? errorResponse.message
        : "Something went wrong, please try again...";

    //TODO: send the error message to the user
    return Promise.reject(errorMessage);
  },
);

const axiosPostRequest = async <TRequest, TResponse>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig,
) => {
  const response = await axiosInstance.post<TRequest, AxiosResponse<TResponse>>(
    url,
    data,
    config,
  );

  return response.data;
};

const axiosGetRequest = async <TRequest, TResponse>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const response = await axiosInstance.get<TRequest, AxiosResponse<TResponse>>(
    url,
    config,
  );
  return response.data;
};

const sendMessageToTelegram = async (
  message: string,
  userId: string,
  retryCount = 3,
) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || ""}/sendMessage`;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      await axios.post(url, {
        chat_id: userId,
        text: message,
        parse_mode: "Markdown",
      });

      console.log("✅ Message sent successfully.");
      return;
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error.code);

      if (attempt === retryCount) {
        console.error("❌ All retries failed. Giving up.");
      } else {
        console.log("⏳ Retrying in 2 seconds...");
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }
};

export { axiosPostRequest, axiosGetRequest, sendMessageToTelegram };
