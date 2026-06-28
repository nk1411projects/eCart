const BASE_URL = 'https://ecart-nrou.onrender.com/api/v1';

const request = async (url, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important to allow cookie validation for refresh tokens
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    throw error;
  }
};

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  addAddress: (body) => request('/auth/address', { method: 'POST', body: JSON.stringify(body) }),
  deleteAddress: (id) => request(`/auth/address/${id}`, { method: 'DELETE' }),
};

export const catalogAPI = {
  getCategories: () => request('/categories'),
  getProducts: (params = '') => request(`/products${params}`),
  getProductById: (id) => request(`/products/${id}`),
  createReview: (id, body) => request(`/products/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
};

export const cartAPI = {
  getCart: () => request('/cart'),
  updateCart: (items) => request('/cart', { method: 'POST', body: JSON.stringify({ items }) }),
};

export const ordersAPI = {
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getUserOrders: () => request('/orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  cancelOrder: (id, subOrderId = null) => request(`/orders/${id}/cancel`, { 
    method: 'PUT', 
    body: JSON.stringify({ subOrderId }) 
  }),
};

export const sellerAPI = {
  getDashboard: () => request('/seller/dashboard'),
  getOrders: () => request('/seller/orders'),
  updateOrderStatus: (orderId, body) => request(`/seller/orders/${orderId}/status`, { 
    method: 'PUT', 
    body: JSON.stringify(body) 
  }),
  submitKyc: (body) => request('/seller/kyc', { method: 'PUT', body: JSON.stringify(body) }),
  
  // Product CRUD
  getProducts: () => request('/seller/products'),
  createProduct: (body) => request('/seller/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/seller/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/seller/products/${id}`, { method: 'DELETE' }),
};

export const adminAPI = {
  getDashboard: () => request('/admin/dashboard'),
  getPendingSellers: () => request('/admin/sellers/pending'),
  getAllSellers: () => request('/admin/sellers'),
  verifySellerKyc: (id, body) => request(`/admin/sellers/${id}/kyc`, { method: 'PUT', body: JSON.stringify(body) }),
  
  getAllUsers: () => request('/admin/users'),
  toggleUserSuspension: (id, body) => request(`/admin/users/${id}/suspend`, { 
    method: 'PUT', 
    body: JSON.stringify(body) 
  }),
  
  getCoupons: () => request('/admin/coupons'),
  createCoupon: (body) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(body) }),
  getAuditLogs: () => request('/admin/audit-logs'),
};

export const supportAPI = {
  submitContactForm: (body) => request('/support/contact', { method: 'POST', body: JSON.stringify(body) }),
};

