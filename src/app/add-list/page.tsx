"use client";
import { toast, Toaster } from 'react-hot-toast';
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import heic2any from "heic2any"; // Add this to your imports
import React from "react";
import { log } from "util";
import { FaSave, FaClone, FaPrint } from "react-icons/fa";
const API_BASE = "https://dev.zuget.com";
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
  item_category: string;
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
  xs: SizeInfo; s: SizeInfo; m: SizeInfo; l: SizeInfo; xl: SizeInfo;
  xxl: SizeInfo; xxxl: SizeInfo; xxxxl: SizeInfo;
  sz9: SizeInfo; sz10: SizeInfo; sz11: SizeInfo;
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
  item_category: string;
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



/* ---------------- MAIN COMPONENT ---------------- */

export default function ProductTable() {
  const [isSaving, setIsSaving] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Push state TWICE to create a buffer
    window.history.pushState(null, "", window.location.href);
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Whenever they consume a history state by swiping back, 
      // immediately push a new one to replace the buffer.
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const [prevAddedItems, setPrevAddedItems] = useState<Boolean>(false);
  const [previews, setPreviews] = useState<{
    [key: string]: { front?: string; back?: string };
  }>({});
  const [barcodes, setBarcodes] = useState<number[]>([]);

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
    const printUrl = `/print-list?list_id=${listId}`;
    window.open(printUrl, "_blank");
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

  const handleImageChange = async (
    index: number,
    field: "frontImage" | "backImage",
    file: File | undefined
  ) => {
    if (!file) return;

    let fileToSaveAndPreview: File | Blob = file;

    // Check if the file is HEIC
    if (
      file.type === "image/heic" ||
      file.name.toLowerCase().endsWith(".heic")
    ) {
      try {
        // Convert HEIC to JPEG
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8, // Optional: compress slightly to save memory
        });

        // heic2any can return an array of blobs if the image is an animation/sequence. 
        // We just grab the first one.
        fileToSaveAndPreview = Array.isArray(convertedBlob)
          ? convertedBlob[0]
          : convertedBlob;

        // Convert the Blob back to a File object so it plays nice with your S3 upload
        fileToSaveAndPreview = new File(
          [fileToSaveAndPreview],
          file.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      } catch (error) {
        console.error("Error converting HEIC image:", error);
        alert("Could not process HEIC image. Please try a different format.");
        return;
      }
    }

    // Update your state with the file (either the original or the converted JPEG)
    updateField(index, field, fileToSaveAndPreview);

    // Generate the preview URL from the web-friendly file
    const url = URL.createObjectURL(fileToSaveAndPreview);

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
      category: "Mens Clothing",
      item_category: row.item_category,
      gender: row.gender,
      color: "",
      isSaved: false,
      fit: row.fit,
      description: "",
      pattern: row.pattern,
      neck_type: row.neck_type,
      sleeve_type: row.sleeve_type,
      barcode: parentBarcode,
      frontImage: null,
      backImage: null,
      sizes: {
        xs: { price: 0, quantity: 0 },
        s: { price: 0, quantity: 0 },
        m: { price: 0, quantity: 0 },
        l: { price: 0, quantity: 0 },
        xl: { price: 0, quantity: 0 },
        xxl: { price: 0, quantity: 0 },
        xxxl: { price: 0, quantity: 0 },
        xxxxl: { price: 0, quantity: 0 },
        // Initialize new slots:
        sz9: { price: 0, quantity: 0 },
        sz10: { price: 0, quantity: 0 },
        sz11: { price: 0, quantity: 0 },
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
    if (!win) {
      alert("Popup blocked! Please allow popups to print labels.");
      return;
    }

    const storeName = localStorage.getItem("store_name") || "MY STORE";

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

    /* Change this in your <style> block inside printLabels */
.portrait-wrapper {
  transform: rotate(-90deg);
  width: 48mm;  /* Slightly wider to use more of the 50.8mm width */
  height: 88mm; /* Reduced from 92mm to prevent cutting off the price */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2mm 4mm; /* Increased side padding (which is top/bottom of label) */
  box-sizing: border-box;
  text-transform: uppercase;
}

    .store_name {
  background: #000 !important;
  color: #fff !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  padding: 2px 6px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  margin-top: 2mm; /* Pushes away from the left edge */
  margin-bottom: 2px;
  word-break: break-word;
}

    .barcode-section { 
    background: #fff; 
    width: 100%; 
    padding: 0; /* Remove container padding */
    margin: 0;
  }

    .barcode-svg {
    width: 100%; 
    height: 100px; /* Increased height for better vertical scanning */
    display: block;
    margin: 0 auto;
    shape-rendering: crispEdges; /* CRITICAL: Stops anti-aliasing (blur) */
  }

    .barcode-number { font-size: 12px; font-weight: 800; }
   
    .brand {
    padding-top:10px;
      font-size: 18px;
      font-weight: 900;
      margin: 2px 0;
      word-wrap: break-word; /* Wrap long brand names */
    }
   
    .specs {
      font-size: 10px;
      font-weight: 800;
      line-height: 1.8;
      flex-grow: 1; /* Allows specs to take up available space */
      padding-top:12px
    }
   
    .specs p {
      margin: 1px 0;
      word-break: break-all; /* Forces wrap on very long item names */
      white-space: normal;
    }

    .footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1.5px solid #000;
  padding-top: 2px;
  margin-top: 2px;
  margin-bottom: 4mm; /* Pushes the price away from the cutting edge */
}

    .mrp-label { font-size: 8px; font-weight: 700; line-height: 1; }
    .price { font-size: 20px; font-weight: 900; }
  </style>
</head>
<body>
`;

    Object.entries(row.sizes).forEach(([sizeKey, data]: any) => {
      if (data.quantity > 0) {
        // Get the correct label (e.g., "28" instead of "xs")
        const displaySize = getDisplaySize(row, sizeKey);
        console.log(row, '0000-----');

        for (let i = 0; i < data.quantity; i++) {
          const uniqueId = `bc_${sizeKey}_${i}_${Math.floor(Math.random() * 1000)}`;

          html += `
<div class="label-container">
  <div class="portrait-wrapper">
    <div style="display: flex; flex-direction: column;">
      <div class="store_name">The Edit Luxury Club</div>
      <div class="barcode-section">
        <svg class="barcode-svg" data-value="${row.barcode.split('-')[1]}-${displaySize}" id="${uniqueId}"></svg>
        <div class="barcode-number">${row.barcode}-${displaySize}</div>
      </div>
      <div class="brand">${row.brand}</div>
      <div class="specs">
        <p>ITEM: ${row.item}</p>
        <p>SIZE: ${displaySize}</p>
        <p>COLOR: ${row.color || "N/A"}</p>
        <p>FIT: ${row.fit || "N/A"}</p>
      </div>
    </div>
    <div class="footer">
      <div class="mrp-label">MAX RETAIL PRICE<br/>(Incl. of all taxes)</div>
      <div class="price">₹${data.price}</div>
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
        width: 2,           // Standard width for 100mm labels
        height: 100,         // Increased from 80 to 100 for a taller target
        displayValue: false,
        margin: 0,           // REMOVED SIDE PADDING
        background: "#ffffff",
        lineColor: "#000000",
        flat: true           // Helps with rendering consistency
      });
    });

    setTimeout(() => {
      window.print();
      window.close();
    }, 700); // Increased delay slightly to ensure SVG renders fully before print
  };
