const MedicalCheckIns = require('../services/medicalCheckIns');
const { HTTP_STATUS_CODE } = require("../constants/general");
const { logger } = require("../config/pino-config");
const { isRequestFromLocalhost, getUploadedFilesFullPath } = require('../utils/helper');
const mongoose = require('mongoose');

// Create a new medical check-in
exports.createMedicalCheckIn = async (req, res) => {
    try {
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, "Request received to create a new medical check-in");
        let createdBy = req.user._id;
        const { studentId, temperature, date, healthStatus, notes } = req.body;

        // Get attachment files paths if any
        let attachmentFiles = [];
        if (req.files && req.files.attachments) {
            attachmentFiles = req.files.attachments.map(file => file.path);
        }

        const result = await MedicalCheckIns.createMedicalCheckIn(
            { studentId, temperature, date, healthStatus, notes, createdBy },
            attachmentFiles
        );

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, "Successfully created a new medical check-in");
            res.status(HTTP_STATUS_CODE.CREATED).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to create medical check-in: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error creating medical check-in");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all medical check-ins with optional filters
exports.getAllMedicalCheckIns = async (req, res) => {
    try {
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, "Request received to fetch all medical check-ins");

        const { student, healthStatus, date, page, limit } = req.query;

        // Build filters
        const filters = {};
        if (student) {
            if (!mongoose.Types.ObjectId.isValid(student)) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid student ID"
                });
            }
            filters.student = student;
        }

        if (healthStatus) {
            filters.healthStatus = healthStatus;
        }

        if (date) {
            // Create date range for that day (start of day to end of day)
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            filters.date = { $gte: startDate, $lte: endDate };
        }

        // Pagination
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        };

        const result = await MedicalCheckIns.getAllMedicalCheckIns(filters, pagination);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, "Successfully fetched medical check-ins");
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch medical check-ins: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error fetching medical check-ins");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get medical check-ins for a specific student
exports.getMedicalCheckInsByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page, limit } = req.query;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, studentId }, `Request received to fetch medical check-ins for student with ID: ${studentId}`);

        // Pagination
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        };

        const result = await MedicalCheckIns.getMedicalCheckInsByStudentId(studentId, pagination);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, studentId }, "Successfully fetched student's medical check-ins");
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, studentId }, `Failed to fetch student's medical check-ins: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error fetching student's medical check-ins");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get medical check-in by ID
exports.getMedicalCheckInById = async (req, res) => {
    try {
        const { checkInId } = req.params;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Request received to fetch medical check-in with ID: ${checkInId}`);

        const result = await MedicalCheckIns.getMedicalCheckInById(checkInId);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, "Successfully fetched medical check-in");
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Failed to fetch medical check-in: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error fetching medical check-in");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update medical check-in
exports.updateMedicalCheckIn = async (req, res) => {
    try {
        const { checkInId } = req.params;
        const { studentId, temperature, date, healthStatus, notes } = req.body;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Request received to update medical check-in with ID: ${checkInId}`);

        const updateData = {};
        if (studentId) updateData.studentId = studentId;
        if (temperature) updateData.temperature = temperature;
        if (date) updateData.date = new Date(date);
        if (healthStatus) updateData.healthStatus = healthStatus;
        if (notes !== undefined) updateData.notes = notes;

        const result = await MedicalCheckIns.updateMedicalCheckIn(checkInId, updateData);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, "Successfully updated medical check-in");
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Failed to update medical check-in: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error updating medical check-in");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete medical check-in
exports.deleteMedicalCheckIn = async (req, res) => {
    try {
        const { checkInId } = req.params;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Request received to delete medical check-in with ID: ${checkInId}`);

        const result = await MedicalCheckIns.deleteMedicalCheckIn(checkInId);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, "Successfully deleted medical check-in");
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Failed to delete medical check-in: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error deleting medical check-in");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Add or update attachments
exports.addOrUpdateAttachments = async (req, res) => {
    try {
        const { checkInId } = req.params;
        const { createdBy } = req.body;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Request received to add/update attachments for medical check-in with ID: ${checkInId}`);

        // Get attachment files paths if any
        let attachmentFiles = [];
        if (req.files && req.files.attachments) {
            attachmentFiles = req.files.attachments.map(file => file.path);
        }

        if (!createdBy) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: "createdBy ID is required"
            });
        }

        const result = await MedicalCheckIns.addOrUpdateAttachments(checkInId, attachmentFiles, createdBy);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, "Successfully added/updated attachments");
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId }, `Failed to add/update attachments: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error adding/updating attachments");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete attachment
exports.deleteAttachment = async (req, res) => {
    try {
        const { checkInId, attachmentId } = req.params;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId, attachmentId }, `Request received to delete attachment from medical check-in`);

        const result = await MedicalCheckIns.deleteAttachment(checkInId, attachmentId);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId, attachmentId }, "Successfully deleted attachment");
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.warn({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, checkInId, attachmentId }, `Failed to delete attachment: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error deleting attachment");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all medical check-ins by balagruha Ids list 
exports.getMedicalCheckInsByBalagruhaIds = async (req, res) => {
    try {
        const { balagruhaIds } = req.body;
        const result = await MedicalCheckIns.getMedicalCheckInsByBalagruhaIds(balagruhaIds);
        if (result.success) {
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, "Error getting medical check-ins by balagruha Ids list");
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}