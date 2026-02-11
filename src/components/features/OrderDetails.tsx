'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderDetail, OrderItem } from '@/types';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderDetailsProps {
  orderDetail: OrderDetail;
}

const OrderItemCard = memo<{ item: OrderDetail['orderList'][0] }>(({ item }) => (
  <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center flex-shrink-0" aria-hidden="true">
      {item.image ? (
        <img src={item.image} alt={item.itemName} className="w-full h-full object-cover rounded" />
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-slate-600 rounded" />
      )}
    </div>
    <div className="flex-1">
      <h4 className="text-primary font-medium">{item.itemName}</h4>
      <p className="text-sm text-secondary">Item Id : {item.itemId}</p>
      <p className="text-sm text-secondary">Qty : [{item.qty.join(', ')}]</p>
      <p className="text-sm text-secondary">Size : {item.size}</p>
    </div>
    <div className="text-right">
      <p className="text-lg font-bold text-primary">{item.amount}/-</p>
    </div>
  </div>
));

OrderItemCard.displayName = 'OrderItemCard';

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderDetail }) => {
  const totalAmount = orderDetail.orderList.reduce((sum, item) => {
    const amount = parseFloat(item.amount.replace(/[^0-9.]/g, ''));
    return sum + amount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link 
          href="/inventory/total" 
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Go back to Total Items"
        >
          <ArrowLeft className="w-5 h-5 text-primary" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-primary">ID : {orderDetail.orderId}</h1>
      </div>

      {/* Alert Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3" role="alert">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-green-700 dark:text-green-400">
          The Total Earnings Will be Created After 1 week of Order Completes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order List Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              Order List : {orderDetail.orderList.length}
            </h2>
            <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {totalAmount.toLocaleString()}/-
            </p>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            {orderDetail.orderList.map((item, index) => (
              <OrderItemCard key={`${item.itemId}-${index}`} item={item} />
            ))}
          </div>

          {/* Item Overview Table */}
          {orderDetail.itemOverview && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full" role="table" aria-label="Item overview">
                    <caption className="sr-only">
                      Item overview showing category, quantity, sizes, price, sales, and remaining stock
                    </caption>
                    <thead>
                      <tr role="row">
                        <th className="table-header" scope="col" role="columnheader">Id</th>
                        <th className="table-header" scope="col" role="columnheader">Category</th>
                        <th className="table-header" scope="col" role="columnheader">Quantity</th>
                        <th className="table-header" scope="col" role="columnheader">Sizes</th>
                        <th className="table-header" scope="col" role="columnheader">Price</th>
                        <th className="table-header" scope="col" role="columnheader">Online Sold</th>
                        <th className="table-header" scope="col" role="columnheader">Offline Sold</th>
                        <th className="table-header" scope="col" role="columnheader">Total</th>
                        <th className="table-header" scope="col" role="columnheader">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr role="row" className="table-row">
                        <td className="table-cell text-primary font-medium" role="gridcell">{orderDetail.itemOverview.id}</td>
                        <td className="table-cell" role="gridcell">{orderDetail.itemOverview.category}</td>
                        <td className="table-cell" role="gridcell">{orderDetail.itemOverview.quantity}</td>
                        <td className="table-cell text-xs" role="gridcell">{orderDetail.itemOverview.sizes}</td>
                        <td className="table-cell" role="gridcell">{orderDetail.itemOverview.price}</td>
                        <td className="table-cell" role="gridcell">{orderDetail.itemOverview.onlineSold}</td>
                        <td className="table-cell" role="gridcell">{orderDetail.itemOverview.offlineSold}</td>
                        <td className="table-cell text-primary font-medium" role="gridcell">{orderDetail.itemOverview.total}</td>
                        <td className="table-cell text-primary font-medium" role="gridcell">{orderDetail.itemOverview.remaining}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Table */}
          {orderDetail.history && orderDetail.history.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-primary mb-4">History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full" role="table" aria-label="Order history">
                    <caption className="sr-only">
                      Order history showing past transactions and status changes
                    </caption>
                    <thead>
                      <tr role="row">
                        <th className="table-header" scope="col" role="columnheader">Id</th>
                        <th className="table-header" scope="col" role="columnheader">Category</th>
                        <th className="table-header" scope="col" role="columnheader">Quantity</th>
                        <th className="table-header" scope="col" role="columnheader">Price</th>
                        <th className="table-header" scope="col" role="columnheader">Order Created Time</th>
                        <th className="table-header" scope="col" role="columnheader">Pickup Time</th>
                        <th className="table-header" scope="col" role="columnheader">Order From</th>
                        <th className="table-header" scope="col" role="columnheader">Order Status</th>
                        <th className="table-header" scope="col" role="columnheader">Amount Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail.history.map((historyItem, index) => (
                        <tr key={`${historyItem.id}-${index}`} role="row" className="table-row">
                          <td className="table-cell text-primary font-medium" role="gridcell">{historyItem.id}</td>
                          <td className="table-cell" role="gridcell">{historyItem.category}</td>
                          <td className="table-cell" role="gridcell">{historyItem.quantity}</td>
                          <td className="table-cell" role="gridcell">{historyItem.price}</td>
                          <td className="table-cell" role="gridcell">{historyItem.orderCreatedTime}</td>
                          <td className="table-cell" role="gridcell">{historyItem.pickupTime || '-'}</td>
                          <td className="table-cell" role="gridcell">{historyItem.orderFrom || '-'}</td>
                          <td className="table-cell" role="gridcell">
                            <span className="badge-info px-2 py-1 rounded text-xs">{historyItem.orderStatus}</span>
                          </td>
                          <td className="table-cell" role="gridcell">
                            <span className={`px-2 py-1 rounded text-xs ${
                              historyItem.amountStatus === 'Received' 
                                ? 'badge-success' 
                                : 'badge-info'
                            }`}>
                              {historyItem.amountStatus || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Delivery Boy & Payment Details */}
        <div className="space-y-6">
          {/* Delivery Boy Details */}
          {orderDetail.deliveryBoy && (
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-primary mb-4">Delivery Boy Details</h3>
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto" aria-hidden="true">
                    {orderDetail.deliveryBoy.image ? (
                      <img 
                        src={orderDetail.deliveryBoy.image} 
                        alt={orderDetail.deliveryBoy.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-slate-600 rounded-lg" />
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-primary font-medium">{orderDetail.deliveryBoy.name}</p>
                    <p className="text-sm text-secondary">Phone: {orderDetail.deliveryBoy.phone}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {orderDetail.deliveryBoy.assignedTime}
                    </p>
                    <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-sm text-secondary">Order Earnings</p>
                      <p className="text-lg font-bold text-primary">{orderDetail.deliveryBoy.orderEarnings}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          {orderDetail.paymentDetails && (
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-primary mb-4">Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary">Items Price</span>
                    <span className="text-primary font-medium">{orderDetail.paymentDetails.itemsPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Discount</span>
                    <span className="text-red-600 dark:text-red-400">{orderDetail.paymentDetails.discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Delivery Fee</span>
                    <span className="text-red-600 dark:text-red-400">{orderDetail.paymentDetails.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Platform Fee</span>
                    <span className="text-red-600 dark:text-red-400">{orderDetail.paymentDetails.platformFee}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between">
                    <span className="text-primary font-semibold">Total Earning</span>
                    <span className="text-primary font-bold text-lg">{orderDetail.paymentDetails.totalEarning}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

