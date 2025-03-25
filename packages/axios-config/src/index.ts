import axios, { AxiosRequestConfig } from "axios";
import { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.BASE_URL ||
    //TODO: change this url as not sending using bot singleton
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    //TODO: send this message to the telegram bot
    const message = "Some thing is wrong try again...";

    return Promise.reject(error);
  },
);

//TODO: add types also of the response as well
const axiosPostRequest = async <TRequest>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig,
) => {
  const response = await axiosInstance.post(url, data, config);
  if (response instanceof AxiosError) {
    return response.data;
  }

  return response.data;
};

//TODO: add type here of the data receving and sending
const axiosGetRequest = async (url: string, config?: AxiosRequestConfig) => {
  const response = await axiosInstance.get(url, config);
  return response.data;
};

export { axiosPostRequest, axiosGetRequest };
