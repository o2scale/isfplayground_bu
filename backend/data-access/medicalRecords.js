const { default: mongoose } = require("mongoose")
const Medical = require("../models/medical")

// Function for create the medical records 
exports.createMedicalRecords = async (payload) => {
    return await Medical.create([payload]).then(result => {
        return {
            success: true,
            data: result,
            message: "Successfully created the medical records"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// update medical next action date by student id
exports.updateNextActionDate = async (studentId, nextActionDate) => {
    return await Medical.findOneAndUpdate(
        { studentId: studentId },
        { nextActionDate: nextActionDate },
        { new: true }
    ).then(result => {
        return {
            success: true,
            data: result,
            message: "Successfully updated the medical records"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// delete medical records by student id
exports.deleteMedicalRecords = async (studentId) => {
    return await Medical.findOneAndDelete(
        { studentId: studentId }
    ).then(result => {
        return {
            success: true,
            data: result,
            message: "Successfully deleted the medical records"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// get the medical history by _ids list 
exports.getMedicalHistoryByItemIds = async (ids) => {
    // convert the ids to object id
    let idsArray = ids.map(id => mongoose.Types.ObjectId.createFromHexString(id))
    return await Medical.aggregate([
        {
            '$unwind': '$medicalHistory'
        }, {
            '$match': {
                'medicalHistory._id': {
                    '$in': idsArray
                }
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: "Successfully fetched the medical history"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// get the all medical history by medicalHistory._id list