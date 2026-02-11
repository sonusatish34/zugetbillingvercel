'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartData } from '@/types';

interface RevenueChartProps {
  data: ChartData[];
  totalRevenue: string;
  change: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  totalRevenue,
  change,
}) => {
  return (
    <Card>
      <CardHeader
        title="Revenue"
        subtitle={`Total Revenue ${totalRevenue} ${change}`}
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
            <Legend />
            <Bar dataKey="received" fill="#9333ea" name="Total Received" radius={[8, 8, 0, 0]} />
            <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

