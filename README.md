# 🏆 CopperX Payout Telegram Bot

## 🚀 Introduction

The **CopperX Payout Telegram Bot** allows users to seamlessly manage their wallets, perform transactions, and receive real-time deposit notifications directly within Telegram. This bot is built as part of the [Superteam Earn Bounty](https://earn.superteam.fun/listing/telegram-bot-for-copperx-payout/) and meets all the requirements outlined in the bounty listing.

🔗 **Check the deployed bot here:** [@copper_X_payoutBot](https://t.me/copper_X_payoutBot)

## 🔥 Features

- **User Authentication**: Secure authentication for users.
- **Wallet Management**: Retrieve and set default wallets.
- **Fund Transfers**: Send funds via email, external wallets, and bank transfers.
- **Transaction History**: View past transactions and recent activities.
- **Real-time Deposit Notifications**: Subscribe to deposit notifications.

## 📜 Available Commands

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `/start`                 | Start the bot                        |
| `/help`                  | Get help and available commands      |
| `/auth`                  | Authenticate your account            |
| `/balance`               | Check your account balance           |
| `/cancel`                | Cancel any ongoing process           |
| `/me`                    | Get details about your data          |
| `/kyc`                   | Get your KYC status                  |
| `/wallets`               | Retrieve wallet details              |
| `/default_wallet`        | Get details of your default wallet   |
| `/transaction_history`   | View your transaction history        |
| `/recent_tx`             | Get recent transaction details       |
| `/transfer`              | Send funds to an email address       |
| `/wallet_withdraw`       | Withdraw funds to an external wallet |
| `/bank_transfer`         | Withdraw funds to a bank account     |
| `/subscibe_notification` | Subscribe to deposit notifications   |

## 🛠️ Setup Instructions

### 1️⃣ Prerequisites

- Node.js (v18+ recommended)
- Redis (for caching socket IDs)
- A Telegram bot token from [BotFather](https://t.me/BotFather)
- Pusher credentials for event streaming

### 2️⃣ Installation

```sh
# Clone the repository
git clone https://github.com/yourusername/copperx-telegram-bot.git
cd copperx-telegram-bot

# Install dependencies
npm install
```

### 3️⃣ Configuration

Create a `.env` file in the root directory and add the following environment variables:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PUSHER_KEY=your_pusher_key
PUSHER_CLUSTER=your_pusher_cluster
REDIS_URL=your_redis_url
API_BASE_URL=https://api.copperx.io
```

### 4️⃣ Running the Bot

```sh
npm start
```

The bot will now be running and ready to receive commands.

## 🔔 Handling Deposit Notifications

This bot uses **Pusher** to listen for deposit events and sends notifications to subscribed users.

1. **User subscribes to deposit notifications** using:

   ```
   /subscibe_notification
   ```

2. **Pusher receives the deposit event** and triggers a function.
3. **Redis fetches the Telegram chat ID** of the user associated with the deposit.
4. **The bot sends a real-time Telegram notification** via:

   ```ts
   const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
   ```

This bot meets all the **Superteam Earn Bounty** requirements by:

- ✅ Providing a seamless Telegram interface for CopperX Payouts.
- ✅ Handling authentication, wallet management, and transactions.
- ✅ Implementing a real-time notification system for deposits.
- ✅ Using Redis and Pusher to efficiently manage events.
- ✅ Offering a clear, documented setup for easy deployment.

## 💬 Need Help?

---
