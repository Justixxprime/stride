/* ==========================================================================
   STRIDE. Account.js
   No backend, no login. This reads whatever order history exists in
   this browser's localStorage (written by checkout.js) and displays it.
   Placing a real order on checkout.html is what populates this page.
   ORDER_STAGES / orderStageIndex / trackingHTML live in site.js so the
   order-confirmation page can share the same tracking stepper.
   ========================================================================== */

function orderRowHTML(order) {
  const date = new Date(order.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const itemCount = order.items.reduce((sum, l) => sum + l.qty, 0);
  return `
    <div class="tile-white p-5 sm:p-6" data-reveal data-order-id="${order.id}">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <p class="font-display text-lg">#${order.id}</p>
          <p class="font-mono text-xs text-ink-soft mt-1">${date} &middot; ${itemCount} item${itemCount === 1 ? "" : "s"}</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="pill pill-dark">${ORDER_STAGES[orderStageIndex(order)]}</span>
          <span class="font-mono font-bold">${formatPrice(order.total)}</span>
          <button class="order-delete-btn icon-btn !h-8 !w-8" data-id="${order.id}" aria-label="Delete order"><i class="fa-regular fa-trash-can text-xs"></i></button>
        </div>
      </div>
      <div class="mt-5 pt-5 border-t border-line">${trackingHTML(order)}</div>
    </div>`;
}

function renderOrders() {
  const orders = JSON.parse(localStorage.getItem("stride-orders") || "[]");
  const wrap = document.getElementById("orders-list");
  const empty = document.getElementById("orders-empty");
  const clearBtn = document.getElementById("orders-clear-btn");
  if (!orders.length) {
    empty.classList.remove("hidden");
    wrap.classList.add("hidden");
    clearBtn.classList.add("hidden");
    return;
  }
  empty.classList.add("hidden");
  wrap.classList.remove("hidden");
  clearBtn.classList.remove("hidden");
  wrap.innerHTML = orders.map(orderRowHTML).join("");
  initScrollReveal();
}

function deleteOrder(id) {
  const orders = JSON.parse(localStorage.getItem("stride-orders") || "[]");
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return;
  const [removed] = orders.splice(idx, 1);
  localStorage.setItem("stride-orders", JSON.stringify(orders));
  renderOrders();
  toast(`Removed order #${id}`, {
    label: "Undo",
    onUndo: () => {
      const current = JSON.parse(localStorage.getItem("stride-orders") || "[]");
      current.splice(idx, 0, removed);
      localStorage.setItem("stride-orders", JSON.stringify(current));
      renderOrders();
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderOrders();

  document.getElementById("orders-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".order-delete-btn");
    if (btn) deleteOrder(btn.dataset.id);
  });
  document.getElementById("orders-clear-btn").addEventListener("click", () => {
    const backup = localStorage.getItem("stride-orders");
    localStorage.setItem("stride-orders", "[]");
    renderOrders();
    toast("Order history cleared", { label: "Undo", onUndo: () => { localStorage.setItem("stride-orders", backup); renderOrders(); } });
  });

  const auth = getAuth();
  const nameField = document.getElementById("account-name");
  const emailField = document.getElementById("account-email");
  const guestBanner = document.getElementById("guest-banner");
  const logoutBtn = document.getElementById("logout-btn");

  // ---- profile photo (stored locally on this device, per account) ----
  const avatarChip = document.getElementById("account-avatar-chip");
  const avatarInput = document.getElementById("avatar-upload-input");
  const avatarRemoveBtn = document.getElementById("avatar-remove-btn");
  const avatarUploadLabel = avatarInput ? avatarInput.closest(".relative").querySelector("label") : null;
  function paintAccountAvatar() {
    if (!avatarChip) return;
    if (!auth) {
      avatarChip.innerHTML = `<i class="fa-regular fa-user"></i>`;
      return;
    }
    const photo = getCustomAvatar(auth.email);
    avatarChip.innerHTML = photo ? `<img src="${photo}" alt="${auth.name}">` : (initials(auth.name) || "ST");
    if (avatarRemoveBtn) avatarRemoveBtn.classList.toggle("hidden", !photo);
  }
  paintAccountAvatar();
  if (!auth && avatarUploadLabel) avatarUploadLabel.classList.add("hidden");
  if (avatarInput) {
    avatarInput.addEventListener("change", async () => {
      const file = avatarInput.files[0];
      if (!file || !auth) return;
      if (!file.type.startsWith("image/")) { toast("That file isn't an image"); return; }
      try {
        const dataUrl = await fileToAvatarDataUrl(file);
        setCustomAvatar(auth.email, dataUrl);
        paintAccountAvatar();
        paintAuthState(); // updates the small header icon too
        toast("Profile photo updated");
      } catch (err) {
        toast(err.message || "Couldn't use that photo");
      }
      avatarInput.value = "";
    });
  }
  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener("click", () => {
      if (!auth) return;
      clearCustomAvatar(auth.email);
      paintAccountAvatar();
      paintAuthState();
      toast("Profile photo removed");
    });
  }

  if (auth) {
    if (guestBanner) guestBanner.classList.add("hidden");
    if (nameField) nameField.value = auth.name;
    if (emailField) emailField.value = auth.email;
    if (logoutBtn) logoutBtn.classList.remove("hidden");
  } else {
    if (guestBanner) guestBanner.classList.remove("hidden");
    if (nameField) nameField.value = "Guest";
    if (emailField) emailField.value = "";
    if (logoutBtn) logoutBtn.classList.add("hidden");
  }

  const acc = auth ? currentAccount() : null;
  const pointsEl = document.getElementById("account-points-display");
  const creditEl = document.getElementById("account-credit-display");
  if (acc) {
    const tier = acc.points >= 800 ? "Sprinter" : acc.points >= 300 ? "Runner" : "Walker";
    if (pointsEl) pointsEl.textContent = `${tier} tier \u2014 ${acc.points || 0} points`;
    if (creditEl) creditEl.textContent = `$${(acc.giftCardBalance || 0).toFixed(2)} available`;
  } else {
    if (pointsEl) pointsEl.textContent = "Log in to see your points";
    if (creditEl) creditEl.textContent = "Log in to see your balance";
  }

  document.getElementById("account-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (auth) setAuth(nameField.value, auth.email);
    toast("Profile saved");
  });
  logoutBtn?.addEventListener("click", logout);

  /* ---- create / edit / delete a discount code ---- */
  function getCustomPromos() {
    try { return JSON.parse(localStorage.getItem("stride-custom-promos")) || {}; }
    catch { return {}; }
  }
  function promoLabel(p) {
    return p.type === "percent" ? `${p.value}% off` : p.type === "flat" ? `$${p.value} off` : "Free shipping";
  }
  function renderPromoList() {
    const listEl = document.getElementById("promo-list");
    if (!listEl) return;
    const custom = getCustomPromos();
    const codes = Object.keys(custom);
    if (!codes.length) { listEl.innerHTML = '<p class="text-xs text-ink-soft">No custom codes yet.</p>'; return; }
    listEl.innerHTML = codes
      .map((code) => {
        const p = custom[code];
        return `
        <div class="promo-row" data-code="${code}">
          <div class="promo-row-view">
            <div class="promo-row-icon"><i class="fa-solid fa-tag"></i></div>
            <div class="promo-row-info">
              <p class="promo-row-code">${code}</p>
              <p class="promo-row-sub">Discount code</p>
            </div>
            <span class="promo-row-pill">${promoLabel(p)}</span>
            <div class="promo-row-actions">
              <button type="button" class="promo-icon-btn" data-edit-promo="${code}" aria-label="Edit ${code}"><i class="fa-solid fa-pen"></i></button>
              <button type="button" class="promo-icon-btn is-danger" data-remove-promo="${code}" aria-label="Delete ${code}"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
          <div class="promo-row-edit-wrap">
            <div class="promo-row-edit">
              <div class="promo-edit-field">
                <label>Discount type</label>
                <select class="promo-edit-type">
                  <option value="percent" ${p.type === "percent" ? "selected" : ""}>% off</option>
                  <option value="flat" ${p.type === "flat" ? "selected" : ""}>$ off</option>
                  <option value="shipping" ${p.type === "shipping" ? "selected" : ""}>Free shipping</option>
                </select>
              </div>
              <div class="promo-edit-field">
                <label>Value</label>
                <input type="number" min="1" class="promo-edit-value" value="${p.value}" placeholder="Value">
              </div>
              <div class="promo-edit-actions">
                <button type="button" class="promo-save-btn" data-save-promo="${code}"><i class="fa-solid fa-check"></i>Save</button>
                <button type="button" class="promo-cancel-btn" data-cancel-promo="${code}"><i class="fa-solid fa-xmark"></i>Cancel</button>
              </div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    listEl.querySelectorAll("[data-remove-promo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const c = getCustomPromos();
        delete c[btn.dataset.removePromo];
        localStorage.setItem("stride-custom-promos", JSON.stringify(c));
        renderPromoList();
        toast(`Deleted discount code ${btn.dataset.removePromo}`);
      });
    });
    listEl.querySelectorAll("[data-edit-promo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        listEl.querySelector(`.promo-row[data-code="${CSS.escape(btn.dataset.editPromo)}"]`).classList.add("is-editing");
      });
    });
    listEl.querySelectorAll("[data-cancel-promo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        listEl.querySelector(`.promo-row[data-code="${CSS.escape(btn.dataset.cancelPromo)}"]`).classList.remove("is-editing");
      });
    });
    listEl.querySelectorAll("[data-save-promo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.savePromo;
        const row = listEl.querySelector(`.promo-row[data-code="${CSS.escape(code)}"]`);
        const type = row.querySelector(".promo-edit-type").value;
        const value = Number(row.querySelector(".promo-edit-value").value);
        if (type !== "shipping" && (!value || value <= 0)) { toast("Enter a value greater than 0"); return; }
        if (type === "percent" && value > 100) { toast("Percent off can't be more than 100"); return; }
        const custom = getCustomPromos();
        custom[code] = { type, value: type === "shipping" ? 0 : value, label: type === "percent" ? `${value}% off` : type === "flat" ? `$${value} off` : "Free shipping" };
        localStorage.setItem("stride-custom-promos", JSON.stringify(custom));
        renderPromoList();
        toast(`Updated ${code}`);
      });
    });
  }
  renderPromoList();

  document.getElementById("promo-create-btn")?.addEventListener("click", () => {
    const codeInput = document.getElementById("promo-create-code");
    const type = document.getElementById("promo-create-type").value;
    const valueInput = document.getElementById("promo-create-value");
    const resultEl = document.getElementById("promo-create-result");
    const code = codeInput.value.trim().toUpperCase();
    const value = Number(valueInput.value);

    if (!code) { resultEl.innerHTML = '<span class="text-flame">Give it a code first.</span>'; return; }
    if (type !== "shipping" && (!value || value <= 0)) { resultEl.innerHTML = '<span class="text-flame">Enter a value greater than 0.</span>'; return; }
    if (type === "percent" && value > 100) { resultEl.innerHTML = '<span class="text-flame">Percent off can\'t be more than 100.</span>'; return; }

    const custom = getCustomPromos();
    custom[code] = { type, value: type === "shipping" ? 0 : value, label: type === "percent" ? `${value}% off` : type === "flat" ? `$${value} off` : "Free shipping" };
    localStorage.setItem("stride-custom-promos", JSON.stringify(custom));
    resultEl.innerHTML = `<span class="text-volt-dark"><i class="fa-solid fa-circle-check mr-1"></i>${code} is live. Try it at checkout.</span>`;
    codeInput.value = ""; valueInput.value = "";
    renderPromoList();
    toast(`Discount code ${code} created`);
  });

  /* ---- manage gift codes: recharge, edit balance, delete ---- */
  function getGiftLedger() {
    try { return JSON.parse(localStorage.getItem("stride-giftcode-ledger")) || []; }
    catch { return []; }
  }
  function saveGiftLedger(ledger) {
    localStorage.setItem("stride-giftcode-ledger", JSON.stringify(ledger));
  }
  function renderGiftCodeList() {
    const listEl = document.getElementById("giftcode-list");
    if (!listEl) return;
    const ledger = getGiftLedger();
    if (!ledger.length) { listEl.innerHTML = '<p class="text-xs text-ink-soft">No gift codes generated yet. Create one on the Gift Cards page.</p>'; return; }
    listEl.innerHTML = ledger
      .map((g) => `
        <div class="promo-row" data-giftcode="${g.code}">
          <div class="promo-row-view">
            <div class="promo-row-icon is-gift"><i class="fa-solid fa-gift"></i></div>
            <div class="promo-row-info">
              <p class="promo-row-code">${g.code}</p>
              <p class="promo-row-sub">${g.redeemed ? '<span class="text-flame">Redeemed</span>' : "Not yet redeemed"}</p>
            </div>
            <span class="promo-row-pill">$${g.balance.toFixed(2)}</span>
            <div class="promo-row-actions">
              <button type="button" class="promo-icon-btn" data-edit-gift="${g.code}" aria-label="Edit ${g.code}"><i class="fa-solid fa-pen"></i></button>
              <button type="button" class="promo-icon-btn is-danger" data-remove-gift="${g.code}" aria-label="Delete ${g.code}"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
          <div class="promo-row-edit-wrap">
            <div class="promo-row-edit">
              <div class="promo-edit-field">
                <label>Balance ($)</label>
                <input type="number" min="0" step="0.01" class="gift-edit-balance" value="${g.balance}" placeholder="Balance">
              </div>
              <div class="promo-edit-actions">
                <button type="button" class="promo-save-btn" data-save-gift="${g.code}"><i class="fa-solid fa-check"></i>Save</button>
                <button type="button" class="promo-cancel-btn" data-cancel-gift="${g.code}"><i class="fa-solid fa-xmark"></i>Cancel</button>
              </div>
            </div>
          </div>
        </div>`)
      .join("");

    listEl.querySelectorAll("[data-remove-gift]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.removeGift;
        const ledger = getGiftLedger();
        const idx = ledger.findIndex((g) => g.code === code);
        if (idx === -1) return;
        const [removed] = ledger.splice(idx, 1);
        saveGiftLedger(ledger);
        renderGiftCodeList();
        toast(`Deleted gift code ${code}`, {
          label: "Undo",
          onUndo: () => { const l = getGiftLedger(); l.splice(idx, 0, removed); saveGiftLedger(l); renderGiftCodeList(); },
        });
      });
    });
    listEl.querySelectorAll("[data-edit-gift]").forEach((btn) => {
      btn.addEventListener("click", () => {
        listEl.querySelector(`.promo-row[data-giftcode="${CSS.escape(btn.dataset.editGift)}"]`).classList.add("is-editing");
      });
    });
    listEl.querySelectorAll("[data-cancel-gift]").forEach((btn) => {
      btn.addEventListener("click", () => {
        listEl.querySelector(`.promo-row[data-giftcode="${CSS.escape(btn.dataset.cancelGift)}"]`).classList.remove("is-editing");
      });
    });
    listEl.querySelectorAll("[data-save-gift]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.saveGift;
        const row = listEl.querySelector(`.promo-row[data-giftcode="${CSS.escape(code)}"]`);
        const value = Number(row.querySelector(".gift-edit-balance").value);
        if (value < 0 || Number.isNaN(value)) { toast("Enter a valid balance"); return; }
        const ledger = getGiftLedger();
        const entry = ledger.find((g) => g.code === code);
        if (entry) { entry.balance = value; saveGiftLedger(ledger); }
        renderGiftCodeList();
        toast(`Updated ${code}`);
      });
    });
  }
  renderGiftCodeList();

  document.getElementById("recharge-btn")?.addEventListener("click", () => {
    const codeInput = document.getElementById("recharge-code");
    const amountInput = document.getElementById("recharge-amount");
    const resultEl = document.getElementById("recharge-result");
    const code = codeInput.value.trim().toUpperCase();
    const amount = Number(amountInput.value);
    if (!code || !amount || amount <= 0) { resultEl.innerHTML = '<span class="text-flame">Enter a code and an amount.</span>'; return; }

    const ledger = getGiftLedger();
    const entry = ledger.find((g) => g.code === code);
    if (!entry) { resultEl.innerHTML = '<span class="text-flame">That code doesn\'t exist in this browser.</span>'; return; }
    if (entry.redeemed) { resultEl.innerHTML = '<span class="text-flame">That code has already been redeemed. Recharge before it\'s used.</span>'; return; }

    entry.balance += amount;
    saveGiftLedger(ledger);
    resultEl.innerHTML = `<span class="text-volt-dark"><i class="fa-solid fa-circle-check mr-1"></i>${code} now has a $${entry.balance.toFixed(2)} balance.</span>`;
    codeInput.value = ""; amountInput.value = "";
    renderGiftCodeList();
    toast(`$${amount} added to ${code}`);
  });
});
