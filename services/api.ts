import { Product, User, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

// Keys for LocalStorage
const PRODUCTS_KEY = 'charan_products';
const USERS_KEY = 'charan_users';
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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getStorage<User[]>(USERS_KEY, []);
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          // Remove password from user object before storing
          const userWithoutPassword: User = { ...user };
          delete userWithoutPassword.password;
          setStorage(CURRENT_USER_KEY, userWithoutPassword);
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500);
    });
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
      }
      return user;
  }
};

// --- Product Service ---
export const productService = {
  getAll: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = getStorage<Product[]>(PRODUCTS_KEY, []);
        if (products.length === 0) {
          // Seed initial data
          setStorage(PRODUCTS_KEY, INITIAL_PRODUCTS);
          resolve(INITIAL_PRODUCTS as unknown as Product[]);
        } else {
          resolve(products);
        }
      }, 500);
    });
  },

  add: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const products = getStorage<Product[]>(PRODUCTS_KEY, []);
    const newProduct = { ...product, id: Date.now().toString() };
    products.push(newProduct);
    setStorage(PRODUCTS_KEY, products);
    return newProduct;
  },

  update: async (product: Product): Promise<Product> => {
    const products = getStorage<Product[]>(PRODUCTS_KEY, []);
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
      setStorage(PRODUCTS_KEY, products);
      return product;
    }
    throw new Error('Product not found');
  },

  delete: async (id: string) => {
    const products = getStorage<Product[]>(PRODUCTS_KEY, []);
    const filtered = products.filter(p => p.id !== id);
    setStorage(PRODUCTS_KEY, filtered);
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