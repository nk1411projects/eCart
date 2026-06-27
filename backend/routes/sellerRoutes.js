const express = require('express');
const router = express.Router();
const { 
  getSellerDashboard, 
  getSellerOrders, 
  updateSubOrderStatus, 
  submitSellerKyc 
} = require('../controllers/sellerController');
const { 
  sellerGetProducts, 
  sellerCreateProduct, 
  sellerUpdateProduct, 
  sellerDeleteProduct 
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Secure all routes in this router to authenticated Sellers
router.use(protect);
router.use(authorizeRoles('seller'));

router.get('/dashboard', getSellerDashboard);
router.put('/kyc', submitSellerKyc);

// Sub-order management
router.get('/orders', getSellerOrders);
router.put('/orders/:orderId/status', updateSubOrderStatus);

// Product management
router.route('/products')
  .get(sellerGetProducts)
  .post(sellerCreateProduct);

router.route('/products/:id')
  .put(sellerUpdateProduct)
  .delete(sellerDeleteProduct);

module.exports = router;
