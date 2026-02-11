'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderItem } from '@/types';
import { Search, Filter, ChevronRight, ChevronLeft, Upload, Plus, Check, X } from 'lucide-react';
import Link from 'next/link';

interface OfflineOrdersTableProps {
  orders: OrderItem[];
}

// Helper function to check if value is a valid React node
const isValidReactNode = (value: unknown): value is React.ReactNode => {
  return value !== null && value !== undefined && (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (typeof value === 'object' && '$$typeof' in value) ||
    React.isValidElement(value)
  );
};

// Memoized table row component for performance
const OfflineOrderTableRow = memo<{ 
  order: OrderItem; 
  onStockIn: (id: string) => void; 
  onStockOut: (id: string) => void;
}>(({ order, onStockIn, onStockOut }) => {
  const productIcon = order.productIcon && isValidReactNode(order.productIcon) ? order.productIcon : null;
  
  return (
    <tr className="table-row" role="row">
      <td className="table-cell text-primary font-medium" role="gridcell">{order.id}</td>
      <td className="table-cell" role="gridcell">
        <div className="flex items-center gap-2">
          {productIcon && (
            <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-slate-700" aria-hidden="true">
              {productIcon}
            </div>
          )}
          <span className="text-primary">{order.product}</span>
        </div>
      </td>
      <td className="table-cell" role="gridcell">{order.category}</td>
      <td className="table-cell" role="gridcell">{order.quantity}</td>
      <td className="table-cell text-primary font-medium" role="gridcell">{order.price}</td>
      <td className="table-cell" role="gridcell">{order.orderCreatedTime}</td>
      <td className="table-cell" role="gridcell">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
            onClick={() => onStockIn(order.id)}
            aria-label={`Stock in for order ${order.id}`}
            type="button"
          >
            <Check className="w-3 h-3 mr-1" aria-hidden="true" />
            Stock In
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={() => onStockOut(order.id)}
            aria-label={`Stock out for order ${order.id}`}
            type="button"
          >
            <X className="w-3 h-3 mr-1" aria-hidden="true" />
            Stock Out
          </Button>
        </div>
      </td>
      <td className="table-cell" role="gridcell">
        <Link href={`/orders/${order.id}`} aria-label={`View details for order ${order.id}`}>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  );
});

OfflineOrderTableRow.displayName = 'OfflineOrderTableRow';

// Memoized pagination button component
const PaginationButton = memo<{
  page: number;
  isActive: boolean;
  onClick: () => void;
}>(({ page, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={`Go to page ${page}`}
    aria-current={isActive ? 'page' : undefined}
    className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-secondary hover:bg-gray-100 dark:hover:bg-slate-800'
    }`}
  >
    <span className="sr-only">{isActive ? 'Current page' : ''}</span>
    {page}
  </button>
));

PaginationButton.displayName = 'PaginationButton';

export const OfflineOrdersTable: React.FC<OfflineOrdersTableProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const itemsPerPage = 10;

  // Memoized handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleStockIn = useCallback((id: string) => {
    // TODO: Implement stock in logic
    console.log('Stock In:', id);
  }, []);

  const handleStockOut = useCallback((id: string) => {
    // TODO: Implement stock out logic
    console.log('Stock Out:', id);
  }, []);

  // Filter orders - memoized
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.product.toLowerCase().includes(query) ||
        order.category.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.orderStatus.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  // Sort orders - memoized
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    switch (sortBy) {
      case 'latest':
        return sorted.reverse();
      case 'name':
        return sorted.sort((a, b) => a.product.localeCompare(b.product));
      case 'status':
        return sorted.sort((a, b) => a.orderStatus.localeCompare(b.orderStatus));
      default:
        return sorted;
    }
  }, [filteredOrders, sortBy]);

  // Pagination calculations - memoized
  const { totalPages, startIndex, endIndex, paginatedOrders } = useMemo(() => {
    const total = Math.ceil(sortedOrders.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = sortedOrders.slice(start, end);
    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      paginatedOrders: paginated,
    };
  }, [sortedOrders, currentPage, itemsPerPage]);

  // Memoized pagination page numbers
  const paginationPages = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 15) }, (_, i) => i + 1);
  }, [totalPages]);

  // Memoized next page handler
  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  return (
    <div className="space-y-6">
      {/* Page Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Offline Orders</h1>
        <div className="flex items-center gap-3" role="toolbar" aria-label="Order actions">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Export orders"
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Export</span>
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Add new item"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Search, Filter, and Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search" aria-label="Search and filter orders">
        <div className="flex-1">
          <label htmlFor="order-search" className="sr-only">
            Search orders by product name, category, ID, or status
          </label>
          <Input
            id="order-search"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" aria-hidden="true" />}
            className="w-full"
            aria-label="Search orders"
            aria-describedby="search-description"
          />
          <span id="search-description" className="sr-only">
            Search orders by product name, category, ID, or status
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 px-4"
          aria-label="Open filter options"
          type="button"
        >
          <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Filter</span>
        </Button>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-secondary whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={handleSortChange}
            className="input-base h-10 px-3 text-sm min-w-[120px]"
            aria-label="Sort orders"
          >
            <option value="latest">Latest</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table 
              className="w-full"
              role="table"
              aria-label="Offline orders table"
              aria-rowcount={sortedOrders.length}
            >
              <caption className="sr-only">
                Table showing offline orders with ID, product name, category, quantity, price, order created time, stock actions, and order details
              </caption>
              <thead>
                <tr role="row">
                  <th className="table-header" scope="col" role="columnheader">Id</th>
                  <th className="table-header" scope="col" role="columnheader">Product</th>
                  <th className="table-header" scope="col" role="columnheader">Category</th>
                  <th className="table-header" scope="col" role="columnheader">Quantity</th>
                  <th className="table-header" scope="col" role="columnheader">Price</th>
                  <th className="table-header" scope="col" role="columnheader">Order Created Time</th>
                  <th className="table-header" scope="col" role="columnheader">Stock In/Out</th>
                  <th className="table-header w-12" scope="col" role="columnheader">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <OfflineOrderTableRow 
                      key={order.id} 
                      order={order}
                      onStockIn={handleStockIn}
                      onStockOut={handleStockOut}
                    />
                  ))
                ) : (
                  <tr role="row">
                    <td colSpan={8} className="table-cell text-center text-secondary py-8" role="gridcell">
                      <span role="status" aria-live="polite">No orders found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <nav aria-label="Orders pagination">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-sm text-secondary">
              Showing
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              className="input-base h-9 px-2 text-sm min-w-[80px]"
              aria-label="Items per page"
              disabled
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-secondary">Results</span>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Pagination controls">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="flex items-center gap-1" role="list" aria-label="Page numbers">
              {paginationPages.map((page) => (
                <div key={page} role="listitem">
                  <PaginationButton
                    page={page}
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                  />
                </div>
              ))}
              {totalPages > 15 && (
                <>
                  <span className="px-2 text-secondary" aria-hidden="true">...</span>
                  <div role="listitem">
                    <PaginationButton
                      page={totalPages}
                      isActive={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                    />
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
              type="button"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};

