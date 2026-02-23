import JsBarcode from "jsbarcode";

export function generateBarcode(sku: string, label: string) {
  const canvas = document.createElement("canvas");

  JsBarcode(canvas, sku, {
    format: "CODE128",
    height: 50,
    fontSize: 12,
    text: label,
    textMargin: 6,
    marginTop: 8,
  });

  return canvas.toDataURL("image/png");
}