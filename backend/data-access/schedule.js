const Schedules = require('../models/schedules');
const mongoose = require('mongoose');

// Create a new schedule
const createSchedule = async (scheduleData) => {
    try {
        const schedule = new Schedules(scheduleData);
        const savedSchedule = await schedule.save();
        return {
            success: true,
            data: savedSchedule
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// Get schedule by ID
const getScheduleById = async (scheduleId) => {
    try {
        const schedule = await Schedules.findById(scheduleId)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('balagruhaId', 'name');

        if (!schedule) {
            return {
                success: false,
                message: 'Schedule not found'
            };
        }

        return {
            success: true,
            data: schedule
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// Get all schedules with filters
const getSchedules = async ({ balagruhaId, assignedTo, startDate, endDate, status, page = 1, limit = 10 }) => {
    try {
        const query = {};

        if (balagruhaId) query.balagruhaId = balagruhaId;
        if (assignedTo) query.assignedTo = assignedTo;
        if (status) query.status = status;
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const schedules = await Schedules.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('balagruhaId', 'name')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ date: -1 });

        const total = await Schedules.countDocuments(query);

        return {
            success: true,
            data: {
                schedules,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// Update schedule
const updateSchedule = async (scheduleId, updateData) => {
    try {
        const schedule = await Schedules.findByIdAndUpdate(
            scheduleId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('balagruhaId', 'name');

        if (!schedule) {
            return {
                success: false,
                message: 'Schedule not found'
            };
        }

        return {
            success: true,
            data: schedule
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// Delete schedule
const deleteSchedule = async (scheduleId) => {
    try {
        const schedule = await Schedules.findByIdAndDelete(scheduleId);

        if (!schedule) {
            return {
                success: false,
                message: 'Schedule not found'
            };
        }

        return {
            success: true,
            data: schedule
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// Get schedules by user
const getSchedulesByUser = async (userId) => {
    try {
        const schedules = await Schedules.find({ assignedTo: userId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('balagruhaId', 'name')
            .sort({ date: -1 });

        return {
            success: true,
            data: schedules
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// Find the schedule by the assignedTo, date, and in between the start time and end time
const getOverlappingSchedule = async (assignedTo, date, startTime, endTime) => {
    const overlappingSchedule = await Schedules.findOne({ assignedTo, date, startTime: { $lte: endTime }, endTime: { $gte: startTime } });
    return overlappingSchedule;
};

// Find the schedule by the assignedTo, date, and in between the start time and end time
const getOverlappingScheduleOtherThanGivenSchedule = async ({ scheduleId, assignedTo, date, startTime, endTime }) => {
    const overlappingSchedule = await Schedules.findOne({ assignedTo, date, startTime: { $lte: endTime }, endTime: { $gte: startTime }, _id: { $ne: scheduleId } });
    return overlappingSchedule;
};

// Get schedules for admin
const getSchedulesForAdmin = async (balagruhaId, assignedTo, startDate, endDate, status) => {
    if (status == null || status == undefined || status.length == 0) {
        status = ["pending", "inprogress", "completed", "cancelled"];
    }
    if (balagruhaId == null || balagruhaId == undefined || balagruhaId.length == 0) {
        return {
            success: false,
            message: 'Balagruha ID is required'
        };
    } else {
        // convert the balagruhaId to object id if it is a string 
        balagruhaId = mongoose.Types.ObjectId.createFromHexString(balagruhaId)
    }

    if (assignedTo == null || assignedTo == undefined || assignedTo.length == 0) {
        return {
            success: false,
            message: 'Assigned To is required'
        };
    } else {
        // convert the assignedTo to object id if it is a string 
        assignedTo = mongoose.Types.ObjectId.createFromHexString(assignedTo)
    }
    // convert the startDate and endDate to date object if it is a string
    startDate = new Date(startDate)
    endDate = new Date(endDate)
    // fetch the balagruha details, assigned to details, created by details
    const schedules = await Schedules.aggregate([
        {
            '$match': {
                'balagruhaId': {
                    '$eq': balagruhaId
                },
                'assignedTo': {
                    '$eq': assignedTo
                },
                'date': {
                    '$gte': startDate,
                    '$lte': endDate
                }
            }
        }, {
            '$lookup': {
                'from': 'balagruhas',
                'localField': 'balagruhaId',
                'foreignField': '_id',
                'as': 'balagruha'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'assignedTo',
                'foreignField': '_id',
                'as': 'assignedToUser'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'createdBy',
                'foreignField': '_id',
                'as': 'createdByUser'
            }
        }, {
            '$unwind': {
                'path': '$balagruha'
            }
        }, {
            '$unwind': {
                'path': '$assignedToUser'
            }
        }, {
            '$unwind': {
                'path': '$createdByUser'
            }
        }, {
            '$project': {
                '_id': 1,
                'balagruhaId': 1,
                'assignedTo': 1,
                'startTime': 1,
                'endTime': 1,
                'date': 1,
                'title': 1,
                'description': 1,
                'timeSlot': 1,
                'createdBy': 1,
                'balagruha._id': 1,
                'balagruha.name': 1,
                'balagruha.location': 1,
                'assignedToUser._id': 1,
                'assignedToUser.name': 1,
                'assignedToUser.email': 1,
                'createdByUser._id': 1,
                'createdByUser.name': 1,
                'createdByUser.email': 1
            }
        }, {
            '$sort': {
                'date': -1,
                'startTime': -1
            }
        }
    ]).then(result => {
        return {
            success: true,
            data: result,
            message: 'Schedules fetched successfully'
        };
    }).catch(error => {
        return {
            success: false,
            data: null,
            message: error.message
        };
    });
    return schedules;
};


module.exports = {
    createSchedule,
    getScheduleById,
    getSchedules,
    updateSchedule,
    deleteSchedule,
    getSchedulesByUser,
    getOverlappingSchedule,
    getSchedulesForAdmin,
    getOverlappingScheduleOtherThanGivenSchedule
}; 