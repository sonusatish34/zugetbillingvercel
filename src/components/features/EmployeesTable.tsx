'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Employee } from '@/types';
import { Search, Filter, ChevronRight, ChevronLeft, Upload, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface EmployeesTableProps {
  employees: Employee[];
  onDelete?: (id: string) => void;
}

// Memoized table row component for performance
const EmployeeTableRow = memo<{ employee: Employee; onDelete: (id: string) => void }>(({ employee, onDelete }) => {
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete employee ${employee.name}?`)) {
      onDelete(employee.id);
    }
  }, [employee.id, employee.name, onDelete]);

  return (
    <tr className="table-row" role="row">
      <td className="table-cell text-primary font-medium" role="gridcell">{employee.id}</td>
      <td className="table-cell text-primary font-medium" role="gridcell">{employee.name}</td>
      <td className="table-cell" role="gridcell">{employee.number}</td>
      <td className="table-cell" role="gridcell">{employee.designation}</td>
      <td className="table-cell" role="gridcell">{employee.orderCreatedTime}</td>
      <td className="table-cell" role="gridcell">
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label={`Delete employee ${employee.name}`}
          type="button"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </td>
      <td className="table-cell" role="gridcell">
        <Link 
          href={`/manage/employees/${employee.id}`}
          className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          aria-label={`View added items for ${employee.name}`}
        >
          Added Items <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  );
});

EmployeeTableRow.displayName = 'EmployeeTableRow';

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

export const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees, onDelete }) => {
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

  const handleDelete = useCallback((id: string) => {
    onDelete?.(id);
  }, [onDelete]);

  // Filter employees - memoized
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(query) ||
        employee.number.toLowerCase().includes(query) ||
        employee.designation.toLowerCase().includes(query) ||
        employee.id.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  // Sort employees - memoized
  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees];
    switch (sortBy) {
      case 'latest':
        return sorted.reverse();
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'designation':
        return sorted.sort((a, b) => a.designation.localeCompare(b.designation));
      default:
        return sorted;
    }
  }, [filteredEmployees, sortBy]);

  // Pagination calculations - memoized
  const { totalPages, startIndex, endIndex, paginatedEmployees } = useMemo(() => {
    const total = Math.ceil(sortedEmployees.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = sortedEmployees.slice(start, end);
    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      paginatedEmployees: paginated,
    };
  }, [sortedEmployees, currentPage, itemsPerPage]);

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
        <h1 className="text-2xl font-bold text-primary">Employees</h1>
        <div className="flex items-center gap-3" role="toolbar" aria-label="Employee actions">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Export employees"
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Export</span>
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-10 px-4"
            aria-label="Add new employee"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Search, Filter, and Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search" aria-label="Search and filter employees">
        <div className="flex-1">
          <label htmlFor="employee-search" className="sr-only">
            Search employees by name, number, designation, or ID
          </label>
          <Input
            id="employee-search"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" aria-hidden="true" />}
            className="w-full"
            aria-label="Search employees"
            aria-describedby="search-description"
          />
          <span id="search-description" className="sr-only">
            Search employees by name, number, designation, or ID
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
            aria-label="Sort employees"
          >
            <option value="latest">Latest</option>
            <option value="name">Name</option>
            <option value="designation">Designation</option>
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
              aria-label="Employees table"
              aria-rowcount={sortedEmployees.length}
            >
              <caption className="sr-only">
                Table showing employees with ID, name, phone number, designation, order created time, delete action, and added items link
              </caption>
              <thead>
                <tr role="row">
                  <th className="table-header" scope="col" role="columnheader">Id</th>
                  <th className="table-header" scope="col" role="columnheader">Name</th>
                  <th className="table-header" scope="col" role="columnheader">Number</th>
                  <th className="table-header" scope="col" role="columnheader">Designation</th>
                  <th className="table-header" scope="col" role="columnheader">Order Created Time</th>
                  <th className="table-header" scope="col" role="columnheader">Delete</th>
                  <th className="table-header" scope="col" role="columnheader">More</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <EmployeeTableRow 
                      key={employee.id} 
                      employee={employee}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <tr role="row">
                    <td colSpan={7} className="table-cell text-center text-secondary py-8" role="gridcell">
                      <span role="status" aria-live="polite">No employees found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <nav aria-label="Employees pagination">
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

