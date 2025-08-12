const { default: mongoose } = require("mongoose");
const { errorLogger } = require("../config/pino-config");
const WtfPin = require("../models/wtfPin");

// Create WTF Pin
exports.createWtfPin = async (payload) => {
  try {
    const result = await WtfPin.create(payload);
    return {
      success: true,
      data: result,
      message: "WTF Pin created successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in createWtfPin");
    throw error;
  }
};

// Get all active pins with pagination
exports.getActivePins = async ({
  page = 1,
  limit = 20,
  type = null,
  author = null,
  isOfficial = null,
}) => {
  try {
    const skip = (page - 1) * limit;
    const query = {
      status: "active",
      expiresAt: { $gt: new Date() },
    };

    // Add filters
    if (type) query.type = type;
    if (author) query.author = mongoose.Types.ObjectId(author);
    if (isOfficial !== null) query.isOfficial = isOfficial;

    const pins = await WtfPin.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name role")
      .lean();

    const total = await WtfPin.countDocuments(query);

    return {
      success: true,
      data: {
        pins,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      message: "Active pins fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getActivePins");
    throw error;
  }
};

// Get pin by ID
exports.getWtfPinById = async (pinId) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(pinId)) {
      return {
        success: false,
        data: null,
        message: "Invalid pin ID format",
      };
    }

    const pin = await WtfPin.findById(pinId)
      .populate("author", "name role")
      .lean();

    if (!pin) {
      return {
        success: false,
        data: null,
        message: "WTF Pin not found",
      };
    }

    return {
      success: true,
      data: pin,
      message: "WTF Pin fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getWtfPinById");
    throw error;
  }
};

