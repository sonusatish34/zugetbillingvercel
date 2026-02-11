'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmployeeDetail, AddedItem } from '@/types';
import { ArrowLeft, Upload, Plus, Filter, Trash2, ChevronRight, ChevronLeft, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface EmployeeDetailsProps {
  employeeDetail: EmployeeDetail;
  onDelete?: (id: string) => void;
}

// Memoized added item table row
const AddedItemRow = memo<{ item: AddedItem }>(({ item }) => {
  const isValidReactNode = (node: unknown): node is React.ReactNode => {
    return node !== null && node !== undefined && (typeof node === 'string' || typeof node === 'number' || React.isValidElement(node));
  };

  return (
    <tr className="table-row" role="row">
      <td className="table-cell" role="gridcell">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          {item.itemIcon && isValidReactNode(item.itemIcon) ? (
            <div className="w-full h-full flex items-center justify-center">
              {item.itemIcon}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-slate-600 rounded-full" />
          )}
        </div>
      </td>
      <td className="table-cell text-primary font-medium" role="gridcell">{item.itemName}</td>
      <td className="table-cell" role="gridcell">{item.category}</td>
      <td className="table-cell" role="gridcell">{item.sizeQuantity}</td>
      <td className="table-cell" role="gridcell">{item.price}</td>
      <td className="table-cell" role="gridcell">{item.orderCreatedTime}</td>
      <td className="table-cell" role="gridcell">{item.time}</td>
      <td className="table-cell" role="gridcell">
        <span className="badge-info px-2 py-1 rounded text-xs">{item.status}</span>
      </td>
      <td className="table-cell" role="gridcell">
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label={`View details for ${item.itemName}`}
          type="button"
        >
          <ChevronRight className="w-4 h-4 text-primary" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
});

AddedItemRow.displayName = 'AddedItemRow';

// Memoized pagination button
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

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employeeDetail, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete employee ${employeeDetail.employee.name}?`)) {
      onDelete?.(employeeDetail.employee.id);
    }
  }, [employeeDetail.employee.id, employeeDetail.employee.name, onDelete]);

  const handleSort = useCallback(() => {
    setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Sort and paginate added items
  const { sortedItems, totalPages, paginatedItems } = useMemo(() => {
    const sorted = [...employeeDetail.addedItems].sort((a, b) => {
      const dateA = new Date(a.orderCreatedTime).getTime();
      const dateB = new Date(b.orderCreatedTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    const total = Math.ceil(sorted.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      sortedItems: sorted,
      totalPages: total,
      paginatedItems: sorted.slice(start, end),
    };
  }, [employeeDetail.addedItems, sortOrder, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const paginationPages = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 15) }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/manage/employees" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Go back to Employees"
          >
            <ArrowLeft className="w-5 h-5 text-primary" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-primary">Employee Details</h1>
        </div>
        <div className="flex items-center gap-3" role="toolbar" aria-label="Employee actions">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Export employee data"
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

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table 
              className="w-full"
              role="table"
              aria-label="Employee details table"
            >
              <caption className="sr-only">
                Employee details showing ID, name, number, designation, order created time, delete action, and added items link
              </caption>
              <thead>
                <tr role="row">
                  <th className="table-header" scope="col" role="columnheader">Id</th>
                  <th className="table-header" scope="col" role="columnheader">Name</th>
                  <th className="table-header" scope="col" role="columnheader">Number</th>
                  <th className="table-header" scope="col" role="columnheader">Designation</th>
                  <th className="table-header" scope="col" role="columnheader">
                    <button
                      onClick={handleSort}
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      aria-label={`Sort by order created time ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                      type="button"
                    >
                      Order Created Time
                      <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="table-header" scope="col" role="columnheader">Delete</th>
                  <th className="table-header" scope="col" role="columnheader">More</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row" role="row">
                  <td className="table-cell text-primary font-medium" role="gridcell">{employeeDetail.employee.id}</td>
                  <td className="table-cell text-primary font-medium" role="gridcell">{employeeDetail.employee.name}</td>
                  <td className="table-cell" role="gridcell">{employeeDetail.employee.number}</td>
                  <td className="table-cell" role="gridcell">{employeeDetail.employee.designation}</td>
                  <td className="table-cell" role="gridcell">{employeeDetail.employee.orderCreatedTime}</td>
                  <td className="table-cell" role="gridcell">
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label={`Delete employee ${employeeDetail.employee.name}`}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                  <td className="table-cell" role="gridcell">
                    <button
                      onClick={() => {
                        const addedItemsSection = document.getElementById('added-items-section');
                        addedItemsSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      aria-label={`Scroll to added items for ${employeeDetail.employee.name}`}
                      type="button"
                    >
                      Added Items <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Added Items Section */}
      <div id="added-items-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Added Items</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3"
            aria-label="Open filter options"
            type="button"
          >
            <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Filter</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table 
                className="w-full"
                role="table"
                aria-label="Added items table"
                aria-rowcount={sortedItems.length}
              >
                <caption className="sr-only">
                  Table showing items added by employee with icon, name, category, size/quantity, price, order created time, time, status, and action
                </caption>
                <thead>
                  <tr role="row">
                    <th className="table-header" scope="col" role="columnheader">Item Icon</th>
                    <th className="table-header" scope="col" role="columnheader">Item Name</th>
                    <th className="table-header" scope="col" role="columnheader">Category</th>
                    <th className="table-header" scope="col" role="columnheader">Size/Quantity</th>
                    <th className="table-header" scope="col" role="columnheader">Price</th>
                    <th className="table-header" scope="col" role="columnheader">Order Created Time</th>
                    <th className="table-header" scope="col" role="columnheader">Time</th>
                    <th className="table-header" scope="col" role="columnheader">Status</th>
                    <th className="table-header" scope="col" role="columnheader">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <AddedItemRow key={item.id} item={item} />
                    ))
                  ) : (
                    <tr role="row">
                      <td colSpan={9} className="table-cell text-center text-secondary py-8" role="gridcell">
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
        <nav aria-label="Added items pagination">
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
    </div>
  );
};

