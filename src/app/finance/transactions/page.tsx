'use client';

import React, { useMemo } from 'react';
import { FinancialOverviewCards } from '@/components/features/FinancialOverviewCards';
import { TransactionsTable } from '@/components/features/TransactionsTable';
import { Button } from '@/components/ui/Button';
import { TransactionDetail, FinancialOverview } from '@/types';
import { Upload, Plus, DollarSign, Wallet, XCircle, TrendingUp } from 'lucide-react';

// Generate mock transactions data
const generateMockTransactions = (): TransactionDetail[] => {
  return [
    { id: 'EXP00025', date: '22 Feb 2025', referenceNumber: 'PO-202402-012', description: 'Payment for raw materials', hasAttachment: true, amount: '$10,000', paymentMode: 'Cash', status: 'Paid' },
    { id: 'EXP00024', date: '07 Feb 2025', referenceNumber: 'INV00025', description: 'Purchase of packaging materials', hasAttachment: true, amount: '$25,750', paymentMode: 'Cheque', status: 'Pending' },
    { id: 'EXP00023', date: '30 Jan 2025', referenceNumber: 'PO-202401-011', description: 'Payment for electronic components', hasAttachment: true, amount: '$50,125', paymentMode: 'Cash', status: 'Cancelled' },
    { id: 'EXP00022', date: '17 Jan 2025', referenceNumber: 'REF12345', description: 'Social media ad campaign', hasAttachment: true, amount: '$75,900', paymentMode: 'Cheque', status: 'Paid' },
    { id: 'EXP00021', date: '04 Jan 2025', referenceNumber: 'REF18294', description: 'Business trip for sales meeting', hasAttachment: true, amount: '$99,999', paymentMode: 'Cheque', status: 'Pending' },
    { id: 'EXP00020', date: '09 Dec 2024', referenceNumber: 'PO-202412-010', description: 'Wholesale purchase of inventory', hasAttachment: true, amount: '$1,20,500', paymentMode: 'Cash', status: 'Cancelled' },
    { id: 'EXP00019', date: '02 Dec 2024', referenceNumber: 'UTI20241219', description: 'Electricity bill', hasAttachment: true, amount: '$2,50,000', paymentMode: 'Cash', status: 'Paid' },
    { id: 'EXP00018', date: '15 Nov 2024', referenceNumber: 'PO-202411-008', description: 'Purchase of office furniture', hasAttachment: true, amount: '$5,00,750', paymentMode: 'Cheque', status: 'Pending' },
    { id: 'EXP00017', date: '30 Nov 2024', referenceNumber: 'PO-202411-007', description: 'Purchase of manufacturing tools', hasAttachment: true, amount: '$7,50,300', paymentMode: 'Cheque', status: 'Cancelled' },
    { id: 'EXP00016', date: '12 Oct 2024', referenceNumber: 'REF17420', description: 'Server maintenance costs', hasAttachment: true, amount: '$9,99,999', paymentMode: 'Cash', status: 'Paid' },
    { id: 'EXP00015', date: '05 Oct 2024', referenceNumber: 'REF16302', description: 'Digital marketing campaign', hasAttachment: true, amount: '$87,650', paymentMode: 'Cheque', status: 'Pending' },
    { id: 'EXP00014', date: '09 Sep 2024', referenceNumber: 'REF15035', description: 'Equipment repairs and servicing', hasAttachment: true, amount: '$69,420', paymentMode: 'Cash', status: 'Cancelled' },
    { id: 'EXP00013', date: '02 Sep 2024', referenceNumber: 'REF14710', description: 'Renovation of office workspace', hasAttachment: true, amount: '$33,210', paymentMode: 'Cheque', status: 'Paid' },
    { id: 'EXP00012', date: '07 Aug 2024', referenceNumber: 'INV00020', description: 'Bulk order freight costs', hasAttachment: true, amount: '$2,10,000', paymentMode: 'Cheque', status: 'Pending' },
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
      label: 'Received Amount',
      value: '₹100,000',
      trend: '11.4% from last month',
      trendType: 'up',
      icon: Wallet,
      iconColor: 'bg-green-600',
    },
    {
      label: 'In Transaction',
      value: '₹400,000',
      trend: '8.12% from last month',
      trendType: 'up',
      icon: TrendingUp,
      iconColor: 'bg-yellow-500',
    },
    {
      label: 'Canceled',
      value: '₹300,000',
      trend: '7.45 from last month',
      trendType: 'down',
      icon: XCircle,
      iconColor: 'bg-red-600',
    },
  ];
};

export default function TransactionsPage() {
  const transactions = useMemo(() => generateMockTransactions(), []);
  const overviews = useMemo(() => generateMockOverview(), []);

  return (
    <main className="space-y-6" role="main" aria-label="Transactions page">
      {/* Page Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Transactions</h1>
        <div className="flex items-center gap-3" role="toolbar" aria-label="Transaction actions">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Export transactions"
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Export</span>
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Add new transaction"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <FinancialOverviewCards overviews={overviews} />

      {/* Transactions Table */}
      <TransactionsTable transactions={transactions} />

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}
