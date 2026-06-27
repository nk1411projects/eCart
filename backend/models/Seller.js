const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  storeName: { type: String, required: true, unique: true },
  storeDescription: { type: String },
  logo: { type: String },
  banner: { type: String },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycDetails: {
    taxId: { type: String },
    businessLicense: { type: String },
    idProof: { type: String }
  },
  commissionRate: { type: Number, default: 0.10 }, // 10% commission default
  payoutDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    routingNumber: { type: String },
    upiId: { type: String }
  },
  isSuspended: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Seller', SellerSchema);
