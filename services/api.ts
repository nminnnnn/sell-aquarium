import { Product, User, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const API_BASE = 'http://localhost:4000';
const AUTH_API = 'http://localhost:8000/api/auth.php';
const CHAT_API = 'http://localhost:8000/api/chat.php';
const PRODUCTS_SYNC_KEY = 'charan_products_sync';
const ORDERS_KEY = 'charan_orders';
const CURRENT_USER_KEY = 'charan_current_user';

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

// --- Auth Service ---
export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    const res = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }
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
    const res = await fetch(AUTH_API, {
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
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Registration failed');
    }
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
    const orders = getStorage<Order[]>(ORDERS_KEY, []);
    orders.push(order);
    setStorage(ORDERS_KEY, orders);
    return order;
  },

  getAll: async (): Promise<Order[]> => {
    return getStorage<Order[]>(ORDERS_KEY, []);
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const orders = getStorage<Order[]>(ORDERS_KEY, []);
    return orders.filter(o => o.userId === userId);
  },
  
  updateStatus: async (orderId: string, status: Order['status']) => {
      const orders = getStorage<Order[]>(ORDERS_KEY, []);
      const order = orders.find(o => o.id === orderId);
      if(order) {
          order.status = status;
          setStorage(ORDERS_KEY, orders);
      }
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