import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText, Users, DollarSign, ShoppingCart } from 'lucide-react';
import { OverviewStats } from '@/types';

interface OverviewCardsProps {
  stats: OverviewStats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  const items = [
    { label: 'Invoices', value: stats.invoices.toLocaleString(), icon: FileText },
    { label: 'Customers', value: stats.customers.toLocaleString(), icon: Users },
    { label: 'Amount Due', value: stats.amountDue, icon: DollarSign },
    { label: 'Today Orders', value: stats.todayOrders.toLocaleString(), icon: ShoppingCart },
  ];

  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold text-primary mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <IconComponent className="w-5 h-5 icon-purple" />
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                </div>
                <p className="text-sm text-secondary">{item.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

