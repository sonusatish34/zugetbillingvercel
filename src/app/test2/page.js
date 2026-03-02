"use client";

import { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    let buffer = "";

    const handleKeyDown = (e) => {
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
// "use client"
// import React from 'react'
// const GrandChildA = ({ text }) => { // I need text
// 	return (
// 		<div>
// 			<h1> Grand Child A </h1>
// 			<p> {text} </p>
// 		</div>
// 	)
// }

// const ChildA = ({ text }) => { // I don't need text
// 	return (
// 		<div>
// 			<h1> Child A </h1>
// 			<GrandChildA text={text} />
// 		</div>
// 	)
// }

// const ParentA = ({ text }) => { // I don't need text
// 	return (
// 		<div>
// 			<h1> Parent A </h1>
// 			<ChildA text={text} />
// 		</div>
// 	)
// }

// const ChildB = ({ text }) => { // I need the text
// 	return (
// 		<div>
// 			<h1> Child B </h1>
// 			<p> {text} </p>
// 		</div>
// 	)
// }

// const ParentB = ({ text }) => { // I don't need text
// 	return (
// 		<div>
// 			<h1> Parent B </h1>
// 			<ChildB text={text} />
// 		</div>
// 	)
// }

// const App = () => {
// 	const text = "Hello World";

// 	return (
// 		<div>
// 			<h1> App </h1>
// 			<ParentA text={text} />
// 			<ParentB text={text} />
// 		</div>
// 	)
// }
// export default App