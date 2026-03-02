"use client";
import { useEffect } from "react";

const DownloadRedirect: React.FC = () => {
  useEffect(() => {
    const userAgent: string =
      navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
      window.location.replace(
        "https://play.google.com/store/apps/details?id=com.zuget.customer_app"
      );
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      window.location.replace(
        "https://apps.apple.com/in/app/zuget/id6756003689"
      );
    } else {
      // Desktop or unknown device
      window.location.replace("https://google.com");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Redirecting to Zuget...</h2>
      <p>Please wait while we take you to the app store.</p>
    </div>
  );
};

export default DownloadRedirect;