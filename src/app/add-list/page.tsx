"use client";

import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import React from "react";
import { log } from "util";

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



/* ---------------- MAIN COMPONENT ---------------- */

export default function ProductTable() {
    const [bulkPrice, setBulkPrice] = useState<number | "">("");
    const [bulkQty, setBulkQty] = useState<number | "">("");
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
        console.log(row, '=========');


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

    .portrait-wrapper {
      transform: rotate(-90deg);
      /* Changed width/height to fit the rotation properly */
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
      word-break: break-word; /* Wrap long store names */
    }

    .barcode-section {
      margin-top: 10px;
  width: 100%;
  padding: 0 5px; /* Adds a small buffer so bars don't touch the edge */
  box-sizing: border-box;
  background: #fff;
    }

    .barcode-svg {
      width: 100%;    /* Force it to fill the section width */
  height: 60px;   /* Explicitly match the height in your JsBarcode config */
  display: block;
  shape-rendering: crispEdges;
    }

    .barcode-number { font-size: 12px; font-weight: 800; letter-spacing: 1px; }
   
    .brand {
    padding-top:10px;
      font-size: 18px;
      font-weight: 900;
      margin: 2px 0;
      word-wrap: break-word; /* Wrap long brand names */
    }
   
    .specs {
      font-size: 12px;
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
    }

    .mrp-label { font-size: 8px; font-weight: 700; line-height: 1; }
    .price { font-size: 20px; font-weight: 900; }
  </style>
</head>
<body>
`;

        Object.entries(row.sizes).forEach(([size, data]: any) => {
            if (data.quantity > 0) {
                for (let i = 0; i < data.quantity; i++) {
                    const uniqueId = `bc_${size}_${i}_${Math.floor(Math.random() * 1000)}`;

                    html += `
<div class="label-container">
  <div class="portrait-wrapper">
    <div style="display: flex; flex-direction: column;">
      <div class="store_name">${storeName}</div>
      <div class="barcode-section">
        <svg class="barcode-svg" data-value="${row.barcode}-${size}" id="${uniqueId}"></svg>
        <div class="barcode-number">${row.barcode}-${size}</div>
      </div>
      <div class="brand">${row.brand}</div>
      <div class="specs">
        <p>ITEM: ${row.item}</p>
        <p>SIZE: ${size.toUpperCase()}</p>
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
  width: 1.8,       // Increased from 1.3 for thicker, clearer bars
  height: 60,      // Increased from 35 to give the scanner more vertical "target"
  displayValue: false,
  margin: 0,
  background: "#ffffff", // Ensure a clean white background
  lineColor: "#000000"   // High contrast black
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
            xs: { price: 0, quantity: 0 },
            s: { price: 0, quantity: 0 },
            m: { price: 0, quantity: 0 },
            l: { price: 0, quantity: 0 },
            xl: { price: 0, quantity: 0 },
            xxl: { price: 0, quantity: 0 },
            xxxl: { price: 0, quantity: 0 },
            xxxxl: { price: 0, quantity: 0 },
        },
        isSaved: false,
    });

    const [patterns, setPatterns] = useState<any[]>([]);
    const [fits, setFits] = useState<any[]>([]);
    const [rows, setRows] = useState<ProductRow[]>([createEmptyRow()]);



    // Zuget brands
    const [brandsList, setBrandsList] = useState<any[]>([]);

    const genders = ["Mens", "Womens", "Girls", "Boys", "Unisex"];
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
            console.log(brandNames, "brandNames");
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
        fetchData("/util/fit-categories", setFits);
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
                    alert("Brand added successfully");
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
        console.log(json, "json in fetch");

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

    const updateField = (index: number, field: string, value: any) => {
        const updated = [...rows];
        (updated[index] as any)[field] = value;
        setRows(updated);
    };

    const updatePrice = (index: number, size: keyof Sizes, value: any) => {
        const updated = [...rows];
        updated[index].sizes[size].price = value === "" ? 0 : Number(value);
        setRows(updated);
    };

    const updateQty = (index: number, size: keyof Sizes, value: any) => {
        const updated = [...rows];
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

    const saveRow = async (index: number) => {
        const row = rows[index];

        // 1. Mandatory Fields Validation (excluding price and quantity)
        const requiredFields = [
            { value: row.item, label: "Item Name" },
            { value: row.brand, label: "Brand" },
            { value: row.category, label: "Category" },
            { value: row.gender, label: "Gender" },
            { value: row.color, label: "Color" },
            { value: row.fit, label: "Fit" },
            { value: row.pattern, label: "Pattern" },
            { value: row.neck_type, label: "Neck Type" },
            { value: row.sleeve_type, label: "Sleeve Type" },
        ];

        const missingFields = requiredFields
            .filter((f) => !f.value || f.value.trim() === "" || f.value === "Select")
            .map((f) => f.label);

        if (missingFields.length > 0) {
            alert(`Please fill all required fields: ${missingFields.join(", ")}`);
            return; // Stop execution if fields are missing
        }

        // 2. Image Uploads
        let imageUrl = "";
        let videoUrl = "";

        if (row.frontImage) imageUrl = await uploadToS3(row.frontImage);
        if (row.backImage) videoUrl = await uploadToS3(row.backImage);

        // 3. Map ALL sizes (Ensure price/qty are 0 if empty)
        // This uses the 'sizes' array defined as ["xs", "s", "m", ... "xxxxl"]
        const size_data = sizes.map((key) => {
            const v = row.sizes[key as keyof Sizes];
            return {
                size: getDisplaySize(row, key),
                price: Number(v.price) || 0,
                quantity: Number(v.quantity) || 0,
            };
        });

        const body = {
            app_user_id: Number(localStorage.getItem("app_user_id")),
            store_id: Number(localStorage.getItem("store_id")),
            barcode: row.barcode,
            brand: row.brand,
            item_name: row.item,
            item_category: row.category,
            category: "",
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

        try {
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
                // const itemId = Number(result.data.split("-")[1]);
                setBarcodes((prev) => [...prev, itemId]);

                alert("Saved Successfully");
                addRow();
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred while saving.");
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
    };

    /* ---------------- RENDER ---------------- */

    return (
        <div className="p-6">
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
                                    {/* Add this inside <thead> <tr> */}
                                    <th className="bg-purple-100 p-2">Bulk Price</th>
                                    <th className="bg-purple-100 p-2">Bulk Qty</th>
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
                                                        <option key={v} value={v.name} />
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
                                                {/* {console.log(categoriesList,"categoriesList")} */}
                                                <datalist id={`categories-list-${i}`}>
                                                    {categoriesList.map((cat) => (
                                                        <option key={cat._id} value={cat.name} />
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
                                                                addToZugetUtil(e.currentTarget.value, "/util/add-fit", "fit", "/util/fit-categories", setFits, "Fit", fits);
                                                            }
                                                        }}
                                                    />

                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                                                            addToZugetUtil(input.value, "/util/add-fit", "fit", "/util/fit-categories", setFits, "Fit", fits);
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
                                        {/* Add this inside rows.map((row, i) => ( <tr ...> */}
                                        <td className="px-2 bg-purple-50">
                                            <input
                                                type="number"
                                                placeholder="Set all prices"
                                                className="w-20 border-2 border-purple-300 p-1 text-xs rounded"
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    updateField(i, "bulkPriceTemp", val); // Optional: track temp value
                                                    applyBulkPrice(i, val);
                                                }}
                                            />
                                        </td>
                                        <td className="px-2 bg-purple-50 border-r-2 border-purple-200">
                                            <input
                                                type="number"
                                                placeholder="Set all qty"
                                                className="w-16 border-2 border-purple-300 p-1 text-xs rounded"
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    applyBulkQty(i, val);
                                                }}
                                            />
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
                                                                row.sizes[size as keyof Sizes].price || 0
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
                                                                row.sizes[size as keyof Sizes].quantity || 0
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
                                                className={`text-green-600 ${row.isSaved
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
