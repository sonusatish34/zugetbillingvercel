'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TransactionsTable } from './TransactionsTable';
import { BankDetail, TransactionDetail } from '@/types';
import { ChevronRight, Edit, Eye } from 'lucide-react';

interface BankDetailsViewProps {
  bankDetail: BankDetail;
  transactions: TransactionDetail[];
  onEdit?: () => void;
  onViewCheck?: () => void;
}

export const BankDetailsView: React.FC<BankDetailsViewProps> = ({
  bankDetail,
  transactions,
  onEdit,
  onViewCheck,
}) => {
  return (
    <div className="space-y-6">
      {/* Bank Account Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-primary">Bank Details</h2>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4"
                onClick={onViewCheck}
                aria-label="View check"
                type="button"
              >
                <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>View Check</span>
                <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                className="h-10 px-4"
                onClick={onEdit}
                aria-label="Edit bank details"
                type="button"
              >
                <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary mb-1">Name</p>
              <p className="text-base font-medium text-primary">{bankDetail.name}</p>
            </div>
            <div>
              <p className="text-sm text-secondary mb-1">Account Number</p>
              <p className="text-base font-medium text-primary">{bankDetail.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-secondary mb-1">IFSC Code</p>
              <p className="text-base font-medium text-primary">{bankDetail.ifscCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <TransactionsTable transactions={transactions} />
    </div>
  );
};

