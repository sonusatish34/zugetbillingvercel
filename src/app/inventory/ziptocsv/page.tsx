"use client";

import { useEffect, useState } from "react";
import { FileUp, ChevronRight, Download, ImageDown } from "lucide-react";

type UploadItem = {
  _id: number;
  filename: string;
  status: string;
  xlsx_link: string;
  created_on: string;
};
function formatDateTime(dateString: string) {
  const date = new Date(dateString.replace(" ", "T"));

  const day = date.getDate();
  const year = date.getFullYear();
  const seconds = date.getSeconds();

  const month = date.toLocaleString("en-US", { month: "short" });

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12;

  const formattedMinutes = minutes.toString().padStart(2, "0");

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getOrdinal(day)} ${month} ${year} ${formattedHours}:${formattedMinutes} ${ampm} ${seconds} seconds`;
}

export default function UploadZipPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const token =
    "YOUR_TOKEN_HERE"; // 🔥 Replace with dynamic token (localStorage if needed)

  // ✅ Fetch Uploaded Files



  const fetchUploads = async () => {
    try {
      const res = await fetch(
        "https://api.zuget.com/admin/uploaded-zips",
        {
          headers: {
            Authorization: localStorage.getItem(`${localStorage.getItem("user_phone")}_token`) || "",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setUploads(data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // ✅ Upload ZIP/CSV
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch(
        "https://api.zuget.com/admin/upload-zip",
        {
          method: "POST",
          headers: {
            Accept: "application/json",

            Authorization: localStorage.getItem(`${localStorage.getItem("user_phone")}_token`) || "",
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        alert(data.message);
        fetchUploads();
        setFile(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const latestUpload = uploads[0];
  const previousUploads = uploads.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-8">
        {/* ================= Upload Box ================= */}
        <div
          className="border-2 border-dashed border-purple-400 
          rounded-2xl p-8 flex flex-col items-center 
          justify-center bg-white cursor-pointer hover:bg-purple-50 transition"
        >

          <label className="font-semibold text-lg cursor-pointer">
            <p className="flex flex-col items-center justify-center gap-y-2"><ImageDown size={28} />  Upload Images in ZIP Format</p>
            <input
              type="file"
              accept=".zip,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {file && (
            <p className="mt-3 text-sm text-gray-500">
              Selected: {file.name}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* ================= Recent Upload ================= */}
        {latestUpload && (
          <div>
            <h2 className="font-semibold text-lg mb-3">
              Recent Upload
            </h2>

            <UploadCard item={latestUpload} />
          </div>
        )}

        {/* ================= Previous Uploads ================= */}
        {previousUploads.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-3">
              Previous Uploaded
            </h2>

            <div className="space-y-3">
              {previousUploads.map((item) => (
                <UploadCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= Upload Card Component =================
function UploadCard({ item }: { item: UploadItem }) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm 
      flex justify-between items-center hover:shadow-md transition"
    >
      <div>
        <p className="font-medium text-gray-800">
          {item.filename}
        </p>
        <p className="text-sm text-gray-500">
          {formatDateTime(item.created_on)}
        </p>
        <p
          className={`text-xs mt-1 ${item.status === "processed"
            ? "text-green-600"
            : "text-yellow-600"
            }`}
        >
          {item.status}
        </p>
      </div>

      <a
        href={item.xlsx_link}
        target="_blank"
        className="p-2 rounded-full bg-purple-600  flex items-center gap-x-2 text-white hover:scale-90"
      >
        <Download size={20} className="" />
        <button>Sample File</button>
      </a>
    </div>
  );
}