'use client';

import React, { useMemo } from 'react';
import { LowQuantityItemsTable } from '@/components/features/LowQuantityItemsTable';
import { Item } from '@/types';
import { Shirt, Package, Baby } from 'lucide-react';

// Generate mock items data
const generateMockItems = (): Item[] => {
  const baseItems: Omit<Item, 'productIcon'>[] = [
    {
      id: '100025',
      product: 'Wome Frok',
      category: 'Womens',
      unit: 'Piece',
      quantity: 200,
      sizes: 'L-280, S-280 XI -360, XXI -6 M-68',
      price: '908-1889',
    },
    {
      id: '200014',
      product: 'Cord - Set',
      category: 'Kids',
      unit: 'Pair',
      quantity: 1200,
      sizes: 'L-280, S-280 XI -360, XXI -6 M-68',
      price: '908-1889',
    },
    {
      id: '300045',
      product: 'Kids Girls Wear',
      category: 'Kids',
      unit: 'Piece',
      quantity: 3400,
      sizes: 'L-280, S-280 XI -360, XXI -6 M-68',
      price: '908-1889',
    },
    {
      id: '400012',
      product: 'Rare Rabbit Shirt',
      category: 'Mens',
      unit: 'Piece',
      quantity: 150,
      sizes: 'L-280, S-280 XI -360, XXI -6 M-68',
      price: '908-1889',
    },
    {
      id: '500078',
      product: 'Men Jacket',
      category: 'Mens',
      unit: 'Piece',
      quantity: 450,
      sizes: 'L-280, S-280 XI -360, XXI -6 M-68',
      price: '908-1889',
    },
    {
      id: '600089',
      product: 'Men T-shirt',
      category: 'Mens',
      unit: 'Piece',
      quantity: 890,
      sizes: 'L-280, S-280 XI -360, XXI -6 M-68',
      price: '908-1889',
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

  const itemsWithIcons: Item[] = [
    { ...baseItems[0], productIcon: iconMap.purple },
    { ...baseItems[1], productIcon: iconMap.blue },
    { ...baseItems[2], productIcon: iconMap.pink },
    { ...baseItems[3], productIcon: iconMap.green },
    { ...baseItems[4], productIcon: iconMap.gray },
    { ...baseItems[5], productIcon: iconMap.indigo },
    // Add more items for pagination
    ...Array.from({ length: 14 }, (_, i) => ({
      ...baseItems[i % baseItems.length],
      id: `${700000 + i}`,
      product: `Product ${i + 1}`,
      productIcon: iconMap.gray,
      quantity: ((i * 137) % 5000) + 100,
    })),
  ];

  return itemsWithIcons;
};

export default function LowQuantityItemsPage() {
  const items = useMemo(() => generateMockItems(), []);

  return (
    <main className="space-y-6" role="main" aria-label="Low Quantity Items">
      <LowQuantityItemsTable items={items} />
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}
