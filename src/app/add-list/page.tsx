"use client";

import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import React from "react";

const API_BASE = "https://api.zuget.com";
const LOCAL_API_BASE = "http://localhost:5000";

/* ---------------- TYPES ---------------- */

interface ListItem {
  _id: number;
  app_user_id: number;
  store_id: number;
  list_name: string;
  created_on: string;
  updated_on: string | null;
}

interface SizeData {
  size: string;
  price: number;
  quantity: number;
}

interface ItemDetails {
  _id: number;
  brand: string;
  item_name: string;
  category: string;
  gender: string;
  color: string;
  pattern: string;
  fit: string;
  barcode: number;
  size_data: SizeData[];
}

interface ListItemsResponse {
  status: string;
  message: string;
  data: {
    item_details: ItemDetails[];
  }[];
}

interface ListDetailsResponse {
  status: string;
  message: string;
  results: ListItem[];
}

type SizeInfo = {
  price: number;
  quantity: number;
};

type Sizes = {
  xs: SizeInfo;
  s: SizeInfo;
  m: SizeInfo;
  l: SizeInfo;
  xl: SizeInfo;
  xxl: SizeInfo;
  xxxl: SizeInfo;
  xxxxl: SizeInfo;
};

type ProductRow = {
  id: string;
  item: string;
  brand: string;
  category: string;
  gender: string;
  color: string;
  fit: string;
  description: string;
  frontImage?: File | null;
  backImage?: File | null;
  barcode: string;
  sizes: Sizes;
  pattern: string;
  neck_type: string;
  sleeve_type: string;
  isSaved?: boolean;
};

/* -------------- COMMON LOCAL-LIST HOOK -------------- */

type LocalListType =
  | "items"
  | "colors"
  | "categories"
  | "sleevetypes"
  | "necktypes";

