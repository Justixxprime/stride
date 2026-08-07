/* ==========================================================================
   STRIDE — store-map.js
   A real interactive map (Leaflet + free OpenStreetMap/CARTO tiles, no API
   key needed) for the Store Locator page. Reads store data straight off the
   .store-card elements already in the page (name, address, hours, lat/lng)
   so there's exactly one source of truth, same pattern as cart.js.
   ========================================================================== */

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("stride-map");
  if (!mapEl || typeof L === "undefined") return;

  const cards = Array.from(document.querySelectorAll(".store-card[data-lat]"));
  const stores = cards.map((card) => ({
    id: card.dataset.storeId,
    lat: Number(card.dataset.lat),
    lng: Number(card.dataset.lng),
    name: card.querySelector(".font-display")?.textContent.trim() || "Stride store",
    addressHTML: card.querySelector(".text-ink-soft.leading-relaxed")?.innerHTML || "",
    isFlagship: (card.querySelector(".font-mono")?.textContent || "").toLowerCase().includes("flagship"),
    card,
  }));
  if (!stores.length) return;

  const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false, attributionControl: true })
    .setView([stores[0].lat, stores[0].lng], 6);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: "abcd",
  }).addTo(map);

  // re-enable scroll-zoom only once the visitor has actually clicked into the
  // map, so scrolling the page past it doesn't hijack the wheel
  mapEl.addEventListener("click", () => map.scrollWheelZoom.enable(), { once: true });

  function pinIcon(active, flagship) {
    return L.divIcon({
      className: "",
      html: `<div class="stride-pin${flagship ? " is-flagship" : ""}${active ? " is-active" : ""}">
               <span class="stride-pin-ring"></span>
               <span class="stride-pin-core"><i class="fa-solid fa-shoe-prints"></i></span>
             </div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -16],
    });
  }

  function popupHTML(store) {
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    return `
      <p class="map-popup-eyebrow">${store.isFlagship ? "Flagship" : "Partner store"}</p>
      <p class="map-popup-title">${store.name}</p>
      <p class="map-popup-addr">${store.addressHTML}</p>
      <div class="map-popup-actions">
        <a href="${dirUrl}" target="_blank" rel="noopener" class="map-btn-primary"><i class="fa-solid fa-diamond-turn-right"></i>Directions</a>
        <a href="shop.html" class="map-btn-ghost"><i class="fa-solid fa-bag-shopping"></i>Shop</a>
      </div>`;
  }

  let activeId = null;
  function setActive(id) {
    activeId = id;
    stores.forEach((s) => {
      s.marker.setIcon(pinIcon(s.id === id, s.isFlagship));
      s.card.classList.toggle("is-active", s.id === id);
    });
  }

  stores.forEach((store) => {
    const marker = L.marker([store.lat, store.lng], { icon: pinIcon(false, store.isFlagship) }).addTo(map);
    marker.bindPopup(popupHTML(store), { closeButton: true, offset: [0, -4] });
    marker.on("click", () => setActive(store.id));
    marker.on("popupclose", () => { if (activeId === store.id) setActive(null); });
    store.marker = marker;
  });

  const bounds = L.latLngBounds(stores.map((s) => [s.lat, s.lng]));
  map.fitBounds(bounds, { padding: [40, 40] });

  stores.forEach((store) => {
    store.card.addEventListener("click", () => {
      map.flyTo([store.lat, store.lng], 12, { duration: 1.1 });
      setActive(store.id);
      setTimeout(() => store.marker.openPopup(), 550);
      mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  /* ---- "find the store nearest me" via browser geolocation ---- */
  const locateBtn = document.getElementById("map-locate-btn");
  let meMarker = null;
  locateBtn?.addEventListener("click", () => {
    if (!navigator.geolocation) { toast("Location isn't available in this browser"); return; }
    locateBtn.classList.add("is-loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locateBtn.classList.remove("is-loading");
        const { latitude, longitude } = pos.coords;
        if (meMarker) map.removeLayer(meMarker);
        meMarker = L.circleMarker([latitude, longitude], {
          radius: 7, color: "#F7F5EF", weight: 2, fillColor: "#3B82F6", fillOpacity: 1,
        }).addTo(map).bindPopup("You are here");

        let nearest = stores[0];
        let best = Infinity;
        stores.forEach((s) => {
          const d = haversineKm(latitude, longitude, s.lat, s.lng);
          if (d < best) { best = d; nearest = s; }
        });

        const grp = L.featureGroup([meMarker, nearest.marker]);
        map.flyToBounds(grp.getBounds(), { padding: [60, 60], duration: 1.1 });
        setActive(nearest.id);
        setTimeout(() => nearest.marker.openPopup(), 650);
        toast(`Nearest store: ${nearest.name} (~${Math.round(best)}km away)`);
      },
      () => { locateBtn.classList.remove("is-loading"); toast("Couldn't get your location. Check your browser's location permission"); },
      { timeout: 8000 }
    );
  });
});
