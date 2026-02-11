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
import { ArrowUpDown, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Shirt, Package, Baby } from 'lucide-react';

/* ================= TYPES ================= */
interface OrderItem {
  _id: number;
  item_name: string;
  brand: string;
  store_name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  item_image: string;
  item_status: string;
  gender: string;
}

interface Order {
  _id: number;
  app_user_id: number;
  items_json: OrderItem[];
  delivery_location: string;
  amount_paid: number;
  final_amount: number;
  status: string;
  created_on: string;
  name: string;
  mobile: string;
  payment_method: string;
  delivery_price: string;
}

/* ================= CONFIG ================= */
const API_URL = 'http://dev.zuget.com/admin/online-orders?status=booked';
const PAGE_SIZE = 10;

export default function TotalItemsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const userPhone = localStorage.getItem('user_phone');
      const token = localStorage.getItem(`${userPhone}_token`) || '';
      
      const res = await fetch(API_URL, {
        headers: {
          accept: 'application/json',
          Authorization: `${token}`,
        },
      });

      const json = await res.json();
      
      if (json.status === 'success') {
        const results = json.data?.results || [];
        setTotalCount(results.length);
        setOrders(results);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = useMemo<ColumnDef<Order>[]>(() => [
    {
      header: 'Order ID',
      accessorKey: '_id',
      cell: ({ row }) => `#${row.original._id}`,
    },
    
    {
      header: 'Product',
      accessorKey: 'items_json',
      cell: ({ row }) => (
        <div className="max-w-xs">
          {row.original.items_json.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1">
              <div className="w-6 h-6 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img
                  src={item.item_image}
                  alt={item.item_name}
                  className="w-full h-full object-cover"
                  
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-xs truncate">{item.item_name}</div>
                <div className="text-xs text-gray-500 truncate">{item.brand}</div>
              </div>
            </div>
          ))}
          {row.original.items_json.length > 2 && (
            <div className="text-xs text-gray-500">+{row.original.items_json.length - 2} more</div>
          )}
        </div>
      ),
    },
    {
      header: 'Delivery',
      accessorKey: 'delivery_location',
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium text-sm truncate w-32">{row.original.delivery_location}</div>
          <div className="text-xs text-gray-500">₹{row.original.delivery_price || 0}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'final_amount',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-semibold">₹{row.original.final_amount}</div>
          <div className="text-xs text-gray-500">{row.original.payment_method}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.status === 'booked' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'created_on',
      cell: ({ row }) => {
        const date = new Date(row.original.created_on).toLocaleDateString();
        return <span className="text-sm">{date}</span>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex justify-end">
          <ChevronRight className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getProductIcon = (gender: string) => {
    if (gender === 'Kids') {
      return <Baby className="w-4 h-4 text-pink-500" />;
    }
    if (gender === 'Male') {
      return <Shirt className="w-4 h-4 text-blue-500" />;
    }
    return <Package className="w-4 h-4 text-purple-500" />;
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="p-6 rounded-xl border bg-white dark:bg-gray-900">
        Loading orders…
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-6 border-b">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search orders by customer, item, or location…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-4 text-left font-semibold text-gray-900 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t bg-gray-50/50 text-sm">
            <span className="text-gray-700">
              Showing {Math.min(offset + 1, totalCount)}–{Math.min(offset + PAGE_SIZE, totalCount)} of{' '}
              {totalCount.toLocaleString()} orders
            </span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="flex justify-between text-xs text-gray-500 border-t pt-4">
        <p>© 2026 ZuGet</p>
        <p>Version 1.3.8</p>
      </footer>
    </main>
  );
}
