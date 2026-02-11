'use client';

import React from 'react';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { XCircle } from 'lucide-react';

export default function CancelledOrdersPage() {
  return <ComingSoon title="Cancelled Orders" icon={XCircle} />;
}

