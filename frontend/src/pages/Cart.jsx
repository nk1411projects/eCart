import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, Tag, Minus, Plus } from 'lucide-react';

const Cart = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getSubtotal, 
    getTax, 
    getShipping, 
    getTotal,
    coupon,
    setCoupon,
    getDiscountAmount
  } = useCart();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState(coupon ? coupon.code : '');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(coupon ? 'Promo applied!' : '');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Direct mock validation for seeded coupons to show immediate feedback
    if (code === 'WELCOME10') {
      setCoupon({
        code: 'WELCOME10',
        discountType: 'percentage',
        discountAmount: 10,
        minOrderValue: 50
      });
      setCouponSuccess('10% off applied on checkout!');
    } else if (code === 'ECART50') {
      const subtotal = getSubtotal();
      if (subtotal < 200) {
        setCouponError('Minimum purchase of $200 required for ECART50.');
      } else {
        setCoupon({
          code: 'ECART50',
          discountType: 'fixed',
          discountAmount: 50,
          minOrderValue: 200
        });
        setCouponSuccess('$50 flat discount applied!');
      }
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3.5rem' }}>
        <ShoppingCart size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.2rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add some products from the shop to start checkout.</p>
        <button className="btn btn-primary" onClick={() => navigate('/search')}>Browse Catalog</button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Your Shopping Cart</h1>

      <div className="checkout-layout">
        {/* Left Column: Cart items list */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {cartItems.map((item) => {
            // Safe fallback lookup for variants
            const variant = item.product.variants?.find(v => v._id === item.variantId || v.sku === item.variantId);
            const price = variant ? variant.price : (item.product.price || 0);

            return (
              <div key={`${item.product._id}-${item.variantId}`} style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                padding: '1.5rem 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                {/* Thumb */}
                <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#151525' }}>
                  <img src={item.product.images?.[0] || 'https://placehold.co/100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details */}
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
                    <Link to={`/products/${item.product._id}`}>{item.product.title}</Link>
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <span>Brand: {item.product.brand}</span>
                    {variant?.attributes?.color && <span>Color: {variant.attributes.color}</span>}
                    {variant?.attributes?.size && <span>Size: {variant.attributes.size}</span>}
                  </div>
                  <div style={{ marginTop: '0.4rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    ${price.toFixed(2)}
                  </div>
                </div>

                {/* Quantities */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.3rem', borderRadius: '6px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.2rem', minWidth: '24px', borderRadius: '4px' }}
                    onClick={() => updateQuantity(item.product._id, item.variantId, item.quantity - 1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.2rem', minWidth: '24px', borderRadius: '4px' }}
                    onClick={() => updateQuantity(item.product._id, item.variantId, item.quantity + 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Delete */}
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'transparent' }}
                  onClick={() => removeFromCart(item.product._id, item.variantId)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary & Coupon Entry (Aside) */}
        <div className="checkout-aside">
          {/* Summary Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>

              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                  <span>Discount ({coupon.code})</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Tax (5%)</span>
                <span>${getTax().toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span>{getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}</span>
              </div>
            </div>

            <div style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 700, 
              fontSize: '1.2rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.8rem',
              fontFamily: 'var(--font-heading)'
            }}>
              <span>Grand Total</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>

          {/* Line Separator */}
          <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

          {/* Coupon Entry Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ fontSize: '0.9rem' }}>Promo Code</h4>
            {coupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  <Tag size={14} /> {coupon.code}
                </span>
                <button 
                  onClick={handleRemoveCoupon} 
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.4rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                  placeholder="e.g. WELCOME10" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>Apply</button>
              </form>
            )}

            {couponError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{couponError}</div>
            )}
            {couponSuccess && (
              <div style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>{couponSuccess}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
