import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Store, Mail, Lock } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // customer or seller
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerData = {
        name,
        email,
        password,
        role,
        ...(role === 'seller' ? { storeName, storeDescription } : {})
      };

      await register(registerData);
      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please review values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '1rem' }}>
      <div className="bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl dark:shadow-indigo-500/5 rounded-xl" style={{ maxWidth: '450px', width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Join eCart marketplace today.</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '0.8rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Join as a</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div 
                onClick={() => setRole('customer')}
                style={{
                  padding: '0.6rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderRadius: '0px',
                  borderColor: role === 'customer' ? 'var(--primary)' : 'var(--border-color)',
                  background: role === 'customer' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)'
                }}
              >
                <User size={18} style={{ color: role === 'customer' ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '0.2rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Customer</div>
              </div>
              <div 
                onClick={() => setRole('seller')}
                style={{
                  padding: '0.6rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderRadius: '0px',
                  borderColor: role === 'seller' ? 'var(--secondary)' : 'var(--border-color)',
                  background: role === 'seller' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'
                }}
              >
                <Store size={18} style={{ color: role === 'seller' ? 'var(--secondary)' : 'var(--text-secondary)', marginBottom: '0.2rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Seller</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
             <input
              type="text"
              className="form-control"
              style={{ background: 'transparent', borderBottom: '1px solid var(--border-color)', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 }}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
             <input
              type="email"
              className="form-control"
              style={{ background: 'transparent', borderBottom: '1px solid var(--border-color)', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 }}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
             <input
              type="password"
              className="form-control"
              style={{ background: 'transparent', borderBottom: '1px solid var(--border-color)', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Conditional Seller fields */}
          {role === 'seller' && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--secondary)' }}>Store Name</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ background: 'transparent', borderBottom: '1px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0 }}
                  placeholder="Gizmo Store"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--secondary)' }}>Store Description</label>
                <textarea
                  className="form-control"
                  style={{ background: 'transparent', borderBottom: '1px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0, resize: 'none' }}
                  rows={2}
                  placeholder="Tell us what you sell..."
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              marginTop: '0.5rem',
              background: role === 'seller' ? 'var(--grad-seller)' : 'var(--grad-primary)'
            }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Register
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
