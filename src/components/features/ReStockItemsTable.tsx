'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Item } from '@/types';
import { Search, Filter, ChevronRight, ChevronLeft, Upload, Plus, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ReStockItemsTableProps {
  items: Item[];
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
const ReStockTableRow = memo<{ item: Item }>(({ item }) => {
  const productIcon = item.productIcon && isValidReactNode(item.productIcon) ? item.productIcon : null;
  
  return (
    <tr className="table-row cursor-pointer" role="row">
      <td className="table-cell text-primary font-medium" role="gridcell">{item.id}</td>
      <td className="table-cell" role="gridcell">
        <div className="flex items-center gap-2">
          {productIcon && (
            <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-slate-700" aria-hidden="true">
              {productIcon}
            </div>
          )}
          <span className="text-primary">{item.product}</span>
        </div>
      </td>
      <td className="table-cell" role="gridcell">{item.category}</td>
      <td className="table-cell text-primary font-medium" role="gridcell">{item.quantity.toLocaleString()}</td>
      <td className="table-cell text-xs" role="gridcell">{item.sizes}</td>
      <td className="table-cell text-primary font-medium" role="gridcell">{item.price}</td>
      <td className="table-cell" role="gridcell">
        <span className="badge-success px-2 py-1 rounded text-xs flex items-center gap-1 w-fit">
          <CheckCircle className="w-3 h-3" aria-hidden="true" />
          Stock In
        </span>
      </td>
      <td className="table-cell" role="gridcell">
        <Link href={`/inventory/${item.id}`} aria-label={`View details for item ${item.id}`}>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  );
});

ReStockTableRow.displayName = 'ReStockTableRow';

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

export const ReStockItemsTable: React.FC<ReStockItemsTableProps> = ({ items }) => {
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

  // Filter items - memoized
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.product.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Sort items - memoized
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    switch (sortBy) {
      case 'latest':
        return sorted.reverse();
      case 'name':
        return sorted.sort((a, b) => a.product.localeCompare(b.product));
      case 'quantity':
        return sorted.sort((a, b) => b.quantity - a.quantity);
      default:
        return sorted;
    }
  }, [filteredItems, sortBy]);

  // Pagination calculations - memoized
  const { totalPages, startIndex, endIndex, paginatedItems } = useMemo(() => {
    const total = Math.ceil(sortedItems.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = sortedItems.slice(start, end);
    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      paginatedItems: paginated,
    };
  }, [sortedItems, currentPage, itemsPerPage]);

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
        <h1 className="text-2xl font-bold text-primary">Re Stock Item</h1>
        <div className="flex items-center gap-3" role="toolbar" aria-label="Item actions">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Export items"
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search" aria-label="Search and filter items">
        <div className="flex-1">
          <label htmlFor="item-search" className="sr-only">
            Search items by product name, category, or ID
          </label>
          <Input
            id="item-search"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" aria-hidden="true" />}
            className="w-full"
            aria-label="Search items"
            aria-describedby="search-description"
          />
          <span id="search-description" className="sr-only">
            Search items by product name, category, or ID
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
            aria-label="Sort items"
          >
            <option value="latest">Latest</option>
            <option value="name">Name</option>
            <option value="quantity">Quantity</option>
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
              aria-label="Re stock items inventory table"
              aria-rowcount={sortedItems.length}
            >
              <caption className="sr-only">
                Table showing re stock items with ID, product name, category, quantity, sizes, price, and stock status
              </caption>
              <thead>
                <tr role="row">
                  <th className="table-header" scope="col" role="columnheader">Id</th>
                  <th className="table-header" scope="col" role="columnheader">Product</th>
                  <th className="table-header" scope="col" role="columnheader">Category</th>
                  <th className="table-header" scope="col" role="columnheader">Quantity</th>
                  <th className="table-header" scope="col" role="columnheader">Sizes</th>
                  <th className="table-header" scope="col" role="columnheader">Price</th>
                  <th className="table-header" scope="col" role="columnheader">Stock Status</th>
                  <th className="table-header w-12" scope="col" role="columnheader">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <ReStockTableRow key={item.id} item={item} />
                  ))
                ) : (
                  <tr role="row">
                    <td colSpan={8} className="table-cell text-center text-secondary py-8" role="gridcell">
                      <span role="status" aria-live="polite">No items found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <nav aria-label="Items pagination">
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

