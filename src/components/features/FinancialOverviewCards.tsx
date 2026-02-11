'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { FinancialOverview } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialOverviewCardsProps {
  overviews: FinancialOverview[];
}

export const FinancialOverviewCards: React.FC<FinancialOverviewCardsProps> = ({ overviews }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviews.map((overview, index) => {
        const IconComponent = overview.icon;
        const isPositive = overview.trendType === 'up';
        
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${overview.iconColor}`}>
                  <IconComponent className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary mb-1">{overview.value}</p>
              <p className="text-sm text-secondary mb-2">{overview.label}</p>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{overview.trend}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

