export type Category = 'Freshwater' | 'Marine' | 'Exotic' | 'Tanks' | 'Food' | 'Accessories';

export interface Product {
  id: string;
  name: string;
  scientificName?: string;
  category: Category;
  price: number;
  offerPrice?: number;
  stock: number;
  origin: string;
  description: string;
  image: string;
  isNew?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'customer';
  address: string;
  username?: string;
  password?: string; // In production, this should never be stored in plain text
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'delivered';
  date: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Message {
  id: string;
  conversationId: string; // userId for user-admin chat
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'customer';
  message: string;
  timestamp: string;
  read: boolean;
}