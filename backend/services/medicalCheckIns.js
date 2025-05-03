const { default: mongoose } = require("mongoose");
const { errorLogger } = require("../config/pino-config");
const {
    createMedicalCheckIn,
    getAllMedicalCheckIns,
    getMedicalCheckInById,
    getMedicalCheckInsByStudentId,
    updateMedicalCheckIn,
    deleteMedicalCheckIn,
    updateMedicalCheckInAttachments,
    deleteAttachment
} = require("../data-access/medicalCheckIns");
const { uploadFileToS3 } = require("./aws/s3");
const { getFileContentType, getUploadedFilesFullPath } = require("../utils/helper");
const User = require("../models/user");
const { getStudentMedicalCheckInsByBalagruhaIds } = require("../data-access/User")
class MedicalCheckIns {
    constructor(obj) {
        this.studentId = obj.studentId || null;
        this.temperature = obj.temperature || 0;
        this.date = obj.date || null;
        this.healthStatus = obj.healthStatus || "Normal";
        this.notes = obj.notes || "";
        this.attachments = obj.attachments || [];
        this.createdBy = obj.createdBy || null;
    }

    toJSON() {
        return {
            studentId: this.studentId,
            temperature: this.temperature,
            date: this.date,
            healthStatus: this.healthStatus,
            notes: this.notes,
            attachments: this.attachments,
            createdBy: this.createdBy
        };
    }

    static async createMedicalCheckIn(payload, attachmentFiles) {
        try {
            const { studentId, temperature, date, healthStatus, notes, createdBy } = payload;

            // Validate required fields
            if (!studentId || !temperature || !date || !createdBy) {
                return {
                    success: false,
                    data: {},
                    message: 'All required fields must be provided.'
                };
            }

            // Validate IDs
            if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(createdBy)) {
                return {
                    success: false,
                    data: {},
                    message: 'Invalid student or createdBy ID.'
                };
            }

            // Check if student and creator exist
            const creatorExists = await User.findById(createdBy);

            if (!creatorExists) {
                return {
                    success: false,
                    data: {},
                    message: 'Student or creator not found.'
                };
            }

            // Process attachments if any
            let processedAttachments = [];
            if (attachmentFiles && attachmentFiles.length > 0) {
                for (let i = 0; i < attachmentFiles.length; i++) {
                    let file = attachmentFiles[i];
                    let fileName = file.replace('uploads/', '');
                    let result = await uploadFileToS3(
                        file,
                        process.env.AWS_S3_BUCKET_NAME_MEDICAL_RECORDS,
                        fileName
                    );

                    if (result.success) {
                        let attachmentObj = {
                            fileName: fileName,
                            fileUrl: result.url,
                            fileType: result.contentType,
                            fileSize: result.size,
                            uploadedBy: createdBy
                        };
                        processedAttachments.push(attachmentObj);
                    } else {
                        return {
                            success: false,
                            data: {},
                            message: 'Failed to upload attachments.'
                        };
                    }
                }
            }

            // Create medical check-in object
            const medicalCheckIn = new MedicalCheckIns({
                studentId,
                temperature,
                date: new Date(date),
                healthStatus: healthStatus || 'Normal',
                notes,
                attachments: processedAttachments,
                createdBy
            });

            // Save to database
            const result = await createMedicalCheckIn(medicalCheckIn);
            if (result && result.success) {
                return {
                    success: true,
                    data: {
                        medicalCheckIn: result.data[0]
                    },
                    message: "Medical check-in created successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to create medical check-in"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during creating medical check-in: ${error.message}`);
            throw error;
        }
    }

    static async getAllMedicalCheckIns(filters = {}, pagination = {}) {
        try {
            const result = await getAllMedicalCheckIns(filters, pagination);
            if (result.success) {
                return {
                    success: true,
                    data: {
                        medicalCheckIns: result.data,
                        count: result.count,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage
                    },
                    message: "Fetched all medical check-ins successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to fetch medical check-ins"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during fetching medical check-ins: ${error.message}`);
            throw error;
        }
    }

    static async getMedicalCheckInsByStudentId(studentId, pagination = {}) {
        try {
            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                return {
                    success: false,
                    data: {},
                    message: 'Invalid student ID.'
                };
            }

            const result = await getMedicalCheckInsByStudentId(studentId, pagination);
            if (result.success) {
                return {
                    success: true,
                    data: {
                        medicalCheckIns: result.data,
                        count: result.count,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage
                    },
                    message: "Fetched student's medical check-ins successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to fetch student's medical check-ins"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during fetching student's medical check-ins: ${error.message}`);
            throw error;
        }
    }

    static async getMedicalCheckInById(checkInId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(checkInId)) {
                return {
                    success: false,
                    data: {},
                    message: 'Invalid check-in ID.'
                };
            }

            const result = await getMedicalCheckInById(checkInId);
            if (result.success && result.data) {
                return {
                    success: true,
                    data: {
                        medicalCheckIn: result.data
                    },
                    message: "Fetched medical check-in successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to fetch medical check-in or not found"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during fetching medical check-in: ${error.message}`);
            throw error;
        }
    }

    static async updateMedicalCheckIn(checkInId, payload) {
        try {
            if (!mongoose.Types.ObjectId.isValid(checkInId)) {
                return {
                    success: false,
                    data: {},
                    message: 'Invalid check-in ID.'
                };
            }

            // Check if medical check-in exists
            const checkInExists = await getMedicalCheckInById(checkInId);
            if (!checkInExists.success || !checkInExists.data) {
                return {
                    success: false,
                    data: {},
                    message: 'Medical check-in not found.'
                };
            }

            const result = await updateMedicalCheckIn(checkInId, payload);
            if (result.success) {
                return {
                    success: true,
                    data: {
                        medicalCheckIn: result.data
                    },
                    message: "Updated medical check-in successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to update medical check-in"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during updating medical check-in: ${error.message}`);
            throw error;
        }
    }

