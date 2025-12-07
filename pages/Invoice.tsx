import React from 'react';
import { Order } from '../types';
import { STORE_DETAILS } from '../constants';

const Invoice = ({ order }: { order: Order }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 max-w-2xl mx-auto" id="invoice">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{STORE_DETAILS.name}</h1>
          <p className="text-gray-500 text-sm">
            {STORE_DETAILS.address}<br />
            Pincode: {STORE_DETAILS.pincode}<br />
            Phone: {STORE_DETAILS.phone}
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-400">INVOICE</h2>
          <p className="text-gray-500 mt-2">#INV-{order.id.slice(-6)}</p>
          <p className="text-gray-500 text-sm">Date: {new Date(order.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Bill To</h3>
        <p className="font-bold text-gray-900">{order.userName}</p>
        <p className="text-gray-600">{order.userPhone}</p>
      </div>

      {/* Items */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase">Description</th>
            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Qty</th>
            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Price</th>
            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-4 text-gray-900">{item.name}</td>
              <td className="py-4 text-right text-gray-600">{item.quantity}</td>
              <td className="py-4 text-right text-gray-600">₹{item.offerPrice || item.price}</td>
              <td className="py-4 text-right text-gray-900 font-medium">₹{(item.offerPrice || item.price) * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-end border-t border-gray-200 pt-4">
        <div className="text-right space-y-2">
          <div className="flex justify-between w-48">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{order.totalAmount}</span>
          </div>
          <div className="flex justify-between w-48 text-lg font-bold text-gray-900 pt-2 border-t">
            <span>Total:</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm pt-8 border-t">
        <p>Thank you for shopping with {STORE_DETAILS.name}!</p>
        <p className="mt-2 text-xs">For support/queries, contact +91 {STORE_DETAILS.phone}</p>
      </div>
      
      <div className="mt-8 text-center print:hidden">
          <button 
            onClick={handlePrint}
            className="bg-brand-cyan text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-cyan-600"
          >
            Print / Save PDF
          </button>
      </div>
    </div>
  );
};

export default Invoice;