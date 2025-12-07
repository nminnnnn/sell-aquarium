import React, { useEffect, useState } from 'react';
import { useApp } from '../context';
import { orderService } from '../services/api';
import { Order } from '../types';
import Invoice from './Invoice';
import { Printer } from 'lucide-react';

const Orders = () => {
  const { auth } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewInvoice, setViewInvoice] = useState<Order | null>(null);

  useEffect(() => {
    if (auth.user) {
      orderService.getUserOrders(auth.user.id).then(setOrders);
    }
  }, [auth.user]);

  if (!auth.isAuthenticated) return <div className="text-center p-10">Please login to view orders.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && <p className="text-gray-500">You haven't placed any orders yet.</p>}
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="font-bold text-gray-900">Order #{order.id}</span>
                <span className="text-gray-500 text-sm ml-2">{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`px-2 py-1 text-xs rounded-full uppercase ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
                <button 
                  onClick={() => setViewInvoice(order)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="View Invoice"
                >
                    <Printer size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity} x {item.name}</span>
                  <span className="font-medium">₹{(item.offerPrice || item.price) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between font-bold">
              <span>Total Amount</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        ))}
      </div>

      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <div className="p-2 flex justify-end print:hidden">
                <button onClick={() => setViewInvoice(null)} className="text-red-500 font-bold px-4 py-2">Close</button>
            </div>
            <Invoice order={viewInvoice} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;