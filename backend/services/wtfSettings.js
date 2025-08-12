const WtfSettings = require("../models/wtfSettings");
const { logger, errorLogger } = require("../config/pino-config");
const {
  uploadWtfMedia,
  uploadWtfMediaBuffer,
  deleteWtfMedia,
} = require("./aws/s3");

class WtfSettingsService {
  /**
   * Get current active WTF settings
   */
  async getCurrentSettings() {
    try {
      const settings = await WtfSettings.findOne({ isActive: true })
        .populate("createdBy", "name")
        .populate("updatedBy", "name");

      if (!settings) {
        // Return default settings if none exist
        return {
          backgroundType: "color",
          backgroundColor: "#f8fafc",
          backgroundImage: null,
          isActive: true,
        };
      }

      return settings;
    } catch (error) {
      errorLogger.error("Error getting current WTF settings:", error);
      throw new Error("Failed to get WTF settings");
    }
  }

  /**
   * Update WTF background settings
   */
  async updateSettings(settingsData, userId) {
    try {
      const { backgroundType, backgroundColor, backgroundImage } = settingsData;

      // Validate required fields
      if (!backgroundType || !["color", "image"].includes(backgroundType)) {
        throw new Error("Invalid background type");
      }

      if (backgroundType === "color" && !backgroundColor) {
        throw new Error("Background color is required when type is color");
      }

      if (backgroundType === "image" && !backgroundImage) {
        throw new Error("Background image is required when type is image");
      }

      // Deactivate current active settings
      await WtfSettings.updateMany({ isActive: true }, { isActive: false });

      // Create new settings
      const newSettings = new WtfSettings({
        backgroundType,
        backgroundColor:
          backgroundType === "color" ? backgroundColor : "#f8fafc",
        backgroundImage: backgroundType === "image" ? backgroundImage : null,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      });

      const savedSettings = await newSettings.save();
      await savedSettings.populate("createdBy", "name");
      await savedSettings.populate("updatedBy", "name");

      logger.info(`WTF settings updated by user ${userId}`, {
        settingsId: savedSettings._id,
        backgroundType,
        backgroundColor: backgroundType === "color" ? backgroundColor : null,
        backgroundImage: backgroundType === "image" ? backgroundImage : null,
      });

      return savedSettings;
    } catch (error) {
      errorLogger.error("Error updating WTF settings:", error);
      throw error;
    }
  }

  /**
   * Upload background image
   */
  async uploadBackgroundImage(file, userId) {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error(
          "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size too large. Maximum size is 5MB");
      }

      // Upload to S3
      const fileName = `backgrounds/wtf-bg-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${file.mimetype.split("/")[1]}`;
      const imageUrl = await uploadWtfMediaBuffer(
        file.buffer,
        fileName,
        file.mimetype
      );

      logger.info(`WTF background image uploaded by user ${userId}`, {
        fileName,
        imageUrl,
        fileSize: file.size,
      });

      return imageUrl;
    } catch (error) {
      errorLogger.error("Error uploading WTF background image:", error);
      throw error;
    }
  }

  /**
   * Delete background image from S3
   */
  async deleteBackgroundImage(imageUrl) {
    try {
      if (!imageUrl) {
        return;
      }

      await deleteWtfMedia(imageUrl);
      logger.info("WTF background image deleted", { imageUrl });
    } catch (error) {
      errorLogger.error("Error deleting WTF background image:", error);
      // Don't throw error for delete operations to avoid blocking updates
    }
  }

  /**
   * Get settings history
   */
  async getSettingsHistory(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const settings = await WtfSettings.find()
        .populate("createdBy", "name")
        .populate("updatedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await WtfSettings.countDocuments();

      return {
        settings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      errorLogger.error("Error getting WTF settings history:", error);
      throw new Error("Failed to get settings history");
    }
  }
}

module.exports = new WtfSettingsService();
