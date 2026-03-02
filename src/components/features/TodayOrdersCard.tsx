import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface TodayOrdersCardProps {
  onlineSales: string;
  onlineOrders: number;
  offlineSales: string;
  offlineOrders: number;
}

export const TodayOrdersCard: React.FC<TodayOrdersCardProps> = ({
  onlineSales,
  onlineOrders,
  offlineSales,
  offlineOrders,
}) => {
  return (
    <Card>
      <CardHeader title="Today Orders" />
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* Online Section */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Online</h4>
            <div className="space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sales:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{onlineSales}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Orders:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {onlineOrders.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Offline Section */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Offline</h4>
            <div className="space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sales:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{offlineSales}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Orders:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {offlineOrders.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

