"use client";

import { useEffect, useState } from "react";

/* ================== CONFIG ================== */
const API_BASE = "https://dev.zuget.com";
const API_URL = "https://dev.zuget.com/admin/add-items";

/* ================== TYPES ================== */
interface Option {
  _id: number;
  name: string;
}

interface SizeRow {
  size: string;
  price: string;
  quantity: string;
}

interface Variant {
  color: string;
  sizes: SizeRow[];
  samePrice: string;
  sameQuantity: string;
}

interface BulkRow {
  title: string;
  brand: string;
  item_name: string;
  gender: string;
  pattern: string;
  fabric: string;
  fit: string;
  color: string;
  item_image?: string;
  item_video?: string;
  size_data: SizeRow[];
}

/* ================== CONSTANTS ================== */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const createEmptySizes = (): SizeRow[] =>
  SIZES.map((size) => ({
    size,
    price: "",
    quantity: "",
  }));

/* ================== COMPONENT ================== */
export default function AddItemPage() {
  /* ---------- AUTH ---------- */
  const [authtoken, setAuthtoken] = useState("");

  /* ---------- DROPDOWNS ---------- */
  const [patterns, setPatterns] = useState<Option[]>([]);
  const [fabrics, setFabrics] = useState<Option[]>([]);
  const [fits, setFits] = useState<Option[]>([]);

  /* ---------- TABS ---------- */
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  /* ---------- SINGLE FORM ---------- */
  const [form, setForm] = useState({
    title: "",
    brand: "",
    item_name: "",
    gender: "Male",
    pattern: "",
    fabric: "",
    fit: "",
  });

  const [singleVariants, setSingleVariants] = useState<Variant[]>([
    {
      color: "",
      sizes: createEmptySizes(),
      samePrice: "",
      sameQuantity: "",
    },
  ]);

  /* ---------- BULK FORM ---------- */
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkImageFile, setBulkImageFile] = useState<File | null>(null);
  const [bulkImagePreview, setBulkImagePreview] = useState<string | null>(null);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [parsedCsv, setParsedCsv] = useState(false);

  /* ---------- MEDIA ---------- */
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemVideoFile, setItemVideoFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
  const [itemVideoPreview, setItemVideoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    const token =
      localStorage.getItem(`${localStorage.getItem("user_phone")}_token`) || "";
    setAuthtoken(token);
  }, []);

  useEffect(() => {
    fetchData("/util/patterns", setPatterns);
    fetchData("/util/fabrics", setFabrics);
    fetchData("/util/fit-categories", setFits);
  }, []);

  const fetchData = async (endpoint: string, setter: Function) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Accept: "application/json",
        Authorization:
          localStorage.getItem(
            localStorage.getItem("user_phone") + "_token"
          ) || "",
      },
    });
    const json = await res.json();
    setter(json?.data?.results || []);
  };

  /* ---------- IMAGE UPLOAD ---------- */
  const uploadToS3 = async (file: File): Promise<string> => {
    const formdata = new FormData();
    formdata.append("file", file);

    const res = await fetch("https://dev.zuget.com/s3/image-file", {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: authtoken,
      },
      body: formdata,
    });

    const result = await res.json();
    return result?.data?.image_link;
  };

  /* ---------- SINGLE FILE HANDLERS ---------- */
  const handleItemImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setItemImageFile(file);
    setItemImagePreview(URL.createObjectURL(file));
  };

  const handleItemVideoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setItemVideoFile(file);
    setItemVideoPreview(URL.createObjectURL(file));
  };

  /* ---------- BULK FILE HANDLERS ---------- */
  const handleBulkImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkImageFile(file);
    setBulkImagePreview(URL.createObjectURL(file));
  };

  const handleBulkCsvChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBulkCsv(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const parseBulkCsv = () => {
    if (!bulkCsv.trim()) {
      alert("Please paste or upload CSV");
      return;
    }

    try {
      const lines = bulkCsv.trim().split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      const rows: BulkRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        // Validate required fields
        if (!row.title || !row.item_name || !row.brand) {
          alert(`Missing required fields in row ${i + 1}`);
          return;
        }

        // Create size_data from size_data column or default empty
        row.size_data = createEmptySizes();

        rows.push(row as BulkRow);
      }

      setBulkRows(rows);
      setParsedCsv(true);
    } catch (err) {
      alert("Invalid C   SV format");
    }
  };

  /* ---------- SINGLE SIZE HELPERS ---------- */
  const handleSizeChange = (
    vIndex: number,
    sIndex: number,
    field: "price" | "quantity",
    value: string
  ) => {
    const updated = [...singleVariants];
    updated[vIndex].sizes[sIndex][field] = value;
    setSingleVariants(updated);
  };

  const applySamePrice = (vIndex: number, value: string) => {
    const updated = [...singleVariants];
    updated[vIndex].samePrice = value;
    updated[vIndex].sizes = updated[vIndex].sizes.map((s) => ({
      ...s,
      price: value,
    }));
    setSingleVariants(updated);
  };

  const applySameQuantity = (vIndex: number, value: string) => {
    const updated = [...singleVariants];
    updated[vIndex].sameQuantity = value;
    updated[vIndex].sizes = updated[vIndex].sizes.map((s) => ({
      ...s,
      quantity: value,
    }));
    setSingleVariants(updated);
  };

  const addNewColorVariant = () => {
    setSingleVariants((prev) => [
      ...prev,
      {
        color: "",
        sizes: createEmptySizes(),
        samePrice: "",
        sameQuantity: "",
      },
    ]);
  };

  /* ---------- SINGLE SUBMIT ---------- */
  const handleSingleSubmit = async () => {
    if (!itemImageFile || !itemVideoFile) {
      alert("Please upload item image and video");
      return;
    }

    setSubmitting(true);

    try {
      const [itemImageUrl, itemVideoUrl] = await Promise.all([
        uploadToS3(itemImageFile),
        uploadToS3(itemVideoFile),
      ]);

      for (const variant of singleVariants) {
        if (!variant.color.trim()) {
          alert("Please enter color for all variants");
          return;
        }

        const payload = {
          title: form.title,
          brand: form.brand,
          item_name: form.item_name,
          gender: form.gender,
          item_image: itemImageUrl,
          item_video: itemVideoUrl,
          color: variant.color,
          pattern: form.pattern,
          fabric: form.fabric,
          fit: form.fit,
          size_data: variant.sizes.map((s) => ({
            size: s.size,
            price: s.price ? Number(s.price) : null,
            quantity: s.quantity ? Number(s.quantity) : null,
          })),
        };

        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authtoken,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.status !== "success") {
          alert(`Failed for color ${variant.color}`);
          return;
        }
      }

      alert("Item added successfully 🎉");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- BULK SUBMIT ---------- */
  const handleBulkSubmit = async () => {
    if (!bulkImageFile) {
      alert("Please upload bulk image");
      return;
    }
    if (bulkRows.length === 0) {
      alert("Please parse CSV first");
      return;
    }

    setSubmitting(true);

    try {
      const bulkImageUrl = await uploadToS3(bulkImageFile);

      for (const row of bulkRows) {
        const payload = {
          title: row.title,
          brand: row.brand,
          item_name: row.item_name,
          gender: row.gender,
          item_image: bulkImageUrl,
          item_video: bulkImageUrl, // Use same image as video thumbnail
          color: row.color || "Default",
          pattern: row.pattern,
          fabric: row.fabric,
          fit: row.fit,
          size_data: row.size_data.map((s) => ({
            size: s.size,
            price: s.price ? Number(s.price) : null,
            quantity: s.quantity ? Number(s.quantity) : null,
          })),
        };

        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authtoken,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.status !== "success") {
          console.error(`Failed for ${row.title}:`, json);
          continue;
        }
      }

      alert(`${bulkRows.length} items added successfully 🎉`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================== UI ================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add New Item
            </h1>
            <p className="text-slate-500 mt-2">Upload single items or bulk via CSV</p>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 p-8">

          {/* TABS */}
          <div className="flex border-b border-slate-200 mb-10 pb-4">
            <button
              onClick={() => setActiveTab("single")}
              className={`px-8 py-3 rounded-t-xl font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === "single"
                ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25 -mb-px z-10"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
            >
              <div className={`w-3 h-3 rounded-full ${activeTab === "single" ? "bg-white/30" : "bg-indigo-400/50"
                }`}></div>
              Single Upload
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`px-8 py-3 rounded-t-xl font-semibold ml-2 transition-all duration-300 flex items-center gap-2 ${activeTab === "bulk"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 -mb-px z-10"
                : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                }`}
            >
              <div className={`w-3 h-3 rounded-full ${activeTab === "bulk" ? "bg-white/30" : "bg-emerald-400/50"
                }`}></div>
              Bulk Upload (CSV)
            </button>
          </div>

          {activeTab === "single" && (
            <div className="space-y-8">
              {/* SINGLE BASIC INFO */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Product Title</label>
                  <input
                    className="input-field"
                    placeholder="Enter product title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Brand</label>
                  <input
                    className="input-field"
                    placeholder="Enter brand name"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Item Name</label>
                  <input
                    className="input-field"
                    placeholder="Enter item name"
                    value={form.item_name}
                    onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                  />
                </div>
              </div>

              {/* SINGLE ATTRIBUTES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Gender</label>
                  <select
                    className="input-field"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Children</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Pattern</label>
                  <select
                    className="input-field"
                    value={form.pattern}
                    onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                  >
                    <option value="">Select Pattern</option>
                    {patterns.map((p) => (
                      <option key={p._id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Fabric</label>
                  <select
                    className="input-field"
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                  >
                    <option value="">Select Fabric</option>
                    {fabrics.map((f) => (
                      <option key={f._id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Fit</label>
                  <select
                    className="input-field"
                    value={form.fit}
                    onChange={(e) => setForm({ ...form, fit: e.target.value })}
                  >
                    <option value="">Select Fit</option>
                    {fits.map((f) => (
                      <option key={f._id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SINGLE MEDIA */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Item Image</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                    <input type="file" accept="image/*" onChange={handleItemImageChange} className="hidden" id="item-image" />
                    <label htmlFor="item-image" className="cursor-pointer block">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-medium">Upload Image</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    </label>
                    {itemImagePreview && (
                      <div className="mt-4">
                        <img src={itemImagePreview} className="w-32 h-32 object-cover rounded-xl shadow-lg mx-auto" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Item Video</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors bg-slate-50/50">
                    <input type="file" accept="image/*" onChange={handleItemVideoChange} className="hidden" id="item-video" />
                    <label htmlFor="item-video" className="cursor-pointer block">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-medium">Upload Video</p>
                      <p className="text-xs text-slate-500 mt-1">MP4 up to 50MB</p>
                    </label>
                    {itemVideoPreview && (
                      <div className="mt-4">
                        <img src={itemVideoPreview} className="w-32 h-32 object-cover rounded-xl shadow-lg mx-auto" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SINGLE VARIANTS */}
              {singleVariants.map((variant, vIndex) => (
                <div key={vIndex} className="variant-card">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      Color Variant {vIndex + 1}
                    </h3>
                    {vIndex > 0 && (
                      <button
                        onClick={() => {
                          const updated = singleVariants.filter((_, idx) => idx !== vIndex);
                          setSingleVariants(updated);
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Color Name</label>
                      <input
                        className="input-field w-full"
                        placeholder="Enter color name (e.g., Blue, Red, Black)"
                        value={variant.color}
                        onChange={(e) => {
                          const updated = [...singleVariants];
                          updated[vIndex].color = e.target.value;
                          setSingleVariants(updated);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-r from-slate-50/50 to-indigo-50/30 rounded-2xl">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Same Price (All Sizes)</label>
                        <input
                          className="input-field"
                          placeholder="₹ 0"
                          type="number"
                          value={variant.samePrice}
                          onChange={(e) => applySamePrice(vIndex, e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Same Quantity (All Sizes)</label>
                        <input
                          className="input-field"
                          placeholder="0"
                          type="number"
                          value={variant.sameQuantity}
                          onChange={(e) => applySameQuantity(vIndex, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="size-grid">
                      {variant.sizes.map((s, i) => (
                        <div key={s.size} className="size-card">
                          <div className="size-label">{s.size}</div>
                          <div className="space-y-2">
                            <input
                              className="input-field size-input"
                              placeholder="Qty"
                              type="number"
                              value={s.quantity}
                              onChange={(e) => handleSizeChange(vIndex, i, "quantity", e.target.value)}
                            />
                            <input
                              className="input-field size-input"
                              placeholder="₹ 0"
                              type="number"
                              value={s.price}
                              onChange={(e) => handleSizeChange(vIndex, i, "price", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200">
                <button onClick={addNewColorVariant} className="btn-secondary">
                  ➕ Add Another Color Variant
                </button>
                <button onClick={handleSingleSubmit} disabled={submitting} className="btn-primary">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </span>
                  ) : (
                    "🚀 Add Item Now"
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "bulk" && (
            <div className="space-y-8">
              {/* BULK UPLOAD */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-lg font-bold text-slate-800 block mb-4">Bulk Image</label>
                  <p className="text-sm text-slate-600 mb-4">Same image used for all items</p>
                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-10 text-center hover:border-emerald-400 transition-colors bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                    <input type="file" accept="image/*" onChange={handleBulkImageChange} className="hidden" id="bulk-image" />
                    <label htmlFor="bulk-image" className="cursor-pointer block">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-700 font-semibold text-lg">Upload Bulk Image</p>
                      <p className="text-sm text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    </label>
                    {bulkImagePreview && (
                      <div className="mt-6">
                        <img src={bulkImagePreview} className="w-40 h-40 object-cover rounded-2xl shadow-2xl mx-auto border-4 border-emerald-200" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-bold text-slate-800 block mb-4">CSV Data</label>
                  <div className="space-y-3">
                    <div>
                      <input type="file" accept=".csv,text/csv" onChange={handleBulkCsvChange} className="hidden" id="bulk-csv" />
                      <label htmlFor="bulk-csv" className="btn-secondary w-full flex items-center justify-center py-3 px-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                        📁 Upload CSV File
                      </label>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-2 font-mono">Or paste CSV data:</p>
                      <textarea
                        className="csv-textarea"
                        placeholder="title,brand,item_name,gender,pattern,fabric,fit,coNike T-Shirt,Nike,Nike Classic Tee,Male,Plain,Cotton,Regular,Blue"
                        value={bulkCsv}
                        onChange={(e) => setBulkCsv(e.target.value)}
                      />
                      <p className="text-xs text-slate-500 mt-2 font-mono">
                        Format: title,brand,item_name,gender,pattern,fabric,fit,color
                      </p>
                    </div>
                  </div>
                  <button onClick={parseBulkCsv} className="btn-primary w-full">
                    🔍 Parse & Preview CSV
                  </button>
                </div>
              </div>

              {parsedCsv && bulkRows.length > 0 && (
                <>
                  <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200 rounded-3xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">{bulkRows.length} Items Ready</h3>
                        <p className="text-slate-600">Click submit to upload all items</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                          <tr>
                            <th className="table-header">Title</th>
                            <th className="table-header">Item Name</th>
                            <th className="table-header">Brand</th>
                            <th className="table-header">Gender</th>
                            <th className="table-header">Color</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkRows.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="table-cell font-medium">{row.title}</td>
                              <td className="table-cell">{row.item_name}</td>
                              <td className="table-cell">{row.brand}</td>
                              <td className="table-cell">
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                  {row.gender}
                                </span>
                              </td>
                              <td className="table-cell font-semibold text-indigo-600">{row.color}</td>
                            </tr>
                          ))}
                          {bulkRows.length > 5 && (
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                              <td colSpan={5} className="table-cell text-center py-8 text-slate-500 font-medium">
                                ... and {bulkRows.length - 5} more items
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button onClick={handleBulkSubmit} disabled={submitting} className="btn-primary w-full text-xl py-8">
                    {submitting ? (
                      <span className="flex items-center gap-3 justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Uploading {bulkRows.length} Items...
                      </span>
                    ) : (
                      `🚀 Add ${bulkRows.length} Items Now`
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-field {
          @apply w-full px-4 py-4 border border-slate-200 rounded-2xl bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 text-base font-medium;
        }
        .input-field:focus {
          transform: translateY(-1px);
        }
        .csv-textarea {
          @apply input-field w-full h-40 resize-vertical font-mono text-sm;
        }
        .variant-card {
          @apply bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500;
        }
        .size-grid {
          @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4;
        }
        .size-card {
          @apply bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-200/50 rounded-2xl p-4 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300;
        }
        .size-label {
          @apply text-center font-bold text-slate-700 text-lg mb-3 tracking-wide uppercase;
        }
        .size-input {
          @apply input-field !p-3 !text-sm;
        }
        .btn-primary {
          @apply bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:from-indigo-600 hover:via-purple-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 border-0 text-lg flex items-center justify-center min-h-[56px];
        }
        .btn-primary:hover {
          box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        }
        .btn-primary:disabled {
          @apply bg-slate-400 from-slate-400 via-slate-400 to-slate-400 hover:from-slate-400 hover:via-slate-400 hover:to-slate-400 shadow-none transform-none cursor-not-allowed;
        }
        .btn-secondary {
          @apply bg-white/80 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:bg-slate-50 backdrop-blur-sm hover:-translate-y-1 transform transition-all duration-300 text-lg flex items-center justify-center min-h-[56px];
        }
        .table-header {
          @apply px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200;
        }
        .table-cell {
          @apply px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-b border-slate-100;
        }
      `}</style>
    </div>
  );
}
