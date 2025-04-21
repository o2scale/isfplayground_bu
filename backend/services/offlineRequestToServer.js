const axios = require('axios');
const fs = require('fs');
const { getIdByGeneratedId } = require('../data-access/User');

// Function for send offline request to server
exports.sendOfflineRequestToServer = ({ reqData, files, method = 'POST' }) => {
    try {
        // parse the payload
        // set the reqData attachment upload
        if (reqData.attachmentString == null || reqData.attachmentString == undefined || reqData.attachmentString == '') {
            reqData.attachmentString = '[]';
        }
        if (reqData.payload == null || reqData.payload == undefined || reqData.payload == '') {
            reqData.payload = '{}';
        }

        let filesData = JSON.parse(reqData.attachmentString);

        // parse the payload 
        const payload = JSON.parse(reqData.payload); // Replace this with your actual payload string
        const attachments = JSON.parse(reqData.attachmentString); // Your attachmentString

        const form = new FormData();

        // Add all fields from payload (excluding arrays like facialData, medicalHistory etc. which are handled separately)
        for (const key in payload) {
            if (key !== 'facialData' && key !== 'medicalHistory') {
                form.append(key, payload[key]);
            }
        }

        // Add each file to the form data
        if (filesData && Array.isArray(filesData)) {
            filesData.forEach((file, index) => {
                // get the file from the path as blob
                // Assuming file.path contains the file path
                // Use fs to read the file
                const fileBuffer = fs.readFileSync(file.path);
                // Create a Blob from the file buffer
                const blob = new Blob([fileBuffer], { type: file.mimetype || 'application/octet-stream' });
                form.append(`file${index}`, blob, file.originalname);
                form.append(`${file.fieldname}`, blob, file.originalname);

                // form.append(`${file.fieldname}`, file);
            });
        }

        // Make the axios request with dynamic method
        const requestMethod = reqData.method || method.toUpperCase();
        const url = `https://playground.initiativesewafoundation.com/server${reqData.apiPath}`;
        const config = {
            headers: {
                'Authorization': `${reqData.token}`,
                // No need to set Content-Type - axios will set it automatically with boundary
            },
            timeout: 60000 // 10 seconds timeout
        };

        return axios({
            method: requestMethod,
            url: url,
            data: form,
            ...config
        }).then(response => {
            console.log(`Offline data sent successfully with ${requestMethod} method:`, response.data);
            return response.data;
        }).catch(error => {
            console.error(`Failed to send offline data with ${requestMethod} method:`, error);
            throw error;
        });
    } catch (error) {
        console.error('Error sending offline request to server:', error);
        throw error;
    }
}

// Function for send offline request to server
exports.sendOfflineJSONRequestToServer = ({ reqData, files, method = 'POST' }) => {
    try {
        // parse the payload
        // set the reqData attachment upload
        if (reqData.attachmentString == null || reqData.attachmentString == undefined || reqData.attachmentString == '') {
            reqData.attachmentString = '[]';
        }
        if (reqData.payload == null || reqData.payload == undefined || reqData.payload == '') {
            reqData.payload = '{}';
        }

        // let filesData = JSON.parse(reqData.attachmentString);

        // parse the payload 
        const payload = JSON.parse(reqData.payload); // Replace this with your actual payload string
        const attachments = JSON.parse(reqData.attachmentString); // Your attachmentString

        // const form = new FormData();

        // Add all fields from payload (excluding arrays like facialData, medicalHistory etc. which are handled separately)
        // for (const key in payload) {
        //     if (key !== 'facialData' && key !== 'medicalHistory') {
        //         form.append(key, payload[key]);
        //     }
        // }

        // Add each file to the form data
        // if (filesData && Array.isArray(filesData)) {
        //     filesData.forEach((file, index) => {
        //         // get the file from the path as blob
        //         // Assuming file.path contains the file path
        //         // Use fs to read the file
        //         const fileBuffer = fs.readFileSync(file.path);
        //         // Create a Blob from the file buffer
        //         const blob = new Blob([fileBuffer], { type: file.mimetype || 'application/octet-stream' });
        //         form.append(`file${index}`, blob, file.originalname);
        //         form.append(`${file.fieldname}`, blob, file.originalname);

        //         // form.append(`${file.fieldname}`, file);
        //     });
        // }

        // Make the axios request with dynamic method
        const requestMethod = reqData.method || method.toUpperCase();
        const url = `https://playground.initiativesewafoundation.com/server${reqData.apiPath}`;
        const config = {
            headers: {
                'Authorization': `${reqData.token}`,
                // No need to set Content-Type - axios will set it automatically with boundary
            },
            timeout: 60000 // 10 seconds timeout
        };

        return axios({
            method: requestMethod,
            url: url,
            data: payload,
            ...config
        }).then(response => {
            console.log(`Offline data sent successfully with ${requestMethod} method:`, response.data);
            return response.data;
        }).catch(error => {
            console.error(`Failed to send offline data with ${requestMethod} method:`, error);
            throw error;
        });
    } catch (error) {
        console.error('Error sending offline request to server:', error);
        throw error;
    }
}

// Function for fetch the user id by generated id from server through api call 
exports.getUserIdFromGeneratedIdFromServer = async ({ generatedId, token }) => {
    let url = `https://playground.initiativesewafoundation.com/server/api/v1/users/generated/${generatedId}`
    return await axios.get(url, {
        headers: {
            'Authorization': token
        }
    }).then(response => {
        console.log('User ID fetched successfully:', response.data);
        return response.data;
    }).catch(error => {
        console.error('Failed to fetch user ID:', error);
        throw error;
    });
}

// Function for fetch the machine id by generated id from server through api call 
exports.getMachineIdFromGeneratedIdFromServer = async ({ generatedId, token }) => {
    let url = `https://playground.initiativesewafoundation.com/server/api/v1/machines/details/${generatedId}`
    return await axios.get(url, {
        headers: {
            'Authorization': token
        }
    }).then(response => {
        console.log('Machine ID fetched successfully:', response.data);
        return response.data;
    }).catch(error => {
        console.error('Failed to fetch machine ID:', error);
        throw error;
    });
}

// Function for fetch the task id by generated id from server through api call
exports.getTaskIdFromGeneratedIdFromServer = async ({ generatedId, token }) => {
    let url = `https://playground.initiativesewafoundation.com/server//api/tasks/details/${generatedId}`
    return await axios.get(url, {
        headers: {
            'Authorization': token
        }
    }).then(response => {
        console.log('Task ID fetched successfully:', response.data);
        return response.data;
    }).catch(error => {
        console.error('Failed to fetch task ID:', error);
        throw error;
    });
}