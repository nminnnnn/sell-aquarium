import { Product, User, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const PRODUCTS_API_BASE = 'http://localhost:4000';
const AUTH_API_BASE = 'http://localhost:8000/api';
const CHAT_API_BASE = 'http://localhost:8000/api/chat.php';
const PRODUCTS_SYNC_KEY = 'charan_products_sync';
const USERS_KEY = 'charan_users'; // legacy local users (kept for backward compat)
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

// --- Chat Service (uses PHP backend) ---
export const chatService = {
  getMessages: async (conversationId: string) => {
    const res = await fetch(`${CHAT_API_BASE}?conversationId=${encodeURIComponent(conversationId)}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load messages');
    return data.messages as any[];
  },
  getAllMessages: async () => {
    const res = await fetch(`${CHAT_API_BASE}?all=1`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load all messages');
    return data.messages as any[];
  },
  sendMessage: async (payload: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'customer';
    message: string;
  }) => {
    const res = await fetch(CHAT_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send message');
    return data.message as any;
  }
};

// --- Initialize Default Users ---
const initializeUsers = (): User[] => {
  const existing = getStorage<User[]>(USERS_KEY, []);
  if (existing.length > 0) return existing; // Don't overwrite if users exist
  
  const defaultUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      phone: '6302382280',
      role: 'admin',
      address: 'Tata Nagar, Tirupati - 517501',
      username: 'admin',
      password: 'admin123' // In production, this should be hashed
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      phone: '9876543210',
      role: 'customer',
      address: 'SV Nagar, Tirupati',
      username: 'rajesh',
      password: 'rajesh123'
    },
    {
      id: '3',
      name: 'Priya Sharma',
      phone: '9876543211',
      role: 'customer',
      address: 'TP Area, Tirupati',
      username: 'priya',
      password: 'priya123'
    },
    {
      id: '4',
      name: 'Amit Patel',
      phone: '9876543212',
      role: 'customer',
      address: 'Renigunta Road, Tirupati',
      username: 'amit',
      password: 'amit123'
    },
    {
      id: '5',
      name: 'Sneha Reddy',
      phone: '9876543213',
      role: 'customer',
      address: 'Alipiri, Tirupati',
      username: 'sneha',
      password: 'sneha123'
    }
  ];
  
  setStorage(USERS_KEY, defaultUsers);
  return defaultUsers;
};

// Initialize users on first load
initializeUsers();

// --- Auth Service ---
export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    const res = await fetch(`${AUTH_API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid username or password');
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
    if (!username.trim() || !password.trim()) {
      throw new Error('Username and password are required');
    }

    const users = getStorage<User[]>(USERS_KEY, []);
    const exists = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
    if (exists) throw new Error('Username already exists');

    const newUser: User = {
      id: Date.now().toString(),
      name,
      phone,
      address,
      role: 'customer',
      username: username.trim(),
      password
    };

    users.push(newUser);
    setStorage(USERS_KEY, users);

    const userWithoutPassword: User = { ...newUser };
    delete userWithoutPassword.password;
    setStorage(CURRENT_USER_KEY, userWithoutPassword);
    return userWithoutPassword;
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
          // Check if user exists, else register
          const users = getStorage<User[]>(USERS_KEY, []);
          let user = users.find(u => u.phone === phone);

          if (!user) {
            // New User Registration
            user = {
              id: Date.now().toString(),
              name: 'Guest User', // To be updated by profile
              phone,
              role: phone === '6302382280' ? 'admin' : 'customer', // Admin backdoor for demo
              address: ''
            };
            users.push(user);
            setStorage(USERS_KEY, users);
          }
          
          // Remove password from user object before storing
          const userWithoutPassword: User = { ...user };
          delete userWithoutPassword.password;
          setStorage(CURRENT_USER_KEY, userWithoutPassword);
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid OTP'));
        }
      }, 800);
    });
  },

  register: async (payload: {
    username: string;
    password: string;
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<User> => {
    const res = await fetch(`${AUTH_API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', ...payload })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }
    const user: User = data.user;
    setStorage(CURRENT_USER_KEY, user);
    return user;
  },

  getCurrentUser: (): User | null => {
    return getStorage<User | null>(CURRENT_USER_KEY, null);
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  
  updateProfile: async (user: User): Promise<User> => {
      const users = getStorage<User[]>(USERS_KEY, []);
      const index = users.findIndex(u => u.id === user.id);
      if(index !== -1) {
          users[index] = user;
          setStorage(USERS_KEY, users);
          setStorage(CURRENT_USER_KEY, user);
      } else {
          // If user not in local legacy store, just update current session
          setStorage(CURRENT_USER_KEY, user);
      }
      return user;
  }
};

// --- Product Service (json-server REST) ---
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const res = await fetch(`${PRODUCTS_API_BASE}/products`);
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