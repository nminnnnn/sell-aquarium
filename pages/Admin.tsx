import React, { useState, useEffect } from 'react';
import { Plus, Package, ShoppingBag, Trash2, Edit2, X, Save, Search, Filter, MessageCircle } from 'lucide-react';
import { Product, Order, Category } from '../types';
import { productService, orderService } from '../services/api';
import { CATEGORIES } from '../constants';
import AdminChat from './AdminChat';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'chat'>('products');

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-deep to-brand-ocean text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold mb-1">Admin Dashboard</h1>
              <p className="text-white/80 text-sm">Manage products and orders</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'products' 
                    ? 'bg-white text-brand-deep shadow-lg' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Package className="inline mr-2 h-4 w-4" />
                Products
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'orders' 
                    ? 'bg-white text-brand-deep shadow-lg' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <ShoppingBag className="inline mr-2 h-4 w-4" />
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-white text-brand-deep shadow-lg' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <MessageCircle className="inline mr-2 h-4 w-4" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'chat' && <AdminChat />}
      </div>
    </div>
  );
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    scientificName: '',
    category: 'Freshwater',
    price: 0,
    offerPrice: undefined,
    stock: 0,
    origin: '',
    description: '',
    image: '',
    isNew: false
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      scientificName: '',
      category: 'Freshwater',
      price: 0,
      offerPrice: undefined,
      stock: 0,
      origin: '',
      description: '',
      image: '',
      isNew: false
    });
    setIsAdding(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      scientificName: product.scientificName || '',
      category: product.category,
      price: product.price,
      offerPrice: product.offerPrice,
      stock: product.stock,
      origin: product.origin,
      description: product.description,
      image: product.image,
      isNew: product.isNew || false
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.stock === undefined) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...editingProduct,
          ...formData,
          id: editingProduct.id
        };
        await productService.update(updatedProduct);
      } else {
        // Add new product
        await productService.add(formData as Omit<Product, 'id'>);
      }
      resetForm();
      await loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await productService.delete(id);
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-initial md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
              />
            </div>
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="bg-gradient-to-r from-brand-cyan to-brand-ocean text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-brand-cyan">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Scientific Name
                </label>
                <input
                  type="text"
                  value={formData.scientificName || ''}
                  onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Offer Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.offerPrice || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    offerPrice: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Origin
                </label>
                <input
                  type="text"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isNew"
                checked={formData.isNew || false}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4 text-brand-cyan border-gray-300 rounded focus:ring-brand-cyan"
              />
              <label htmlFor="isNew" className="text-sm font-medium text-gray-700">
                Mark as New Arrival
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-brand-cyan to-brand-ocean text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading && !isAdding ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image || 'https://via.placeholder.com/60'} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          {product.scientificName && (
                            <div className="text-xs text-gray-500 italic">{product.scientificName}</div>
                          )}
                        </div>
                        {product.isNew && (
                          <span className="px-2 py-0.5 bg-brand-accent text-white text-xs font-bold rounded-full">NEW</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-brand-light text-brand-ocean rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {product.offerPrice ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">₹{product.price.toLocaleString()}</span>
                            <span className="text-brand-accent">₹{product.offerPrice.toLocaleString()}</span>
                          </>
                        ) : (
                          `₹${product.price.toLocaleString()}`
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        product.stock > 10 ? 'text-green-600' : 
                        product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-brand-cyan hover:bg-brand-light rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredProducts.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}
    </div>
  );
};

const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const lastCountRef = React.useRef(0);

  useEffect(() => {
    loadOrders();
  }, []);

  // Sync when new orders come in (storage event + polling)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'charan_orders_sync') {
        loadOrders();
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(loadOrders, 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll();
      setOrders(data);
      // Detect new orders compared to last loaded count
      if (data.length > lastCountRef.current) {
        setNewOrdersCount(data.length - lastCountRef.current);
      }
      lastCountRef.current = data.length;
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    setLoading(true);
    try {
      await orderService.updateStatus(id, status);
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {newOrdersCount > 0 && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex justify-between items-center">
          <span> Có {newOrdersCount} đơn hàng mới. </span>
          <button
            onClick={() => setNewOrdersCount(0)}
            className="text-green-700 font-semibold hover:underline"
          >
            Đã xem
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <p className="text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.userName} • {order.userPhone}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.date || (order as any).created_at || (order as any).updated_at || Date.now()).toLocaleString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
                  order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                  order.status === 'delivered' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-700">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-brand-ocean">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'paid')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                  >
                    Mark as Paid
                  </button>
                )}
                {order.status === 'paid' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
