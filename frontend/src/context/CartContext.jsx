import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Load cart on mount or when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const res = await cartAPI.getCart();
          setCartItems(res.data.items || []);
        } catch (err) {
          console.error('Error fetching server cart', err);
        }
      } else {
        // Load from LocalStorage for guest users
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // 2. Sync cart to LocalStorage/Server on cart change
  const syncCart = async (newItems) => {
    setCartItems(newItems);
    if (user) {
      try {
        await cartAPI.updateCart(newItems.map(item => ({
          product: item.product._id || item.product,
          variantId: item.variantId,
          quantity: item.quantity
        })));
      } catch (err) {
        console.error('Error syncing cart to server', err);
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
  };

  const addToCart = (product, variantId, quantity = 1) => {
    const existingIndex = cartItems.findIndex(
      item => (item.product._id === product._id || item.product === product._id) && item.variantId === variantId
    );

    let newItems = [...cartItems];
    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ product, variantId, quantity });
    }

    syncCart(newItems);
  };

  const removeFromCart = (productId, variantId) => {
    const newItems = cartItems.filter(
      item => !( (item.product._id === productId || item.product === productId) && item.variantId === variantId )
    );
    syncCart(newItems);
  };

  const updateQuantity = (productId, variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    const newItems = cartItems.map(item => {
      if ((item.product._id === productId || item.product === productId) && item.variantId === variantId) {
        return { ...item, quantity };
      }
      return item;
    });

    syncCart(newItems);
  };

  const clearCart = () => {
    syncCart([]);
    setCoupon(null);
    if (!user) {
      localStorage.removeItem('cart');
    }
  };

  // Helper Calculations
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      // Find variant price if product model is populated
      if (item.product && item.product.variants) {
        const variant = item.product.variants.find(v => v._id === item.variantId || v.sku === item.variantId);
        const price = variant ? variant.price : (item.product.price || 0);
        return sum + (price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const getDiscountAmount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    if (subtotal < coupon.minOrderValue) return 0;
    
    if (coupon.discountType === 'percentage') {
      return (coupon.discountAmount / 100) * subtotal;
    }
    return coupon.discountAmount;
  };

  const getTax = () => {
    const taxableAmount = Math.max(0, getSubtotal() - getDiscountAmount());
    return taxableAmount * 0.05; // 5% flat tax
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0 || subtotal > 100) return 0; // Free shipping over $100
    return 10.00; // Flat $10 shipping
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const tax = getTax();
    const shipping = getShipping();
    return Math.max(0, (subtotal - discount) + tax + shipping);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      coupon,
      loading,
      setCoupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getSubtotal,
      getDiscountAmount,
      getTax,
      getShipping,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
