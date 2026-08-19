const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  getDuplicateGroups
} = require('../controllers/complaintController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'civicai_secret_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {}
  }
  next();
};

router.get('/', getComplaints);
router.get('/duplicates', getDuplicateGroups);
router.get('/:id', getComplaintById);
router.post('/', optionalProtect, createComplaint);
router.put('/:id/status', updateComplaint);
router.put('/:id', updateComplaint);

module.exports = router;
