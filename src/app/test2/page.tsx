"use client";

import { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    let buffer = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      // show every key coming from scanner
      console.log("KEY:", e.key);

      // ENTER = scan finished
      if (e.key === "Enter") {
        console.log("✅ SCAN COMPLETE:", buffer);
        console.log("Length:", buffer.length);
        console.log("-------------------------");

        buffer = ""; // reset
        return;
      }

      // collect characters only
      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="p-10 text-xl">
      Open Console (F12) and scan barcode…
    </div>
  );
}
