'use client';

import React, { useMemo } from 'react';
import { ProfilePage as ProfilePageComponent } from '@/components/features/ProfilePage';
import { ProfileData, PaymentHistoryItem, StoreSetting, InvoiceStatistics } from '@/types';

// Generate mock profile data
const generateMockProfileData = (): {
  profileData: ProfileData;
  paymentHistory: PaymentHistoryItem[];
  storeSetting: StoreSetting;
  invoiceStatistics: InvoiceStatistics;
} => {
  const profileData: ProfileData = {
    storeId: '12345',
    name: 'Dasari Chandra Shekhar',
    location: 'Medipally, Hyderabad',
    email: 'john@example.com',
    phone: '+918578 54840',
    company: 'KLM Shopping mall, Medipally',
    favoriteFor: '8789987',
  };

  const paymentHistory: PaymentHistoryItem[] = [
    { id: '1', method: 'Paypal', invoiceNumber: 'INV4578', amount: '$980', status: 'Paid', date: '2025-03-24' },
    { id: '2', method: 'Stripe', invoiceNumber: 'INV4457', amount: '$241', status: 'Paid', date: '2025-03-25' },
    { id: '3', method: 'Paypal', invoiceNumber: 'INV4565', amount: '$417', status: 'Paid', date: '2025-03-26' },
    { id: '4', method: 'Stripe', invoiceNumber: 'INV4548', amount: '$142', status: 'Paid', date: '2025-03-27' },
    { id: '5', method: 'Paypal', invoiceNumber: 'INV4547', amount: '$214', status: 'Paid', date: '2025-03-28' },
    { id: '6', method: 'Stripe', invoiceNumber: 'INV4548', amount: '$142', status: 'Paid', date: '2025-03-29' },
    { id: '7', method: 'Paypal', invoiceNumber: 'INV4547', amount: '$214', status: 'Paid', date: '2025-03-30' },
    { id: '8', method: 'Paypal', invoiceNumber: 'INV4547', amount: '$214', status: 'Paid', date: '2025-03-31' },
  ];

  const storeSetting: StoreSetting = {
    freeDelivery: true,
    returnHours: 3,
    returnPerOrder: 3,
  };

  const invoiceStatistics: InvoiceStatistics = {
    invoiced: '₹56900.54',
    received: '₹7484.54',
    outstanding: '₹7485.54',
    total: '₹745.54',
  };

  return {
    profileData,
    paymentHistory,
    storeSetting,
    invoiceStatistics,
  };
};

export default function ProfilePage() {
  const mockData = useMemo(() => generateMockProfileData(), []);

  return (
    <main className="space-y-6" role="main" aria-label="Profile page">
      <ProfilePageComponent
        profileData={mockData.profileData}
        paymentHistory={mockData.paymentHistory}
        storeSetting={mockData.storeSetting}
        invoiceStatistics={mockData.invoiceStatistics}
      />
      
      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}

