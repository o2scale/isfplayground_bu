const { errorLogger } = require('../config/pino-config');
const { UserTypes } = require('../constants/users');
const { createMedicalRecords } = require('../data-access/medicalRecords');
const { createUser, getAllUserDetailsForOverview, getUserInfoById, updateUserById, getStudentListByBalagruhaIdWithAttendance, findUsersByRole, getUserObjectById, getUserDetailsById } = require('../data-access/User')
const MedicalRecords = require("../services/medicalRecords");
const { dateToString, getUploadedFilesFullPath } = require('../utils/helper');
const { uploadFileToS3 } = require('./aws/s3');
const canvas = require('canvas');
const faceapi = require('face-api.js');
const path = require('path');
const jwt = require('jsonwebtoken');
const { fetchMachinesByIds } = require('../data-access/machines');
const { default: mongoose } = require('mongoose');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

class Student {

    constructor(obj) {

        this.name = obj.name || "";
        this.email = obj.email || "";
        this.password = obj.password || "";
        this.role = obj.role || "";
        this.status = obj.status || "";
        this.lastLogin = obj.lastLogin || null;
        this.passwordResetToken = obj.passwordResetToken || ""
        this.passwordResetExpire = obj.passwordResetExpire || null
        this.loginAttempts = obj.loginAttempts || 0
        this.lockUntil = obj.lockUntil || null
        this.age = obj.age || null
        this.gender = obj.gender || ""
        this.balagruhaIds = obj.balagruhaIds || null
        this.parentalStatus = obj.parentalStatus || ""
        this.guardianContact = obj.guardianContact || ""
        this.guardianName1 = obj.guardianName1 || ""
        this.guardianName2 = obj.guardianName2 || ""
        this.guardianContact1 = obj.guardianContact1 || ""
        this.guardianContact2 = obj.guardianContact2 || ""
        this.performanceReports = obj.performanceReports || null
        this.attendanceRecords = obj.attendanceRecords || null
        this.medicalRecords = obj.medicalRecords || null
        this.assignedMachines = obj.assignedMachines || null
        this.facialData = obj.facialData || null
    }

    toJSON() {
        return {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role,
            status: this.status,
            lastLogin: this.lastLogin,
            passwordResetToken: this.passwordResetToken,
            passwordResetExpire: this.passwordResetExpire,
            loginAttempts: this.loginAttempts,
            lockUntil: this.lockUntil,
            age: this.age,
            gender: this.gender,
            balagruhaIds: this.balagruhaIds,
            parentalStatus: this.parentalStatus,
            guardianContact: this.guardianContact,
            guardianName1: this.guardianName1,
            guardianName2: this.guardianName2,
            guardianContact1: this.guardianContact1,
            guardianContact2: this.guardianContact2,
            performanceReports: this.performanceReports,
            attendanceRecords: this.attendanceRecords,
            medicalRecords: this.medicalRecords,
            assignedMachines: this.assignedMachines,
            facialData: this.facialData || null

        }
    }

    parseStudentInfo() {
        return {
            name: this.name,
            email: this.email,
            role: this.role,
            status: this.status,
            lastLogin: this.lastLogin,
            age: this.age,
            gender: this.gender,
            balagruhaIds: this.balagruhaIds,
            parentalStatus: this.parentalStatus,
            guardianContact: this.guardianContact,
            guardianName1: this.guardianName1,
            guardianName2: this.guardianName2,
            guardianContact1: this.guardianContact1,
            guardianContact2: this.guardianContact2,
            performanceReports: this.performanceReports,
            attendanceRecords: this.attendanceRecords,
            medicalRecords: this.medicalRecords,
            assignedMachines: this.assignedMachines,
        }
    }


    static async registerStudent(payload) {
        try {
            let student = new Student(payload).toJSON()
            let result = await createUser(student)
            if (result && result.success) {
                let studentInfo = new Student(result.data[0]).parseStudentInfo()
                return {
                    success: true,
                    data: {
                        user: studentInfo
                    }
                }
            } else {
                return {
                    success: false,
                    data: {
                        user: null,
                    },
                    message: "Failed to register user"
                }
            }
        } catch (error) {
            console.log('error', error)
            errorLogger.error({ data: { error: error } }, `Error occurred during user registration: ${error.message}`);
            throw error;
        }
    }

