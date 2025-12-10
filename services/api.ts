import { Product, User, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const API_BASE = 'http://localhost:4000';
const AUTH_API = 'http://localhost:8000/api/auth.php';
const CHAT_API = 'http://localhost:8000/api/chat.php';
const ORDERS_API = 'http://localhost:8000/api/orders.php';
const PRODUCTS_SYNC_KEY = 'charan_products_sync';
const CURRENT_USER_KEY = 'charan_current_user';

// --- Fetch helper that fails fast on non-2xx and bad JSON ---
const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}): ${text || 'Invalid JSON'}`);
  }
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
};

// --- Helpers ---
const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  return JSON.parse(stored);
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const broadcastProductsSync = () => {
  try {
    localStorage.setItem(PRODUCTS_SYNC_KEY, Date.now().toString());
  } catch (e) {
    console.warn('broadcastProductsSync failed:', e);
  }
};

// --- Order normalizer (snake_case -> camelCase) ---
const normalizeOrder = (raw: any): Order => {
  const items = Array.isArray(raw.items)
    ? raw.items
    : (Array.isArray(raw.items_json) ? raw.items_json : raw.items || []);

  const mappedItems = (items || []).map((it: any) => ({
    id: String(it.id ?? ''),
    quantity: Number(it.quantity ?? 0),
    price: Number(it.price ?? 0),
    offerPrice: it.offerPrice !== undefined ? Number(it.offerPrice) : undefined,
    name: it.name ?? it.product_name ?? '',
    image: it.image ?? it.product_image ?? '',
    category: (it.category as any) ?? '',
    scientificName: it.scientificName ?? '',
    stock: Number(it.stock ?? 0),
    origin: it.origin ?? '',
    description: it.description ?? '',
    isNew: Boolean(it.is_new ?? it.isNew ?? false),
  }));

  return {
    id: String(raw.id ?? ''),
    userId: String(raw.user_id ?? raw.userId ?? ''),
    userName: raw.user_name ?? raw.userName ?? '',
    userPhone: raw.user_phone ?? raw.userPhone ?? '',
    items: mappedItems,
    totalAmount: Number(raw.total_amount ?? raw.totalAmount ?? 0),
    status: raw.status ?? 'pending',
    date: raw.date ?? raw.created_at ?? raw.updated_at ?? new Date().toISOString()
  };
};

// --- Auth Service ---
export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    const data = await fetchJson(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const user: User = data.user;
    setStorage(CURRENT_USER_KEY, user);
    return user;
  },

  register: async (data: {
    username: string;
    password: string;
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<User> => {
    const { username, password, name = 'New User', phone = '', address = '' } = data;
    const result = await fetchJson(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        username,
        password,
        name,
        phone,
        address
      })
    });
    const user: User = result.user;
    setStorage(CURRENT_USER_KEY, user);
    return user;
  },

  sendOtp: async (phone: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`OTP sent to ${phone}: 1234`); // Mock OTP
        resolve(true);
      }, 800);
    });
  },

  verifyOtp: async (phone: string, otp: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '1234') {
          // Create a temp user in localStorage (demo-only OTP flow)
          const user: User = {
            id: Date.now().toString(),
            name: 'Guest User',
            phone,
            role: phone === '6302382280' ? 'admin' : 'customer',
            address: ''
          };
          setStorage(CURRENT_USER_KEY, user);
          resolve(user);
        } else {
          reject(new Error('Invalid OTP'));
        }
      }, 800);
    });
  },

  getCurrentUser: (): User | null => {
    return getStorage<User | null>(CURRENT_USER_KEY, null);
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  
  updateProfile: async (user: User): Promise<User> => {
      // In this demo, just update cached current user
      setStorage(CURRENT_USER_KEY, user);
      return user;
  }
};

// --- Product Service (json-server REST) ---
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  add: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to add product');
    const created = await res.json();
    broadcastProductsSync();
    return created;
  },

  update: async (product: Product): Promise<Product> => {
    const res = await fetch(`${API_BASE}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to update product');
    const updated = await res.json();
    broadcastProductsSync();
    return updated;
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    broadcastProductsSync();
  }
};

// --- Order Service ---
export const orderService = {
  create: async (order: Order): Promise<Order> => {
    const payload = {
      user_id: order.userId,
      user_name: order.userName,
      user_phone: order.userPhone,
      items: order.items,
      total_amount: order.totalAmount,
      status: order.status || 'pending'
    };
    const data = await fetchJson(ORDERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { ...order, id: data.order_id?.toString?.() || order.id };
  },

  getAll: async (): Promise<Order[]> => {
    const data = await fetchJson(`${ORDERS_API}?all=1&user_id=admin`);
    return (data.orders || []).map(normalizeOrder);
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const data = await fetchJson(`${ORDERS_API}?user_id=${encodeURIComponent(userId)}`);
    return (data.orders || []).map(normalizeOrder);
  },
  
  updateStatus: async (orderId: string, status: Order['status']) => {
      await fetchJson(ORDERS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status })
      });
  }
};

// --- Chat Service (PHP backend) ---
export const chatService = {
  getConversations: async () => {
    const res = await fetch(`${CHAT_API}?action=conversations`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  getMessages: async (userId: string) => {
    const res = await fetch(`${CHAT_API}?action=messages&userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  sendMessage: async (payload: {
    userId: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'customer';
    message: string;
  }) => {
    const res = await fetch(CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
};