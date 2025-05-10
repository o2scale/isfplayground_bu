const {
    createSchedule,
    getScheduleById,
    getSchedules,
    updateSchedule,
    deleteSchedule,
    getSchedulesByUser,
    getOverlappingSchedule,
    getSchedulesForAdmin,
    getOverlappingScheduleOtherThanGivenSchedule
} = require('../data-access/schedule');
const { logger } = require('../config/pino-config');
const { UserTypes } = require('../constants/users');
const { format } = require('date-fns');
class Schedule {
    static async createSchedule(payload) {
        try {
            logger.info('Creating new schedule');
            if (payload.userRole != UserTypes.ADMIN) {
                return {
                    success: false,
                    message: 'You are not authorized to create a schedule',
                    data: null
                }
            }
            // also check if the same user have any overlapping schedule for the same date and within the start time and end time
            const overlappingSchedule = await this.getOverlappingSchedule(payload);
            if (overlappingSchedule) {
                return {
                    success: false,
                    data: null,
                    message: 'You have an overlapping schedule for the same date and within the start time and end time',
                }
            }
            // get the time slot from the start time and end time of the format 12:00 AM - 12:00 AM
            const timeSlot = this.getTimeSlot(payload.startTime, payload.endTime);
            payload.timeSlot = timeSlot;
            const result = await createSchedule(payload);
            if (result.success) {
                logger.info('Schedule created successfully');
                // get the complete schedule details including balagruha details, assigned to details, created by details
                const schedule = await this.getScheduleById(result.data._id);
                return {
                    success: true,
                    data: {
                        schedule: schedule.data,
                        message: 'Schedule created successfully'
                    }
                    ,
                    message: 'Schedule created successfully'
                };
            }
            return result;
        } catch (error) {
            logger.error('Error creating schedule:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    static async createScheduleNew(payload) {
        try {
            logger.info('Creating new schedules');
            if (payload.userRole != UserTypes.ADMIN) {
                return {
                    success: false,
                    message: 'You are not authorized to create a schedule',
                    data: null
                }
            }

            const { balagruhaIds, assignedTo, schedules } = payload;
            const overlappingSchedules = [];

            // Check for overlapping schedules for each balagruha and schedule combination
            for (const balagruhaId of balagruhaIds) {
                for (const schedule of schedules) {
                    const schedulePayload = {
                        ...schedule,
                        balagruhaId,
                        assignedTo: assignedTo[0] // Since assignedTo is an array with single element
                    };

                    const overlappingSchedule = await this.getOverlappingSchedule(schedulePayload);
                    if (overlappingSchedule) {
                        overlappingSchedules.push({
                            balagruhaId,
                            schedule,
                            overlappingSchedule
                        });
                    }
                }
            }

            // If any overlapping schedules found, return them without creating new schedules
            if (overlappingSchedules.length > 0) {
                return {
                    success: false,
                    data: null,
                    message: 'Found overlapping schedules',
                    overlappingSchedules: overlappingSchedules,
                };
            }

            // Create schedules for each balagruha and schedule combination
            const createdSchedules = [];
            for (const balagruhaId of balagruhaIds) {
                for (const schedule of schedules) {
                    const schedulePayload = {
                        ...schedule,
                        balagruhaId,
                        assignedTo: assignedTo[0],
                        userRole: payload.userRole,
                        createdBy: payload.createdBy
                    };

                    // Get time slot
                    const timeSlot = this.getTimeSlot(schedulePayload.startTime, schedulePayload.endTime);
                    schedulePayload.timeSlot = timeSlot;

                    const result = await createSchedule(schedulePayload);
                    if (result.success) {
                        const scheduleDetails = await this.getScheduleById(result.data._id);
                        createdSchedules.push(scheduleDetails.data);
                    }
                }
            }

            return {
                success: true,
                data: {
                    schedules: createdSchedules
                },
                message: 'Schedules created successfully'
            };

        } catch (error) {
            logger.error('Error creating schedules:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }


    static async getScheduleById(scheduleId) {
        try {
            logger.info(`Fetching schedule with ID: ${scheduleId}`);
            const result = await getScheduleById(scheduleId);
            if (result.success) {
                logger.info('Schedule fetched successfully');
                return {
                    success: true,
                    data: result.data,
                    message: 'Schedule fetched successfully'
                };
            }
            return result;
        } catch (error) {
            logger.error('Error fetching schedule:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    static async getSchedules(filters) {
        try {
            logger.info('Fetching schedules with filters:', filters);
            const result = await getSchedules(filters);
            if (result.success) {
                logger.info('Schedules fetched successfully');
                return {
                    success: true,
                    data: result.data,
                    message: 'Schedules fetched successfully'
                };
            }
            return result;
        } catch (error) {
            logger.error('Error fetching schedules:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    static async updateSchedule(scheduleId, updateData) {
        try {
            logger.info(`Updating schedule with ID: ${scheduleId}`);
            // check the schedule is overlapping with any other schedule for the same date and within the start time and end time and same assigned to
            const overlappingSchedule = await this.getOverlappingScheduleOtherThanGivenSchedule(scheduleId, updateData);
            if (overlappingSchedule) {
                if (scheduleId != overlappingSchedule._id.toString()) {
                    // update the schedule
                } else {

                    return {
                        success: false,
                        message: 'You have an overlapping schedule for the same date and within the start time and end time',
                        data: {},
                    }
                }
            }
            const result = await updateSchedule(scheduleId, updateData);
            if (result.success) {
                logger.info('Schedule updated successfully');
                return {
                    success: true,
                    data: result.data,
                    message: 'Schedule updated successfully'
                };
            }
            return result;
        } catch (error) {
            logger.error('Error updating schedule:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    static async deleteSchedule(scheduleId) {
        try {
            logger.info(`Deleting schedule with ID: ${scheduleId}`);
            const result = await deleteSchedule(scheduleId);
            if (result.success) {
                logger.info('Schedule deleted successfully');
                return {
                    success: true,
                    data: result.data,
                    message: 'Schedule deleted successfully'
                };
            }
            return result;
        } catch (error) {
            logger.error('Error deleting schedule:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    static async getSchedulesByUser(userId) {
        try {
            logger.info(`Fetching schedules for user: ${userId}`);
            const result = await getSchedulesByUser(userId);
            if (result.success) {
                logger.info('User schedules fetched successfully');
                return {
                    success: true,
                    data: result.data,
                    message: 'User schedules fetched successfully'
                };
            }
            return result;
        } catch (error) {
            logger.error('Error fetching user schedules:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    static async getOverlappingSchedule(payload) {
        const { assignedTo, date, startTime, endTime } = payload;
        const overlappingSchedule = await getOverlappingSchedule(assignedTo, date, startTime, endTime);
        return overlappingSchedule;
    }
    static async getOverlappingScheduleOtherThanGivenSchedule(payload) {
        const { scheduleId, assignedTo, date, startTime, endTime } = payload;
        const overlappingSchedule = await getOverlappingScheduleOtherThanGivenSchedule(scheduleId, assignedTo, date, startTime, endTime);
        return overlappingSchedule;
    }

    static getTimeSlot(startTime, endTime) {
        // convert the start time and time to time and create a string in the format 11:00 AM - 12:00 PM
        let start = format(startTime, 'hh:mm a');
        let end = format(endTime, 'hh:mm a');
        return `${start} - ${end}`;

    }

    static async getSchedulesForAdmin(balagruhaId, assignedTo, startDate, endDate, status) {
        const result = await getSchedulesForAdmin(balagruhaId, assignedTo, startDate, endDate, status);
        if (result.success) {
            if (result.data) {
                // iterate the data and create an array of object with the format [{date: '2025-05-05',schedules: [{startTime: '11:00 AM', endTime: '12:00 PM', assignedTo: 'John Doe', createdBy: 'Jane Doe', status: 'pending'}]}]

                const schedulesObj = {};
                result.data.forEach(schedule => {
                    let date = format(schedule.date, 'yyyy-MM-dd');
                    if (!schedulesObj[date]) {
                        schedulesObj[date] = [];
                    }
                    schedulesObj[date].push(schedule);
                });
                // get the keys of the schedulesObj 
                const dates = Object.keys(schedulesObj);
                // sort the dates in ascending order
                dates.sort();
                // create an array of object with the format [{date: '2025-05-05',schedules: [{startTime: '11:00 AM', endTime: '12:00 PM', assignedTo: 'John Doe', createdBy: 'Jane Doe', status: 'pending'}]}]
                const sortedSchedulesObj = dates.map(date => ({ date, schedules: schedulesObj[date] }));
                return {
                    success: true,
                    data: { schedules: sortedSchedulesObj },
                    message: 'Schedules fetched successfully'
                };
            }
            return {
                success: true,
                data: result.data,
                message: 'Schedules fetched successfully'
            };
        }
    }
}

module.exports = Schedule; 
