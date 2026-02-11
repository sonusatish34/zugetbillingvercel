'use client';

import React, { useMemo } from 'react';
import { FinancialOverviewCards } from '@/components/features/FinancialOverviewCards';
import { PaymentsTable } from '@/components/features/PaymentsTable';
import { Button } from '@/components/ui/Button';
import { Payment, FinancialOverview } from '@/types';
import { Upload, Plus, DollarSign, Lock, ShoppingBag, FileText } from 'lucide-react';

// Generate mock payments data
const generateMockPayments = (): Payment[] => {
  return [
    { id: 'INC00025', date: '22 Feb 2025', referenceNumber: 'REF17420', description: 'Sale of laptops', amount: '₹10,000', paymentMode: 'Cash' },
    { id: 'INC00019', date: '02 Dec 2024', referenceNumber: 'REF15275', description: 'Sale of office equipment', amount: '₹2,50,000', paymentMode: 'Cheque' },
    { id: 'INC00024', date: '07 Feb 2025', referenceNumber: 'REF17421', description: 'Sale of monitors', amount: '₹15,000', paymentMode: 'Cash' },
    { id: 'INC00023', date: '30 Jan 2025', referenceNumber: 'REF17422', description: 'Sale of keyboards', amount: '₹5,000', paymentMode: 'Online' },
    { id: 'INC00022', date: '17 Jan 2025', referenceNumber: 'REF17423', description: 'Sale of mice', amount: '₹3,000', paymentMode: 'Card' },
    { id: 'INC00021', date: '04 Jan 2025', referenceNumber: 'REF17424', description: 'Sale of speakers', amount: '₹8,000', paymentMode: 'Cash' },
    { id: 'INC00020', date: '09 Dec 2024', referenceNumber: 'REF17425', description: 'Sale of headphones', amount: '₹12,000', paymentMode: 'Cheque' },
    { id: 'INC00018', date: '15 Nov 2024', referenceNumber: 'REF17426', description: 'Sale of webcams', amount: '₹6,000', paymentMode: 'Online' },
    { id: 'INC00017', date: '30 Nov 2024', referenceNumber: 'REF17427', description: 'Sale of microphones', amount: '₹9,000', paymentMode: 'Card' },
    { id: 'INC00016', date: '12 Oct 2024', referenceNumber: 'REF17428', description: 'Sale of cables', amount: '₹2,000', paymentMode: 'Cash' },
    { id: 'INC00015', date: '05 Oct 2024', referenceNumber: 'REF17429', description: 'Sale of adapters', amount: '₹4,000', paymentMode: 'Cheque' },
    { id: 'INC00014', date: '09 Sep 2024', referenceNumber: 'REF17430', description: 'Sale of chargers', amount: '₹3,500', paymentMode: 'Online' },
    { id: 'INC00013', date: '02 Sep 2024', referenceNumber: 'REF17431', description: 'Sale of batteries', amount: '₹7,000', paymentMode: 'Card' },
    { id: 'INC00012', date: '07 Aug 2024', referenceNumber: 'REF17432', description: 'Sale of cases', amount: '₹5,500', paymentMode: 'Cash' },
  ];
};

// Generate mock overview data
const generateMockOverview = (): FinancialOverview[] => {
  return [
    {
      label: 'Total Income',
      value: '₹250,000',
      trend: '5.62% from last month',
      trendType: 'up',
      icon: DollarSign,
      iconColor: 'bg-purple-600',
    },
    {
      label: 'Offline Sales',
      value: '₹100,000',
      trend: '11.4% from last month',
      trendType: 'up',
      icon: Lock,
      iconColor: 'bg-green-600',
    },
    {
      label: 'Online Sales',
      value: '₹400,000',
      trend: '8.12% from last month',
      trendType: 'up',
      icon: ShoppingBag,
      iconColor: 'bg-yellow-500',
    },
    {
      label: 'In Progress Transaction',
      value: '₹300,000',
      trend: '7.45 from last month',
      trendType: 'down',
      icon: FileText,
      iconColor: 'bg-red-600',
    },
  ];
};

export default function PaymentsPage() {
  const payments = useMemo(() => generateMockPayments(), []);
  const overviews = useMemo(() => generateMockOverview(), []);

  return (
    <main className="space-y-6" role="main" aria-label="Payments page">
      {/* Page Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Payments</h1>
        <div className="flex items-center gap-3" role="toolbar" aria-label="Payment actions">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Export payments"
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Export</span>
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Add new payment"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <FinancialOverviewCards overviews={overviews} />

      {/* Payments Table */}
      <PaymentsTable payments={payments} />

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}
