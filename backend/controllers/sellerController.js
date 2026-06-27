const Order = require('../models/Order');
const Seller = require('../models/Seller');
const Product = require('../models/Product');

// @desc    Get seller dashboard statistics (sales, earnings, counts)
// @route   GET /api/v1/seller/dashboard
// @access  Private/Seller
exports.getSellerDashboard = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    // Find orders belonging to this seller
    const orders = await Order.find({ 'subOrders.seller': seller._id });

    let totalRevenue = 0;
    let totalSalesCount = 0;
    let commissionPaid = 0;
    let netEarnings = 0;

    orders.forEach(order => {
      order.subOrders.forEach(sub => {
        if (sub.seller.toString() === seller._id.toString()) {
          // If order is paid, calculate stats
          if (order.paymentStatus === 'paid' && sub.status !== 'cancelled') {
            totalRevenue += sub.totalPrice;
            totalSalesCount += sub.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const comm = sub.totalPrice * seller.commissionRate;
            commissionPaid += comm;
            netEarnings += (sub.totalPrice - comm);
          }
        }
      });
    });

    // Get product count
    const productCount = await Product.countDocuments({ seller: seller._id });

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSalesCount,
        commissionPaid: Math.round(commissionPaid * 100) / 100,
        netEarnings: Math.round(netEarnings * 100) / 100,
        productCount,
        kycStatus: seller.kycStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders containing seller items
// @route   GET /api/v1/seller/orders
// @access  Private/Seller
exports.getSellerOrders = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    const orders = await Order.find({ 'subOrders.seller': seller._id })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    // Filter sub-orders to only show this seller's content
    const filteredOrders = orders.map(order => {
      const sellerSubOrder = order.subOrders.find(sub => sub.seller.toString() === seller._id.toString());
      return {
        _id: order._id,
        buyer: order.buyer,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid,
        createdAt: order.createdAt,
        subOrder: sellerSubOrder
      };
    });

    res.status(200).json({ success: true, data: filteredOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sub-order shipping status
// @route   PUT /api/v1/seller/orders/:orderId/status
// @access  Private/Seller
exports.updateSubOrderStatus = async (req, res, next) => {
  const { status, trackingNumber, carrier } = req.body;
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const subOrder = order.subOrders.find(sub => sub.seller.toString() === seller._id.toString());
    if (!subOrder) {
      return res.status(403).json({ success: false, error: 'Unauthorized to manage this order' });
    }

    if (subOrder.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot update cancelled order' });
    }

    subOrder.status = status;
    if (trackingNumber) subOrder.trackingNumber = trackingNumber;
    if (carrier) subOrder.carrier = carrier;

    // Check if all sub-orders are delivered, and update main order status
    const allDelivered = order.subOrders.every(sub => sub.status === 'delivered' || sub.status === 'cancelled');
    if (allDelivered && status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'completed';
    } else if (status === 'processing') {
      order.status = 'processing';
    }

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update seller payout details or KYC document submission
// @route   PUT /api/v1/seller/kyc
// @access  Private/Seller
exports.submitSellerKyc = async (req, res, next) => {
  const { storeDescription, taxId, businessLicense, idProof, bankName, accountNumber, upiId } = req.body;
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    if (storeDescription) seller.storeDescription = storeDescription;
    
    // Update KYC details
    if (taxId) seller.kycDetails.taxId = taxId;
    if (businessLicense) seller.kycDetails.businessLicense = businessLicense;
    if (idProof) seller.kycDetails.idProof = idProof;

    // Update banking info
    if (bankName) seller.payoutDetails.bankName = bankName;
    if (accountNumber) seller.payoutDetails.accountNumber = accountNumber;
    if (upiId) seller.payoutDetails.upiId = upiId;

    // Reset status to pending if updated documents
    if (taxId || businessLicense || idProof) {
      seller.kycStatus = 'pending';
    }

    await seller.save();
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    next(error);
  }
};
