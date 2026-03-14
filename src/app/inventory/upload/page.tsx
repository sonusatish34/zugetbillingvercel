"use client";

import { useEffect, useState } from "react";
import { FileUp, ChevronRight } from "lucide-react";

/* ================== CONFIG ================== */
const API_BASE = "http://dev.zuget.com";
const API_URL = "http://dev.zuget.com/admin/add-items";

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

type UploadItem = {
  _id: number;
  filename: string;
  status: string;
  xlsx_link: string;
  created_on: string;
};
function formatDateTime(dateString: string) {
  const date = new Date(dateString.replace(" ", "T"));

  const day = date.getDate();
  const year = date.getFullYear();
  const seconds = date.getSeconds();

  const month = date.toLocaleString("en-US", { month: "short" });

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12;

  const formattedMinutes = minutes.toString().padStart(2, "0");

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinal(day)} ${month} ${year} ${formattedHours}:${formattedMinutes} ${ampm} ${seconds} seconds`;
}

// ================= Upload Card Component =================
function UploadCard({ item }: { item: UploadItem }) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm 
      flex justify-between items-center hover:shadow-md transition"
    >
      <div>
        <p className="font-medium text-gray-800">
          {item.filename}
        </p>
        <p className="text-sm text-gray-500">
          {formatDateTime(item.created_on)}
        </p>
        <p
          className={`text-xs mt-1 ${item.status === "processed"
            ? "text-green-600"
            : "text-yellow-600"
            }`}
        >
          {item.status}
        </p>
      </div>

      <a
        href={item.xlsx_link}
        target="_blank"
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <ChevronRight />
      </a>
    </div>
  );
}

/* ================== COMPONENT ================== */
export default function AddItemPage() {
  /* ---------- AUTH ---------- */
  const [authtoken, setAuthtoken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);


  // ✅ Fetch Uploaded Files



  const fetchUploads = async () => {
    try {
      const res = await fetch(
        "http://dev.zuget.com/admin/uploaded-csv",
        {
          headers: {
            Authorization: authtoken,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setUploads(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // ✅ Upload ZIP/CSV
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch(
        "http://dev.zuget.com/admin/csv-items",
        {
          method: "POST",
          headers: {
            Accept: "application/json",

            Authorization: authtoken,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        alert(data.message);
        fetchUploads();
        setFile(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const latestUpload = uploads[0];
  const previousUploads = uploads.slice(1);
  /* ---------- DROPDOWNS ---------- */
  const [patterns, setPatterns] = useState<Option[]>([]);
  const [fabrics, setFabrics] = useState<Option[]>([]);
  const [fits, setFits] = useState<Option[]>([]);

  /* ---------- TABS ---------- */
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("bulk");

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
        Authorization: authtoken,
      },
    });
    const json = await res.json();
    setter(json?.data?.results || []);
  };

  /* ---------- IMAGE UPLOAD ---------- */
  const uploadToS3 = async (file: File): Promise<string> => {
    const formdata = new FormData();
    formdata.append("file", file);

    const res = await fetch("http://dev.zuget.com/s3/image-file", {
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
      alert("Invalid CSV format");
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50">
      <div className="p-">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add Item
            </h1>
            <p className="text-slate-500 mt-2">Upload single items or bulk via CSV</p>
          </div>
        </div>

        {/* Main Container */}
        <div className="">

          {/* TABS */}
          <div className="flex border-b border-slate-200 mb-10 pb-4">

            <button
              onClick={() => setActiveTab("bulk")}
              className={`px-8 py-3 rounded-t-xl font-semibold ml-2 transition-all duration-300 flex items-center gap-2 ${activeTab === "bulk"
                ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 -mb-px z-10"
                : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                }`}
            >
              <div className={`w-3 h-3 rounded-full ${activeTab === "bulk" ? "bg-white/30" : "bg-emerald-400/50"
                }`}></div>
              Bulk Upload (CSV)
            </button>
            <button
              onClick={() => setActiveTab("single")}
              className={`px-8 py-3 rounded-t-xl font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === "single"
                ? "bg-linear-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25 -mb-px z-10"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
            >
              <div className={`w-3 h-3 rounded-full ${activeTab === "single" ? "bg-white/30" : "bg-indigo-400/50"
                }`}></div>
              Single Upload
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
                      <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center">
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
                      <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
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
                    <h3 className="text-xl font-bold bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-linear-to-r from-slate-50/50 to-indigo-50/30 rounded-2xl">
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
            <div className="min-h-screen bg-gray-50 px-2">
              <div className="space-y-8">
                {/* ================= Upload Box ================= */}
                <div>
                  <h2 className="font-semibold text-lg mb-3">Bulk Upload Steps </h2>
                  <ol className="space-y-4 list-decimal list-inside text-gray-700 leading-relaxed">
                    <li>
                      Download the sample file from the ZIP to CSV Converter.
                    </li>
                    <li>
                      Open the file in Google Sheets.
                    </li>
                    <li>
                      Fill in all the empty fields with the required details.
                    </li>
                    <li>
                      Enter the product name. Do not use special characters such as :
                    </li>
                    <li>
                      Select the remaining details from the dropdown options. If the
                      required option is not available, you may enter it manually.
                    </li>
                    <li>
                      After completing all the details, download the file in CSV format.
                    </li>
                    <li>
                      Upload the CSV file below.
                    </li>
                  </ol>
                </div>
                <div
                  className="border-2 border-dashed border-purple-400 
                      rounded-2xl p-12 flex flex-col items-center 
                      justify-center bg-white cursor-pointer hover:bg-purple-50 transition"
                >
                  <label className="mt-4 font-semibold text-lg cursor-pointer w-full">

                    <p className="flex gap-x-2 justify-center"><FileUp size={28} />Upload CSV File
                    </p>
                    <input
                      type="file"
                      accept=".zip,.csv"
                      className="hidden w-full"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>

                  {file && (
                    <p className="mt-3 text-sm text-gray-500">
                      Selected: {file.name}
                    </p>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    {loading ? "Uploading..." : "Upload"}
                  </button>
                </div>

                {/* ================= Recent Upload ================= */}
                {latestUpload && (
                  <div>
                    <h2 className="font-semibold text-lg mb-3">
                      Recent Upload
                    </h2>

                    <UploadCard item={latestUpload} />
                  </div>
                )}

                {/* ================= Previous Uploads ================= */}
                {previousUploads.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-lg mb-3">
                      Previous Uploaded
                    </h2>

                    <div className="space-y-3">
                      {previousUploads.map((item) => (
                        <UploadCard key={item._id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
