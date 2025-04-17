const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

// Configure the S3 client
const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION, // e.g., 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    }
});

exports.uploadFileToS3 = async (filePath, bucketName, keyName) => {
    try {
        // Read the file from local filesystem
        const fileContent = fs.readFileSync(filePath);
        let contentType = getContentType(filePath)
        // Set up S3 upload parameters
        const params = {
            Bucket: bucketName,
            Key: keyName, // File name you want to save as in S3
            Body: fileContent,
            ContentType: contentType
        };

        // Upload file to S3
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        let region = await s3Client.config.region();
        // Construct the URL (note: v3 doesn't return the URL directly)
        const url = `https://${bucketName}.s3.${region}.amazonaws.com/${keyName}`;

        console.log('File uploaded successfully');
        return {
            success: true,
            message: 'Upload successful',
            url: url,
            key: keyName,
            contentType: contentType
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            success: false,
            message: 'Upload failed',
            error: error.message
        };
    }
}

// Helper function to determine content type
function getContentType(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    const contentTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'mkv': 'video/x-matroska',
        'webm': 'video/webm',
        'ogg': 'audio/ogg',
        'wav': 'audio/wav',

    };
    return contentTypes[extension] || 'application/octet-stream';
}