const express = require('express');
const router = express.Router();
const offlineRequestQueueController = require('../controllers/offlineRequestQueue');
const { auth } = require('../middleware/auth');

router.post('/', offlineRequestQueueController.createOfflineRequest);

// router.get('/', auth, offlineRequestQueueController.getAllOfflineRequests);

// router.get('/pending', auth, offlineRequestQueueController.getPendingOfflineRequests);


router.get('/:requestId', offlineRequestQueueController.getOfflineRequestById);

// router.put('/:requestId', auth, offlineRequestQueueController.updateOfflineRequest);

// router.patch('/:requestId/status', auth, offlineRequestQueueController.updateOfflineRequestStatus);

// router.delete('/:requestId', auth, offlineRequestQueueController.deleteOfflineRequest);

// API for handling sync the offline request to main server 
router.post('/sync', offlineRequestQueueController.syncOfflineRequestToServer);
// API for sync with the remote db
router.post('/sync/db/remote', offlineRequestQueueController.syncRemoteDBToLocalDB);

module.exports = router;