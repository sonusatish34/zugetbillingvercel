'use client';

import React, { useState, useMemo } from 'react';
import { AddBankDetailsForm } from '@/components/features/AddBankDetailsForm';
import { BankDetailsView } from '@/components/features/BankDetailsView';
import { Button } from '@/components/ui/Button';
import { BankDetail, TransactionDetail } from '@/types';
import { Upload, Plus } from 'lucide-react';

// Generate mock transactions for bank details
const generateMockTransactions = (): TransactionDetail[] => {
  return [
    { id: 'EXP00025', date: '22 Feb 2025', referenceNumber: 'PO-202402-012', description: 'Payment for raw materials', hasAttachment: true, amount: '$10,000', paymentMode: 'Cash', status: 'Paid' },
    { id: 'EXP00024', date: '07 Feb 2025', referenceNumber: 'INV00025', description: 'Purchase of packaging materials', hasAttachment: true, amount: '$25,750', paymentMode: 'Cheque', status: 'Pending' },
    { id: 'EXP00023', date: '30 Jan 2025', referenceNumber: 'PO-202401-011', description: 'Payment for electronic components', hasAttachment: true, amount: '$50,125', paymentMode: 'Cash', status: 'Cancelled' },
    { id: 'EXP00019', date: '02 Dec 2024', referenceNumber: 'UTI20241219', description: 'Electricity bill', hasAttachment: true, amount: '$2,50,000', paymentMode: 'Cash', status: 'Paid' },
    { id: 'EXP00018', date: '15 Nov 2024', referenceNumber: 'PO-202411-008', description: 'Purchase of office furniture', hasAttachment: true, amount: '$5,00,750', paymentMode: 'Cheque', status: 'Pending' },
    { id: 'EXP00017', date: '30 Nov 2024', referenceNumber: 'PO-202411-007', description: 'Purchase of manufacturing tools', hasAttachment: true, amount: '$7,50,300', paymentMode: 'Cheque', status: 'Cancelled' },
    { id: 'EXP00016', date: '12 Oct 2024', referenceNumber: 'REF17420', description: 'Server maintenance costs', hasAttachment: true, amount: '$9,99,999', paymentMode: 'Cash', status: 'Paid' },
    { id: 'EXP00015', date: '05 Oct 2024', referenceNumber: 'REF16302', description: 'Digital marketing campaign', hasAttachment: true, amount: '$87,650', paymentMode: 'Cheque', status: 'Pending' },
    { id: 'EXP00014', date: '09 Sep 2024', referenceNumber: 'REF15035', description: 'Equipment repairs and servicing', hasAttachment: true, amount: '$69,420', paymentMode: 'Cash', status: 'Cancelled' },
    { id: 'EXP00013', date: '02 Sep 2024', referenceNumber: 'REF14710', description: 'Renovation of office workspace', hasAttachment: true, amount: '$33,210', paymentMode: 'Cheque', status: 'Paid' },
  ];
};

export default function BankDetailsPage() {
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [bankDetail, setBankDetail] = useState<BankDetail | null>(null);

  const transactions = useMemo(() => generateMockTransactions(), []);

  // Mock existing bank details
  const mockBankDetail: BankDetail = useMemo(() => ({
    name: 'Dasari Chandra Shekhar',
    accountNumber: '8797898899977',
    ifscCode: 'UB1145788877',
  }), []);

  const handleFormSubmit = (data: {
    name: string;
    accountNumber: string;
    reEnterAccountNumber: string;
    ifscCode: string;
    checkImage?: File;
  }) => {
    setBankDetail({
      name: data.name,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
    });
    setHasBankDetails(true);
    // In a real app, you would send this data to your API
    console.log('Bank details submitted:', data);
  };

  const handleEdit = () => {
    setHasBankDetails(false);
  };

  const handleViewCheck = () => {
    // In a real app, this would open a modal or navigate to view the check image
    alert('View check functionality - would open check image');
  };

  return (
    <main className="space-y-6" role="main" aria-label="Bank Details page">
      {/* Page Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Bank Details</h1>
        {hasBankDetails && (
          <div className="flex items-center gap-3" role="toolbar" aria-label="Bank details actions">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4"
              aria-label="Export bank details"
              type="button"
            >
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Export</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="h-10 px-4"
              aria-label="Add new bank detail"
              type="button"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Add Item</span>
            </Button>
          </div>
        )}
      </div>

      {/* Show form if no bank details, otherwise show view */}
      {!hasBankDetails ? (
        <AddBankDetailsForm onSubmit={handleFormSubmit} />
      ) : (
        <BankDetailsView
          bankDetail={bankDetail || mockBankDetail}
          transactions={transactions}
          onEdit={handleEdit}
          onViewCheck={handleViewCheck}
        />
      )}

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 mt-8 gap-2">
        <p>© 2025 ZuGet, All Rights Reserved</p>
        <p>Version: 1.3.8</p>
      </footer>
    </main>
  );
}
