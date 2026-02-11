'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ================= CONFIG ================= */
const API_URL = 'http://dev.zuget.com/admin/offline-orders?invoice_number=INV%200000011';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3Bob25lIjoiOTE4MjQ1MDc3MCJ9.RjEl6Sl5oNBj-_lW7-gKHqS5PcBU6TVYHwaPFPdmsTg';

/* ================= TYPES ================= */
interface Item {
    item_name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
}

interface Order {
    invoice_number: string;
    name: string;
    mobile: string;
    payment_method: string;
    created_on: string;
    product_price: number;
    discount_applied: number;
    final_amount: number;
    items_json: Item[];
}

export default function InvoicePage() {
    const [order, setOrder] = useState<Order | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(API_URL, {
            headers: { accept: 'application/json', Authorization: AUTH_TOKEN },
        })
            .then(res => res.json())
            .then(data => setOrder(data.data.offline_orders[0]));
    }, []);

    const handlePrint = () => window.print();

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${order?.invoice_number}.pdf`);
    };

    if (!order) return <div className="p-10">Loading invoice...</div>;

    return (
        <div className="p-6 bg-gray-100 dark:bg-zinc-900 min-h-screen">
            {/* Actions */}
            <div className="flex justify-end gap-3 mb-4 print:hidden">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white">
                    <Download size={16} /> Download PDF
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-700 text-white">
                    <Printer size={16} /> Print
                </button>
            </div>

            {/* Invoice */}
            <div ref={invoiceRef} className="max-w-5xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow p-8 text-sm text-gray-800 dark:text-gray-200">
                {/* Header */}
                <div className='bg-[#F7F8F9] py-8 px-4 rounded-md'>
                    <div className="border-b pb-4">
                        <h1 className="text-2xl font-bold">Invoice</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dreams Technologies Pvt Ltd.<br />15 Hodges Mews, High Wycombe HP12 3JL, United Kingdom</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-6 mt-6">
                        <div>
                            <h3 className="font-semibold mb-1">Invoice Details</h3>
                            <p>Invoice No: {order.invoice_number}</p>
                            <p>Date: {order.created_on}</p>
                            <p className="text-red-500 font-medium">Due in 6 days</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Billing From</h3>
                            <p>Zugut Invoice Management</p>
                            <p>India</p>
                            <p>GST: 24AEFS4576R89</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Billing To</h3>
                            <p>{order.name}</p>
                            <p>{order.mobile}</p>
                            <p>Payment: {order.payment_method}</p>
                        </div>
                    </div>

                </div>



                {/* Items */}
                <table className="w-full mt-8 border dark:border-zinc-700">
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            <th className="p-2">#</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th>Rate</th>
                            <th>Discount</th>
                            <th>Tax</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items_json.map((item, i) => (
                            <tr key={i} className="border-t dark:border-zinc-700 text-center">
                                <td className="p-2">{i + 1}</td>
                                <td>{item.item_name}</td>
                                <td>{item.quantity}</td>
                                <td>Pcs</td>
                                <td>₹{item.price}</td>
                                <td>0%</td>
                                <td>0%</td>
                                <td className="font-medium">₹{item.price * item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="grid grid-cols-2 mt-8 gap-6">
                    <div>
                        <h3 className="font-semibold">Bank Details</h3>
                        <p>Bank: ABC Bank</p>
                        <p>Account: 78245379312</p>
                        <p>IFSC: ABCD001345</p>
                    </div>
                    <div className="text-right">
                        <p>Subtotal: ₹{order.product_price}</p>
                        <p className="text-red-500">Discount: -₹{order.discount_applied}</p>
                        <p className="text-lg font-bold mt-2">Total: ₹{order.final_amount}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t mt-8 pt-4 flex justify-between items-end">
                    <div className="text-xs">
                        <p className="font-semibold">Terms & Conditions</p>
                        <p>The payment must be returned in the same condition.</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">Ted M. Davis</p>
                        <p className="text-xs">Manager</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
