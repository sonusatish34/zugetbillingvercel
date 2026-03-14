"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
const Login = ({ role = "user" }) => {
  const router = useRouter();

  useEffect(() => {
    const userRoleId = localStorage.getItem('user_role_id');
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/approval-login' && userRoleId === '5') {
        return;
      } else if (window.location.pathname === '/' && userRoleId === '3') {
        return;
      }
      else {
        localStorage.clear();
      }
    }
  }, []);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [approvalteam, setApprovalTeam] = useState("");
  const [error, setError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpValidated, setOtpValidated] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendotp, setResendOtp] = useState(0);
  const [selectedRole, setSelectedRole] = useState("guest");

  useEffect(() => {
    function clearLocalStorageIfNewDay() {
      const storedTimestamp = window.localStorage.getItem("login_time");

      if (storedTimestamp) {
        const storedDate = new Date(parseInt(storedTimestamp));
        const currentDate = new Date();

        const storedDateStr = storedDate.toDateString();
        const currentDateStr = currentDate.toDateString();

        if (storedDateStr !== currentDateStr) {
          window.localStorage.clear();
          console.log("New day detected. LocalStorage cleared.");
        } else {
          console.log("Same day. No action taken.");
        }
      } else {
        console.log("No stored login time found.");
      }
    }

    clearLocalStorageIfNewDay();
    const usermobile = window.localStorage.getItem("user_phone");
    const usertoken = usermobile
      ? window.localStorage.getItem(`${usermobile}_token`)
      : null;

    if (usermobile && usertoken) {
      // Already logged in
      router.push("/");
      return;
    }

    // Not logged in, set role data
    if (role === "approval") {
      setApprovalTeam("7");
      window.localStorage.setItem("user_role_id", "8");
    } else {
      setApprovalTeam("7");
      window.localStorage.setItem("user_role_id", "8");
    }

    window.localStorage.setItem("login_time", Date.now().toString());
  }, [router, role]);

  useEffect(() => {
    const handleOtpResend = async () => {
      if (phoneNumber.length === 10) {
        await sendOtp();
      } else {
        setError("Please enter a valid phone number");
      }
    };
    if (resendotp) {
      handleOtpResend();
    }
  }, [resendotp, phoneNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    if (value !== "" && index < 3) {
      (document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement)?.focus();
    }

    setOtp(newOtp);
    setOtpError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        (otpInputRefs.current[index - 1] as HTMLInputElement)?.focus();
      }
    }

    if (e.key === "Enter") {
      if (otp.join("").length === 4) {
        validateOtp();
      } else {
        setOtpError("Please enter a valid 4-digit OTP.");
      }
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

  const sendOtp = async () => {
    const url = `https://api.zuget.com/admin/send-otp`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: phoneNumber,
          role_id: 8,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        const roleId = data?.data?.app_user_data?.role_id;
        const userId = data?.data?.app_user_data?._id;

        window.localStorage.setItem("user_role_id", roleId);
        window.localStorage.setItem("app_user_id", userId);
        setOtpSuccess(true);
        setError("");
      } else {
        setError(data?.message);
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("An error occurred while sending OTP.");
    }
  };

  const validateOtp = async () => {
    const url = `https://api.zuget.com/admin/otp-validate`;
    const userroleid = window.localStorage.getItem("user_role_id");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otp.join(""),
          mobile_number: phoneNumber,
          role_id: userroleid,
          redirect: "follow"
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setOtpValidated(true);
        window.localStorage.setItem("user_phone", phoneNumber);
        window.localStorage.setItem(`${phoneNumber}_token`, data.jwt_token);
        router.push("/");
      } else {
        setOtpError("Invalid OTP.");
      }
    } catch (err) {
      console.error("Error validating OTP:", err);
      setOtpError("An error occurred while validating OTP.");
    }
  };

  const mobilenofocus = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (mobilenofocus.current) {
      mobilenofocus.current.focus();
    }
  }, [])

  useEffect(() => {
    if (otpSuccess && otpInputRefs.current[0]) {
      (otpInputRefs.current[0] as HTMLInputElement).focus();
    }
  }, [otpSuccess]);
  let ref = useRef(0);

  function handleClick() {
    console.log("clcied");

    ref.current = ref.current + 1;
  };

  // useEffect(() => {
  //   prevCount.current = count;
  // }, [count]);
  return (
    <div
      className="min-h-screen w-full flex justify-center items-center p-4 sm:p-0"
      style={{
        backgroundImage: "url('/loginscreen.webp')",
        backgroundSize: "cover",
        backgroundPosition: "bottom"
      }}
    >
      <div>

      </div>
      <div className="flex flex-col md:flex-row w-full md:w-auto justify-center items-center gap-0">
        <div className="bg-black h-32 sm:h-40 md:h-96 lg:h-96 w-full md:w-80 lg:w-96 md:rounded-l-md rounded-tl-md rounded-tr-md  md:rounded-tr-none">
          <Image className="h-32 sm:h-40 md:h-96 lg:h-full w-full md:w-80 lg:w-96 object-cover" width={1000} height={1000} src={'/logo.webp'} alt="Logo" />
        </div>

        {!otpSuccess ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-7 justify-center items-start bg-white dark:bg-black dark:text-white h-auto md:h-96 lg:h-96 w-full md:w-80 lg:w-md px-4 sm:px-6 md:px-8 lg:px-14 py-6 md:py-6 md:rounded-r-md rounded-br-md rounded-bl-md md:rounded-bl-none shadow-lg"
          >
            <p className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">
              {role === "approval" && "Approval Team"}
            </p>
            <p className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black dark:text-white">
              Please Login!
            </p>
            <input
              ref={mobilenofocus}
              type="text"
              value={phoneNumber}
              onChange={(e) => {
                const formattedValue = e.target.value.replace(/[^0-9]/g, "");
                if (formattedValue.length <= 10) {
                  setPhoneNumber(formattedValue);
                  setError("");
                }
              }}
              className="rounded-lg outline-none bg-gray-100 dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm sm:placeholder:text-base text-base sm:text-lg md:text-xl py-3 sm:py-4 px-3 sm:px-4 tracking-wider w-full"
              placeholder="Enter your WhatsApp number"
              maxLength={10}
            />
            {error && (
              <p className="text-xs sm:text-sm md:text-base text-red-400">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 sm:py-3 md:py-4 rounded-md cursor-pointer transition font-medium text-sm sm:text-base"
            >
              Send WhatsApp OTP
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 justify-center items-start bg-white dark:bg-black dark:text-white h-32 sm:h-40 md:h-[500px] lg:h-96 w-full md:w-80 lg:w-96 px-4 sm:px-6 md:px-8 py-6 md:py-6 md:rounded-r-md rounded-br-md rounded-bl-md md:rounded-bl-none shadow-lg text-black">
            <p className="font-bold text-sm sm:text-base md:text-lg flex gap-x-2 items-center">
              <span>WhatsApp OTP</span>
              <FaWhatsapp className="text-green-600 size-5 sm:size-6" />
            </p>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-black dark:text-white">{phoneNumber}</p>
            <div className="py-3 sm:py-4 md:py-6 text-black dark:text-white w-full">
              <div className="flex justify-center gap-1 sm:gap-2 md:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) otpInputRefs.current[index] = el;
                    }}
                    id={`otp-input-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    maxLength={1}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-center text-lg sm:text-xl md:text-2xl border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (otp.join("").length === 4) {
                  validateOtp();
                } else {
                  setOtpError("Please enter a valid 4-digit OTP.");
                }
              }}
              className="w-full px-4 py-2 sm:py-3 md:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md cursor-pointer text-base sm:text-lg md:text-xl font-medium transition"
            >
              Login
            </button>
            {otpError && (
              <p className="text-xs sm:text-sm text-red-500 pt-2">{otpError}</p>
            )}
            <div className="flex justify-between pt-3 w-full text-xs sm:text-sm gap-4">
              <span
                onClick={() => {
                  setOtpSuccess(false);
                  setOtp(["", "", "", ""]);
                }}
                className="underline cursor-pointer hover:text-purple-600 transition"
              >
                Change Number
              </span>
              <span
                onClick={() => {
                  setResendOtp(resendotp + 1);
                }}
                className="underline cursor-pointer hover:text-purple-600 transition"
              >
                Resend OTP
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
