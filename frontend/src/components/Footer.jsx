import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 1.5rem',
      marginTop: 'auto',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          background: 'var(--grad-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>eCart Marketplace</h3>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem', margin: '0.5rem 0', flexWrap: 'wrap' }}>
          <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Me</Link>
          <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Support Helpdesk</Link>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
          &copy; {new Date().getFullYear()} eCart Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
