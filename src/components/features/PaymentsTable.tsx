'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateRangePicker, DateRange } from '@/components/ui/DateRangePicker';
import { Payment } from '@/types';
import { Search, Filter, ChevronRight, ChevronLeft, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentsTableProps {
  payments: Payment[];
}

// Memoized table row component
const PaymentTableRow = memo<{ payment: Payment; isSelected: boolean; onSelect: (id: string) => void }>(({ payment, isSelected, onSelect }) => (
  <tr 
    className={`table-row cursor-pointer ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
    role="row"
    onClick={() => onSelect(payment.id)}
  >
    <td className="table-cell" role="gridcell">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(payment.id);
        }}
        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        aria-label={`Select payment ${payment.id}`}
      />
    </td>
    <td className="table-cell text-primary font-medium" role="gridcell">{payment.id}</td>
    <td className="table-cell" role="gridcell">{payment.date}</td>
    <td className="table-cell" role="gridcell">{payment.referenceNumber}</td>
    <td className="table-cell" role="gridcell">{payment.description}</td>
    <td className="table-cell text-primary font-medium" role="gridcell">{payment.amount}</td>
    <td className="table-cell" role="gridcell">{payment.paymentMode}</td>
  </tr>
));

PaymentTableRow.displayName = 'PaymentTableRow';

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

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'id' | 'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 0, 31),
  });
  const itemsPerPage = 10;

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: 'id' | 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Filter and sort payments
  const filteredAndSorted = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const query = searchQuery.toLowerCase();
      return (
        payment.id.toLowerCase().includes(query) ||
        payment.date.toLowerCase().includes(query) ||
        payment.referenceNumber.toLowerCase().includes(query) ||
        payment.description.toLowerCase().includes(query) ||
        payment.amount.toLowerCase().includes(query) ||
        payment.paymentMode.toLowerCase().includes(query)
      );
    });

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= dateRange.startDate! && paymentDate <= dateRange.endDate!;
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          const amountA = parseFloat(a.amount.replace(/[^0-9.]/g, ''));
          const amountB = parseFloat(b.amount.replace(/[^0-9.]/g, ''));
          comparison = amountA - amountB;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [payments, searchQuery, sortBy, sortOrder, dateRange]);

  // Pagination
  const { totalPages, paginatedPayments } = useMemo(() => {
    const total = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      totalPages: total,
      paginatedPayments: filteredAndSorted.slice(start, end),
    };
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const paginationPages = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 15) }, (_, i) => i + 1);
  }, [totalPages]);

  const dateRangeText = useMemo(() => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${format(dateRange.startDate, 'dd MMM yyyy')} - ${format(dateRange.endDate, 'dd MMM yyyy')}`;
    }
    return 'Select date range';
  }, [dateRange]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search" aria-label="Search and filter payments">
        <div className="flex-1">
          <label htmlFor="payment-search" className="sr-only">
            Search payments
          </label>
          <Input
            id="payment-search"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" aria-hidden="true" />}
            className="w-full"
            aria-label="Search payments"
          />
        </div>
        <div className="flex-shrink-0">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={dateRangeText}
          />
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
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table 
              className="w-full"
              role="table"
              aria-label="Payments table"
              aria-rowcount={filteredAndSorted.length}
            >
              <caption className="sr-only">
                Table showing payments with ID, date, reference number, description, amount, and payment mode
              </caption>
              <thead>
                <tr role="row">
                  <th className="table-header" scope="col" role="columnheader">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedPayments.length && paginatedPayments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(paginatedPayments.map((p) => p.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      aria-label="Select all payments"
                    />
                  </th>
                  <th className="table-header" scope="col" role="columnheader">ID</th>
                  <th className="table-header" scope="col" role="columnheader">Date</th>
                  <th className="table-header" scope="col" role="columnheader">Reference Number</th>
                  <th className="table-header" scope="col" role="columnheader">Description</th>
                  <th className="table-header" scope="col" role="columnheader">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      aria-label={`Sort by amount ${sortBy === 'amount' && sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                      type="button"
                    >
                      Amount
                      <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="table-header" scope="col" role="columnheader">Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment) => (
                    <PaymentTableRow
                      key={payment.id}
                      payment={payment}
                      isSelected={selectedIds.has(payment.id)}
                      onSelect={handleSelect}
                    />
                  ))
                ) : (
                  <tr role="row">
                    <td colSpan={7} className="table-cell text-center text-secondary py-8" role="gridcell">
                      <span role="status" aria-live="polite">No payments found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <nav aria-label="Payments pagination">
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                    onClick={() => setCurrentPage(page)}
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
                      onClick={() => setCurrentPage(totalPages)}
                    />
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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