    static async deleteMedicalCheckIn(checkInId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(checkInId)) {
                return {
                    success: false,
                    data: {},
                    message: 'Invalid check-in ID.'
                };
            }

            // Check if medical check-in exists
            const checkInExists = await getMedicalCheckInById(checkInId);
            if (!checkInExists.success || !checkInExists.data) {
                return {
                    success: false,
                    data: {},
                    message: 'Medical check-in not found.'
                };
            }

            const result = await deleteMedicalCheckIn(checkInId);
            if (result.success) {
                return {
                    success: true,
                    data: {
                        medicalCheckIn: result.data
                    },
                    message: "Deleted medical check-in successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to delete medical check-in"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during deleting medical check-in: ${error.message}`);
            throw error;
        }
    }

    static async addOrUpdateAttachments(checkInId, attachmentFiles, createdById) {
        try {
            if (!mongoose.Types.ObjectId.isValid(checkInId) || !mongoose.Types.ObjectId.isValid(createdById)) {
                return {
                    success: false,
                    data: {},
                    message: 'Invalid check-in ID or creator ID.'
                };
            }

            // Check if medical check-in exists
            const checkInExists = await getMedicalCheckInById(checkInId);
            if (!checkInExists.success || !checkInExists.data) {
                return {
                    success: false,
                    data: {},
                    message: 'Medical check-in not found.'
                };
            }

            // Process attachments
            let processedAttachments = checkInExists.data.attachments || [];
            if (attachmentFiles && attachmentFiles.length > 0) {
                for (let i = 0; i < attachmentFiles.length; i++) {
                    let file = attachmentFiles[i];
                    let fileName = file.replace('uploads/', '');
                    let result = await uploadFileToS3(
                        file,
                        process.env.AWS_S3_BUCKET_NAME_MEDICAL_ATTACHMENTS || 'medical-attachments',
                        fileName
                    );

                    if (result.success) {
                        let attachmentObj = {
                            fileName: fileName,
                            fileUrl: result.url,
                            fileType: result.contentType,
                            fileSize: result.size,
                            uploadedBy: createdById
                        };
                        processedAttachments.push(attachmentObj);
                    } else {
                        return {
                            success: false,
                            data: {},
                            message: 'Failed to upload attachments.'
                        };
                    }
                }
            }

            const result = await updateMedicalCheckInAttachments(checkInId, processedAttachments);
            if (result.success) {
                return {
                    success: true,
                    data: {
                        medicalCheckIn: result.data
                    },
                    message: "Updated attachments successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to update attachments"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during adding/updating attachments: ${error.message}`);
            throw error;
        }
    }

    static async deleteAttachment(checkInId, attachmentId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(checkInId) || !mongoose.Types.ObjectId.isValid(attachmentId)) {
                return {
                    success: false,
                    data: {},
                    message: 'Invalid check-in ID or attachment ID.'
                };
            }

            // Check if medical check-in exists
            const checkInExists = await getMedicalCheckInById(checkInId);
            if (!checkInExists.success || !checkInExists.data) {
                return {
                    success: false,
                    data: {},
                    message: 'Medical check-in not found.'
                };
            }

            const result = await deleteAttachment(checkInId, attachmentId);
            if (result.success) {
                return {
                    success: true,
                    data: {
                        medicalCheckIn: result.data
                    },
                    message: "Deleted attachment successfully"
                };
            } else {
                return {
                    success: false,
                    data: {},
                    message: "Failed to delete attachment"
                };
            }
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during deleting attachment: ${error.message}`);
            throw error;
        }
    }

    static async getMedicalCheckInsByBalagruhaIds(balagruhaIds) {
        try {
            if (!balagruhaIds || !Array.isArray(balagruhaIds) || balagruhaIds?.length === 0) {
                //    get all balagruha ids from the database
                balagruhaIds = await Balagruha.find({}).select('_id').lean();
                balagruhaIds = balagruhaIds.map(item => item._id.toString());
            }
            const result = await getStudentMedicalCheckInsByBalagruhaIds({ balagruhaIds });
            if (result.success) {
                let medicalCheckIns = []
                result.data.forEach(item => {
                    medicalCheckIns.push(item.medicalCheckIns)
                })

                return {
                    success: true,
                    data: {
                        medicalCheckIns: medicalCheckIns
                    },
                    message: "Fetched medical check-ins by balagruha Ids successfully"
                };
            }
            return result;
        } catch (error) {
            errorLogger.error({ data: { error: error } }, `Error occurred during getting medical check-ins by balagruha Ids: ${error.message}`);
            throw error;
        }
    }
}

module.exports = MedicalCheckIns; 