import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogAPI } from '../services/api';
import { ShoppingBag, ArrowRight, Laptop, Smartphone, Headphones, Gamepad2, ShieldCheck, Truck, RefreshCw, Tablet, Watch, Tv } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      badge: "EXCLUSIVE LAUNCH",
      title: "Apple iPhone 15 Pro Max",
      description: "Supercharged by the A17 Pro chip. Aerospace-grade titanium design. Flat 10% discount on order subtotals over $50.",
      coupon: "WELCOME10",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format&fit=crop&q=80",
      buttonText: "Order iPhone Now",
      targetCategory: "smartphone"
    },
    {
      badge: "GAMING BLOWOUT",
      title: "Next-Gen Gaming: Sony PlayStation 5",
      description: "Experience lightning-fast loading speeds with an ultra-high speed SSD, deeper immersion, and stunning 4K visuals.",
      coupon: "ECART50",
      image: "https://images.unsplash.com/photo-1606813907291-d86edd9b94db?w=1600&auto=format&fit=crop&q=80",
      buttonText: "Explore Consoles",
      targetCategory: "gaming-console"
    },
    {
      badge: "PREMIUM AUDIO",
      title: "Immersive Sound: Bose Wireless Buds",
      description: "Bose SoundBlast buds feature active noise cancelling (ANC) and custom acoustic architecture. Claim your $50 flat discount.",
      coupon: "ECART50",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1600&auto=format&fit=crop&q=80",
      buttonText: "Shop Wireless Audio",
      targetCategory: "earbuds"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Fetch exactly 12 products from unique categories (3 rows of 4 cards)
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await catalogAPI.getProducts('?limit=250'); // fetch large batch to find unique category nodes
        
        const uniqueCategoryProducts = [];
        const seenCategories = new Set();
        
        if (res.data) {
          for (const prod of res.data) {
            const catId = prod.category?._id || prod.category;
            if (catId && !seenCategories.has(catId)) {
              seenCategories.add(catId);
              uniqueCategoryProducts.push(prod);
            }
            if (uniqueCategoryProducts.length >= 12) { // exactly 12 products
              break;
            }
          }
        }
        
        setProducts(uniqueCategoryProducts);
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Smartphones', slug: 'smartphone', icon: <Smartphone size={24} />, description: 'Mobile phones & accessories' },
    { name: 'Tablets', slug: 'tablet', icon: <Tablet size={24} />, description: 'Digital drawing & smart pads' },
    { name: 'Laptops', slug: 'laptop', icon: <Laptop size={24} />, description: 'High-performance computers' },
    { name: 'Smartwatches', slug: 'smartwatch', icon: <Watch size={24} />, description: 'Wearables & fitness bands' }
  ];

  return (
    <div>
      {/* Dynamic Hero Carousel Banner */}
      <div className="glass-panel" style={{
        backgroundImage: `linear-gradient(to right, rgba(10, 10, 15, 0.9) 35%, rgba(10, 10, 15, 0.5) 65%, rgba(10, 10, 15, 0.1) 100%), url(${slides[currentSlide].image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '3.5rem 3rem',
        borderRadius: '24px',
        marginBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        alignItems: 'flex-start',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-image 0.5s ease-in-out',
        minHeight: '360px'
      }}>
        {/* Decorative Circles */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          bottom: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          zIndex: 0
        }}></div>

        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', zIndex: 1 }}>
          {slides[currentSlide].badge}
        </span>
        <h1 style={{ fontSize: '3rem', lineHeight: 1.1, fontWeight: 800, color: 'white', maxWidth: '650px', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {slides[currentSlide].title}
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.1rem', maxWidth: '600px', zIndex: 1 }}>
          {slides[currentSlide].description}
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', zIndex: 1, marginTop: '0.5rem' }}>
          <button 
            className="btn" 
            onClick={() => navigate(`/search?category=${slides[currentSlide].targetCategory}`)}
            style={{ background: 'white', color: 'var(--primary)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
          >
            <ShoppingBag size={18} /> {slides[currentSlide].buttonText} <ArrowRight size={16} />
          </button>
          
          {slides[currentSlide].coupon && (
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Use coupon code: <strong style={{ color: 'white', border: '1px dashed white', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>{slides[currentSlide].coupon}</strong>
            </span>
          )}
        </div>

        {/* Bullet Slide Indicators */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.6rem',
          zIndex: 1
        }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: currentSlide === idx ? 'white' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.3s ease'
              }}
              aria-label={`Slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Browse Top Categories
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {categories.map((cat) => (
            <div 
              key={cat.slug} 
              className="glass-panel" 
              onClick={() => navigate(`/search?category=${cat.slug}`)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
                padding: '1.5rem'
              }}
            >
              <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                padding: '1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{cat.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Featured Listings</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Handpicked hardware products from distinct tech categories
            </p>
          </div>
          <span 
            onClick={() => navigate('/search')} 
            style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            View All <ArrowRight size={14} />
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="glass-panel" style={{ height: '350px', background: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <div 
                key={prod._id} 
                className="glass-panel product-card" 
                onClick={() => navigate(`/products/${prod._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image-container">
                  <img 
                    src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://placehold.co/400x300'} 
                    alt={prod.title} 
                    className="product-image"
                  />
                </div>
                <div className="product-info">
                  <span className="product-brand" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{prod.brand}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'none' }}>{prod.category?.name}</span>
                  </span>
                  <h3 className="product-title" style={{ fontSize: '0.95rem' }}>{prod.title}</h3>
                  <div className="product-meta">
                    <span className="product-price">
                      ${prod.variants && prod.variants.length > 0 ? prod.variants[0].price.toFixed(2) : '0.00'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      ⭐ {prod.ratingsSummary?.averageRating.toFixed(1) || '0.0'} ({prod.ratingsSummary?.totalReviews || 0})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust Highlights Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '2.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Truck size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Fast Global Shipping</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Free shipping on customer orders totaling over $100.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <ShieldCheck size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Secure Transactions</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Protected by multi-vendor order splitting and wallet escrows.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <RefreshCw size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Easy Returns</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Hassle-free return policy with dedicated seller communication.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
