'use client';

import React, { useMemo } from 'react';
import { EmployeeDetails } from '@/components/features/EmployeeDetails';
import { EmployeeDetail } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { Shirt, Package, ShoppingBag } from 'lucide-react';

// Generate mock employee detail data
const generateMockEmployeeDetail = (employeeId: string): EmployeeDetail => {
  const employee = {
    id: employeeId,
    name: 'Dasari Chandra Shekhar',
    number: '6303968112',
    designation: 'Manger',
    orderCreatedTime: '10:35 Am, 17Dec 26',
  };

  const addedItems = [
    {
      id: '1',
      itemIcon: <Shirt className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      itemName: 'Cord - Set',
      category: 'Womens',
      sizeQuantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      time: '10:35 Am',
      status: 'Booked',
    },
    {
      id: '2',
      itemIcon: <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      itemName: 'Kids Girls Wear',
      category: 'Kids',
      sizeQuantity: 'L - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      time: '10:35 Am',
      status: 'Booked',
    },
    {
      id: '3',
      itemIcon: <Shirt className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      itemName: 'Rare Rabbit Shirt',
      category: 'Mens',
      sizeQuantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      time: '10:35 Am',
      status: 'Booked',
    },
    {
      id: '4',
      itemIcon: <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      itemName: 'Men Jacket',
      category: 'Mens',
      sizeQuantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      time: '10:35 Am',
      status: 'Booked',
    },
    {
      id: '5',
      itemIcon: <Shirt className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      itemName: 'Men T-shirt',
      category: 'Mens',
      sizeQuantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      time: '10:35 Am',
      status: 'Booked',
    },
    // Add more items to reach 10+ for pagination
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 6}`,
      itemIcon: <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      itemName: `Item ${i + 6}`,
      category: i % 2 === 0 ? 'Womens' : 'Mens',
      sizeQuantity: 'XL - 2',
      price: '₹ 1456',
      orderCreatedTime: '10:35 Am, 17Dec 26',
      time: '10:35 Am',
      status: 'Booked',
    })),
  ];

  return {
    employee,
    addedItems,
  };
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id as string || '1';
  
  const employeeDetail = useMemo(() => generateMockEmployeeDetail(employeeId), [employeeId]);

  const handleDelete = (id: string) => {
    // Handle delete logic here
    console.log('Delete employee:', id);
    router.push('/manage/employees');
  };

  return (
    <main className="space-y-6" role="main" aria-label={`Employee details for ${employeeId}`}>
      <EmployeeDetails employeeDetail={employeeDetail} onDelete={handleDelete} />
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}

