'use client';

import React from 'react';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { CheckCircle } from 'lucide-react';

export default function CompletedOrdersPage() {
  return <ComingSoon title="Completed Orders" icon={CheckCircle} />;
}

