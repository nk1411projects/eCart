const express = require('express');
const router = express.Router();
const { 
  getAdminDashboard, 
  getPendingSellers, 
  getAllSellers, 
  verifySellerKyc, 
  getAllUsers, 
  toggleUserSuspension, 
  createCoupon, 
  getCoupons, 
  getAuditLogs 
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Secure all routes in this router to authenticated Admins
router.use(protect);
router.use(authorizeRoles('admin', 'super_admin'));

router.get('/dashboard', getAdminDashboard);

// Seller approval routes
router.get('/sellers/pending', getPendingSellers);
router.get('/sellers', getAllSellers);
router.put('/sellers/:id/kyc', verifySellerKyc);

// User suspension routes
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleUserSuspension);

// Coupons and promotion engine
router.route('/coupons')
  .get(getCoupons)
  .post(createCoupon);

// Audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
