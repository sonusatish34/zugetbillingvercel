'use client';

import React, { useMemo, useCallback } from 'react';
import { EmployeesTable } from '@/components/features/EmployeesTable';
import { Employee } from '@/types';

// Generate mock employees data
const generateMockEmployees = (): Employee[] => {
  const baseEmployees: Employee[] = [
    {
      id: '1',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '2',
      name: 'Kishore',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '3',
      name: 'Hinata',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '4',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '5',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '6',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '7',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '8',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '9',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '10',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '11',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '12',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '13',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
    {
      id: '14',
      name: 'Dasari Chandra Shekhar',
      number: '6303968112',
      designation: 'Manger',
      orderCreatedTime: '10:35 Am, 17Dec 26',
    },
  ];

  return baseEmployees;
};

export default function EmployeesPage() {
  const employees = useMemo(() => generateMockEmployees(), []);

  const handleDelete = useCallback((id: string) => {
    // TODO: Implement delete employee logic
    console.log('Delete employee:', id);
  }, []);

  return (
    <main className="space-y-6" role="main" aria-label="Employees Management">
      <EmployeesTable employees={employees} onDelete={handleDelete} />
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}
