"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const CGST_PERCENT = 9;
const SGST_PERCENT = 9;

interface Product {
  id: string; // full barcode
  name: string;
  size: string;
  rate: number;
  qty: number;
}

export default function BillingSystem() {
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMode, setPaymentMode] = useState("UPI");

  /* ================= BARCODE SCANNER ================= */
  useEffect(() => {
    let buffer = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (!buffer) return;

        const parts = buffer.split("-");
        if (parts.length !== 4) {
          alert("Invalid Barcode (Use: 24-113-XXL-500)");
          buffer = "";
          return;
        }

        const [storeId, itemId, size, price] = parts;
        const barcodeId = buffer;

        setProducts((prev) => {
          const existing = prev.find((p) => p.id === barcodeId);

          if (existing) {
            return prev.map((p) =>
              p.id === barcodeId ? { ...p, qty: p.qty + 1 } : p
            );
          }

          return [
            ...prev,
            {
              id: barcodeId,
              name: `Item ${itemId}`,
              size,
              rate: Number(price),
              qty: 1,
            },
          ];
        });

        buffer = "";
        return;
      }

      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ================= CALCULATIONS ================= */

  const subtotal = products.reduce(
    (sum, p) => sum + p.rate * p.qty,
    0
  );

  const cgst = +(subtotal * CGST_PERCENT / 100).toFixed(2);
  const sgst = +(subtotal * SGST_PERCENT / 100).toFixed(2);
  const total = +(subtotal + cgst + sgst).toFixed(2);

  const updateQty = (id: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty } : p))
    );
  };

  const removeItem = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };
  const [storeName, setStoreName] = useState('dsdsd');
  return (
    <div
      className={`min-h-screen max-w-3xl p-6 transition-colors duration-300`}
    >
      
        {/* <div className="mb-4">
          <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
            Current theme: {theme}
          </span>
        </div> */}
        <div className="flex justify-between">
          <div className="mb-4 border border-gray-100 dark:border-slate-700 p-4 rounded">
            <p className="text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold">
              Billed From
            </p>
            <div className="text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 ">
              <p className="flex flex-col gap-y-2 pt-4">
                <label> Billed By</label>
                <input className="bg-gray-100 outline-none p-2 capitalize" placeholder={localStorage.getItem('store_name') || 'n/a'} type="text" />
              </p>
            </div>
          </div>
          <div className="mb-4 border border-gray-100 dark:border-slate-700 p-4 rounded">
            <p className="text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold">
              Billed To
            </p>
            <div className="text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 ">
              <p className="flex flex-col gap-y-2 pt-4">
                <label> Customer Number</label>
                <input className="bg-gray-100 outline-none p-2" placeholder="number here" type="text" />
              </p>
              <p className="flex flex-col gap-y-2 pt-4">
                <label> Customer Number</label>
                <input className="bg-gray-100 outline-none p-2" placeholder="number here" type="text" />
              </p>

            </div>
          </div>
        </div>



        {/* HEADER */}
        <h2 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">
          Items & Details
        </h2>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-slate-700">
            <thead className="bg-gray-900 text-white dark:bg-slate-800 dark:text-gray-100">
              <tr>
                <th className="p-2 text-left">Product/Service</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Rate</th>
                <th className="p-2">Tax (%)</th>
                <th className="p-2">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-200 dark:border-slate-700">
                  <td className="p-2 text-gray-900 dark:text-gray-100">
                    {p.name}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Size: {p.size}
                    </div>
                  </td>

                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min={1}
                      value={p.qty}
                      onChange={(e) =>
                        updateQty(p.id, Number(e.target.value))
                      }
                      className="w-16 border rounded px-2 py-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    />
                  </td>

                  <td className="p-2 text-center text-gray-700 dark:text-gray-300">Pcs</td>

                  <td className="p-2 text-center text-gray-700 dark:text-gray-300">
                    ${p.rate.toFixed(2)}
                  </td>

                  <td className="p-2 text-center text-gray-700 dark:text-gray-300">
                    {CGST_PERCENT + SGST_PERCENT}
                  </td>

                  <td className="p-2 text-center text-gray-700 dark:text-gray-300">
                    ${(p.rate * p.qty).toFixed(2)}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeItem(p.id)}
                      className="text-red-500 dark:text-red-400"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center p-6 text-gray-400 dark:text-gray-500"
                  >
                    Scan barcode to add product
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SUMMARY SECTION */}
        <div className="grid grid-cols-2 gap-8 mt-8">

          <div></div>

          <div className="text-sm space-y-2 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between">
              <span>Amount</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>CGST (9%)</span>
              <span>₹{cgst}</span>
            </div>

            <div className="flex justify-between">
              <span>SGST (9%)</span>
              <span>₹{sgst}</span>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-3 flex justify-between font-semibold text-lg">
              <span>Total (USD)</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT MODE */}
        <div className="mt-6">
          <label className="text-sm text-gray-900 dark:text-gray-100">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
          >
            <option>UPI</option>
            <option>Cash</option>
            <option>Card</option>
          </select>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="px-4 py-2 border rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-400">
            Save
          </button>
        </div>
    </div>
  );
}