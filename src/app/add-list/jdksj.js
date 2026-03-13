import { useState } from "react";

export default function ItemSelect({ i, updateField }) {

  const [items, setItems] = useState(["T Shirt", "Jeans", "Pant", "Shirt"]);
  const [search, setSearch] = useState("");

  const filtered = items.filter(v =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => {
    if (!search.trim()) return;
    if (!items.includes(search)) {
      setItems([...items, search]);
    }
    updateField(i, "item", search);
  };

  return (
    <div style={{ position: "relative", width: "200px" }}>

      <input
        value={search}
        placeholder="Search item"
        onChange={(e) => {
          setSearch(e.target.value);
          updateField(i, "item", e.target.value);
        }}
        style={{ width: "100%", padding: "6px" }}
      />

      {search && !items.includes(search) && (
        <button
          onClick={addItem}
          style={{
            position: "absolute",
            right: "-60px",
            top: "0px"
          }}
        >
          Add
        </button>
      )}

      <div
        style={{
          border: "1px solid #ccc",
          maxHeight: "120px",
          overflowY: "auto"
        }}
      >
        {filtered.map((v) => (
          <div
            key={v}
            onClick={() => {
              setSearch(v);
              updateField(i, "item", v);
            }}
            style={{
              padding: "5px",
              cursor: "pointer"
            }}
          >
            {v}
          </div>
        ))}
      </div>

    </div>
  );
}