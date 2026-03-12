"use client"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"

const API_BASE = "https://dev.zuget.com"

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
  fabric: string
  pattern: string
  fit: string
  description: string
  frontImage?: File | null
  backImage?: File | null
  barcode: string
  sizes: Sizes
}

export default function ProductTable() {

  const authtoken =
    localStorage.getItem(localStorage.getItem("user_phone") + "_token") || ""

  const [patterns, setPatterns] = useState<any[]>([])
  const [fabrics, setFabrics] = useState<any[]>([])
  const [fits, setFits] = useState<any[]>([])
  const [rows, setRows] = useState<ProductRow[]>([])

  const items = ["T Shirt", "Jeans", "Pant", "Shirt"]
  const genders = ["Mens", "Womens", "Kids"]

  const brands = ["Nike", "Puma", "Zara"]
  const categories = ["Casual", "Sports", "Formal"]

  useEffect(() => {
    fetchData("/util/patterns", setPatterns)
    fetchData("/util/fabrics", setFabrics)
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

  // ADD ROW

  const addRow = () => {

    const defaultSize = { price: 0, quantity: 0 }

    setRows([
      ...rows,
      {
        id: uuidv4(),
        item: "",
        brand: "",
        category: "",
        gender: "",
        fabric: "",
        pattern: "",
        fit: "",
        description: "",
        frontImage: null,
        backImage: null,
        barcode: "",
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
      },
    ])
  }

  // UPDATE FIELD

  const updateField = (index: number, field: string, value: any) => {

    const updated = [...rows]
    ; (updated[index] as any)[field] = value
    setRows(updated)
  }

  // UPDATE SIZE PRICE

  const updatePrice = (index: number, size: keyof Sizes, value: number) => {

    const updated = [...rows]

    updated[index].sizes[size].price = value

    setRows(updated)
  }

  // UPDATE SIZE QUANTITY

  const updateQty = (index: number, size: keyof Sizes, value: number) => {

    const updated = [...rows]

    updated[index].sizes[size].quantity = value

    setRows(updated)
  }

  // IMAGE UPLOAD

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

  // SAVE PRODUCT

  const saveRow = async (index: number) => {

    const row = rows[index]

    let imageUrl = ""
    let videoUrl = ""

    if (row.frontImage) imageUrl = await uploadToS3(row.frontImage)
    if (row.backImage) videoUrl = await uploadToS3(row.backImage)

    // convert sizes to API format

    const size_data = Object.entries(row.sizes)
      .filter(([_, v]) => v.quantity > 0)
      .map(([size, v]) => ({
        size: size.toUpperCase(),
        price: v.price,
        quantity: v.quantity
      }))

    const body = {

      app_user_id: Number(localStorage.getItem("app_user_id")),
      store_id: Number(localStorage.getItem("store_id")),

      brand: row.brand,
      item_name: row.item,
      category: row.category,
      gender: row.gender,

      item_image: imageUrl,
      item_video: videoUrl,

      fabric: row.fabric,
      fit: row.fit,

      size_data,

      product_description: row.description
    }

    const res = await fetch(`${API_BASE}/admin/add-product`, {

      method: "POST",

      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authtoken
      },

      body: JSON.stringify(body)

    })

    const result = await res.json()

    if (result.status === "success") {

      const updated = [...rows]

      updated[index].barcode = result.data

      setRows(updated)

      alert("Saved Successfully")
    }
  }

  // PRINT BARCODE LABELS
const printLabels = (row: ProductRow) => {

  if (!row.barcode) {
    alert("Please save product first to generate barcode")
    return
  }

  const win = window.open("", "_blank")

  let html = `
  <html>
  <head>

  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

  <style>

  @page{
    size:101.6mm 50mm;
    margin:0;
  }

  body{
    margin:0;
    padding:0;
  }

  .label{
    width:101.6mm;
    height:50mm;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    font-family:Arial;
    page-break-after:always;
  }

  .item{
    font-size:14px;
    font-weight:bold;
  }

  .details{
    font-size:12px;
    text-align:center;
  }

  .price{
    font-size:14px;
    font-weight:bold;
    margin-top:2px;
  }

  svg{
    margin-top:4px;
  }

  </style>

  </head>

  <body>
  `

  Object.entries(row.sizes).forEach(([size, data]: any) => {

    if (data.quantity > 0) {

      for (let i = 0; i < data.quantity; i++) {

        const id = `barcode_${Date.now()}_${i}`

        html += `

        <div class="label">

          <div class="item">${row.item}</div>

          <div class="details">
            Brand: ${row.brand}<br/>
            Size: ${size.toUpperCase()}<br/>
            Fabric: ${row.fabric}
          </div>

          <svg id="${id}"></svg>

          <div class="price">₹${data.price}</div>

        </div>

        <script>

        JsBarcode("#${id}", "${row.barcode}", {
          format:"CODE128",
          width:3,
          height:60,
          displayValue:true,
          fontSize:16
        });

        </script>

        `
      }

    }

  })

  html += `

  <script>
  setTimeout(()=>{
    window.print()
  },500)
  </script>

  </body>
  </html>

  `

  win!.document.write(html)
  win!.document.close()
}

  // DUPLICATE ROW

  const duplicateRow = (row: ProductRow) => {

    const newRow = {
      ...row,
      id: uuidv4(),
      barcode: "",
      frontImage: null,
      backImage: null
    }

    setRows([...rows, newRow])
  }

  return (

    <div className="p-6">

      <div className="overflow-auto border rounded-xl">

        <table className="min-w-full text-center border text-sm">

          <thead className="bg-gray-100">

            <tr>

              <th>Item</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Gender</th>
              <th>Fabric</th>
              <th>Pattern</th>
              <th>Fit</th>

              <th>Front</th>
              <th>Back</th>

              {["XS","S","M","L","XL","XXL","3XL","4XL"].map(size=>(
                <th key={size}>{size}<br/>Price / Qty</th>
              ))}

              <th>Description</th>
              <th>Barcode</th>
              <th>Save</th>
              <th>Clone</th>
              <th>Print</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row,i)=>(

              <tr key={row.id} className="border-t text-center">

                <td>

                  <select onChange={(e)=>updateField(i,"item",e.target.value)}>

                    <option>Select</option>

                    {items.map(v=><option key={v}>{v}</option>)}

                  </select>

                </td>

                <td>

                  <select onChange={(e)=>updateField(i,"brand",e.target.value)}>

                    <option>Select</option>

                    {brands.map(v=><option key={v}>{v}</option>)}

                  </select>

                </td>

                <td>

                  <select onChange={(e)=>updateField(i,"category",e.target.value)}>

                    <option>Select</option>

                    {categories.map(v=><option key={v}>{v}</option>)}

                  </select>

                </td>

                <td>

                  <select onChange={(e)=>updateField(i,"gender",e.target.value)}>

                    <option>Select</option>

                    {genders.map(v=><option key={v}>{v}</option>)}

                  </select>

                </td>

                <td>

                  <select onChange={(e)=>updateField(i,"fabric",e.target.value)}>

                    <option>Select</option>

                    {fabrics.map((f:any)=>(

                      <option key={f.id}>{f.name}</option>

                    ))}

                  </select>

                </td>

                <td>

                  <select onChange={(e)=>updateField(i,"pattern",e.target.value)}>

                    <option>Select</option>

                    {patterns.map((p:any)=>(

                      <option key={p.id}>{p.name}</option>

                    ))}

                  </select>

                </td>

                <td>

                  <select onChange={(e)=>updateField(i,"fit",e.target.value)}>

                    <option>Select</option>

                    {fits.map((f:any)=>(

                      <option key={f.id}>{f.name}</option>

                    ))}

                  </select>

                </td>

                <td>

                  <input type="file"
                  onChange={(e)=>updateField(i,"frontImage",e.target.files?.[0])}/>

                </td>

                <td>

                  <input type="file"
                  onChange={(e)=>updateField(i,"backImage",e.target.files?.[0])}/>

                </td>

                {Object.keys(row.sizes).map((size)=>(

                  <td key={size} className="p-1">

                    <input
                      type="number"
                      placeholder="Price"
                      className="w-16 border text-center mb-1"
                      value={row.sizes[size as keyof Sizes].price}
                      onChange={(e)=>updatePrice(i,size as keyof Sizes,Number(e.target.value))}
                    />

                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-16 border text-center"
                      value={row.sizes[size as keyof Sizes].quantity}
                      onChange={(e)=>updateQty(i,size as keyof Sizes,Number(e.target.value))}
                    />

                  </td>

                ))}

                <td>

                  <textarea
                  className="border w-28"
                  onChange={(e)=>updateField(i,"description",e.target.value)}
                  />

                </td>

                <td className="text-xs">{row.barcode}</td>

                <td>

                  <button
                  onClick={()=>saveRow(i)}
                  className="text-green-600">

                  Save

                  </button>

                </td>

                <td>

                  <button
                  onClick={()=>duplicateRow(row)}
                  className="text-blue-600">

                  Clone

                  </button>

                </td>

                <td>

                  <button
                  onClick={()=>printLabels(row)}
                  className="text-purple-600">

                  Print

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <button
        onClick={addRow}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">

        Add Row

      </button>

    </div>

  )
}