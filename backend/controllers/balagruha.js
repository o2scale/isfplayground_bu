const { errorLogger, logger } = require('../config/pino-config');
const { HTTP_STATUS_CODE, OfflineReqNames } = require('../constants/general')
const Balagruha = require('../services/balagruha');
const { isRequestFromLocalhost, generateRandomString } = require('../utils/helper');
const { createOfflineRequest } = require('../services/offlineRequestQueue');
// Create a new balagruha
exports.createBalagruha = async (req, res) => {
    try {
        req.body.generatedId = req.body?.generatedId || generateRandomString();

        const reqCpy = JSON.parse(JSON.stringify(req.body))
        const logData = { ...req.body };
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, data: logData }, `Request received for balagruha creation`);
        let isOfflineReq = isRequestFromLocalhost(req);

        let result = await Balagruha.create(req.body)
        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Balagruha created successfully`);
            if (isOfflineReq) {
                await createOfflineRequest({
                    operation: OfflineReqNames.CREATE_BALAGRUHA,
                    apiPath: req.originalUrl,
                    method: req.method,
                    payload: JSON.stringify(reqCpy),
                    attachments: [],
                    generatedId: req.body.generatedId || null,
                    token: req.headers['authorization'],
                });
            }
            res.status(HTTP_STATUS_CODE.OK).json(result);
        } else {
            errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to create balagruha`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, `Error occurred while creating balagruha`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
    }
}

// Get all balagruhas
exports.getAllBalagruha = async (req, res) => {
    try {
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Request received to fetch all balagruhas`);
        const result = await Balagruha.getAll();
        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Successfully fetched all balagruhas`);
            res.status(HTTP_STATUS_CODE.OK).json(result);
        } else {
            errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch balagruhas`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, `Error occurred while fetching balagruhas`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
    }
}

// Get balagruha by ID
exports.getBalagruhaById = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, id }, `Request received to fetch balagruha by ID`);
        const result = await Balagruha.getById(id);
        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Successfully fetched balagruha`);
            res.status(HTTP_STATUS_CODE.OK).json(result);
        } else {
            errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch balagruha`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, `Error occurred while fetching balagruha`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
    }
}

// Update balagruha
exports.updateBalagruha = async (req, res) => {
    try {
        const reqCpy = JSON.parse(JSON.stringify(req.body))
        const { id } = req.params;
        const updateData = req.body;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, id, data: updateData }, `Request received to update balagruha`);
        let isOfflineReq = isRequestFromLocalhost(req);
        const result = await Balagruha.update(id, updateData);
        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Successfully updated balagruha`);
            if (isOfflineReq) {
                await createOfflineRequest({
                    operation: OfflineReqNames.UPDATE_BALAGRUHA,
                    apiPath: req.originalUrl,
                    method: req.method,
                    payload: JSON.stringify(reqCpy),
                    attachments: [],
                    generatedId: req.body.generatedId || null,
                    token: req.headers['authorization'],
                });
            }
            res.status(HTTP_STATUS_CODE.OK).json(result);
        } else {
            errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to update balagruha`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        console.log('error', error)
        errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, `Error occurred while updating balagruha`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
    }
}

// Delete balagruha
exports.deleteBalagruha = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, id }, `Request received to delete balagruha`);
        let isOfflineReq = isRequestFromLocalhost(req);
        const result = await Balagruha.delete(id);
        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Successfully deleted balagruha`);
            if (isOfflineReq) {
                await createOfflineRequest({
                    operation: OfflineReqNames.DELETE_BALAGRUHA,
                    apiPath: req.originalUrl,
                    method: req.method,
                    payload: "{}",
                    attachments: [],
                    generatedId: result?.data?.generatedId || null,
                    token: req.headers['authorization'],
                });
            }
            res.status(HTTP_STATUS_CODE.OK).json(result);
        } else {
            errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to delete balagruha`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, `Error occurred while deleting balagruha`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
    }
}

// Get balagruha list by user ID
exports.getBalagruhaListByUserId = async (req, res) => {
    try {
        // get user role
        const userRole = req.user.role;
        const { userId } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, userId }, `Request received to fetch balagruha list by user ID`);
        const result = await Balagruha.getBalagruhaListByUserId(userId, userRole);
        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Successfully fetched balagruha list by user ID`);
            res.status(HTTP_STATUS_CODE.OK).json(result);
        } else {
            errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch balagruha list by user ID`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, `Error occurred while fetching balagruha list by user ID`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
    }
}

// Get balagruha by generated ID
exports.getBalagruhaByGeneratedId = async (req, res) => {
    try {
        const { generatedId } = req.params;
        logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, generatedId }, `Request received to fetch balagruha by generated ID`);
        const result = await Balagruha.getByGeneratedId(generatedId);
        if (result.success) {
            logger.info({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Successfully fetched balagruha by generated ID`);
            res.status(HTTP_STATUS_CODE.OK).json(result);
        } else {
            errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl }, `Failed to fetch balagruha by generated ID`);
            res.status(HTTP_STATUS_CODE.BAD_REQUEST).json(result);
        }
    } catch (error) {
        errorLogger.error({ clientIP: req.socket.remoteAddress, method: req.method, api: req.originalUrl, error: error.message }, `Error occurred while fetching balagruha by generated ID`);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, message: error.message });
    }
}