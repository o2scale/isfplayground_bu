const { logger } = require("../config/pino-config");
const { HTTP_STATUS_CODE } = require("../constants/general");
const OfflineRequestQueueService = require("../services/offlineRequestQueue");
const { isRequestFromLocalhost } = require("../utils/helper");
/**
 * Create a new offline request entry
 */
exports.createOfflineRequest = async (req, res) => {
    try {
        const { operation, apiPath, method, payload, attachments } = req.body;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to create offline request for operation: ${operation}`);

        const result = await OfflineRequestQueueService.createOfflineRequest({
            operation,
            apiPath,
            method,
            payload,
            attachments
        });

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Successfully created offline request`);
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Failed to create offline request. Error: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error(`Error in createOfflineRequest controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all offline requests with optional filtering
 */
exports.getAllOfflineRequests = async (req, res) => {
    try {
        const { status, operation } = req.query;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to fetch all offline requests`);

        const result = await OfflineRequestQueueService.getAllOfflineRequests({ status, operation });

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Successfully fetched offline requests`);
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Failed to fetch offline requests. Error: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error(`Error in getAllOfflineRequests controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get a single offline request by ID
 */
exports.getOfflineRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to fetch offline request with ID: ${requestId}`);

        const result = await OfflineRequestQueueService.getOfflineRequestById({ requestId });

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Successfully fetched offline request with ID: ${requestId}`);
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Failed to fetch offline request with ID: ${requestId}. Error: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error(`Error in getOfflineRequestById controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update an offline request
 */
exports.updateOfflineRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const payload = req.body;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to update offline request with ID: ${requestId}`);

        const result = await OfflineRequestQueueService.updateOfflineRequest({ requestId, payload });

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Successfully updated offline request with ID: ${requestId}`);
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Failed to update offline request with ID: ${requestId}. Error: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error(`Error in updateOfflineRequest controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update the status of an offline request
 */
exports.updateOfflineRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, error } = req.body;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to update status of offline request with ID: ${requestId} to ${status}`);

        const result = await OfflineRequestQueueService.updateOfflineRequestStatus({ requestId, status, error });

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Successfully updated status of offline request with ID: ${requestId} to ${status}`);
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Failed to update status of offline request with ID: ${requestId}. Error: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error(`Error in updateOfflineRequestStatus controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Delete an offline request
 */
exports.deleteOfflineRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to delete offline request with ID: ${requestId}`);

        const result = await OfflineRequestQueueService.deleteOfflineRequest({ requestId });

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Successfully deleted offline request with ID: ${requestId}`);
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Failed to delete offline request with ID: ${requestId}. Error: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error(`Error in deleteOfflineRequest controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all pending offline requests
 */
exports.getPendingOfflineRequests = async (req, res) => {
    try {
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to fetch pending offline requests`);

        const result = await OfflineRequestQueueService.getPendingOfflineRequests();

        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Successfully fetched pending offline requests`);
            res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                `Failed to fetch pending offline requests. Error: ${result.message}`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        logger.error(`Error in getPendingOfflineRequests controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Sync offline requests to the main server
 */
exports.syncOfflineRequestToServer = async (req, res) => {
    try {
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
            `Request received to sync offline requests to the main server`);

        // make sure the request is from localhost 
        let isOfflineRequest = isRequestFromLocalhost(req);
        if (isOfflineRequest) {
            const result = await OfflineRequestQueueService.syncOfflineRequestToServer();
            if (result.success) {
                logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                    `Successfully synced offline requests to the main server`);
                res.status(HTTP_STATUS_CODE.OK).json({
                    success: true,
                    data: result.data,
                    message: result.message
                });
            } else {
                logger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl },
                    `Failed to sync offline requests to the main server. Error: ${result.message}`);
                res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                    success: false,
                    message: result.message
                });
            }
        } else {
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
                success: false,
                message: 'Offline request can only be synced from localhost'
            });
        }
    } catch (error) {
        console.log('error', error)
        logger.error(`Error in syncOfflineRequestToServer controller: ${error.message}`);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}