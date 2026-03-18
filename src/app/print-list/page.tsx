"use client";
import { useEffect, useState } from "react";
import React from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const API_BASE = "https://dev.zuget.com";

export default function PrintListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem((localStorage.getItem("user_phone") || "") + "_token") || "" : "";

  const fetchItems = async () => {
    const params = new URLSearchParams(window.location.search);
    const listId = params.get("list_id");
    if (!listId) return;

    const res = await fetch(`${API_BASE}/admin/list-items?list_id=${listId}`, {
      headers: { Authorization: token, accept: "application/json" },
    });
    const data = await res.json();
    const flattened = data.data.flatMap((entry: any) => entry.item_details);
    setItems(flattened);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  // START EDITING
  const handleEditClick = (item: any) => {
    setEditingId(item._id);
    setEditFormData({ ...item }); // Clone the item data into the form state
  };

  // UPDATE API CALL
  const handleUpdate = async (itemId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/update-product?item_id=${itemId}`, {
        method: "PUT",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          brand: editFormData.brand,
          item_name: editFormData.item_name,
          item_category: editFormData.item_category,
          gender: editFormData.gender,
          color: editFormData.color,
          category: editFormData.category,
          fit: editFormData.fit,
          size_data: editFormData.size_data,
          product_description: editFormData.product_description,
          // Keep existing images/videos if not changing
          item_image: editFormData.item_image,
          item_video: editFormData.item_video,
        }),
      });

      const result = await res.json();
      if (result.status === "success") {
        alert("Product updated successfully!");
        setEditingId(null);
        fetchItems(); // Refresh the list
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  if (loading) return <div className="p-10 text-center text-purple-600 font-bold">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage List Items</h1>
      <div className="overflow-auto border rounded-xl shadow-sm">
        <table className="min-w-full text-center border text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-3">Item Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Color</th>
              <th>Barcode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50 transition-colors">
                {editingId === item._id ? (
                  // --- EDIT MODE ROW ---
                  <>
                    <td className="p-2"><input className="border rounded px-2 py-1 w-full" value={editFormData.item_name} onChange={(e) => setEditFormData({...editFormData, item_name: e.target.value})} /></td>
                    <td><input className="border rounded px-2 py-1 w-full" value={editFormData.brand} onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})} /></td>
                    <td><input className="border rounded px-2 py-1 w-full" value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} /></td>
                    <td><input className="border rounded px-2 py-1 w-full" value={editFormData.color} onChange={(e) => setEditFormData({...editFormData, color: e.target.value})} /></td>
                    <td className="text-gray-400">{item.barcode}</td>
                    <td className="flex justify-center gap-2 p-2">
                      <button onClick={() => handleUpdate(item._id)} className="bg-green-600 text-white p-2 rounded hover:bg-green-700" title="Save"><FaSave /></button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500" title="Cancel"><FaTimes /></button>
                    </td>
                  </>
                ) : (
                  // --- VIEW MODE ROW ---
                  <>
                    <td className="p-3 font-medium">{item.item_name}</td>
                    <td>{item.brand}</td>
                    <td>{item.category}</td>
                    <td>{item.color}</td>
                    <td className="font-mono text-xs">{item.barcode}</td>
                    <td className="p-2">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(item)} className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200" title="Edit Item"><FaEdit /></button>
                        <button className="bg-purple-100 text-purple-600 px-3 py-1 rounded hover:bg-purple-200 text-xs font-bold">Print</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}