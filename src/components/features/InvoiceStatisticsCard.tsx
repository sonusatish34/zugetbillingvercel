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
        <h3 className="text-lg font-semibold text-primary mb-4">Invoice Statistics</h3>
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

