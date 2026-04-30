"use client";
import { useState } from "react";
import { Pencil, Pause, XCircle, Check, X, CircleCheck, Percent, IndianRupee, ShoppingBag, Wallet } from "lucide-react";
import Image from "next/image";

const DISCOUNT_OPTIONS = {
    "Price Based": ["Percentage Discount", "Flat Discount", "Cart Value Discount", "Tiered / Slab Discount", "Max Discount Cap"],
    "Quantity Based": ["Buy X Get Y", "Combo Offer", "Milestone Discount"],
    "Cashback Based": ["Wallet Cashback", "Tiered Wallet Cashback"],
    "Loyalty Based": ["VIP Discount", "Loyalty Tier Cashback", "Milestone Reward"],
    "Item Gift": ["Free Gift Item"]
};

// Helper to get the correct icon based on discount type
const getIcon = (type) => {
    if (type?.includes("Percentage")) return <Percent className="text-white" size={24} />;
    if (type?.includes("Flat") || type?.includes("Price")) return <IndianRupee className="text-white" size={24} />;
    if (type?.includes("Buy") || type?.includes("Quantity")) return <ShoppingBag className="text-white" size={24} />;
    return <Wallet className="text-white" size={24} />;
};

const getIconBg = (type) => {
    if (type?.includes("Percentage")) return "bg-green-600";
    if (type?.includes("Flat")) return "bg-orange-500";
    if (type?.includes("Buy")) return "bg-blue-500";
    return "bg-yellow-500";
};

export default function DiscountsCards({ discounts, onUpdateStatus, onUpdateDiscount, loading, status }) {
    const [inlineEditingId, setInlineEditingId] = useState(null);
    const [editBuffer, setEditBuffer] = useState({});

    const startEdit = (item) => {
        setInlineEditingId(item._id || item.discount_id);
        setEditBuffer({ ...item, min_order_value: item.min_order_value || 0 });
    };

    return (
        <div className="w-full">
            <h2 className="text-lg font-bold mb-4 capitalize">{status === 'inactive' ? 'Paused' : status === 'deleted' ? 'Closed' : 'Active'} Discounts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {discounts.map((d) => {
                    const isEditing = inlineEditingId === (d._id || d.discount_id);
                    
                    return (
                        <div key={d._id || d.discount_id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                            {/* Card Header: Icon and Edit */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-full ${getIconBg(d.discount_type)} shadow-inner`}>
                                    {getIcon(d.discount_type)}
                                </div>
                                <button onClick={() => startEdit(d)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <Pencil size={20} />
                                </button>
                            </div>

                            {/* Card Body */}
                            <div className="space-y-2 mb-6">
                                <h3 className="font-bold text-gray-800 text-base">{d.discount_type || d.offer_name}</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="text-gray-400">Offer On :</span> {d.offer_on}</p>
                                    <p><span className="text-gray-400">Gender :</span> {d.gender}</p>
                                    <p><span className="text-gray-400">Minimum Order Value :</span> {d.min_order_value || "N/A"}</p>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-purple-600 font-semibold text-sm">value : {d.discount}</span>
                                    {d.image_link && (
                                        <a target="_blank" href={d.image_link} className="text-xs text-gray-500 underline hover:text-purple-600"><Image alt="view image" src={d.image_link} width={50} height={50}/></a>
                                    )}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                {status === 'active' && (
                                    <>
                                        <button 
                                            onClick={() => onUpdateStatus(d._id, "deleted")}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                        >
                                            <XCircle size={16} /> Close Offer
                                        </button>
                                        <button 
                                            onClick={() => onUpdateStatus(d._id, "inactive")}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-purple-100 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                                        >
                                            <Pause size={16} /> Pause Offer
                                        </button>
                                    </>
                                )}

                                {(status === 'inactive' || status === 'deleted') && (
                                    <>
                                         <button 
                                            onClick={() => onUpdateStatus(d._id, "deleted")}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                        >
                                            <XCircle size={16} /> Close Offer
                                        </button>
                                        <button 
                                            onClick={() => onUpdateStatus(d._id, "active")}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-green-100 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                                        >
                                            <CircleCheck size={16} /> Active Offer
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Simple Inline Edit Overlay (Optional) */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-white z-10 p-5 rounded-xl border-2 border-purple-400">
                                    <h4 className="font-bold mb-2">Edit Discount</h4>
                                    <input 
                                        className="w-full border p-2 mb-2 rounded text-sm" 
                                        value={editBuffer.discount} 
                                        onChange={(e) => setEditBuffer({...editBuffer, discount: e.target.value})}
                                        placeholder="Discount Value"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => {onUpdateDiscount(d._id, editBuffer); setInlineEditingId(null);}} className="bg-green-600 text-white p-2 rounded flex-1"><Check size={16} className="mx-auto"/></button>
                                        <button onClick={() => setInlineEditingId(null)} className="bg-gray-400 text-white p-2 rounded flex-1"><X size={16} className="mx-auto"/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}