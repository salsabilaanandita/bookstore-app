// lib/api.js - Robust Client for Bookstore Express API
export const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_API_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  '/api';

export function getValidToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pustaka_token') || null;
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getValidToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${API_URL}${cleanPath}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  if (res.status === 401 && typeof window !== 'undefined') {
    // If unauthorized, clean up invalid token without auto-login side effects
    localStorage.removeItem('pustaka_token');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
    register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password }, auth: false }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  books: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/books${query ? `?${query}` : ''}`, { auth: false });
    },
    get: (id) => request(`/books/${id}`, { auth: false }),
    create: (data) => request('/books', { method: 'POST', body: data }),
    update: (id, data) => request(`/books/${id}`, { method: 'PUT', body: data }),
    updateStock: (id, data) => request(`/books/${id}/stock`, { method: 'PATCH', body: data }),
    remove: (id) => request(`/books/${id}`, { method: 'DELETE' }),
  },

  categories: {
    list: () => request('/categories', { auth: false }),
    create: (data) => request('/categories', { method: 'POST', body: data }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  cart: {
    list: () => request('/cart'),
    add: (bookId, qty = 1) => request('/cart', { method: 'POST', body: { bookId, qty } }),
    updateQty: (bookId, qty) => request(`/cart/${bookId}`, { method: 'PATCH', body: { qty } }),
    remove: (bookId) => request(`/cart/${bookId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
  },

  wishlist: {
    list: () => request('/wishlist'),
    add: (bookId) => request('/wishlist', { method: 'POST', body: { bookId } }),
    remove: (bookId) => request(`/wishlist/${bookId}`, { method: 'DELETE' }),
  },

  orders: {
    checkout: (data) => request('/orders/checkout', { method: 'POST', body: data }),
    list: (status) => request(`/orders${status ? `?status=${status}` : ''}`),
    get: (id) => request(`/orders/${id}`),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  },

  library: {
    list: () => request('/library'),
    getProgress: (bookId) => request(`/library/${bookId}/progress`),
    saveProgress: (bookId, data) => request(`/library/${bookId}/progress`, { method: 'PUT', body: data }),
  },

  users: {
    list: () => request('/users'),
    update: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data }),
  },

  reports: {
    summary: () => request('/reports/summary'),
  },
};

// ==========================================
// Helper functions for all Frontend Pages
// ==========================================

// 1. Books Module
function normalizeBook(b) {
  if (!b) return b;
  let coverUrl = b.coverImage || b.cover || b.cover_url || b.image || '';
  if (coverUrl && typeof coverUrl === 'string' && (coverUrl.startsWith('/uploads') || coverUrl.startsWith('/covers') || coverUrl.startsWith('/images'))) {
    coverUrl = `http://localhost:4000${coverUrl}`;
  }
  return {
    ...b,
    coverImage: coverUrl,
    cover: coverUrl,
    coverColor: b.coverColor || b.color || '#2C3E50',
    color: b.color || b.coverColor || '#2C3E50',
    accentColor: b.accentColor || '#FF9900',
    description: b.description || b.synopsis || '',
    synopsis: b.synopsis || b.description || '',
    pages: Number(b.pages) || 200,
    price: Number(b.price) || 0,
    stock: Number(b.stock) || 0,
  };
}

export async function getBooks(params) {
  const res = await api.books.list(params);
  const rawList = Array.isArray(res) ? res : (res?.items || res?.books || res?.data || []);
  return rawList.map(normalizeBook);
}

export async function getBook(id) {
  const res = await api.books.get(id);
  const raw = res?.book || res?.data || res;
  return normalizeBook(raw);
}

export async function saveBook(data) {
  // Ensure category slug is provided
  let catSlug = data.category;
  if (!catSlug && data.categoryId) {
    const cats = await getCategories();
    const found = cats.find((c) => c.id === data.categoryId);
    if (found) catSlug = found.slug || found.name.toLowerCase().replace(/\s+/g, '-');
  }

  const coverSrc = data.coverImage || data.cover || data.cover_url || '';
  const colorVal = data.coverColor || data.color || '#2C3E50';

  const payload = {
    ...data,
    category: catSlug || 'general',
    cover: coverSrc,
    coverImage: coverSrc,
    cover_url: coverSrc,
    color: colorVal,
    coverColor: colorVal,
    price: Number(data.price) || 0,
    stock: Number(data.stock) || 0,
    pages: Number(data.pages) || 100,
  };

  if (data.id) {
    await api.books.update(data.id, payload);
  } else {
    await api.books.create(payload);
  }
  return getBooks();
}

