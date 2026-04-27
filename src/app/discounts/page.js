"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import AddDiscountForm from "@/components/AddDiscountForm";
import DiscountsTable from "@/components/DiscountsTable";
import DiscountComboManager from "@/components/DiscountComboManager";
// import { log } from "console";
// import Layout from "@/components/Layout/Layout";
const BASE_URL = "https://dev.zuget.com/admin";
// var APP_USER_ID = 148;
// var STORE_ID = 24;

export default function DiscountsPage() {
    const [STORE_ID, setSTORE_ID] = useState(localStorage.getItem('store_id'))
    const [APP_USER_ID, setAPP_USER_ID] = useState(localStorage.getItem('app_user_id'))
    const [tokenAuth, setAuthToken] = useState(localStorage.getItem(`${localStorage.getItem('user_phone')}_token`));
    const [status, setStatus] = useState('active');
    const [activeDiscounts, setActiveDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [storeList, setStoreList] = useState([]);
    // const [storeId, setStoreId] = useState(0);
    // const [appUserId, setAppUserId] = useState(0);
    console.log(tokenAuth, "tokenAuth");


    const fetchDiscountsStatus = async (statustext = status) => {
        setStatus(statustext);
        try {
            const res = await axios.get(`${BASE_URL}/${statustext}-discounts?app_user_id=${APP_USER_ID}&store_id=${STORE_ID}`, {
                headers: { Authorization: tokenAuth },
            });
            setActiveDiscounts(res.data?.data || []);
        } catch (error) { setActiveDiscounts([]); }
    };

    // useEffect(() => { if (tokenAuth) fetchDiscountsStatus('active'); }, [tokenAuth]);

    const handleUpdateStatus = (id, newStatus) => {
        axios.put(`${BASE_URL}/update-discount-status`, {
            app_user_id: APP_USER_ID, store_id: STORE_ID, discount_id: id, status: newStatus
        }, { headers: { Authorization: tokenAuth } })
            .then((res) => {
                if (res.data.status === "success") {
                    Swal.fire({
                        title: 'Success!',
                        text: res.data.message + ` to ${newStatus}`,
                        icon: 'success', timer: 2500, toast: true, position: 'top-end',
                    });
                    fetchDiscountsStatus('active');
                }
            }).catch(() => alert("Failed to update status"));    
    };

    const handleUpdateDiscount = async (id, buffer) => {
        setLoading(true);
        try {
            const payload = {
                app_user_id: APP_USER_ID,
                store_id: STORE_ID,
                discount_id: Number(id),
                ...buffer,
                min_order_value: Number(buffer.min_order_value || 0)
            };
            await axios.put(`${BASE_URL}/update-discount`, payload, {
                headers: { 'Authorization': tokenAuth, 'Content-Type': 'application/json' }
            });
            alert("Updated Successfully!");
            fetchDiscountsStatus();
        } finally { setLoading(false); }
    };


    return (

        <div className="py-4 px-1 bg-white min-h-screen text-[13px] text-gray-700 font-sans">
           
            <h1 className="text-xl font-bold mb-4">← Discounts</h1>

            {/* Component 1: Add Discount */}
            <AddDiscountForm
                tokenAuth={tokenAuth}
                app_user_id={APP_USER_ID}
                store_id={STORE_ID}
                onSuccess={() => fetchDiscountsStatus('active')}
            />

            <h2 className="text-sm font-bold mb-4 capitalize">{status} Discounts</h2>

            {/* Status Tabs */}
            <div className="flex gap-x-5 py-4 text-md font-semibold">
                {['active', 'inactive', 'deleted'].map(s => (
                    <button key={s}
                        className={`${status === s ? 'border-b-4 border-purple-500' : ''} cursor-pointer capitalize`}
                        onClick={() => fetchDiscountsStatus(s)}>
                        {s === 'inactive' ? 'Paused' : s === 'deleted' ? 'Closed' : 'Active'}
                    </button>
                ))}
            </div>

            {/* Component 2: List of Discounts */}
            {/* <DiscountsTable
                discounts={activeDiscounts}
                loading={loading}
                onUpdateStatus={handleUpdateStatus}
                onUpdateDiscount={handleUpdateDiscount}
                status={status}
            />
            <DiscountComboManager
                tokenAuth={tokenAuth}
                app_user_id={APP_USER_ID}
                store_id={STORE_ID}
                availableDiscounts={activeDiscounts} // Passes current fetched discounts
            /> */}
        </div>

    );
}