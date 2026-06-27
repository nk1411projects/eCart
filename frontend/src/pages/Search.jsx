import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { catalogAPI } from '../services/api';
import { Filter, RotateCcw, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State for products and search results
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalProducts: 0 });

  // Filter States synced with search params
  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = searchParams.get('page') || '1';

  // Local filter inputs (so slider doesn't hit server on every tick)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Sync local inputs if searchParams changes externally
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await catalogAPI.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when search params change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryStr = `?${searchParams.toString()}`;
        const res = await catalogAPI.getProducts(queryStr);
        setProducts(res.data || []);
        if (res.brands) setBrandsList(res.brands);
        if (res.pagination) setPagination(res.pagination);
      } catch (err) {
        console.error('Failed to fetch filtered products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchParams]);

  // Apply filters
  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    // Reset to page 1 on filter changes
    params.set('page', '1');

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    setSearchParams(params);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    
    if (localMinPrice) params.set('minPrice', localMinPrice);
    else params.delete('minPrice');

    if (localMaxPrice) params.set('maxPrice', localMaxPrice);
    else params.delete('maxPrice');

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const renderFiltersContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
          <Filter size={16} /> Filters
        </span>
        <span 
          onClick={handleClearFilters} 
          style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
        >
          <RotateCcw size={12} /> Reset
        </span>
      </div>

      {/* Categories filter */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>Category</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
          <div 
            onClick={() => handleFilterChange('category', '')}
            style={{
              fontSize: '0.85rem',
              color: selectedCategory === '' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: selectedCategory === '' ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            All Categories
          </div>
          {categories
            .filter(cat => cat.parent)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(cat => (
              <div 
                key={cat._id}
                onClick={() => handleFilterChange('category', cat.slug)}
                style={{
                  fontSize: '0.85rem',
                  color: selectedCategory === cat.slug ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: selectedCategory === cat.slug ? 600 : 400,
                  cursor: 'pointer',
                  paddingLeft: '0.5rem'
                }}
              >
                {cat.name}
              </div>
            ))}
        </div>
      </div>

      {/* Price filter */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>Price ($)</h4>
        <form onSubmit={handlePriceApply} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.4rem', alignItems: 'center' }}>
          <input 
            type="number" 
            className="form-control" 
            style={{ padding: '0.4rem', fontSize: '0.85rem' }} 
            placeholder="Min" 
            value={localMinPrice} 
            onChange={(e) => setLocalMinPrice(e.target.value)}
          />
          <input 
            type="number" 
            className="form-control" 
            style={{ padding: '0.4rem', fontSize: '0.85rem' }} 
            placeholder="Max" 
            value={localMaxPrice} 
            onChange={(e) => setLocalMaxPrice(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>Go</button>
        </form>
      </div>

      {/* Rating Filter */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>Minimum Rating</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[4, 3, 2, 1].map((r) => (
            <div 
              key={r}
              onClick={() => handleFilterChange('rating', r.toString())}
              style={{
                fontSize: '0.85rem',
                color: rating === r.toString() ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: rating === r.toString() ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              {'⭐'.repeat(r)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>& Up</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>
            {keyword ? `Search Results for "${keyword}"` : 'Browse Catalog'}
          </h1>
        </div>

        {/* Sorting & Filters Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Mobile Filters Dropdown Trigger (visible on mobile only) */}
          <div className="mobile-filters-trigger">
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
            >
              <MoreVertical size={16} /> Filters
            </button>
            {showMobileFilters && (
              <div className="mobile-filters-content glass-panel" style={{ display: 'block' }}>
                {renderFiltersContent()}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</span>
            <select 
              value={sort} 
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="form-control"
              style={{ width: '160px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Left Sidebar Filters (Desktop inline sidebar) */}
        <div className="dashboard-sidebar catalog-sidebar" style={{ borderRight: '1px solid var(--border-color)', paddingRight: '2rem' }}>
          {renderFiltersContent()}
        </div>

        {/* Right Product Grid */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-panel" style={{ height: '320px', background: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s infinite' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Products Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>We couldn't find anything matching your search filters.</p>
              <button className="btn btn-secondary" onClick={handleClearFilters}>Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
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
                      <span className="product-brand">{prod.brand}</span>
                      <h3 className="product-title" style={{ fontSize: '0.95rem' }}>{prod.title}</h3>
                      <div className="product-meta">
                        <span className="product-price">
                          ${prod.variants && prod.variants.length > 0 ? prod.variants[0].price.toFixed(2) : '0.00'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          ⭐ {prod.ratingsSummary?.averageRating.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    style={{ padding: '0.5rem' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                  </span>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    style={{ padding: '0.5rem' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
