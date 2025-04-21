const OfflineRequestQueueDA = require('../data-access/offlineRequestQueue');
const { logger } = require('../config/pino-config');
const { sendOfflineRequestToServer, getUserIdFromGeneratedIdFromServer, sendOfflineJSONRequestToServer, getMachineIdFromGeneratedIdFromServer, getTaskIdFromGeneratedIdFromServer } = require('./offlineRequestToServer');
const { getIdByGeneratedId } = require('../data-access/User');
const { OfflineReqNames } = require('../constants/general');
const { getMachineIdByGeneratedId } = require("../data-access/machines")
/**
 * Create a new offline request entry in the queue
 */
exports.createOfflineRequest = async ({ operation, apiPath, method, payload, attachments = [], attachmentString, token = "", generatedId }) => {
    try {
        // Validate required fields
        if (!operation || !apiPath) {
            return {
                success: false,
                message: "Operation, API path, and payload are required"
            };
        }

        const offlineRequest = {
            operation,
            apiPath,
            method: method || "POST",
            payload: payload || "",
            attachments,
            attachmentString,
            status: "pending",
            token,
            generatedId,
        };

        const result = await OfflineRequestQueueDA.createOfflineRequest(offlineRequest);

        console.log(`Offline request created for operation: ${operation}, path: ${apiPath}`);
        return result;
    } catch (error) {
        console.log('error', error)
        return {
            success: false,
            message: "Error creating offline request",
            error: error.message
        };
    }
};

/**
 * Get all offline requests with optional filtering
 */
exports.getAllOfflineRequests = async ({ status, operation }) => {
    try {
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (operation) {
            filter.operation = operation;
        }

        const result = await OfflineRequestQueueDA.getAllOfflineRequests(filter);
        return result;
    } catch (error) {
        logger.error(`Error fetching offline requests: ${error.message}`);
        return {
            success: false,
            message: "Error fetching offline requests",
            error: error.message
        };
    }
};

/**
 * Get a single offline request by ID
 */
exports.getOfflineRequestById = async ({ requestId }) => {
    try {
        if (!requestId) {
            return {
                success: false,
                message: "Request ID is required"
            };
        }

        const result = await OfflineRequestQueueDA.getOfflineRequestById(requestId);
        return result;
    } catch (error) {
        logger.error(`Error fetching offline request by ID: ${error.message}`);
        return {
            success: false,
            message: "Error fetching offline request",
            error: error.message
        };
    }
};

/**
 * Update an offline request
 */
exports.updateOfflineRequest = async ({ requestId, payload }) => {
    try {
        if (!requestId) {
            return {
                success: false,
                message: "Request ID is required"
            };
        }

        // First check if the request exists
        const exists = await OfflineRequestQueueDA.getOfflineRequestById(requestId);
        if (!exists.success) {
            return exists;
        }

        const result = await OfflineRequestQueueDA.updateOfflineRequest(requestId, payload);

        logger.info(`Offline request ${requestId} updated`);
        return result;
    } catch (error) {
        logger.error(`Error updating offline request: ${error.message}`);
        return {
            success: false,
            message: "Error updating offline request",
            error: error.message
        };
    }
};

/**
 * Update the status of an offline request
 */
exports.updateOfflineRequestStatus = async ({ requestId, status, error }) => {
    try {
        if (!requestId || !status) {
            return {
                success: false,
                message: "Request ID and status are required"
            };
        }

        // Validate status value
        const validStatuses = ['pending', 'synced', 'failed'];
        if (!validStatuses.includes(status)) {
            return {
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            };
        }

        // First check if the request exists
        const exists = await OfflineRequestQueueDA.getOfflineRequestById(requestId);
        if (!exists.success) {
            return exists;
        }

        const result = await OfflineRequestQueueDA.updateOfflineRequestStatus(requestId, status, error);

        logger.info(`Offline request ${requestId} status updated to ${status}`);
        return result;
    } catch (error) {
        logger.error(`Error updating offline request status: ${error.message}`);
        return {
            success: false,
            message: "Error updating offline request status",
            error: error.message
        };
    }
};

/**
 * Delete an offline request
 */
