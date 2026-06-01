"use client";

import { useRef } from "react";
import { Printer, Download } from "lucide-react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  cartQuantity: number;
};

export type POSReceiptProps = {
  cart: CartItem[];
  subTotal: number;
  discountAmount: number;
  grandTotal: number;
  customerName: string;
  customerPhone?: string;
  paymentMethod: string;
  orderId: string | null;
  discountPercent?: number;
};

// ── Divider ────────────────────────────────────────────────────
function Divider({ style = "dashed", thick = false }: { style?: "dashed" | "solid"; thick?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        borderTopStyle: style,
        borderTopColor: "#333",
        borderTopWidth: thick ? 2 : 1,
        margin: "6px 0",
      }}
    />
  );
}

// ── Receipt Row ────────────────────────────────────────────────
function Row({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
        fontSize: large ? 13 : 10,
        fontWeight: large ? 900 : 800,
      }}
    >
      <span>{label}</span>
      <span style={{ textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

// ── The actual printable receipt ───────────────────────────────
function ReceiptContent({ cart, subTotal, discountAmount, grandTotal, customerName, customerPhone, paymentMethod, orderId, discountPercent }: POSReceiptProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      id="pos-receipt-content"
      style={{
        width: 302, // 80mm ≈ 302px at 96dpi
        fontFamily: "'Courier New', Courier, monospace",
        backgroundColor: "#fff",
        color: "#000",
        padding: "24px 16px",
        fontSize: 10,
        lineHeight: 1.5,
      }}
    >
      {/* LOGO / STORE NAME */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, marginBottom: 4 }}>
          CAM<span style={{ color: "#1d4ed8" }}>X</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#333", lineHeight: 1.6 }}>
          <div>187/B/1 Colombo – Horana Road</div>
          <div>Bokundara, Piliyandala, Sri Lanka</div>
          <div>Tel: +94 072 2 400 123</div>
          <div>info@camx.lk · www.camx.lk</div>
        </div>
      </div>

      <Divider style="dashed" />

      {/* RECEIPT TITLE */}
      <div style={{ textAlign: "center", fontSize: 11, fontWeight: 900, letterSpacing: 2, margin: "8px 0" }}>*** SALES RECEIPT ***</div>

      <Divider style="dashed" />

      {/* ORDER INFO */}
      <div style={{ margin: "8px 0" }}>
        <Row label="Order ID" value={orderId || "—"} />
        <Row label="Date" value={dateStr} />
        <Row label="Time" value={timeStr} />
        <Row label="Customer" value={customerName} />
        {customerPhone && <Row label="Phone" value={customerPhone} />}
        <Row label="Payment" value={paymentMethod} />
      </div>

      <Divider style="dashed" />

      {/* ITEMS HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 60px 60px",
          fontSize: 9,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginTop: 8,
          marginBottom: 4,
        }}
      >
        <span>ITEM</span>
        <span style={{ textAlign: "center" }}>Price</span>
        <span style={{ textAlign: "right" }}>AMOUNT</span>
      </div>

      <Divider style="dashed" />

      {/* ITEMS */}
      <div style={{ marginTop: 6 }}>
        {cart.map((item, i) => (
          <div key={item.productId} style={{ marginBottom: 6 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 60px",
                fontSize: 10,
                fontWeight: 800,
                marginBottom: 2,
                alignItems: "start",
              }}
            >
              <span style={{ paddingRight: 4, lineHeight: 1.4 }}>{item.name}</span>
              <span style={{ textAlign: "center" }}>{item.price.toLocaleString()}</span>
              <span style={{ textAlign: "right" }}>{(item.price * item.cartQuantity).toLocaleString()}</span>
            </div>
            {/* Centered Price x Qty = Total */}
            <div style={{ textAlign: "center", fontSize: 9, color: "#666", fontWeight: 600 }}>
              Rs {item.price.toLocaleString()} x {item.cartQuantity} = Rs {(item.price * item.cartQuantity).toLocaleString()}
            </div>
            {i < cart.length - 1 && <div style={{ borderTop: "1px dotted #ccc", margin: "6px 0" }} />}
          </div>
        ))}
      </div>

      <Divider style="solid" />

      {/* TOTALS */}
      <div style={{ margin: "6px 0" }}>
        <Row label="Subtotal" value={`Rs ${subTotal.toLocaleString()}`} />
        {discountAmount > 0 && <Row label={`Discount${discountPercent ? ` (${discountPercent}%)` : ""}`} value={`- Rs ${discountAmount.toLocaleString()}`} />}
      </div>

      <Divider style="solid" thick />

      <div style={{ margin: "8px 0" }}>
        <Row label="GRAND TOTAL" value={`Rs ${grandTotal.toLocaleString()}`} large />
      </div>

      <Divider style="dashed" />

      {/* ITEM COUNT SUMMARY */}
      <div style={{ fontSize: 9, color: "#555", fontWeight: 700, margin: "10px 0", textAlign: "center" }}>{cart.reduce((s, i) => s + i.cartQuantity, 0)} item(s) purchased</div>

      {/* BARCODE PLACEHOLDER */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div
          style={{
            display: "inline-flex",
            gap: 1.5,
            height: 36,
            alignItems: "flex-end",
            marginBottom: 4,
          }}
        >
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i % 3 === 0 ? 3 : i % 5 === 0 ? 2 : 1,
                height: i % 4 === 0 ? 36 : i % 2 === 0 ? 26 : 32,
                backgroundColor: "#000",
                borderRadius: 0.5,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 8, letterSpacing: 4, color: "#555", fontWeight: 600 }}>{orderId || "CAMX-000000"}</div>
      </div>

      <Divider style="dashed" />

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>★ THANK YOU! ★</div>
        <div style={{ fontSize: 9, color: "#555", fontWeight: 700, lineHeight: 1.7 }}>
          <div>Please retain this receipt for your records.</div>
          <div>Exchange within 7 days with receipt.</div>
          <div>No exchange on opened items.</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 10, fontWeight: 800 }}>www.camx.lk</div>
        <div style={{ marginTop: 2, fontSize: 8, color: "#999", fontWeight: 600 }}>Powered by CAMX POS v1.0</div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────
export default function POSReceipt(props: POSReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = document.getElementById("pos-receipt-content");
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=400,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt – ${props.orderId || "CAMX"}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #fff; display: flex; justify-content: center; }
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${content.outerHTML}
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = async () => {
    const content = document.getElementById("pos-receipt-content");
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=400,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt – ${props.orderId || "CAMX"}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #fff; display: flex; justify-content: center; }
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${content.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8 print:p-0 print:m-0">
      {/* ACTION BUTTONS (Print කරන විට සැඟවේ) */}
      <div className="flex w-full max-w-75.5 gap-3 print:hidden">
        <button onClick={handlePrint} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700">
          <Printer size={18} />
          Print
        </button>
        <button onClick={handleDownload} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50">
          <Download size={18} />
          Save PDF
        </button>
      </div>

      {/* RECEIPT PREVIEW */}
      <div ref={receiptRef} className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-neutral-200 print:rounded-none print:shadow-none print:ring-0">
        <ReceiptContent {...props} />
      </div>

      {/* Text (Print කරන විට සැඟවේ) */}
      <p className="text-xs font-semibold text-neutral-400 print:hidden">80mm thermal receipt format</p>
    </div>
  );
}
