/* ==========================================================================
   STRIDE. Confirmation.js
   ========================================================================== */

function fireConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#D7FF3F", "#FF4B2B", "#0B0B0C", "#F7F5EF"];
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const size = 6 + Math.random() * 6;
    piece.style.width = size + "px";
    piece.style.height = size * 0.4 + "px";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

function buildReceiptHTML(order) {
  const itemRows = order.items
    .map((line) => {
      const p = findProduct(line.productId);
      if (!p) return "";
      return `
        <tr>
          <td style="padding:14px 0; border-bottom:1px solid #E5E1D8;">
            <div style="font-weight:600; font-size:14px;">${p.name}</div>
            <div style="font-size:12px; color:#8A8578; margin-top:2px;">${lineDescriptor(line)} &middot; Qty ${line.qty}</div>
          </td>
          <td style="padding:14px 0; border-bottom:1px solid #E5E1D8; text-align:right; font-family:'Courier New',monospace; font-size:14px; white-space:nowrap;">${formatPrice(p.price * line.qty)}</td>
        </tr>`;
    })
    .join("");

  const rows = [["Subtotal", formatPrice(order.subtotal)]];
  if (order.discount > 0) rows.push([`Promo (${order.promoCode})`, "\u2212" + formatPrice(order.discount)]);
  rows.push(["Shipping", order.shipping === 0 ? "Free" : formatPrice(order.shipping)]);
  rows.push(["Tax", formatPrice(order.tax)]);
  if (order.creditApplied > 0) rows.push(["Stride Credit applied", "\u2212" + formatPrice(order.creditApplied)]);
  if (order.giftCodeApplied > 0) rows.push([`Gift card (${order.giftCode})`, "\u2212" + formatPrice(order.giftCodeApplied)]);

  const totalsRows = rows
    .map(([label, val]) => `<tr><td style="padding:4px 0; color:#5C584D; font-size:13px;">${label}</td><td style="padding:4px 0; text-align:right; font-family:'Courier New',monospace; font-size:13px;">${val}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt ${order.id}. Stride</title>
<style>
  * { box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; color:#0B0B0C; max-width:640px; margin:0 auto; padding:56px 40px; background:#fff; }
  .brand { font-size:26px; font-weight:800; letter-spacing:-0.02em; }
  .brand span { color:#8FA31E; }
  .meta { color:#8A8578; font-size:13px; margin-top:6px; }
  .divider { border:none; border-top:2px solid #0B0B0C; margin:28px 0; }
  table { width:100%; border-collapse:collapse; }
  .totals { width:260px; margin-left:auto; margin-top:18px; }
  .grand { display:flex; justify-content:space-between; padding-top:14px; margin-top:10px; border-top:2px solid #0B0B0C; font-weight:800; font-size:18px; }
  .footer { margin-top:48px; padding-top:20px; border-top:1px solid #E5E1D8; color:#8A8578; font-size:12px; line-height:1.7; }
  @media print { body{ padding:20px 0; } }
</style></head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
    <div>
      <div class="brand">Stride<span>.</span></div>
      <div class="meta">Receipt</div>
    </div>
    <div style="text-align:right;">
      <div style="font-weight:700; font-family:'Courier New',monospace;">${order.id}</div>
      <div class="meta">${new Date(order.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
  </div>

  <hr class="divider">

  <div style="display:flex; justify-content:space-between; font-size:13px; color:#5C584D;">
    <div><strong style="color:#0B0B0C;">Billed to</strong><br>${order.name || ""}<br>${order.email || ""}</div>
    <div style="text-align:right;"><strong style="color:#0B0B0C;">Paid</strong><br>Total ${formatPrice(order.total)}</div>
  </div>

  <table style="margin-top:32px;">${itemRows}</table>

  <table class="totals">${totalsRows}</table>
  <div class="grand"><span>Total</span><span>${formatPrice(order.total)}</span></div>

  <div class="footer">
    Stride. Shoes built for the days you actually wear them.<br>
    Questions about this order? justixxchiobi@gmail.com
  </div>
</body></html>`;
}

function downloadReceipt() {
  const order = JSON.parse(localStorage.getItem("stride-last-order") || "null");
  if (!order) return;
  const win = window.open("", "_blank");
  if (!win) { toast("Allow pop-ups to download the receipt"); return; }
  win.document.write(buildReceiptHTML(order));
  win.document.close();
  win.onload = () => win.print();
}

document.addEventListener("DOMContentLoaded", () => {
  const order = JSON.parse(localStorage.getItem("stride-last-order") || "null");
  if (order) {
    document.getElementById("order-number").textContent = "#" + order.id;
    document.getElementById("order-email").textContent = order.email || "your email";
    document.getElementById("order-total").textContent = formatPrice(order.total);
    const trackWrap = document.getElementById("order-tracking-wrap");
    if (trackWrap && typeof trackingHTML === "function") {
      trackWrap.innerHTML = `<p class="font-mono text-[10px] uppercase text-ink-soft mb-4 text-left">Order status</p>${trackingHTML(order)}`;
    }
  }
  requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById("check-wrap")?.classList.add("check-ready")));
  setTimeout(fireConfetti, 350);
  document.getElementById("download-receipt-btn")?.addEventListener("click", downloadReceipt);
});
