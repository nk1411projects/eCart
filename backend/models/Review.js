const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Ensure a user can only review a product once
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.getAverageRating = async function(productId) {
  const obj = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        'ratingsSummary.averageRating': Math.round(obj[0].averageRating * 10) / 10,
        'ratingsSummary.totalReviews': obj[0].totalReviews
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        'ratingsSummary.averageRating': 0,
        'ratingsSummary.totalReviews': 0
      });
    }
  } catch (err) {
    console.error(`Error updating product review stats: ${err}`);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.product);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', async function() {
  await this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
