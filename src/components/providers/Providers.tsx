'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <ThemeProvider>
      {isLoginPage ? (
        children
      ) : (
        <DashboardLayout>{children}</DashboardLayout>
      )}
    </ThemeProvider>
  );
}

