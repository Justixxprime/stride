/* ==========================================================================
   STRIDE. Checkout.js
   A three-step wizard: Shipping -> Payment -> Review. Adds two real
   mechanics on top of the base flow:
   - Promo codes (VALID_PROMOS below) that actually change the total.
   - Stride Credit (the gift-card balance from gift-cards.html) that can
     be applied at checkout and is actually deducted from the account
     when the order completes.
   Rewards points accrue on completion, and a receipt is emailed via
   Web3Forms if it's configured (see js/site.js).
   ========================================================================== */

let currentStep = 1;
const TOTAL_STEPS = 3;

const VALID_PROMOS = {
  WELCOME10: { type: "percent", value: 10, label: "10% off" },
  SAVE20: { type: "flat", value: 20, label: "$20 off" },
  FREESHIP: { type: "shipping", value: 0, label: "Free shipping" },
};

function getAllPromos() {
  let custom = {};
  try { custom = JSON.parse(localStorage.getItem("stride-custom-promos")) || {}; } catch {}
  return { ...VALID_PROMOS, ...custom };
}

let appliedPromo = null; // { code, ...VALID_PROMOS[code] }
let useGiftCredit = false;
let appliedGiftCode = null; // { code, balance } - a redeemable gift code being spent directly at checkout

function getGiftLedger() {
  try { return JSON.parse(localStorage.getItem("stride-giftcode-ledger")) || []; }
  catch { return []; }
}
function saveGiftLedger(ledger) {
  localStorage.setItem("stride-giftcode-ledger", JSON.stringify(ledger));
}

function computeTotals() {
  const cart = getCart();
  const subtotal = cartSubtotal();
  let shipping = subtotal > 100 ? 0 : 12;
  if (appliedPromo && appliedPromo.type === "shipping") shipping = 0;

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percent") discount = subtotal * (appliedPromo.value / 100);
    else if (appliedPromo.type === "flat") discount = Math.min(appliedPromo.value, subtotal);
  }

  const tax = (subtotal - discount) * 0.075;
  let total = subtotal - discount + shipping + tax;

  const acc = typeof currentAccount === "function" ? currentAccount() : null;
  const availableCredit = acc ? acc.giftCardBalance || 0 : 0;
  let creditApplied = 0;
  if (useGiftCredit && availableCredit > 0) {
    creditApplied = Math.min(availableCredit, total);
    total -= creditApplied;
  }

  let giftCodeApplied = 0;
  if (appliedGiftCode) {
    giftCodeApplied = Math.min(appliedGiftCode.balance, total);
    total -= giftCodeApplied;
  }

  return { cart, subtotal, shipping, discount, tax, total, creditApplied, availableCredit, giftCodeApplied };
}

