const Schedule = require('../services/schedule');
const { HTTP_STATUS_CODE } = require('../constants/general');
const { logger } = require('../config/pino-config');
const { isValidDate } = require('../utils/dateHelper');
// Create a new schedule
exports.createSchedule = async (req, res) => {
    try {
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'Request received to create a new schedule');
        let createdBy = req.user.id;
        req.body.createdBy = createdBy;
        req.body.userRole = req.user.role;
        const result = await Schedule.createScheduleNew(req.body);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'Schedule created successfully');
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to create schedule: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Error creating schedule: ${error.message}`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Request received to fetch schedule with ID: ${scheduleId}`);

        const result = await Schedule.getScheduleById(scheduleId);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'Schedule fetched successfully');
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch schedule: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Error fetching schedule: ${error.message}`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all schedules with filters
exports.getSchedules = async (req, res) => {
    try {
        const filters = req.query;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'Request received to fetch schedules with filters');

        const result = await Schedule.getSchedules(filters);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'Schedules fetched successfully');
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch schedules: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Error fetching schedules: ${error.message}`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Request received to update schedule with ID: ${scheduleId}`);

        const result = await Schedule.updateSchedule(scheduleId, req.body);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'Schedule updated successfully');
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to update schedule: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Error updating schedule: ${error.message}`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Request received to delete schedule with ID: ${scheduleId}`);

        const result = await Schedule.deleteSchedule(scheduleId);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'Schedule deleted successfully');
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to delete schedule: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Error deleting schedule: ${error.message}`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get schedules by user
exports.getSchedulesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Request received to fetch schedules for user: ${userId}`);

        const result = await Schedule.getSchedulesByUser(userId);

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, 'User schedules fetched successfully');
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch user schedules: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Error fetching user schedules: ${error.message}`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get schedules for admin
exports.getSchedulesForAdmin = async (req, res) => {
    try {
        const { balagruhaId, assignedTo, startDate, endDate, status } = req.body;
        // check for the start date and end date is a valid date 
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: 'Invalid startDate / endDate format'
            });
        }
        const result = await Schedule.getSchedulesForAdmin(balagruhaId, assignedTo, startDate, endDate, status);
        if (result.success) {
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                data: {},
                message: result.message
            });
        }
    } catch (error) {
        logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Error fetching schedules for admin: ${error.message}`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}; 