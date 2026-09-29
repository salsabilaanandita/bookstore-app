// src/store/useCart.js
import { create } from 'zustand';

const CART_KEY = 'pustaka_cart';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load cart from localStorage:', e);
  }
  return [];
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
};

export const useCart = create((set, get) => ({
  items: loadCart(),
  
  addItem: (book, quantity = 1) => {
    const items = get().items;
    const existing = items.find(i => i.bookId === book.id);
    let nextItems;
    if (existing) {
      nextItems = items.map(i => i.bookId === book.id ? { ...i, quantity: i.quantity + quantity } : i);
    } else {
      nextItems = [...items, { bookId: book.id, book, price: book.price, quantity }];
    }
    saveCart(nextItems);
    set({ items: nextItems });
  },

  removeItem: (bookId) => {
    const nextItems = get().items.filter(i => i.bookId !== bookId);
    saveCart(nextItems);
    set({ items: nextItems });
  },

  updateQuantity: (bookId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(bookId);
      return;
    }
    const nextItems = get().items.map(i => i.bookId === bookId ? { ...i, quantity } : i);
    saveCart(nextItems);
    set({ items: nextItems });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  getTotalCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  
  getTotalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
}));

