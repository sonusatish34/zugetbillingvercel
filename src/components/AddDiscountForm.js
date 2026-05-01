"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import Select from 'react-select';

const CATEGORIES = ["Price Based", "Bundle", "Cashback", "Loyalty", "Item Gift"];
const DISCOUNT_OPTIONS = {
    "Price Based": ["Percentage", "Flat"],
    "Cashback": ["Cashback", "Tiered"],
    "Bundle": ["Buy X Get Y", "Combo"],
    "Loyalty": ["Loyalty"],
    "Item Gift": ["Item Gift"]
};

export default function AddDiscountForm({ tokenAuth, app_user_id, store_id, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [activeCategory, setActiveCategory] = useState("Price Based");
    const fileInputRef = useRef(null);

    const [createForm, setCreateForm] = useState({
        offer_name: "", offer_on: "All Items", gender: "all", discount_type: "Percentage",
        min_order_value: "", discount: "", min_order_value_type: "",
        buy_x: "1", buy_y: "1", item_1_offer_on: "All Items", buy_item_1: "",
        item_2_offer_on: "All Items", buy_item_2: "", combo_price: "",
        only_for: null, type: "amount",
    });

    // Helper to keep original state update logic clean
    const updateForm = (updates) => setCreateForm(prev => ({ ...prev, ...updates }));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://dev.zuget.com/util/item_name_list`, {
                    headers: { Accept: "application/json", Authorization: tokenAuth },
                });
                const json = await res.json();
                setItemList(json?.data?.results || []);
            } catch (err) { console.error("Fetch Error", err); }
        };
        fetchData();
    }, [tokenAuth]);

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        const defaultSub = DISCOUNT_OPTIONS[cat] ? DISCOUNT_OPTIONS[cat][0] : "";
        updateForm({ discount_type: defaultSub });
    };


    const handleAddOffer = async () => {
        const isCombo = createForm.discount_type === "Combo";
        const isBuyXGetY = createForm.discount_type === "Buy X Get Y";
        const isLoyalty = createForm.discount_type === "Loyalty";

        setLoading(true);
        try {
            let finalImageLink = "https://cdn.techjockey.com/blog/wp-content/uploads/2022/03/09165130/wifi-connection-test-1024x536.jpg";
            if (fileInputRef.current?.files[0]) {
                const formdata = new FormData();
                formdata.append("file", fileInputRef.current.files[0]);
                const res = await fetch(`https://dev.zuget.com/s3/image-file`, {
                    method: "POST", headers: { Authorization: tokenAuth }, body: formdata,
                });
                const result = await res.json();
                finalImageLink = result?.data?.image_link || result?.image_link;
            }

            let finalOfferOn = createForm.offer_on;
            let finalDiscount = createForm.discount;
            let finalMinOrder = createForm.min_order_value;
            let finalMinOrderType = createForm.min_order_value_type;

            if (isCombo) {
                finalOfferOn = JSON.stringify({
                    item_1_offer_on: createForm.item_1_offer_on,
                    buy_item_1: createForm.buy_item_1,
                    item_2_offer_on: createForm.item_2_offer_on,
                    buy_item_2: createForm.buy_item_2,
                    combo_price: Number(createForm.combo_price)
                });
                finalMinOrder = 0;
            } else if (isBuyXGetY) {
                finalDiscount = `buy ${createForm.buy_x} get ${createForm.buy_y}`;
                finalMinOrder = 0;
            } else if (isLoyalty) {
                finalMinOrderType = 'after_n_order';
            }

            const payload = {
                app_user_id: Number(app_user_id),
                store_id: Number(store_id),
                offer_name: createForm.offer_name,
                offer_type: activeCategory.toLowerCase(),
                offer_on: finalOfferOn,
                only_for: createForm.only_for,
                gender: createForm.gender,
                discount_type: createForm.discount_type.toLowerCase(),
                image_link: finalImageLink,
                discount: String(finalDiscount),
                min_order_value: Number(finalMinOrder) || 0,
                min_order_value_type: finalMinOrderType
            };

            const response = await axios.post('https://dev.zuget.com/admin/add-discount', payload, {
                headers: { 'Authorization': tokenAuth, 'Content-Type': 'application/json' }
            });

            if (response.status === 200 || response.status === 201) {
                setCreateForm({
                    offer_name: "", offer_on: "All Items", gender: "all", discount_type: "Percentage",
                    min_order_value: "", discount: "", min_order_value_type: "",
                    buy_x: "1", buy_y: "1", item_1_offer_on: "All Items", buy_item_1: "",
                    item_2_offer_on: "All Items", buy_item_2: "", combo_price: "",
                    only_for: null, type: "amount",
                });
                Swal.fire({ icon: 'success', title: 'Success!', timer: 2000, showConfirmButton: false });
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add discount.' });
        } finally { setLoading(false); }
    };

    // Shared UI classes
    const headerClass = "text-[12px] font-bold text-[#1e293b] py-4 px-4 whitespace-nowrap";
    const inputClass = "w-full border border-gray-100 rounded-md px-3 py-2 text-[13px] h-11 outline-none focus:border-purple-300 transition-colors bg-gray-50/30";

    const isCombo = createForm.discount_type === "Combo";
    const isBuyXGetY = createForm.discount_type === "Buy X Get Y";
    const isTiered = createForm.discount_type === "Tiered";
    const isLoyalty = createForm.discount_type === "Loyalty";
    const isItemGift = createForm.discount_type === "Item Gift";

    // Common Select Component to avoid repeat logic
    // Common Select Component
    const ItemSelect = ({ valKey }) => {
        // 1. Map the current string value in state to an object for the UI
        const currentValue = createForm[valKey];
        const selectedOption = currentValue === 'all'
            ? { value: 'all', label: 'All Items' }
            : { value: currentValue, label: currentValue };

        return (
            <div className="px-4 z-50">
                <Select
                    // 2. Pass the mapped object to the value prop
                    value={currentValue ? selectedOption : null}
                    options={[
                        { value: 'all', label: 'All Items' },
                        ...itemList.map(i => ({ value: i.name, label: i.name }))
                    ]}
                    onChange={(opt) => updateForm({ [valKey]: opt ? opt.value : 'all' })}
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            </div>
        );
    };

    const GenderSelect = () => (
        <div className="px-4">
            <select className={inputClass} value={createForm.gender || "all"} onChange={e => updateForm({ gender: e.target.value })}>
                {["all", "Men", "Women", "Unisex", "Kids"].map(g => <option key={g} value={g}>{g === 'all' ? 'For All' : g}</option>)}
            </select>
        </div>
    );

    return (
        <div className="mb-10 font-sans w-full">
            <div className="flex flex-wrap gap-3 mb-6">
                {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => handleCategoryClick(cat)} className={`flex items-center justify-between border rounded-md px-4 py-2 text-[13px] min-w-[150px] ${activeCategory === cat ? 'border-purple-500 text-purple-600 font-bold' : 'text-gray-500'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="mb-6 flex items-center gap-4">
                <span className="text-[12px] font-bold text-gray-400 uppercase">Select {activeCategory} Type:</span>
                <div className="flex gap-2">
                    {DISCOUNT_OPTIONS[activeCategory]?.map((opt) => (
                        <button key={opt} onClick={() => updateForm({ discount_type: opt })} className={`px-4 py-1.5 rounded-full text-[12px] border ${createForm.discount_type === opt ? 'bg-purple-600 text-white' : 'bg-white'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                {/* Headers */}
                <div className={`grid ${isCombo ? 'grid-cols-8' : isBuyXGetY ? 'grid-cols-7' : 'grid-cols-7'} bg-gray-50/80 border-b border-gray-200`}>
                    <div className={headerClass}>Offer Name</div>
                    {!isCombo && <div className={headerClass}>Offer On</div>}
                    {isCombo ? (
                        <>
                            <div className={headerClass}>Item 1 Offer On</div><div className={headerClass}>Buy Item 1</div>
                            <div className={headerClass}>Item 2 Offer On</div><div className={headerClass}>Buy Item 2</div>
                            <div className={headerClass}>Combo Price</div>
                        </>
                    ) : isBuyXGetY ? (
                        <><div className={headerClass}>Gender</div><div className={headerClass}>Buy X</div><div className={headerClass}>Buy Y</div></>
                    ) : (
                        <>
                            <div className={headerClass}>Gender</div>
                            <div className={headerClass}>{isTiered ? "Offer for" : isLoyalty ? "Cashback" : isItemGift ? "Item Name" : "Add Discount"}</div>
                            <div className={headerClass}>{isLoyalty ? "After N Orders" : "Min Order Value"}</div>
                        </>
                    )}
                    <div className={headerClass}>Marketing Image</div>
                    <div className={headerClass}>Save Discount</div>
                </div>

                {/* Form Row */}
                <div className={`grid ${isCombo ? 'grid-cols-8' : isBuyXGetY ? 'grid-cols-7' : 'grid-cols-7'} items-center py-5`}>
                    <div className="px-4">
                        <input className={inputClass} placeholder="Offer Name" value={createForm.offer_name} onChange={e => updateForm({ offer_name: e.target.value })} />
                    </div>

                    {isCombo ? (
                        <>
                            <ItemSelect valKey="offer_on" />
                            <div className="px-4">
                                <select className={inputClass} onChange={e => updateForm({ buy_item_1: e.target.value })}>
                                    <option value="">Select Item</option>
                                    {itemList.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                </select>
                            </div>
                            <ItemSelect valKey="offer_on" />
                            <div className="px-4">
                                <select className={inputClass} onChange={e => updateForm({ buy_item_2: e.target.value })}>
                                    <option value="">Select Item</option>
                                    {itemList.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                </select>
                            </div>
                            <div className="px-4"><input className={inputClass} type="number" value={createForm.combo_price} onChange={e => updateForm({ combo_price: e.target.value })} /></div>
                        </>
                    ) : isBuyXGetY ? (
                        <>
                            <ItemSelect valKey="offer_on" />
                            <GenderSelect />
                            <div className="px-4"><select className={inputClass} value={createForm.buy_x} onChange={e => updateForm({ buy_x: e.target.value })}>{[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                            <div className="px-4"><select className={inputClass} value={createForm.buy_y} onChange={e => updateForm({ buy_y: e.target.value })}>{[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        </>
                    ) : (
                        <>
                            <ItemSelect valKey="offer_on" />
                            <GenderSelect />
                            <div className="flex px-4 items-center">
                                <input
                                    className={inputClass}
                                    // Add || "" to ensure the value is never null
                                    value={(isTiered || isItemGift ? createForm.only_for : createForm.discount) || ""}
                                    onChange={e => updateForm({ [isTiered || isItemGift ? 'only_for' : 'discount']: e.target.value })}
                                />
                                {!isTiered && !isItemGift && !isLoyalty && <span className="ml-1">{createForm.discount_type === "Percentage" ? '%' : '₹'}</span>}
                            </div>
                            <div className="flex px-4">
                                {isLoyalty ? (
                                    <Select
                                        value={createForm.min_order_value ? { value: createForm.min_order_value, label: createForm.min_order_value } : null}
                                        options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({ value: i, label: i }))}
                                        onChange={(opt) => updateForm({ min_order_value: opt ? opt.value : '' })}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    />
                                ) : (
                                    <>
                                        <input className={inputClass} value={createForm.min_order_value} onChange={e => updateForm({ min_order_value: e.target.value })} />
                                        <select className="px-1 border border-l-0 rounded-r-md bg-gray-100" value={createForm.min_order_value_type} onChange={e => updateForm({ min_order_value_type: e.target.value })}>
                                            <option value="amount">Amt</option>
                                            <option value="quantity">Qty</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    <div className="px-4">
                        <button onClick={() => fileInputRef.current?.click()} className="text-[#10B981] font-bold text-[13px] flex items-center gap-2 justify-center w-full bg-green-50/50 py-2 rounded-md">
                            <ImageIcon size={16} /> Upload
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                    </div>
                    <div className="px-4">
                        <button onClick={handleAddOffer} disabled={loading} className="w-full bg-[#7C3AED] text-white py-2.5 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                            Add Offer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}