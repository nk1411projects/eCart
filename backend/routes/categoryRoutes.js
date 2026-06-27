const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, authorizeRoles('admin', 'super_admin'), createCategory);

module.exports = router;
