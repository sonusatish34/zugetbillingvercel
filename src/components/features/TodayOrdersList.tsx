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
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order, index) => (
            <div
              key={index}
              className="border-b border-gray-100 dark:border-slate-700 pb-3 sm:pb-4 last:border-0 last:pb-0"
            >
              <p className="font-medium text-xs sm:text-sm md:text-base text-gray-900 dark:text-white mb-1 truncate">{order.itemName}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Id: {order.itemId}</span>
                <span>Qty: {order.qty}</span>
                <span>Size: {order.size}</span>
                <span>Left: {order.left}</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{order.price}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 sm:mt-4">
          <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

