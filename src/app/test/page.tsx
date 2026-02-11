"use client";

import { useEffect, useState } from "react";

/* ================== CONFIG ================== */
const API_BASE = "https://dev.zuget.com";
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

  /* ---------- FORM ---------- */
  const [form, setForm] = useState({
    title: "",
    brand: "",
    item_name: "",
    gender: "Male",
    pattern: "",
    fabric: "",
    fit: "",
  });

  /* ---------- VARIANTS ---------- */
  const [variants, setVariants] = useState<Variant[]>([
    {
      color: "",
      sizes: createEmptySizes(),
      samePrice: "",
      sameQuantity: "",
    },
  ]);

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

    const res = await fetch("https://api.zuget.com/s3/image-file", {
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

  /* ---------- FILE HANDLERS ---------- */
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

  /* ---------- SIZE HELPERS ---------- */
  const handleSizeChange = (
    vIndex: number,
    sIndex: number,
    field: "price" | "quantity",
    value: string
  ) => {
    const updated = [...variants];
    updated[vIndex].sizes[sIndex][field] = value;
    setVariants(updated);
  };

  const applySamePrice = (vIndex: number, value: string) => {
    const updated = [...variants];
    updated[vIndex].samePrice = value;
    updated[vIndex].sizes = updated[vIndex].sizes.map((s) => ({
      ...s,
      price: value,
    }));
    setVariants(updated);
  };

  const applySameQuantity = (vIndex: number, value: string) => {
    const updated = [...variants];
    updated[vIndex].sameQuantity = value;
    updated[vIndex].sizes = updated[vIndex].sizes.map((s) => ({
      ...s,
      quantity: value,
    }));
    setVariants(updated);
  };

  /* ---------- ADD COLOR VARIANT ---------- */
  const addNewColorVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        color: "",
        sizes: createEmptySizes(),
        samePrice: "",
        sameQuantity: "",
      },
    ]);

    // clear only images
    setItemImageFile(null);
    setItemVideoFile(null);
    setItemImagePreview(null);
    setItemVideoPreview(null);
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!itemImageFile || !itemVideoFile) {
      alert("Please upload item image and video image");
      return;
    }

    setSubmitting(true);

    try {
      const [itemImageUrl, itemVideoUrl] = await Promise.all([
        uploadToS3(itemImageFile),
        uploadToS3(itemVideoFile),
      ]);

      for (const variant of variants) {
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

  /* ================== UI ================== */
  return (
    <div className="p-6 max-w-7xl mx-auto bg-background">
      <h1 className="text-2xl font-semibold mb-6">Add Item</h1>

      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input className="input" placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" placeholder="Brand" onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <input className="input" placeholder="Item Name" onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
      </div>

      {/* ATTRIBUTES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select className="input" onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option>Male</option>
          <option>Female</option>
          <option>Children</option>
        </select>

        <select className="input" onChange={(e) => setForm({ ...form, pattern: e.target.value })}>
          <option value="">Pattern</option>
          {patterns.map((p) => <option key={p._id}>{p.name}</option>)}
        </select>

        <select className="input" onChange={(e) => setForm({ ...form, fabric: e.target.value })}>
          <option value="">Fabric</option>
          {fabrics.map((f) => <option key={f._id}>{f.name}</option>)}
        </select>

        <select className="input" onChange={(e) => setForm({ ...form, fit: e.target.value })}>
          <option value="">Fit</option>
          {fits.map((f) => <option key={f._id}>{f.name}</option>)}
        </select>
      </div>

      {/* MEDIA */}
      <div className="flex gap-6 mb-6">
        <div>
          <p>Item Image</p>
          <input type="file" accept="image/*" onChange={handleItemImageChange} />
          {itemImagePreview && <img src={itemImagePreview} className="w-24 mt-2" />}
        </div>

        <div>
          <p>Item Video Image</p>
          <input type="file" accept="image/*" onChange={handleItemVideoChange} />
          {itemVideoPreview && <img src={itemVideoPreview} className="w-24 mt-2" />}
        </div>
      </div>

      {/* VARIANTS */}
      {variants.map((variant, vIndex) => (
        <div key={vIndex} className="border rounded-xl p-5 mb-6 space-y-4">
          <input
            className="input"
            placeholder="Color"
            value={variant.color}
            onChange={(e) => {
              const updated = [...variants];
              updated[vIndex].color = e.target.value;
              setVariants(updated);
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
                <input className="input" placeholder="Qty" type="number" value={s.quantity}
                  onChange={(e) => handleSizeChange(vIndex, i, "quantity", e.target.value)} />
                <input className="input" placeholder="Price" type="number" value={s.price}
                  onChange={(e) => handleSizeChange(vIndex, i, "price", e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={addNewColorVariant} className="btn mb-4">
        Add Same Item With Different Color
      </button>

      <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
        {submitting ? "Uploading..." : "Add Item"}
      </button>
    </div>
  );
}
