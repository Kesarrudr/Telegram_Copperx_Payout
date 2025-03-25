import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getAuthToken } from "../helperfunction/functions";

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

    const statusCode = errorResponse.statusCode;
    if (statusCode && statusCode === 401) {
      //TODO: remove the Stored AuthToken
      //and tell user to verify again
    }
    const errorMessage =
      typeof errorResponse?.message === "string"
        ? errorResponse.message
        : "Something went wrong, please try again...";

    console.log(errorMessage);
    return Promise.reject(new AxiosError(errorMessage));
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

export { axiosPostRequest, axiosGetRequest };
