'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export interface OrderRecord {
  _id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

interface OrderManagerProps {
  orders: OrderRecord[];
  isLoading: boolean;
  onRefreshNeeded: () => void;
}

export default function OrderManager({ orders, isLoading, onRefreshNeeded }: OrderManagerProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const toastId = toast.loading(`Updating order status...`);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Order status updated to ${newStatus}`, { id: toastId });
        onRefreshNeeded();
      } else {
        toast.error(data.error || 'Failed to update order status', { id: toastId });
      }
    } catch (e) {
      toast.error('Error connecting to server', { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, refName: string) => {
    if (!confirm(`Are you sure you want to delete order #${refName}?`)) return;

    const toastId = toast.loading('Deleting order record...');
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Order record deleted', { id: toastId });
        onRefreshNeeded();
      } else {
        toast.error(data.error || 'Could not delete order', { id: toastId });
      }
    } catch (e) {
      toast.error('Error connecting to server', { id: toastId });
    }
  };

  return (
    <div className="bg-white p-5 rounded border border-slate-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Customer Orders ({orders.length})
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Fulfillment pipeline and delivery status tracking</p>
        </div>
        <button
          onClick={onRefreshNeeded}
          className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer"
        >
          Refresh List
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading customer orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 font-medium">No customer orders recorded.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                <th className="py-2.5 px-3">Order Ref / Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Shipping Address</th>
                <th className="py-2.5 px-3">Items Purchased</th>
                <th className="py-2.5 px-3">Total ($)</th>
                <th className="py-2.5 px-3">Fulfillment Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const shortRef = order._id.substring(order._id.length - 8);

                return (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-slate-900 text-[11px] truncate max-w-[110px]" title={order._id}>
                        #{shortRef}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-500">{order.customerEmail}</p>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-slate-600 max-w-[160px] truncate" title={`${order.shippingAddress}, ${order.city}`}>
                      {order.shippingAddress}, {order.city}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800">
                        {order.items?.length || 0} item(s)
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {order.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      ${order.totalAmount?.toFixed(2)}
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="px-2.5 py-1 rounded text-xs font-semibold border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteOrder(order._id, shortRef)}
                        className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-700" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
