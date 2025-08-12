const { default: mongoose } = require("mongoose");
const { errorLogger } = require("../config/pino-config");
const WtfSubmission = require("../models/wtfSubmission");

// Create WTF Submission
exports.createWtfSubmission = async (payload) => {
  try {
    const result = await WtfSubmission.create(payload);
    return {
      success: true,
      data: result,
      message: "WTF Submission created successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in createWtfSubmission");
    throw error;
  }
};

// Get submission by ID
exports.getWtfSubmissionById = async (submissionId) => {
  try {
    const submission = await WtfSubmission.findById(submissionId)
      .populate("studentId", "name role")
      .populate("reviewedBy", "name role")
      .populate("approvedPinId", "title type author")
      .lean();

    if (!submission) {
      return {
        success: false,
        data: null,
        message: "WTF Submission not found",
      };
    }

    return {
      success: true,
      data: submission,
      message: "WTF Submission fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getWtfSubmissionById");
    throw error;
  }
};

// Get pending submissions for review
exports.getPendingSubmissions = async ({ page = 1, limit = 20, type = null }) => {
  try {
    const skip = (page - 1) * limit;
    const query = {
      status: "pending",
      isDraft: false
    };
    
    if (type) query.type = type;

    const submissions = await WtfSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("studentId", "name role")
      .populate("reviewedBy", "name role")
      .lean();

    const total = await WtfSubmission.countDocuments(query);

    return {
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      message: "Pending submissions fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getPendingSubmissions");
    throw error;
  }
};

// Get student's submissions
exports.getStudentSubmissions = async (studentId, { page = 1, limit = 20, status = null, type = null }) => {
  try {
    const skip = (page - 1) * limit;
    const query = { studentId: mongoose.Types.ObjectId(studentId) };
    
    if (status) query.status = status;
    if (type) query.type = type;

    const submissions = await WtfSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reviewedBy", "name role")
      .populate("approvedPinId", "title type author")
      .lean();

    const total = await WtfSubmission.countDocuments(query);

    return {
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      message: "Student submissions fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getStudentSubmissions");
    throw error;
  }
};

// Update submission
exports.updateWtfSubmission = async (submissionId, updateData) => {
  try {
    const submission = await WtfSubmission.findByIdAndUpdate(
      submissionId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate("studentId", "name role")
    .populate("reviewedBy", "name role")
    .populate("approvedPinId", "title type author");

    if (!submission) {
      return {
        success: false,
        data: null,
        message: "WTF Submission not found",
      };
    }

    return {
      success: true,
      data: submission,
      message: "WTF Submission updated successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in updateWtfSubmission");
    throw error;
  }
};

// Delete submission
exports.deleteWtfSubmission = async (submissionId) => {
  try {
    const submission = await WtfSubmission.findByIdAndDelete(submissionId);
    
    if (!submission) {
      return {
        success: false,
        data: null,
        message: "WTF Submission not found",
      };
    }

    return {
      success: true,
      data: submission,
      message: "WTF Submission deleted successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in deleteWtfSubmission");
    throw error;
  }
};

// Approve submission
exports.approveSubmission = async (submissionId, reviewerId, notes = "") => {
  try {
    const submission = await WtfSubmission.findById(submissionId);
    
    if (!submission) {
      return {
        success: false,
        data: null,
        message: "WTF Submission not found",
      };
    }

    if (submission.status !== "pending") {
      return {
        success: false,
        data: null,
        message: "Submission is not in pending status",
      };
    }

    // Update submission status
    submission.status = "approved";
    submission.reviewedBy = reviewerId;
    submission.reviewNotes = notes;
    submission.reviewedAt = new Date();
    
    await submission.save();

    const populatedSubmission = await WtfSubmission.findById(submissionId)
      .populate("studentId", "name role")
      .populate("reviewedBy", "name role")
      .populate("approvedPinId", "title type author");

    return {
      success: true,
      data: populatedSubmission,
      message: "Submission approved successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in approveSubmission");
    throw error;
  }
};

// Reject submission
exports.rejectSubmission = async (submissionId, reviewerId, notes = "") => {
  try {
    const submission = await WtfSubmission.findById(submissionId);
    
    if (!submission) {
      return {
        success: false,
        data: null,
        message: "WTF Submission not found",
      };
    }

    if (submission.status !== "pending") {
      return {
        success: false,
        data: null,
        message: "Submission is not in pending status",
      };
    }

    // Update submission status
    submission.status = "rejected";
    submission.reviewedBy = reviewerId;
    submission.reviewNotes = notes;
    submission.reviewedAt = new Date();
    
    await submission.save();

    const populatedSubmission = await WtfSubmission.findById(submissionId)
      .populate("studentId", "name role")
      .populate("reviewedBy", "name role")
      .populate("approvedPinId", "title type author");

    return {
      success: true,
      data: populatedSubmission,
      message: "Submission rejected successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in rejectSubmission");
    throw error;
  }
};

// Archive submission
exports.archiveSubmission = async (submissionId) => {
  try {
    const submission = await WtfSubmission.findByIdAndUpdate(
      submissionId,
      { status: "archived" },
      { new: true, runValidators: true }
    )
    .populate("studentId", "name role")
    .populate("reviewedBy", "name role")
    .populate("approvedPinId", "title type author");

    if (!submission) {
      return {
        success: false,
        data: null,
        message: "WTF Submission not found",
      };
    }

    return {
      success: true,
      data: submission,
      message: "Submission archived successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in archiveSubmission");
    throw error;
  }
};

// Get submissions by type
exports.getSubmissionsByType = async (type, { page = 1, limit = 20, status = null }) => {
  try {
    const skip = (page - 1) * limit;
    const query = { type };
    
    if (status) query.status = status;

    const submissions = await WtfSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("studentId", "name role")
      .populate("reviewedBy", "name role")
      .lean();

    const total = await WtfSubmission.countDocuments(query);

    return {
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      message: `${type} submissions fetched successfully`,
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getSubmissionsByType");
    throw error;
  }
};

// Get submission statistics
exports.getSubmissionStats = async () => {
  try {
    const stats = await WtfSubmission.getSubmissionStats();
    
    // Calculate additional metrics
    const totalSubmissions = stats.reduce((sum, item) => sum + item.count, 0);
    const pendingCount = stats.find(item => item._id === "pending")?.count || 0;
    const approvedCount = stats.find(item => item._id === "approved")?.count || 0;
    const rejectedCount = stats.find(item => item._id === "rejected")?.count || 0;
    const archivedCount = stats.find(item => item._id === "archived")?.count || 0;

    const result = {
      totalSubmissions,
      pendingCount,
      approvedCount,
      rejectedCount,
      archivedCount,
      approvalRate: totalSubmissions > 0 ? (approvedCount / totalSubmissions) * 100 : 0,
      rejectionRate: totalSubmissions > 0 ? (rejectedCount / totalSubmissions) * 100 : 0,
      breakdown: stats
    };

    return {
      success: true,
      data: result,
      message: "Submission statistics fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getSubmissionStats");
    throw error;
  }
};

// Get recent submissions for analytics
exports.getRecentSubmissions = async ({ days = 7, type = null, status = null }) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const query = { createdAt: { $gte: date } };
    if (type) query.type = type;
    if (status) query.status = status;

    const submissions = await WtfSubmission.find(query)
      .sort({ createdAt: -1 })
      .populate("studentId", "name role")
      .populate("reviewedBy", "name role")
      .lean();

    return {
      success: true,
      data: submissions,
      message: "Recent submissions fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getRecentSubmissions");
    throw error;
  }
};

