"use client";

import { useEffect, useState } from "react";

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
    <div className="p-6 max-w-7xl mx-auto bg-background">
      <h1 className="text-2xl font-semibold mb-6">Add Item</h1>

      {/* TABS */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("single")}
          className={`pb-2 px-1 border-b-2 font-medium ${activeTab === "single" ? "border-blue-500 text-blue-600" : "border-transparent"}`}
        >
          Single Upload
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`ml-8 pb-2 px-1 border-b-2 font-medium ${activeTab === "bulk" ? "border-blue-500 text-blue-600" : "border-transparent"}`}
        >
          Bulk Upload (CSV)
        </button>
      </div>

      {activeTab === "single" && (
        <>
          {/* SINGLE BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="input"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <input
              className="input"
              placeholder="Item Name"
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            />
          </div>

          {/* SINGLE ATTRIBUTES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              className="input"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Children</option>
            </select>

            <select
              className="input"
              value={form.pattern}
              onChange={(e) => setForm({ ...form, pattern: e.target.value })}
            >
              <option value="">Pattern</option>
              {patterns.map((p) => (
                <option key={p._id} value={p.name}>{p.name}</option>
              ))}
            </select>

            <select
              className="input"
              value={form.fabric}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
            >
              <option value="">Fabric</option>
              {fabrics.map((f) => (
                <option key={f._id} value={f.name}>{f.name}</option>
              ))}
            </select>

            <select
              style={{ border: '2px black solid' }}
              className="input"
              value={form.fit}
              onChange={(e) => setForm({ ...form, fit: e.target.value })}
            >
              <option value="">Fit</option>
              {fits.map((f) => (
                <option key={f._id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* SINGLE MEDIA */}
          <div className="flex gap-6 mb-6">
            <div>
              <p>Item Image</p>
              <input type="file" accept="image/*" onChange={handleItemImageChange} />
              {itemImagePreview && <img src={itemImagePreview} className="w-24 mt-2" />}
            </div>
            <div>
              <p>Item Video</p>
              <input type="file" accept="image/*" onChange={handleItemVideoChange} />
              {itemVideoPreview && <img src={itemVideoPreview} className="w-24 mt-2" />}
            </div>
          </div>

          {/* SINGLE VARIANTS */}
          {singleVariants.map((variant, vIndex) => (
            <div key={vIndex} className="border rounded-xl p-5 mb-6 space-y-4">
              <input
                className="input"
                placeholder="Color"
                value={variant.color}
                onChange={(e) => {
                  const updated = [...singleVariants];
                  updated[vIndex].color = e.target.value;
                  setSingleVariants(updated);
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  className="input"
                  placeholder="Same Price for All Sizes"
                  type="number"
                  value={variant.samePrice}
                  onChange={(e) => applySamePrice(vIndex, e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Same Quantity for All Sizes"
                  type="number"
                  value={variant.sameQuantity}
                  onChange={(e) => applySameQuantity(vIndex, e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {variant.sizes.map((s, i) => (
                  <div key={s.size}>
                    <p>{s.size}</p>
                    <input
                      className="input"
                      placeholder="Qty"
                      type="number"
                      value={s.quantity}
                      onChange={(e) => handleSizeChange(vIndex, i, "quantity", e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Price"
                      type="number"
                      value={s.price}
                      onChange={(e) => handleSizeChange(vIndex, i, "price", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={addNewColorVariant} className="btn mb-4">
            Add Same Item With Different Color
          </button>

          <button onClick={handleSingleSubmit} disabled={submitting} className="btn-primary">
            {submitting ? "Uploading..." : "Add Item"}
          </button>
        </>
      )}

      {activeTab === "bulk" && (
        <>
          {/* BULK UPLOAD */}
          <div className="space-y-4 mb-6">
            <div>
              <p>Bulk Image (used for all items)</p>
              <input type="file" accept="image/*" onChange={handleBulkImageChange} />
              {bulkImagePreview && <img src={bulkImagePreview} className="w-24 mt-2" />}
            </div>

            <div>
              <p>CSV File or Paste CSV</p>
              <input type="file" accept=".csv,text/csv" onChange={handleBulkCsvChange} />
              <textarea
                className="input w-full h-32 mt-2"
                placeholder="Paste CSV here (name,gender,pattern,fabric,fit,brand,title,color)"
                value={bulkCsv}
                onChange={(e) => setBulkCsv(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                CSV Format: name,gender,pattern,fabric,fit,brand,title,color
              </p>
            </div>

            <button onClick={parseBulkCsv} className="btn">
              Parse CSV
            </button>
          </div>

          {parsedCsv && bulkRows.length > 0 && (
            <>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Preview ({bulkRows.length} items):</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Item Name</th>
                        <th className="border p-2">Brand</th>
                        <th className="border p-2">Gender</th>
                        <th className="border p-2">Color</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="border p-2">{row.title}</td>
                          <td className="border p-2">{row.item_name}</td>
                          <td className="border p-2">{row.brand}</td>
                          <td className="border p-2">{row.gender}</td>
                          <td className="border p-2">{row.color}</td>
                        </tr>
                      ))}
                      {bulkRows.length > 5 && (
                        <tr>
                          <td colSpan={5} className="border p-2 text-center">
                            ... and {bulkRows.length - 5} more
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <button onClick={handleBulkSubmit} disabled={submitting} className="btn-primary">
                {submitting ? "Uploading..." : `Add ${bulkRows.length} Items`}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
