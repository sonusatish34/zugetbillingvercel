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
        <h3 className="text-lg font-semibold text-primary mb-4">Sales Analytics</h3>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-start gap-2">
                <IconComponent className="w-5 h-5 icon-purple mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xl font-bold text-primary">{item.value}</p>
                  <p className="text-sm text-secondary mt-1">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