</script>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
  };


  const addToZugetUtil = async (
    value: string,
    endpoint: string,
    paramName: string,
    refreshEndpoint: string,
    setter: Function,
    label: string,
    currentList: any[] // New parameter to check for duplicates
  ) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    // 1. Duplicate Check: Case-insensitive comparison
    const isDuplicate = currentList.some(
      (item) => item.name?.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (isDuplicate) {
      alert(`${label} "${trimmedValue}" already exists.`);
      return; // Stop the API call
    }

    try {
      const res = await fetch(
        `${API_BASE}${endpoint}?${paramName}=${encodeURIComponent(trimmedValue)}`,
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
        fetchData(refreshEndpoint, setter);
        alert(`${label} added successfully`);
      }
    } catch (error) {
      console.error(`Error adding ${label.toLowerCase()}:`, error);
    }
  };
  /* -------- Rows, size config, helpers -------- */

  const defaultSize = { price: 0, quantity: 0 };

  const createEmptyRow = (): ProductRow => ({
    id: uuidv4(),
    item: "",
    brand: "",
    category: "",
    gender: "Mens",
    color: "",
    fit: "",
    description: "",
    item_category: "", // Add this line
    frontImage: null,
    backImage: null,
    barcode: "",
    pattern: "",
    neck_type: "",
    sleeve_type: "",
    sizes: {
      xs: { price: 0, quantity: 0 },
      s: { price: 0, quantity: 0 },
      m: { price: 0, quantity: 0 },
      l: { price: 0, quantity: 0 },
      xl: { price: 0, quantity: 0 },
      xxl: { price: 0, quantity: 0 },
      xxxl: { price: 0, quantity: 0 },
      xxxxl: { price: 0, quantity: 0 },
      // Initialize new slots:
      sz9: { price: 0, quantity: 0 },
      sz10: { price: 0, quantity: 0 },
      sz11: { price: 0, quantity: 0 },
    },
    isSaved: false,
  });

  const [patterns, setPatterns] = useState<any[]>([]);
  const [fits, setFits] = useState<any[]>([]);
  const [fitCategoriesByRow, setFitCategoriesByRow] = useState<{ [key: number]: any[] }>({});
  const [rows, setRows] = useState<ProductRow[]>([createEmptyRow()]);



  // Zuget brands
  const [brandsList, setBrandsList] = useState<any[]>([]);

  const genders = ["Men", "Women", "Girl", "Boy", "Unisex"];
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
      const brandNames = json.data.results
      setBrandsList(brandNames);
      // console.log(brandNames, "brandNames");
    }
  };





  // Replace the useLocalList hooks for these three:
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [sleevesList, setSleevesList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [necksList, setNecksList] = useState<any[]>([]);
  const [colorsList, setColorsList] = useState<any[]>([]);
  // Inside your useEffect (where you fetch fits and patterns):
  useEffect(() => {
    // fetchData("/util/fit-categories", setFits);
    fetchData("/util/patterns", setPatterns);
    fetchData("/util/color", setColorsList);
    fetchData("/util/product-category-details", setCategoriesList);
    // New Zuget API fetches
    fetchData("/util/item_name_list", setItemsList);
    fetchData("/util/sleeve-type", setSleevesList);
    fetchData("/util/neck_type", setNecksList);
    fetchBrands()
    // ... rest of your brand fetching logic
  }, []);

  const addFilterCategory = async (index: number, categoryValue: string) => {
    const row = rows[index];
    const trimmedCategory = categoryValue.trim();

    if (!row.item || row.item === "Select") {
      alert("Please select an Item Name first.");
      return;
    }
    if (!trimmedCategory) return;

    // Duplicate Check
    const currentList = itemCategoriesList[index] || [];
    const isDuplicate = currentList.some(
      (cat: any) => cat.category?.toLowerCase() === trimmedCategory.toLowerCase()
    );

    if (isDuplicate) {
      alert(`Category "${trimmedCategory}" already exists for ${row.item}.`);
      return;
    }

    try {
      // Exact URL from your curl: /util/add-filter-categories?item_name=Jeans&category=test
      const url = `${API_BASE}/util/add-filter-categories?item_name=${encodeURIComponent(row.item)}&category=${encodeURIComponent(trimmedCategory)}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: authtoken,
        },
      });

      const result = await res.json();
      if (result.status === "success" || res.ok) {
        // Refresh only the list for this specific row
        fetchItemCategories(index, row.item);
        toast.success("Category added successfully");
      } else {
        alert(result.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };
  const addFitCategory = async (index: number, fitValue: string) => {
    const row = rows[index];
    const trimmedFit = fitValue.trim();

    if (!row.item || row.item === "Select") {
      alert("Please select an Item Name first.");
      return;
    }
    if (!trimmedFit) return;

    // Duplicate Check
    const currentList = fitCategoriesByRow[index] || [];
    const isDuplicate = currentList.some(
      (f: any) => f.name?.toLowerCase() === trimmedFit.toLowerCase()
    );

    if (isDuplicate) {
      alert(`Fit "${trimmedFit}" already exists for ${row.item}.`);
      return;
    }

    try {
      // API uses POST with query params as per your curl
      const url = `${API_BASE}/util/add-fit-categories?name=${encodeURIComponent(trimmedFit)}&item_name=${encodeURIComponent(row.item)}`;

      const res = await fetch(url, {
        method: "POST", // Changed to POST
        headers: {
          accept: "application/json",
          Authorization: authtoken,
        },
        body: "", // Empty body as per -d ''
      });

      const result = await res.json();
      if (result.status === "success" || res.ok) {
        // Refresh the specific Fit list for this row
        fetchFitCategories(index, row.item);
        toast.success("Fit added successfully");
      } else {
        alert(result.message || "Failed to add fit");
      }
    } catch (error) {
      console.error("Error adding fit:", error);
    }
  };

  const addBrand = async (value: string) => {
    const brand = value.trim();
    if (!brand) return;

    // 1. Duplicate Check: Case-insensitive check against the existing brands list
    const isDuplicate = brandsList.some(
      (b: any) => b.name?.toLowerCase() === brand.toLowerCase()
    );

    if (isDuplicate) {
      alert(`Brand "${brand}" already exists for this store.`);
      return; // Exit without calling the API
    }

    const storeId = localStorage.getItem("store_id");

    try {
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
        // 2. Refresh the list from the server to get the new list with IDs
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

        // Update with the full data results (including _id and name)
        if (json.status === "success") {
          setBrandsList(json.data.results || []);
          toast.success("Brand added successfully", { duration: 2000 });
        }
      } else {
        alert(result.message || "Failed to add brand");
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      alert("An error occurred while adding the brand.");
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
    // console.log(json, "json in fetch");

    setter(json?.data?.results || []);
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };
  const applyBulkPrice = (index: number, value: number) => {
    const updated = [...rows];
    sizes.forEach((size) => {
      updated[index].sizes[size as keyof Sizes].price = value;
    });
    setRows(updated);
  };

  const applyBulkQty = (index: number, value: number) => {
    const updated = [...rows];
    sizes.forEach((size) => {
      updated[index].sizes[size as keyof Sizes].quantity = value;
    });
    setRows(updated);
  };
  useEffect(() => {
    const handlers = rows.map((row, index) => {
      if (!row.item || row.item === "Select" || row.item === "") return null;

      const timeoutId = setTimeout(() => {
        fetchItemCategories(index, row.item);
        fetchFitCategories(index, row.item);
      }, 10); // 2 seconds delay

      return timeoutId;
    });

    return () => handlers.forEach(id => id && clearTimeout(id));
  }, [rows.map(r => r.item).join(",")]);
  const updateField = (index: number, field: string, value: any) => {
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    setRows(updated);
    // if (field === "item") {
    //   fetchItemCategories(index, value);
    //   fetchFitCategories(index, value);
    // }
  };

  const updatePrice = (index: number, size: keyof Sizes, value: any) => {
    const updated = [...rows];
    updated[index].sizes[size].price = value === "" ? 0 : Number(value);
    setRows(updated);
  };

  const updateQty = (index: number, size: keyof Sizes, value: any) => {
    const updated = [...rows];
    // Convert to number here so your state remains consistent for the API
    updated[index].sizes[size].quantity = value === "" ? 0 : Number(value);
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
  // 1. Add this state at the top of your component
  const [itemCategoriesList, setItemCategoriesList] = useState<{ [key: number]: any[] }>({});

  // 2. Add the fetch function
  const fetchItemCategories = async (index: number, itemName: string) => {
    if (!itemName || itemName === "Select") return;
    try {
      const res = await fetch(
        `${API_BASE}/util/filter-category-details?item_name=${encodeURIComponent(itemName)}`,
        {
          headers: {
            accept: "application/json",
            Authorization: authtoken,
          },
        }
      );
      const json = await res.json();
      if (json.status === "success") {
        // Note: your API response uses item.category for the display name
        setItemCategoriesList(prev => ({
          ...prev,
          [index]: json.data?.results || []
        }));
      }
    } catch (error) {
      console.error("Error fetching item categories:", error);
    }
    finally {
      // Stop Loader
      setIsSaving(prev => ({ ...prev, [index]: false }));
    }
  };

  const fetchFitCategories = async (index: number, itemName: string) => {
    if (!itemName || itemName === "Select") return;
    try {
      const res = await fetch(`${API_BASE}/util/fit-categories?item_name=${encodeURIComponent(itemName)}`, {
        headers: { accept: "application/json", Authorization: authtoken }
      });
      const json = await res.json();
      if (json.status === "success") {
        setFitCategoriesByRow(prev => ({
          ...prev,
          [index]: json.data?.results || []
        }));
      }
    } catch (error) {
      console.error("Error fetching fit categories:", error);
    }
  };


  // 1. Updated saveRow function with proper loading and no success alert
  const saveRow = async (index: number) => {
    const row = rows[index];
    const item = row.item?.toLowerCase() || "";
    const numericSizeItems = ["jeans",  "trousers",  "joggers", "chinos", "formal pants", "cotton trouser"];

    // Check if it's a numeric item
    const isNumericItem = numericSizeItems.some((keyword) => item.includes(keyword));

    // Validation remains (you may want to replace this alert with a toast later)
    const requiredFields = [
      { value: row.item, label: "Item Name" },
      { value: row.brand, label: "Brand" },
      // { value: row.category, label: "Category" },
      // { value: row.gender, label: "Gender" },
      { value: row.item_category, label: "Item Category" },
      { value: row.color, label: "Color" },
      { value: row.fit, label: "Fit" },
      // { value: row.pattern, label: "Pattern" },
      // { value: row.neck_type, label: "Neck Type" },
      // { value: row.sleeve_type, label: "Sleeve Type" },
      // { value: row.description, label: "Description" },
      { value: row.frontImage, label: "Front Image" },
      { value: row.backImage, label: "Back Image" },
    ];

    const missingFields = requiredFields.filter((f) => {
      if (!f.value) return true;

      if (typeof f.value === "string") {
        return f.value.trim() === "" || f.value === "Select";
      }
      return false;
    }).map((f) => f.label);

    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // START LOADER
    setIsSaving((prev) => ({ ...prev, [index]: true }));

    try {
      // Image Uploads
      let imageUrl = "";
      let videoUrl = "";
      if (row.frontImage) imageUrl = await uploadToS3(row.frontImage);
      if (row.backImage) videoUrl = await uploadToS3(row.backImage);

      const size_data = sizeKeys
        .map((key, index) => {
          const v = row.sizes[key as keyof Sizes];
          const labels = getLabelsForRow(row);

          // If there is no label for this index (e.g., index 8 for a Shirt), 
          // it returns null so we can filter it out.
          if (!labels[index]) return null;

          return {
            size: labels[index],
            price: Number(v.price) || 0,
            quantity: Number(v.quantity) || 0,
          };
        })
        .filter((item) => item !== null); // This removes sz9-sz11 for shirts

      const body = {
        app_user_id: Number(localStorage.getItem("app_user_id")),
        store_id: Number(localStorage.getItem("store_id")),
        barcode: row.barcode,
        brand: row.brand,
        item_name: row.item,
        category: "Mens Clothing",
        gender: "Men",
        item_category: row.item_category,
        item_image: imageUrl,
        item_video: videoUrl,
        fit: row.fit,
        color: row.color,
        pattern: isNumericItem ? "" : row.pattern,
        neck_type: isNumericItem ? "" : row.neck_type,
        sleeve_type: isNumericItem ? "" : row.sleeve_type,
        size_data,
        product_description: "dummy",
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

        const barcodeParts = result.data.split("-");
        const itemId = parseInt(barcodeParts[1], 10);
        setBarcodes((prev) => [...prev, itemId]);

        // Removed Success Alert
        addRow();
      } else {
        alert(result.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving.");
    } finally {
      // STOP LOADER (Always runs whether success or error)
      setIsSaving((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Update these two arrays found near the bottom of your helper functions
  const sizes = ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "sz9", "sz10", "sz11"];
  const sizeKeys = ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "sz9", "sz10", "sz11"];
  const SIZE_CONFIG = {
    KIDS: ["0-3M", "3-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    JEANS: ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48"], // 11 sizes
    SHIRTS: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL","5xl"], // 8 sizes
  };
  const getLabelsForRow = (row: ProductRow) => {
    const item = row.item?.toLowerCase() || "";
    const numericSizeItems = ["jeans",  "trousers",  "joggers", "chinos", "formal pants", "cotton trouser", "chinos", "cotton trouser"];

    if (numericSizeItems.some((keyword) => item.includes(keyword))) {
      return SIZE_CONFIG.JEANS;
    }
    return SIZE_CONFIG.SHIRTS;
  };

  const getDisplaySize = (row: ProductRow, sizeKey: string) => {
    const index = [
      "xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "sz9", "sz10", "sz11"
    ].indexOf(sizeKey);
    const gender = row.gender?.toLowerCase();
    const item = row.item?.toLowerCase() || "";

    const numericSizeItems = [
      "jeans",
      "trousers",
      "joggers",
      "chinos",
      "tracksuit",
      "pyjamas",
      "sportswear",
      "swimwear",
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
    const integerItemIds = barcodes.map(id => Math.floor(Number(id)));

    const body = {
      app_user_id: Number(localStorage.getItem("app_user_id")),
      store_id: Number(localStorage.getItem("store_id")),
      item_ids: integerItemIds,
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
        setBarcodes([])
      } else {
        alert("Failed to save items");
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      fetchLists()
    }
  };

  const handleDelete = async (barcode: string) => {
    // 1. Extract the Item ID (e.g., "24214528-536" -> "536")
    const parts = barcode.split("-");
    const itemId = parts[1];

    if (!itemId) {
      alert("Invalid Barcode format. Cannot find Item ID.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/delete-product?item_id=${itemId}`, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Authorization": authtoken,
        },
      });

      const result = await res.json();

      if (result.status === "success") {
        alert("Item deleted successfully!");

        // FIX: Update BOTH possible states to ensure it disappears from the UI

        // If deleting from the "Previously Added Items" list:
        setListItems((prev) => prev.filter((item) => String(item.barcode) !== String(barcode)));

        // If deleting from the "Main Entry Table" rows:
        setRows((prev) => prev.filter((row) => row.barcode !== barcode));

      } else {
        alert(result.message || "Failed to delete item.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error connecting to server.");
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="p-1">
      <Toaster position="top-right" />
      <div className="flex gap-x-10 pb-4">
        <button
          onClick={() => {
            setPrevAddedItems(false);
          }}
          className={`${prevAddedItems === false ? "border-b-2 border-purple-500" : ""
            } `}
        >
          Add New Items
        </button>
        <button
          onClick={() => {
            setPrevAddedItems(true);
          }}
          className={`${prevAddedItems === true ? "border-b-2 border-purple-500 capitalize" : "capitalize"
            } `}
        >
          previously added Items test
        </button>
      </div>

      {!prevAddedItems ? (
        <div className="h-screen flex flex-col">
          {/* ... inside the !prevAddedItems condition ... */}
          <div className="flex-1 overflow-auto border rounded-md">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  {/* Important: Add 'sticky top-0 bg-gray-100' to each <th> if the parent doesn't behave */}
                  <th className="p-4 border-b text-left sticky top-0">Item Name</th>
                  <th className="p-4 border-b text-left sticky top-0">Item Category</th>
                  <th className="px-2 border-b text-left sticky top-0">Brand</th>
                  <th className="border-b text-left sticky top-0">Color</th>
                  <th className="border-b text-left sticky top-0">Fit</th>
                  <th className="border-b text-left sticky top-0">Sleeve</th>
                  <th className="border-b text-left sticky top-0">Neck</th>
                  <th className="border-b text-left sticky top-0">Pattern</th>
                  <th className="border-b text-left sticky top-0">Front Image</th>
                  <th className="border-b text-left sticky top-0">Back Image</th>

                  {/* Bulk sections */}
                  <th className="bg-purple-100 p-2 border-b sticky top-0">Bulk Price</th>
                  <th className="bg-purple-100 p-2 border-b sticky top-0">Bulk Qty</th>

                  {/* Dynamic sizes */}
                  {/* Dynamic sizes Header */}
                  {sizeKeys.map((key, index) => {
                    // We show all 11 headers because the table needs a consistent structure,
                    // but we can dim or label them "N/A" if the first row isn't a numeric item.
                    const labels = getLabelsForRow(rows[0]);
                    const displayLabel = labels[index] || "—";

                    return (
                      <React.Fragment key={key}>
                        <th className="p-2 border-b bg-gray-100">{displayLabel} Price</th>
                        <th className="p-2 border-b bg-gray-100">{displayLabel} Qty</th>
                      </React.Fragment>
                    );
                  })}

                  <th className="p-4 border-b bg-gray-100 sticky top-0">Barcode</th>
                  <th className="p-4 border-b bg-gray-100 sticky top-0">Actions</th>
                </tr>
              </thead>
              {/* ... <tbody> remains the same ... */}

              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-t ${row.isSaved ? "bg-green-50" : ""
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
                                addToZugetUtil(e.currentTarget.value, "/util/add-item-list", "item_name", "/util/item_name_list", setItemsList, "Item", itemsList);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addToZugetUtil(input.value, "/util/add-item-list", "item_name", "/util/item_name_list", setItemsList, "Item", itemsList);
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
                          {itemsList.map((v) => (
                            <option key={v._id} value={v.name} />
                          ))}
                        </datalist>
                      </div>
                    </td>
                    {/* Item Category Column */}
                    {/* Item Category Column - Change from "category" to "item_category" */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "180px" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
                          <input
                            placeholder="Search category..."
                            disabled={!!row.isSaved}
                            style={{ border: "none", padding: "5px", flex: 1, outline: "none" }}
                            list={`item-cat-list-${i}`}
                            value={row.item_category}
                            onChange={(e) => updateField(i, "item_category", e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addFilterCategory(i, e.currentTarget.value);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              // Find the input relative to this button
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addFilterCategory(i, input.value);
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
                            title="Add new category"
                          >
                            +
                          </button>
                        </div>

                        <datalist id={`item-cat-list-${i}`}>
                          {(itemCategoriesList[i] || []).map((cat: any) => (
                            <option key={cat._id} value={cat.category} />
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
                            <option key={b._id} value={b.name} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Category from local server */}
                    {/* <td className="px-4">
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
                                addToZugetUtil(e.currentTarget.value, "/util/add-product-categories", "category", "/util/product-category-details", setCategoriesList, "category", categoriesList);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addToZugetUtil(input.value, "/util/add-product-categories", "category", "/util/product-category-details", setCategoriesList, "category", categoriesList);
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
                            <option key={cat._id} value={cat.name} />
                          ))}
                        </datalist>
                      </div>
                    </td> */}

                    {/* Gender select */}
                    {/* <td className="px-4">
                      Mens
                    </td> */}

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
                                addToZugetUtil(e.currentTarget.value, "/util/add-color", "color", "/util/color", setColorsList, "Color", colorsList
                                );
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addToZugetUtil(input.value, "/util/add-color", "color", "/util/color", setColorsList, "Color", colorsList
                              );
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
                            <option key={c._id} value={c.name} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Fit from Zuget */}
                    <td className="px-4">
                      <div style={{ position: "relative", width: "160px" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
                          <input
                            disabled={!!row.isSaved}
                            list={`fits-list-${i}`}
                            placeholder="Fit..."
                            style={{ border: "none", padding: "5px", flex: 1, outline: "none", width: "100%" }}
                            value={row.fit}
                            onChange={(e) => updateField(i, "fit", e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addFitCategory(i, e.currentTarget.value);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addFitCategory(i, input.value);
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
                          {(fitCategoriesByRow[i] || []).map((f: any) => (
                            <option key={f._id || f.name} value={f.name} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Sleeve from local server */}
                    {!["jeans",  "trousers", "joggers", "chinos",  "formal pants", "cotton trouser", "chinos", "cotton trouser", "pant","shorts"].some(k => row.item.toLowerCase().includes(k)) ? <td className="px-4">
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addToZugetUtil(e.currentTarget.value, "/util/add-sleeve-type", "sleeve_type", "/util/sleeve-type", setSleevesList, "Sleeve", sleevesList);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addToZugetUtil(input.value, "/util/add-sleeve-type", "sleeve_type", "/util/sleeve-type", setSleevesList, "Sleeve", sleevesList);
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
                        <datalist id={`sleeves-list-${i}`}>
                          {sleevesList.map((s) => (
                            <option key={s._id} value={s.name} />
                          ))}
                        </datalist>
                      </div>
                    </td> : <td className="px-5">N/A</td>}

                    {/* Neck from local server */}
                    {!["jeans",  "trousers", "joggers", "chinos", "formal pants", "cotton trouser", "chinos", "cotton trouser", "pant","shorts"].some(k => row.item.toLowerCase().includes(k)) ? <td className="px-4">
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addToZugetUtil(e.currentTarget.value, "/util/add-neck_type", "neck_type", "/util/neck_type", setNecksList, "Neck", necksList);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addToZugetUtil(input.value, "/util/add-neck_type", "neck_type", "/util/neck_type", setNecksList, "Neck", necksList);
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
                        <datalist id={`necks-list-${i}`}>
                          {necksList.map((n) => (
                            <option key={n._id} value={n.name} />
                          ))}
                        </datalist>
                      </div>
                    </td> : <td className="px-5">N/A</td>}

                    {/* Pattern from Zuget */}
                    {!["jeans",  "trousers", "joggers", "chinos",  "formal pants", "cotton trouser", "chinos", "cotton trouser", "pant","shorts"].some(k => row.item.toLowerCase().includes(k)) ? <td className="px-4">
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
                                addToZugetUtil(e.currentTarget.value, "/util/add-pattern", "pattern", "/util/patterns", setPatterns, "Pattern", patterns);
                              }
                            }}
                          />

                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling as HTMLInputElement;
                              addToZugetUtil(input.value, "/util/add-pattern", "pattern", "/util/patterns", setPatterns, "Pattern", patterns);
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
                    </td> : <td className="px-5">N/A</td>}

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
                    {/* Add this inside rows.map((row, i) => ( <tr ...> */}
                    {/* Bulk Price Input */}
                    <td className="bg-purple-100 p-2">
                      <input
                        type="text"
                        placeholder="Bulk Price"
                        className="w-20 p-1 text-black rounded border"
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                          applyBulkPrice(i, Number(val));
                        }}
                      />
                    </td>

                    {/* Bulk Qty Input */}
                    <td className="bg-purple-100 p-2">
                      <input
                        type="text"
                        placeholder="Bulk Qty"
                        className="w-20 p-1 text-black rounded border"
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                          applyBulkQty(i, Number(val));
                        }}
                      />
                    </td>

                    {/* Sizes (price + qty) */}
                    {/* Inside <tbody> rows.map */}
                    {/* Filter out 'xs' from the row rendering */}
                    {/* Inside <tbody> rows.map */}
                    {sizeKeys.map((key, index) => {
                      const labels = getLabelsForRow(row);
                      const currentLabel = labels[index];

                      // If this specific row doesn't have a size for this column, show "N/A"
                      if (!currentLabel) {
                        return (
                          <React.Fragment key={key}>
                            <td className="p-1 border bg-gray-50 text-gray-400 text-center">-</td>
                            <td className="p-1 border bg-gray-50 text-gray-400 text-center">-</td>
                          </React.Fragment>
                        );
                      }

                      return (
                        <React.Fragment key={key}>
                          {/* Price Input */}
                          <td className="p-1 border text-center">
                            <span className="text-[10px] font-bold text-black block">{currentLabel}</span>
                            <input
                              type="text"
                              className="w-16 border rounded p-1 text-center"
                              value={row.sizes[key as keyof Sizes].price || ""}
                              onChange={(e) => updatePrice(i, key as keyof Sizes, e.target.value.replace(/\D/g, ""))}
                              disabled={!!row.isSaved}
                              placeholder='Price'
                            />
                          </td>

                          {/* Quantity Input */}
                          <td className="p-1 border text-center">
                            <span className="text-[10px] font-bold text-black block">{currentLabel}</span>
                            <input
                              type="text"
                              className="w-12 border rounded p-1 text-center"
                              value={row.sizes[key as keyof Sizes].quantity || ""}
                              onChange={(e) => updateQty(i, key as keyof Sizes, e.target.value.replace(/\D/g, ""))}
                              disabled={!!row.isSaved}
                              placeholder='Qty'
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Description */}
                    {/* <td className="px-4">
                      <textarea
                        className="border w-28"
                        onChange={(e) =>
                          updateField(i, "description", e.target.value)
                        }
                      />
                    </td> */}

                    {/* Barcode */}
                    <td className="text-xs">{row.barcode}</td>

                    {/* Save */}
                    <td className="px-4  flex items-center justify-center py-2 gap-x-5">
                      <button
                        disabled={!!row.isSaved || isSaving[i]}
                        onClick={() => saveRow(i)}
                        className={`text-lg transition-all cursor-pointer ${row.isSaved ? "text-gray-400" : "text-green-600 hover:scale-110"
                          }`}
                      >
                        {isSaving[i] ? (
                          <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full  "></div>
                        ) : (
                          <FaSave size={30} />
                        )}
                      </button>


                      {/* Clone */}

                      <button
                        onClick={() => duplicateRow(row, i)}
                        className="text-blue-600 text-lg cursor-pointer hover:scale-110"
                      >
                        <FaClone size={30} />
                      </button>


                      {/* Print */}

                      <button
                        onClick={() => printLabels(row)}
                        className="text-purple-600 text-lg cursor-pointer hover:scale-110"
                      >
                        <FaPrint size={30} />
                      </button>


                      {/* --- DELETE BUTTON --- */}
                      <button
                        onClick={() => handleDelete(row.barcode)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer hover:scale-110"
                        title="Delete Item"
                      >
                        {/* If you have react-icons installed */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 float-end">
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


