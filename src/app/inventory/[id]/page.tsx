'use client';

import React, { useMemo } from 'react';
import { ItemDetails } from '@/components/features/ItemDetails';
import { ItemDetail } from '@/types';
import { useParams } from 'next/navigation';

// Generate mock item detail data
const generateMockItemDetail = (itemId: string): ItemDetail => {
  return {
    id: itemId,
    name: "Men's Cotton White Shirt, 1256",
    barcode: '798446',
    category: 'Men',
    quantity: 875,
    quantityLeft: 150,
    alertQuantity: 100,
    images: [
      '/placeholder-red.jpg',
      '/placeholder-blue.jpg',
      '/placeholder-yellow.jpg',
    ],
    sizes: [
      { size: 'S', quantity: 250, quantityLeft: 50, price: '1250' },
      { size: 'M', quantity: 250, quantityLeft: 50, price: '1250' },
      { size: 'L', quantity: 250, quantityLeft: 50, price: '1250' },
      { size: 'XL', quantity: 250, quantityLeft: 50, price: '1250' },
      { size: 'XXL', quantity: 250, quantityLeft: 50, price: '1250' },
      { size: 'XXXL', quantity: 250, quantityLeft: 50, price: '1250' },
      { size: 'XXXXL', quantity: 250, quantityLeft: 50, price: '1250' },
    ],
    overview: {
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
    ],
  };
};

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params?.id as string || '100025';
  
  const itemDetail = useMemo(() => generateMockItemDetail(itemId), [itemId]);

  return (
    <main className="space-y-6" role="main" aria-label={`Item details for ${itemId}`}>
      <ItemDetails itemDetail={itemDetail} />
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}

