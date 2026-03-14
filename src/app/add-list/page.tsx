"use client"

import { useEffect, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import React from "react"
const API_BASE = "https://dev.zuget.com"


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
    price: number
    quantity: number
}

type Sizes = {
    xs: SizeInfo
    s: SizeInfo
    m: SizeInfo
    l: SizeInfo
    xl: SizeInfo
    xxl: SizeInfo
    xxxl: SizeInfo
    xxxxl: SizeInfo
}

type ProductRow = {
    id: string
    item: string
    brand: string
    category: string
    gender: string
    color: string
    fit: string
    description: string
    frontImage?: File | null
    backImage?: File | null
    barcode: string
    sizes: Sizes
    pattern: string
    neck_type: string
    sleeve_type: string

    isSaved?: boolean   // ✅ ADD THIS
}

export default function ProductTable() {
    const [prevAddedItems, setPrevAddedItems] = useState<Boolean>(false)
    const [previews, setPreviews] = useState<{ [key: string]: { front?: string; back?: string } }>({});
    const [barcodes, setBarcodes] = useState<string[]>([])
    // 2. Add function to handle file selection and preview generation

    const [savedLists, setSavedLists] = useState<ListItem[]>([]);
    const [listItems, setListItems] = useState<ItemDetails[]>([]);
    const [openListId, setOpenListId] = useState<number | null>(null);

    /* -------- Fetch Lists -------- */

    const fetchLists = async () => {

        const res = await fetch(
            `${API_BASE}/admin/list-details?app_user_id=${localStorage.getItem('app_user_id')}&store_id=${localStorage.getItem('store_id')}`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: authtoken
                }
            }
        );

        const data = await res.json();
        setSavedLists(data.results);

    };

    /* -------- Fetch List Items -------- */

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
                    Authorization: authtoken
                }
            }
        );

        const data: ListItemsResponse = await res.json();

        const flattenedItems = data.data.flatMap(
            (entry) => entry.item_details
        );

        setListItems(flattenedItems);
        setOpenListId(listId);

    };

    useEffect(() => {
        fetchLists();
    }, []);
    const API_URL_1 =
        `${API_BASE}/admin/list-details?app_user_id=${localStorage.getItem('app_user_id')}&store_id=${localStorage.getItem('store_id')}`;
    // app_user_id=${localStorage.getItem('app_user_id')}&store_id=${localStorage.getItem('store_id')}
    const fetchListDetails = async (): Promise<ListItem[]> => {
        try {
            const response = await fetch(API_URL_1, {
                method: "GET",
                headers: {
                    accept: "application/json",
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3Bob25lIjoiNzk4OTAzMDc0MSJ9.ZXYVhHb5N3ZQA7Y4Ph57lwtQ2_SLOAtUuMlUCekDas4"
                }
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
        const loadLists = async () => {
            const data = await fetchListDetails();
            setLists(data);
        };

        loadLists();
    }, []);

    useEffect(() => {
        console.log("Saved Barcodes:", barcodes)
    }, [barcodes])
    const handleImageChange = (index: number, field: "frontImage" | "backImage", file: File | undefined) => {
        if (!file) return;

        // Update the actual file in the row state
        updateField(index, field, file);

        // Create a temporary URL for the preview
        const url = URL.createObjectURL(file);

        // Store the preview URL associated with the row ID
        setPreviews(prev => ({
            ...prev,
            [rows[index].id]: {
                ...prev[rows[index].id],
                [field === "frontImage" ? "front" : "back"]: url
            }
        }));
    };

    const duplicateRow = useCallback((row: ProductRow, index: number) => {

        // Extract value before hyphen
        const parentBarcode = row.barcode ? row.barcode.split("-")[0] : "";

        const newRow: ProductRow = {
            id: uuidv4(),

            item: row.item,
            brand: row.brand,
            category: row.category,
            gender: row.gender,
            color: "",
            isSaved: false,   // ✅ IMPORTANT
            fit: row.fit,
            description: row.description,

            pattern: row.pattern,
            neck_type: row.neck_type,
            sleeve_type: row.sleeve_type,

            barcode: parentBarcode, // 👈 ONLY parent barcode

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
            }
        };

        setRows(prev => {
            const newRows = [...prev];
            newRows.splice(index + 1, 0, newRow);
            return newRows;
        });

    }, []);


    const authtoken =
        typeof window !== "undefined"
            ? localStorage.getItem(localStorage.getItem("user_phone") + "_token") || ""
            : ""

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

/* label container */
.label-container{
  width:101.6mm;
  height:50.8mm;
  display:flex;
  align-items:center;
  justify-content:center;
  page-break-after:always;
  overflow:hidden;
}

/* rotated layout */
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

/* barcode section */
.barcode-section{
  width:100%;
  padding-top:10px;
}5fy7

svg{
  width:28mm;
  height:35px;
}

.barcode-number{
  font-size:10px;
  padding-top:6px;
  font-weight:600;
  padding-left:52px
}

/* brand */
.brand{
  font-size:18px;
  font-weight:900;
  line-height:1;
  padding-top:24px;
  padding-bottom:12px;
}

/* specs */
.specs{
  font-size:10px;
  line-height:0.6;
  font-weight:600;

}

.specs p{
  padding-bottom:12px;
}

/* footer */
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
                          <p class="store_name">${localStorage.getItem('store_name')}</p>

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

    const defaultSize = { price: 0, quantity: 0 }

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
        isSaved: false,   // ✅ add this

    })

    const [patterns, setPatterns] = useState<any[]>([]);

    useEffect(() => {
        // Existing fetches...
        fetchData("/util/fit-categories", setFits);
        fetchData("/util/patterns", setPatterns); // Fetch patterns from dev.zuget.com
    }, []);

    const addPattern = async (value: string) => {
        const patternName = value.trim();
        if (!patternName) return;

        try {
            // GET request with ?pattern=value based on the zuget.com API structure
            const res = await fetch(`${API_BASE}/util/add-pattern?pattern=${encodeURIComponent(patternName)}`, {
                method: "GET",
                headers: {
                    "accept": "application/json",
                    "Authorization": authtoken
                },
            });

            const result = await res.json();
            if (result.status === "success" || res.ok) {
                fetchData("/util/patterns", setPatterns); // Refresh the list
                alert("Pattern added successfully");
            }
        } catch (error) {
            console.error("Error adding pattern:", error);
        }
    };
    const [fits, setFits] = useState<any[]>([])

    const [rows, setRows] = useState<ProductRow[]>([createEmptyRow()])

    const [items, setItems] = useState([]);

    useEffect(() => {

        fetch("http://localhost:5000/items")
            .then(res => res.json())
            .then(data => setItems(data));
    }, []);

    const addItem = async (value: string) => {

        const item = value.trim();

        if (!item) {
            alert("Item cannot be empty");
            return;
        }

        const res = await fetch("http://localhost:5000/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ item })
        });

        const updated = await res.json();
        setItems(updated);
    };

    const genders = ["Mens", "Womens", "Kids", "Unisex"]
    // const brands = ["Nike", "Puma", "Zara"]
    const [brandsList, setBrandsList] = useState<string[]>([]);

    // Fetch brands from Zuget API
    useEffect(() => {
        const fetchBrands = async () => {
            const storeId = localStorage.getItem("store_id");

            const res = await fetch(`${API_BASE}/util/store-brands?store_id=${storeId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: authtoken
                }
            });

            const json = await res.json();

            if (json.status === "success") {
                const brandNames = json.data.map((b: any) => b.name);
                setBrandsList(brandNames);
            }
        };

        fetchBrands();
    }, []);


    // Add new brand using Zuget API
    const addBrand = async (value: string) => {

        const brand = value.trim();
        if (!brand) return;

        const storeId = localStorage.getItem("store_id");

        const res = await fetch(
            `${API_BASE}/util/add-brand?brand=${encodeURIComponent(brand)}&store_id=${storeId}`,
            {
                method: "GET",
                headers: {
                    accept: "application/json",
                    Authorization: authtoken
                }
            }
        );

        const result = await res.json();

        if (result.status === "success") {
            // Refresh brand list
            const refresh = await fetch(`${API_BASE}/util/store-brands?store_id=${storeId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: authtoken
                }
            });

            const json = await refresh.json();

            const brandNames = json.data.map((b: any) => b.name);
            setBrandsList(brandNames);

            alert("Brand added successfully");
        }
    };
    const [colorsList, setColorsList] = useState<string[]>([]);

    // Fetch colors on load
    useEffect(() => {
        fetch("http://localhost:5000/colors")
            .then(res => res.json())
            .then(data => setColorsList(data));
    }, []);

    // Function to add a new color
    const addColor = async (value: string) => {
        const color = value.trim();
        if (!color) return;

        const res = await fetch("http://localhost:5000/colors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ color })
        });

        const updated = await res.json();
        setColorsList(updated);
    };

    const addFit = async (value: string) => {
        const fitName = value.trim();
        if (!fitName) return;

        try {
            // Based on your curl: GET request with ?fit=value
            const res = await fetch(`${API_BASE}/util/add-fit?fit=${encodeURIComponent(fitName)}`, {
                method: "GET",
                headers: {
                    "accept": "application/json",
                    "Authorization": authtoken // This contains your Bearer token
                },
            });

            const result = await res.json();

            if (result.status === "success" || res.ok) {
                // Refresh the list after adding
                fetchData("/util/fit-categories", setFits);
                alert("Fit added successfully");
            }
        } catch (error) {
            console.error("Error adding fit:", error);
        }
    };

    const [categoriesList, setCategoriesList] = useState<string[]>([]);

    // Add to your existing useEffect hooks
    useEffect(() => {
        fetch("http://localhost:5000/categories")
            .then(res => res.json())
            .then(data => setCategoriesList(data));
    }, []);

    // Function to add a new category
    const addCategory = async (value: string) => {
        const category = value.trim();
        if (!category) return;

        const res = await fetch("http://localhost:5000/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category })
        });

        const updated = await res.json();
        setCategoriesList(updated);
    };

    const [sleevesList, setSleevesList] = useState<string[]>([]);
    const [necksList, setNecksList] = useState<string[]>([]);

    useEffect(() => {
        fetch("http://localhost:5000/sleevetypes").then(res => res.json()).then(setSleevesList);
        fetch("http://localhost:5000/necktypes").then(res => res.json()).then(setNecksList);
    }, []);

    const addSleeve = async (value: string) => {
        const sleeve = value.trim();
        if (!sleeve) return;
        const res = await fetch("http://localhost:5000/sleevetypes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sleeve })
        });
        setSleevesList(await res.json());
    };

    const addNeck = async (value: string) => {
        const neck = value.trim();
        if (!neck) return;
        const res = await fetch("http://localhost:5000/necktypes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ neck })
        });
        setNecksList(await res.json());
    };
    const categories = ["Casual", "Sports", "Formal"]

    useEffect(() => {
        fetchData("/util/fit-categories", setFits)
    }, [])

    const fetchData = async (endpoint: string, setter: Function) => {

        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                Accept: "application/json",
                Authorization: authtoken,
            },
        })

        const json = await res.json()
        setter(json?.data?.results || [])
    }

    const addRow = () => {
        setRows(prev => [...prev, createEmptyRow()])
    }

    const updateField = (index: number, field: string, value: any) => {

        const updated = [...rows]
            ; (updated[index] as any)[field] = value

        setRows(updated)
    }

    const updatePrice = (index: number, size: keyof Sizes, value: number) => {

        const updated = [...rows]

        updated[index].sizes[size].price = value

        setRows(updated)
    }

    const updateQty = (index: number, size: keyof Sizes, value: number) => {

        const updated = [...rows]
        updated[index].sizes[size].quantity = value
        setRows(updated)
    }

    const uploadToS3 = async (file: File): Promise<string> => {

        const formdata = new FormData()
        formdata.append("file", file)

        const res = await fetch(`${API_BASE}/s3/image-file`, {
            method: "POST",
            headers: {
                accept: "application/json",
                Authorization: authtoken,
            },
            body: formdata,
        })

        const result = await res.json()

        return result?.data?.image_link
    }

    const saveRow = async (index: number) => {
        const row = rows[index];

        let imageUrl = "";
        let videoUrl = "";

        if (row.frontImage) imageUrl = await uploadToS3(row.frontImage);
        if (row.backImage) videoUrl = await uploadToS3(row.backImage);

        // --- New Dynamic Size Mapping Logic ---
        const size_data = Object.entries(row.sizes)
            .filter(([_, v]) => v.quantity > 0)
            .map(([key, v]) => {
                // Get the correct label based on your specific conditions
                const finalSizeLabel = getDisplaySize(row, key);

                return {
                    size: finalSizeLabel, // Sends "28", "1-2 Year", or "L" instead of "l"
                    price: v.price,
                    quantity: v.quantity
                };
            });
        // --------------------------------------

        // const body = {
        //     app_user_id: Number(localStorage.getItem("app_user_id")),
        //     store_id: Number(localStorage.getItem("store_id")),
        //     brand: row.brand,
        //     item_name: row.item,
        //     category: row.category,
        //     gender: row.gender,
        //     item_image: imageUrl,
        //     item_video: videoUrl,
        //     fit: row.fit,
        //     color: row.color,
        //     pattern: row.pattern,
        //     neck_type: row.neck_type,
        //     sleeve_type: row.sleeve_type,
        //     size_data,
        //     product_description: row.description
        // };
        const body = {
            app_user_id: Number(localStorage.getItem("app_user_id")),
            store_id: Number(localStorage.getItem("store_id")),

            barcode: row.barcode, // 👈 ADD THIS

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
            product_description: row.description
        };

        const res = await fetch(`${API_BASE}/admin/add-product`, {
            method: "POST",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authtoken
            },
            body: JSON.stringify(body)
        });

        const result = await res.json();
        if (result.status === "success") {

            const updated = [...rows];

            updated[index].barcode = result.data;
            updated[index].isSaved = true;

            setRows(updated);

            // ✅ store barcode
            const itemId = result.data.split("-")[1];

            setBarcodes(prev => [...prev, itemId]);

            alert("Saved Successfully");

            addRow();
        }
    };

    const sizes = ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl"]

    const SIZE_CONFIG = {
        KIDS: ["0-3 Months", "3-6 Months", "6-12 Months", "1-2 Year", "2-3 Year", "3-4 Year", "4-5 Year", "5-6 Year"],
        JEANS: ["28", "30", "32", "34", "36", "38", "40", "42"],
        SHIRTS: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"]
    };

    const getDisplaySize = (row: ProductRow, sizeKey: string) => {
        const index = ["xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl"].indexOf(sizeKey);
        const gender = row.gender?.toLowerCase();
        const item = row.item?.toLowerCase() || "";

        // List of items that should use numeric sizes (28, 30, etc.)
        const numericSizeItems = [
            "jeans", "shorts", "trousers", "cargo pants",
            "joggers", "chinos", "tracksuit", "pyjamas",
            "sportswear", "swimwear", "pant"
        ];

        let labels = SIZE_CONFIG.SHIRTS; // Default (XS, S, M...)

        if (gender === "kids") {
            labels = SIZE_CONFIG.KIDS; // (0-3 Months, 1-2 Year...)
        } else if (numericSizeItems.some(keyword => item.includes(keyword))) {
            labels = SIZE_CONFIG.JEANS; // (28, 30, 32...)
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
            item_ids: barcodes
        };

        try {

            const res = await fetch(`${API_BASE}/admin/save-list`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: authtoken
                },
                body: JSON.stringify(body)
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

    return (

        <div className="p-6">
            <div className="flex gap-x-10 pb-4">
                <button onClick={() => { setPrevAddedItems(false) }} className={`${prevAddedItems === false ? 'border-b-2 border-purple-500' : ''} `}>Add New Items</button>
                <button onClick={() => { setPrevAddedItems(true) }} className={`${prevAddedItems === true ? 'border-b-2 border-purple-500' : ''} `}>previously added Items test</button>
            </div>
            {!prevAddedItems ?
                <div>
                    <div className="overflow-auto border rounded-xl">

                        <table className="min-w-full text-center border text-sm">

                            <thead className="bg-gray-100">

                                <tr className="">
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

                                    {sizes.map(size => (
                                        <>
                                            <th key={size + "p"}>{size.toUpperCase()} Price</th>
                                            <th key={size + "q"}>{size.toUpperCase()} Qty</th>
                                        </>
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

                                    <tr key={row.id} className={`border-t ${row.isSaved ? "bg-green-50" : ""}`}
                                    >
                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "200px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
                                                    {/* Search & Add Input */}
                                                    <input
                                                        placeholder="Search or add..."
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none" }}
                                                        list={`items-list-${i}`}
                                                        value={row.item}
                                                        onChange={(e) => updateField(i, "item", e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                addItem(e.currentTarget.value);
                                                                e.currentTarget.value = ""; // Clear after adding
                                                                e.preventDefault()

                                                            }
                                                        }}
                                                        onFocus={e => {
                                                            // ✅ Force show all options on focus
                                                            e.currentTarget.size = 10
                                                        }}
                                                    />

                                                    {/* Small "Add" icon-button inside the input bar */}
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                                                            addItem(input.value);
                                                            input.value = "";
                                                        }}
                                                        style={{
                                                            border: "none",
                                                            background: "transparent",
                                                            cursor: "pointer",
                                                            padding: "2px 6px",
                                                            fontSize: "18px",
                                                            color: "#ffffff",
                                                            backgroundColor: "purple"
                                                        }}
                                                        title="Add new item"
                                                        className="rounded-md"
                                                    >+</button>
                                                </div>

                                                <datalist id={`items-list-${i}`}>
                                                    {items.map((v) => (
                                                        <option key={v} value={v} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        </td>

                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "180px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>

                                                    {/* Brand Search/Add Input */}
                                                    <input
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        list={`brands-list-${i}`}
                                                        onChange={(e) => updateField(i, "brand", e.target.value)}
                                                        value={row.brand}

                                                        placeholder="Brand..."
                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none" }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                addBrand(e.currentTarget.value);
                                                            }
                                                        }}
                                                    />

                                                    {/* Integrated Add Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
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

                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "180px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>

                                                    {/* Category Search/Add Input */}
                                                    <input
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        list={`categories-list-${i}`}
                                                        placeholder="Category..."
                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none" }}
                                                        onChange={(e) => updateField(i, "category", e.target.value)}
                                                        value={row.category}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                addCategory(e.currentTarget.value);
                                                            }
                                                        }}
                                                    />

                                                    {/* Integrated Add Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
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

                                        <td className="px-4">
                                            <select
                                                value={row.gender || "Select"}
                                                onChange={(e) => updateField(i, "gender", e.target.value)}
                                            >
                                                <option value="Select">Select</option>
                                                {genders.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </td>


                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "150px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
                                                    <input
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        list={`colors-list-${i}`}
                                                        placeholder="Color..."
                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none", width: "100%" }}
                                                        onChange={(e) => updateField(i, "color", e.target.value)}
                                                        value={row.color}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                addColor(e.currentTarget.value);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                                                            addColor(input.value);
                                                        }}
                                                        style={{ border: "none", background: "purple", color: "white", cursor: "pointer", padding: "2px 6px" }}
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

                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "160px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>

                                                    <input
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        list={`fits-list-${i}`}
                                                        placeholder="Fit..."
                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none", width: "100%" }}
                                                        // Value is stored in state via updateField
                                                        onChange={(e) => updateField(i, "fit", e.target.value)}
                                                        value={row.fit}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                addFit(e.currentTarget.value);
                                                            }
                                                        }}
                                                    />

                                                    <button
                                                        onClick={(e) => {
                                                            // Logic to grab the input value next to the button
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
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
                                                        // Use f.name because your fetchData maps json?.data?.results
                                                        <option key={f.id || f.name} value={f.name} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        </td>
                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "180px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
                                                    <input
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        list={`sleeves-list-${i}`}
                                                        placeholder="Sleeve Type..."
                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none" }}
                                                        onChange={(e) => updateField(i, "sleeve_type", e.target.value)}
                                                        value={row.sleeve_type}
                                                        onKeyDown={(e) => e.key === "Enter" && addSleeve(e.currentTarget.value)}
                                                    />
                                                    <button
                                                        onClick={(e) => addSleeve((e.currentTarget.previousSibling as HTMLInputElement).value)}
                                                        style={{ border: "none", background: "purple", color: "white", cursor: "pointer", padding: "2px 8px", fontSize: "18px" }}
                                                        className="rounded-md"
                                                    >+</button>
                                                </div>
                                                <datalist id={`sleeves-list-${i}`}>
                                                    {sleevesList.map((s) => <option key={s} value={s} />)}
                                                </datalist>
                                            </div>
                                        </td>
                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "180px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
                                                    <input
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        list={`necks-list-${i}`}
                                                        placeholder="Neck Type..."
                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none" }}
                                                        // onChange={(e) => updateField(i, "neck_type", e.target.value)}
                                                        onChange={(e) => updateField(i, "neck_type", e.target.value)}
                                                        value={row.neck_type}
                                                        onKeyDown={(e) => e.key === "Enter" && addNeck(e.currentTarget.value)}
                                                    />
                                                    <button
                                                        onClick={(e) => addNeck((e.currentTarget.previousSibling as HTMLInputElement).value)}
                                                        style={{ border: "none", background: "purple", color: "white", cursor: "pointer", padding: "2px 8px", fontSize: "18px" }}
                                                        className="rounded-md"
                                                    >+</button>
                                                </div>
                                                <datalist id={`necks-list-${i}`}>
                                                    {necksList.map((n) => <option key={n} value={n} />)}
                                                </datalist>
                                            </div>
                                        </td>
                                        <td className="px-4">
                                            <div style={{ position: "relative", width: "180px" }}>
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>

                                                    {/* Pattern Search/Add Input */}
                                                    <input
                                                        disabled={row.isSaved}   // ✅ LOCK

                                                        list={`patterns-list-${i}`}
                                                        placeholder="Pattern..."
                                                        style={{ border: "none", padding: "5px", flex: 1, outline: "none" }}
                                                        // onChange={(e) => updateField(i, "pattern", e.target.value)}
                                                        onChange={(e) => updateField(i, "pattern", e.target.value)}
                                                        value={row.pattern}

                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                addPattern(e.currentTarget.value);
                                                            }
                                                        }}
                                                    />

                                                    {/* Integrated Add Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
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
                                                        <option key={p.id || p.name} value={p.name} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        </td>

                                        {/* 4. Updated Front Image Column with Preview */}
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
                                                    disabled={row.isSaved}   // ✅ LOCK

                                                    type="file"
                                                    className="text-[10px] w-24"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(i, "frontImage", e.target.files?.[0])}
                                                />
                                            </div>
                                        </td>

                                        {/* 5. Updated Back Image Column with Preview */}
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
                                                    disabled={row.isSaved}   // ✅ LOCK

                                                    type="file"
                                                    className="text-[10px] w-24"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(i, "backImage", e.target.files?.[0])}
                                                />
                                            </div>
                                        </td>

                                        {sizes.map((size) => {
                                            // Determine the label for this specific row and size key
                                            const displayLabel = getDisplaySize(row, size);

                                            return (
                                                <React.Fragment key={size + i}>
                                                    <td className="px-2 border-l">
                                                        {/* Visual Label */}
                                                        <div className="text-[10px] font-bold text-purple-600 mb-1">{displayLabel}</div>
                                                        <input
                                                            disabled={row.isSaved}   // ✅ LOCK

                                                            type="number"
                                                            placeholder="Price"
                                                            className="w-20 border p-1 text-xs"
                                                            value={row.sizes[size as keyof Sizes].price || ""}
                                                            onChange={(e) => updatePrice(i, size as keyof Sizes, Number(e.target.value))}
                                                        />
                                                    </td>

                                                    <td className="px-2 bg-gray-50">
                                                        <div className="text-[10px] font-bold text-gray-400 mb-1">QTY</div>
                                                        <input
                                                            disabled={row.isSaved}   // ✅ LOCK

                                                            type="number"
                                                            placeholder="Qty"
                                                            className="w-16 border p-1 text-xs"
                                                            value={row.sizes[size as keyof Sizes].quantity || ""}
                                                            onChange={(e) => updateQty(i, size as keyof Sizes, Number(e.target.value))}
                                                        />
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}

                                        <td className="px-4">
                                            <textarea
                                                className="border w-28"
                                                onChange={(e) => updateField(i, "description", e.target.value)}
                                            />
                                        </td>

                                        <td className="text-xs">{row.barcode}</td>

                                        <td className="px-4">
                                            <button
                                                disabled={row.isSaved}
                                                onClick={() => saveRow(i)}
                                                className={`text-green-600 ${row.isSaved ? "opacity-40 cursor-not-allowed" : ""}`}
                                            >
                                                Save
                                            </button>
                                        </td>

                                        <td className="px-4">
                                            <button
                                                onClick={() => duplicateRow(row, i)}
                                                className="text-blue-600">
                                                Clone
                                            </button>
                                        </td>

                                        <td >
                                            <button
                                                onClick={() => printLabels(row)}
                                                className="text-purple-600">
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
                :
                <ul className="flex flex-col gap-y-4">

                    {savedLists.map((list) => (

                        <li key={list._id} className="border rounded-lg">

                            {/* LIST HEADER */}

                            <div
                                onClick={() => fetchListItems(list._id)}
                                className="p-3 cursor-pointer flex justify-between items-center hover:bg-gray-100"
                            >
                                {list.list_name}
                                <span>{openListId === list._id ? "▲" : "▼"}</span>
                            </div>

                            {/* ACCORDION CONTENT */}

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
                                                    <td className="border p-2">{item.item_name}</td>
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

                </ul>}

        </div>

    )

}