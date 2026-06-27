const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Seller = require('../models/Seller');
const Order = require('../models/Order');

// Helper to format category tree
const buildCategoryTree = (categories, parentId = null) => {
  const categoryList = [];
  let categoryFiltered;
  if (parentId === null) {
    categoryFiltered = categories.filter(cat => cat.parent === null || cat.parent === undefined);
  } else {
    categoryFiltered = categories.filter(cat => cat.parent && cat.parent.toString() === parentId.toString());
  }

  for (let cat of categoryFiltered) {
    categoryList.push({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parent: cat.parent,
      children: buildCategoryTree(categories, cat._id)
    });
  }
  return categoryList;
};

// ==========================================
// CATEGORY CONTROLLERS
// ==========================================

// @desc    Get all categories (flat or tree)
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    const tree = buildCategoryTree(categories);
    res.status(200).json({ success: true, data: categories, tree });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  const { name, description, parent } = req.body;
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parent || null
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PRODUCT CONTROLLERS
// ==========================================

// @desc    Get products (filtered, paginated, sorted)
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, rating, sort, page = 1, limit = 12 } = req.query;

    const query = { isActive: true, isApproved: true };

    // Keyword text search (fallback)
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Category filter (includes subcategories)
    if (category) {
      // Find category object
      const catObj = await Category.findOne({ slug: category });
      if (catObj) {
        // Find all subcategories
        const allCats = await Category.find({});
        
        const getSubcatIds = (cats, parentId) => {
          let ids = [parentId.toString()];
          const subcats = cats.filter(c => c.parent && c.parent.toString() === parentId.toString());
          for (let sub of subcats) {
            ids = ids.concat(getSubcatIds(cats, sub._id));
          }
          return ids;
        };

        const categoryIds = getSubcatIds(allCats, catObj._id);
        query.category = { $in: categoryIds };
      }
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    // Price range filters (inspects price of variants)
    if (minPrice || maxPrice) {
      query['variants.price'] = {};
      if (minPrice) query['variants.price'].$gte = Number(minPrice);
      if (maxPrice) query['variants.price'].$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['ratingsSummary.averageRating'] = { $gte: Number(rating) };
    }

    // Build Mongoose query
    let apiQuery = Product.find(query).populate('category', 'name slug').populate('seller', 'storeName');

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price-asc':
          apiQuery = apiQuery.sort({ 'variants.0.price': 1 }); // rough approximation for sorting nested schemas
          break;
        case 'price-desc':
          apiQuery = apiQuery.sort({ 'variants.0.price': -1 });
          break;
        case 'rating':
          apiQuery = apiQuery.sort({ 'ratingsSummary.averageRating': -1 });
          break;
        case 'newest':
          apiQuery = apiQuery.sort({ createdAt: -1 });
          break;
        default:
          apiQuery = apiQuery.sort({ createdAt: -1 });
      }
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    apiQuery = apiQuery.skip(skip).limit(limitNum);

    const products = await apiQuery;

    // Get list of unique brands for frontend filter sidebar
    const brands = await Product.distinct('brand', { isActive: true, isApproved: true });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total
      },
      brands
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({
        path: 'seller',
        select: 'storeName storeDescription logo banner'
      });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Get reviews
    const reviews = await Review.find({ product: product._id }).populate('user', 'name');

    res.status(200).json({ success: true, data: product, reviews });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SELLER PRODUCT CONTROLLERS
// ==========================================

// @desc    Get all products belonging to a seller
// @route   GET /api/v1/seller/products
// @access  Private/Seller
exports.sellerGetProducts = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    const products = await Product.find({ seller: seller._id }).populate('category', 'name');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/v1/seller/products
// @access  Private/Seller
exports.sellerCreateProduct = async (req, res, next) => {
  const { title, description, category, brand, images, variants } = req.body;
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    if (seller.kycStatus !== 'approved') {
      return res.status(403).json({ success: false, error: 'Seller KYC is not approved yet' });
    }

    const product = await Product.create({
      seller: seller._id,
      title,
      description,
      category,
      brand,
      images: images || [],
      variants: variants || []
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (only owner)
// @route   PUT /api/v1/seller/products/:id
// @access  Private/Seller
exports.sellerUpdateProduct = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Verify ownership
    if (product.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (only owner)
// @route   DELETE /api/v1/seller/products/:id
// @access  Private/Seller
exports.sellerDeleteProduct = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Verify ownership
    if (product.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REVIEW CONTROLLERS
// ==========================================

// @desc    Create product review
// @route   POST /api/v1/products/:id/reviews
// @access  Private (Customer)
exports.createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Verify if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: product._id,
      user: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, error: 'Product already reviewed' });
    }

    // Verify purchase
    // Find if the user has a delivered order containing this product
    const order = await Order.findOne({
      buyer: req.user.id,
      paymentStatus: 'paid',
      'subOrders.items.product': product._id
    });

    const review = await Review.create({
      product: product._id,
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      verifiedPurchase: !!order
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};
