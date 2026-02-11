'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  X,
  Clock,
  Truck,
  CheckCircle,
  RotateCcw,
  XCircle,
  RefreshCw,
  Package,
  AlertTriangle,
  PlusCircle,
  PackagePlus,
  ShoppingCart,
  CreditCard,
  Receipt,
  Building2,
  Users,
  Headphones,
  Ticket,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SIDEBAR_MENU } from '@/lib/constants';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Icon mapping for menu items
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '/orders/upcoming': Clock,
  '/orders/in-delivery': Truck,
  '/orders/completed': CheckCircle,
  '/orders/return': RotateCcw,
  '/orders/cancelled': XCircle,
  '/orders/replaced': RefreshCw,
  '/inventory/total': Package,
  '/inventory/low-quantity': AlertTriangle,
  '/inventory/add': PlusCircle,
  '/inventory/restock': PackagePlus,
  '/inventory/offline-orders': ShoppingCart,
  '/finance/payments': CreditCard,
  '/finance/transactions': Receipt,
  '/finance/bank-details': Building2,
  '/manage/employees': Users,
  '/manage/customer-care': Headphones,
  '/manage/tickets': Ticket,
  '/manage/profile': User,
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();

  const renderSubmenuItems = (items: { label: string; href?: string }[]) => {
    return items.map((item) => {
      const Icon = ICON_MAP[item.href || ''] || ChevronRight;
      return (
        <Link
          key={item.href}
          href={item.href || '#'}
          className={cn(
            'sidebar-submenu-item',
            pathname === item.href
              ? 'sidebar-submenu-item-active'
              : 'sidebar-submenu-item-inactive'
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary" />
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col z-50 transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ZuGet</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {/* Dashboard Link */}
          <div className="section-gap">
            <Link
              href="/"
              className={cn(
                'sidebar-item',
                pathname === '/' ? 'sidebar-item-active' : 'sidebar-item-inactive'
              )}
            >
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Billing System */}
          <div className="section-gap">
            <Link
              href="/billing"
              className={cn(
                'sidebar-item',
                pathname === '/billing' ? 'sidebar-item-active' : 'sidebar-item-inactive'
              )}
            >
              <span className="text-xs font-medium">Billing System</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Link>
          </div>

          {/* Online Orders */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs font-medium">Online Orders</span>
            </div>
            <div className="ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.onlineOrders.children && renderSubmenuItems(SIDEBAR_MENU.onlineOrders.children)}
            </div>
          </div>

          {/* Inventory */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs font-medium">Inventory</span>
            </div>
            <div className="ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.inventory.children && renderSubmenuItems(SIDEBAR_MENU.inventory.children)}
            </div>
          </div>

          {/* Finance & Accounts */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs font-medium">Finance & Accounts</span>
            </div>
            <div className="ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.finance.children && renderSubmenuItems(SIDEBAR_MENU.finance.children)}
            </div>
          </div>

          {/* Manage */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs font-medium">Manage</span>
            </div>
            <div className="ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.manage.children && renderSubmenuItems(SIDEBAR_MENU.manage.children)}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

