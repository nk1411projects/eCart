import React, { useState, useEffect } from 'react';
import { sellerAPI, catalogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, ShoppingBag, Truck, CreditCard, PlusCircle, Edit3, Trash2, LayoutDashboard, Settings } from 'lucide-react';

const SellerDashboard = () => {
  const { seller, refreshSellerProfile } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, orders, settings

  // API Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states (Add/Edit Product)
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [prodTitle, setProdTitle] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImages, setProdImages] = useState([]);
  const [prodVariants, setProdVariants] = useState([
    { sku: '', price: '', stock: '', color: '', size: '' }
  ]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Form states (Fulfillment update modal)
  const [updatingSubOrder, setUpdatingSubOrder] = useState(null);
  const [shipStatus, setShipStatus] = useState('processing');
  const [shipCarrier, setShipCarrier] = useState('');
  const [shipTracking, setShipTracking] = useState('');

  // KYC setup form states
  const [kycTaxId, setKycTaxId] = useState(seller?.kycDetails?.taxId || '');
  const [kycLicense, setKycLicense] = useState(seller?.kycDetails?.businessLicense || '');
  const [kycBankName, setKycBankName] = useState(seller?.payoutDetails?.bankName || '');
  const [kycAccount, setKycAccount] = useState(seller?.payoutDetails?.accountNumber || '');
  const [kycUpi, setKycUpi] = useState(seller?.payoutDetails?.upiId || '');
  const [kycSuccess, setKycSuccess] = useState('');

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await sellerAPI.getDashboard();
      setStats(statsRes.stats);

      const productsRes = await sellerAPI.getProducts();
      setProducts(productsRes.data || []);

      const ordersRes = await sellerAPI.getOrders();
      setOrders(ordersRes.data || []);

      const catRes = await catalogAPI.getCategories();
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load seller dashboard details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update dynamic inputs if seller updates
  useEffect(() => {
    if (seller) {
      setKycTaxId(seller.kycDetails?.taxId || '');
      setKycLicense(seller.kycDetails?.businessLicense || '');
      setKycBankName(seller.payoutDetails?.bankName || '');
      setKycAccount(seller.payoutDetails?.accountNumber || '');
      setKycUpi(seller.payoutDetails?.upiId || '');
    }
  }, [seller]);

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // Map variant objects
    const mappedVariants = prodVariants.map(v => ({
      sku: v.sku || `${prodTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${v.color || 'var'}-${v.size || 'uni'}`,
      price: Number(v.price),
      stock: Number(v.stock),
      attributes: {
        color: v.color || undefined,
        size: v.size || undefined
      }
    }));

    const productPayload = {
      title: prodTitle,
      brand: prodBrand,
      category: prodCategory,
      description: prodDesc,
      images: prodImages,
      variants: mappedVariants
    };

    try {
      if (editingProduct) {
        await sellerAPI.updateProduct(editingProduct._id, productPayload);
        alert('Product updated successfully!');
      } else {
        await sellerAPI.createProduct(productPayload);
        alert('Product added for review successfully!');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to submit product.');
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdTitle(prod.title);
    setProdBrand(prod.brand || '');
    setProdCategory(prod.category?._id || prod.category);
    setProdDesc(prod.description);
    setProdImages(prod.images || []);
    
    setProdVariants(prod.variants.map(v => ({
      sku: v.sku,
      price: v.price.toString(),
      stock: v.stock.toString(),
      color: v.attributes?.color || '',
      size: v.attributes?.size || ''
    })));

    setShowProductForm(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdBrand('');
    setProdCategory(categories[0]?._id || '');
    setProdDesc('');
    setProdImages([]);
    setProdVariants([{ sku: '', price: '', stock: '', color: '', size: '' }]);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      await sellerAPI.deleteProduct(id);
      alert('Product listing removed.');
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const handleUpdateFulfillment = async (e) => {
    e.preventDefault();
    try {
      await sellerAPI.updateOrderStatus(updatingSubOrder.orderId, {
        status: shipStatus,
        carrier: shipCarrier || undefined,
        trackingNumber: shipTracking || undefined
      });
      alert('Shipment status updated.');
      setUpdatingSubOrder(null);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Fulfillment modification failed.');
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setKycSuccess('');
    try {
      await sellerAPI.submitKyc({
        taxId: kycTaxId,
        businessLicense: kycLicense,
        bankName: kycBankName,
        accountNumber: kycAccount,
        upiId: kycUpi
      });
      setKycSuccess('KYC documentation and bank setup saved.');
      refreshSellerProfile();
    } catch (err) {
      alert(err.message || 'Failed to save KYC info.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>Opening seller console ledger...</div>;
  }

  return (
    <div>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Seller Portal — {seller?.storeName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{seller?.storeDescription}</p>
        </div>
        <div>
          <span className={`badge ${seller?.kycStatus === 'approved' ? 'badge-success' : 'badge-pending'}`}>
            Store Status: {seller?.kycStatus?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="dashboard-layout" style={{ gridTemplateColumns: '240px 1fr', gap: '2.5rem' }}>
        {/* Navigation Tabs Side */}
        <div className="dashboard-sidebar" style={{ borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
          <div 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Overview
          </div>
          <div 
            className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} /> My Listings
          </div>
          <div 
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Truck size={18} /> Fulfill Orders
          </div>
          <div 
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> KYC & Settings
          </div>
        </div>

        {/* Console Display */}
        <div style={{ minHeight: '60vh', paddingLeft: '0.5rem' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>Performance Metrics</h2>
              
              <div className="stats-grid">
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><DollarSign size={14} /> Gross Revenue</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)' }}>${stats.totalRevenue.toFixed(2)}</div>
                </div>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><DollarSign size={14} /> Net Earnings</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)', color: 'var(--secondary)' }}>${stats.netEarnings.toFixed(2)}</div>
                </div>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><ShoppingBag size={14} /> Items Sold</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)' }}>{stats.totalSalesCount} units</div>
                </div>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><CreditCard size={14} /> Platform Fee</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)', color: 'var(--warning)' }}>{(seller?.commissionRate * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Alert if not approved */}
              {seller.kycStatus !== 'approved' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '3px solid var(--warning)', padding: '1.2rem', marginTop: '2rem' }}>
                  <h3 style={{ color: 'var(--warning)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>KYC Review Pending</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Your storefront profile is currently under admin verification review. You can prepare and upload listings, but catalog entries will not appear in public search indexes until KYC approval is cleared.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVENTORY / PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.3rem' }}>Inventory Listings</h2>
                <button 
                  className="btn btn-seller" 
                  disabled={seller?.kycStatus !== 'approved'}
                  onClick={handleOpenAddProduct}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <PlusCircle size={16} /> Add Product
                </button>
              </div>

              {/* Product form modal */}
              {showProductForm && (
                <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>
                    {editingProduct ? 'Modify Listing' : 'Create Catalog Entry'}
                  </h3>
                  
                  <form onSubmit={handleProductSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Product Name</label>
                        <input type="text" className="form-control" value={prodTitle} onChange={e => setProdTitle(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Brand</label>
                        <input type="text" className="form-control" value={prodBrand} onChange={e => setProdBrand(e.target.value)} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-control" value={prodCategory} onChange={e => setProdCategory(e.target.value)} required>
                          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Product Images</label>
                        <div 
                          style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: '8px',
                            padding: '1.2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: 'var(--bg-input)',
                            transition: 'border-color 0.2s'
                          }} 
                          onClick={() => document.getElementById('product-image-file').click()}
                        >
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload files</span>
                          <input 
                            id="product-image-file"
                            type="file" 
                            multiple 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={handleImageUpload} 
                          />
                        </div>
                        {prodImages.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                            {prodImages.map((img, idx) => (
                              <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button 
                                  type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProdImages(prev => prev.filter((_, i) => i !== idx));
                                  }}
                                  style={{ 
                                    position: 'absolute', 
                                    top: '2px', 
                                    right: '2px', 
                                    background: 'rgba(239, 68, 68, 0.85)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '50%', 
                                    width: '16px', 
                                    height: '16px', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    cursor: 'pointer', 
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    lineHeight: 1,
                                    padding: 0
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows={3} style={{ resize: 'none' }} value={prodDesc} onChange={e => setProdDesc(e.target.value)} required />
                    </div>

                    {/* Variant configurations */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem' }}>Product Variations</h4>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => setProdVariants([...prodVariants, { sku: '', price: '', stock: '', color: '', size: '' }])}
                        >
                          + Add Variant
                        </button>
                      </div>

                      {prodVariants.map((v, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="SKU (Auto)" value={v.sku} onChange={e => {
                            const copy = [...prodVariants]; copy[i].sku = e.target.value; setProdVariants(copy);
                          }} />
                          <input type="number" step="0.01" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Price ($)" value={v.price} onChange={e => {
                            const copy = [...prodVariants]; copy[i].price = e.target.value; setProdVariants(copy);
                          }} required />
                          <input type="number" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Stock" value={v.stock} onChange={e => {
                            const copy = [...prodVariants]; copy[i].stock = e.target.value; setProdVariants(copy);
                          }} required />
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Color" value={v.color} onChange={e => {
                            const copy = [...prodVariants]; copy[i].color = e.target.value; setProdVariants(copy);
                          }} />
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Size" value={v.size} onChange={e => {
                            const copy = [...prodVariants]; copy[i].size = e.target.value; setProdVariants(copy);
                          }} />
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', color: 'var(--danger)' }}
                            onClick={() => setProdVariants(prodVariants.filter((_, idx) => idx !== i))}
                            disabled={prodVariants.length === 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowProductForm(false); setEditingProduct(null); }}>Cancel</button>
                      <button type="submit" className="btn btn-seller">Submit Listing</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products list */}
              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No items listed. Press "Add Product" to create your first listing.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Variants</th>
                        <th>Total Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(prod => {
                        const totalStock = prod.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                        return (
                          <tr key={prod._id}>
                            <td>
                              <strong>{prod.title}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.brand}</div>
                            </td>
                            <td>{prod.category?.name || 'N/A'}</td>
                            <td>{prod.variants?.length || 0} configurations</td>
                            <td>{totalStock} units</td>
                            <td>
                              <span className={`badge ${prod.isApproved ? 'badge-success' : 'badge-pending'}`}>
                                {prod.isApproved ? 'Approved' : 'Pending Review'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleOpenEditProduct(prod)}><Edit3 size={14} /></button>
                                <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDeleteProduct(prod._id)}><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS FULFILLMENT */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Fulfillment Tracker</h2>

              {updatingSubOrder && (
                <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Fulfill Sub-Order</h3>
                  
                  <form onSubmit={handleUpdateFulfillment}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Delivery Status</label>
                        <select className="form-control" value={shipStatus} onChange={e => setShipStatus(e.target.value)}>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Shipping Carrier</label>
                        <input type="text" className="form-control" placeholder="DHL, FedEx, UPS" value={shipCarrier} onChange={e => setShipCarrier(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tracking Number</label>
                        <input type="text" className="form-control" placeholder="TRACK123456" value={shipTracking} onChange={e => setShipTracking(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setUpdatingSubOrder(null)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Update Status</button>
                    </div>
                  </form>
                </div>
              )}

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No customer orders received yet.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order Ref</th>
                        <th>Buyer</th>
                        <th>Items Summary</th>
                        <th>Sub-Order Price</th>
                        <th>Fulfillment Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id}>
                          <td>
                            <strong>{o._id}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td>
                            <strong>{o.buyer?.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.buyer?.email}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              {o.subOrder.items.map((it, idx) => (
                                <div key={idx}>{it.title} (x{it.quantity})</div>
                              ))}
                            </div>
                          </td>
                          <td><strong>${o.subOrder.totalPrice.toFixed(2)}</strong></td>
                          <td>
                            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                              {o.subOrder.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => {
                                setUpdatingSubOrder({
                                  orderId: o._id,
                                  ...o.subOrder
                                });
                                setShipStatus(o.subOrder.status);
                                setShipCarrier(o.subOrder.carrier || '');
                                setShipTracking(o.subOrder.trackingNumber || '');
                              }}
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KYC & SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>KYC Information & Bank Accounts</h2>

              {kycSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {kycSuccess}
                </div>
              )}

              <form onSubmit={handleKycSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tax / PAN / EIN ID</label>
                    <input type="text" className="form-control" value={kycTaxId} onChange={e => setKycTaxId(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business License Reference</label>
                    <input type="text" className="form-control" value={kycLicense} onChange={e => setKycLicense(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Bank Entity Name</label>
                    <input type="text" className="form-control" value={kycBankName} onChange={e => setKycBankName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Routing / Transit</label>
                    <input type="text" className="form-control" value={kycAccount} onChange={e => setKycAccount(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Settlement UPI ID / Bank IBAN</label>
                    <input type="text" className="form-control" value={kycUpi} onChange={e => setKycUpi(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-seller" style={{ padding: '0.8rem 1.5rem' }}>
                  Save and Resubmit KYC Details
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
