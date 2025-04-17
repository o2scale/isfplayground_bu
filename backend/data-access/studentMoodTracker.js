const StudentMoodTracker = require('../models/studentMoodTracker');

// Create or update mood tracker entry
exports.createOrUpdateMoodEntry = async (moodData) => {
    try {
        // Check if entry with same userId and dateString exists
        const existingEntry = await StudentMoodTracker.findOne({
            userId: moodData.userId,
            dateString: moodData.dateString
        });

        if (existingEntry) {
            // Update existing entry
            return await StudentMoodTracker.findByIdAndUpdate(
                existingEntry._id,
                moodData,
                { new: true }
            );
        } else {
            // Create new entry
            const newMoodEntry = new StudentMoodTracker(moodData);
            return await newMoodEntry.save();
        }
    } catch (error) {
        throw error;
    }
};

// Get mood entries by userId
exports.getMoodEntriesByUserId = async (userId) => {
    try {
        return await StudentMoodTracker.find({ userId })
            .sort({ date: -1 });
    } catch (error) {
        throw error;
    }
};

// Get mood entry by id
exports.getMoodEntryById = async (entryId) => {
    try {
        return await StudentMoodTracker.findById(entryId);
    } catch (error) {
        throw error;
    }
};

// Update mood entry
exports.updateMoodEntry = async (entryId, updateData) => {
    try {
        return await StudentMoodTracker.findByIdAndUpdate(
            entryId,
            updateData,
            { new: true }
        );
    } catch (error) {
        throw error;
    }
};

// Delete mood entry
exports.deleteMoodEntry = async (entryId) => {
    try {
        return await StudentMoodTracker.findByIdAndDelete(entryId);
    } catch (error) {
        throw error;
    }
};

// Get mood entries by date range
exports.getMoodEntriesByDateRange = async (userId, startDate, endDate) => {
    try {
        return await StudentMoodTracker.find({
            userId,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ date: -1 });
    } catch (error) {
        throw error;
    }
};
