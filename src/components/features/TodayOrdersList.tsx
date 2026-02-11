import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Order } from '@/types';

interface TodayOrdersListProps {
  orders: Order[];
  totalOrders: number;
}

export const TodayOrdersList: React.FC<TodayOrdersListProps> = ({
  orders,
  totalOrders,
}) => {
  return (
    <Card>
      <CardHeader
        title="Today Orders"
        subtitle={`Order List: ${totalOrders}`}
      />
      <CardContent>
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={index}
              className="border-b border-gray-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0"
            >
              <p className="font-medium text-gray-900 dark:text-white mb-1">{order.itemName}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Item Id: {order.itemId}</span>
                <span>Qty: {order.qty}</span>
                <span>Size: {order.size}</span>
                <span>Left: {order.left}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.price}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

