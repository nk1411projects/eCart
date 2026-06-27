const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Seller = require('../models/Seller');

// ==========================================
// CART CONTROLLERS
// ==========================================

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync/update user cart
// @route   POST /api/v1/cart
// @access  Private
exports.updateCart = async (req, res, next) => {
  const { items } = req.body; // Array of { product: id, variantId: string, quantity: number }
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id });
    }

    cart.items = items.map(item => ({
      product: item.product,
      variantId: item.variantId,
      quantity: item.quantity
    }));

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ORDER CONTROLLERS
// ==========================================

// @desc    Create new order with multi-vendor splitting
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const { cartItems, shippingAddress, paymentMethod, couponCode } = req.body;

  try {
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    let itemsPrice = 0;
    const itemsToProcess = [];
    const sellerSplits = {}; // sellerId -> [items]

    // 1. Validate product existence, variants, and stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product).populate('seller');
      if (!product || !product.isActive || !product.isApproved) {
        return res.status(404).json({ success: false, error: `Product not found or unavailable: ${item.title}` });
      }

      const variant = product.variants.find(v => v._id.toString() === item.variantId || v.sku === item.variantId);
      if (!variant) {
        return res.status(400).json({ success: false, error: `Product variant not found for ${product.title}` });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${product.title}. Available: ${variant.stock}` });
      }

      const lineTotal = variant.price * item.quantity;
      itemsPrice += lineTotal;

      const orderItem = {
        product: product._id,
        title: product.title,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        variantId: variant._id.toString(),
        variantAttributes: {
          color: variant.attributes.color,
          size: variant.attributes.size
        },
        price: variant.price,
        quantity: item.quantity
      };

      itemsToProcess.push({
        orderItem,
        productObj: product,
        variantObj: variant,
        sellerId: product.seller._id.toString(),
        lineTotal
      });
    }

    // 2. Handle Coupon Code Discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (!coupon) {
        return res.status(400).json({ success: false, error: 'Invalid or inactive coupon' });
      }

      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        return res.status(400).json({ success: false, error: 'Coupon is expired' });
      }

      if (itemsPrice < coupon.minOrderValue) {
        return res.status(400).json({ success: false, error: `Order total is less than coupon minimum order value of $${coupon.minOrderValue}` });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
      }

      if (coupon.discountType === 'percentage') {
        discount = (coupon.discountAmount / 100) * itemsPrice;
      } else {
        discount = coupon.discountAmount;
      }
      
      // Prevent negative total
      discount = Math.min(discount, itemsPrice);
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Apply proportionate discount to items for seller splits
    const discountRatio = discount > 0 ? (itemsPrice - discount) / itemsPrice : 1;

    // 3. Group by Seller for Sub-Orders
    itemsToProcess.forEach(({ orderItem, sellerId, lineTotal }) => {
      if (!sellerSplits[sellerId]) {
        sellerSplits[sellerId] = [];
      }
      sellerSplits[sellerId].push(orderItem);
    });

    const subOrders = [];
    Object.keys(sellerSplits).forEach(sellerId => {
      const items = sellerSplits[sellerId];
      const subItemsPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Proportioned tax and shipping
      const subTax = Math.round(subItemsPrice * 0.05 * 100) / 100; // 5% tax
      const subShipping = subItemsPrice > 50 ? 0 : 5; // Free shipping over $50 per seller
      const subTotalPrice = (subItemsPrice * discountRatio) + subTax + subShipping;

      subOrders.push({
        seller: sellerId,
        items,
        status: 'pending',
        shippingMethod: 'Standard',
        shippingPrice: subShipping,
        taxPrice: subTax,
        totalPrice: Math.round(subTotalPrice * 100) / 100
      });
    });

    const taxPrice = Math.round(itemsPrice * 0.05 * 100) / 100;
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = Math.round(((itemsPrice - discount) + taxPrice + shippingPrice) * 100) / 100;

    // 4. Handle Payment & Wallet Deductions
    let isPaid = false;
    let paidAt = null;
    let paymentStatus = 'pending';

    if (paymentMethod === 'wallet') {
      const buyerUser = await User.findById(req.user.id);
      if (buyerUser.walletBalance < totalPrice) {
        return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
      }

      // Deduct wallet balance
      buyerUser.walletBalance -= totalPrice;
      await buyerUser.save();
      isPaid = true;
      paidAt = Date.now();
      paymentStatus = 'paid';
    } else if (paymentMethod === 'card' || paymentMethod === 'upi') {
      // Simulate successful payment gateway response
      isPaid = true;
      paidAt = Date.now();
      paymentStatus = 'paid';
    }

    // 5. Update Product Inventory Stock levels
    for (const item of itemsToProcess) {
      item.variantObj.stock -= item.orderItem.quantity;
      await item.productObj.save();
    }

    // 6. Create Order in DB
    const order = await Order.create({
      buyer: req.user.id,
      subOrders,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt,
      status: isPaid ? 'processing' : 'pending'
    });

    // 7. Clear user cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/v1/orders
// @access  Private (Customer)
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('subOrders.seller', 'storeName')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/v1/orders/:id
// @access  Private (Buyer / Seller / Admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('subOrders.seller', 'storeName user');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check Authorization:
    // User is the buyer OR user is an admin OR user is one of the sellers of the sub-orders
    const isBuyer = order.buyer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    
    let isSellerOfOrder = false;
    if (req.user.role === 'seller') {
      isSellerOfOrder = order.subOrders.some(sub => sub.seller.user.toString() === req.user.id);
    }

    if (!isBuyer && !isAdmin && !isSellerOfOrder) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this order details' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order or sub-order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private (Buyer / Seller / Admin)
exports.cancelOrder = async (req, res, next) => {
  const { subOrderId } = req.body; // cancel specific sub-order or the whole order
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const isBuyer = order.buyer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this order' });
    }

    // If cancelling a specific sub-order
    if (subOrderId) {
      const subOrder = order.subOrders.id(subOrderId);
      if (!subOrder) {
        return res.status(404).json({ success: false, error: 'Sub-order not found' });
      }

      if (subOrder.status === 'delivered' || subOrder.status === 'cancelled') {
        return res.status(400).json({ success: false, error: `Cannot cancel sub-order in status: ${subOrder.status}` });
      }

      // Restock items
      for (const item of subOrder.items) {
        await Product.updateOne(
          { _id: item.product, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }

      subOrder.status = 'cancelled';
      
      // If all sub-orders are cancelled, cancel main order
      const allCancelled = order.subOrders.every(sub => sub.status === 'cancelled');
      if (allCancelled) {
        order.status = 'cancelled';
        if (order.paymentStatus === 'paid' && order.paymentMethod === 'wallet') {
          // Refund to buyer wallet
          const buyer = await User.findById(order.buyer);
          buyer.walletBalance += order.totalPrice;
          await buyer.save();
          order.paymentStatus = 'refunded';
        }
      }
      
      await order.save();
      return res.status(200).json({ success: true, data: order });
    }

    // Cancel entire order
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ success: false, error: `Cannot cancel order in status: ${order.status}` });
    }

    // Restock all items
    for (const sub of order.subOrders) {
      if (sub.status !== 'cancelled') {
        for (const item of sub.items) {
          await Product.updateOne(
            { _id: item.product, 'variants._id': item.variantId },
            { $inc: { 'variants.$.stock': item.quantity } }
          );
        }
        sub.status = 'cancelled';
      }
    }

    order.status = 'cancelled';

    // Refund wallet payments
    if (order.paymentStatus === 'paid' && order.paymentMethod === 'wallet') {
      const buyer = await User.findById(order.buyer);
      buyer.walletBalance += order.totalPrice;
      await buyer.save();
      order.paymentStatus = 'refunded';
    }

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
