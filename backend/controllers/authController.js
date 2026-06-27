const User = require('../models/User');
const Seller = require('../models/Seller');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_fallback_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        walletBalance: user.walletBalance
      }
    });
};

// @desc    Register user (Customer or Seller)
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  const { name, email, password, role, storeName, storeDescription } = req.body;

  try {
    // Check if email already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Determine target role (only customer and seller can self-register)
    const targetRole = role === 'seller' ? 'seller' : 'customer';

    // Check if store name is provided for seller
    if (targetRole === 'seller') {
      if (!storeName) {
        return res.status(400).json({ success: false, error: 'Store name is required for seller registration' });
      }
      let storeExists = await Seller.findOne({ storeName });
      if (storeExists) {
        return res.status(400).json({ success: false, error: 'Store name is already taken' });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: targetRole
    });

    // Create seller profile if registering as a seller
    if (targetRole === 'seller') {
      await Seller.create({
        user: user._id,
        storeName,
        storeDescription: storeDescription || `${name}'s Store`,
        kycStatus: 'pending' // default status
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, data: {} });
};

// @desc    Get current logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let sellerProfile = null;

    if (user.role === 'seller') {
      sellerProfile = await Seller.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        walletBalance: user.walletBalance
      },
      seller: sellerProfile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add / Update shipping address
// @route   POST /api/v1/auth/address
// @access  Private
exports.addAddress = async (req, res, next) => {
  const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phoneNumber, isDefault } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // If new address is marked as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/v1/auth/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    
    // Ensure at least one address is default if list not empty
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};
