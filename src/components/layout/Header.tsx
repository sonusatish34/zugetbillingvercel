'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, Moon, Sun, Plus, Menu } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DateRangePicker, type DateRange } from '@/components/ui/DateRangePicker';
import { useTheme } from '@/contexts/ThemeContext';
import { SIDEBAR_MENU } from '@/lib/constants';

interface HeaderProps {
  onMenuClick?: () => void;
}

// Helper function to get page title and breadcrumbs from pathname
const getPageInfo = (pathname: string) => {
  // Dashboard
  if (pathname === '/') {
    return {
      title: 'Dashboard',
      breadcrumbs: ['Home', 'Dashboard'],
    };
  }

  // Billing System
  if (pathname === '/billing') {
    return {
      title: 'Billing System',
      breadcrumbs: ['Home', 'Billing System'],
    };
  }
  if (pathname === '/discounts') {
    return {
      title: 'discounts',
      breadcrumbs: ['Home', 'discounts'],
    };
  }

  // Search through all menu items
  const allMenuItems = [
    { label: 'Dashboard', href: '/', parent: null },
    { label: 'Billing System', href: '/billing', parent: null },
    ...(SIDEBAR_MENU.onlineOrders.children?.map((item) => ({
      label: item.label,
      href: item.href,
      parent: 'Online Orders',
    })) || []),
    ...(SIDEBAR_MENU.inventory.children?.map((item) => ({
      label: item.label,
      href: item.href,
      parent: 'Inventory',
    })) || []),
    ...(SIDEBAR_MENU.finance.children?.map((item) => ({
      label: item.label,
      href: item.href,
      parent: 'Finance & Accounts',
    })) || []),
    ...(SIDEBAR_MENU.manage.children?.map((item) => ({
      label: item.label,
      href: item.href,
      parent: 'Manage',
    })) || []),
  ];

  const currentItem = allMenuItems.find((item) => item.href === pathname);

  if (currentItem) {
    return {
      title: currentItem.label,
      breadcrumbs: currentItem.parent
        ? ['Home', currentItem.parent, currentItem.label]
        : ['Home', currentItem.label],
    };
  }

  // Handle dynamic routes
  if (pathname.startsWith('/manage/employees/')) {
    return {
      title: 'Employee Details',
      breadcrumbs: ['Home', 'Employees'],
    };
  }

  if (pathname.startsWith('/inventory/') && pathname !== '/inventory/total' && pathname !== '/inventory/low-quantity' && pathname !== '/inventory/add' && pathname !== '/inventory/restock' && pathname !== '/inventory/offline-orders') {
    return {
      title: 'Item Details',
      breadcrumbs: ['Home', 'Inventory', 'Item Details'],
    };
  }

  if (pathname.startsWith('/orders/') && pathname !== '/orders/upcoming' && pathname !== '/orders/in-delivery' && pathname !== '/orders/completed' && pathname !== '/orders/return' && pathname !== '/orders/cancelled' && pathname !== '/orders/replaced') {
    return {
      title: 'Order Details',
      breadcrumbs: ['Home', 'Online Orders', 'Order Details'],
    };
  }

  // Default fallback
  return {
    title: 'Dashboard',
    breadcrumbs: ['Home', 'Dashboard'],
  };
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 7);
    return {
      startDate: thirtyDaysAgo,
      endDate: today,
    };
  });

  const pageInfo = useMemo(() => getPageInfo(pathname), [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      {/* Main Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Mobile Menu Button and Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex flex-col min-w-0 flex-1">
            <nav className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 overflow-hidden text-ellipsis">
              {pageInfo.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="mx-1 sm:mx-2">/</span>}
                  <span
                    className={
                      index === pageInfo.breadcrumbs.length - 1
                        ? 'text-gray-900 dark:text-gray-100 font-medium'
                        : ''
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
          {/* Search - Hidden on mobile */}
          {/* Date Range Picker */}
          <div className="hidden lg:block w-56 lg:w-72">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
            />
          </div>
          <div className="hidden md:block lg:w-64">
            <Input
              type="text"
              placeholder="Search"
              icon={<Search className="w-4 h-4" />}
              className="w-full text-sm"
            />

          </div>


          {/* Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={toggleTheme}
              className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {isMounted ? (
                theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                )
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">S</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search - Visible on mobile/tablet */}
      <div className="hidden md:hidden px-3 sm:px-4 pb-3 space-y-2">
        <Input
          type="text"
          placeholder="Search"
          icon={<Search className="w-4 h-4" />}
          className="w-full text-sm"
        />
      </div>
    </header>
  );
};