export async function deleteBook(id) {
  await api.books.remove(id);
  return getBooks();
}

export async function updateStock(id, stock) {
  await api.books.updateStock(id, { stock: Number(stock) });
  return getBooks();
}

// 2. Categories Module
export async function getCategories() {
  const res = await api.categories.list();
  return Array.isArray(res) ? res : (res?.items || res?.categories || res?.data || []);
}

export async function saveCategory(data) {
  const payload = {
    name: data.name?.trim(),
    slug: data.slug?.trim() || data.name?.trim().toLowerCase().replace(/\s+/g, '-'),
  };

  if (data.id) {
    await api.categories.update(data.id, payload);
  } else {
    await api.categories.create(payload);
  }
  return getCategories();
}

export async function deleteCategory(id) {
  await api.categories.remove(id);
  return getCategories();
}

// 3. Orders Module
const ORDERS_KEY = 'pustaka_orders';

export async function getOrders(userId = null) {
  let localOrders = [];
  try {
    localOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {}

  const token = getValidToken();
  let backendOrders = [];
  if (token && token.includes('.')) {
    try {
      const res = await api.orders.list();
      backendOrders = Array.isArray(res) ? res : (res?.items || res?.orders || res?.data || []);
    } catch {}
  }

  const allMap = new Map();
  if (Array.isArray(localOrders)) {
    localOrders.forEach((o) => { if (o && o.id) allMap.set(o.id, o); });
  }
  if (Array.isArray(backendOrders)) {
    backendOrders.forEach((o) => { if (o && o.id) allMap.set(o.id, o); });
  }

  let combined = Array.from(allMap.values());
  if (userId) {
    combined = combined.filter((o) => !o.userId || o.userId === userId);
  }
  return combined.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
}

export async function createOrder(data) {
  const token = getValidToken();
  let serverOrder = null;

  if (token && token.includes('.') && data?.items?.length > 0) {
    try {
      // 1. Sync backend cart first so backend checkout has items
      await api.cart.clear().catch(() => {});
      for (const itm of data.items) {
        await api.cart.add(itm.bookId || itm.id, itm.quantity || itm.qty || 1).catch(() => {});
      }
      // 2. Perform backend checkout
      const res = await api.orders.checkout(data);
      serverOrder = res?.order || res?.data || res;
    } catch (e) {
      console.warn('Backend checkout fallback to local order:', e);
    }
  }

  // Final structured order object
  const finalOrder = serverOrder || {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    userId: data?.userId || 'usr-default',
    customerName: data?.customerName || 'Customer',
    items: data?.items || [],
    total: data?.total || 0,
    status: 'Pending',
    date: new Date().toISOString().slice(0, 10),
  };

  // Add all purchased books into user's Library Collections
  if (data?.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      if (item.bookId) {
        await addToLibrary(item.bookId);
      }
    }
  }

  // Save to local orders list
  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const updated = [finalOrder, ...(Array.isArray(existing) ? existing.filter((o) => o.id !== finalOrder.id) : [])];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  } catch {}

  return finalOrder;
}

export async function updateOrderStatus(id, status) {
  try {
    await api.orders.updateStatus(id, status);
  } catch {}

  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const updated = existing.map((o) => (o.id === id ? { ...o, status } : o));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  } catch {}

  return getOrders();
}

// 4. Users Module
export async function getUsers() {
  const res = await api.users.list().catch(() => []);
  return Array.isArray(res) ? res : (res?.items || res?.users || res?.data || []);
}

export async function updateUserRole(id, role, isActive) {
  await api.users.update(id, { role, isActive });
  return getUsers();
}

// 5. Reports & Analytics Module
export async function getReports() {
  const res = await api.reports.summary().catch(() => null);
  const books = await getBooks().catch(() => []);
  const orders = await getOrders().catch(() => []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyOrders = res?.dailySales || days.map((d) => ({
    day: d,
    count: orders.length > 0 ? Math.ceil(orders.length / 7) : 0,
    revenue: orders.filter((o) => o.status !== 'Cancelled').reduce((a, c) => a + (Number(c.total) || 0), 0),
  }));

  const categorySales = res?.salesByCategory || [];

  return {
    totalRevenue: res?.totalRevenue ?? orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0),
    totalOrders: res?.totalOrders ?? orders.length,
    pendingOrders: res?.ordersByStatus?.find((s) => s.status === 'Pending')?.count ?? orders.filter((o) => o.status === 'Pending').length,
    lowStockCount: books.filter((b) => (Number(b.stock) || 0) < 5).length,
    dailyOrders,
    categorySales,
  };
}

