'use client';

import React, { useMemo } from 'react';
import { OrdersTable } from '@/components/features/OrdersTable';
import { OrderItem } from '@/types';
import { Shirt, Package, Baby } from 'lucide-react';

// Generate mock orders data for In Delivery
const generateMockOrders = (): OrderItem[] => {
  const baseOrders: Omit<OrderItem, 'productIcon'>[] = [
    {
      id: '100025',
      product: 'Wome Frok',
      category: 'Womens',
      quantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      pickupTime: '10:35 Am',
      orderStatus: 'In Delivery',
    },
    {
      id: '200014',
      product: 'Cord - Set',
      category: 'Womens',
      quantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      pickupTime: '10:35 Am',
      orderStatus: 'In Delivery',
    },
    {
      id: '300045',
      product: 'Kids Girls Wear',
      category: 'Kids',
      quantity: 'L - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      pickupTime: '10:35 Am',
      orderStatus: 'In Delivery',
    },
    {
      id: '400012',
      product: 'Rare Rabbit Shirt',
      category: 'Mens',
      quantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      pickupTime: '10:35 Am',
      orderStatus: 'In Delivery',
    },
    {
      id: '500078',
      product: 'Men Jacket',
      category: 'Mens',
      quantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      pickupTime: '10:35 Am',
      orderStatus: 'In Delivery',
    },
    {
      id: '600089',
      product: 'Men T-shirt',
      category: 'Mens',
      quantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      pickupTime: '10:35 Am',
      orderStatus: 'In Delivery',
    },
  ];

  const iconMap = {
    purple: <Shirt className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />,
    blue: <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />,
    pink: <Baby className="w-5 h-5 text-pink-600 dark:text-pink-400" aria-hidden="true" />,
    green: <Shirt className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />,
    gray: <Shirt className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />,
    indigo: <Shirt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />,
  };

  const ordersWithIcons: OrderItem[] = [
    { ...baseOrders[0], productIcon: iconMap.purple },
    { ...baseOrders[1], productIcon: iconMap.blue },
    { ...baseOrders[2], productIcon: iconMap.pink },
    { ...baseOrders[3], productIcon: iconMap.green },
    { ...baseOrders[4], productIcon: iconMap.gray },
    { ...baseOrders[5], productIcon: iconMap.indigo },
    // Add more orders for pagination
    ...Array.from({ length: 14 }, (_, i) => ({
      ...baseOrders[i % baseOrders.length],
      id: `${700000 + i}`,
      product: `Product ${i + 1}`,
      productIcon: iconMap.gray,
      quantity: i % 2 === 0 ? 'XL - 2' : 'L - 2',
    })),
  ];

  return ordersWithIcons;
};

export default function InDeliveryOrdersPage() {
  const orders = useMemo(() => generateMockOrders(), []);

  return (
    <main className="space-y-6" role="main" aria-label="In Delivery Orders">
      <OrdersTable orders={orders} title="In Delivery Orders" />
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}
