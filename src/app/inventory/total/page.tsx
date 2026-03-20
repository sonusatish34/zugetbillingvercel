'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel, 
  useReactTable, 
  SortingState 
} from '@tanstack/react-table';
import { 
  Search, 
  BarcodeIcon, 
  Shirt, 
  Baby, 
  PlusIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ArrowUpDown 
} from 'lucide-react';
import JsBarcode from "jsbarcode";

/* ================= TYPES ================= */
interface SizeDataItem {
  size: string;
  quantity: number;
  price: string;
}

interface RawItem {
  _id: string;
  title: string;
  gender: string;
  brand: string;
  created_on: string;
  size_data: SizeDataItem[];
}

interface TableItem extends RawItem {
  sno: number;
  totalQty: number;
  priceRange: string;
  icon: React.ReactNode;
}

interface TagPreviewData extends RawItem {
  selectedSize: string;
  selectedPrice: string;
  barcode: string;
  sku: string;
}

const API_URL = 'https://dev.zuget.com/admin/total-items';
const PAGE_SIZE = 10;

const generateBarcode = (sku: string): string => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, sku, { format: "CODE128", height: 40, fontSize: 12 });
  return canvas.toDataURL("image/png");
};

export default function TotalItemsPage() {
  const [items, setItems] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedItem, setSelectedItem] = useState<TableItem | null>(null);
  const [tagPreview, setTagPreview] = useState<TagPreviewData | null>(null);

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const phone = localStorage.getItem('user_phone');
        const token = localStorage.getItem(`${phone}_token`) || '';

        // Added cache buster to ensure fresh data
        const res = await fetch(`${API_URL}?limit=1000&offset=0`, {
          headers: { Authorization: token },
        });

        const json = await res.json();
        const rawData: RawItem[] = json.data?.total_items || [];

        const mapped: TableItem[] = rawData.map((item, idx) => ({
          ...item,
          sno: idx + 1,
          totalQty: item.size_data.reduce((sum, s) => sum + s.quantity, 0),
          priceRange: [...new Set(item.size_data.map(s => s.price))].join(' - '),
          icon: item.gender === 'Kids' 
            ? <Baby className="text-pink-500" size={18} /> 
            : <Shirt className="text-blue-500" size={18} />
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  /* ================= TABLE CONFIG ================= */
  const columns = useMemo<ColumnDef<TableItem>[]>(() => [
    { header: '#', accessorKey: 'sno' },
    {
      header: 'Product',
      accessorKey: 'title', // Necessary for global filter
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">{row.original.icon}</div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 uppercase text-xs">{row.original.title}</span>
            <span className="text-[10px] text-gray-400 italic">{row.original.brand}</span>
          </div>
        </div>
      )
    },
    { 
        header: 'Gender', 
        accessorKey: 'gender',
        cell: ({getValue}) => <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">{getValue() as string}</span>
    },
    { header: 'Qty', accessorKey: 'totalQty' },
    { 
        header: 'Price', 
        accessorKey: 'priceRange',
        cell: ({getValue}) => <span className="font-semibold text-green-700">₹{getValue() as string}</span>
    },
    { 
        header: 'Date', 
        accessorKey: 'created_on',
        cell: ({getValue}) => {
            const d = new Date(getValue() as string);
            return <span className="text-xs text-gray-500">{d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
        }
    },
    {
      id: 'action',
      header: 'Label',
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedItem(row.original)}
          className="bg-black text-white px-4 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-gray-800 transition"
        >
          GENERATE <BarcodeIcon size={12} />
        </button>
      ),
    },
  ], []);

  // Filter items based on gender before passing to table
  const filteredData = useMemo(() => {
    if (genderFilter === 'All') return items;
    return items.filter(item => item.gender === genderFilter);
  }, [items, genderFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) return <div className="p-20 text-center font-bold text-gray-400 animate-pulse">LOADING INVENTORY...</div>;

  return (
    <main className="p-4 space-y-4 max-w-7xl mx-auto">
      
      {/* FILTER & SEARCH BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border items-end">
        
        {/* Search */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Search Products</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              placeholder="Search by title, brand, id..."
              className="pl-10 w-full border-gray-200 border rounded-xl p-2.5 text-sm focus:ring-2 ring-black/5 outline-none transition"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Gender Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Gender</label>
          <select 
            className="w-full border-gray-200 border rounded-xl p-2.5 text-sm outline-none bg-gray-50 font-medium"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        {/* Sort Trigger */}
        <div className="space-y-1">
            <button 
                onClick={() => setSorting([{ id: 'created_on', desc: !sorting[0]?.desc }])}
                className="w-full bg-gray-100 p-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
                <ArrowUpDown size={16} /> Sort by Date {sorting[0]?.desc ? '(New)' : '(Old)'}
            </button>
        </div>
      </div>

      {/* TABLE BODY */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} className="px-4 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition group">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-4 text-gray-600 font-medium">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400 italic">No matching items found...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS REMAIN THE SAME BUT WITH UPDATED STYLING */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="font-black text-xl mb-1 text-gray-900 uppercase italic">Select Size</h2>
            <p className="text-gray-400 text-xs mb-6 font-medium">{selectedItem.title}</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {selectedItem.size_data.map((s) => (
                <button
                  key={s.size}
                  className="group p-3 border-2 border-gray-100 rounded-2xl hover:border-black hover:bg-black hover:text-white transition-all text-center"
                  onClick={() => {
                    const storeId = localStorage.getItem("store_id") || '000';
                    const sku = `${storeId}-${selectedItem._id}-${s.size}`;
                    setTagPreview({
                      ...selectedItem,
                      selectedSize: s.size,
                      selectedPrice: s.price,
                      barcode: generateBarcode(sku),
                      sku
                    });
                    setSelectedItem(null);
                  }}
                >
                  <div className="text-sm font-black">{s.size}</div>
                  <div className="text-[10px] opacity-60">₹{s.price}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedItem(null)} className="w-full font-bold text-gray-400 hover:text-black transition">CANCEL</button>
          </div>
        </div>
      )}

      {tagPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-10 text-center space-y-6 shadow-2xl">
            <div className="border-4 border-dashed border-gray-200 p-6 rounded-2xl bg-white w-64 mx-auto">
              <p className="font-black text-xs uppercase mb-2">{tagPreview.title}</p>
              <div className="flex justify-between text-xs mb-4 font-mono bg-gray-100 p-2 rounded">
                <span className="font-bold">{tagPreview.selectedSize}</span>
                <span className="font-black text-green-700">₹{tagPreview.selectedPrice}</span>
              </div>
              <img src={tagPreview.barcode} className="w-full h-12 object-contain mb-2" alt="barcode" />
              <p className="text-[9px] font-mono text-gray-400">{tagPreview.sku}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black hover:bg-green-700 shadow-lg shadow-green-200">PRINT TAG</button>
              <button onClick={() => setTagPreview(null)} className="flex-1 bg-gray-100 py-3 rounded-2xl font-black text-gray-600">CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}