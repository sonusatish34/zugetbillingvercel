'use client'
import { useState, ChangeEvent } from "react";

export default function AddStoreForm() {

  const [storeName, setStoreName] = useState<string>("");
  const [gstNumber, setGstNumber] = useState<string>("");

  const [mallImage, setMallImage] = useState<string | null>(null);
  const [topImages, setTopImages] = useState<(string | null)[]>([null, null, null, null]);
  const [gstFile, setGstFile] = useState<File | null>(null);

  const handleMallImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setMallImage(URL.createObjectURL(file));
  };

  const handleTopImage = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const newImages = [...topImages];
    newImages[index] = URL.createObjectURL(file);

    setTopImages(newImages);
  };

  const handleGSTUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setGstFile(e.target.files[0]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-6xl mx-auto">

      <h2 className="text-lg font-semibold mb-6">Add Store</h2>

      {/* Inputs */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          type="text"
          placeholder="Store Name"
          className="border rounded-lg px-4 py-3 w-full outline-none"
        />

        <button className="border rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50">
          <span className="text-lg">+</span> Add Location
        </button>

        <input
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          type="text"
          placeholder="GST Number"
          className="border rounded-lg px-4 py-3 w-full outline-none"
        />

        <label className="border rounded-lg px-4 py-3 flex items-center justify-center cursor-pointer bg-gray-50">
          <span className="text-green-600 text-sm font-medium">
            Upload Image
          </span>

          <input
            type="file"
            className="hidden"
            onChange={handleGSTUpload}
          />
        </label>

      </div>


      {/* Image Section */}
      <div className="grid grid-cols-2 gap-6">

        {/* Mall Image */}
        <div>

          <p className="text-sm mb-2">Add Shopping Mall Front Image</p>

          <label className="relative block h-48 rounded-xl overflow-hidden border cursor-pointer">

            {mallImage ? (
              <img
                src={mallImage}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-3xl text-gray-500">
                +
              </div>
            )}

            <input
              type="file"
              className="hidden"
              onChange={handleMallImage}
            />

          </label>

        </div>


        {/* Top 4 Images */}
        <div>

          <p className="text-sm mb-2">Add Any top 4 Images</p>

          <div className="grid grid-cols-4 gap-3">

            {topImages.map((img, index) => (

              <label
                key={index}
                className="relative h-48 rounded-xl overflow-hidden border cursor-pointer"
              >

                {img ? (
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-3xl text-gray-500">
                    +
                  </div>
                )}

                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleTopImage(index, e)}
                />

              </label>

            ))}

          </div>

        </div>

      </div>


      {/* Bottom Buttons */}
      <div className="flex gap-6 mt-8">

        <button className="flex-1 border-2 border-purple-500 text-purple-600 py-3 rounded-xl font-medium hover:bg-purple-50">
          Call Customer Support
        </button>

        <button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 rounded-xl font-medium">
          Call Relationship Manager
        </button>

      </div>

    </div>
  );
}