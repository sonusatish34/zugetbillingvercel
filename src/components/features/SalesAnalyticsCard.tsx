import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { DollarSign, Package, TrendingUp, ShoppingBag } from 'lucide-react';
import { SalesAnalytics } from '@/types';

interface SalesAnalyticsCardProps {
  data: SalesAnalytics;
}

export const SalesAnalyticsCard: React.FC<SalesAnalyticsCardProps> = ({ data }) => {
  const items = [
    { label: 'Total Sales', value: data.totalSales, icon: DollarSign },
    { label: 'Purchase', value: data.purchase, icon: Package },
    { label: 'DEC Sales', value: data.decSales, icon: TrendingUp },
    { label: 'DEC Orders', value: data.decOrders.toLocaleString(), icon: ShoppingBag },
  ];

  return (
    <Card>
      <CardContent>
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Sales Analytics</h3>
        <div className="responsive-grid">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-start gap-2">
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 icon-purple mt-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">{item.value}</p>
                  <p className="text-xs sm:text-sm text-secondary mt-1 truncate">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

