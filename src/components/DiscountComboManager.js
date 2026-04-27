"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Package, Edit3, X, Check, Search } from "lucide-react";
import Swal from 'sweetalert2';

export default function DiscountComboManager({ tokenAuth, app_user_id, store_id, availableDiscounts }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    const [loading, setLoading] = useState(false);

    // NEW: Track which specific combo is being edited inline
    const [inlineEditingId, setInlineEditingId] = useState(null);
    const [editBuffer, setEditBuffer] = useState([]);

    const fetchCombos = async () => {
        try {
            const res = await axios.get(`https://dev.zuget.com/admin/combined-discounts?app_user_id=${app_user_id}&store_id=${store_id}`, {
                headers: { Authorization: `${tokenAuth}` }
            });
            setCombinedData(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch combos", error);
        }
    };

    useEffect(() => {
        if (tokenAuth) fetchCombos();
    }, [tokenAuth]);

    // Handle Create (Top Form)
    const handleCreateCombo = async () => {
        if (selectedIds.length < 2) return Swal.fire("Info", "Select at least 2 discounts", "info");
        setLoading(true);
        try {
            await axios.post('https://dev.zuget.com/admin/store-combined-discounts', {
                app_user_id, store_id,
                discount_ids: selectedIds.map(Number)
            }, { headers: { Authorization: `${tokenAuth}` } });
            Swal.fire({ title: "Created!", icon: "success", timer: 1500, toast: true, position: 'top-end', showConfirmButton: false });
            setSelectedIds([]);
            fetchCombos();
        } catch (error) { Swal.fire("Error", "Failed to create", "error"); }
        finally { setLoading(false); }
    };

    // Handle Inline Update (Row Specific)
    const handleUpdateCombo = async (comboId) => {
        setLoading(true);
        try {
            await axios.put('https://dev.zuget.com/admin/update-combined-discounts', {
                combined_discount_id: Number(comboId), // This comboId comes from combo._id
                app_user_id,
                store_id,
                discount_ids: editBuffer.map(Number)
            }, {
                headers: {
                    Authorization: `${tokenAuth}`,
                    'Content-Type': 'application/json'
                }
            });

            // ... success logic ...
            setInlineEditingId(null);
            fetchCombos();
        } catch (error) {
            // ... error logic ...
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id, isEditMode = false) => {
        if (isEditMode) {
            setEditBuffer(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };

    return (
        <div className="mb-8 font-sans lg:py-10">
            {/* SECTION 1: CREATE NEW COMBO (Untouched) */}
            <h2 className="text-sm font-bold mb-2">Active Discounts Combo</h2>
            <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm mb-6">
                <div className="w-1/4 bg-gray-50 p-4 flex items-center border-r border-gray-200 font-medium text-xs">
                    Select Offer Combo
                </div>
                <div className="w-3/4 p-4 flex gap-4 items-center">
                    <div className="flex-1">
                        <div className="min-h-[40px] border border-gray-300 rounded px-2 py-1 flex flex-wrap gap-2 items-center bg-gray-50 text-[11px]">
                            {selectedIds.length === 0 && <span className="text-gray-400">Pick from list...</span>}
                            {selectedIds.map(id => (
                                <span key={id} className="bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 border border-purple-200">
                                    {availableDiscounts.find(d => (d._id || d.discount_id) === id)?.offer_name}
                                    <X size={12} className="cursor-pointer" onClick={() => toggleSelection(id)} />
                                </span>
                            ))}
                        </div>
                        <div className="mt-2 max-h-24 overflow-y-auto border border-gray-100 rounded text-[11px] bg-white">
                            {availableDiscounts.filter(d => d.status === 'active').map(d => (
                                <div key={d._id || d.discount_id} onClick={() => toggleSelection(d._id || d.discount_id)}
                                    className={`p-1.5 px-3 cursor-pointer border-b flex justify-between hover:bg-gray-50 ${selectedIds.includes(d._id || d.discount_id) ? 'bg-purple-50' : ''}`}>
                                    <span>{d.offer_name}</span>
                                    {selectedIds.includes(d._id || d.discount_id) && <Check size={12} className="text-purple-600" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleCreateCombo} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded font-bold text-xs h-[40px] flex items-center gap-2">
                        <Package size={16} /> {loading ? "..." : "Create Combo"}
                    </button>
                </div>
            </div>

            {/* SECTION 2: COMBINED LIST WITH INLINE EDIT */}
            {combinedData.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-3">Combined Offers List</h3>
                    <div className="flex flex-col gap-3">
                        {combinedData.map((combo, index) => {
                            // CHANGE: Use combo._id to match the Zuget API response
                            const isEditingThis = inlineEditingId === combo._id;

                            return (
                                <div key={combo._id} className={`p-3 border rounded-lg transition-all ${isEditingThis ? 'border-purple-500 bg-white ring-2 ring-purple-50' : 'border-blue-100 bg-white'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Combo #{index + 1}</span>
                                            <span className="text-[9px] text-gray-300">ID: {combo._id}</span>
                                        </div>

                                        {!isEditingThis ? (
                                            <button
                                                onClick={() => {
                                                    // CHANGE: Set the state using _id
                                                    setInlineEditingId(combo._id);
                                                    // Load existing discounts into the buffer
                                                    setEditBuffer(combo.discounts.map(d => d._id || d.discount_id));
                                                }}
                                                className="text-blue-500 hover:bg-blue-50 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"
                                            >
                                                <Edit3 size={14} /> EDIT
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateCombo(combo._id)} // Pass _id to the update function
                                                    disabled={loading}
                                                    className="text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-green-100"
                                                >
                                                    <Check size={14} /> {loading ? "..." : "SAVE"}
                                                </button>
                                                <button
                                                    onClick={() => setInlineEditingId(null)}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditingThis ? (
                                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-1 duration-200">
                                            {/* Left: Current Selection */}
                                            <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                                                <p className="text-[9px] font-bold text-gray-500 mb-2 uppercase">Selected in this Combo:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {editBuffer.map(id => (
                                                        <span key={id} className="bg-white border border-purple-200 text-purple-700 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 shadow-sm">
                                                            {availableDiscounts.find(d => (d._id || d.discount_id) === id)?.offer_name || `ID: ${id}`}
                                                            <Trash2 size={10} className="cursor-pointer text-red-400 hover:text-red-600" onClick={() => toggleSelection(id, true)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right: Available to Add */}
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-500 mb-2 uppercase">Available Offers:</p>
                                                <div className="max-h-28 overflow-y-auto border rounded bg-white text-[10px] shadow-inner">
                                                    {availableDiscounts.filter(d => d.status === 'active').map(d => {
                                                        const discId = d._id || d.discount_id;
                                                        const isAdded = editBuffer.includes(discId);
                                                        return (
                                                            <div
                                                                key={discId}
                                                                onClick={() => toggleSelection(discId, true)}
                                                                className={`p-1.5 px-3 cursor-pointer border-b flex justify-between hover:bg-gray-50 ${isAdded ? 'bg-purple-50' : ''}`}
                                                            >
                                                                <span className={isAdded ? "font-bold text-purple-700" : "text-gray-600"}>{d.offer_name}</span>
                                                                {isAdded ? <Check size={12} className="text-purple-600" /> : <Plus size={12} className="text-gray-300" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 py-1">
                                            {combo.discounts.map((item, i) => (
                                                <span key={i} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] rounded-full shadow-sm capitalize">
                                                    {item.offer_name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}