import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Tag, Store, ShieldAlert, Star } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gallery state
  const [activeImage, setActiveImage] = useState('');

  // Selected variant state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeVariant, setActiveVariant] = useState(null);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product detail on mount
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await catalogAPI.getProductById(id);
        setProduct(res.data);
        setReviews(res.reviews || []);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0]);
        }
        
        // Auto-select first variant options
        if (res.data.variants && res.data.variants.length > 0) {
          const first = res.data.variants[0];
          setSelectedColor(first.attributes.color || '');
          setSelectedSize(first.attributes.size || '');
          setActiveVariant(first);
        }
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Recalculate active variant when selections change
  useEffect(() => {
    if (!product || !product.variants) return;
    
    const match = product.variants.find(v => {
      const colorMatch = !selectedColor || v.attributes.color === selectedColor;
      const sizeMatch = !selectedSize || v.attributes.size === selectedSize;
      return colorMatch && sizeMatch;
    });

    if (match) {
      setActiveVariant(match);
    } else {
      setActiveVariant(null);
    }
  }, [selectedColor, selectedSize, product]);

  const handleAddToCart = () => {
    if (!activeVariant) return;
    addToCart(product, activeVariant._id || activeVariant.sku, 1);
    
    // Animate cart or direct redirect
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const res = await catalogAPI.createReview(id, { rating: reviewRating, comment: reviewComment });
      setReviewSuccess('Review submitted successfully! Thank you.');
      setReviewComment('');
      
      // Refresh reviews list
      const updated = await catalogAPI.getProductById(id);
      setReviews(updated.reviews || []);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Have you already reviewed this item, or did you buy it?');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>Loading product specifications...</div>;
  }

  if (error || !product) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Unavailable Product</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error || 'The requested catalog item is offline.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/search')}>Back to Shop</button>
      </div>
    );
  }

  // Get unique colors and sizes from variants
  const colors = [...new Set(product.variants.map(v => v.attributes.color).filter(Boolean))];
  const sizes = [...new Set(product.variants.map(v => v.attributes.size).filter(Boolean))];

  return (
    <div>
      {/* Product Detail Grid Layout */}
      <div className="product-details-layout">
        {/* Left Side: Images Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', overflow: 'hidden' }}>
            <img 
              src={activeImage || 'https://placehold.co/600x400'} 
              alt={product.title} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>

          {/* Sub Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto' }}>
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImage === img ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    padding: '2px'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Options & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.brand}
            </span>
            <h1 style={{ fontSize: '2rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>{product.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>⭐ <strong>{product.ratingsSummary?.averageRating.toFixed(1) || '0.0'}</strong> ({product.ratingsSummary?.totalReviews || 0} reviews)</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Store size={14} /> {product.seller?.storeName}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
            <span style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              ${activeVariant ? activeVariant.price.toFixed(2) : (product.variants[0]?.price.toFixed(2) || '0.00')}
            </span>
            {activeVariant && (
              <span style={{ marginLeft: '1rem', fontSize: '0.85rem' }} className={activeVariant.stock > 0 ? 'badge badge-success' : 'badge badge-danger'}>
                {activeVariant.stock > 0 ? `In Stock (${activeVariant.stock} units)` : 'Out of Stock'}
              </span>
            )}
          </div>

          {/* Color Selectors */}
          {colors.length > 0 && (
            <div>
              <label className="form-label">Color: <strong>{selectedColor}</strong></label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {colors.map(col => (
                  <button
                    key={col}
                    className={`btn ${selectedColor === col ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => setSelectedColor(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selectors */}
          {sizes.length > 0 && (
            <div>
              <label className="form-label">Size / Option: <strong>{selectedSize}</strong></label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {sizes.map(sz => (
                  <button
                    key={sz}
                    className={`btn ${selectedSize === sz ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              className="btn btn-primary"
              style={{ flexGrow: 1, padding: '0.8rem' }}
              disabled={!activeVariant || activeVariant.stock <= 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>

          {/* Description */}
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>Product Description</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Customer Ratings & Reviews</h2>

        <div className="product-reviews-layout">
          {/* Left: Review Submission Form */}
          <div>
            {user ? (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Write a Review</h3>
                
                {reviewSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <Star 
                          key={val} 
                          size={24}
                          onClick={() => setReviewRating(val)}
                          style={{
                            cursor: 'pointer',
                            fill: val <= reviewRating ? 'var(--warning)' : 'none',
                            color: val <= reviewRating ? 'var(--warning)' : 'var(--text-muted)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Your Review Description</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      style={{ resize: 'none' }}
                      placeholder="Share your experience using this product..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Share your feedback</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Please login to review this product.</p>
                <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login to Review</button>
              </div>
            )}
          </div>

          {/* Right: Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                No reviews yet. Be the first to buy and review this product!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{rev.name}</strong>
                      {rev.verifiedPurchase && (
                        <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.4' }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