function useLocalList(type: LocalListType) {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await fetch(`${LOCAL_API_BASE}/${type}`);
        if (!res.ok) throw new Error("Failed to fetch " + type);
        const data = await res.json();
        setList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching", type, err);
      }
    };
    fetchList();
  }, [type]);

  const addValue = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const singular =
      type === "sleevetypes"
        ? "sleeve"
        : type === "necktypes"
        ? "neck"
        : type.replace(/s$/, ""); // items->item, colors->color, categories->category

    try {
      const res = await fetch(`${LOCAL_API_BASE}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [singular]: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to add " + type);
      const updated = await res.json();
      setList(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error("Error adding to", type, err);
    }
  };

  return { list, addValue };
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function ProductTable() {
  const [prevAddedItems, setPrevAddedItems] = useState<Boolean>(false);
  const [previews, setPreviews] = useState<{
    [key: string]: { front?: string; back?: string };
  }>({});
  const [barcodes, setBarcodes] = useState<string[]>([]);

  const [savedLists, setSavedLists] = useState<ListItem[]>([]);
  const [listItems, setListItems] = useState<ItemDetails[]>([]);
  const [openListId, setOpenListId] = useState<number | null>(null);

  const authtoken = typeof window !== "undefined" ? localStorage.getItem((localStorage.getItem("user_phone") || "") + "_token") || "" : "";

  /* -------- Fetch Lists (accordion right side) -------- */

  const fetchLists = async () => {
    const res = await fetch(
      `${API_BASE}/admin/list-details?app_user_id=${localStorage.getItem(
        "app_user_id"
      )}&store_id=${localStorage.getItem("store_id")}`,
      {
        headers: {
          accept: "application/json",
          Authorization: authtoken,
        },
      }
    );

    const data = await res.json();
    setSavedLists(data.results || []);
  };

  const fetchListItems = async (listId: number) => {
    if (openListId === listId) {
      setOpenListId(null);
      return;
    }

    const res = await fetch(
      `${API_BASE}/admin/list-items?list_id=${listId}`,
      {
        headers: {
          accept: "application/json",
          Authorization: authtoken,
        },
      }
    );

    const data: ListItemsResponse = await res.json();
    const flattenedItems = data.data.flatMap((entry) => entry.item_details);
    setListItems(flattenedItems);
    setOpenListId(listId);
  };

  const API_URL_1 = `${API_BASE}/admin/list-details?app_user_id=${localStorage.getItem(
    "app_user_id"
  )}&store_id=${localStorage.getItem("store_id")}`;

  const fetchListDetails = async (): Promise<ListItem[]> => {
    try {
      const response = await fetch(API_URL_1, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: authtoken,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch list details");
      }

      const data: ListDetailsResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const [lists, setLists] = useState<ListItem[]>([]);

  useEffect(() => {
    fetchLists();
    const loadLists = async () => {
      const data = await fetchListDetails();
      setLists(data);
    };
    loadLists();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log("Saved Barcodes:", barcodes);
  }, [barcodes]);

  /* -------- Image previews -------- */

  const handleImageChange = (
    index: number,
    field: "frontImage" | "backImage",
    file: File | undefined
  ) => {
    if (!file) return;

    updateField(index, field, file);

    const url = URL.createObjectURL(file);

    setPreviews((prev) => ({
      ...prev,
      [rows[index].id]: {
        ...prev[rows[index].id],
        [field === "frontImage" ? "front" : "back"]: url,
      },
    }));
  };

  /* -------- Duplicate row -------- */

  const duplicateRow = useCallback((row: ProductRow, index: number) => {
    const parentBarcode = row.barcode ? row.barcode.split("-")[0] : "";

    const newRow: ProductRow = {
      id: uuidv4(),
      item: row.item,
      brand: row.brand,
      category: row.category,
      gender: row.gender,
      color: "",
      isSaved: false,
      fit: row.fit,
      description: row.description,
      pattern: row.pattern,
      neck_type: row.neck_type,
      sleeve_type: row.sleeve_type,
      barcode: parentBarcode,
      frontImage: null,
      backImage: null,
      sizes: {
        xs: { ...row.sizes.xs },
        s: { ...row.sizes.s },
        m: { ...row.sizes.m },
        l: { ...row.sizes.l },
        xl: { ...row.sizes.xl },
        xxl: { ...row.sizes.xxl },
        xxxl: { ...row.sizes.xxxl },
        xxxxl: { ...row.sizes.xxxxl },
      },
    };

    setRows((prev) => {
      const newRows = [...prev];
      newRows.splice(index + 1, 0, newRow);
      return newRows;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* -------- Print labels -------- */

  const printLabels = (row: ProductRow) => {
    if (!row.barcode) {
      alert("Please save product first to generate barcode");
      return;
    }

    const win = window.open("", "_blank");

    let html = `
<html>
<head>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<style>
@page {
  size: 101.6mm 50.8mm;
  margin: 0;
}
body{
  margin:0;
  padding:0;
  width:101.6mm;
  height:50.8mm;
  overflow:hidden;
  font-family: Arial, sans-serif;
}
.label-container{
  width:101.6mm;
  height:50.8mm;
  display:flex;
  align-items:center;
  justify-content:center;
  page-break-after:always;
  overflow:hidden;
}
.portrait-wrapper{
  transform:rotate(-90deg);
  transform-origin:center;
  scale:1;
  width:48mm;
  height:98mm;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  align-items:flex-start;
  padding:1mm;
  box-sizing:border-box;
  text-transform:uppercase;
}
.barcode-section{
  width:100%;
  padding-top:10px;
}
svg{
  width:28mm;
  height:35px;
}
.barcode-number{
  font-size:10px;
  padding-top:6px;
  font-weight:600;
  padding-left:22px
}
.brand{
  font-size:18px;
  font-weight:900;
  line-height:1;
  padding-top:24px;
  padding-bottom:12px;
}
.specs{
  font-size:10px;
  line-height:0.6;
  font-weight:600;
}
.specs p{
  padding-bottom:12px;
}
.footer{
  width:100%;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  border-top:1px dashed #000;
  padding-top:4px;
}
.mrp-label{
  font-size:8px;
  line-height:1;
  font-weight:600;
}
.price{
  font-size:20px;
  font-weight:bold;
}
.store_name{
  background:#000;
  color:#fff;
  padding:4px 8px;
  font-size:16px;
  border-radius:4px;
  text-transform:uppercase;
  display:inline-block;
  margin-bottom:6px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
</style>
</head>
<body>
`;

    Object.entries(row.sizes).forEach(([size, data]: any) => {
      if (data.quantity > 0) {
        for (let i = 0; i < data.quantity; i++) {
          const id = `barcode_${Date.now()}_${i}`;

          html += `
<div class="label-container">
  <div class="portrait-wrapper">
    <div>
      <p class="store_name">${localStorage.getItem("store_name")}</p>
      <div class="barcode-section">
        <svg id="${id}"></svg>
        <div class="barcode-number">${row.barcode}</div>
      </div>
      <div class="brand">${row.brand}</div>
      <div class="specs">
        <p>SIZE: ${size.toUpperCase()}</p>
        <p>ITEM: ${row.item}</p>
        <p>GENDER: ${row.gender || "MENS"}</p> 
        <p>FIT: ${row.fit || "REGULAR"}</p>
        <p>Color: ${row.color || "REGULAR"}</p>
      </div>
    </div>
    <div class="footer">
      <div class="mrp-label">
        MAX RETAIL PRICE<br/>
        (Incl. of all taxes)
      </div>
      <div class="price">
        ₹${data.price}
      </div>
    </div>
  </div>
</div>
<script>
JsBarcode("#${id}", "${row.barcode}", {
  format: "CODE128",
  width: 2,
  height: 45,
  displayValue: false,
  margin: 0
});
</script>
`;
        }
      }
    });

    html += `
<script>
window.onload = () => {
  setTimeout(() => {
    window.print();
    window.close();
  }, 500);
};
</script>
</body>
</html>
`;

    win!.document.write(html);
    win!.document.close();
  };

  /* -------- Rows, size config, helpers -------- */

  const defaultSize = { price: 0, quantity: 0 };

  const createEmptyRow = (): ProductRow => ({
    id: uuidv4(),
    item: "",
    brand: "",
    category: "",
    gender: "",
    color: "",
    fit: "",
    description: "",
    frontImage: null,
    backImage: null,
    barcode: "",
    pattern: "",
    neck_type: "",
    sleeve_type: "",
    sizes: {
      xs: { ...defaultSize },
      s: { ...defaultSize },
      m: { ...defaultSize },
      l: { ...defaultSize },
      xl: { ...defaultSize },
      xxl: { ...defaultSize },
      xxxl: { ...defaultSize },
      xxxxl: { ...defaultSize },
    },
    isSaved: false,
  });

  const [patterns, setPatterns] = useState<any[]>([]);
  const [fits, setFits] = useState<any[]>([]);
  const [rows, setRows] = useState<ProductRow[]>([createEmptyRow()]);

  // local JSON lists via common hook
  const { list: items, addValue: addItem } = useLocalList("items");
  const { list: colorsList, addValue: addColor } = useLocalList("colors");
  const { list: categoriesList, addValue: addCategory } =
    useLocalList("categories");
  const { list: sleevesList, addValue: addSleeve } =
    useLocalList("sleevetypes");
  const { list: necksList, addValue: addNeck } = useLocalList("necktypes");

  // Zuget brands
  const [brandsList, setBrandsList] = useState<string[]>([]);

  const genders = ["Mens", "Womens", "Girls","Boys", "Unisex"];

  useEffect(() => {
    // fits & patterns from Zuget
    fetchData("/util/fit-categories", setFits);
    fetchData("/util/patterns", setPatterns);

    // brands from Zuget
    const fetchBrands = async () => {
      const storeId = localStorage.getItem("store_id");

      const res = await fetch(
        `${API_BASE}/util/store-brands?store_id=${storeId}`,
        {
          headers: {
            accept: "application/json",
            Authorization: authtoken,
          },
        }
      );

      const json = await res.json();

      if (json.status === "success") {
        const brandNames = json.data.map((b: any) => b.name);
        setBrandsList(brandNames);
      }
    };

    fetchBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addPattern = async (value: string) => {
    const patternName = value.trim();
    if (!patternName) return;

    try {
      const res = await fetch(
        `${API_BASE}/util/add-pattern?pattern=${encodeURIComponent(
          patternName
        )}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: authtoken,
          },
        }
      );

      const result = await res.json();
      if (result.status === "success" || res.ok) {
        fetchData("/util/patterns", setPatterns);
        alert("Pattern added successfully");
      }
    } catch (error) {
      console.error("Error adding pattern:", error);
    }
  };

  const addBrand = async (value: string) => {
    const brand = value.trim();
    if (!brand) return;

    const storeId = localStorage.getItem("store_id");

    const res = await fetch(
      `${API_BASE}/util/add-brand?brand=${encodeURIComponent(
        brand
      )}&store_id=${storeId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: authtoken,
        },
      }
    );

    const result = await res.json();

    if (result.status === "success") {
      const refresh = await fetch(
        `${API_BASE}/util/store-brands?store_id=${storeId}`,
        {
          headers: {
            accept: "application/json",
            Authorization: authtoken,
          },
        }
      );

      const json = await refresh.json();
      const brandNames = json.data.map((b: any) => b.name);
      setBrandsList(brandNames);

      alert("Brand added successfully");
    }
  };

  const addFit = async (value: string) => {
    const fitName = value.trim();
    if (!fitName) return;

    try {
      const res = await fetch(
        `${API_BASE}/util/add-fit?fit=${encodeURIComponent(fitName)}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: authtoken,
          },
        }
      );

      const result = await res.json();

      if (result.status === "success" || res.ok) {
        fetchData("/util/fit-categories", setFits);
        alert("Fit added successfully");
      }
    } catch (error) {
      console.error("Error adding fit:", error);
    }
  };

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

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const updateField = (index: number, field: string, value: any) => {
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    setRows(updated);
  };

  const updatePrice = (index: number, size: keyof Sizes, value: number) => {
    const updated = [...rows];
    const safe = Number.isFinite(value) && value > 0 ? value : 0;
    updated[index].sizes[size].price = safe;
    setRows(updated);
  };

  const updateQty = (index: number, size: keyof Sizes, value: number) => {
    const updated = [...rows];
    const safe = Number.isFinite(value) && value > 0 ? value : 0;
    updated[index].sizes[size].quantity = safe;
    setRows(updated);
  };

  const uploadToS3 = async (file: File): Promise<string> => {
    const formdata = new FormData();
    formdata.append("file", file);

    const res = await fetch(`${API_BASE}/s3/image-file`, {
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

  const saveRow = async (index: number) => {
    const row = rows[index];

    let imageUrl = "";
    let videoUrl = "";

    if (row.frontImage) imageUrl = await uploadToS3(row.frontImage);
    if (row.backImage) videoUrl = await uploadToS3(row.backImage);

    const size_data = Object.entries(row.sizes)
      .filter(([_, v]) => v.quantity > 0)
      .map(([key, v]) => {
        const finalSizeLabel = getDisplaySize(row, key);
        return {
          size: finalSizeLabel,
          price: v.price,
          quantity: v.quantity,
        };
      });

    const body = {
      app_user_id: Number(localStorage.getItem("app_user_id")),
      store_id: Number(localStorage.getItem("store_id")),
      barcode: row.barcode,
      brand: row.brand,
      item_name: row.item,
      category: row.category,
      gender: row.gender,
      item_image: imageUrl,
      item_video: videoUrl,
      fit: row.fit,
      color: row.color,
      pattern: row.pattern,
      neck_type: row.neck_type,
      sleeve_type: row.sleeve_type,
      size_data,
      product_description: row.description,
    };

    const res = await fetch(`${API_BASE}/admin/add-product`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authtoken,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (result.status === "success") {
      const updated = [...rows];
      updated[index].barcode = result.data;
      updated[index].isSaved = true;
      setRows(updated);

      const itemId = result.data.split("-")[1];
      setBarcodes((prev) => [...prev, itemId]);

      alert("Saved Successfully");
      addRow();
    }
  };

  const sizes = ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl"];

  const SIZE_CONFIG = {
    KIDS: [
      "0-3 Months",
      "3-6 Months",
      "6-12 Months",
      "1-2 Year",
      "2-3 Year",
      "3-4 Year",
      "4-5 Year",
      "5-6 Year",
    ],
    JEANS: ["28", "30", "32", "34", "36", "38", "40", "42"],
    SHIRTS: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  };

  const getDisplaySize = (row: ProductRow, sizeKey: string) => {
    const index = [
      "xs",
      "s",
      "m",
      "l",
      "xl",
      "xxl",
      "xxxl",
      "xxxxl",
    ].indexOf(sizeKey);
    const gender = row.gender?.toLowerCase();
    const item = row.item?.toLowerCase() || "";

    const numericSizeItems = [
      "jeans",
      "shorts",
      "trousers",
      "cargo pants",
      "joggers",
      "chinos",
      "tracksuit",
      "pyjamas",
      "sportswear",
      "swimwear",
      "pant",
    ];

    let labels = SIZE_CONFIG.SHIRTS;

    if (gender === "Boys" || gender === "Girls") {
      labels = SIZE_CONFIG.KIDS;
    } else if (numericSizeItems.some((keyword) => item.includes(keyword))) {
      labels = SIZE_CONFIG.JEANS;
    }

    return labels[index] || sizeKey.toUpperCase();
  };

  const saveItems = async () => {
    if (barcodes.length === 0) {
      alert("No items to save");
      return;
    }

    const body = {
      app_user_id: Number(localStorage.getItem("app_user_id")),
      store_id: Number(localStorage.getItem("store_id")),
      item_ids: barcodes,
    };

    try {
      const res = await fetch(`${API_BASE}/admin/save-list`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authtoken,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (result.status === "success") {
        alert("Items saved successfully");
      } else {
        alert("Failed to save items");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="p-6">
      <div className="flex gap-x-10 pb-4">
        <button
          onClick={() => {
            setPrevAddedItems(false);
          }}
          className={`${
            prevAddedItems === false ? "border-b-2 border-purple-500" : ""
          } `}
        >
          Add New Items
        </button>
        <button
          onClick={() => {
            setPrevAddedItems(true);
          }}
          className={`${
            prevAddedItems === true ? "border-b-2 border-purple-500 capitalize" : "capitalize"
          } `}
        >
          previously added Items test
        </button>
      </div>

      {!prevAddedItems ? (
        <div>
          <div className="overflow-auto border rounded-xl">
            <table className="min-w-full text-center border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="px-2">Brand</th>
                  <th>Category</th>
                  <th>Gender</th>
                  <th>Color</th>
                  <th>Fit</th>
                  <th>sleeve</th>
                  <th>Neck</th>
                  <th>Pattern</th>
                  <th>Front Image</th>
                  <th>Back Image</th>

                  {sizes.map((size) => (
                    <React.Fragment key={size}>
                      <th>{size.toUpperCase()} Price</th>
                      <th>{size.toUpperCase()} Qty</th>
                    </React.Fragment>
                  ))}

                  <th>Description</th>
                  <th>Barcode</th>
                  <th>Save</th>
                  <th>Clone</th>
                  <th>Print</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-t ${
                      row.isSaved ? "bg-green-50" : ""
                    }`}
                  >
                    {/* Item name with datalist + add */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "200px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            placeholder="Search or add..."
                            disabled={!!row.isSaved}
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                            }}
                            list={`items-list-${i}`}
                            value={row.item}
                            onChange={(e) =>
                              updateField(i, "item", e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addItem(e.currentTarget.value);
                                e.currentTarget.value = "";
                                e.preventDefault();
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input =
                                e.currentTarget
                                  .previousSibling as HTMLInputElement;
                              addItem(input.value);
                              input.value = "";
                            }}
                            style={{
                              border: "none",
                              background: "purple",
                              color: "#fff",
                              cursor: "pointer",
                              padding: "2px 6px",
                              fontSize: "18px",
                            }}
                            title="Add new item"
                            className="rounded-md"
                          >
                            +
                          </button>
                        </div>

                        <datalist id={`items-list-${i}`}>
                          {items.map((v) => (
                            <option key={v} value={v} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Brand with Zuget list + add */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "180px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            disabled={!!row.isSaved}
                            list={`brands-list-${i}`}
                            onChange={(e) =>
                              updateField(i, "brand", e.target.value)
                            }
                            value={row.brand}
                            placeholder="Brand..."
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addBrand(e.currentTarget.value);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input =
                                e.currentTarget
                                  .previousSibling as HTMLInputElement;
                              addBrand(input.value);
                            }}
                            style={{
                              border: "none",
                              background: "purple",
                              color: "white",
                              cursor: "pointer",
                              padding: "2px 8px",
                              fontSize: "18px",
                            }}
                            className="rounded-md"
                          >
                            +
                          </button>
                        </div>

                        <datalist id={`brands-list-${i}`}>
                          {brandsList.map((b) => (
                            <option key={b} value={b} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Category from local server */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "180px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            disabled={!!row.isSaved}
                            list={`categories-list-${i}`}
                            placeholder="Category..."
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                            }}
                            onChange={(e) =>
                              updateField(i, "category", e.target.value)
                            }
                            value={row.category}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addCategory(e.currentTarget.value);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input =
                                e.currentTarget
                                  .previousSibling as HTMLInputElement;
                              addCategory(input.value);
                            }}
                            style={{
                              border: "none",
                              background: "purple",
                              color: "white",
                              cursor: "pointer",
                              padding: "2px 8px",
                              fontSize: "18px",
                            }}
                            className="rounded-md"
                          >
                            +
                          </button>
                        </div>

                        <datalist id={`categories-list-${i}`}>
                          {categoriesList.map((cat) => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Gender select */}
                    <td className="px-4">
                      <select
                        value={row.gender || "Select"}
                        onChange={(e) =>
                          updateField(i, "gender", e.target.value)
                        }
                      >
                        <option value="Select">Select</option>
                        {genders.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Color from local server */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "150px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            disabled={!!row.isSaved}
                            list={`colors-list-${i}`}
                            placeholder="Color..."
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                              width: "100%",
                            }}
                            onChange={(e) =>
                              updateField(i, "color", e.target.value)
                            }
                            value={row.color}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addColor(e.currentTarget.value);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input =
                                e.currentTarget
                                  .previousSibling as HTMLInputElement;
                              addColor(input.value);
                            }}
                            style={{
                              border: "none",
                              background: "purple",
                              color: "white",
                              cursor: "pointer",
                              padding: "2px 6px",
                            }}
                            className="rounded-md"
                          >
                            +
                          </button>
                        </div>
                        <datalist id={`colors-list-${i}`}>
                          {colorsList.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Fit from Zuget */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "160px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            disabled={!!row.isSaved}
                            list={`fits-list-${i}`}
                            placeholder="Fit..."
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                              width: "100%",
                            }}
                            onChange={(e) =>
                              updateField(i, "fit", e.target.value)
                            }
                            value={row.fit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addFit(e.currentTarget.value);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input =
                                e.currentTarget
                                  .previousSibling as HTMLInputElement;
                              addFit(input.value);
                            }}
                            style={{
                              border: "none",
                              background: "purple",
                              color: "white",
                              cursor: "pointer",
                              padding: "2px 8px",
                              fontSize: "18px",
                            }}
                            className="rounded-md"
                            title="Add new fit"
                          >
                            +
                          </button>
                        </div>

                        <datalist id={`fits-list-${i}`}>
                          {fits.map((f: any) => (
                            <option
                              key={f.id || f.name}
                              value={f.name}
                            />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Sleeve from local server */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "180px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            disabled={!!row.isSaved}
                            list={`sleeves-list-${i}`}
                            placeholder="Sleeve Type..."
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                            }}
                            onChange={(e) =>
                              updateField(i, "sleeve_type", e.target.value)
                            }
                            value={row.sleeve_type}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              addSleeve(e.currentTarget.value)
                            }
                          />
                          <button
                            onClick={(e) =>
                              addSleeve(
                                (e.currentTarget
                                  .previousSibling as HTMLInputElement).value
                              )
                            }
                            style={{
                              border: "none",
                              background: "purple",
                              color: "white",
                              cursor: "pointer",
                              padding: "2px 8px",
                              fontSize: "18px",
                            }}
                            className="rounded-md"
                          >
                            +
                          </button>
                        </div>
                        <datalist id={`sleeves-list-${i}`}>
                          {sleevesList.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Neck from local server */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "180px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            disabled={!!row.isSaved}
                            list={`necks-list-${i}`}
                            placeholder="Neck Type..."
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                            }}
                            onChange={(e) =>
                              updateField(i, "neck_type", e.target.value)
                            }
                            value={row.neck_type}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              addNeck(e.currentTarget.value)
                            }
                          />
                          <button
                            onClick={(e) =>
                              addNeck(
                                (e.currentTarget
                                  .previousSibling as HTMLInputElement).value
                              )
                            }
                            style={{
                              border: "none",
                              background: "purple",
                              color: "white",
                              cursor: "pointer",
                              padding: "2px 8px",
                              fontSize: "18px",
                            }}
                            className="rounded-md"
                          >
                            +
                          </button>
                        </div>
                        <datalist id={`necks-list-${i}`}>
                          {necksList.map((n) => (
                            <option key={n} value={n} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Pattern from Zuget */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "180px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <input
                            disabled={!!row.isSaved}
                            list={`patterns-list-${i}`}
                            placeholder="Pattern..."
                            style={{
                              border: "none",
                              padding: "5px",
                              flex: 1,
                              outline: "none",
                            }}
                            onChange={(e) =>
                              updateField(i, "pattern", e.target.value)
                            }
                            value={row.pattern}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addPattern(e.currentTarget.value);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input =
                                e.currentTarget
                                  .previousSibling as HTMLInputElement;
                              addPattern(input.value);
                            }}
                            style={{
                              border: "none",
                              background: "purple",
                              color: "white",
                              cursor: "pointer",
                              padding: "2px 8px",
                              fontSize: "18px",
                            }}
                            className="rounded-md"
                          >
                            +
                          </button>
                        </div>

                        <datalist id={`patterns-list-${i}`}>
                          {patterns.map((p: any) => (
                            <option
                              key={p.id || p.name}
                              value={p.name}
                            />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Front image */}
                    <td className="px-4">
                      <div className="flex flex-col items-center gap-1 py-2">
                        {previews[row.id]?.front && (
                          <img
                            src={previews[row.id].front}
                            alt="Front Preview"
                            className="w-12 h-12 object-cover rounded border shadow-sm"
                          />
                        )}
                        <input
                          disabled={!!row.isSaved}
                          type="file"
                          className="text-[10px] w-24"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(
                              i,
                              "frontImage",
                              e.target.files?.[0]
                            )
                          }
                        />
                      </div>
                    </td>

                    {/* Back image */}
                    <td className="px-4">
                      <div className="flex flex-col items-center gap-1 py-2">
                        {previews[row.id]?.back && (
                          <img
                            src={previews[row.id].back}
                            alt="Back Preview"
                            className="w-12 h-12 object-cover rounded border shadow-sm"
                          />
                        )}
                        <input
                          disabled={!!row.isSaved}
                          type="file"
                          className="text-[10px] w-24"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(
                              i,
                              "backImage",
                              e.target.files?.[0]
                            )
                          }
                        />
                      </div>
                    </td>

                    {/* Sizes (price + qty) */}
                    {sizes.map((size) => {
                      const displayLabel = getDisplaySize(row, size);

                      return (
                        <React.Fragment key={size + i}>
                          <td className="px-2 border-l">
                            <div className="text-[10px] font-bold text-purple-600 mb-1">
                              {displayLabel}
                            </div>
                            <input
                              disabled={!!row.isSaved}
                              type="number"
                              placeholder="Price"
                              className="w-20 border p-1 text-xs"
                              value={
                                row.sizes[size as keyof Sizes].price || ""
                              }
                              onChange={(e) =>
                                updatePrice(
                                  i,
                                  size as keyof Sizes,
                                  Number(e.target.value || 0)
                                )
                              }
                            />
                          </td>

                          <td className="px-2 bg-gray-50">
                            <div className="text-[10px] font-bold text-gray-400 mb-1">
                              QTY
                            </div>
                            <input
                              disabled={!!row.isSaved}
                              type="number"
                              placeholder="Qty"
                              className="w-16 border p-1 text-xs"
                              value={
                                row.sizes[size as keyof Sizes].quantity || ""
                              }
                              onChange={(e) =>
                                updateQty(
                                  i,
                                  size as keyof Sizes,
                                  Number(e.target.value || 0)
                                )
                              }
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Description */}
                    <td className="px-4">
                      <textarea
                        className="border w-28"
                        onChange={(e) =>
                          updateField(i, "description", e.target.value)
                        }
                      />
                    </td>

                    {/* Barcode */}
                    <td className="text-xs">{row.barcode}</td>

                    {/* Save */}
                    <td className="px-4">
                      <button
                        disabled={!!row.isSaved}
                        onClick={() => saveRow(i)}
                        className={`text-green-600 ${
                          row.isSaved
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        Save
                      </button>
                    </td>

                    {/* Clone */}
                    <td className="px-4">
                      <button
                        onClick={() => duplicateRow(row, i)}
                        className="text-blue-600"
                      >
                        Clone
                      </button>
                    </td>

                    {/* Print */}
                    <td>
                      <button
                        onClick={() => printLabels(row)}
                        className="text-purple-600"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-20 float-end">
            <button
              onClick={saveItems}
              className="bg-purple-500 text-white rounded-md px-4 py-2 cursor-pointer"
            >
              Save List
            </button>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-y-4">
          {savedLists.map((list) => (
            <li key={list._id} className="border rounded-lg">
              <div
                onClick={() => fetchListItems(list._id)}
                className="p-3 cursor-pointer flex justify-between items-center hover:bg-gray-100"
              >
                {list.list_name}
                <span>{openListId === list._id ? "▲" : "▼"}</span>
              </div>

              {openListId === list._id && (
                <div className="p-3">
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">Brand</th>
                        <th className="border p-2">Item</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Gender</th>
                        <th className="border p-2">Color</th>
                        <th className="border p-2">Pattern</th>
                        <th className="border p-2">Fit</th>
                        <th className="border p-2">Barcode</th>
                      </tr>
                    </thead>

                    <tbody>
                      {listItems.map((item) => (
                        <tr key={item._id}>
                          <td className="border p-2">{item.brand}</td>
                          <td className="border p-2">
                            {item.item_name}
                          </td>
                          <td className="border p-2">{item.category}</td>
                          <td className="border p-2">{item.gender}</td>
                          <td className="border p-2">{item.color}</td>
                          <td className="border p-2">{item.pattern}</td>
                          <td className="border p-2">{item.fit}</td>
                          <td className="border p-2">{item.barcode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
