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

/* ---------------------------------------------------------------------
   CUSTOM PROFILE PHOTO. Stored per-account as a compressed data URL in
   this browser's localStorage — nothing is uploaded anywhere. Replaces
   the old behavior where every logged-in visitor saw the same baked-in
   images/avatar.jpg; now each account shows nothing (falls back to
   initials) until that person chooses their own photo.
--------------------------------------------------------------------- */
function avatarKey(email) { return `stride-avatar-${email.toLowerCase()}`; }
function getCustomAvatar(email) {
  try { return localStorage.getItem(avatarKey(email)); } catch { return null; }
}
function setCustomAvatar(email, dataUrl) {
  try { localStorage.setItem(avatarKey(email), dataUrl); } catch (err) { console.error("Couldn't save photo:", err); }
}
function clearCustomAvatar(email) {
  try { localStorage.removeItem(avatarKey(email)); } catch {}
}
/** Resizes/compresses a chosen image file down to a small square JPEG
 * data URL before it's stored, so it stays well within localStorage's
 * size limits regardless of how big the original photo was. */
function fileToAvatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("That doesn't look like a valid image"));
      img.onload = () => {
        const size = 240;
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Swaps the nav's account icon for an initials avatar when logged in. */
function paintAuthState() {
  const auth = getAuth();
  document.querySelectorAll("[data-account-slot]").forEach((slot) => {
    if (auth) {
      const photo = getCustomAvatar(auth.email);
      const img = photo ? `<img src="${photo}" alt="${auth.name}">` : "";
      slot.innerHTML = `<a href="account.html" class="avatar-chip" aria-label="Account">${img}<span class="relative">${initials(auth.name) || "ST"}</span></a>`;
    } else {
      slot.innerHTML = `<a href="login.html" class="icon-btn" aria-label="Log in"><i class="fa-regular fa-user text-sm"></i></a>`;
    }
  });
}

document.addEventListener("DOMContentLoaded", paintAuthState);
