const Attendance = require('../models/attendance');

// Function for save the attendance details 
exports.saveAttendance = async (payload) => {
    return await Attendance.create(payload).then(result => {
        return {
            success: true,
            data: result,
            message: "Attendance saved successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })
}

// Function for fetch the attendance by student id and date string 
exports.getAttendanceByStudentIdAndDate = async ({ studentId, dateString }) => {
    return await Attendance.findOne({ studentId, dateString }).lean().then(result => {
        return {
            success: true,
            data: result,
            message: "Attendance fetched successfully"
        }
    }).catch(error => {
        console.log('error', error)
        throw error;
    })

}

// Function for update the attendance details 
exports.updateAttendanceById = async (id, payload) => {
    return await Attendance.findByIdAndUpdate
        (id, payload, { new: true }).then(result => {
            return {
                success: true,
                data: result,
                message: "Attendance updated successfully"
            }
        }).catch(error => {
            console.log('error', error)
            throw error;
        })
}