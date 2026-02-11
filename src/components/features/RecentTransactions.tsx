import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Transaction } from '@/types';

interface RecentTransactionsProps {
  todayTransactions: Transaction[];
  yesterdayTransactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  todayTransactions,
  yesterdayTransactions,
}) => {
  return (
    <Card>
      <CardHeader title="Recent Transactions" />
      <CardContent>
        <div className="space-y-6">
          {/* Today Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Today</h4>
            <div className="space-y-3">
              {todayTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.invoiceId}</p>
                  </div>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{transaction.amount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Yesterday</h4>
            <div className="space-y-3">
              {yesterdayTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.invoiceId}</p>
                  </div>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{transaction.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

