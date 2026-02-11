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
    thirtyDaysAgo.setDate(today.getDate() - 29);
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
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Mobile Menu Button and Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex flex-col">
            <nav className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">
              {pageInfo.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="mx-2">/</span>}
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="hidden md:block w-48 lg:w-64">
            <Input
              type="text"
              placeholder="Search"
              icon={<Search className="w-4 h-4" />}
              className="w-full"
            />
          </div>

          {/* Date Range Picker */}
          <div className="hidden lg:block w-56">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
            />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={toggleTheme}
              className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMounted ? (
                theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs md:text-sm font-medium">S</span>
              </div>
            </button>
          </div>

          {/* Create New Button */}
          <Button
            variant="primary"
            size="sm"
            className="hidden lg:flex items-center gap-2 text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xl:inline">Create New</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

