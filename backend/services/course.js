const CourseDataAccess = require('../data-access/course');
const mongoose = require('mongoose');

class CourseService {
    static async createCourse(data, files, userId) {
        try {
            // Parse modules/chapters/files from data (expecting JSON strings for nested fields)
            let modules = [];
            if (data.modules) {
                modules = typeof data.modules === 'string' ? JSON.parse(data.modules) : data.modules;
            }

            // Map uploaded files to chapters/files if needed
            // Example: files with fieldname 'chapter_0_file_0', etc.
            if (modules.length > 0 && files.length > 0) {
                modules.forEach((mod, modIdx) => {
                    if (mod.chapters && mod.chapters.length > 0) {
                        mod.chapters.forEach((chap, chapIdx) => {
                            chap.files = files
                                .filter(f => f.fieldname === `module_${modIdx}_chapter_${chapIdx}_file`)
                                .map(f => ({
                                    fileName: f.originalname,
                                    fileType: f.mimetype,
                                    fileUrl: f.path,
                                }));
                        });
                    }
                });
            }

            // Build course payload
            const coursePayload = {
                title: data.title,
                description: data.description,
                category: data.category,
                duration: data.duration,
                difficultyLevel: data.difficultyLevel,
                thumbnail: files.find(f => f.fieldname === 'thumbnail')?.path || '',
                enableCoinReward: data.enableCoinReward === 'true' || data.enableCoinReward === true,
                coinsOnCompletion: Number(data.coinsOnCompletion) || 0,
                modules: modules,
                status: data.status || 'draft',
                assignedBalagruha: data.assignedBalagruha ? (Array.isArray(data.assignedBalagruha) ? data.assignedBalagruha : [data.assignedBalagruha]) : [],
                createdBy: userId,
            };

            // Save to DB
            const result = await CourseDataAccess.createCourse(coursePayload);
            if (result.success) {
                return { success: true, data: result.data, message: 'Course created successfully.' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Error in CourseService.createCourse:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = CourseService; 