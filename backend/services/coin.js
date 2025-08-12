const { errorLogger } = require("../config/pino-config");
const Coin = require("../models/coin");
const { default: mongoose } = require("mongoose");

// WTF Coin Configuration
const WTF_COIN_CONFIG = {
  // Pin creation rewards
  PIN_CREATION: {
    amount: 10,
    description: "Created a WTF pin",
    type: "wtf_pin_creation",
  },

  // Submission approval rewards
  SUBMISSION_APPROVAL: {
    amount: 15,
    description: "Submission approved and published",
    type: "wtf_submission_approval",
  },

  // Interaction rewards (daily limit)
  INTERACTION: {
    amount: 2,
    description: "Engaged with WTF content",
    type: "wtf_interaction",
    dailyLimit: 5, // Max 5 interactions per day for coins
  },

  // Bonus rewards
  BONUS: {
    FIRST_PIN: {
      amount: 25,
      description: "First WTF pin creation bonus",
      type: "wtf_pin_creation",
    },
    HIGH_ENGAGEMENT: {
      amount: 20,
      description: "High engagement pin bonus",
      type: "wtf_pin_creation",
    },
    WEEKLY_ACTIVE: {
      amount: 50,
      description: "Weekly active user bonus",
      type: "bonus",
    },
  },
};

class CoinService {
  // Award coins for WTF pin creation
  static async awardPinCreationCoins(
    userId,
    pinId,
    isFirstPin = false,
    metadata = {}
  ) {
    try {
      const config = WTF_COIN_CONFIG.PIN_CREATION;
      let amount = config.amount;
      let description = config.description;

      // Add bonus for first pin
      if (isFirstPin) {
        amount += WTF_COIN_CONFIG.BONUS.FIRST_PIN.amount;
        description = "First WTF pin creation with bonus";
      }

      // Add WTF-specific metadata
      metadata.wtfPinId = pinId;
      metadata.isFirstPin = isFirstPin;

      const result = await Coin.awardWtfCoins(
        userId,
        amount,
        config.type,
        description,
        metadata
      );

      errorLogger.info(
        { userId, pinId, amount, isFirstPin },
        "WTF pin creation coins awarded successfully"
      );

      return {
        success: true,
        data: {
          coinsAwarded: amount,
          newBalance: result.balance,
          description: description,
        },
        message: `Awarded ${amount} coins for pin creation`,
      };
    } catch (error) {
      errorLogger.error(
        { userId, pinId, error: error.message },
        "Error awarding WTF pin creation coins"
      );
      throw error;
    }
  }

  // Award coins for submission approval
  static async awardSubmissionApprovalCoins(
    userId,
    submissionId,
    metadata = {}
  ) {
    try {
      const config = WTF_COIN_CONFIG.SUBMISSION_APPROVAL;

      // Add WTF-specific metadata
      metadata.wtfSubmissionId = submissionId;

      const result = await Coin.awardWtfCoins(
        userId,
        config.amount,
        config.type,
        config.description,
        metadata
      );

      errorLogger.info(
        { userId, submissionId, amount: config.amount },
        "WTF submission approval coins awarded successfully"
      );

      return {
        success: true,
        data: {
          coinsAwarded: config.amount,
          newBalance: result.balance,
          description: config.description,
        },
        message: `Awarded ${config.amount} coins for submission approval`,
      };
    } catch (error) {
      errorLogger.error(
        { userId, submissionId, error: error.message },
        "Error awarding WTF submission approval coins"
      );
      throw error;
    }
  }

