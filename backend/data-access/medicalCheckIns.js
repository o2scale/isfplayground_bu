const MedicalCheckIn = require('../models/medicalCheckIns');
const mongoose = require('mongoose');

// Function to create a new medical check-in
exports.createMedicalCheckIn = async (payload) => {
    return await MedicalCheckIn.create([payload])
        .then(result => {
            return {
                success: true, data: result, message: "Created medical check-in successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
};

// Function to get all medical check-ins with filters
exports.getAllMedicalCheckIns = async (filters = {}, pagination = {}) => {
    const { page = 1, limit = 10 } = pagination;

    return await MedicalCheckIn.find(filters)
        .populate('student', 'firstName lastName studentId')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean()
        .then(async results => {
            const totalCount = await MedicalCheckIn.countDocuments(filters);
            return {
                success: true,
                data: results,
                count: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                message: "Fetched medical check-ins successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
};

// Function to get medical check-ins by student ID
exports.getMedicalCheckInsByStudentId = async (studentId, pagination = {}) => {
    const { page = 1, limit = 10 } = pagination;

    return await MedicalCheckIn.find({ student: studentId })
        .populate('student', 'firstName lastName studentId')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean()
        .then(async results => {
            const totalCount = await MedicalCheckIn.countDocuments({ student: studentId });
            return {
                success: true,
                data: results,
                count: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                message: "Fetched student's medical check-ins successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
};

// Function to get medical check-in by ID
exports.getMedicalCheckInById = async (checkInId) => {
    return await MedicalCheckIn.findById(checkInId)
        .populate('student', 'firstName lastName studentId')
        .populate('createdBy', 'name email')
        .lean()
        .then(result => {
            return {
                success: true, data: result, message: "Fetched medical check-in successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
};

// Function to update medical check-in
exports.updateMedicalCheckIn = async (checkInId, payload) => {
    return await MedicalCheckIn.findByIdAndUpdate(checkInId, payload, { new: true })
        .then(result => {
            return {
                success: true, data: result, message: "Updated medical check-in successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
};

// Function to delete medical check-in
exports.deleteMedicalCheckIn = async (checkInId) => {
    return await MedicalCheckIn.findByIdAndDelete(checkInId)
        .then(result => {
            return {
                success: true, data: result, message: "Deleted medical check-in successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
};

// Function to add or update attachments
exports.updateMedicalCheckInAttachments = async (checkInId, attachments) => {
    return await MedicalCheckIn.findByIdAndUpdate(
        checkInId,
        { $set: { attachments: attachments } },
        { new: true }
    )
        .then(result => {
            return {
                success: true, data: result, message: "Updated medical check-in attachments successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
};

// Function to delete an attachment
exports.deleteAttachment = async (checkInId, attachmentId) => {
    return await MedicalCheckIn.findByIdAndUpdate(
        checkInId,
        { $pull: { attachments: { _id: attachmentId } } },
        { new: true }
    )
        .then(result => {
            return {
                success: true, data: result, message: "Deleted attachment successfully"
            }
        }).catch(error => {
            console.log('error', error);
            throw error;
        });
}; 