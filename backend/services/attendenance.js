const { getAttendanceByStudentIdAndDate, updateAttendanceById, saveAttendance } = require("../data-access/attendance")
const { dateToString } = require("../utils/helper")

class Attendance {

    constructor(obj = {}) {
        this.balagruhaId = obj.balagruhaId || null;
        this.studentId = obj.studentId || null;
        this.date = obj.date || null;
        this.dateString = obj.dateString || "";
        this.status = obj.status || "absent";
        this.notes = obj.notes || "";
    }

    toJSON() {
        return {
            balagruhaId: this.balagruhaId,
            studentId: this.studentId,
            date: this.date,
            dateString: this.dateString,
            status: this.status,
            notes: this.notes
        }
    }
    async saveToDb() {
        return await saveAttendance(this.toJSON())
    }

    static async saveAttendance(payload) {
        try {
            let { studentId, date } = payload;
            let dateString = dateToString(date)
            payload.dateString = dateString;
            // check for the attendance is already marked for the student on the given date
            let attendance = await getAttendanceByStudentIdAndDate({ studentId: studentId, dateString: dateString })
            if (attendance.success && attendance.data) {
                // if present update the attendance
                // update the attendance
                let result = await updateAttendanceById(attendance.data._id, payload)
                if (result.success) {
                    return {
                        success: true,
                        data: {
                            attendance: result.data,
                        },
                        message: "Attendance updated successfully"
                    }
                } else {
                    return {
                        success: false,
                        data: {},
                        message: "Error updating attendance"
                    }
                }
            } else {
                // else create the attendance
                let attendanceObj = new Attendance(payload);
                let result = await attendanceObj.saveToDb();
                if (result.success) {
                    return {
                        success: true,
                        data: {
                            attendance: result.data,
                        },
                        message: "Attendance created successfully"
                    }
                } else {
                    return {
                        success: false,
                        data: {},
                        message: "Error creating attendance"
                    }
                }
            }
        } catch (error) {
            console.log('error', error)
            throw error;
        }
    }
}

module.exports = Attendance;
