'use client';

import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { Item } from '@/types/item';

export function TotalItemsTable({
  items,
  loading,
}: {
  items: Item[];
  loading: boolean;
}) {
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Item>[]>(() => [
    { header: 'Id', accessorKey: 'id' },
    {
      header: 'Product',
      accessorKey: 'product',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {row.original.productIcon}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.product}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: ({ getValue }) => (
        <span className="text-gray-500 dark:text-gray-400">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: ({ getValue }) => (
        <span className="text-gray-600 dark:text-gray-300">
          {getValue<number>()}
        </span>
      ),
    },
    {
      header: 'Sizes',
      accessorKey: 'sizes',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ getValue }) => (
        <span className="text-gray-700 dark:text-gray-200">
          {getValue<string>()}
        </span>
      ),
    },
    
    {
      id: 'action',
      header: '',
      cell: () => (
        <div className="flex justify-end">
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: items,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="p-6 rounded-xl border bg-white dark:bg-gray-900">
        Loading items…
      </div>
    );
  }

  return (
    <div className="rounded-2xl  bg-white dark:bg-gray-900">
      {/* 🔍 Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              placeholder="Search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <button className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 dark:text-gray-200 dark:border-gray-700">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>

        <button className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 dark:text-gray-200 dark:border-gray-700">
          Sort by : Latest
        </button>
      </div>

      {/* 📋 Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔢 Footer */}
      <div className="flex items-center justify-between p-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Showing 10 results</span>

        <div className="flex gap-1">
          <button className="w-7 h-7 rounded border text-xs dark:border-gray-700">
            1
          </button>
          <button className="w-7 h-7 rounded border text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-700">
            2
          </button>
          <button className="w-7 h-7 rounded border text-xs dark:border-gray-700">
            3
          </button>
          <span className="px-2">…</span>
          <button className="w-7 h-7 rounded border text-xs dark:border-gray-700">
            15
          </button>
        </div>
      </div>
    </div>
  );
}

export default TotalItemsTable;
