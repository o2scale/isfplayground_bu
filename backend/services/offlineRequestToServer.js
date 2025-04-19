const axios = require('axios');
const fs = require('fs');

// Function for send offline request to server
exports.sendOfflineRequestToServer = ({ reqData, files }) => {
    try {
        // parse the payload
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

        // Make the axios POST request with FormData
        return axios.post(`https://playground.initiativesewafoundation.com/server${reqData.apiPath}`, form, {
            headers: {
                'Authorization': `${reqData.token}`,
                // No need to set Content-Type - axios will set it automatically with boundary
            },
            timeout: 60000 // 10 seconds timeout
        })
            .then(response => {
                console.log('Offline data sent successfully:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Failed to send offline data:', error);
                throw error;
            });
    } catch (error) {
        console.error('Error sending offline request to server:', error);
        throw error;
    }
}