// Update WTF Pin
exports.updateWtfPin = async (pinId, updateData) => {
  try {
    const pin = await WtfPin.findByIdAndUpdate(pinId, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name role");

    if (!pin) {
      return {
        success: false,
        data: null,
        message: "WTF Pin not found",
      };
    }

    return {
      success: true,
      data: pin,
      message: "WTF Pin updated successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in updateWtfPin");
    throw error;
  }
};

// Delete WTF Pin
exports.deleteWtfPin = async (pinId) => {
  try {
    const pin = await WtfPin.findByIdAndDelete(pinId);

    if (!pin) {
      return {
        success: false,
        data: null,
        message: "WTF Pin not found",
      };
    }

    return {
      success: true,
      data: pin,
      message: "WTF Pin deleted successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in deleteWtfPin");
    throw error;
  }
};

// Change pin status
exports.updatePinStatus = async (pinId, status) => {
  try {
    const pin = await WtfPin.findByIdAndUpdate(
      pinId,
      { status },
      { new: true, runValidators: true }
    ).populate("author", "name role");

    if (!pin) {
      return {
        success: false,
        data: null,
        message: "WTF Pin not found",
      };
    }

    return {
      success: true,
      data: pin,
      message: `WTF Pin status updated to ${status}`,
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in updatePinStatus");
    throw error;
  }
};

// Get pins by author
exports.getPinsByAuthor = async (
  authorId,
  { page = 1, limit = 20, status = null }
) => {
  try {
    const skip = (page - 1) * limit;
    const query = { author: new mongoose.Types.ObjectId(authorId) };

    if (status) query.status = status;

    const pins = await WtfPin.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name role")
      .lean();

    const total = await WtfPin.countDocuments(query);

    return {
      success: true,
      data: {
        pins,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      message: "Author pins fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getPinsByAuthor");
    throw error;
  }
};

// Get expired pins for cleanup (pins older than 7 days)
exports.getExpiredPins = async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pins = await WtfPin.find({
      status: "active",
      createdAt: { $lte: oneWeekAgo },
    })
      .populate("author", "name role")
      .lean();

    return {
      success: true,
      data: pins,
      message: "Expired pins fetched successfully",
      expirationCutoff: oneWeekAgo,
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getExpiredPins");
    throw error;
  }
};

// Get pins for FIFO management (limit active pins to 20)
exports.getPinsForFifoManagement = async () => {
  try {
    const activePinsCount = await WtfPin.countDocuments({ status: "active" });

    if (activePinsCount <= 20) {
      return {
        success: true,
        data: [],
        message: "No pins need to be unpinned for FIFO management",
      };
    }

    const pinsToUnpin = await WtfPin.find({ status: "active" })
      .sort({ createdAt: 1 }) // Oldest first
      .limit(activePinsCount - 20)
      .lean();

    return {
      success: true,
      data: pinsToUnpin,
      message: "Pins for FIFO management fetched successfully",
    };
  } catch (error) {
    errorLogger.error(
      { error: error.message },
      "Error in getPinsForFifoManagement"
    );
    throw error;
  }
};

// Update engagement metrics
exports.updateEngagementMetrics = async (pinId, metrics) => {
  try {
    const pin = await WtfPin.findByIdAndUpdate(
      pinId,
      {
        $inc: {
          "engagementMetrics.likes": metrics.likes || 0,
          "engagementMetrics.seen": metrics.seen || 0,
          "engagementMetrics.shares": metrics.shares || 0,
        },
      },
      { new: true, runValidators: true }
    );

    if (!pin) {
      return {
        success: false,
        data: null,
        message: "WTF Pin not found",
      };
    }

    return {
      success: true,
      data: pin,
      message: "Engagement metrics updated successfully",
    };
  } catch (error) {
    errorLogger.error(
      { error: error.message },
      "Error in updateEngagementMetrics"
    );
    throw error;
  }
};

// Get pin analytics
exports.getPinAnalytics = async (pinId) => {
  try {
    const pin = await WtfPin.findById(pinId).lean();

    if (!pin) {
      return {
        success: false,
        data: null,
        message: "WTF Pin not found",
      };
    }

    const analytics = {
      pinId: pin._id,
      title: pin.title,
      type: pin.type,
      engagementMetrics: pin.engagementMetrics,
      engagementRate: pin.engagementRate,
      daysUntilExpiration: pin.daysUntilExpiration,
      isActive: pin.isActive(),
      createdAt: pin.createdAt,
      expiresAt: pin.expiresAt,
    };

    return {
      success: true,
      data: analytics,
      message: "Pin analytics fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getPinAnalytics");
    throw error;
  }
};

// Get overall WTF analytics
exports.getWtfAnalytics = async () => {
  try {
    const analytics = await WtfPin.aggregate([
      {
        $group: {
          _id: null,
          totalPins: { $sum: 1 },
          activePins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "active"] },
                    { $gt: ["$expiresAt", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalLikes: { $sum: "$engagementMetrics.likes" },
          totalSeen: { $sum: "$engagementMetrics.seen" },
          totalShares: { $sum: "$engagementMetrics.shares" },
          officialPins: {
            $sum: { $cond: ["$isOfficial", 1, 0] },
          },
        },
      },
    ]);

    const typeDistribution = await WtfPin.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      ...analytics[0],
      typeDistribution,
    };

    return {
      success: true,
      data: result,
      message: "WTF analytics fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getWtfAnalytics");
    throw error;
  }
};

// Bulk update pin statuses (for lifecycle management)
exports.bulkUpdatePinStatus = async (pinIds, status) => {
  try {
    const result = await WtfPin.updateMany(
      { _id: { $in: pinIds } },
      { status }
    );

    return {
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      message: `Bulk updated ${result.modifiedCount} pins to ${status}`,
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in bulkUpdatePinStatus");
    throw error;
  }
};

// Get active pins count for admin (without expiry filter)
exports.getActivePinsCountForAdmin = async () => {
  try {
    const count = await WtfPin.countDocuments({ status: "active" });
    return {
      success: true,
      data: count,
      message: "Active pins count fetched successfully",
    };
  } catch (error) {
    errorLogger.error(
      { error: error.message },
      "Error in getActivePinsCountForAdmin"
    );
    throw error;
  }
};

// Get all active pins for admin (without expiry filter)
exports.getActivePinsForAdmin = async ({
  page = 1,
  limit = 20,
  type = null,
  author = null,
  isOfficial = null,
}) => {
  try {
    const skip = (page - 1) * limit;
    const query = { status: "active" }; // No expiry filter for admin

    // Add filters
    if (type) query.type = type;
    if (author) query.author = mongoose.Types.ObjectId(author);
    if (isOfficial !== null) query.isOfficial = isOfficial;

    const pins = await WtfPin.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name role")
      .lean();

    const total = await WtfPin.countDocuments(query);

    return {
      success: true,
      data: {
        pins,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      message: "Active pins fetched successfully",
    };
  } catch (error) {
    errorLogger.error(
      { error: error.message },
      "Error in getActivePinsForAdmin"
    );
    throw error;
  }
};
