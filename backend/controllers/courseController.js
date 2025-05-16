const CourseService = require('../services/course');
const mongoose = require('mongoose');

exports.createCourse = async (req, res) => {
    try {
        // Extract form-data fields
        const data = req.body;
        // Handle file uploads
        const files = req.files || [];
        // Pass data and files to the service layer
        const userId = req.user._id;
        const result = await CourseService.createCourse(data, files, userId);
        if (result.success) {
            res.status(201).json({ success: true, data: result.data, message: 'Course created successfully.' });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
    }
}; 