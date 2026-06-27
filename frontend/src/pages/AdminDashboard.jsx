import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Shield, Users, Store, Award, Percent, DollarSign, Check, X, Ban, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, sellers, users, coupons, audits

  // API Data
  const [stats, setStats] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states (Coupon Campaign)
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState('percentage');
  const [coupVal, setCoupVal] = useState('');
  const [coupMin, setCoupMin] = useState('');
  const [coupStart, setCoupStart] = useState('');
  const [coupEnd, setCoupEnd] = useState('');
  const [coupLimit, setCoupLimit] = useState('');

  // Seller commission change
  const [selectedSellerComm, setSelectedSellerComm] = useState({});

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminAPI.getDashboard();
      setStats(statsRes.stats);

      const pendingRes = await adminAPI.getPendingSellers();
      setPendingSellers(pendingRes.data || []);

      const sellersRes = await adminAPI.getAllSellers();
      setAllSellers(sellersRes.data || []);

      const usersRes = await adminAPI.getAllUsers();
      setUsers(usersRes.data || []);

      const couponsRes = await adminAPI.getCoupons();
      setCoupons(couponsRes.data || []);

      const auditsRes = await adminAPI.getAuditLogs();
      setAuditLogs(auditsRes.data || []);

      // Init commission configs local inputs mapping
      const commMap = {};
      sellersRes.data?.forEach(s => {
        commMap[s._id] = (s.commissionRate * 100).toString();
      });
      setSelectedSellerComm(commMap);
    } catch (err) {
      console.error('Failed to retrieve administrative records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyKYC = async (id, status) => {
    const commRatePercentage = selectedSellerComm[id] ? Number(selectedSellerComm[id]) : 10;
    const commRate = commRatePercentage / 100;

    if (!window.confirm(`Are you sure you want to mark this application as ${status}?`)) return;

    try {
      await adminAPI.verifySellerKyc(id, { status, commissionRate: commRate });
      alert(`Seller application marked as ${status}`);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Verification update failed.');
    }
  };

  const handleToggleSuspension = async (id, currentStatus) => {
    const confirmMsg = currentStatus 
      ? 'Are you sure you want to suspend this customer?' 
      : 'Are you sure you want to lift this suspension?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await adminAPI.toggleUserSuspension(id, { isActive: !currentStatus });
      alert('User suspension status toggled.');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Suspension toggle failed.');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCoupon({
        code: coupCode,
        discountType: coupType,
        discountAmount: Number(coupVal),
        minOrderValue: Number(coupMin || 0),
        startDate: coupStart,
        endDate: coupEnd,
        maxUses: coupLimit ? Number(coupLimit) : undefined
      });
      alert('Promo code campaign launched!');
      setShowCouponForm(false);
      loadAdminData();

      // Clear inputs
      setCoupCode('');
      setCoupVal('');
      setCoupMin('');
      setCoupStart('');
      setCoupEnd('');
      setCoupLimit('');
    } catch (err) {
      alert(err.message || 'Failed to generate promotional code.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>Opening system core ledger...</div>;
  }

  return (
    <div>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} style={{ color: 'var(--warning)' }} /> Platform Administration
          </h1>
        </div>
      </div>

      <div className="dashboard-layout" style={{ gridTemplateColumns: '240px 1fr', gap: '2.5rem' }}>
        {/* Navigation Sidebar */}
        <div className="dashboard-sidebar" style={{ borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
          <div 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={18} /> Diagnostics
          </div>
          <div 
            className={`sidebar-link ${activeTab === 'sellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellers')}
          >
            <Store size={18} /> Sellers Approvals
          </div>
          <div 
            className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Customer Accounts
          </div>
          <div 
            className={`sidebar-link ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <Percent size={18} /> Coupon Engine
          </div>
          <div 
            className={`sidebar-link ${activeTab === 'audits' ? 'active' : ''}`}
            onClick={() => setActiveTab('audits')}
          >
            <Shield size={18} /> Audit Ledger
          </div>
        </div>

        {/* Action Panel Display */}
        <div style={{ minHeight: '60vh', paddingLeft: '0.5rem' }}>
          
          {/* TAB 1: DIAGNOSTICS STATS */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>Global KPIs Overview</h2>
              
              <div className="stats-grid">
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--grad-admin)', borderRadius: '8px' }}>
                  <div className="stat-title" style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}><DollarSign size={14} /> Gross GMV</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)', color: 'white' }}>${stats.platformGmv.toFixed(2)}</div>
                </div>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><DollarSign size={14} /> Platform Profit</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)', color: 'var(--secondary)' }}>${stats.commissionEarnings.toFixed(2)}</div>
                </div>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Users size={14} /> Total Buyers</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)' }}>{stats.totalUsersCount}</div>
                </div>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Store size={14} /> Registered Stores</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.4rem', fontFamily: 'var(--font-heading)' }}>{stats.totalSellersCount}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SELLER KYC APPROVALS */}
          {activeTab === 'sellers' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Pending KYC Verification Approvals</h2>

              {pendingSellers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No pending seller registrations. All vendors are current.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Store Name</th>
                        <th>Owner Email</th>
                        <th>Tax / PAN ID</th>
                        <th>License ID</th>
                        <th>Commission Rate (%)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSellers.map(s => (
                        <tr key={s._id}>
                          <td><strong>{s.storeName}</strong></td>
                          <td>{s.user?.email}</td>
                          <td><code>{s.kycDetails?.taxId || 'N/A'}</code></td>
                          <td><code>{s.kycDetails?.businessLicense || 'N/A'}</code></td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: '80px', padding: '0.3rem' }}
                              value={selectedSellerComm[s._id] || '10'}
                              onChange={(e) => {
                                setSelectedSellerComm({ ...selectedSellerComm, [s._id]: e.target.value });
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--secondary)' }} onClick={() => handleVerifyKYC(s._id, 'approved')}><Check size={16} /></button>
                              <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleVerifyKYC(s._id, 'rejected')}><X size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h2 style={{ fontSize: '1.3rem', marginTop: '2.5rem', marginBottom: '1rem' }}>Active Platforms Vendors</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Store Name</th>
                      <th>Owner Email</th>
                      <th>Commission (%)</th>
                      <th>KYC Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSellers.map(s => (
                      <tr key={s._id}>
                        <td><strong>{s.storeName}</strong></td>
                        <td>{s.user?.email}</td>
                        <td><strong>{(s.commissionRate * 100).toFixed(0)}%</strong></td>
                        <td>
                          <span className={`badge ${s.kycStatus === 'approved' ? 'badge-success' : 'badge-pending'}`}>
                            {s.kycStatus.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER MANAGEMENT */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Customer Profile Registrations</h2>

              {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No customer registrations.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Email Address</th>
                        <th>Wallet Balance</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>${u.walletBalance.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                              {u.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-secondary" 
                              style={{ 
                                padding: '0.4rem 0.8rem', 
                                fontSize: '0.75rem', 
                                color: u.isActive ? 'var(--danger)' : 'var(--secondary)',
                                borderColor: u.isActive ? 'var(--danger)' : 'var(--secondary)'
                              }}
                              onClick={() => handleToggleSuspension(u._id, u.isActive)}
                            >
                              <Ban size={12} /> {u.isActive ? 'Suspend' : 'Unsuspend'}
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

          {/* TAB 4: COUPON CAMPAIGNS ENGINE */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.3rem' }}>Promo Code Campaigns</h2>
                <button className="btn btn-primary" onClick={() => setShowCouponForm(!showCouponForm)}>
                  + Launch Campaign
                </button>
              </div>

              {showCouponForm && (
                <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>New Promo Setup</h3>
                  
                  <form onSubmit={handleCreateCoupon}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Coupon Code (Uppercase)</label>
                        <input type="text" className="form-control" placeholder="SUMMER50" value={coupCode} onChange={e => setCoupCode(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount Type</label>
                        <select className="form-control" value={coupType} onChange={e => setCoupType(e.target.value)}>
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount Value</label>
                        <input type="number" className="form-control" value={coupVal} onChange={e => setCoupVal(e.target.value)} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Min Purchase Requirement</label>
                        <input type="number" className="form-control" value={coupMin} onChange={e => setCoupMin(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Max Uses Limit</label>
                        <input type="number" className="form-control" value={coupLimit} onChange={e => setCoupLimit(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-control" value={coupStart} onChange={e => setCoupStart(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Expiration Date</label>
                        <input type="date" className="form-control" value={coupEnd} onChange={e => setCoupEnd(e.target.value)} required />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowCouponForm(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Launch Campaign</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Coupon list */}
              {coupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No coupons created yet.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Min Purchase</th>
                        <th>Total Uses</th>
                        <th>Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(c => (
                        <tr key={c._id}>
                          <td><code><strong>{c.code}</strong></code></td>
                          <td>{c.discountType.toUpperCase()}</td>
                          <td><strong>{c.discountType === 'percentage' ? `${c.discountAmount}%` : `$${c.discountAmount}`}</strong></td>
                          <td>${c.minOrderValue}</td>
                          <td>{c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : ''}</td>
                          <td>{new Date(c.endDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY AUDITS LEDGER */}
          {activeTab === 'audits' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Administrative Audit Trail</h2>

              {auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No administrative audits logged.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Action Log</th>
                        <th>Entity</th>
                        <th>Administrator</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(l => (
                        <tr key={l._id}>
                          <td>
                            <strong>{l.action.toUpperCase().replace(/_/g, ' ')}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {l.details ? JSON.stringify(l.details) : 'No details'}
                            </div>
                          </td>
                          <td>{l.entityName} (<code>{l.entityId || 'N/A'}</code>)</td>
                          <td>{l.actor?.name || 'Admin'} ({l.actor?.email})</td>
                          <td><code>{l.ipAddress}</code></td>
                          <td>{new Date(l.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
