const express = require('express');
const router = express.Router();
const { getCart, updateCart } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCart)
  .post(protect, updateCart);

module.exports = router;
