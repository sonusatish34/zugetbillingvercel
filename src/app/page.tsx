'use client';

import React from 'react';
import { WelcomeBanner } from '@/components/features/WelcomeBanner';
import { OverviewCards } from '@/components/features/OverviewCards';
import { SalesAnalyticsCard } from '@/components/features/SalesAnalyticsCard';
import { InvoiceStatisticsCard } from '@/components/features/InvoiceStatisticsCard';
import { RevenueChart } from '@/components/features/RevenueChart';
import { TodayOrdersList } from '@/components/features/TodayOrdersList';
import { InvoicesTable } from '@/components/features/InvoicesTable';
import { RecentTransactions } from '@/components/features/RecentTransactions';
import { TodayOrdersCard } from '@/components/features/TodayOrdersCard';
import { TotalIncomeChart } from '@/components/features/TotalIncomeChart';
import { TopSalesChart } from '@/components/features/TopSalesChart';

export default function Dashboard() {
  // Mock data matching the image
  const overviewStats = {
    invoices: 1041,
    customers: 3642,
    amountDue: '₹1,642',
    todayOrders: 2150,
  };

  const salesAnalytics = {
    totalSales: '₹40,569',
    purchase: '₹1,54,220',
    decSales: '₹10,041',
    decOrders: 12150,
  };

  const invoiceStatistics = {
    invoiced: '$21,132',
    received: '$10,763',
    outstanding: '$8041',
    total: '$45,897.01',
  };

  const revenueData = [
    { name: 'Mon', value: 15000, received: 12000, total: 15000 },
    { name: 'Tue', value: 18000, received: 15000, total: 18000 },
    { name: 'Wed', value: 22000, received: 18000, total: 22000 },
    { name: 'Thu', value: 25000, received: 20000, total: 25000 },
    { name: 'Fri', value: 30000, received: 25000, total: 30000 },
    { name: 'Sat', value: 18000, received: 15000, total: 18000 },
    { name: 'Sun', value: 15000, received: 12000, total: 15000 },
  ];

  const todayOrders = [
    {
      itemId: '14545',
      itemName: 'Flying Machine T-Shirt',
      qty: 2,
      size: 'XL',
      left: 56,
      price: '₹1,642',
    },
    {
      itemId: '14545',
      itemName: 'Flying Machine T-Shirt',
      qty: 2,
      size: 'XL',
      left: 56,
      price: '₹1,642',
    },
    {
      itemId: '14545',
      itemName: 'Flying Machine T-Shirt',
      qty: 2,
      size: 'XL',
      left: 56,
      price: '₹1,642',
    },
  ];

  const invoices = [
    {
      id: 'INV00025',
      createdOn: '22 Feb 2025',
      amount: '$10,000',
      paid: '$5,000',
      paymentMode: 'Cash',
      dueDate: '04 Mar 2025',
    },
    {
      id: 'INV00024',
      createdOn: '07 Feb 2025',
      amount: '$25,750',
      paid: '$10,750',
      paymentMode: 'Check',
      dueDate: '20 Feb 2025',
    },
    {
      id: 'INV00023',
      createdOn: '09 Dec 2024',
      amount: '$1,20,500',
      paid: '$60,000',
      paymentMode: 'Check',
      dueDate: '12 Nov 2024',
    },
    {
      id: 'INV00022',
      createdOn: '30 Nov 2024',
      amount: '$7,50,300',
      paid: '$60,000',
      paymentMode: 'Check',
      dueDate: '25 Oct 2024',
    },
    {
      id: 'INV00016',
      createdOn: '12 Oct 2024',
      amount: '$9,99,999',
      paid: '$4,00,000',
      paymentMode: 'Cash',
      dueDate: '18 Oct 2024',
    },
    {
      id: 'INV00015',
      createdOn: '05 Oct 2024',
      amount: '$87,650',
      paid: '$40,000',
      paymentMode: 'Check',
      dueDate: '22 Sep 2024',
    },
    {
      id: 'INV00014',
      createdOn: '09 Sep 2024',
      amount: '$69,420',
      paid: '$30,000',
      paymentMode: 'Cash',
      dueDate: '15 Sep 2024',
    },
    {
      id: 'INV00013',
      createdOn: '02 Sep 2024',
      amount: '$33,210',
      paid: '$15,000',
      paymentMode: 'Check',
      dueDate: '20 Aug 2024',
    },
  ];

  const todayTransactions = [
    {
      name: 'ZuGet',
      invoiceId: '#INV45478',
      amount: '+ ₹9989.15',
      date: 'Today',
    },
    {
      name: 'John Carter',
      invoiceId: '#INV45477',
      amount: '+ ₹989.15',
      date: 'Today',
    },
  ];

  const yesterdayTransactions = [
    {
      name: 'Sophia White',
      invoiceId: '#INV45476',
      amount: '+ $669',
      date: 'Yesterday',
    },
    {
      name: 'Daniel Martinez',
      invoiceId: '#INV45475',
      amount: '+ $474.22',
      date: 'Yesterday',
    },
    {
      name: 'Amelia Robinson',
      invoiceId: '#INV45474',
      amount: '+ $339.79',
      date: 'Yesterday',
    },
  ];

  const incomeChartData = [
    { name: 'Week 1', value: 20000 },
    { name: 'Week 2', value: 25000 },
    { name: 'Week 3', value: 22000 },
    { name: 'Week 4', value: 28000 },
    { name: 'Week 5', value: 30000 },
  ];

  const topSalesData = [
    { name: 'Dell XPS 13', value: 38, color: '#ef4444' },
    { name: 'Nike T-shirt', value: 32, color: '#3b82f6' },
    { name: 'Apple iPhone 15', value: 30, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OverviewCards stats={overviewStats} />
        <SalesAnalyticsCard data={salesAnalytics} />
        <InvoiceStatisticsCard data={invoiceStatistics} />
      </div>

      {/* Charts and Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueData}
            totalRevenue="$98,545"
            change="+45"
          />
        </div>
        <TodayOrdersList orders={todayOrders} totalOrders={5} />
      </div>

      {/* Invoices Table */}
      <InvoicesTable invoices={invoices} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactions
          todayTransactions={todayTransactions}
          yesterdayTransactions={yesterdayTransactions}
        />
        <TodayOrdersCard
          onlineSales="₹10,041"
          onlineOrders={12150}
          offlineSales="₹10,041"
          offlineOrders={12150}
        />
        <div className="space-y-6">
          <TotalIncomeChart
            data={incomeChartData}
            totalIncome="$98,545"
            comparison="30.2 Vs Last Week"
          />
          <TopSalesChart data={topSalesData} centerValue="38%" />
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </div>
  );
}
