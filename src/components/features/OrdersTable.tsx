'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderItem } from '@/types';
import { Search, Filter, ChevronRight, ChevronLeft, Upload, Plus } from 'lucide-react';
import Link from 'next/link';

interface OrdersTableProps {
  orders: OrderItem[];
  title: string;
  showOrderFrom?: boolean;
  showAmountStatus?: boolean;
}

// Memoized table row component for performance
const OrderTableRow = memo<{ order: OrderItem; showOrderFrom?: boolean; showAmountStatus?: boolean }>(({ order, showOrderFrom, showAmountStatus }) => (
  <tr className="table-row cursor-pointer" role="row">
    <td className="table-cell text-primary font-medium" role="gridcell">{order.id}</td>
    <td className="table-cell" role="gridcell">
      <div className="flex items-center gap-2">
        {/* {order.productIcon && (
          <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-slate-700" aria-hidden="true">
            {order.productIcon}
          </div>
        )} */}
        <span className="text-primary">{order.product}</span>
      </div>
    </td>
    <td className="table-cell" role="gridcell">{order.category}</td>
    <td className="table-cell" role="gridcell">{order.quantity}</td>
    <td className="table-cell text-primary font-medium" role="gridcell">{order.price}</td>
    <td className="table-cell" role="gridcell">{order.orderCreatedTime}</td>
    {order.pickupTime && (
      <td className="table-cell" role="gridcell">{order.pickupTime}</td>
    )}
    <td className="table-cell" role="gridcell">
      <span className="badge-info px-2 py-1 rounded text-xs">{order.orderStatus}</span>
    </td>
    {showOrderFrom && order.orderFrom && (
      <td className="table-cell" role="gridcell">{order.orderFrom}</td>
    )}
    {showAmountStatus && order.amountStatus && (
      <td className="table-cell" role="gridcell">
        <span className={`px-2 py-1 rounded text-xs ${
          order.amountStatus === 'Received' 
            ? 'badge-success' 
            : 'badge-info'
        }`}>
          {order.amountStatus}
        </span>
      </td>
    )}
    <td className="table-cell" role="gridcell">
      <Link href={`/orders/${order.id}`} aria-label={`View details for order ${order.id}`}>
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      </Link>
    </td>
  </tr>
));

OrderTableRow.displayName = 'OrderTableRow';

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

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, title, showOrderFrom, showAmountStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const itemsPerPage = 10;

  // Memoized search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  // Memoized sort handler
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  // Memoized page change handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  // Filter orders based on search query - memoized
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

  const hasPickupTime = orders.length > 0 && orders[0]?.pickupTime;
  const columnCount = 7 + (hasPickupTime ? 1 : 0) + (showOrderFrom ? 1 : 0) + (showAmountStatus ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Page Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
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
            <span ><Link href={'/test'}>Add Item</Link> </span>
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
              aria-label={`${title} table`}
              aria-rowcount={sortedOrders.length}
            >
              <caption className="sr-only">
                Table showing {title.toLowerCase()} with ID, product name, category, quantity, price, order created time, and order status
              </caption>
              <thead>
                <tr role="row">
                  <th className="table-header" scope="col" role="columnheader">Id</th>
                  <th className="table-header" scope="col" role="columnheader">Product</th>
                  <th className="table-header" scope="col" role="columnheader">Category</th>
                  <th className="table-header" scope="col" role="columnheader">Quantity</th>
                  <th className="table-header" scope="col" role="columnheader">Price</th>
                  <th className="table-header" scope="col" role="columnheader">Order Created Time</th>
                  {orders[0]?.pickupTime && (
                    <th className="table-header" scope="col" role="columnheader">Pickup Time</th>
                  )}
                  <th className="table-header" scope="col" role="columnheader">Order Status</th>
                  {showOrderFrom && (
                    <th className="table-header" scope="col" role="columnheader">Order From</th>
                  )}
                  {showAmountStatus && (
                    <th className="table-header" scope="col" role="columnheader">Amount Status</th>
                  )}
                  <th className="table-header w-12" scope="col" role="columnheader">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <OrderTableRow 
                      key={order.id} 
                      order={order} 
                      showOrderFrom={showOrderFrom}
                      showAmountStatus={showAmountStatus}
                    />
                  ))
                ) : (
                  <tr role="row">
                    <td colSpan={columnCount} className="table-cell text-center text-secondary py-8" role="gridcell">
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
      <nav aria-label={`${title} pagination`}>
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

