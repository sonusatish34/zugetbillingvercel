"use client";

import { useEffect, useState } from "react";

/* ================= CONFIG ================= */
const ITEM_API = "http://dev.zuget.com/admin/item-details?item_id=1";
const SAVE_API = "http://dev.zuget.com/admin/offline-order";
const TAX_PERCENT = 18;

/* ================= TYPES ================= */
interface SizeData {
  size: string;
  price: number;
  quantity: number;
}

interface ItemDetails {
  _id: number;
  store_id: number;
  title: string;
  item_name: string;
  brand: string;
  gender: string;
  color: string;
  item_image: string;
  size_data: SizeData[];
}

/* ================= PAGE ================= */
export default function BillingSystem() {
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeData | null>(null);
  const [qty, setQty] = useState(1);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [saving, setSaving] = useState(false);

  /* ===== FETCH ITEM ===== */
  useEffect(() => {
    fetch(ITEM_API,{
      headers: {
        Authorization: localStorage.getItem(`${localStorage.getItem('user_phone')}_token`) || '',
      },
    })
      .then(res => res.json())
      .then(data => {
        const details = data.data.item_details;
        setItem(details);
        setSelectedSize(details.size_data[0]); // default first size
      })
      .catch(() => alert("Failed to load item"));
  }, []);

  /* ===== CALCULATIONS ===== */
  const unitPrice = selectedSize?.price || 0;
  const subtotal = unitPrice * qty;
  const tax = +(subtotal * TAX_PERCENT / 100).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  /* ===== SAVE OFFLINE ORDER ===== */
  const handleSaveOrder = async () => {
  if (!item || !selectedSize) return;

  try {
    setSaving(true);

    const payload = {
      items_json: [
        {
          _id: item._id,
          store_id: item.store_id,
          title: item.title,
          brand: item.brand,
          item_name: item.item_name,
          item_image: item.item_image,
          item_video: null, // API expects this
          store_name: "Walk-in Store", // required by API
          sizeData: [
            {
              size: selectedSize.size,
              price: selectedSize.price,
              quantity: selectedSize.quantity, // AVAILABLE qty from API
            },
          ],
          color: item.color,
          price: selectedSize.price,
          size: selectedSize.size,
          quantity: qty, // ORDERED qty
          gender: item.gender,
        },
      ],
      discount_applied: 0,
      product_price: selectedSize.price * qty,
      final_amount: selectedSize.price * qty,
      name: "Walk-in Customer",
      mobile: "9999999999",
      payment_method: paymentMode,
    };

    const res = await fetch(SAVE_API, {
      method: "POST",
      headers: {
        Authorization:
          localStorage.getItem(`${localStorage.getItem("user_phone")}_token`) || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert(`✅ Order Saved\nInvoice: ${data.data.invoice_number}`);
  } catch (err: any) {
    alert("❌ " + err.message);
  } finally {
    setSaving(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-6">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg cursor-pointer">←</span>
        <h1 className="text-lg font-semibold">Billing System</h1>
      </div>

      {/* BILL FROM / TO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Bill From">
          <Input label="Billed By" value="Mens Store" readOnly />
        </Card>

        <Card title="Bill To">
          <Input label="Customer Name" placeholder="Enter name" />
          <Input label="Customer Mobile" placeholder="Enter number" />
        </Card>
      </div>

      {/* ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <Card title="Items & Details">
            <table className="w-full text-sm border">
              <thead className="bg-gray-900 text-white">
                <tr>
                  {["Product", "Size", "Available", "Qty", "Rate", "Tax", "Amount"].map(h => (
                    <th key={h} className="px-2 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-2 py-2">
                    {item?.item_name}
                    <div className="text-xs text-gray-400">{item?.brand}</div>
                  </td>

                  <td className="px-2 py-2">
                    <select
                      value={selectedSize?.size}
                      onChange={e => {
                        const size = item?.size_data.find(
                          s => s.size === e.target.value
                        );
                        setSelectedSize(size || null);
                        setQty(1);
                      }}
                      className="border rounded px-2 py-1 bg-transparent"
                    >
                      {item?.size_data.map(s => (
                        <option key={s.size} value={s.size}>
                          {s.size}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-2 py-2">
                    {selectedSize?.quantity}
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      max={selectedSize?.quantity}
                      value={qty}
                      onChange={e => setQty(+e.target.value)}
                      className="w-16 border rounded px-2 py-1 bg-transparent"
                    />
                  </td>

                  <td className="px-2 py-2">₹{unitPrice}</td>
                  <td className="px-2 py-2">{TAX_PERCENT}%</td>
                  <td className="px-2 py-2 font-semibold">₹{total}</td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card title="Payment" className="mt-6">
            <Select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e: any) => setPaymentMode(e.target.value)}
              options={["UPI", "Cash", "Card"]}
            />
          </Card>
        </div>

        {/* SUMMARY */}
        <Card>
          <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
          <SummaryRow label={`GST (${TAX_PERCENT}%)`} value={`₹${tax}`} />

          <div className="border-t mt-4 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            disabled={saving}
            onClick={handleSaveOrder}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Offline Order"}
          </button>
        </Card>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, children, className = "" }: any) {
  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-lg p-4 ${className}`}>
      {title && <h2 className="font-medium mb-4">{title}</h2>}
      {children}
    </div>
  );
}

function Input(props: any) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-500">{props.label}</label>
      <input {...props} className="w-full mt-1 px-3 py-2 rounded bg-gray-400/10" />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-500">{label}</label>
      <select {...props} className="w-full mt-1 px-3 py-2 border rounded bg-transparent">
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SummaryRow({ label, value }: any) {
  return (
    <div className="flex justify-between text-sm mb-2">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
