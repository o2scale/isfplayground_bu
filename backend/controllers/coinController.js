const { errorLogger, logger } = require("../config/pino-config");
const { HTTP_STATUS_CODE } = require("../constants/general");
const CoinService = require("../services/coin");
const { default: mongoose } = require("mongoose");

// Get user coin balance
exports.getUserBalance = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "User authentication required",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
      },
      `Request received to fetch user coin balance`
    );

    const result = await CoinService.getUserBalance(userId);

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
          balance: result.data.balance,
        },
        `Successfully fetched user coin balance`
      );
      res.status(HTTP_STATUS_CODE.OK).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
          error: result.message,
        },
        `Failed to fetch user coin balance`
      );
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId: req.user?.id,
        error: error.message,
      },
      `Error occurred while fetching user coin balance`
    );
    res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// Get user coin statistics
exports.getUserCoinStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "User authentication required",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
      },
      `Request received to fetch user coin statistics`
    );

    const result = await CoinService.getUserCoinStats(userId);

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
        },
        `Successfully fetched user coin statistics`
      );
      res.status(HTTP_STATUS_CODE.OK).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
          error: result.message,
        },
        `Failed to fetch user coin statistics`
      );
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId: req.user?.id,
        error: error.message,
      },
      `Error occurred while fetching user coin statistics`
    );
    res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// Get user transaction history
exports.getUserTransactionHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "User authentication required",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
        query: req.query,
      },
      `Request received to fetch user transaction history`
    );

    const result = await CoinService.getUserTransactionHistory(
      userId,
      parseInt(limit),
      (parseInt(page) - 1) * parseInt(limit)
    );

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
          transactionsCount: result.data.transactions.length,
        },
        `Successfully fetched user transaction history`
      );
      res.status(HTTP_STATUS_CODE.OK).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
          error: result.message,
        },
        `Failed to fetch user transaction history`
      );
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId: req.user?.id,
        error: error.message,
      },
      `Error occurred while fetching user transaction history`
    );
    res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// Get WTF transaction history
exports.getWtfTransactionHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 50 } = req.query;

    if (!userId) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "User authentication required",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
        query: req.query,
      },
      `Request received to fetch WTF transaction history`
    );

    const result = await CoinService.getWtfTransactionHistory(
      userId,
      parseInt(limit)
    );

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
          wtfTransactionsCount: result.data.transactions.length,
        },
        `Successfully fetched WTF transaction history`
      );
      res.status(HTTP_STATUS_CODE.OK).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          userId,
          error: result.message,
        },
        `Failed to fetch WTF transaction history`
      );
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId: req.user?.id,
        error: error.message,
      },
      `Error occurred while fetching WTF transaction history`
    );
    res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// Get top coin earners (Admin only)
exports.getTopEarners = async (req, res) => {
  try {
    const { limit = 10, period = "weekly" } = req.query;

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        query: req.query,
        userId: req.user?.id,
      },
      `Request received to fetch top coin earners`
    );

    const result = await CoinService.getTopEarners(parseInt(limit), period);

    if (result.success) {
      logger.info(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          topEarnersCount: result.data.topEarners.length,
          period,
          userId: req.user?.id,
        },
        `Successfully fetched top coin earners`
      );
      res.status(HTTP_STATUS_CODE.OK).json(result);
    } else {
      errorLogger.error(
        {
          clientIP: req.socket.remoteAddress,
          method: req.method,
          api: req.originalUrl,
          error: result.message,
          userId: req.user?.id,
        },
        `Failed to fetch top coin earners`
      );
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
    }
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        error: error.message,
        userId: req.user?.id,
      },
      `Error occurred while fetching top coin earners`
    );
    res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// Check first pin bonus eligibility
exports.checkFirstPinBonusEligibility = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "User authentication required",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
      },
      `Request received to check first pin bonus eligibility`
    );

    const isEligible = await CoinService.isEligibleForFirstPinBonus(userId);

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
        isEligible,
      },
      `Successfully checked first pin bonus eligibility`
    );

    res.status(HTTP_STATUS_CODE.OK).json({
      success: true,
      data: {
        isEligible: isEligible,
      },
      message: "First pin bonus eligibility checked successfully",
    });
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId: req.user?.id,
        error: error.message,
      },
      `Error occurred while checking first pin bonus eligibility`
    );
    res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// Check weekly active bonus eligibility
exports.checkWeeklyActiveBonusEligibility = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: "User authentication required",
      });
    }

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
      },
      `Request received to check weekly active bonus eligibility`
    );

    const isEligible = await CoinService.isEligibleForWeeklyActiveBonus(userId);

    logger.info(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId,
        isEligible,
      },
      `Successfully checked weekly active bonus eligibility`
    );

    res.status(HTTP_STATUS_CODE.OK).json({
      success: true,
      data: {
        isEligible: isEligible,
      },
      message: "Weekly active bonus eligibility checked successfully",
    });
  } catch (error) {
    errorLogger.error(
      {
        clientIP: req.socket.remoteAddress,
        method: req.method,
        api: req.originalUrl,
        userId: req.user?.id,
        error: error.message,
      },
      `Error occurred while checking weekly active bonus eligibility`
    );
    res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};
