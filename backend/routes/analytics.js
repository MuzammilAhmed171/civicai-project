const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAnalyticsOverview
} = require('../controllers/complaintController');
const { analyzeComplaint } = require('../controllers/aiController');

router.get('/', getAnalytics);
router.get('/overview', getAnalyticsOverview);
router.get('/categories', getAnalytics);
router.get('/priorities', getAnalytics);
router.get('/status', getAnalytics);
router.get('/trends', getAnalytics);
router.get('/insights', getAnalytics);
router.post('/analyze', analyzeComplaint);

module.exports = router;