    static async registerStudentNew(payload) {
        try {

            let isOfflineReq = payload.isOfflineReq || false;
            // Check for the medicalHistory is present 
            // then upload the file to s3 and get the url
            let medicalHistory = []

            if (payload.medicalHistory && payload.medicalHistory.length > 0) {
                for (let i = 0; i < payload.medicalHistory.length; i++) {
                    let record = payload.medicalHistory[i];
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
                            // let filePath = path.join(process.cwd(), 'uploads', path.basename(fileItem));
                            let fileFullPath = getUploadedFilesFullPath(fileName)
                            // change the file path to file protocol format (file://)
                            // fileItem = filePath.replace(/\\/g, '/');
                            // // check if the fileItem is a valid file path
                            // if (!fileItem.startsWith('file://')) {
                            //     fileFullPath = `file://${fileItem}`;
                            // }


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


            let descriptorArray = null;
            if (payload.facialData) {
                let imagePath = payload.facialData.path;
                let imagefilepath = path.join(process.cwd(), 'uploads', path.basename(imagePath));
                const img = await canvas.loadImage(path.join(process.cwd(), 'uploads', path.basename(imagePath)));
                const detection = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (!detection) {
                    return {
                        success: false,
                        data: {},
                        message: "Failed to detect face. Try uploading clear image ",
                        error: 'No face detected'
                    }
                };

                descriptorArray = Array.from(detection.descriptor);
            }
            if (descriptorArray) {
                payload.facialData = {
                    faceDescriptor: descriptorArray,
                    createdAt: new Date(),
                }
            }

            let assignedMachinesList = []
            // check the key balagruhaId is an array or string 
            if (typeof payload.assignedMachines === 'string') {
                // convert the comma separated string to array
                payload.assignedMachines = payload.assignedMachines.split(",")
                assignedMachinesList = payload.assignedMachines.map(item => mongoose.Types.ObjectId.createFromHexString(item))
            } else if (Array.isArray(payload.assignedMachines)) {
                assignedMachinesList = payload.assignedMachines.map(item => mongoose.Types.ObjectId.createFromHexString(item))
            }

            let student = new Student(payload).toJSON()
            let result = await createUser(student)
            if (result && result.success) {
                let studentId = result.data[0]._id
                if (medicalHistory.length > 0) {
                    let medicalRecordsEntry = {
                        studentId: result.data[0]._id,
                        healthCheckupDate: null,
                        vaccinations: null,
                        nextActionDate: payload.nextActionDate || null,
                        medicalHistory: medicalHistory,
                        notes: "",
                        createdBy: payload.createdBy
                    }
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

                            // update the student info{ userId, payload }
                            let result = await updateUserById({ userId: studentInfo.data._id, payload: studentInfo.data })
                            studentInfo = await getUserDetailsById({ userId: studentId })
                            if (result.success) {
                                return {
                                    success: true,
                                    data: {
                                        user: studentInfo.data
                                    },
                                    message: "User registered successfully"
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
                let studentInfo = await getUserInfoById({ userId: result.data[0]._id })
                return {
                    success: true,
                    data: {
                        user: studentInfo.data
                    },
                    message: "User registered successfully"
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
        } catch (error) {
            console.log('error', error)
            errorLogger.error({ data: { error: error } }, `Error occurred during user registration: ${error.message}`);
            throw error;
        }
    }


    static async createStudentMedicalRecords(payload) {
        try {
            let {
                studentId,
                healthCheckupDate,
                vaccinations,
                medicalHistory,
                notes,
                createdBy,
            } = payload;
            if (!studentId) {
                return {
                    success: false,
                    data: {
                        medicalRecord: null,
                    },
                    message: "Student id is required"
                }
            }
            let result = new MedicalRecords.createMedicalRecords(payload)
            if (result && result.success) {
                return {
                    success: true,
                    data: {
                        medicalRecord: result.data
                    },
                    message: "Medical record created successfully"
                }
            } else {
                return {
                    success: false,
                    data: {
                        medicalRecord: null,
                    },
                    message: "Failed to create medical record"
                }
            }

        } catch (error) {
            console.log('error', error)
            errorLogger.error({ data: { error: error } }, `Error occurred during creating medical record for student: ${error.message}`);
            throw error;
        }
    }
    static async getStudentListByBalagruhaId({ balagruhaId }) {
        try {
            if (!balagruhaId) {
                return {
                    success: false,
                    data: {
                        studentList: null,
                    },
                    message: "Balagruha id is required"
                }
            }
            let result = await getAllUserDetailsForOverview({ balagruhaId });
            if (result && result.success) {
                // iterate the data 
                result.data = result.data.map(item => {

                    let medicalRecords = item.medicalRecords.map(record => {
                        return record.medicalHistory
                    })
                    item.medicalHistory = [...medicalRecords]
                    console.log('medicalRecords', medicalRecords)
                    delete item.medicalRecords;
                    return item
                })
                return {
                    success: true,
                    data: {
                        studentList: result.data
                    },
                    message: "Student list fetched successfully"
                }
            } else {
                return {
                    success: false,
                    data: {
                        studentList: null,
                    },
                    message: "Failed to fetch student list"
                }
            }
        } catch (error) {
            console.log('error', error)
            errorLogger.error({ data: { error: error } }, `Error occurred during fetching student list by balagruha id: ${error.message}`);
            throw error;
        }
    }

    // Function for fetch all students list by balagruha id with attendance by date 
    static async getStudentListByBalagruhaIdWithAttendance({ balagruhaId, date = new Date() }) {
        try {
            if (!balagruhaId) {
                return {
                    success: false,
                    data: {
                        studentList: null,
                    },
                    message: "Balagruha id is required"
                }
            }
            let result = await getStudentListByBalagruhaIdWithAttendance({ balagruhaId, date });
            if (result && result.success) {

                if (result.data && result.data.length > 0) {
                    // set the empty attendance for the students which doesn't have attendance entry
                    result.data = result.data.map(student => {
                        if (!student.attendance || student.attendance.length == 0) {
                            // commented the default absent attendance entry
                            // student.attendance = [
                            //     {
                            //         "_id": "",
                            //         "balagruhaId": balagruhaId,
                            //         "studentId": student._id,
                            //         "date": date,
                            //         "dateString": dateToString(new Date(date)),
                            //         "status": "absent",
                            //         "notes": "",
                            //         "createdAt": new Date(),
                            //         "updatedAt": new Date(),
                            //     }
                            // ]
                        }
                        return student
                    }
                    )
                }

                return {
                    success: true,
                    data: {
                        studentList: result.data
                    },
                    message: "Student list fetched successfully"
                }
            } else {
                return {
                    success: false,
                    data: {
                        studentList: null,
                    },
                    message: "Failed to fetch student list"
                }
            }

        } catch (error) {
            console.log('error', error)
            errorLogger.error({ data: { error: error } }, `Error occurred during fetching student list by balagruha id with attendance by date: ${error.message}`);
            throw error;

        }
    }


    static async faceLogin(payload) {
        try {
            let macAddress = payload.macAddress
            if (!payload.facialData) {
                return {
                    success: false,
                    data: {},
                    message: "Face image data is required"
                }
            }
            const imagePath = payload.facialData[0].path;
            const img = await canvas.loadImage(path.join(process.cwd(), 'uploads', path.basename(imagePath)));

            const detection = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) return res.status(400).json({ error: 'No face detected' });

            const queryDescriptor = detection.descriptor;
            let users = await findUsersByRole({ role: UserTypes.STUDENT })
            if (users.success && users.data && users.data.length > 0) {
                const labeledDescriptors = users.data
                    .filter(user => user.facialData && user.facialData.faceDescriptor)
                    .map(user => {
                        return new faceapi.LabeledFaceDescriptors(
                            // user.name,
                            user._id.toString(),
                            [new Float32Array(user.facialData.faceDescriptor)]
                        );
                    });
                // Debug: Log all registered names and descriptor lengths
                labeledDescriptors.forEach(ld => {
                    console.log(`Registered: ${ld.label}, Descriptor length: ${ld.descriptors[0].length}`);
                });

                const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 is the max distance threshold
                const bestMatch = faceMatcher.findBestMatch(queryDescriptor);

                console.log('Best match:', bestMatch.label, 'Distance:', bestMatch.distance);
                // Apply a threshold for unknown faces
                const result = {
                    _id: bestMatch.distance < 0.6 ? bestMatch.label : null,
                    // name: bestMatch.distance < 0.6 ? bestMatch.label : null,
                    distance: bestMatch.distance,
                    filename: imagePath
                };

                if (result._id && result._id != null) {
                    // get the student info by user id
                    let user = await getUserObjectById({ userId: result._id })
                    if (user.success) {
                        let userInfo = user.data;
                        if (userInfo.isLocked()) {
                            return {
                                success: false,
                                data: {},
                                code: 423,
                                message: "Account is locked. Please try again later"
                            }
                        }
                        // Check if user is active
                        if (userInfo.status === 'inactive') {
                            return res.status(401).json({
                                success: false,
                                message: 'Account is inactive. Please contact administrator'
                            });
                        }
                        await userInfo.resetLoginAttempts();
                        // get the machines details from the users assigned machines 
                        if (userInfo.assignedMachines && userInfo.assignedMachines.length > 0) {
                            let machineIds = userInfo.assignedMachines.map(item => item)

                            let machines = await fetchMachinesByIds(machineIds)
                            if (machines && machines.success) {
                                let machineMacAddressList = machines.data.map(item => item.macAddress)
                                if (machineMacAddressList.includes(macAddress)) {
                                    // do nothing, continue the flow,
                                } else {
                                    return {
                                        success: false,
                                        data: {},
                                        message: "This machine is not assigned for this student. Contact Admin"
                                    }
                                }
                            } else {
                                return {
                                    success: false,
                                    data: {},
                                    message: "No machines are assigned for this student. Contact Admin"
                                }
                            }
                        } else {
                            return res.status(400).json({
                                success: false,
                                data: {},
                                message: "This machine is not assigned for this student. Contact Admin"
                            })
                        }

                        // generate token
                        // Update last login
                        userInfo.lastLogin = new Date();
                        await userInfo.save();

                        // Create token
                        const token = jwt.sign(
                            { id: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '1d' }
                        );

                        return {
                            success: true,
                            message: 'Login successful',
                            data: {
                                facialDistance: bestMatch.distance || null,
                                token,
                                user: {
                                    id: userInfo._id,
                                    name: userInfo.name,
                                    email: userInfo.email,
                                    role: userInfo.role,
                                    status: userInfo.status
                                }
                            }
                        }

                    } else {
                        return {
                            success: false,
                            data: {},
                            message: "Failed to fetch student info"
                        }
                    }
                } else {
                    return {
                        success: false,
                        data: {},
                        message: "Face not recognized"
                    }
                }

            } else {
                return {
                    success: false,
                    data: {},
                    message: "No students found"
                }
            }

        } catch (error) {
            console.log('error', error)
            errorLogger.error({ data: { error: error } }, `Error occurred during student facial login: ${error.message}`);
            throw error;
        }
    }

    // handle student medical record update 
    static handleStudentMedicalRecordUpdate = async (payload) => {
        try {
            let isOfflineReq = payload.isOfflineReq || false;
            let medicalHistory = []
            if (payload.medicalHistory && payload.medicalHistory.length > 0) {
                for (let i = 0; i < payload.medicalHistory.length; i++) {
                    let record = payload.medicalHistory[i];
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
            return medicalHistory;
        } catch (error) {
            console.log('error', error)
            errorLogger.error({ data: { error: error } }, `Error occurred during student medical record update: ${error.message}`);
            throw error;
        }
    }
}



module.exports = Student