function renderOrderSummary() {
  const cart = getCart();
  const wrap = document.getElementById("summary-lines");
  if (!wrap) return;
  if (!cart.length) {
    window.location.href = "shop.html";
    return;
  }
  wrap.innerHTML = cart
    .map((line) => {
      const p = findProduct(line.productId);
      if (!p) return "";
      return `
        <div class="flex items-center gap-3 py-3 border-b border-line">
          <div class="thumb-art tile w-14 h-14 shrink-0" style="background:${p.gradient}">
            ${p.image ? smartImgTag(p.image, p.name, 'loading="lazy"') : '<i class="fa-solid fa-gift thumb-fallback-icon"></i>'}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium leading-snug">${p.name}</p>
            <p class="font-mono text-[10px] text-ink-soft">${lineDescriptor(line)} &middot; Qty ${line.qty}</p>
          </div>
          <span class="font-mono text-sm font-bold shrink-0">${formatPrice(p.price * line.qty)}</span>
        </div>`;
    })
    .join("");

  const acc = typeof currentAccount === "function" ? currentAccount() : null;
  document.getElementById("gift-credit-row").classList.toggle("hidden", !acc || !acc.giftCardBalance);
  if (acc) document.getElementById("gift-credit-available").textContent = `(${formatPrice(acc.giftCardBalance || 0)} available)`;

  const { subtotal, shipping, discount, tax, total, creditApplied, giftCodeApplied } = computeTotals();
  document.getElementById("summary-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("summary-shipping").textContent = shipping === 0 ? "Free" : formatPrice(shipping);
  document.getElementById("summary-tax").textContent = formatPrice(tax);
  document.getElementById("summary-total").textContent = formatPrice(Math.max(0, total));

  const discountRow = document.getElementById("summary-discount-row");
  if (appliedPromo && discount > 0) {
    discountRow.classList.remove("hidden");
    document.getElementById("summary-discount-code").textContent = appliedPromo.code;
    document.getElementById("summary-discount").textContent = "\u2212" + formatPrice(discount);
  } else discountRow.classList.add("hidden");

  const creditRow = document.getElementById("summary-credit-row");
  if (creditApplied > 0) {
    creditRow.classList.remove("hidden");
    document.getElementById("summary-credit").textContent = "\u2212" + formatPrice(creditApplied);
  } else creditRow.classList.add("hidden");

  const giftCodeRow = document.getElementById("summary-giftcode-row");
  if (appliedGiftCode && giftCodeApplied > 0) {
    giftCodeRow.classList.remove("hidden");
    document.getElementById("summary-giftcode-code").textContent = appliedGiftCode.code;
    document.getElementById("summary-giftcode").textContent = "\u2212" + formatPrice(giftCodeApplied);
  } else giftCodeRow.classList.add("hidden");
}

function goToStep(n) {
  currentStep = n;
  document.querySelectorAll("[data-step]").forEach((el) => el.classList.toggle("hidden", Number(el.dataset.step) !== n));
  document.querySelectorAll(".step-dot").forEach((dot, i) => {
    const stepNum = i + 1;
    dot.classList.toggle("is-active", stepNum === n);
    dot.classList.toggle("is-done", stepNum < n);
    dot.innerHTML = stepNum < n ? '<i class="fa-solid fa-check text-[10px]"></i>' : stepNum;
  });
  document.querySelectorAll(".step-line").forEach((line, i) => line.classList.toggle("is-done", i + 1 < n));
  if (n === 3) renderReview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Fills in the review step: shipping address from step 1's fields, and
 * either the card's last 4 digits or, when a gift card/credit/promo has
 * covered the whole order, a note that no card is being charged. */
function renderReview() {
  const name = document.getElementById("ship-name")?.value || "";
  const address = document.getElementById("ship-address")?.value || "";
  const city = document.getElementById("ship-city")?.value || "";
  const postal = document.getElementById("ship-postal")?.value || "";
  const addressEl = document.getElementById("review-address");
  if (addressEl) addressEl.innerHTML = `${name}<br>${address}<br>${city} ${postal}`;

  const paymentEl = document.getElementById("review-payment");
  if (paymentEl) {
    const { total } = computeTotals();
    if (total <= 0) {
      paymentEl.innerHTML = '<span class="text-volt-dark"><i class="fa-solid fa-gift mr-1"></i>Fully covered by gift card / credit — no card charged</span>';
    } else {
      const num = (document.getElementById("card-number")?.value || "").replace(/\s/g, "");
      const last4 = num.slice(-4) || "4242";
      paymentEl.textContent = `•••• •••• •••• ${last4}`;
    }
  }
}

/** Detects Visa / Mastercard / Amex from the card number's leading
 * digits (the standard public IIN ranges) and highlights the matching
 * badge above the field, so it feels like a real checkout recognizing
 * the card as you type instead of always showing all three flat. */
function detectCardBrand(num) {
  if (/^4/.test(num)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(num)) return "mc";
  if (/^3[47]/.test(num)) return "amex";
  return null;
}
function initCardFormatting() {
  const numberInput = document.getElementById("card-number");
  const expiryInput = document.getElementById("card-expiry");
  const cvcInput = document.getElementById("card-cvc");
  const badges = { visa: document.getElementById("card-badge-visa"), mc: document.getElementById("card-badge-mc"), amex: document.getElementById("card-badge-amex") };
  const brandIcon = document.getElementById("card-brand-icon");
  const brandClass = { visa: "fa-cc-visa", mc: "fa-cc-mastercard", amex: "fa-cc-amex" };

  if (numberInput) {
    numberInput.addEventListener("input", () => {
      const digits = numberInput.value.replace(/\D/g, "").slice(0, 16);
      numberInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
      const brand = detectCardBrand(digits);
      Object.entries(badges).forEach(([key, el]) => el && el.classList.toggle("!bg-volt", key === brand));
      Object.entries(badges).forEach(([key, el]) => el && el.classList.toggle("!text-[#0B0B0C]", key === brand));
      if (brandIcon) {
        brandIcon.className = `fa-brands ${brand ? brandClass[brand] : "fa-credit-card"} absolute right-4 top-1/2 -translate-y-1/2 ${brand ? "text-ink" : "text-ink-soft"} text-lg`;
      }
    });
  }
  if (expiryInput) {
    expiryInput.addEventListener("input", () => {
      let digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
      if (digits.length >= 3) digits = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
      expiryInput.value = digits;
    });
  }
  if (cvcInput) {
    cvcInput.addEventListener("input", () => { cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, 4); });
  }
}

function validateStep(n) {
  const section = document.querySelector(`[data-step="${n}"]`);
  const required = section.querySelectorAll("[required]");
  for (const field of required) {
    if (!field.value.trim()) {
      field.focus();
      toast("Fill in every field before continuing");
      return false;
    }
  }
  if (n === 2) {
    const digits = (document.getElementById("card-number")?.value || "").replace(/\D/g, "");
    if (digits.length < 13) { toast("That card number looks too short"); return false; }
    const expiry = document.getElementById("card-expiry")?.value || "";
    if (!/^\d{2} \/ \d{2}$/.test(expiry)) { toast("Enter expiry as MM / YY"); return false; }
  }
  return true;
}

async function placeOrder() {
  const { cart, subtotal, shipping, discount, tax, total, creditApplied, giftCodeApplied } = computeTotals();
  const name = document.getElementById("ship-name")?.value || "";
  const email = document.getElementById("ship-email")?.value || "";

  const order = {
    id: "STR-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
    items: cart,
    subtotal, shipping, tax,
    promoCode: appliedPromo ? appliedPromo.code : null,
    discount,
    creditApplied,
    giftCode: appliedGiftCode ? appliedGiftCode.code : null,
    giftCodeApplied,
    total: Math.max(0, total),
    name, email,
  };
  const orders = JSON.parse(localStorage.getItem("stride-orders") || "[]");
  orders.unshift(order);
  localStorage.setItem("stride-orders", JSON.stringify(orders));
  localStorage.setItem("stride-last-order", JSON.stringify(order));

  // deduct Stride Credit and accrue Rewards points, if logged in
  const auth = typeof getAuth === "function" ? getAuth() : null;
  if (auth) {
    const acc = currentAccount();
    if (acc) {
      const updates = { points: (acc.points || 0) + Math.round(order.total) };
      if (creditApplied > 0) updates.giftCardBalance = Math.max(0, (acc.giftCardBalance || 0) - creditApplied);
      updateAccount(auth.email, updates);
    }
  }

  // spend down the redeemable gift code that was applied directly at checkout,
  // leaving any unused balance on the code for next time
  if (appliedGiftCode && giftCodeApplied > 0) {
    const ledger = getGiftLedger();
    const entry = ledger.find((g) => g.code === appliedGiftCode.code);
    if (entry) {
      entry.balance = Math.max(0, entry.balance - giftCodeApplied);
      if (entry.balance <= 0) entry.redeemed = true;
      saveGiftLedger(ledger);
    }
  }

  saveCart([]);

  // email a receipt, if Web3Forms is configured
  if (email && typeof submitToWeb3Forms === "function") {
    const itemLines = cart.map((line) => {
      const p = findProduct(line.productId);
      return p ? `- ${p.name} (${lineDescriptor(line)}) x${line.qty}: ${formatPrice(p.price * line.qty)}` : "";
    }).filter(Boolean).join("\n");
    submitToWeb3Forms({
      subject: `Your Stride receipt. Order ${order.id}`,
      from_name: "Stride",
      name, email,
      message:
        `Thanks for your order, ${name}!\n\n` +
        `Order ${order.id}\n${itemLines}\n\n` +
        `Subtotal: ${formatPrice(subtotal)}\n` +
        (discount > 0 ? `Promo (${order.promoCode}): -${formatPrice(discount)}\n` : "") +
        `Shipping: ${shipping === 0 ? "Free" : formatPrice(shipping)}\n` +
        `Tax: ${formatPrice(tax)}\n` +
        (creditApplied > 0 ? `Stride Credit applied: -${formatPrice(creditApplied)}\n` : "") +
        (giftCodeApplied > 0 ? `Gift card (${order.giftCode}) applied: -${formatPrice(giftCodeApplied)}\n` : "") +
        `Total charged: ${formatPrice(Math.max(0, total))}\n\n` +
        `View this order any time in your account.`,
    });
  }

  window.location.href = "order-confirmation.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderOrderSummary();
  initCardFormatting();
  goToStep(1);

  document.querySelectorAll("[data-next-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      let next = currentStep + 1;
      // gift card / credit / promo covers the whole order — skip the
      // card-details step entirely rather than asking for a card no
      // charge will ever be made on.
      if (next === 2 && computeTotals().total <= 0) next = 3;
      if (next <= TOTAL_STEPS) goToStep(next);
    });
  });
  document.querySelectorAll("[data-prev-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      let prev = currentStep - 1;
      if (currentStep === 3 && prev === 2 && computeTotals().total <= 0) prev = 1;
      goToStep(Math.max(1, prev));
    });
  });

  document.getElementById("promo-apply-btn")?.addEventListener("click", () => {
    const input = document.getElementById("promo-code-input");
    const code = input.value.trim().toUpperCase();
    const msgEl = document.getElementById("promo-message");
    if (!code) return;
    const promo = getAllPromos()[code];
    if (!promo) {
      msgEl.innerHTML = '<span class="text-flame"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Not a valid code.</span>';
      appliedPromo = null;
    } else {
      appliedPromo = { code, ...promo };
      msgEl.innerHTML = `<span class="text-volt-dark"><i class="fa-solid fa-circle-check mr-1"></i>${promo.label} applied.</span>`;
    }
    renderOrderSummary();
  });

  document.getElementById("gift-credit-toggle")?.addEventListener("change", (e) => {
    useGiftCredit = e.target.checked;
    renderOrderSummary();
  });

  function renderGiftCodeState() {
    document.getElementById("gift-code-form").classList.toggle("hidden", !!appliedGiftCode);
    document.getElementById("gift-code-applied").classList.toggle("hidden", !appliedGiftCode);
    if (appliedGiftCode) {
      document.getElementById("gift-code-applied-label").textContent = `${appliedGiftCode.code} (${formatPrice(appliedGiftCode.balance)} available)`;
    }
  }
  renderGiftCodeState();

  document.getElementById("gift-code-apply-btn")?.addEventListener("click", () => {
    const input = document.getElementById("gift-code-input");
    const code = input.value.trim().toUpperCase();
    const msgEl = document.getElementById("gift-code-message");
    if (!code) return;
    const ledger = getGiftLedger();
    const entry = ledger.find((g) => g.code === code);
    if (!entry) {
      msgEl.innerHTML = '<span class="text-flame"><i class="fa-solid fa-triangle-exclamation mr-1"></i>That gift code doesn\'t exist in this browser.</span>';
      return;
    }
    if (entry.redeemed || entry.balance <= 0) {
      msgEl.innerHTML = '<span class="text-flame"><i class="fa-solid fa-triangle-exclamation mr-1"></i>That code has already been fully used.</span>';
      return;
    }
    appliedGiftCode = { code: entry.code, balance: entry.balance };
    msgEl.innerHTML = `<span class="text-volt-dark"><i class="fa-solid fa-circle-check mr-1"></i>${formatPrice(entry.balance)} applied from ${code}.</span>`;
    input.value = "";
    renderGiftCodeState();
    renderOrderSummary();
  });

  document.getElementById("gift-code-remove-btn")?.addEventListener("click", () => {
    appliedGiftCode = null;
    document.getElementById("gift-code-message").innerHTML = "";
    renderGiftCodeState();
    renderOrderSummary();
  });

  document.getElementById("place-order-btn")?.addEventListener("click", () => {
    const btn = document.getElementById("place-order-btn");
    btn.disabled = true;
    btn.innerHTML = 'Placing order&hellip;';
    placeOrder();
  });
});
