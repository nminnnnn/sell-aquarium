import React, { useState } from 'react';
import { Trash2, MessageCircle, Plus, Minus } from 'lucide-react';
import { useApp } from '../context';
import { STORE_DETAILS } from '../constants';
import { orderService } from '../services/api';

const Cart = () => {
  const { cart, removeFromCart, addToCart, cartTotal, auth, clearCart } = useApp();
  const [address, setAddress] = useState(auth.user?.address || '');

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

    // 1. Create Order in Backend
    const newOrder = {
      id: Date.now().toString(),
      userId: auth.user.id,
      userName: auth.user.name,
      userPhone: auth.user.phone,
      items: cart,
      totalAmount: cartTotal,
      status: 'pending' as const,
      date: new Date().toISOString()
    };

    await orderService.create(newOrder);

    // 2. Format WhatsApp Message
    const itemsList = cart.map((item, i) => 
      `${i + 1}. ${item.name} x ${item.quantity} = ₹${(item.offerPrice || item.price) * item.quantity}`
    ).join('%0A');

    const message = 
      `Hello *${STORE_DETAILS.name}*, I want to place an order:%0A%0A` +
      `*Customer:* ${auth.user.name}%0A` +
      `*Phone:* ${auth.user.phone}%0A%0A` +
      `*Products:*%0A${itemsList}%0A%0A` +
      `*Total Amount:* ₹${cartTotal}%0A` +
      `*Address:* ${address || 'Pick up from store'}%0A%0A` +
      `Please confirm my order.`;

    // 3. Clear Cart
    clearCart();

    // 4. Redirect
    window.open(`https://wa.me/${STORE_DETAILS.whatsapp}?text=${message}`, '_blank');
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
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              
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
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (Included)</span>
              <span>₹0</span>
            </div>
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Address (Optional)</label>
            <textarea 
              className="w-full border rounded-md p-2 text-sm focus:ring-brand-cyan focus:border-brand-cyan"
              rows={2}
              placeholder="Enter your address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
          >
            <MessageCircle size={20} />
            Purchase via WhatsApp
          </button>
          <p className="text-xs text-center text-gray-500 mt-3">
            Clicking purchase will redirect you to WhatsApp to confirm your order with {STORE_DETAILS.name}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;