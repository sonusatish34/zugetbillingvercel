import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { InvoiceStatistics } from '@/types';

interface InvoiceStatisticsCardProps {
  data: InvoiceStatistics;
}

export const InvoiceStatisticsCard: React.FC<InvoiceStatisticsCardProps> = ({ data }) => {
  const items = [
    { label: 'Invoiced', value: data.invoiced, icon: FileText },
    { label: 'Received', value: data.received, icon: CheckCircle },
    { label: 'Outstanding', value: data.outstanding, icon: AlertCircle },
    { label: 'Total', value: data.total, icon: Plus },
  ];

  return (
    <Card>
      <CardContent>
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Invoice Statistics</h3>
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

