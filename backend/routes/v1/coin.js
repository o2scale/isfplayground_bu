const express = require("express");
const { authorize, authenticate } = require("../../middleware/auth");
const {
  getUserBalance,
  getUserCoinStats,
  getUserTransactionHistory,
  getWtfTransactionHistory,
  getTopEarners,
  checkFirstPinBonusEligibility,
  checkWeeklyActiveBonusEligibility,
} = require("../../controllers/coinController");

const router = express.Router();

// ==================== USER COIN ROUTES ====================

// Get user coin balance (Authenticated users)
router.get("/balance", authenticate, getUserBalance);

// Get user coin statistics (Authenticated users)
router.get("/stats", authenticate, getUserCoinStats);

// Get user transaction history (Authenticated users)
router.get("/transactions", authenticate, getUserTransactionHistory);

// Get WTF transaction history (Authenticated users)
router.get("/transactions/wtf", authenticate, getWtfTransactionHistory);

// ==================== BONUS ELIGIBILITY ROUTES ====================

// Check first pin bonus eligibility (Authenticated users)
router.get(
  "/bonus/first-pin-eligibility",
  authenticate,
  checkFirstPinBonusEligibility
);

// Check weekly active bonus eligibility (Authenticated users)
router.get(
  "/bonus/weekly-active-eligibility",
  authenticate,
  checkWeeklyActiveBonusEligibility
);

// ==================== ADMIN COIN ROUTES ====================

// Get top coin earners (Admin only)
router.get(
  "/top-earners",
  authenticate,
  authorize("Coin Analytics", "Read"),
  getTopEarners
);

module.exports = router;
