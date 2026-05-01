"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Login = ({ role = "user" }) => {
  const router = useRouter();
  
  // --- New Loading State ---
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendotp, setResendOtp] = useState(0);

  // Existing useEffect for Auth/Role Logic
  useEffect(() => {
    const userRoleId = localStorage.getItem('user_role_id');
    if (typeof window !== 'undefined') {
      if (!(window.location.pathname === '/approval-login' && userRoleId === '5') && 
          !(window.location.pathname === '/' && userRoleId === '3')) {
        localStorage.clear();
      }
    }
  }, []);

  // Send OTP Logic
  const sendOtp = async () => {
    setLoading(true); // Start Loading
    const url = `https://dev.zuget.com/admin/send-otp`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: phoneNumber, role_id: 8 }),
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        window.localStorage.setItem("user_role_id", data?.data?.app_user_data?.role_id);
        window.localStorage.setItem("app_user_id", data?.data?.app_user_data?._id);
        setOtpSuccess(true);
        setError("");
      } else {
        setError(data?.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("An error occurred while sending OTP.");
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  // Validate OTP Logic
  const validateOtp = async () => {
    setLoading(true); // Start Loading
    const url = `https://dev.zuget.com/admin/otp-validate`;
    const userroleid = window.localStorage.getItem("user_role_id");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otp.join(""),
          mobile_number: phoneNumber,
          role_id: userroleid,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        window.localStorage.setItem("user_phone", phoneNumber);
        window.localStorage.setItem(`${phoneNumber}_token`, data.jwt_token);
        router.push("/");
      } else {
        setOtpError("Invalid OTP.");
      }
    } catch (err) {
      setOtpError("An error occurred while validating OTP.");
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phoneNumber.length === 10) {
      await sendOtp();
    } else {
      setError("Please enter a valid phone number");
    }
  };

  // Helper for Button Content
  const ButtonLoader = () => (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Processing...</span>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center p-4 sm:p-0"
      style={{ backgroundImage: "url('/loginscreen.webp')", backgroundSize: "cover", backgroundPosition: "bottom" }}
    >
      <div className="flex flex-col md:flex-row w-full md:w-auto justify-center items-center">
        <div className="bg-black h-32 sm:h-40 md:h-96 lg:h-96 w-full md:w-80 lg:w-96 rounded-t-md md:rounded-l-md md:rounded-tr-none">
          <Image className="h-full w-full object-cover" width={1000} height={1000} src={'/logo.webp'} alt="Logo" />
        </div>

        {!otpSuccess ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center items-start bg-white dark:bg-black p-8 h-auto md:h-96 w-full md:w-80 lg:w-96 shadow-lg rounded-b-md md:rounded-r-md md:rounded-bl-none">
            <p className="font-bold text-2xl text-black dark:text-white">Please Login!</p>
            <input
              type="text"
              value={phoneNumber}
              disabled={loading}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none"
              placeholder="WhatsApp number"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition disabled:opacity-50"
            >
              {loading ? <ButtonLoader /> : "Send WhatsApp OTP"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 justify-center items-start bg-white dark:bg-black p-8 h-auto md:h-96 w-full md:w-80 lg:w-96 shadow-lg rounded-b-md md:rounded-r-md md:rounded-bl-none">
            <p className="font-bold flex items-center gap-2 text-black dark:text-white">
              OTP Sent to {phoneNumber} <FaWhatsapp className="text-green-600" />
            </p>
            <div className="flex gap-2 justify-start w-full">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[index] = e.target.value.replace(/[^0-9]/g, "");
                    setOtp(newOtp);
                    if (e.target.value && index < 3) (document.getElementById(`otp-${index + 1}`) as HTMLElement).focus();
                  }}
                  id={`otp-${index}`}
                  className="w-12 h-12 text-center border rounded-lg dark:bg-gray-700 dark:text-white"
                />
              ))}
            </div>
            <button
              onClick={validateOtp}
              disabled={loading || otp.join("").length < 4}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition disabled:opacity-50"
            >
              {loading ? <ButtonLoader /> : "Login"}
            </button>
            {otpError && <p className="text-red-500 text-sm">{otpError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
