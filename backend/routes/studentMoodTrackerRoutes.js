const express = require('express');
const router = express.Router();
const studentMoodTrackerController = require('../controllers/studentMoodTrackerController');
const { authenticateToken, authenticate, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
// router.use(authenticateToken);

// Create or update mood entry
router.post('/',
    authenticate, // Ensure the user is authenticated
    studentMoodTrackerController.createOrUpdateMoodEntry);

// Get mood entries by userId
router.get('/user/:userId', studentMoodTrackerController.getMoodEntriesByUserId);

// Get mood entries by date range
router.get('/dateRange', studentMoodTrackerController.getMoodEntriesByDateRange);

// Get, update, delete mood entry by id
router.get('/:id', studentMoodTrackerController.getMoodEntryById);
router.put('/:id', studentMoodTrackerController.updateMoodEntry);
router.delete('/:id', studentMoodTrackerController.deleteMoodEntry);
// get mood tracker latest details by balagruha
router.post('/latest', studentMoodTrackerController.getLatestMoodEntry);

module.exports = router;
