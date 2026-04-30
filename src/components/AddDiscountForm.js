"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { PlusCircle, ChevronDown, Image as ImageIcon, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import Select from 'react-select';
export default function AddDiscountForm({ tokenAuth, app_user_id, store_id, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [itemList, setItemList] = useState([]);

    const categories = ["Price Based", "Bundle", "Cashback", "Loyalty", "Item Gift"];
    const discountOptions = {
        "Price Based": ["Percentage", "Flat"],
        "Cashback": ["Cashback", "Tiered"],
        "Bundle": ["Buy X Get Y", "Combo"],
        "Loyalty": ["Loyalty"],
        "Item Gift": ["Item Gift"]
    };

    const [activeCategory, setActiveCategory] = useState("Price Based");

    const [createForm, setCreateForm] = useState({
        offer_name: "",
        offer_on: "All Items",
        gender: "all",
        discount_type: "Percentage",
        min_order_value: "",
        discount: "",
        min_order_value_type: "",
        buy_x: "1",
        buy_y: "1",
        item_1_offer_on: "All Items",
        buy_item_1: "",
        item_2_offer_on: "All Items",
        buy_item_2: "",
        combo_price: "",
        // Added missing initial values for Tiered/Type selection
        only_for: null,
        type: "amount",
    });

    const fetchData = async () => {
        try {
            const res = await fetch(`https://dev.zuget.com/util/item_name_list`, {
                headers: { Accept: "application/json", Authorization: tokenAuth },
            });
            const json = await res.json();
            setItemList(json?.data?.results || []);
        } catch (err) { console.error("Fetch Error", err); }
    };


    useEffect(() => { fetchData(); }, []);

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        const defaultSub = discountOptions[cat] ? discountOptions[cat][0] : "";
        setCreateForm(prev => ({
            ...prev,
            discount_type: defaultSub,
            // min_order_value_type: cat === "Cashback" ? "cashback" : "amount"
        }));
    };

    const handleAddOffer = async () => {
        const isCombo = createForm.discount_type === "Combo";
        const isBuyXGetY = createForm.discount_type === "Buy X Get Y";

        setLoading(true);
        try {
            let finalImageLink = "https://cdn.techjockey.com/blog/wp-content/uploads/2022/03/09165130/wifi-connection-test-1024x536.jpg";
            if (fileInputRef.current?.files[0]) {
                const formdata = new FormData();
                formdata.append("file", fileInputRef.current.files[0]);
                const res = await fetch(`https://dev.zuget.com/s3/image-file`, {
                    method: "POST",
                    headers: { Authorization: tokenAuth },
                    body: formdata,
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
                finalDiscount = createForm.combo_price;
                finalMinOrder = 0;
            } else if (isBuyXGetY) {
                finalDiscount = `buy ${createForm.buy_x} get ${createForm.buy_y}`;
                finalMinOrder = 0;
            }
            else if (isLoyalty) {
                finalMinOrderType = 'after_n_order'
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
                Swal.fire({ icon: 'success', title: 'Success!', timer: 2000, showConfirmButton: false });
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add discount.' });
        } finally {
            setLoading(false);
            // window.location.reload()
        }
    };

    const headerClass = "text-[12px] font-bold text-[#1e293b] py-4 px-4 whitespace-nowrap";
    const inputClass = "w-full border border-gray-100 rounded-md px-3 py-2 text-[13px] h-11 outline-none focus:border-purple-300 transition-colors bg-gray-50/30";

    const isCombo = createForm.discount_type === "Combo";
    const isBuyXGetY = createForm.discount_type === "Buy X Get Y";
    const isTiered = createForm.discount_type === "Tiered";
    const isLoyalty = createForm.discount_type === "Loyalty";
    const isItemGift = createForm.discount_type === "Item Gift";
    console.log(createForm, 'csddddd');

    return (
        <div className="mb-10 font-sans w-full">
            <div className="flex flex-wrap gap-3 mb-6">
                {categories.map((cat) => (
                    <button key={cat} onClick={() => handleCategoryClick(cat)} className={`flex items-center justify-between border rounded-md px-4 py-2 text-[13px] min-w-[150px] ${activeCategory === cat ? 'border-purple-500 text-purple-600 font-bold' : 'text-gray-500'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="mb-6 flex items-center gap-4">
                <span className="text-[12px] font-bold text-gray-400 uppercase">Select {activeCategory} Type:</span>
                <div className="flex gap-2">
                    {discountOptions[activeCategory]?.map((opt, ind) => (
                        <button key={opt} onClick={() => setCreateForm({ ...createForm, discount_type: opt })} className={`px-4 py-1.5 rounded-full text-[12px] border ${createForm.discount_type === opt ? 'bg-purple-600 text-white' : 'bg-white'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <div className={`grid ${isCombo ? 'grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]' : isBuyXGetY ? 'grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_1fr_1fr]' : 'grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr]'} bg-gray-50/80 border-b border-gray-200`}>
                    <div className={headerClass}>Offer Name</div>
                    {!isCombo && <div className={headerClass}>Offer On</div>}
                    {isCombo && (
                        <>
                            <div className={headerClass}>Item 1 Offer On</div>
                            <div className={headerClass}>Buy Item 1</div>
                            <div className={headerClass}>Item 2 Offer On</div>
                            <div className={headerClass}>Buy Item 2</div>
                        </>
                    )}
                    {isBuyXGetY && (
                        <>
                            <div className={headerClass}>Gender</div>
                            <div className={headerClass}>Buy X</div>
                            <div className={headerClass}>Buy Y</div>
                        </>
                    )}
                    {!isBuyXGetY && !isCombo && !isTiered && !isLoyalty && (
                        <>
                            <div className={headerClass}>Gender</div>
                            <div className={headerClass}>Add Discount</div>
                            <div className={headerClass}>Min Order Value</div>
                        </>
                    )}
                    {isTiered && <><div className={headerClass}>Gender</div>
                        <div className={headerClass}>Offer for</div></>}
                    {isLoyalty && <><div className={headerClass}>Gender</div>
                        <div className={headerClass}>After N Orders</div>
                        <div className={headerClass}>Cashback</div>
                    </>}
                    {/* {isItemGift &&} */}
                    {isCombo && <div className={headerClass}>Combo Price</div>}
                    <div className={headerClass}>Marketing Image</div>
                    <div className={headerClass}>Save Discount</div>
                </div>

                <div className={`grid ${isCombo ? 'grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]' : isBuyXGetY ? 'grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_1fr_1fr]' : 'grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr]'} items-center py-5`}>
                    <div className="px-4">
                        <input placeholder={`${createForm.discount_type === "Percentage"
                            ? 'Eg: buy 2 get 10% off'
                            : createForm.discount_type === "Flat"
                                ? 'Buy for 2000 get Flat 500rs off'
                                : createForm.discount_type === "Buy X Get Y"
                                    ? 'eg: Buy 2 Get 2'
                                    : createForm.discount_type === "Combo"
                                        ? 'Eg: ₹50 Off'
                                        : 'None'
                            }`}
                            className={inputClass} value={createForm.offer_name || ""} onChange={e => setCreateForm({ ...createForm, offer_name: e.target.value })} />
                    </div>

                    {isCombo ? (
                        <>
                            <div className="px-4 z-50">
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Items' }, // Your static option
                                        ...itemList.map(i => ({ value: i.name, label: i.name })) // Your dynamic list
                                    ]}
                                    onChange={(opt) => setCreateForm({ ...createForm, offer_on: opt.value })}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4">
                                <select className={inputClass} value={createForm.buy_item_1 || ""} onChange={e => setCreateForm({ ...createForm, buy_item_1: e.target.value })}>
                                    <option value="">Select Item</option>
                                    {itemList.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                                </select>
                            </div>
                            <div className="px-4 z-50">
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Items' }, // Your static option
                                        ...itemList.map(i => ({ value: i.name, label: i.name })) // Your dynamic list
                                    ]}
                                    onChange={(opt) => setCreateForm({ ...createForm, offer_on: opt.value })}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4">
                                <select className={inputClass} value={createForm.buy_item_2 || ""} onChange={e => setCreateForm({ ...createForm, buy_item_2: e.target.value })}>
                                    <option value="">Select Item</option>
                                    {itemList.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                                </select>
                            </div>
                            <div className="px-4"><input className={inputClass} type="number" placeholder="2999" value={createForm.combo_price || ""} onChange={e => setCreateForm({ ...createForm, combo_price: e.target.value })} /></div>
                        </>
                    ) : isBuyXGetY ? (
                        <>
                            <div className="px-4 z-50">
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Items' }, // Your static option
                                        ...itemList.map(i => ({ value: i.name, label: i.name })) // Your dynamic list
                                    ]}
                                    onChange={(opt) => setCreateForm({ ...createForm, offer_on: opt.value })}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4"><select className={inputClass} value={createForm.gender || "all"} onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}>
                                <option value="all">For All </option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Unisex">Unisex</option>
                                <option value="Kids">Kids</option>
                            </select></div>
                            <div className="px-4">
                                <select className={inputClass} value={createForm.buy_x || "1"} onChange={e => setCreateForm({ ...createForm, buy_x: e.target.value })}>{[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}</select>
                            </div>
                            <div className="px-4"><select className={inputClass} value={createForm.buy_y || "1"} onChange={e => setCreateForm({ ...createForm, buy_y: e.target.value })}>{[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        </>
                    ) : isTiered ? (
                        <>
                            <div className="px-4 z-50">
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Items' }, // Your static option
                                        ...itemList.map(i => ({ value: i.name, label: i.name })) // Your dynamic list
                                    ]}
                                    onChange={(opt) => setCreateForm({ ...createForm, offer_on: opt.value })}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4"><select className={inputClass} value={createForm.gender || "all"} onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}>
                                <option value="all">For All</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Unisex">Unisex</option>
                                <option value="Kids">Kids</option>
                            </select></div>
                            <div className="flex px-4">
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={createForm.only_for || ""}
                                    onChange={e => setCreateForm({ ...createForm, only_for: e.target.value })}
                                />
                                <select
                                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 focus:outline-none"
                                    value={createForm.type || "silver"}
                                    onChange={e => setCreateForm({ ...createForm, only_for: e.target.value })}
                                >
                                    <option value="silver">Silver</option>
                                    <option value="gold">Gold</option>
                                </select>
                            </div>
                        </>
                    ) : isLoyalty ? (
                        <>
                            <div className="px-4 z-50">
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Items' }, // Your static option
                                        ...itemList.map(i => ({ value: i.name, label: i.name })) // Your dynamic list
                                    ]}
                                    onChange={(opt) => setCreateForm({ ...createForm, offer_on: opt.value })}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4"><select className={inputClass} value={createForm.gender || "all"} onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}>
                                <option value="all">For All</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Unisex">Unisex</option>
                                <option value="Kids">Kids</option>
                            </select></div>
                            <div className="px-4 z-50">
                                <Select
                                    // Corrected: Removed the extra outer brackets
                                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({ value: i, label: i }))}

                                    // Improved: Added 'opt &&' to prevent errors if the selection is cleared
                                    onChange={(opt) => setCreateForm({ ...createForm, min_order_value: opt ? opt.value : '' })}

                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4 z-50">
                                <input
                                    type="number"
                                    placeholder="eg: 500"
                                    className={inputClass}
                                    value={createForm.discount || ""}
                                    onChange={e => setCreateForm({ ...createForm, discount: e.target.value })}
                                />

                            </div>

                        </>
                    ) 
                    
                   : isItemGift ? (
                       <>
                            <div className="px-4 z-50">
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Items' }, // Your static option
                                        ...itemList.map(i => ({ value: i.name, label: i.name })) // Your dynamic list
                                    ]}
                                    onChange={(opt) => setCreateForm({ ...createForm, offer_on: opt.value })}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4"><select className={inputClass} value={createForm.gender || "all"} onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}>
                                <option value="all">For All</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Unisex">Unisex</option>
                                <option value="Kids">Kids</option>
                            </select></div>
                            <div className="flex px-4 items-center">
                                <input placeholder="kkk" className={inputClass} value={createForm.only_for || ""} onChange={e => setCreateForm({ ...createForm, only_for: e.target.value })} />
                                {/* <span className="ml-1">{createForm.discount_type === "Percentage" ? '%' : '₹'}</span> */}
                            </div>
                            <div className="flex px-4">
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={createForm.min_order_value || ""}
                                    onChange={e => setCreateForm({ ...createForm, min_order_value: e.target.value })}
                                />
                                <select
                                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 focus:outline-none"
                                    value={createForm.min_order_value_type}
                                    onChange={e => setCreateForm({ ...createForm, min_order_value_type: e.target.value })}
                                >
                                    <option value="amount">Amount</option>
                                    <option value="quantity">Quantity</option>
                                </select>
                            </div>
                        </>
                    ): (
                        <>
                            <div className="px-4 z-50">
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Items' }, // Your static option
                                        ...itemList.map(i => ({ value: i.name, label: i.name })) // Your dynamic list
                                    ]}
                                    onChange={(opt) => setCreateForm({ ...createForm, offer_on: opt.value })}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="px-4"><select className={inputClass} value={createForm.gender || "all"} onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}>
                                <option value="all">For All</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Unisex">Unisex</option>
                                <option value="Kids">Kids</option>
                            </select></div>
                            <div className="flex px-4 items-center">
                                <input placeholder="kkk" className={inputClass} value={createForm.discount || ""} onChange={e => setCreateForm({ ...createForm, discount: e.target.value })} />
                                <span className="ml-1">{createForm.discount_type === "Percentage" ? '%' : '₹'}</span>
                            </div>
                            <div className="flex px-4">
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={createForm.min_order_value || ""}
                                    onChange={e => setCreateForm({ ...createForm, min_order_value: e.target.value })}
                                />
                                <select
                                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 focus:outline-none"
                                    value={createForm.min_order_value_type}
                                    onChange={e => setCreateForm({ ...createForm, min_order_value_type: e.target.value })}
                                >
                                    <option value="amount">Amount</option>
                                    <option value="quantity">Quantity</option>
                                </select>
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