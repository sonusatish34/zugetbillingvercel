'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
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
  LogOut,
  Upload,
  DatabaseZapIcon,
  BadgeIndianRupee,

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
  '/inventory/upload': Upload,
  '/discounts': BadgeIndianRupee,
  '/inventory/ziptocsv': DatabaseZapIcon,
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


  const handleLogout = async () => {
    const confirmUpdate = await Swal.fire({
      title: `Logout Confirmation`,
      text: `Are you sure you want to Logout ?`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: `Yes `,
      cancelButtonText: 'Cancel',
    });


    if (confirmUpdate.isConfirmed) {
      try {

        localStorage.clear();
        location.reload()
        Swal.fire('Logout!', 'Logged Out successfully.', 'success');
        
        


      } catch (error) {
        Swal.fire('ErrorSomething went wrong');
      }
    }
  };
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
          onClick={onClose}
        >
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Icon className="w-3 h-3 md:w-4 md:h-4" />
            <span className="truncate">{item.label}</span>
          </div>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-secondary shrink-0" />
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
          'fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col z-50 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs md:text-sm">Z</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">ZuGet</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-1">
          {/* Dashboard Link */}
          <div className="section-gap">
            <Link
              href="/"
              className={cn(
                'sidebar-item',
                pathname === '/' ? 'sidebar-item-active' : 'sidebar-item-inactive'
              )}
              onClick={onClose}
            >
              <span className="text-sm md:text-base">Dashboard</span>
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
              onClick={onClose}
            >
              <span className="text-xs md:text-sm font-medium">Billing System</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-auto" />
            </Link>
          </div>

          {/* Online Orders */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs md:text-sm font-medium">Online Orders</span>
            </div>
            <div className="ml-3 md:ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.onlineOrders.children && renderSubmenuItems(SIDEBAR_MENU.onlineOrders.children)}
            </div>
          </div>

          {/* Inventory */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs md:text-sm font-medium">Inventory</span>
            </div>
            <div className="ml-3 md:ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.inventory.children && renderSubmenuItems(SIDEBAR_MENU.inventory.children)}
            </div>
          </div>

          {/* Finance & Accounts */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs md:text-sm font-medium">Finance & Accounts</span>
            </div>
            <div className="ml-3 md:ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.finance.children && renderSubmenuItems(SIDEBAR_MENU.finance.children)}
            </div>
          </div>

          {/* Manage */}
          <div className="section-gap">
            <div className="sidebar-item sidebar-item-inactive">
              <span className="text-xs md:text-sm font-medium">Manage</span>
            </div>
            <div className="ml-3 md:ml-4 mt-1 space-y-1">
              {SIDEBAR_MENU.manage.children && renderSubmenuItems(SIDEBAR_MENU.manage.children)}
            </div>
          </div>

          {/* Logout */}
          <div onClick={() => handleLogout()} className='text-xs md:text-sm px-4 md:px-6 mt-4'>
            <p className='flex items-center gap-x-2 bg-red-200 py-2 cursor-pointer px-2 rounded-md text-red-600 font-medium hover:bg-red-300 transition-colors'>
              <span><LogOut className='w-3 h-3 md:w-4 md:h-4' /></span><span>Logout</span>
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
};

