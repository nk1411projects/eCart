import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Store, Shield, Search, ChevronDown, UserPlus, LogIn, Sun, Moon } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header>
      <div className="nav-wrapper">
        {/* Brand Logo */}
        <div className="logo-container" onClick={() => navigate('/')}>
          eCart
        </div>

        {/* Dynamic Search Bar */}
        <form className="search-bar-container" onSubmit={handleSearchSubmit}>
          <Search size={16} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search products, brands, categories..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>

        {/* Navigation Links */}
        <div className="nav-links">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="nav-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/search" className="nav-link">Shop</Link>

          {/* Cart Icon */}
          <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {totalCartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--grad-primary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '50%'
              }}>
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* User Profile Area */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <div 
                className="nav-link" 
                onClick={() => setShowDropdown(!showDropdown)} 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <User size={18} />
                <span>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </div>

              {showDropdown && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '200px',
                  zIndex: 200,
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>
                    Signed in as <strong style={{ color: 'var(--text-primary)' }}>{user.role}</strong>
                  </div>

                  {user.role === 'customer' && (
                    <>
                      <Link to="/orders" className="sidebar-link" onClick={() => setShowDropdown(false)} style={{ padding: '0.5rem' }}>My Orders</Link>
                      <Link to="/profile" className="sidebar-link" onClick={() => setShowDropdown(false)} style={{ padding: '0.5rem' }}>My Addresses</Link>
                    </>
                  )}

                  {user.role === 'seller' && (
                    <Link to="/seller/dashboard" className="sidebar-link" onClick={() => setShowDropdown(false)} style={{ padding: '0.5rem' }}>
                      <Store size={16} /> Seller Portal
                    </Link>
                  )}

                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <Link to="/admin/dashboard" className="sidebar-link" onClick={() => setShowDropdown(false)} style={{ padding: '0.5rem' }}>
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}

                  <button 
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                      navigate('/');
                    }} 
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '0.4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <LogIn size={14} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <UserPlus size={14} /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
