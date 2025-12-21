import React, { useState, useEffect } from 'react';
import { Trash2, MessageCircle, Plus, Minus, Loader, Phone, Heart } from 'lucide-react';
import { useApp } from '../context';
import { STORE_DETAILS } from '../constants';
import { orderService, shippingService, favoriteService } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import AddressForm, { AddressDetails } from '../components/AddressForm';

const Cart = () => {
  const { cart, removeFromCart, addToCart, cartTotal, auth, clearCart } = useApp();
  // Start with empty address - user must enter shipping address for each order
  const [address, setAddress] = useState('');
  // User must re-enter phone number for each order
  const [phone, setPhone] = useState('');
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingDistance, setShippingDistance] = useState<number | null>(null);
  const [shippingDuration, setShippingDuration] = useState<number | null>(null);
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const paymentsEnabled = true; // enable checkout with instant confirmation
  
  // Google Maps API Key (optional - leave empty to use fallback)
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  const grandTotal = cartTotal + shippingCost;

  // Load favorites
  useEffect(() => {
    if (auth.user?.id) {
      favoriteService.getFavorites(auth.user.id).then(favs => {
        setFavorites(new Set(favs));
      }).catch(err => {
        console.error('Failed to load favorites:', err);
      });
    }
  }, [auth.user?.id]);

  const handleToggleFavorite = async (productId: string) => {
    if (!auth.user?.id) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }
    const isFavorited = favorites.has(productId);
    try {
      await favoriteService.toggleFavorite(auth.user.id, productId, isFavorited);
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Không thể thêm vào yêu thích. Vui lòng thử lại.');
    }
  };

  const calculateShipping = async () => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setShippingCost(0);
      return;
    }

    console.log('🚀 Starting shipping calculation for:', trimmedAddress);
    setIsCalculatingShipping(true);
    try {
      const result = await shippingService.calculateShipping(address.trim());
      console.log('📦 Shipping calculation result:', {
        cost: result.shippingCost,
        distance: result.distance,
        duration: result.duration,
        method: result.calculationMethod
      });
      
      setShippingCost(result.shippingCost);
      setShippingDistance(result.distance !== undefined ? result.distance : null);
      setShippingDuration(result.duration !== undefined ? result.duration : null);
      
      if (result.calculationMethod === 'fallback') {
        console.warn('⚠️ Using fallback calculation - OpenStreetMap may have failed');
      }
    } catch (error) {
      console.error('Failed to calculate shipping:', error);
      // Don't set default cost - let user see 0 or previous value
      // API should always return a response, even if fallback
      console.warn('Shipping calculation failed, check backend logs');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Calculate shipping cost when address changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedAddress = address.trim();
      // Require at least 5 characters to calculate (enough for basic address like "123 ABC")
      if (trimmedAddress.length >= 5) {
        calculateShipping();
      } else if (trimmedAddress.length > 0) {
        // Clear cost if address is too short
        setShippingCost(0);
        setShippingDistance(null);
        setShippingDuration(null);
      }
    }, 800); // Debounce 800ms (reduced from 1000ms for faster response)

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleAddressDetailsChange = (details: AddressDetails) => {
    setAddressDetails(details);
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      if (item.quantity + delta > 0) {
        addToCart(item, delta);
      } else {
        removeFromCart(id);
      }
    }
  };

  const handleCheckout = async () => {
    if (!auth.user) {
      alert('Please login to continue');
      window.location.hash = '#/login';
      return;
    }

    if (cart.length === 0) return;

    if (!address.trim()) {
      alert('Please enter the shipping address');
      return;
    }

    // Validate phone number
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      alert('Please enter the phone number');
      return;
    }
    // Basic phone validation (at least 10 digits)
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Phone number is not valid. Please enter at least 10 digits');
      return;
    }

    // 1. Create Order in Backend
    const newOrder = {
      id: Date.now().toString(),
      userId: auth.user.id,
      userName: auth.user.name,
      userPhone: trimmedPhone,
      items: cart,
      totalAmount: grandTotal,
      shippingAddress: address.trim(),
      shippingCost: shippingCost,
      status: 'paid' as const, // tạm xác nhận thành công
      date: new Date().toISOString()
    };

    await orderService.create(newOrder);

    // 3. Clear Cart
    clearCart();

    // 4. Show success (no redirect)
    alert('Order placed successfully! We will contact you to confirm.');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p>Go to the shop to add some fishes!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 relative">
              {/* Heart icon ở góc trên bên phải của card */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorite(item.id);
                }}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-lg z-20 transition-all ${
                  favorites.has(item.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-gray-400 hover:bg-white hover:text-red-500 border-2 border-gray-300'
                }`}
                title={favorites.has(item.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart className={`h-5 w-5 ${favorites.has(item.id) ? 'fill-current' : ''}`} strokeWidth={2.5} />
              </button>
              
              <div className="relative flex-shrink-0">
                <img src={getImageUrl(item.image)} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-gray-500 text-sm">{item.category}</p>
                <div className="font-bold text-brand-cyan mt-1">₹{item.offerPrice || item.price}</div>
              </div>

              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus size={16} /></button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus size={16} /></button>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-500 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Summary */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Cost</span>
              <span>{cartTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping cost</span>
              <div className="flex items-center gap-2">
                {isCalculatingShipping ? (
                  <Loader className="h-4 w-4 animate-spin text-brand-cyan" />
                ) : (
                  <span>{shippingCost > 0 ? `${shippingCost.toLocaleString('vi-VN')} ₫` : 'Not calculated'}</span>
                )}
              </div>
            </div>
            {shippingDistance !== null && shippingDistance !== undefined && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Khoảng cách</span>
                <span>{shippingDistance} km</span>
              </div>
            )}
            {shippingDuration !== null && shippingDuration !== undefined && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Thời gian dự kiến</span>
                <span>{shippingDuration} phút</span>
              </div>
            )}
            {shippingDistance === null && shippingCost > 0 && (
              <div className="flex justify-between text-xs text-orange-600 italic">
                <span>⚠️ Đang dùng phí ước tính</span>
              </div>
            )}
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-cyan">{grandTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number (e.g. 0901234567)"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all outline-none text-gray-900 placeholder-gray-400"
                required
              />
            </div>
            {phone.trim().length > 0 && phone.trim().replace(/\D/g, '').length < 10 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Phone number must be at least 10 digits
              </p>
            )}
          </div>

          <div className="mb-4">
            <AddressForm
              value={address}
              onChange={setAddress}
              onAddressDetailsChange={handleAddressDetailsChange}
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            />
            <p className="text-xs text-gray-500 mt-2">
              Shipping cost will be calculated automatically based on the distance from the store
              {address.trim().length > 0 && address.trim().length < 5 && (
                <span className="block text-orange-600 mt-1">
                  ⚠️ Please enter a complete address (at least 5 characters)
                </span>
              )}
            </p>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition bg-green-500 hover:bg-green-600 text-white"
          >
            <MessageCircle size={20} />
            Confirm order
          </button>
          <p className="text-xs text-center text-gray-500 mt-3">
            The order will be confirmed temporarily. We will contact you to complete.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;