// Get submission analytics
exports.getSubmissionAnalytics = async ({ days = 30, type = null }) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const matchStage = { createdAt: { $gte: date } };
    if (type) matchStage.type = type;

    const analytics = await WtfSubmission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            status: "$status",
            type: "$type"
          },
          count: { $sum: 1 },
          uniqueStudents: { $addToSet: "$studentId" }
        }
      },
      {
        $group: {
          _id: "$_id.status",
          types: {
            $push: {
              type: "$_id.type",
              count: "$count",
              uniqueStudents: { $size: "$uniqueStudents" }
            }
          },
          totalCount: { $sum: "$count" },
          totalUniqueStudents: { $addToSet: "$uniqueStudents" }
        }
      }
    ]);

    // Calculate additional metrics
    const totalSubmissions = analytics.reduce((sum, item) => sum + item.totalCount, 0);
    const uniqueStudentsCount = new Set(
      analytics.flatMap(item => item.totalUniqueStudents.flat())
    ).size;

    const result = {
      period: `${days} days`,
      totalSubmissions,
      uniqueStudents: uniqueStudentsCount,
      breakdown: analytics,
      averageSubmissionsPerStudent: uniqueStudentsCount > 0 ? totalSubmissions / uniqueStudentsCount : 0
    };

    return {
      success: true,
      data: result,
      message: "Submission analytics fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getSubmissionAnalytics");
    throw error;
  }
};

// Bulk update submission statuses
exports.bulkUpdateSubmissionStatus = async (submissionIds, status, reviewerId = null) => {
  try {
    const updateData = { status };
    if (reviewerId) {
      updateData.reviewedBy = reviewerId;
      updateData.reviewedAt = new Date();
    }

    const result = await WtfSubmission.updateMany(
      { _id: { $in: submissionIds } },
      updateData
    );

    return {
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `Bulk updated ${result.modifiedCount} submissions to ${status}`,
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in bulkUpdateSubmissionStatus");
    throw error;
  }
};

// Get submissions that need review (pending and not drafts)
exports.getSubmissionsNeedingReview = async ({ page = 1, limit = 20, type = null }) => {
  try {
    const skip = (page - 1) * limit;
    const query = {
      status: "pending",
      isDraft: false
    };
    
    if (type) query.type = type;

    const submissions = await WtfSubmission.find(query)
      .sort({ createdAt: 1 }) // Oldest first for review queue
      .skip(skip)
      .limit(limit)
      .populate("studentId", "name role")
      .lean();

    const total = await WtfSubmission.countDocuments(query);

    return {
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      message: "Submissions needing review fetched successfully",
    };
  } catch (error) {
    errorLogger.error({ error: error.message }, "Error in getSubmissionsNeedingReview");
    throw error;
  }
}; 