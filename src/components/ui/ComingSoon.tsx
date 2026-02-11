'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

export interface ComingSoonProps {
  title: string;
  icon: LucideIcon;
  description?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  icon: Icon,
  description = "This page will be available soon. We're working on building this feature for you.",
}) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
          <p className="text-secondary mb-6">{description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <span className="text-sm text-accent font-medium">Coming Soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

