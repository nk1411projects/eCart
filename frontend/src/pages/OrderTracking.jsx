import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { Package, Truck, Calendar, MapPin, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getUserOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelSubOrder = async (orderId, subOrderId) => {
    if (!window.confirm('Are you sure you want to cancel this shipment?')) return;
    setCancellingId(subOrderId);
    try {
      await ordersAPI.cancelOrder(orderId, subOrderId);
      alert('Shipment cancelled successfully.');
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel shipment.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--warning)';
      case 'processing': return 'var(--primary)';
      case 'shipped': return '#06b6d4';
      case 'delivered': return 'var(--secondary)';
      case 'cancelled': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>Retrieving order invoice archives...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>My Orders</h1>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ padding: '0 0 2rem 0', borderBottom: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Order Meta Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order._id}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placed On</span>
                    <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Price</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>${order.totalPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment</span>
                    <div>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                        {order.paymentStatus.toUpperCase()} ({order.paymentMethod.toUpperCase()})
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> Ship to: <strong>{order.shippingAddress.fullName}</strong>
                </div>
              </div>

              {/* Sub-Orders group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {order.subOrders.map((sub) => (
                  <div key={sub._id} style={{
                    padding: '1.25rem 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                    borderBottom: '1px dashed var(--border-color)'
                  }}>
                    {/* Seller details header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.88rem' }}>
                        Seller: <strong style={{ color: 'var(--primary)' }}>{sub.seller?.storeName || 'GizmoLabs Technology'}</strong>
                      </div>
                      <span 
                        className="badge" 
                        style={{
                          backgroundColor: getStatusColor(sub.status) + '1a', // 10% opacity
                          color: getStatusColor(sub.status)
                        }}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Sub-order items list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {sub.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <img src={item.image} alt="" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', background: '#151525' }} />
                          <div style={{ flexGrow: 1, fontSize: '0.88rem' }}>
                            <span style={{ fontWeight: 600 }}>{item.title}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Variant: {item.variantAttributes?.color || 'N/A'} / {item.variantAttributes?.size || 'N/A'}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {item.quantity} x ${item.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Timeline visualization */}
                    {sub.status !== 'cancelled' && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        position: 'relative',
                        padding: '1rem 0 0.5rem 0',
                        textAlign: 'center',
                        fontSize: '0.75rem'
                      }}>
                        {/* Connecting bar */}
                        <div style={{
                          position: 'absolute',
                          top: '25px',
                          left: '12.5%',
                          right: '12.5%',
                          height: '2px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          zIndex: 0
                        }}></div>
                        
                        {/* Timeline Nodes */}
                        {[
                          { label: 'Placed', active: true },
                          { label: 'Processing', active: ['processing', 'shipped', 'delivered'].includes(sub.status) },
                          { label: 'Shipped', active: ['shipped', 'delivered'].includes(sub.status) },
                          { label: 'Delivered', active: sub.status === 'delivered' }
                        ].map((node, index) => (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: node.active ? 'var(--primary)' : 'var(--bg-secondary)',
                              border: node.active ? 'none' : '2px solid var(--border-color)',
                              marginBottom: '0.3rem'
                            }}></div>
                            <span style={{ color: node.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{node.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions and tracking detail footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                      paddingTop: '0.8rem',
                      fontSize: '0.8rem'
                    }}>
                      {sub.trackingNumber ? (
                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Truck size={14} /> Carrier: <strong>{sub.carrier}</strong> | Tracking Code: <strong>{sub.trackingNumber}</strong>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)' }}>Fulfillment in progress</div>
                      )}

                      {/* Cancel individual sub order if not shipped */}
                      {['pending', 'processing'].includes(sub.status) && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          onClick={() => handleCancelSubOrder(order._id, sub._id)}
                          disabled={cancellingId === sub._id}
                        >
                          Cancel Shipment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
