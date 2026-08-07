/* ==========================================================================
   STRIDE. Auth.js
   Still no real backend (see GUIDE.md). But this now behaves like a
   real account system instead of a rubber stamp: accounts are stored
   with a hashed password (SHA-256 via the browser's built-in
   crypto.subtle, not sent anywhere), duplicate emails are rejected on
   signup, and wrong passwords are rejected on login. It's honestly
   still client-side-only. Anyone with dev tools open can see the
   accounts list. But it no longer just waves everyone through.
   ========================================================================== */

const AUTH_KEY = "stride-auth";
const ACCOUNTS_KEY = "stride-accounts";

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []; }
  catch { return []; }
}
function saveAccounts(list) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}
function findAccount(email) {
  return getAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
}

async function hashPassword(password) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Returns {ok:true} or {ok:false, error:"..."} */
async function createAccount(name, email, password) {
  if (findAccount(email)) return { ok: false, error: "An account with that email already exists. Log in instead." };
  const passwordHash = await hashPassword(password);
  const accounts = getAccounts();
  accounts.push({
    name, email, passwordHash,
    points: 0, giftCardBalance: 0, addresses: [],
    createdAt: new Date().toISOString(),
  });
  saveAccounts(accounts);
  return { ok: true };
}

/** Returns {ok:true, account} or {ok:false, error:"..."} */
async function verifyLogin(email, password) {
  const account = findAccount(email);
  if (!account) return { ok: false, error: "No account with that email. Check it, or create one." };
  const passwordHash = await hashPassword(password);
  if (passwordHash !== account.passwordHash) return { ok: false, error: "Wrong password. Try again." };
  return { ok: true, account };
}

function updateAccount(email, updates) {
  const accounts = getAccounts();
  const acc = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!acc) return null;
  Object.assign(acc, updates);
  saveAccounts(accounts);
  return acc;
}

function getAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch { return null; }
}
function setAuth(name, email) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ name, email }));
}
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
}
function initials(name) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/** The logged-in user's full account record (points, gift card balance, addresses), or null. */
function currentAccount() {
  const auth = getAuth();
  return auth ? findAccount(auth.email) : null;
}

/** Swaps the nav's account icon for an initials avatar when logged in. */
function paintAuthState() {
  const auth = getAuth();
  document.querySelectorAll("[data-account-slot]").forEach((slot) => {
    if (auth) {
      slot.innerHTML = `<a href="account.html" class="avatar-chip" aria-label="Account"><img data-src-base="images/avatar" data-ext-idx="0" src="images/avatar.jpg" alt="${auth.name}" onerror="imgTryNext(this)"><span class="relative">${initials(auth.name) || "ST"}</span></a>`;
    } else {
      slot.innerHTML = `<a href="login.html" class="icon-btn" aria-label="Log in"><i class="fa-regular fa-user text-sm"></i></a>`;
    }
  });
}

document.addEventListener("DOMContentLoaded", paintAuthState);