  // Award coins for interactions (with daily limit)
  static async awardInteractionCoins(userId, interactionId, metadata = {}) {
    try {
      const config = WTF_COIN_CONFIG.INTERACTION;

      // Check daily interaction limit
      const coinRecord = await Coin.findOrCreateForUser(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayInteractions = coinRecord.transactions.filter(
        (transaction) =>
          transaction.type === "wtf_interaction" &&
          transaction.createdAt >= today
      );

      if (todayInteractions.length >= config.dailyLimit) {
        return {
          success: false,
          data: null,
          message: "Daily interaction coin limit reached",
        };
      }

      // Add WTF-specific metadata
      metadata.wtfInteractionId = interactionId;
      metadata.dailyInteractionCount = todayInteractions.length + 1;

      const result = await Coin.awardWtfCoins(
        userId,
        config.amount,
        config.type,
        config.description,
        metadata
      );

      errorLogger.info(
        {
          userId,
          interactionId,
          amount: config.amount,
          dailyCount: todayInteractions.length + 1,
        },
        "WTF interaction coins awarded successfully"
      );

      return {
        success: true,
        data: {
          coinsAwarded: config.amount,
          newBalance: result.balance,
          description: config.description,
          dailyInteractionsRemaining:
            config.dailyLimit - (todayInteractions.length + 1),
        },
        message: `Awarded ${config.amount} coins for interaction`,
      };
    } catch (error) {
      errorLogger.error(
        { userId, interactionId, error: error.message },
        "Error awarding WTF interaction coins"
      );
      throw error;
    }
  }

  // Award bonus coins for high engagement
  static async awardHighEngagementBonus(
    userId,
    pinId,
    engagementRate,
    metadata = {}
  ) {
    try {
      const config = WTF_COIN_CONFIG.BONUS.HIGH_ENGAGEMENT;

      // Only award if engagement rate is above 80%
      if (engagementRate < 80) {
        return {
          success: false,
          data: null,
          message: "Engagement rate too low for bonus",
        };
      }

      // Add WTF-specific metadata
      metadata.wtfPinId = pinId;
      metadata.engagementRate = engagementRate;

      const result = await Coin.awardWtfCoins(
        userId,
        config.amount,
        config.type,
        config.description,
        metadata
      );

      errorLogger.info(
        { userId, pinId, amount: config.amount, engagementRate },
        "WTF high engagement bonus awarded successfully"
      );

      return {
        success: true,
        data: {
          coinsAwarded: config.amount,
          newBalance: result.balance,
          description: config.description,
          engagementRate: engagementRate,
        },
        message: `Awarded ${config.amount} coins for high engagement`,
      };
    } catch (error) {
      errorLogger.error(
        { userId, pinId, error: error.message },
        "Error awarding WTF high engagement bonus"
      );
      throw error;
    }
  }

  // Award weekly active user bonus
  static async awardWeeklyActiveBonus(userId, metadata = {}) {
    try {
      const config = WTF_COIN_CONFIG.BONUS.WEEKLY_ACTIVE;

      // Add WTF-specific metadata
      metadata.weeklyActive = true;

      const result = await Coin.awardWtfCoins(
        userId,
        config.amount,
        config.type,
        config.description,
        metadata
      );

      errorLogger.info(
        { userId, amount: config.amount },
        "WTF weekly active bonus awarded successfully"
      );

      return {
        success: true,
        data: {
          coinsAwarded: config.amount,
          newBalance: result.balance,
          description: config.description,
        },
        message: `Awarded ${config.amount} coins for weekly activity`,
      };
    } catch (error) {
      errorLogger.error(
        { userId, error: error.message },
        "Error awarding WTF weekly active bonus"
      );
      throw error;
    }
  }

  // Get user coin balance
  static async getUserBalance(userId) {
    try {
      const balance = await Coin.getUserBalance(userId);

      return {
        success: true,
        data: {
          balance: balance,
        },
        message: "User balance retrieved successfully",
      };
    } catch (error) {
      errorLogger.error(
        { userId, error: error.message },
        "Error getting user coin balance"
      );
      throw error;
    }
  }

  // Get user coin statistics
  static async getUserCoinStats(userId) {
    try {
      const coinRecord = await Coin.findOrCreateForUser(userId);

      return {
        success: true,
        data: {
          balance: coinRecord.balance,
          weeklyStats: coinRecord.weeklyStats,
          monthlyStats: coinRecord.monthlyStats,
          wtfStats: coinRecord.wtfStats,
        },
        message: "User coin statistics retrieved successfully",
      };
    } catch (error) {
      errorLogger.error(
        { userId, error: error.message },
        "Error getting user coin statistics"
      );
      throw error;
    }
  }

  // Get user transaction history
  static async getUserTransactionHistory(userId, limit = 50, skip = 0) {
    try {
      const coinRecord = await Coin.findOrCreateForUser(userId);
      const transactions = coinRecord.getTransactionHistory(limit, skip);

      return {
        success: true,
        data: {
          transactions: transactions,
          totalTransactions: coinRecord.transactions.length,
        },
        message: "User transaction history retrieved successfully",
      };
    } catch (error) {
      errorLogger.error(
        { userId, error: error.message },
        "Error getting user transaction history"
      );
      throw error;
    }
  }

  // Get WTF transaction history
  static async getWtfTransactionHistory(userId, limit = 50) {
    try {
      const coinRecord = await Coin.findOrCreateForUser(userId);
      const transactions = coinRecord.getWtfTransactionHistory(limit);

      return {
        success: true,
        data: {
          transactions: transactions,
          totalWtfTransactions: transactions.length,
        },
        message: "WTF transaction history retrieved successfully",
      };
    } catch (error) {
      errorLogger.error(
        { userId, error: error.message },
        "Error getting WTF transaction history"
      );
      throw error;
    }
  }

  // Get top coin earners
  static async getTopEarners(limit = 10, period = "weekly") {
    try {
      const topEarners = await Coin.getTopEarners(limit, period);

      return {
        success: true,
        data: {
          topEarners: topEarners,
          period: period,
        },
        message: "Top coin earners retrieved successfully",
      };
    } catch (error) {
      errorLogger.error(
        { period, error: error.message },
        "Error getting top coin earners"
      );
      throw error;
    }
  }

  // Check if user is eligible for first pin bonus
  static async isEligibleForFirstPinBonus(userId) {
    try {
      const coinRecord = await Coin.findOrCreateForUser(userId);
      return coinRecord.wtfStats.pinsCreated === 0;
    } catch (error) {
      errorLogger.error(
        { userId, error: error.message },
        "Error checking first pin bonus eligibility"
      );
      throw error;
    }
  }

  // Check if user is eligible for weekly active bonus
  static async isEligibleForWeeklyActiveBonus(userId) {
    try {
      const coinRecord = await Coin.findOrCreateForUser(userId);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const weeklyTransactions = coinRecord.transactions.filter(
        (transaction) =>
          transaction.source === "wtf" && transaction.createdAt >= weekStart
      );

      return weeklyTransactions.length >= 5; // At least 5 WTF activities this week
    } catch (error) {
      errorLogger.error(
        { userId, error: error.message },
        "Error checking weekly active bonus eligibility"
      );
      throw error;
    }
  }
}

module.exports = CoinService;
