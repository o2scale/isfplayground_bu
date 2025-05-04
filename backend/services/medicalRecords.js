const { createMedicalRecords, deleteMedicalRecords, getMedicalHistoryByItemIds } = require("../data-access/medicalRecords");
const { getUserDetailsById, updateUserById } = require("../data-access/User");
const { getUploadedFilesFullPath } = require("../utils/helper");
const { uploadFileToS3 } = require("./aws/s3");

class MedicalRecords {

    constructor(obj) {
        this.studentId = obj.studentId || "";
        this.healthCheckupDate = obj.healthCheckupDate || "";
        this.vaccinations = obj.vaccinations || "";
        this.medicalHistory = obj.medicalHistory || "";
        this.notes = obj.notes || "";
        this.createdBy = obj.createdBy || "";
    }

    toJSON() {
        return {
            studentId: this.studentId,
            healthCheckupDate: this.healthCheckupDate,
            vaccinations: this.vaccinations,
            medicalHistory: this.medicalHistory,
            notes: this.notes,
            createdBy: this.createdBy,
        }
    }

    static async createMedicalRecords(obj) {
        try {
            // check for the createdBy and studentId are existing 
            let medicalRecord = new MedicalRecords(obj).toJSON();
            if (!medicalRecord.studentId) {
                return {
                    success: false,
                    data: {},
                    message: "Student id is required"
                }
            }
            if (!medicalRecord.createdBy) {
                return {
                    success: false,
                    data: {},
                    message: "Created Admin Id is required"
                }
            }
            let result = await createMedicalRecords(medicalRecord);
            if (result) {
                // fetch the student details by student id 

            } else {
                return result;
            }

        } catch (error) {
            console.log('error', error)
            throw error;
        }
    }
    // function for update student medical records 
    static async updateStudentMedicalRecords({ studentId, medicalData, nextActionDate, createdBy, isOfflineReq }) {
        try {
            // delete existing medical records by student id
            let medicalHistory = [];
            if (medicalData && medicalData.length > 0) {
                let existingMedicalHistoryIds = []
                medicalData.forEach(record => {
                    if (record._id) {
                        existingMedicalHistoryIds.push(record._id)
                    }
                })
                // get all the medical history from the existing medical history
                let existingMedicalHistory = await getMedicalHistoryByItemIds(existingMedicalHistoryIds)

                for (let i = 0; i < medicalData.length; i++) {
                    let record = medicalData[i];
                    let otherAttachments = record.otherAttachments;
                    let prescriptions = record.prescriptions;
                    let otherAttachmentsArray = [];
                    let prescriptionsArray = [];
                    // iterate the other attachments and upload it 
                    if (otherAttachments && otherAttachments.length > 0) {
                        for (let j = 0; j < otherAttachments.length; j++) {
                            let fileItem = otherAttachments[j].path;
                            let fileName = otherAttachments[j].filename
                            let originalname = otherAttachments[j].originalname
                            // get the full path of the file 
                            let fileFullPath = getUploadedFilesFullPath(fileName)

                            if (!isOfflineReq) {

                                let result = await uploadFileToS3(fileItem, process.env.AWS_S3_BUCKET_NAME_MEDICAL_RECORDS, fileName);
                                if (result.success) {
                                    otherAttachmentsArray.push({
                                        url: result.url,
                                        name: originalname,
                                        date: new Date()
                                    })
                                }
                            } else {
                                // if the isOfflineReq is true then just push the file name to the array
                                otherAttachmentsArray.push({
                                    url: fileFullPath,
                                    name: originalname,
                                    date: new Date()
                                })
                            }
                        }
                    } else {
                        console.log('no other attachments')
                        let currentItemId = record._id
                        // get the corresponding medical history from the existing medical history
                        if (existingMedicalHistory.data && existingMedicalHistory.data.length > 0) {
                            for (let i = 0; i < existingMedicalHistory.data.length; i++) {
                                let medicalHistoryItem = existingMedicalHistory.data[i]
                                if (medicalHistoryItem.medicalHistory._id.toString() === currentItemId) {
                                    otherAttachmentsArray = medicalHistoryItem.medicalHistory.otherAttachments
                                }
                            }
                        }
                    }

                    if (prescriptions && prescriptions.length > 0) {
                        for (let j = 0; j < prescriptions.length; j++) {
                            let fileItem = prescriptions[j].path;
                            let fileName = prescriptions[j].filename
                            let originalname = prescriptions[j].originalname
                            let fileFullPath = getUploadedFilesFullPath(fileName)

                            if (!isOfflineReq) {

                                let result = await uploadFileToS3(fileItem, process.env.AWS_S3_BUCKET_NAME_MEDICAL_RECORDS, fileName);
                                if (result.success) {
                                    prescriptionsArray.push({
                                        url: result.url,
                                        name: originalname,
                                        date: new Date()
                                    })
                                }
                            } else {
                                // if the isOfflineReq is true then just push the file name to the array
                                prescriptionsArray.push({
                                    url: fileFullPath,
                                    name: originalname,
                                    date: new Date()
                                })
                            }
                        }
                    } else {
                        console.log('no prescriptions')
                        let currentItemId = record._id
                        // get the corresponding medical history from the existing medical history
                        if (existingMedicalHistory.data && existingMedicalHistory.data.length > 0) {
                            for (let i = 0; i < existingMedicalHistory.data.length; i++) {
                                let medicalHistoryItem = existingMedicalHistory.data[i]
                                if (medicalHistoryItem.medicalHistory._id.toString() === currentItemId) {
                                    prescriptionsArray = medicalHistoryItem.medicalHistory.prescriptions
                                }
                            }
                        }
                    }

                    let medicalObj = {
                        name: record.name,
                        description: record.description,
                        date: record.date,
                        caseId: record.caseId,
                        doctorsName: record.doctorsName,
                        hospitalName: record.hospitalName,
                        currentStatus: record.currentStatus,
                        prescriptions: prescriptionsArray,
                        otherAttachments: otherAttachmentsArray
                    }
                    medicalHistory.push(medicalObj)

                }
            }


            if (medicalHistory.length > 0) {
                let medicalRecordsEntry = {
                    studentId: studentId,
                    healthCheckupDate: null,
                    vaccinations: null,
                    nextActionDate: nextActionDate || null,
                    medicalHistory: medicalHistory,
                    notes: "",
                    createdBy: createdBy || null
                }
                let deleteResult = await deleteMedicalRecords(studentId)

                let medicalRecordsSaveResult = await createMedicalRecords(medicalRecordsEntry);
                if (medicalRecordsSaveResult && medicalRecordsSaveResult.success) {
                    // update the student records by appending the medical records id to the field 
                    // get the student info by user id 
                    let studentInfo = await getUserDetailsById({ userId: studentId })

                    if (studentInfo && studentInfo.success) {
                        let medicalRecordsId = medicalRecordsSaveResult.data[0]._id
                        if (studentInfo.data.medicalRecords && studentInfo.data.medicalRecords.length > 0) {
                            studentInfo.data.medicalRecords = studentInfo.data.medicalRecords.concat(medicalRecordsId)
                        } else {
                            studentInfo.data.medicalRecords = [medicalRecordsId]
                        }

                        // update the student info { userId, payload }
                        let result = await updateUserById({ userId: studentInfo.data._id, payload: studentInfo.data })
                        if (result.success) {
                            return {
                                success: true,
                                data: {
                                    user: studentInfo.data
                                },
                                message: "User medical records updated successfully"
                            }
                        } else {
                            return {
                                success: false,
                                data: {
                                    user: null,
                                },
                                message: result?.message ? result.message : "Failed to register user"
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log('error', error)
            throw error;
        }
    }
}

module.exports = MedicalRecords;


