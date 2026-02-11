'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateRangePicker, DateRange } from '@/components/ui/DateRangePicker';
import { TransactionDetail } from '@/types';
import { Search, Filter, ChevronRight, ChevronLeft, ArrowUpDown, Paperclip, CheckCircle, Clock, X, Columns } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionsTableProps {
  transactions: TransactionDetail[];
}

// Memoized table row component
const TransactionTableRow = memo<{ transaction: TransactionDetail; isSelected: boolean; onSelect: (id: string) => void }>(({ transaction, isSelected, onSelect }) => {
  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'Paid':
        return (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            <span>Paid</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>Pending</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return <span>{transaction.status}</span>;
    }
  };

  return (
    <tr 
      className={`table-row cursor-pointer ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
      role="row"
      onClick={() => onSelect(transaction.id)}
    >
      <td className="table-cell" role="gridcell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(transaction.id);
          }}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          aria-label={`Select transaction ${transaction.id}`}
        />
      </td>
      <td className="table-cell text-primary font-medium" role="gridcell">{transaction.id}</td>
      <td className="table-cell" role="gridcell">{transaction.date}</td>
      <td className="table-cell" role="gridcell">{transaction.referenceNumber}</td>
      <td className="table-cell" role="gridcell">{transaction.description}</td>
      <td className="table-cell" role="gridcell">
        {transaction.hasAttachment && (
          <Paperclip className="w-4 h-4 text-secondary" aria-label="Has attachment" />
        )}
      </td>
      <td className="table-cell text-primary font-medium" role="gridcell">{transaction.amount}</td>
      <td className="table-cell" role="gridcell">{transaction.paymentMode}</td>
      <td className="table-cell" role="gridcell">{getStatusBadge()}</td>
    </tr>
  );
});

TransactionTableRow.displayName = 'TransactionTableRow';

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

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
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

  // Filter and sort transactions
  const filteredAndSorted = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      const query = searchQuery.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(query) ||
        transaction.date.toLowerCase().includes(query) ||
        transaction.referenceNumber.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.amount.toLowerCase().includes(query) ||
        transaction.paymentMode.toLowerCase().includes(query) ||
        transaction.status.toLowerCase().includes(query)
      );
    });

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= dateRange.startDate! && transactionDate <= dateRange.endDate!;
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
  }, [transactions, searchQuery, sortBy, sortOrder, dateRange]);

  // Pagination
  const { totalPages, paginatedTransactions } = useMemo(() => {
    const total = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      totalPages: total,
      paginatedTransactions: filteredAndSorted.slice(start, end),
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search" aria-label="Search and filter transactions">
        <div className="flex-1">
          <label htmlFor="transaction-search" className="sr-only">
            Search transactions
          </label>
          <Input
            id="transaction-search"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" aria-hidden="true" />}
            className="w-full"
            aria-label="Search transactions"
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
        <Button 
          variant="outline" 
          size="sm" 
          className="h-10 px-4"
          aria-label="Customize columns"
          type="button"
        >
          <Columns className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Column</span>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table 
              className="w-full"
              role="table"
              aria-label="Transactions table"
              aria-rowcount={filteredAndSorted.length}
            >
              <caption className="sr-only">
                Table showing transactions with ID, date, reference number, description, attachment, amount, payment mode, and status
              </caption>
              <thead>
                <tr role="row">
                  <th className="table-header" scope="col" role="columnheader">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === paginatedTransactions.length && paginatedTransactions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(paginatedTransactions.map((t) => t.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      aria-label="Select all transactions"
                    />
                  </th>
                  <th className="table-header" scope="col" role="columnheader">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      aria-label={`Sort by ID ${sortBy === 'id' && sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                      type="button"
                    >
                      ID
                      <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="table-header" scope="col" role="columnheader">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      aria-label={`Sort by date ${sortBy === 'date' && sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                      type="button"
                    >
                      Date
                      <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="table-header" scope="col" role="columnheader">Reference Number</th>
                  <th className="table-header" scope="col" role="columnheader">Description</th>
                  <th className="table-header" scope="col" role="columnheader">Attachment</th>
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
                  <th className="table-header" scope="col" role="columnheader">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <TransactionTableRow
                      key={transaction.id}
                      transaction={transaction}
                      isSelected={selectedIds.has(transaction.id)}
                      onSelect={handleSelect}
                    />
                  ))
                ) : (
                  <tr role="row">
                    <td colSpan={9} className="table-cell text-center text-secondary py-8" role="gridcell">
                      <span role="status" aria-live="polite">No transactions found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <nav aria-label="Transactions pagination">
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

