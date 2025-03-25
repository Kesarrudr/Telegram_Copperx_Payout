import { redisSessionClient } from "@repo/queue-config/jobQueue";

const getAuthKey = (userId: string) => `auth:${userId}`;

const storeAuthToken = async (userId: string, authToken: string) => {
  const key = getAuthKey(userId);
  await redisSessionClient.set(key, authToken);
};

const getAuthToken = async (userId: string) => {
  const key = getAuthKey(userId);
  return await redisSessionClient.get(key);
};

const setSid = async (email: string, sid: string) => {
  await redisSessionClient.set(email, sid, "EX", 300);
};

const getSid = async (email: string) => {
  const sidId = await redisSessionClient.get(email);
  await redisSessionClient.del(email);

  return sidId;
};

const deleteAuthToken = async (userId: string) => {
  return (await redisSessionClient.del(userId)) ? true : false;
};

export {
  getAuthKey,
  getAuthToken,
  getSid,
  setSid,
  storeAuthToken,
  deleteAuthToken,
};