exports.deleteOfflineRequest = async ({ requestId }) => {
    try {
        if (!requestId) {
            return {
                success: false,
                message: "Request ID is required"
            };
        }

        // First check if the request exists
        const exists = await OfflineRequestQueueDA.getOfflineRequestById(requestId);
        if (!exists.success) {
            return exists;
        }

        const result = await OfflineRequestQueueDA.deleteOfflineRequest(requestId);

        logger.info(`Offline request ${requestId} deleted`);
        return result;
    } catch (error) {
        logger.error(`Error deleting offline request: ${error.message}`);
        return {
            success: false,
            message: "Error deleting offline request",
            error: error.message
        };
    }
};

/**
 * Get all pending offline requests
 */
exports.getPendingOfflineRequests = async () => {
    try {
        const result = await OfflineRequestQueueDA.getPendingOfflineRequests();
        if (result && result.data && result.data.length > 0) {
            for (i = 0; i < result.data.length; i++) {
                let requestName = result.data[i].operation
                let exeResult = null;
                // check the request status once again and process it if it is pending 
                let reqInfo = await this.getOfflineRequestById({ requestId: result.data[i]._id })
                if (reqInfo && reqInfo.data && reqInfo.data.status !== "pending") {
                    continue;
                }
                switch (requestName) {
                    case OfflineReqNames.CREATE_USER:
                        {
                            // add generatedId to the payload
                            let generatedId = result.data[i].generatedId
                            let payload = JSON.parse(result.data[i].payload)
                            payload.generatedId = generatedId;
                            // convert to string 
                            payload = JSON.stringify(payload)
                            result.data[i].payload = payload
                            exeResult = await sendOfflineRequestToServer({ reqData: result.data[i] })
                        }
                        break;
                    case OfflineReqNames.EDIT_USER:
                        {
                            let generatedId = result.data[i].generatedId
                            let userId = await getUserIdFromGeneratedIdFromServer({ generatedId: generatedId, token: result.data[i].token })
                            if (userId.success && userId.data) {
                                userId = userId.data.id;
                            }
                            let userEditAPI = result.data[i].apiPath
                            let userEditAPIPath = userEditAPI.replace(/\/[0-9a-fA-F]{24}/, `/${userId}`) // replace the userId in the payload
                            exeResult = await sendOfflineRequestToServer({ reqData: { ...result.data[i], apiPath: userEditAPIPath } }) // include updated API path
                            break;
                        }
                    case OfflineReqNames.DELETE_USER:
                        {
                            let generatedId = result.data[i].generatedId
                            let userId = await getUserIdFromGeneratedIdFromServer({ generatedId: generatedId, token: result.data[i].token })
                            if (userId.success && userId.data) {
                                userId = userId.data.id;
                            }
                            let userDeleteAPI = result.data[i].apiPath
                            let userDeleteAPIPath = userDeleteAPI.replace(/\/[0-9a-fA-F]{24}/, `/${userId}`) // replace the userId in the payload
                            exeResult = await sendOfflineRequestToServer({ reqData: { ...result.data[i], apiPath: userDeleteAPIPath } }) // include updated API path
                        }
                        break;
                    case OfflineReqNames.CREATE_MACHINE:
                        {
                            // add generatedId to the payload
                            let generatedId = result.data[i].generatedId
                            let payload = JSON.parse(result.data[i].payload)
                            payload.generatedId = generatedId;
                            // convert to string 
                            payload = JSON.stringify(payload)
                            result.data[i].payload = payload
                            exeResult = await sendOfflineJSONRequestToServer({ reqData: result.data[i] })
                        }
                        break;
                    case OfflineReqNames.UPDATE_MACHINE_TOGGLE_STATUS:
                        {
                            let generatedId = result.data[i].generatedId
                            let machineId = await getMachineIdFromGeneratedIdFromServer({ generatedId: generatedId, token: result.data[i].token })
                            if (machineId.success && machineId.data) {
                                machineId = machineId.data.machine._id;
                            }
                            let machineEditAPI = result.data[i].apiPath
                            let machineEditAPIPath = machineEditAPI.replace(/\/[0-9a-fA-F]{24}/, `/${machineId}`) // replace the userId in the payload
                            exeResult = await sendOfflineJSONRequestToServer({ reqData: { ...result.data[i], apiPath: machineEditAPIPath } }) // include updated API path
                        }
                        break;
                    case OfflineReqNames.ASSIGN_MACHINE:
                        {
                            let generatedId = result.data[i].generatedId
                            let machineId = await getMachineIdFromGeneratedIdFromServer({ generatedId: generatedId, token: result.data[i].token })
                            if (machineId.success && machineId.data) {
                                machineId = machineId.data.machine._id;
                            }
                            let machineEditAPI = result.data[i].apiPath
                            let machineEditAPIPath = machineEditAPI.replace(/\/[0-9a-fA-F]{24}/, `/${machineId}`) // replace the userId in the payload
                            exeResult = await sendOfflineJSONRequestToServer({ reqData: { ...result.data[i], apiPath: machineEditAPIPath } }) // include updated API path
                        }
                        break;
                    case OfflineReqNames.DELETE_MACHINE:
                        {
                            let generatedId = result.data[i].generatedId
                            let machineId = await getMachineIdFromGeneratedIdFromServer({ generatedId: generatedId, token: result.data[i].token })
                            if (machineId.success && machineId.data) {
                                machineId = machineId.data.machine._id;
                            }
                            let machineDeleteAPI = result.data[i].apiPath
                            let machineDeleteAPIPath = machineDeleteAPI.replace(/\/[0-9a-fA-F]{24}/, `/${machineId}`) // replace the userId in the payload
                            exeResult = await sendOfflineJSONRequestToServer({ reqData: { ...result.data[i], apiPath: machineDeleteAPIPath } }) // include updated API path
                        }
                        break;
                    case OfflineReqNames.CREATE_TASK:
                        {
                            // add generatedId to the payload
                            let generatedId = result.data[i].generatedId
                            let payload = JSON.parse(result.data[i].payload)
                            payload.generatedId = generatedId;
                            // convert to string 
                            payload = JSON.stringify(payload)
                            result.data[i].payload = payload
                            exeResult = await sendOfflineRequestToServer({ reqData: result.data[i] })
                        }
                        break;
                    case OfflineReqNames.UPDATE_TASK:
                        {
                            let generatedId = result.data[i].generatedId
                            let taskId = await getTaskIdFromGeneratedIdFromServer({ generatedId: generatedId, token: result.data[i].token })
                            if (taskId.success && taskId.data) {
                                taskId = taskId.data._id;
                            }
                            let taskEditAPI = result.data[i].apiPath
                            let taskEditAPIPath = taskEditAPI.replace(/\/[0-9a-fA-F]{24}/, `/${taskId}`) // replace the userId in the payload
                            exeResult = await sendOfflineRequestToServer({ reqData: { ...result.data[i], apiPath: taskEditAPIPath } }) // include updated API path
                        }
                        break;
                    default:
                        logger.warn(`Unhandled request type: ${requestName}`);
                        break;
                }
                if (exeResult) {
                    // update the request status to completed
                    await OfflineRequestQueueDA.updateOfflineRequestStatus(result.data[i]._id, "synced", null);
                }
            }
            return {
                success: true,
                data: result,
                message: "Pending offline requests fetched successfully"
            };
        } else {
            console.log('No pending offline requests found',)
            return {
                success: true,
                data: {},
                message: "No pending offline requests found"
            }
        }

    } catch (error) {
        console.log('error', error)
        logger.error(`Error fetching pending offline requests: ${error.message}`);
        return {
            success: false,
            message: "Error fetching pending offline requests",
            error: error.message
        };
    }
};


/**
 * Sync offline requests to the main server
 */
exports.syncOfflineRequestToServer = async () => {
    try {
        // get the pending request 
        let pendingReq = await this.getPendingOfflineRequests()
        return {
            success: true,
            data: {},
            message: "Pending offline requests synced in progress"
        }
    } catch (error) {
        console.log('error', error)
        logger.error(`Error syncing offline request to server: ${error.message}`);
        return {
            success: false,
            message: "Error syncing offline request to server",
            error: error.message
        };
    }

}

// function for sync the remote db to local db
exports.syncRemoteDBToLocalDB = async () => {
    try {
        // get the pending request 
        // use the mongodb atlas url to copy the entire database to the localhost db 

    } catch (error) {
        console.log('error', error)
        logger.error(`Error syncing offline request to server: ${error.message}`);
        return {
            success: false,
            message: "Error syncing offline request to server",
            error: error.message
        };
    }

}