const Order = require('../models/Order');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const AuditLog = require('../models/AuditLog');

// Helper to log administrative actions
const logAdminAction = async (actorId, action, entityName, entityId, details, ip) => {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      entityName,
      entityId,
      details,
      ipAddress: ip || '0.0.0.0'
    });
  } catch (err) {
    console.error(`Audit logging failed: ${err.message}`);
  }
};

// @desc    Get administrative dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalOrdersCount = await Order.countDocuments({});
    const totalUsersCount = await User.countDocuments({ role: 'customer' });
    const totalSellersCount = await Seller.countDocuments({});

    // Calculate platform GMV (Gross Merchandise Value) and Commission earnings
    const paidOrders = await Order.find({ paymentStatus: 'paid' }).populate('subOrders.seller');
    let platformGmv = 0;
    let commissionEarnings = 0;

    paidOrders.forEach(order => {
      platformGmv += order.totalPrice;
      order.subOrders.forEach(sub => {
        if (sub.status !== 'cancelled' && sub.seller) {
          commissionEarnings += (sub.totalPrice * sub.seller.commissionRate);
        }
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        totalOrdersCount,
        totalUsersCount,
        totalSellersCount,
        platformGmv: Math.round(platformGmv * 100) / 100,
        commissionEarnings: Math.round(commissionEarnings * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending seller KYC applications
// @route   GET /api/v1/admin/sellers/pending
// @access  Private/Admin
exports.getPendingSellers = async (req, res, next) => {
  try {
    const sellers = await Seller.find({ kycStatus: 'pending' }).populate('user', 'name email');
    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sellers in the platform
// @route   GET /api/v1/admin/sellers
// @access  Private/Admin
exports.getAllSellers = async (req, res, next) => {
  try {
    const sellers = await Seller.find({}).populate('user', 'name email');
    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject seller KYC and configure commission rate
// @route   PUT /api/v1/admin/sellers/:id/kyc
// @access  Private/Admin
exports.verifySellerKyc = async (req, res, next) => {
  const { status, commissionRate } = req.body;
  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid verification status' });
    }

    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    seller.kycStatus = status;
    if (commissionRate !== undefined) {
      seller.commissionRate = Number(commissionRate);
    }

    await seller.save();

    await logAdminAction(
      req.user.id,
      `kyc_verification_${status}`,
      'Seller',
      seller._id,
      { status, commissionRate },
      req.ip
    );

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive account status (suspend)
// @route   PUT /api/v1/admin/users/:id/suspend
// @access  Private/Admin
exports.toggleUserSuspension = async (req, res, next) => {
  const { isActive } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Do not suspend admins
    if (user.role === 'admin' || user.role === 'super_admin') {
      return res.status(400).json({ success: false, error: 'Administrative profiles cannot be suspended' });
    }

    user.isActive = isActive;
    await user.save();

    await logAdminAction(
      req.user.id,
      isActive ? 'unsuspend_user' : 'suspend_user',
      'User',
      user._id,
      { isActive },
      req.ip
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in the system
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COUPON ENGINE
// ==========================================

// @desc    Create new coupon code campaign
// @route   POST /api/v1/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  const { code, discountType, discountAmount, minOrderValue, startDate, endDate, maxUses } = req.body;
  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountAmount,
      minOrderValue: minOrderValue || 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxUses: maxUses || null
    });

    await logAdminAction(req.user.id, 'create_coupon', 'Coupon', coupon._id, { code }, req.ip);

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of coupons
// @route   GET /api/v1/admin/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system admin audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
