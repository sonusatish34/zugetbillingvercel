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
import Link from 'next/link';
import {
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  BarcodeIcon,
  Shirt,
  Package,
  Baby,
  PlusIcon
} from 'lucide-react';

import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";
import { get } from 'http';

/* ================= TYPES ================= */
interface Item {
  id: string;
  product: string;
  category: string;
  unit: string;
  quantity: number;
  sizes: string;
  price: string;
  sizeData?: any[];
  productIcon: React.ReactNode;
}

/* ================= CONFIG ================= */
const API_URL = 'http://dev.zuget.com/admin/total-items';
const PAGE_SIZE = 10;

export default function TotalItemsPage() {
  /* ================= BARCODE SCANNER CONSOLE TEST ================= */
  useEffect(() => {
    let barcodeBuffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();

      // If typing gap is large → reset buffer
      // (prevents normal typing from mixing)
      if (now - lastKeyTime > 100) {
        barcodeBuffer = "";
      }

      lastKeyTime = now;

      // ENTER = scan completed
      if (e.key === "Enter") {
        if (barcodeBuffer.length > 5) {
          const cleaned = cleanBarcode(barcodeBuffer);

          console.log(
            "%c✅ SCANNED BARCODE:",
            "color: green; font-weight: bold;",
            cleaned
          );
        }

        barcodeBuffer = "";
        return;
      }

      // collect characters only
      if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ================= CLEAN BARCODE ================= */
  const cleanBarcode = (raw: string) => {
    let barcode = raw.trim();

    // remove duplicated barcode (common scanner issue)
    const half = Math.floor(barcode.length / 2);

    if (barcode.slice(0, half) === barcode.slice(half)) {
      barcode = barcode.slice(0, half);
    }

    return barcode;
  };


  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [tagPreview, setTagPreview] = useState<any>(null);

  // Size popup states
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

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

      const res = await fetch(`${API_URL}?limit=${PAGE_SIZE}&offset=${offset}`, {
        headers: {
          accept: 'application/json',
          Authorization: token,
        },
      });

      const json = await res.json();
      setTotalCount(json?.data?.total_items?.length);

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
          sizeData: item.size_data, // ✅ store all size data
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

  /* ================= BARCODE GENERATOR ================= */
  const generateBarcode = (sku: string, label: string) => {
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, sku, {
      format: "CODE128",
      height: 60,
      fontSize: 12,
      text: label,
      textMargin: 6,
      marginTop: 8,
    });

    return canvas.toDataURL("image/png");
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
      cell: ({ row }) => {
        const item = row.original;

        const handleGenerate = () => {
          setSelectedItem(item);
          setSelectedSize('');
          setSelectedPrice('');
          setShowSizePopup(true);
        };

        return (
          <button
            onClick={handleGenerate}
            className="bg-orange-400 rounded-full px-2 py-1 text-xs flex gap-x-1 items-center hover:scale-105 cursor-pointer transition"
          >
            Generate <BarcodeIcon className="w-4 h-4" />
          </button>
        );
      },
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
    return <div className="p-6 rounded-xl border bg-white dark:bg-gray-900">Loading items…</div>;
  }
  interface UserTy {
    id: number,
    name: string,
    email: string
  }
  const Userdh = {
    id: 2,
    name: "John Doe",
    email: "jon@gmail,com"
  }
  interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // optional
}
const user: User = {
  id: 1,
  name: "Satish",
  email: "test@gmail.com"
};


  return (
    <main className="space-y-6">
      {/* <p>kkk</p> */}
      {/* ================= SIZE POPUP ================= */}
      {showSizePopup && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl w-72 space-y-3">
            <h3 className="font-semibold text-sm">
              Select Size for {selectedItem.product}
            </h3>

            <select
              className="w-full border px-2 py-1 rounded"
              value={selectedSize}
              onChange={(e) => {
                const size = e.target.value;
                setSelectedSize(size);

                const priceObj = selectedItem.sizeData.find((s: any) => s.size === size);
                setSelectedPrice(priceObj?.price || '');
              }}
            >
              <option value="">Select Size</option>
              {selectedItem.sizeData.map((s: any) => (
                <option key={s.size} value={s.size}>
                  {s.size}
                </option>
              ))}
            </select>

            {selectedPrice && (
              <p className="text-xs font-medium">Price: ₹{selectedPrice}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setShowSizePopup(false)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 bg-orange-500 text-white rounded disabled:opacity-50"
                disabled={!selectedSize}
                onClick={() => {
                  const sku = `${localStorage.getItem("store_id")}-${selectedItem.id}-${selectedSize}-${selectedPrice}`;
                  // console.log(sku, 'skuuuu');

                  const barcode = generateBarcode(sku, "Product Code");

                  const tagData = {
                    sku,
                    product: selectedItem.product,
                    size: selectedSize,
                    price: selectedPrice,
                    barcode,
                  };

                  sessionStorage.setItem(`tag_${selectedItem.id}_${selectedSize}`, JSON.stringify(tagData));
                  setTagPreview(tagData);
                  setShowSizePopup(false);
                }}
              >
                Generate Barcode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAG PREVIEW POPUP ================= */}
      {tagPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl space-y-3 print-area">

            <div className="w-[220px] border p-2 rounded bg-white text-xs">
              <div className="font-semibold text-center text-[11px]">
                {tagPreview.product}
              </div>

              <div className="flex justify-between mt-1 text-[10px]">
                <span>Size: {tagPreview.size}</span>
                <span>₹{tagPreview.price}</span>
              </div>

              <div className="mt-2 flex justify-center">
                <img src={tagPreview.barcode} className="h-12" />
              </div>

              <div className="text-center text-[9px] mt-1">{tagPreview.sku}</div>

              {/* <div className="flex justify-center mt-2">
                <QRCodeCanvas value={tagPreview.sku} size={50} />
              </div>

              <div className="text-center text-[8px] mt-1 text-gray-500">
                Scan for authenticity
              </div> */}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Print
              </button>

              <button
                onClick={() => setTagPreview(null)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN TABLE ================= */}
      <div className="rounded-2xl bg-white dark:bg-gray-900">

        {/* Search */}
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

          <Link href={'/test'} className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm">
            <PlusIcon className="w-4 h-4" /> Add Item
          </Link>
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
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t-2 border-t-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount}
          </span>

          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded">
              Prev
            </button>
            <span>{page}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}