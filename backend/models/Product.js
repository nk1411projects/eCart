const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  attributes: {
    color: { type: String },
    size: { type: String }
  }
});

const ProductSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  brand: { type: String },
  images: [{ type: String }],
  variants: [VariantSchema],
  ratingsSummary: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  isApproved: { type: Boolean, default: true }, // Default approved for easy use, but toggled by admin
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Compound search index for MongoDB text search fallback
ProductSchema.index({ title: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
