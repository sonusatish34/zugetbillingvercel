"use client";
import { useEffect, useState } from "react";
import React from "react";
import { FaEdit, FaSave, FaTimes, FaPrint } from "react-icons/fa";
import heic2any from "heic2any";

const API_BASE = "https://dev.zuget.com";

export default function PrintListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sizes = ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl"];
  const token = typeof window !== "undefined" ? localStorage.getItem((localStorage.getItem("user_phone") || "") + "_token") || "" : "";

  const fetchItems = async () => {
    const params = new URLSearchParams(window.location.search);
    const listId = params.get("list_id");
    if (!listId) return;

    try {
      const res = await fetch(`${API_BASE}/admin/list-items?list_id=${listId}`, {
        headers: { Authorization: token, accept: "application/json" },
      });
      const data = await res.json();
      const flattened = data.data.flatMap((entry: any) => entry.item_details);
      setItems(flattened);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    let fileToProcess = file;
    if (file.name.toLowerCase().endsWith(".heic")) {
      const converted = await heic2any({ blob: file, toType: "image/jpeg" });
      fileToProcess = new File([Array.isArray(converted) ? converted[0] : converted], "image.jpg", { type: "image/jpeg" });
    }

    const localUrl = URL.createObjectURL(fileToProcess);
    setEditFormData({
      ...editFormData,
      [`${field}_file`]: fileToProcess,
      [`${field}_preview`]: localUrl
    });
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    const formdata = new FormData();
    formdata.append("file", file);
    const res = await fetch(`${API_BASE}/s3/image-file`, {
      method: "POST",
      headers: { Authorization: token },
      body: formdata,
    });
    const result = await res.json();
    return result?.data?.image_link;
  };

  const handleUpdate = async (itemId: number) => {
    setIsUpdating(true);
    try {
      let finalFrontUrl = editFormData.item_image;
      let finalBackUrl = editFormData.item_video;

      if (editFormData.front_file) finalFrontUrl = await uploadToS3(editFormData.front_file);
      if (editFormData.back_file) finalBackUrl = await uploadToS3(editFormData.back_file);

      const res = await fetch(`${API_BASE}/admin/update-product?item_id=${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          ...editFormData,
          item_image: finalFrontUrl,
          item_video: finalBackUrl,
          gender: "Mens"
        }),
      });

      if ((await res.json()).status === "success") {
        setEditingId(null);
        fetchItems();
      }
    } catch (e) { console.error(e); }
    setIsUpdating(false);
  };

  const printLabels = (row: any) => {
    if (!row.barcode) {
      alert("Please save product first to generate barcode");
      return;
    }

    const win = window.open("", "_blank");
    if (!win) {
      alert("Popup blocked! Please allow popups to print labels.");
      return;
    }

    const storeName = localStorage.getItem("store_name") || "THE EDIT LUXURY CLUB";

    let html = `
<html>
<head>
  <title>Print Labels - ${row.barcode}</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <style>
    @page { size: 101.6mm 50.8mm; margin: 0; }
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; }
    
    .label-container {
      width: 101.6mm;
      height: 50.8mm;
      display: flex;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      overflow: hidden;
    }

    .portrait-wrapper {
      transform: rotate(-90deg);
      width: 46mm;
      height: 92mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1mm 2mm;
      box-sizing: border-box;
      text-transform: uppercase;
    }

    .store_name {
      background: #000 !important;
      color: #fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      padding: 2px 4px;
      font-size: 14px;
      font-weight: bold;
      display: inline-block;
      margin-bottom: 2px;
      word-break: break-word;
    }

    .barcode-section { background: #fff; }

    .barcode-svg {
      max-width: 100%;
      height: 60px;
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      shape-rendering: crispEdges;
    }

    .barcode-number { font-size: 12px; font-weight: 800; }
    
    .brand {
      padding-top:10px;
      font-size: 18px;
      font-weight: 900;
      margin: 2px 0;
      word-wrap: break-word;
    }
    
    .specs {
      font-size: 12px;
      font-weight: 800;
      line-height: 1.8;
      flex-grow: 1;
      padding-top:12px
    }
    
    .specs p {
      margin: 1px 0;
      word-break: break-all;
      white-space: normal;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1.5px solid #000;
      padding-top: 2px;
      margin-top: 2px;
    }

    .mrp-label { font-size: 8px; font-weight: 700; line-height: 1; }
    .price { font-size: 20px; font-weight: 900; }
  </style>
</head>
<body>
`;

    // Bridging your size_data array to the print loop logic
    row.size_data.forEach((s: any) => {
      const qty = Number(s.quantity) || 0;
      if (qty > 0) {
        for (let i = 0; i < qty; i++) {
          const uniqueId = `bc_${s.size}_${i}_${Math.floor(Math.random() * 1000)}`;

          html += `
<div class="label-container">
  <div class="portrait-wrapper">
    <div style="display: flex; flex-direction: column;">
      <div class="store_name">${storeName}</div>
      <div class="barcode-section">
        <svg class="barcode-svg" data-value="${row._id}-${s.size.toUpperCase()}" id="${uniqueId}"></svg>
        <div class="barcode-number">${row._id}-${s.size.toUpperCase()}</div>
      </div>
      <div class="brand">${row.brand}</div>
      <div class="specs">
        <p>ITEM: ${row.item_name}</p>
        <p>SIZE: ${s.size.toUpperCase()}</p>
        <p>COLOR: ${row.color || "N/A"}</p>
        <p>FIT: ${row.fit || "N/A"}</p>
      </div>
    </div>
    <div class="footer">
      <div class="mrp-label">MAX RETAIL PRICE<br/>(Incl. of all taxes)</div>
      <div class="price">₹${s.price}</div>
    </div>
  </div>
</div>`;
        }
      }
    });

    html += `
<script>
  window.onload = () => {
    document.querySelectorAll('.barcode-svg').forEach(el => {
      JsBarcode(el, el.getAttribute('data-value'), {
        format: "CODE128",
        width: 3,
        height: 80,
        displayValue: false,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000"
      });
    });

    setTimeout(() => {
      window.print();
      window.close();
    }, 500);
  };
</script>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
  };

  if (loading) return <div className="p-10 text-center text-purple-600 font-bold">Loading Inventory...</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Inventory Quick Update</h1>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full text-center text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600 uppercase text-[11px]">
              <th className="p-3 text-left">Product Details</th>
              <th className="px-2">Front Image</th>
              <th className="px-2">Back Image</th>
              {sizes.filter(s => s !== 'xs').map(s => (
                <th key={s} className="px-2 border-x bg-blue-50/20 w-20">{s}</th>
              ))}
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => {
              const isEditing = editingId === item._id;
              return (
                <tr key={item._id} className={isEditing ? "bg-yellow-50" : "hover:bg-gray-50"}>
                  {/* DETAILS */}
                  <td className="p-3 text-left max-w-xs">
                    <div className="font-bold text-gray-800">{item.item_name}</div>
                    <div className="text-[10px] text-gray-400">{item.brand} | {item.color}</div>
                  </td>

                  {/* FRONT IMAGE */}
                  <td className="p-2 border-x">
                    <div className="flex flex-col items-center gap-1">
                      <img src={isEditing ? (editFormData.front_preview || editFormData.item_image) : item.item_image} className="w-12 h-12 rounded border object-cover shadow-sm" />
                      {isEditing && (
                        <label className="cursor-pointer bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full hover:bg-blue-700">
                          Edit <input type="file" className="hidden" onChange={(e) => handleImageChange(e, "front")} />
                        </label>
                      )}
                    </div>
                  </td>

                  {/* BACK IMAGE */}
                  <td className="p-2 border-r">
                    <div className="flex flex-col items-center gap-1">
                      <img src={isEditing ? (editFormData.back_preview || editFormData.item_video) : item.item_video} className="w-12 h-12 rounded border object-cover shadow-sm" />
                      {isEditing && (
                        <label className="cursor-pointer bg-gray-600 text-white text-[9px] px-2 py-0.5 rounded-full hover:bg-gray-700">
                          Edit <input type="file" className="hidden" onChange={(e) => handleImageChange(e, "back")} />
                        </label>
                      )}
                    </div>
                  </td>

                  {(isEditing ? editFormData.size_data : item.size_data).map((sObj: any) => {
                    return (
                      <td key={sObj.size} className="border-x px-1">
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              placeholder="Price"
                              className="w-16 border rounded text-[10px] p-1 text-center"
                              value={sObj.price}
                              onChange={(e) => {
                                const newData = [...editFormData.size_data];
                                const idx = newData.findIndex(sd => sd.size === sObj.size);
                                if (idx > -1) newData[idx].price = Number(e.target.value);
                                setEditFormData({ ...editFormData, size_data: newData });
                              }}
                            />
                            <input
                              type="number"
                              placeholder="Qty"
                              className="w-16 border rounded text-[10px] p-1 text-center bg-yellow-100/50"
                              value={sObj.quantity}
                              onChange={(e) => {
                                const newData = [...editFormData.size_data];
                                const idx = newData.findIndex(sd => sd.size === sObj.size);
                                if (idx > -1) newData[idx].quantity = Number(e.target.value);
                                setEditFormData({ ...editFormData, size_data: newData });
                              }}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-[10px] text-black font-bold">{sObj.size}</div>
                            <div className="text-[10px] text-gray-400">₹{sObj.price}</div>
                            <div className="font-bold text-gray-700">{sObj.quantity}</div>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* ACTIONS */}
                  <td className="p-2">
                    <div className="flex gap-3 justify-center text-lg">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleUpdate(item._id)} disabled={isUpdating} className="text-green-600 hover:scale-110 transition-transform"><FaSave /></button>
                          <button onClick={() => setEditingId(null)} className="text-red-400 hover:scale-110 transition-transform"><FaTimes /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(item._id); setEditFormData({ ...item }); }} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                          <button onClick={() => printLabels(item)} className="text-purple-500 hover:text-purple-700"><FaPrint /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}