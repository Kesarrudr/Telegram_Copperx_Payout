import { Worker } from "bullmq";
import { JobMethods, JobsData } from "@repo/queue-config/jobTypes";
import {
  aboutMe,
  authicateOTP,
  generateOtp,
  getDefaultWallet,
  getKycUpdate,
  getlast_10_transfers,
  getTransfer,
  getUserWallets,
  getWalletsBalance,
  logoutUser,
  setDefaultWallet,
} from "./hook/hook";
import { redisConnection } from "@repo/queue-config/jobQueue";

// Ensure the Redis connection is available
if (!redisConnection) {
  throw new Error("❌ Redis connection is not initialized!");
}

// Create Worker instance
try {
  new Worker<JobsData<JobMethods>>(
    "jobQueue",
    async (job) => {
      try {
        switch (job.data.method) {
          case JobMethods.GENERATE_OTP: {
            const data = job.data as JobsData<JobMethods.GENERATE_OTP>;
            await generateOtp(
              { email: data.data.email },
              data.data.userId.toString(),
            );
            return { success: true };
          }

          case JobMethods.AUTHENTICATE: {
            const data = job.data as JobsData<JobMethods.AUTHENTICATE>;
            await authicateOTP(data.data);
            return { success: true };
          }

          case JobMethods.ABOUTME: {
            const data = job.data as JobsData<JobMethods.ABOUTME>;
            await aboutMe(data.data);
            return { success: true };
          }

          case JobMethods.LOGOUT: {
            const data = job.data as JobsData<JobMethods.LOGOUT>;
            await logoutUser(data.data);
            return { success: true };
          }

          case JobMethods.GETKYC: {
            const data = job.data as JobsData<JobMethods.GETKYC>;
            await getKycUpdate(data.data);
            return { success: true };
          }

          case JobMethods.SetDefaultWallet: {
            const data = job.data as JobsData<JobMethods.SetDefaultWallet>;
            await setDefaultWallet(data.data);
            return { success: true };
          }

          case JobMethods.GetDefaultWallet: {
            const data = job.data as JobsData<JobMethods.GetDefaultWallet>;
            await getDefaultWallet(data.data);
            return { success: true };
          }

          case JobMethods.GetWallets: {
            const data = job.data as JobsData<JobMethods.GetWallets>;
            await getUserWallets(data.data);
            return { success: true };
          }

          case JobMethods.GetWalletsBalances: {
            const data = job.data as JobsData<JobMethods.GetWalletsBalances>;
            await getWalletsBalance(data.data);
            return { success: true };
          }

          case JobMethods.GetTransfers: {
            const data = job.data as JobsData<JobMethods.GetTransfers>;
            await getTransfer(data.data);
            return { success: true };
          }

          case JobMethods.RecentTranscation: {
            const data = job.data as JobsData<JobMethods.RecentTranscation>;
            await getlast_10_transfers(data.data);
            return { success: true };
          }

          default:
            console.error("❌ Unknown job method:", job.data.method);
            throw new Error(`Unknown job method: ${job.data.method}`);
        }
      } catch (error) {
        console.error("❌ Error processing job:", error);
        throw error; // Ensures job is retried if it fails
      }
    },
    { connection: redisConnection }, // ✅ Ensure correct connection is passed
  );

  console.log("✅ Worker is running and processing jobs...");
} catch (error) {
  console.error("❌ Failed to start worker:", error);
}