// 6. Wishlist, Library & Progress
const WISHLIST_KEY = 'pustaka_wishlist';
const LIBRARY_KEY = 'pustaka_library';

// Helper to broadcast storage events across components in the same window
function dispatchStorageEvent(eventName, detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

export async function getWishlist() {
  let localList = [];
  try {
    localList = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    if (!Array.isArray(localList)) localList = [];
  } catch {
    localList = [];
  }

  const token = getValidToken();
  if (token && token.includes('.')) {
    try {
      const res = await api.wishlist.list();
      const backendList = Array.isArray(res) ? res : (res?.items || res?.data || []);
      const mappedBackend = backendList.map((item) => (typeof item === 'string' ? item : item.bookId || item.id || item));
      if (mappedBackend.length > 0) {
        const merged = Array.from(new Set([...localList, ...mappedBackend]));
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      // Backend error/expired token; gracefully use localList
    }
  }

  return localList;
}

export async function toggleWishlist(bookId) {
  if (!bookId) return getWishlist();

  let localList = [];
  try {
    localList = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    if (!Array.isArray(localList)) localList = [];
  } catch {
    localList = [];
  }

  let updated;
  const isPresent = localList.some((id) => String(id) === String(bookId));
  if (isPresent) {
    updated = localList.filter((id) => String(id) !== String(bookId));
  } else {
    updated = [...localList, String(bookId)];
  }

  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    dispatchStorageEvent('pustaka_wishlist_updated', updated);
  } catch {}

  const token = getValidToken();
  if (token && token.includes('.')) {
    if (isPresent) {
      api.wishlist.remove(bookId).catch(() => {});
    } else {
      api.wishlist.add(bookId).catch(() => {});
    }
  }

  return updated;
}

export async function getLibrary() {
  let localList = [];
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) {
      localList = JSON.parse(raw);
    } else {
      // Seed with initial books so user has items in collection
      const books = await getBooks().catch(() => []);
      localList = books.slice(0, 3).map((b) => b.id);
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(localList));
    }
    if (!Array.isArray(localList)) localList = [];
  } catch {
    localList = [];
  }

  const token = getValidToken();
  if (token && token.includes('.')) {
    try {
      const res = await api.library.list();
      const backendList = Array.isArray(res) ? res : (res?.items || res?.data || []);
      const mapped = backendList.map((item) => (typeof item === 'string' ? item : item.bookId || item.id || item));
      if (mapped.length > 0) {
        const merged = Array.from(new Set([...localList, ...mapped]));
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch {}
  }

  return localList;
}

export async function addToLibrary(bookId) {
  if (!bookId) return getLibrary();

  let localList = [];
  try {
    localList = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
    if (!Array.isArray(localList)) localList = [];
  } catch {
    localList = [];
  }

  if (!localList.includes(String(bookId))) {
    localList.push(String(bookId));
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(localList));
    dispatchStorageEvent('pustaka_library_updated', localList);
  }

  return localList;
}

export async function getProgress(bookId = null) {
  if (bookId) {
    return api.library.getProgress(bookId).catch(() => null);
  }
  const lib = await api.library.list().catch(() => []);
  const list = Array.isArray(lib) ? lib : (lib?.items || []);
  return list
    .filter((item) => item.progress || item.currentPage)
    .map((item) => ({
      bookId: item.bookId || item.id,
      title: item.title,
      author: item.author,
      currentPage: item.currentPage || item.progress?.currentPage || 1,
      totalPages: item.totalPages || item.pages || 100,
      lastRead: item.lastRead || 'Recently',
      coverColor: item.coverColor,
      accentColor: item.accentColor,
      coverImage: item.coverImage,
    }));
}

export async function saveProgress(progressItem) {
  if (progressItem?.bookId) {
    await api.library.saveProgress(progressItem.bookId, progressItem).catch(() => null);
  }
  return getProgress();
}

export async function getAuthors() {
  const books = await getBooks();
  const map = new Map();
  books.forEach((b, idx) => {
    if (b.author && !map.has(b.author.toLowerCase())) {
      map.set(b.author.toLowerCase(), {
        id: b.authorId || `auth-${idx + 1}`,
        name: b.author,
        role: b.category || 'Author',
        booksCount: 1,
        bio: `Author of ${b.title}`,
      });
    } else if (b.author && map.has(b.author.toLowerCase())) {
      map.get(b.author.toLowerCase()).booksCount += 1;
    }
  });
  return Array.from(map.values());
}
