const Course = require('../models/course');

exports.createCourse = async (payload) => {
    try {
        const result = await Course.create([payload]);
        return {
            success: true,
            data: result,
            message: 'Created course successfully',
        };
    } catch (error) {
        console.error('Error in CourseDataAccess.createCourse:', error);
        return {
            success: false,
            message: error.message,
        };
    }
}; 