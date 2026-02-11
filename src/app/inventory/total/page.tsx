'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { Shirt, Package, Baby } from 'lucide-react';

/* ================= TYPES ================= */
interface Item {
  id: string;
  product: string;
  category: string;
  unit: string;
  quantity: number;
  sizes: string;
  price: string;
  productIcon: React.ReactNode;
}

/* ================= CONFIG ================= */
const API_URL = 'http://dev.zuget.com/admin/total-items';
const PAGE_SIZE = 10;

export default function TotalItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem(`${localStorage.getItem('user_phone')}_token`) || '';

      const res = await fetch(
        `${API_URL}?limit=${PAGE_SIZE}&offset=${offset}`,
        {
          headers: {
            accept: 'application/json',
            Authorization: token,
          },
        }
      );

      const json = await res.json();

      setTotalCount(json.data.total_items.length);

      const mapped: Item[] = json.data.total_items.map((item: any) => {
        const totalQty = item.size_data.reduce(
          (sum: number, s: any) => sum + s.quantity,
          0
        );

        const sizes = item.size_data
          .map((s: any) => `${s.size}-${s.quantity}`)
          .join(', ');

        const prices = Array.from(
          new Set(item.size_data.map((s: any) => s.price))
        ).join(' - ');

        return {
          id: String(item._id),
          product: item.title,
          category: item.gender,
          unit: 'Piece',
          quantity: totalQty,
          sizes,
          price: prices,
          productIcon:
            item.gender === 'Kids' ? (
              <Baby className="w-5 h-5 text-pink-500" />
            ) : item.gender === 'Male' ? (
              <Shirt className="w-5 h-5 text-blue-500" />
            ) : (
              <Package className="w-5 h-5 text-purple-500" />
            ),
        };
      });
      setItems(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TABLE ================= */
  const columns = useMemo<ColumnDef<Item>[]>(() => [
    { header: 'ID', accessorKey: 'id' },
    {
      header: 'Product',
      accessorKey: 'product',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {row.original.productIcon}
          </div>
          <span className="font-medium">{row.original.product}</span>
        </div>
      ),
    },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Quantity', accessorKey: 'quantity' },
    {
      header: 'Sizes',
      accessorKey: 'sizes',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-500">{getValue<string>()}</span>
      ),
    },
    { header: 'Price', accessorKey: 'price' },
    {
      id: 'action',
      header: '',
      cell: () => (
        <div className="flex justify-end">
          <ChevronRight className="w-4 h-4 text-gray-400" />
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
  });

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="p-6 rounded-xl border bg-white dark:bg-gray-900">
        Loading items…
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-gray-900">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              className="pl-9 pr-3 py-2 border rounded-md text-sm bg-transparent"
              placeholder="Search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <button className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-left cursor-pointer"
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
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/40"
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 text-sm">
          <span>
            Showing {offset + 1}–
            {Math.min(offset + PAGE_SIZE, totalCount)} of {PAGE_SIZE}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-2">{page}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <footer className="flex justify-between text-xs text-gray-500 border-t pt-4">
        <p>© 2025 ZuGet</p>
        <p>Version 1.3.8</p>
      </footer>
    </main>
  );
}
