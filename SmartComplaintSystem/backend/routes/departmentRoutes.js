const express = require('express');
const router = express.Router();
const { createDepartment, getDepartments } = require('../controllers/departmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('admin'), createDepartment);
router.get('/', protect, getDepartments);

module.exports = router;
