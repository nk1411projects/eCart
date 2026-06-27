import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { MapPin, CreditCard, Wallet, AlertTriangle, Plus, Check } from 'lucide-react';

const Checkout = () => {
  const { user, addAddress, updateWallet } = useAuth();
  const { cartItems, coupon, getSubtotal, getTax, getShipping, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Selected Shipping Address (defaults to the user's default address)
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0] || null;
  const [selectedAddress, setSelectedAddress] = useState(defaultAddr);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, card, wallet

  // New Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Loading / Error
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addAddress({
        fullName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
        isDefault: !user.addresses || user.addresses.length === 0
      });
      setShowAddressForm(false);
      // Select the newly added address
      const latest = user.addresses[user.addresses.length - 1];
      if (latest) setSelectedAddress(latest);
      
      // Clear inputs
      setFullName('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPostalCode('');
      setPhoneNumber('');
    } catch (err) {
      setError(err.message || 'Failed to record shipping address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select or add a shipping address.');
      return;
    }

    setError('');
    setPlacing(true);

    const grandTotal = getTotal();

    // Extra validation for wallet balance
    if (paymentMethod === 'wallet' && user.walletBalance < grandTotal) {
      setError('Insufficient wallet balance to complete transaction.');
      setPlacing(false);
      return;
    }

    try {
      const orderBody = {
        cartItems: cartItems.map(item => ({
          product: item.product._id || item.product,
          variantId: item.variantId,
          quantity: item.quantity,
          title: item.product.title
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
          phoneNumber: selectedAddress.phoneNumber
        },
        paymentMethod,
        couponCode: coupon ? coupon.code : undefined
      };

      const res = await ordersAPI.createOrder(orderBody);
      
      // Update wallet locally if user paid with wallet
      if (paymentMethod === 'wallet') {
        updateWallet(user.walletBalance - grandTotal);
      }

      // Success
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setPlacing(false);
    }
  };

  const grandTotal = getTotal();

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Secure Checkout</h1>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          padding: '0.8rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      <div className="checkout-layout">
        
        {/* Left Side: Addresses & Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Step 1: Shipping Address Selection */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={18} /> 1. Shipping Address
              </h3>
              {!showAddressForm && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus size={14} /> New Address
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Address Line 1</label>
                  <input type="text" className="form-control" placeholder="Street address" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input type="text" className="form-control" placeholder="Apt, Suite, Unit" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">City</label>
                    <input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">State / Province</label>
                    <input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Postal Code</label>
                    <input type="text" className="form-control" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Address</button>
                </div>
              </form>
            ) : (
              <div>
                {!user?.addresses || user.addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    No addresses recorded. Please click 'New Address' to add one.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {user.addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        onClick={() => setSelectedAddress(addr)}
                        className="glass-panel"
                        style={{
                          padding: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderColor: selectedAddress?._id === addr._id ? 'var(--primary)' : 'var(--border-color)',
                          background: selectedAddress?._id === addr._id ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-card)'
                        }}
                      >
                        <div>
                          <strong>{addr.fullName}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({addr.phoneNumber})</span>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                          </div>
                        </div>
                        {selectedAddress?._id === addr._id && (
                          <div style={{ background: 'var(--primary)', color: 'white', padding: '4px', borderRadius: '50%', display: 'flex' }}>
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Payment Selector */}
          <div style={{ paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <CreditCard size={18} /> 2. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {/* Cash on Delivery */}
              <div 
                onClick={() => setPaymentMethod('cod')}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderColor: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border-color)',
                  background: paymentMethod === 'cod' ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-card)'
                }}
              >
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Pay with cash upon package receipt.</div>
                </div>
                {paymentMethod === 'cod' && (
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '4px', borderRadius: '50%', display: 'flex' }}>
                    <Check size={14} />
                  </div>
                )}
              </div>

              {/* Online Simulation */}
              <div 
                onClick={() => setPaymentMethod('card')}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderColor: paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-color)',
                  background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-card)'
                }}
              >
                <div>
                  <strong>Card / Netbanking / UPI</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Simulated Stripe payment gateway check.</div>
                </div>
                {paymentMethod === 'card' && (
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '4px', borderRadius: '50%', display: 'flex' }}>
                    <Check size={14} />
                  </div>
                )}
              </div>

              {/* Wallet Credits */}
              <div 
                onClick={() => setPaymentMethod('wallet')}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderColor: paymentMethod === 'wallet' ? 'var(--primary)' : 'var(--border-color)',
                  background: paymentMethod === 'wallet' ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Wallet size={20} style={{ color: 'var(--secondary)' }} />
                  <div>
                    <strong>eCart Digital Wallet</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                      Current Balance: <strong style={{ color: 'var(--text-primary)' }}>${user?.walletBalance?.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {paymentMethod === 'wallet' && (
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '4px', borderRadius: '50%', display: 'flex' }}>
                      <Check size={14} />
                    </div>
                  )}
                </div>
              </div>

              {paymentMethod === 'wallet' && user.walletBalance < grandTotal && (
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', color: 'var(--danger)', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>
                  <AlertTriangle size={14} /> Warning: Wallet balance is too low to cover order cost.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Order summary review & Place Order */}
        <div className="checkout-aside">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Final Review
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              {cartItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product.title} (x{item.quantity})
                  </span>
                  <span>
                    ${((item.product.variants?.find(v => v._id === item.variantId || v.sku === item.variantId)?.price || item.product.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                  <span>Coupon ({coupon.code})</span>
                  <span>-${((coupon.discountType === 'percentage' ? (coupon.discountAmount / 100) * getSubtotal() : coupon.discountAmount)).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping Fees</span>
                <span>{getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>GST / VAT (5%)</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
            </div>

            <div style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 700, 
              fontSize: '1.25rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.8rem',
              fontFamily: 'var(--font-heading)'
            }}>
              <span>Total Cost</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
              disabled={placing || (paymentMethod === 'wallet' && user.walletBalance < grandTotal)}
              onClick={handlePlaceOrder}
            >
              {placing ? 'Processing Transaction...' : 'Place Secure Order'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
