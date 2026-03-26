"use client";
import { useEffect, useState } from "react";
import React from "react";
import { FaEdit, FaSave, FaTimes, FaPrint, FaCamera, FaSpinner, FaInbox, FaSearch, FaCheckSquare, FaSquare } from "react-icons/fa";
import heic2any from "heic2any";

const API_BASE = "https://dev.zuget.com";

const ALPHA_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
const NUMERIC_SIZES = Array.from({ length: 11 }, (_, i) => (28 + i * 2).toString());

export default function PrintListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- PRINT MODAL STATE ---
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingItem, setPrintingItem] = useState<any>(null);
  const [printSelections, setPrintSelections] = useState<any[]>([]);

const [showImg, setShowImg] = useState("");
  const getAuthToken = () => {
    if (typeof window === "undefined") return "";
    const phone = localStorage.getItem("user_phone") || "";
    const token = localStorage.getItem(phone + "_token") || "";
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/total-items?limit=10000&offset=0`, {
        headers: { Authorization: getAuthToken(), accept: "application/json" },
      });
      const result = await res.json();
      if (result.status === "success" && result.data?.total_items) {
        const sortedData = result.data.total_items.sort((a: any, b: any) => {
          return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
        });
        setItems(sortedData);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = items.filter((item) =>
    item.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFullSizeData = (existingSizeData: any[]) => {
    const isNumeric = existingSizeData.some(s => !isNaN(Number(s.size)));
    const range = isNumeric ? NUMERIC_SIZES : ALPHA_SIZES;
    return range.map(size => {
      const existing = existingSizeData.find(s => s.size.toString().toUpperCase() === size);
      return existing || { size: size, price: 0, quantity: 0 };
    });
  };

  const formatDateTime = (i: string): string => {
    const d = new Date(i.replace(' ', 'T')), n = d.getDate(),
      s = n > 3 && n < 21 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th',
      m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    let h = d.getHours();
    return `${n}${s} ${m} ${d.getFullYear()} at ${(h = h % 12 || 12)}:${String(d.getMinutes()).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    let fileToProcess = file;
    if (file.name.toLowerCase().endsWith(".heic")) {
      const converted = await heic2any({ blob: file, toType: "image/jpeg" });
      fileToProcess = new File([Array.isArray(converted) ? converted[0] : converted], "image.jpg", { type: "image/jpeg" });
    }
    const localUrl = URL.createObjectURL(fileToProcess);
    setEditFormData({ ...editFormData, [`${field}_file`]: fileToProcess, [`${field}_preview`]: localUrl });
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    const formdata = new FormData();
    formdata.append("file", file);
    const res = await fetch(`${API_BASE}/s3/image-file`, {
      method: "POST",
      headers: { Authorization: getAuthToken() },
      body: formdata,
    });
    const result = await res.json();
    return result?.data?.image_link;
  };

  const handleUpdate = async (itemId: string) => {
    setIsUpdating(true);
    try {
      let finalFrontUrl = editFormData.item_image;
      let finalBackUrl = editFormData.item_video;
      if (editFormData.front_file) finalFrontUrl = await uploadToS3(editFormData.front_file);
      if (editFormData.back_file) finalBackUrl = await uploadToS3(editFormData.back_file);
      const cleanedSizeData = editFormData.size_data.filter((s: any) => s.quantity > 0 || s.price > 0);
      const res = await fetch(`${API_BASE}/admin/update-product?item_id=${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: getAuthToken() },
        body: JSON.stringify({ ...editFormData, item_image: finalFrontUrl, item_video: finalBackUrl, size_data: cleanedSizeData }),
      });
      if ((await res.json()).status === "success") { setEditingId(null); fetchItems(); }
    } catch (e) { console.error(e); }
    setIsUpdating(false);
  };

  // --- PRINT POPUP LOGIC ---
  const openPrintModal = (item: any) => {
    setPrintingItem(item);
    const initial = item.size_data
      .filter((s: any) => s.quantity > 0)
      .map((s: any) => ({
        size: s.size,
        printQty: s.quantity,
        price: s.price,
        selected: true
      }));
    setPrintSelections(initial);
    setIsPrintModalOpen(true);
  };

  const executePrint = () => {
    if (!printingItem?.barcode) return alert("Please save product first to generate barcode");
    const toPrint = printSelections.filter(s => s.selected && s.printQty > 0);
    if (toPrint.length === 0) return alert("Select at least one size to print");

    const barcodeStr = String(printingItem.barcode);
    const barcodePart = barcodeStr.includes('-') ? barcodeStr.split('-')[1] : barcodeStr;
    const win = window.open("", "_blank");
    if (!win) return alert("Popup blocked!");

    const storeName = localStorage.getItem("store_name") || "The Edit Luxury Club";
    let html = `<html><head><title>Print Labels</title>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
    <style>
      @page { size: 101.6mm 50.8mm; margin: 0; }
      body { margin: 0; padding: 0; font-family: sans-serif; text-transform: uppercase; }
      .label-container { width: 101.6mm; height: 50.8mm; display: flex; align-items: center; justify-content: center; page-break-after: always; overflow: hidden; }
      .portrait-wrapper { transform: rotate(-90deg); width: 48mm; height: 88mm; display: flex; flex-direction: column; justify-content: space-between; padding: 2mm 4mm; box-sizing: border-box; }
      .store_name { background: #000; color: #fff; padding: 2px 6px; font-size: 14px; font-weight: bold; display: inline-block; }
      .barcode-svg { width: 100%; height: 90px; display: block; shape-rendering: crispEdges; }
      .brand { font-size: 18px; font-weight: 900; margin: 2px 0; }
      .specs { font-size: 10px; font-weight: 800; flex-grow: 1; margin-top: 5px; }
      .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1.5px solid #000; padding-top: 2px; }
      .price { font-size: 20px; font-weight: 900; }
    </style></head><body>`;

    toPrint.forEach((s) => {
      for (let i = 0; i < s.printQty; i++) {
        html += `<div class="label-container"><div class="portrait-wrapper">
          <div>
            <div class="store_name">${storeName}</div>
            <svg class="barcode-svg" data-value="${printingItem._id}-${s.size}"></svg>
            <div style=" font-size:12px; font-weight:800; margin-bottom:5px;">${barcodeStr}-${s.size}</div>
            <div class="brand">${printingItem.brand || "N/A"}</div>
            <div class="specs">
              <p style="margin:2px 0">ITEM: ${printingItem.item_name}</p>
              <p style="margin:2px 0 text-wrap:nowrap">SIZE: ${s.size}</p>
              <p style="margin:2px 0">COLOR: ${printingItem.color || "N/A"}</p>
              <p style="margin:2px 0">FIT: ${printingItem.fit || "N/A"}</p>
            </div>
          </div>
          <div class="footer">
            <div style="font-size:8px">MAX RETAIL PRICE<br/>(Incl. of all taxes)</div>
            <div class="price">₹${s.price}</div>
          </div>
        </div></div>`;
      }
    });

    html += `<script>window.onload = () => {
      document.querySelectorAll('.barcode-svg').forEach(el => {
        JsBarcode(el, el.getAttribute('data-value'), { format: "CODE128", width: 2, height: 90, displayValue: false, margin: 0 });
      });
      setTimeout(() => { window.print(); window.close(); }, 700);
    };</script></body></html>`;

    win.document.write(html);
    win.document.close();
    setIsPrintModalOpen(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <FaSpinner className="animate-spin text-2xl text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Registry</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search item name..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={fetchItems} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isEditing = editingId === item._id;
          return (
            <div key={item._id} className={`border rounded-xl transition-all duration-200 ${isEditing ? 'border-blue-500 shadow-md bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="p-4 flex flex-wrap justify-center items-center gap-6">
                <div className="flex space-x-3 w-[200px]">
                  {[item.item_image, item.item_video].map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-gray-100">
                      <img
                        src={(isEditing ? (idx === 0 ? (editFormData.front_preview || item.item_image) : (editFormData.back_preview || item.item_video)) : img) || ""}
                        className="w-full h-full object-cover"
                        alt="item"
                      />
                      {isEditing && (
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                          <FaCamera className="text-white text-xs" />
                          <input type="file" className="hidden" onChange={(e) => handleImageChange(e, idx === 0 ? "front" : "back")} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-1 w-[100px]">
                  <h3 className="font-bold text-gray-900">{item.item_name}</h3>
                  <div className="flex gap-2 text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
                    <span>{item.brand}</span><span>•</span><span>{item.color}</span>
                  </div>
                </div>

                <div className=" w-[190px]">
                  <h3 className="text-xs font-semibold text-gray-600">{formatDateTime(item.created_on)}</h3>
                </div>

                {!isEditing && (
                  <div className="flex gap-2 w-[200px]">
                    {item.size_data.filter((s: any) => s.quantity > 0).slice(0, 4).map((s: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">{s.size}: {s.quantity}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 w-[200px] bg-re">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleUpdate(item._id)} disabled={isUpdating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
                        {isUpdating ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-gray-600"><FaTimes size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingId(item._id);
                        setEditFormData({ ...item, size_data: getFullSizeData(item.size_data) });
                      }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit size={18} /></button>
                      <button onClick={() => openPrintModal(item)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><FaPrint size={18} /></button>
                    </>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="px-4 pb-6 pt-2 border-t border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-3 tracking-widest">Update Size Matrix</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                    {editFormData.size_data.map((s: any, i: number) => (
                      <div key={i} className={`p-2 rounded-lg border bg-white ${s.quantity > 0 ? 'border-blue-200 shadow-sm' : 'border-gray-100'}`}>
                        <div className="text-[10px] font-black text-gray-400 mb-1">{s.size}</div>
                        <input
                          type="number"
                          value={s.price || ""}
                          onChange={(e) => {
                            const newData = [...editFormData.size_data];
                            newData[i].price = Number(e.target.value);
                            setEditFormData({ ...editFormData, size_data: newData });
                          }}
                          className="w-full text-[11px] font-bold border-b mb-1 focus:outline-none" placeholder="Price"
                        />
                        <input
                          type="number"
                          value={s.quantity || ""}
                          onChange={(e) => {
                            const newData = [...editFormData.size_data];
                            newData[i].quantity = Number(e.target.value);
                            setEditFormData({ ...editFormData, size_data: newData });
                          }}
                          className="w-full text-[11px] font-bold focus:outline-none" placeholder="Qty"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- PRINT MODAL --- */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800">Print Labels</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-tight">{printingItem?.item_name}</p>
              </div>
              <button onClick={() => setIsPrintModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FaTimes /></button>
            </div>
            
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-bold text-gray-400">SELECT SIZE & QTY</span>
                <button 
                  onClick={() => {
                    const allSelected = printSelections.every(s => s.selected);
                    setPrintSelections(printSelections.map(s => ({ ...s, selected: !allSelected })));
                  }}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  {printSelections.every(s => s.selected) ? "DESELECT ALL" : "SELECT ALL"}
                </button>
              </div>

              <div className="space-y-2">
                {printSelections.map((s, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-3 border rounded-xl transition-colors ${s.selected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100'}`}>
                    <button 
                      onClick={() => {
                        const next = [...printSelections];
                        next[idx].selected = !next[idx].selected;
                        setPrintSelections(next);
                      }}
                      className={s.selected ? "text-blue-600" : "text-gray-300"}
                    >
                      {s.selected ? <FaCheckSquare size={20}/> : <FaSquare size={20}/>}
                    </button>
                    
                    <div className="flex-1">
                      <p className="font-black text-sm text-gray-800">{s.size}</p>
                      <p className="text-[10px] text-gray-500">Price: ₹{s.price}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-bold text-gray-400">PRINT QTY</span>
                      <input 
                        type="number" 
                        value={s.printQty} 
                        onChange={(e) => {
                          const next = [...printSelections];
                          next[idx].printQty = Math.max(0, Number(e.target.value));
                          setPrintSelections(next);
                        }}
                        className="w-16 border rounded-lg px-2 py-1 text-center text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setIsPrintModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={executePrint} 
                className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-transform active:scale-95"
              >
                <FaPrint /> Print {printSelections.filter(s => s.selected).reduce((acc, curr) => acc + curr.printQty, 0)} Labels
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <FaInbox className="mx-auto text-gray-300 text-4xl mb-4" />
          <p className="text-gray-500 font-medium">No items found matching your search.</p>
        </div>
      )}
    </div>
  );
}