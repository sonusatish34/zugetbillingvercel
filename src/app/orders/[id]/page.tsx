'use client';

import React, { useMemo } from 'react';
import { OrderDetails } from '@/components/features/OrderDetails';
import { OrderDetail } from '@/types';
import { useParams } from 'next/navigation';

// Generate mock order detail data
const generateMockOrderDetail = (orderId: string): OrderDetail => {
  return {
    orderId,
    orderList: [
      {
        itemId: '14545',
        itemName: 'Flying Machine T-Shirt',
        qty: [2],
        size: 'XL',
        amount: '5000',
      },
      {
        itemId: '14545',
        itemName: 'Flying Machine T-Shirt',
        qty: [1],
        size: 'XL',
        amount: '5000',
      },
      {
        itemId: '14545',
        itemName: 'Flying Machine T-Shirt',
        qty: [1],
        size: 'XL',
        amount: '5000',
      },
    ],
    deliveryBoy: {
      name: 'Dasari Chandra Sh.....',
      phone: '6303968115',
      assignedTime: 'Assigned 7:30 AM',
      orderEarnings: '400',
    },
    paymentDetails: {
      itemsPrice: '1254',
      discount: '-100',
      deliveryFee: '-100',
      platformFee: '-100',
      totalEarning: '954',
    },
    itemOverview: {
      id: '100025',
      category: 'Womens',
      quantity: 200,
      sizes: 'L-280, S-280 XI -360, XXI -6 M-68',
      price: '908-1889',
      onlineSold: 908,
      offlineSold: 108,
      total: 1116,
      remaining: 432,
    },
    history: [
      {
        id: '100025',
        product: 'Wome Frok',
        category: 'Womens',
        quantity: 'XL - 2',
        price: '₹ 1456',
        orderCreatedTime: '10:35 Am, 17Dec 26',
        pickupTime: '10:35 Am',
        orderFrom: 'Online',
        orderStatus: 'Returned',
        amountStatus: 'In Progress',
      },
      {
        id: '100025',
        product: 'Wome Frok',
        category: 'Womens',
        quantity: 'XL - 2',
        price: '₹ 1456',
        orderCreatedTime: '10:35 Am, 17Dec 26',
        pickupTime: '10:35 Am',
        orderFrom: 'Offline',
        orderStatus: 'Completed',
        amountStatus: 'Received',
      },
    ],
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string || '10025';
  
  const orderDetail = useMemo(() => generateMockOrderDetail(orderId), [orderId]);

  return (
    <main className="space-y-6" role="main" aria-label={`Order details for ${orderId}`}>
      <OrderDetails orderDetail={orderDetail} />
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}

