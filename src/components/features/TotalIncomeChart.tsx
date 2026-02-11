'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TotalIncomeChartProps {
  data: { name: string; value: number }[];
  totalIncome: string;
  comparison: string;
}

export const TotalIncomeChart: React.FC<TotalIncomeChartProps> = ({
  data,
  totalIncome,
  comparison,
}) => {
  return (
    <Card>
      <CardHeader
        title="Total Income on Invoice"
        subtitle={`${totalIncome} ${comparison}`}
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

