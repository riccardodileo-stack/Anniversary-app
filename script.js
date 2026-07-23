(() => {
  "use strict";

  const STORAGE_KEY = "ourJourneyData_v1";
  const RATING_FIELDS = [
    ["city", "Bellezza generale"],
    ["monuments", "Monumenti"],
    ["food", "Cibo"],
    ["atmosphere", "Atmosfera"],
    ["hotel", "Albergo"],
    ["experiences", "Esperienze"]
  ];
  const STATUS = {
    visited: { label: "Visitato", color: "#c68bd8", icon: "♥" },
    visiting: { label: "In visita", color: "#8ecfe8", icon: "✦" },
    planned: { label: "Futuro viaggio", color: "#b7b5c2", icon: "○" }
  };
  const CONTINENT_TOTALS = {
    "Europa": 44,
    "Asia": 48,
    "Africa": 54,
    "Nord America": 23,
    "Sud America": 12,
    "Oceania": 14
  };

  // Catalogo essenziale disponibile anche offline. Se la città non è qui,
  // la ricerca usa OpenStreetMap quando c'è connessione.
  const CITY_CATALOG = [
    ["Milano", "Italia", "Europa", 45.4642, 9.1900], ["Roma", "Italia", "Europa", 41.9028, 12.4964],
    ["Firenze", "Italia", "Europa", 43.7696, 11.2558], ["Venezia", "Italia", "Europa", 45.4408, 12.3155],
    ["Napoli", "Italia", "Europa", 40.8518, 14.2681], ["Torino", "Italia", "Europa", 45.0703, 7.6869],
    ["Verona", "Italia", "Europa", 45.4384, 10.9916], ["Bologna", "Italia", "Europa", 44.4949, 11.3426],
    ["Palermo", "Italia", "Europa", 38.1157, 13.3615], ["Cagliari", "Italia", "Europa", 39.2238, 9.1217],
    ["Parigi", "Francia", "Europa", 48.8566, 2.3522], ["Nizza", "Francia", "Europa", 43.7102, 7.2620],
    ["Lione", "Francia", "Europa", 45.7640, 4.8357], ["Londra", "Regno Unito", "Europa", 51.5072, -0.1276],
    ["Barcellona", "Spagna", "Europa", 41.3874, 2.1686], ["Madrid", "Spagna", "Europa", 40.4168, -3.7038],
    ["Lisbona", "Portogallo", "Europa", 38.7223, -9.1393], ["Porto", "Portogallo", "Europa", 41.1579, -8.6291],
    ["Amsterdam", "Paesi Bassi", "Europa", 52.3676, 4.9041], ["Bruxelles", "Belgio", "Europa", 50.8476, 4.3572],
    ["Berlino", "Germania", "Europa", 52.5200, 13.4050], ["Monaco di Baviera", "Germania", "Europa", 48.1351, 11.5820],
    ["Vienna", "Austria", "Europa", 48.2082, 16.3738], ["Praga", "Cechia", "Europa", 50.0755, 14.4378],
    ["Budapest", "Ungheria", "Europa", 47.4979, 19.0402], ["Atene", "Grecia", "Europa", 37.9838, 23.7275],
    ["Santorini", "Grecia", "Europa", 36.3932, 25.4615], ["Dubrovnik", "Croazia", "Europa", 42.6507, 18.0944],
    ["Copenaghen", "Danimarca", "Europa", 55.6761, 12.5683], ["Stoccolma", "Svezia", "Europa", 59.3293, 18.0686],
    ["Oslo", "Norvegia", "Europa", 59.9139, 10.7522], ["Reykjavík", "Islanda", "Europa", 64.1466, -21.9426],
    ["Bonifacio", "Francia", "Europa", 41.3874, 9.1594], ["Porto-Vecchio", "Francia", "Europa", 41.5910, 9.2794],
    ["New York", "Stati Uniti", "Nord America", 40.7128, -74.0060], ["Los Angeles", "Stati Uniti", "Nord America", 34.0522, -118.2437],
    ["San Francisco", "Stati Uniti", "Nord America", 37.7749, -122.4194], ["Toronto", "Canada", "Nord America", 43.6532, -79.3832],
    ["Città del Messico", "Messico", "Nord America", 19.4326, -99.1332], ["L'Avana", "Cuba", "Nord America", 23.1136, -82.3666],
    ["Rio de Janeiro", "Brasile", "Sud America", -22.9068, -43.1729], ["Buenos Aires", "Argentina", "Sud America", -34.6037, -58.3816],
    ["Lima", "Perù", "Sud America", -12.0464, -77.0428], ["Cusco", "Perù", "Sud America", -13.5319, -71.9675],
    ["Tokyo", "Giappone", "Asia", 35.6762, 139.6503], ["Kyoto", "Giappone", "Asia", 35.0116, 135.7681],
    ["Bangkok", "Thailandia", "Asia", 13.7563, 100.5018], ["Bali", "Indonesia", "Asia", -8.4095, 115.1889],
    ["Singapore", "Singapore", "Asia", 1.3521, 103.8198], ["Dubai", "Emirati Arabi Uniti", "Asia", 25.2048, 55.2708],
    ["Istanbul", "Turchia", "Asia", 41.0082, 28.9784], ["Marrakech", "Marocco", "Africa", 31.6295, -7.9811],
    ["Il Cairo", "Egitto", "Africa", 30.0444, 31.2357], ["Città del Capo", "Sudafrica", "Africa", -33.9249, 18.4241],
    ["Zanzibar", "Tanzania", "Africa", -6.1659, 39.2026], ["Sydney", "Australia", "Oceania", -33.8688, 151.2093],
    ["Melbourne", "Australia", "Oceania", -37.8136, 144.9631], ["Auckland", "Nuova Zelanda", "Oceania", -36.8509, 174.7645]
  ].map(([name, country, continent, lat, lng]) => ({ name, country, continent, lat, lng }));

  const DEFAULT_STATE = {
    version: 1,
    settings: {
      nameOne: "",
      nameTwo: "",
      anniversary: "",
      appTitle: "Our Journey",
      dedication: "Il nostro viaggio",
      accent: "lilac",
      mode: "light"
    },
    places: [],
    createdAt: new Date().toISOString()
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const parseLocalDate = value => value ? new Date(`${value}T12:00:00`) : null;
  const formatDate = (value, options = { day: "numeric", month: "short", year: "numeric" }) => {
    const date = parseLocalDate(value);
    return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("it-IT", options).format(date) : "Da definire";
  };
  const formatDateRange = place => {
    const { start, end } = place.dates || {};
    if (!start) return "Date da definire";
    if (!end || end === start) return formatDate(start);
    return `${formatDate(start, { day: "numeric", month: "short" })} – ${formatDate(end)}`;
  };
  const averageRating = ratings => {
    if (!ratings) return null;
    const values = RATING_FIELDS.map(([key]) => Number(ratings[key])).filter(value => Number.isFinite(value) && value > 0);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
  const daysBetweenInclusive = (start, end) => {
    const a = parseLocalDate(start);
    const b = parseLocalDate(end || start);
    if (!a || !b || b < a) return 0;
    return Math.round((b - a) / 86400000) + 1;
  };
  const daysUntil = value => {
    const date = parseLocalDate(value);
    if (!date) return null;
    const today = parseLocalDate(todayISO());
    return Math.ceil((date - today) / 86400000);
  };
  const haversineKm = (a, b) => {
    if (![a.lat, a.lng, b.lat, b.lng].every(Number.isFinite)) return 0;
    const rad = degree => degree * Math.PI / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };
  const statusBadge = status => `<span class="status-badge ${status}">${escapeHTML(STATUS[status]?.label || status)}</span>`;
  const placeById = id => state.places.find(place => place.id === id);

  let state = loadState();
  let activeTab = "map";
  let activeRatingFilter = "all";
  let selectedStatsYear = "all";
  let map = null;
  let tileLayer = null;
  let markerLayer = null;
  let pendingLocation = null;
  let currentFormHandler = null;
  let currentDeleteHandler = null;
  let deferredInstallPrompt = null;
  let toastTimer = null;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || !Array.isArray(parsed.places)) return clone(DEFAULT_STATE);
      return {
        ...clone(DEFAULT_STATE),
        ...parsed,
        settings: { ...clone(DEFAULT_STATE.settings), ...(parsed.settings || {}) },
        places: parsed.places.map(place => ({
          companion: "", notes: "", wish: "", photos: [], ratings: null,
          restaurants: [], monuments: [], dates: { start: "", end: "" },
          ...place,
          dates: { start: "", end: "", ...(place.dates || {}) },
          photos: Array.isArray(place.photos) ? place.photos : [],
          restaurants: Array.isArray(place.restaurants) ? place.restaurants : [],
          monuments: Array.isArray(place.monuments) ? place.monuments : []
        }))
      };
    } catch (error) {
      console.warn("Impossibile leggere i dati salvati", error);
      return clone(DEFAULT_STATE);
    }
  }

  function saveState({ silent = false } = {}) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (!silent) renderAll();
      return true;
    } catch (error) {
      console.error("Salvataggio non riuscito", error);
      showToast("Spazio locale esaurito: elimina qualche foto o crea un backup.");
      return false;
    }
  }

  function createPlace(data = {}) {
    return {
      id: uid(),
      name: data.name || "Nuova meta",
      country: data.country || "",
      continent: data.continent || inferContinent(data.country),
      lat: Number.isFinite(Number(data.lat)) ? Number(data.lat) : null,
      lng: Number.isFinite(Number(data.lng)) ? Number(data.lng) : null,
      status: data.status || "planned",
      companion: data.companion || "",
      dates: { start: data.start || "", end: data.end || "" },
      notes: data.notes || "",
      wish: data.wish || "",
      photos: data.photos || [],
      ratings: data.ratings || null,
      restaurants: data.restaurants || [],
      monuments: data.monuments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function inferContinent(country = "") {
    const normalizedCountry = normalize(country);
    const match = CITY_CATALOG.find(city => normalize(city.country) === normalizedCountry);
    return match?.continent || "Europa";
  }

  function init() {
    applyAppearance();
    bindEvents();
    populateSettings();
    renderAll();
    updateConnectionStatus();
    initMap();
    registerServiceWorker();
  }

  function bindEvents() {
    $$(".nav-item").forEach(button => button.addEventListener("click", () => setTab(button.dataset.target)));
    $("#brandButton").addEventListener("click", () => setTab("map"));
    $("#quickAddButton").addEventListener("click", () => openPlaceEditor(null, "planned"));
    $("#addPlannedButton").addEventListener("click", () => openPlaceEditor(null, "planned"));
    $("#addDreamButton").addEventListener("click", () => openPlaceEditor(null, "planned", true));
    $("#showAllPlacesButton").addEventListener("click", () => setTab("ratings"));
    $("#placeSearchForm").addEventListener("submit", handlePlaceSearch);
    $("#placeSearchInput").addEventListener("input", handleSearchInput);
    $("#searchSuggestions").addEventListener("click", handleSuggestionClick);
    $("#locateButton").addEventListener("click", locateUser);
    $("#mapHint").addEventListener("click", () => showToast("Tocca la mappa oppure cerca una città in alto."));
    $("#recentPlaces").addEventListener("click", handlePlaceCardClick);
    $("#ratingsList").addEventListener("click", handlePlaceCardClick);
    $("#plannedList").addEventListener("click", handlePlaceCardClick);
    $("#nextTripCard").addEventListener("click", handlePlaceCardClick);
    $("#offlinePlaces").addEventListener("click", handlePlaceCardClick);
    $("#ratingFilters").addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeRatingFilter = button.dataset.filter;
      $$(".filter-chip", $("#ratingFilters")).forEach(item => item.classList.toggle("is-active", item === button));
      renderRatings();
    });
    $("#statsYear").addEventListener("change", event => { selectedStatsYear = event.target.value; renderStats(); });
    $("#sheetBackdrop").addEventListener("click", closeSheet);
    $("#closeSheetButton").addEventListener("click", closeSheet);
    $("#sheetContent").addEventListener("click", handleSheetAction);
    $("#dynamicForm").addEventListener("submit", handleDynamicFormSubmit);
    $("#dialogCloseButton").addEventListener("click", () => $("#formDialog").close());
    $("#formActions").addEventListener("click", event => {
      if (event.target.closest("[data-form-delete]") && currentDeleteHandler) currentDeleteHandler();
    });
    $("#closePhotoViewer").addEventListener("click", () => $("#photoViewer").close());
    $("#photoViewer").addEventListener("click", event => { if (event.target === $("#photoViewer")) $("#photoViewer").close(); });
    $("#saveSettingsButton").addEventListener("click", saveSettings);
    $("#accentOptions").addEventListener("click", handleAccentChange);
    $("#modeOptions").addEventListener("click", handleModeChange);
    $("#exportButton").addEventListener("click", exportBackup);
    $("#importButton").addEventListener("click", () => $("#importFileInput").click());
    $("#importFileInput").addEventListener("change", importBackup);
    $("#demoButton").addEventListener("click", addDemoData);
    $("#resetButton").addEventListener("click", resetData);
    $("#installButton").addEventListener("click", installApp);
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);
    window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); deferredInstallPrompt = event; });
    document.addEventListener("click", event => {
      if (!event.target.closest(".search-card")) $("#searchSuggestions").hidden = true;
    });
  }

  function setTab(target) {
    if (!target || target === activeTab) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    activeTab = target;
    $$(".view").forEach(view => view.classList.toggle("is-active", view.dataset.view === target));
    $$(".nav-item").forEach(button => {
      const selected = button.dataset.target === target;
      button.classList.toggle("is-active", selected);
      selected ? button.setAttribute("aria-current", "page") : button.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (target === "map" && map) setTimeout(() => map.invalidateSize(), 100);
    if (target === "stats") renderStats();
  }

  function renderAll() {
    renderHeader();
    renderHero();
    renderRecentPlaces();
    renderRatings();
    renderStatsYearOptions();
    renderStats();
    renderPlanned();
    renderOfflinePlaces();
    renderMapMarkers();
  }

  function renderHeader() {
    const settings = state.settings;
    $("#headerTitle").textContent = settings.appTitle || "Our Journey";
    $("#headerSubtitle").textContent = settings.nameOne && settings.nameTwo
      ? `${settings.nameOne} & ${settings.nameTwo}` : "il nostro mondo, insieme";
    document.title = settings.appTitle || "Our Journey";
  }

  function renderHero() {
    const visited = state.places.filter(place => place.status === "visited");
    const countries = new Set(visited.map(place => normalize(place.country)).filter(Boolean));
    const photos = state.places.reduce((sum, place) => sum + (place.photos?.length || 0), 0);
    $("#anniversaryMessage").textContent = anniversaryText();
    $("#heroMetrics").innerHTML = [
      [visited.length, visited.length === 1 ? "meta" : "mete"],
      [countries.size, countries.size === 1 ? "paese" : "paesi"],
      [photos, photos === 1 ? "foto" : "foto"]
    ].map(([value, label]) => `<div class="hero-metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
  }

  function anniversaryText() {
    const { dedication, anniversary, nameOne, nameTwo } = state.settings;
    if (!anniversary) return dedication || "Segna le città, conserva le foto e rivivi i vostri momenti più belli.";
    const original = parseLocalDate(anniversary);
    const today = parseLocalDate(todayISO());
    let next = new Date(today.getFullYear(), original.getMonth(), original.getDate(), 12);
    if (next < today) next = new Date(today.getFullYear() + 1, original.getMonth(), original.getDate(), 12);
    const days = Math.ceil((next - today) / 86400000);
    const names = nameOne && nameTwo ? `${nameOne} & ${nameTwo}` : "Noi due";
    if (days === 0) return `Buon anniversario, ${names}! Oggi festeggiamo la nostra storia. ♡`;
    return `${dedication || "Ogni luogo ha un pezzetto di noi."} Mancano ${days} giorni al prossimo anniversario.`;
  }

  function renderRecentPlaces() {
    const container = $("#recentPlaces");
    const places = [...state.places]
      .sort((a, b) => (b.dates?.start || b.updatedAt || "").localeCompare(a.dates?.start || a.updatedAt || ""))
      .slice(0, 6);
    if (!places.length) {
      container.innerHTML = emptyState("⌖", "La vostra mappa è ancora tutta da riempire", "Cerca una città o tocca la mappa per salvare la prima meta.", "Aggiungi una meta");
      const button = container.querySelector("button");
      if (button) button.addEventListener("click", () => $("#placeSearchInput").focus());
      return;
    }
    container.innerHTML = places.map(place => {
      const score = averageRating(place.ratings);
      return `<article class="place-card" data-place-id="${place.id}">
        <div class="place-card-top">${statusBadge(place.status)}<span>${place.photos?.length ? `♡ ${place.photos.length}` : "♡"}</span></div>
        <h3>${escapeHTML(place.name)}</h3><p>${escapeHTML(place.country || "Paese da definire")}</p>
        <div class="place-card-bottom"><small>${escapeHTML(formatDateRange(place))}</small><span class="place-score">${score ? score.toFixed(1) : "–"}</span></div>
      </article>`;
    }).join("");
  }

  function emptyState(icon, title, text, action = "") {
    return `<div class="empty-state"><div><span class="empty-state-icon">${icon}</span><strong>${escapeHTML(title)}</strong><p>${escapeHTML(text)}</p>${action ? `<button type="button" class="primary-button">${escapeHTML(action)}</button>` : ""}</div></div>`;
  }

  function handlePlaceCardClick(event) {
    const target = event.target.closest("[data-place-id]");
    if (!target) return;
    const place = placeById(target.dataset.placeId);
    if (place) openExistingPlaceSheet(place);
  }

  function initMap() {
    if (!window.L) {
      showOfflineMap(true);
      return;
    }
    try {
      map = L.map("map", { zoomControl: true, worldCopyJump: true }).setView([43.6, 10.5], 5);
      tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);
      markerLayer = L.layerGroup().addTo(map);
      map.on("click", handleMapClick);
      renderMapMarkers();
      showOfflineMap(false);
    } catch (error) {
      console.warn("Mappa non disponibile", error);
      showOfflineMap(true);
    }
  }

  function showOfflineMap(force = !navigator.onLine) {
    const offline = force || !window.L;
    $("#offlineMap").hidden = !offline;
    $("#mapHint").hidden = offline;
  }

  function updateConnectionStatus() {
    const online = navigator.onLine;
    const pill = $("#connectionPill");
    pill.classList.toggle("is-offline", !online);
    $("span", pill).textContent = online ? "Online" : "Offline";
    if (!online && !window.L) showOfflineMap(true);
    if (online && map) showOfflineMap(false);
  }

  function renderMapMarkers() {
    if (!map || !markerLayer || !window.L) return;
    markerLayer.clearLayers();
    state.places.forEach(place => {
      if (![place.lat, place.lng].every(value => Number.isFinite(Number(value)))) return;
      const color = STATUS[place.status]?.color || STATUS.planned.color;
      const circle = L.circle([place.lat, place.lng], {
        radius: place.status === "visiting" ? 17000 : 12000,
        color,
        fillColor: color,
        fillOpacity: .20,
        weight: 1
      }).addTo(markerLayer);
      circle.on("click", event => { L.DomEvent.stopPropagation(event); openExistingPlaceSheet(place); });
      const icon = L.divIcon({
        className: "custom-leaflet-icon",
        html: `<div class="travel-marker ${place.status}"><span>${STATUS[place.status]?.icon || "♥"}</span></div>`,
        iconSize: [34, 34], iconAnchor: [17, 31]
      });
      const marker = L.marker([place.lat, place.lng], { icon }).addTo(markerLayer);
      marker.bindTooltip(escapeHTML(place.name), { direction: "top", offset: [0, -25] });
      marker.on("click", () => openExistingPlaceSheet(place));
    });
  }

  async function handleMapClick(event) {
    const location = { lat: event.latlng.lat, lng: event.latlng.lng, name: "Punto sulla mappa", country: "", continent: "Europa" };
    if (!navigator.onLine) {
      pendingLocation = location;
      openNewPlaceSheet(location, "Puoi completare il nome anche senza connessione.");
      return;
    }
    showToast("Sto riconoscendo il luogo…");
    try {
      const result = await reverseGeocode(location.lat, location.lng);
      pendingLocation = result || location;
      openNewPlaceSheet(pendingLocation);
    } catch (error) {
      console.warn(error);
      pendingLocation = location;
      openNewPlaceSheet(location, "Il nome non è stato riconosciuto: potrai modificarlo nella scheda.");
    }
  }

  async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=10&addressdetails=1&accept-language=it`;
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error("Geocodifica non disponibile");
    const item = await response.json();
    const address = item.address || {};
    const name = address.city || address.town || address.village || address.municipality || address.county || item.name || "Nuova meta";
    const country = address.country || "";
    return { name, country, continent: inferContinent(country), lat: Number(item.lat), lng: Number(item.lon) };
  }

  function locateUser() {
    if (!navigator.geolocation) return showToast("La geolocalizzazione non è disponibile su questo dispositivo.");
    showToast("Cerco la tua posizione…");
    navigator.geolocation.getCurrentPosition(position => {
      if (map) map.setView([position.coords.latitude, position.coords.longitude], 11, { animate: true });
      showToast("Posizione trovata.");
    }, () => showToast("Non riesco ad accedere alla posizione. Controlla i permessi."), { enableHighAccuracy: true, timeout: 10000 });
  }

  function handleSearchInput(event) {
    const query = normalize(event.target.value);
    if (query.length < 2) {
      $("#searchSuggestions").hidden = true;
      return;
    }
    const matches = CITY_CATALOG.filter(city => normalize(`${city.name} ${city.country}`).includes(query)).slice(0, 6);
    if (!matches.length) {
      $("#searchSuggestions").hidden = true;
      return;
    }
    renderSuggestions(matches);
  }

  function renderSuggestions(items) {
    const container = $("#searchSuggestions");
    container.innerHTML = items.map(item => `<button type="button" data-suggestion='${escapeHTML(JSON.stringify(item))}'>
      <span class="suggestion-pin">⌖</span><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.country)} · ${escapeHTML(item.continent)}</small></span>
    </button>`).join("");
    container.hidden = false;
  }

  function handleSuggestionClick(event) {
    const button = event.target.closest("[data-suggestion]");
    if (!button) return;
    try { selectSearchResult(JSON.parse(button.dataset.suggestion)); } catch (error) { console.warn(error); }
  }

  async function handlePlaceSearch(event) {
    event.preventDefault();
    const rawQuery = $("#placeSearchInput").value.trim();
    if (rawQuery.length < 2) return showToast("Scrivi almeno due lettere.");
    const query = normalize(rawQuery);
    const localMatches = CITY_CATALOG.filter(city => normalize(`${city.name} ${city.country}`).includes(query)).slice(0, 6);
    if (localMatches.length) {
      if (localMatches.length === 1 || normalize(localMatches[0].name) === query) selectSearchResult(localMatches[0]);
      else renderSuggestions(localMatches);
      return;
    }
    if (!navigator.onLine) return showToast("Questa città non è nel catalogo offline. Riprova quando sei online.");
    showToast("Cerco la città sulla mappa…");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(rawQuery)}&limit=5&addressdetails=1&accept-language=it`;
      const response = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error("Ricerca non disponibile");
      const data = await response.json();
      const items = data.map(item => {
        const address = item.address || {};
        const name = address.city || address.town || address.village || address.municipality || item.name || item.display_name.split(",")[0];
        const country = address.country || "";
        return { name, country, continent: inferContinent(country), lat: Number(item.lat), lng: Number(item.lon) };
      });
      if (!items.length) return showToast("Non ho trovato questa località.");
      if (items.length === 1) selectSearchResult(items[0]); else renderSuggestions(items);
    } catch (error) {
      console.warn(error);
      showToast("Ricerca non disponibile. Controlla la connessione.");
    }
  }

  function selectSearchResult(result) {
    $("#searchSuggestions").hidden = true;
    $("#placeSearchInput").value = result.name;
    const existing = state.places.find(place => normalize(place.name) === normalize(result.name) && normalize(place.country) === normalize(result.country));
    if (map && Number.isFinite(result.lat) && Number.isFinite(result.lng)) map.setView([result.lat, result.lng], 10, { animate: true });
    if (existing) openExistingPlaceSheet(existing);
    else { pendingLocation = result; openNewPlaceSheet(result); }
  }

  function renderOfflinePlaces() {
    const container = $("#offlinePlaces");
    container.innerHTML = state.places.length
      ? state.places.map(place => `<button type="button" class="${place.status}" data-place-id="${place.id}">${escapeHTML(place.name)}</button>`).join("")
      : `<span class="field-note">Nessuna meta ancora salvata.</span>`;
  }

  function openSheet({ kicker = "", title, subtitle = "", content }) {
    $("#sheetKicker").textContent = kicker;
    $("#sheetTitle").textContent = title;
    $("#sheetSubtitle").textContent = subtitle;
    $("#sheetContent").innerHTML = content;
    $("#sheetBackdrop").hidden = false;
    $("#bottomSheet").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#closeSheetButton").focus(), 50);
  }

  function closeSheet() {
    $("#sheetBackdrop").hidden = true;
    $("#bottomSheet").hidden = true;
    document.body.style.overflow = "";
  }

  function openNewPlaceSheet(location, note = "Come vuoi segnare questo luogo sulla vostra mappa?") {
    pendingLocation = location;
    openSheet({
      kicker: location.country || "Nuova destinazione",
      title: location.name || "Nuovo luogo",
      subtitle: note,
      content: `<div class="sheet-option-list">
        ${statusChoice("visited", "Luogo visitato", "Coloralo di lilla e aggiungi i vostri ricordi.")}
        ${statusChoice("visiting", "Luogo in visita", "Segnalo in azzurro: siete proprio qui adesso.")}
        ${statusChoice("planned", "Futuro viaggio", "Salvalo in grigio tra le prossime avventure.")}
        <button class="sheet-option" type="button" data-action="close"><span class="sheet-option-icon">×</span><span class="sheet-option-copy"><strong>Esci</strong><small>Torna alla mappa senza salvare</small></span></button>
      </div>`
    });
  }

  function statusChoice(status, title, description) {
    return `<button class="sheet-option status-choice ${status}" type="button" data-action="select-new-status" data-status="${status}">
      <span class="sheet-option-icon">${STATUS[status].icon}</span><span class="sheet-option-copy"><strong>${escapeHTML(title)}</strong><small>${escapeHTML(description)}</small></span><i>›</i>
    </button>`;
  }

  function openExistingPlaceSheet(place) {
    const canRate = place.status === "visited";
    const score = averageRating(place.ratings);
    openSheet({
      kicker: `${STATUS[place.status]?.label || "Destinazione"} · ${place.country || "Paese da definire"}`,
      title: place.name,
      subtitle: score ? `Il vostro voto medio è ${score.toFixed(1)} su 10.` : formatDateRange(place),
      content: `<div class="sheet-option-list">
        <button class="sheet-option" type="button" data-action="edit-trip" data-place-id="${place.id}"><span class="sheet-option-icon">✎</span><span class="sheet-option-copy"><strong>Inserisci informazioni viaggio</strong><small>Persone, date, note e dettagli della meta</small></span><i>›</i></button>
        <button class="sheet-option" type="button" data-action="photos" data-place-id="${place.id}"><span class="sheet-option-icon">▧</span><span class="sheet-option-copy"><strong>Visualizza foto ricordo</strong><small>${place.photos?.length ? `${place.photos.length} foto salvate` : "Aggiungi le foto di voi che ami di più"}</small></span><i>›</i></button>
        <button class="sheet-option ${canRate ? "" : "disabled"}" type="button" data-action="rate" data-place-id="${place.id}" aria-disabled="${!canRate}"><span class="sheet-option-icon">☆</span><span class="sheet-option-copy"><strong>${score ? "Modifica valutazione" : "Valuta"}</strong><small>${canRate ? "Dai un voto alle sei categorie" : "Disponibile dopo aver visitato la città"}</small></span><i>›</i></button>
        <button class="sheet-option" type="button" data-action="details" data-place-id="${place.id}"><span class="sheet-option-icon">♡</span><span class="sheet-option-copy"><strong>Apri il ricordo completo</strong><small>Voti, ristoranti e monumenti preferiti</small></span><i>›</i></button>
        <button class="sheet-option" type="button" data-action="change-status" data-place-id="${place.id}"><span class="sheet-option-icon">↻</span><span class="sheet-option-copy"><strong>Cambia stato</strong><small>Visitato, in visita o futuro viaggio</small></span><i>›</i></button>
        <button class="sheet-option" type="button" data-action="focus-map" data-place-id="${place.id}" ${Number.isFinite(place.lat) ? "" : "disabled"}><span class="sheet-option-icon">⌖</span><span class="sheet-option-copy"><strong>Mostra sulla mappa</strong><small>${Number.isFinite(place.lat) ? "Centra la cartina su questa destinazione" : "Posizione non ancora associata"}</small></span><i>›</i></button>
        <button class="sheet-option" type="button" data-action="close"><span class="sheet-option-icon">×</span><span class="sheet-option-copy"><strong>Esci</strong><small>Chiudi questo menu</small></span></button>
      </div>`
    });
  }

  function handleSheetAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const place = button.dataset.placeId ? placeById(button.dataset.placeId) : null;
    if (action === "close") return closeSheet();
    if (action === "select-new-status") {
      const location = pendingLocation || {};
      const newPlace = createPlace({ ...location, status: button.dataset.status });
      state.places.push(newPlace);
      saveState();
      closeSheet();
      celebrate();
      showToast(`${newPlace.name} è stata aggiunta alla vostra mappa.`);
      setTimeout(() => openPlaceEditor(newPlace.id), 350);
      return;
    }
    if (!place) return;
    if (action === "edit-trip") { closeSheet(); openPlaceEditor(place.id); }
    if (action === "photos") { closeSheet(); openGallery(place.id); }
    if (action === "rate") {
      if (place.status !== "visited") return showToast("Operazione non possibile: devi prima visitare la città.");
      closeSheet(); openRatingEditor(place.id);
    }
    if (action === "details") { closeSheet(); openPlaceDetails(place.id); }
    if (action === "change-status") openChangeStatusSheet(place);
    if (action === "focus-map") {
      if (map && Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
        closeSheet(); setTab("map"); setTimeout(() => map.setView([place.lat, place.lng], 11, { animate: true }), 150);
      }
    }
  }

  function openChangeStatusSheet(place) {
    openSheet({
      kicker: place.name,
      title: "Cambia stato",
      subtitle: "La destinazione cambierà colore in tutte le sezioni.",
      content: `<div class="sheet-option-list">
        ${Object.keys(STATUS).map(status => `<button class="sheet-option status-choice ${status}" type="button" data-action="apply-status" data-place-id="${place.id}" data-status="${status}"><span class="sheet-option-icon">${STATUS[status].icon}</span><span class="sheet-option-copy"><strong>${STATUS[status].label}</strong><small>${place.status === status ? "Stato attuale" : "Tocca per selezionare"}</small></span>${place.status === status ? "<i>✓</i>" : "<i>›</i>"}</button>`).join("")}
        <button class="sheet-option" type="button" data-action="close"><span class="sheet-option-icon">×</span><span class="sheet-option-copy"><strong>Annulla</strong></span></button>
      </div>`
    });
    $$("[data-action='apply-status']", $("#sheetContent")).forEach(button => button.addEventListener("click", () => {
      place.status = button.dataset.status;
      place.updatedAt = new Date().toISOString();
      saveState(); closeSheet(); showToast(`${place.name}: stato aggiornato.`);
    }));
  }

  function openDynamicForm({ kicker = "", title, subtitle = "", body, saveText = "Salva", showSave = true, deleteText = "", onSave = null, onDelete = null }) {
    $("#formKicker").textContent = kicker;
    $("#formTitle").textContent = title;
    $("#formSubtitle").textContent = subtitle;
    $("#formBody").innerHTML = body;
    $("#formActions").innerHTML = `${deleteText ? `<button class="delete-button" type="button" data-form-delete>${escapeHTML(deleteText)}</button>` : ""}<button class="cancel-button" type="button" data-close-form>Chiudi</button>${showSave ? `<button class="save-button" type="submit">${escapeHTML(saveText)}</button>` : ""}`;
    currentFormHandler = onSave;
    currentDeleteHandler = onDelete;
    $("[data-close-form]", $("#formActions")).addEventListener("click", () => $("#formDialog").close());
    if (!$("#formDialog").open) $("#formDialog").showModal();
  }

  async function handleDynamicFormSubmit(event) {
    event.preventDefault();
    if (!currentFormHandler) return;
    const result = await currentFormHandler(new FormData(event.currentTarget));
    if (result !== false && $("#formDialog").open) $("#formDialog").close();
  }

  function continentOptions(selected = "Europa") {
    return Object.keys(CONTINENT_TOTALS).map(item => `<option value="${item}" ${item === selected ? "selected" : ""}>${item}</option>`).join("");
  }

  function openPlaceEditor(placeId = null, initialStatus = "planned", dream = false) {
    const existing = placeId ? placeById(placeId) : null;
    const place = existing || createPlace({ status: initialStatus, wish: dream ? "Una meta nella nostra lista dei sogni" : "" });
    openDynamicForm({
      kicker: existing ? STATUS[place.status].label : "Nuova destinazione",
      title: existing ? `Il viaggio a ${place.name}` : (dream ? "Nuovo sogno" : "Nuovo viaggio"),
      subtitle: "Inserisci le informazioni che vuoi ricordare. Potrai modificarle in qualsiasi momento.",
      body: `<div class="form-row">
        <label class="field-label"><span>Città o luogo *</span><input name="name" required maxlength="70" value="${escapeHTML(place.name === "Nuova meta" ? "" : place.name)}" placeholder="Es. Parigi"></label>
        <label class="field-label"><span>Paese</span><input name="country" maxlength="60" value="${escapeHTML(place.country)}" placeholder="Es. Francia"></label>
      </div>
      <div class="form-row">
        <label class="field-label"><span>Continente</span><select name="continent">${continentOptions(place.continent)}</select></label>
        <label class="field-label"><span>Stato</span><select name="status">${Object.entries(STATUS).map(([key, item]) => `<option value="${key}" ${place.status === key ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
      </div>
      <label class="field-label"><span>Con chi hai fatto / farai il viaggio</span><input name="companion" maxlength="80" value="${escapeHTML(place.companion)}" placeholder="Es. Noi due ♡"></label>
      <div class="form-row">
        <label class="field-label"><span>Data di partenza</span><input name="start" type="date" value="${escapeHTML(place.dates.start)}"></label>
        <label class="field-label"><span>Data di arrivo</span><input name="end" type="date" value="${escapeHTML(place.dates.end)}"></label>
      </div>
      <label class="field-label"><span>Il ricordo o il programma</span><textarea name="notes" rows="4" maxlength="800" placeholder="Cosa avete fatto? Cosa non vuoi dimenticare?">${escapeHTML(place.notes)}</textarea></label>
      <label class="field-label"><span>Un desiderio per questa meta</span><input name="wish" maxlength="180" value="${escapeHTML(place.wish)}" placeholder="Es. Vedere il tramonto dalla terrazza più bella"></label>
      <p class="field-note">Le foto si aggiungono dalla sezione “Foto ricordo”. I dati restano sul dispositivo.</p>`,
      saveText: existing ? "Salva modifiche" : "Aggiungi viaggio",
      deleteText: existing ? "Elimina meta" : "",
      onSave: formData => {
        const start = formData.get("start");
        const end = formData.get("end");
        if (start && end && end < start) { showToast("La data di arrivo non può precedere la partenza."); return false; }
        const wasNew = !existing;
        place.name = String(formData.get("name") || "").trim();
        place.country = String(formData.get("country") || "").trim();
        place.continent = formData.get("continent") || inferContinent(place.country);
        place.status = formData.get("status") || "planned";
        place.companion = String(formData.get("companion") || "").trim();
        place.dates = { start: String(start || ""), end: String(end || "") };
        place.notes = String(formData.get("notes") || "").trim();
        place.wish = String(formData.get("wish") || "").trim();
        const catalogMatch = CITY_CATALOG.find(city => normalize(city.name) === normalize(place.name) && (!place.country || normalize(city.country) === normalize(place.country)));
        if (catalogMatch && !Number.isFinite(place.lat)) Object.assign(place, { lat: catalogMatch.lat, lng: catalogMatch.lng, country: place.country || catalogMatch.country, continent: catalogMatch.continent });
        place.updatedAt = new Date().toISOString();
        if (wasNew) state.places.push(place);
        saveState(); showToast(wasNew ? `${place.name} è nella vostra lista.` : "Informazioni aggiornate.");
        if (wasNew) celebrate();
        return true;
      },
      onDelete: existing ? () => deletePlace(existing.id) : null
    });
  }

  function deletePlace(placeId) {
    const place = placeById(placeId);
    if (!place || !confirm(`Vuoi davvero eliminare ${place.name} e tutti i suoi ricordi?`)) return;
    state.places = state.places.filter(item => item.id !== placeId);
    saveState();
    if ($("#formDialog").open) $("#formDialog").close();
    closeSheet();
    showToast("La meta è stata eliminata.");
  }

  function openGallery(placeId) {
    const place = placeById(placeId);
    if (!place) return;
    openDynamicForm({
      kicker: place.name,
      title: "Le nostre foto ricordo",
      subtitle: "Aggiungi le foto che ti piacciono di più. Puoi salvarne fino a 10 per ogni viaggio.",
      body: galleryBody(place),
      showSave: false
    });
    bindGalleryEvents(placeId);
  }

  function galleryBody(place) {
    return `<label class="photo-upload ${place.photos.length >= 10 ? "disabled" : ""}">
      <input id="photoInput" type="file" accept="image/*" multiple ${place.photos.length >= 10 ? "disabled" : ""}>
      <span class="empty-state-icon">＋</span><strong>${place.photos.length >= 10 ? "Hai raggiunto il massimo di 10 foto" : "Aggiungi le foto più belle"}</strong><span>Le immagini vengono ottimizzate e salvate soltanto su questo dispositivo.</span>
    </label>
    <div class="memory-gallery" id="memoryGallery">${place.photos.map((photo, index) => `<div class="memory-photo" data-photo-index="${index}"><img src="${photo.data}" alt="Ricordo ${index + 1} di ${escapeHTML(place.name)}"><button type="button" data-delete-photo="${index}" aria-label="Elimina foto">×</button></div>`).join("")}</div>
    ${place.photos.length ? `<p class="field-note">${place.photos.length}/10 foto · Tocca una foto per vederla a tutto schermo.</p>` : `<p class="field-note">La galleria è ancora vuota: scegli il primo ricordo da custodire qui.</p>`}`;
  }

  function refreshGallery(placeId) {
    const place = placeById(placeId);
    if (!place) return;
    $("#formBody").innerHTML = galleryBody(place);
    bindGalleryEvents(placeId);
  }

  function bindGalleryEvents(placeId) {
    const place = placeById(placeId);
    const input = $("#photoInput");
    if (input) input.addEventListener("change", async event => {
      const remaining = 10 - place.photos.length;
      const files = [...event.target.files].slice(0, remaining);
      if (!files.length) return;
      showToast("Sto preparando le foto…");
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const data = await compressImage(file);
          const photo = { id: uid(), data, name: file.name, addedAt: new Date().toISOString() };
          place.photos.push(photo);
          if (!saveState({ silent: true })) { place.photos.pop(); break; }
        } catch (error) {
          console.warn(error);
          showToast(`Non riesco ad aggiungere ${file.name}.`);
        }
      }
      place.updatedAt = new Date().toISOString();
      saveState(); refreshGallery(placeId); showToast("Foto aggiunte ai vostri ricordi.");
    });
    const gallery = $("#memoryGallery");
    if (gallery) gallery.addEventListener("click", event => {
      const deleteButton = event.target.closest("[data-delete-photo]");
      if (deleteButton) {
        event.stopPropagation();
        const index = Number(deleteButton.dataset.deletePhoto);
        if (confirm("Eliminare questa foto ricordo?")) { place.photos.splice(index, 1); saveState(); refreshGallery(placeId); }
        return;
      }
      const photoElement = event.target.closest("[data-photo-index]");
      if (!photoElement) return;
      const photo = place.photos[Number(photoElement.dataset.photoIndex)];
      if (photo) showPhoto(photo, place);
    });
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
          const maxSide = 1050;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const context = canvas.getContext("2d", { alpha: false });
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          let quality = .72;
          let result = canvas.toDataURL("image/jpeg", quality);
          while (result.length > 420000 && quality > .42) {
            quality -= .08;
            result = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(result);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function showPhoto(photo, place) {
    $("#viewerImage").src = photo.data;
    $("#viewerCaption").textContent = `${place.name} · ${photo.name || "Il nostro ricordo"}`;
    $("#photoViewer").showModal();
  }

  function openRatingEditor(placeId) {
    const place = placeById(placeId);
    if (!place) return;
    if (place.status !== "visited") return showToast("Operazione non possibile: devi prima visitare la città.");
    const values = Object.fromEntries(RATING_FIELDS.map(([key]) => [key, Number(place.ratings?.[key] || 7)]));
    openDynamicForm({
      kicker: place.name,
      title: place.ratings ? "Modifica la valutazione" : "Quanto vi è piaciuta?",
      subtitle: "Dai un voto da 1 a 10, anche con incrementi di 0,1.",
      body: `<div class="rating-fields">${RATING_FIELDS.map(([key, label]) => `<div class="rating-field"><label for="rating-${key}">${label}</label><input id="rating-${key}" name="${key}" type="range" min="1" max="10" step="0.1" value="${values[key]}"><span class="rating-value" data-rating-value="${key}">${values[key].toFixed(1)}</span></div>`).join("")}</div>
      <div class="rating-summary"><span>Media complessiva</span><strong id="liveAverage">${averageRating(values).toFixed(1)}</strong></div>`,
      saveText: "Salva valutazione",
      onSave: formData => {
        place.ratings = Object.fromEntries(RATING_FIELDS.map(([key]) => [key, Number(formData.get(key))]));
        place.updatedAt = new Date().toISOString();
        saveState(); celebrate(); showToast(`Valutazione di ${place.name} salvata.`); return true;
      }
    });
    $$("input[type='range']", $("#formBody")).forEach(input => input.addEventListener("input", () => {
      $(`[data-rating-value="${input.name}"]`).textContent = Number(input.value).toFixed(1);
      const current = Object.fromEntries(RATING_FIELDS.map(([key]) => [key, Number($(`[name="${key}"]`, $("#formBody")).value)]));
      $("#liveAverage").textContent = averageRating(current).toFixed(1);
    }));
  }

  function openPlaceDetails(placeId) {
    const place = placeById(placeId);
    if (!place) return;
    openDynamicForm({
      kicker: `${place.country || "Destinazione"} · ${STATUS[place.status].label}`,
      title: place.name,
      subtitle: "Il resoconto completo del vostro viaggio.",
      body: detailsBody(place),
      showSave: false,
      deleteText: "Elimina meta",
      onDelete: () => deletePlace(place.id)
    });
    bindDetailsEvents(placeId);
  }

  function detailsBody(place) {
    const score = averageRating(place.ratings);
    const ratings = place.ratings ? RATING_FIELDS.map(([key, label]) => `<div class="detail-box"><small>${escapeHTML(label)}</small><strong>${Number(place.ratings[key]).toFixed(1)} / 10</strong></div>`).join("") : `<div class="empty-state"><div><strong>Questo viaggio non è ancora stato valutato</strong><p>La valutazione diventa disponibile quando la meta è segnata come visitata.</p>${place.status === "visited" ? `<button type="button" class="primary-button" data-detail-action="rate">Valuta ora</button>` : ""}</div></div>`;
    return `<div class="detail-grid">
      <div class="detail-box"><small>Periodo</small><strong>${escapeHTML(formatDateRange(place))}</strong></div>
      <div class="detail-box"><small>In compagnia di</small><strong>${escapeHTML(place.companion || "Da aggiungere")}</strong></div>
      <div class="detail-box"><small>Voto medio</small><strong>${score ? `${score.toFixed(1)} / 10` : "Non valutato"}</strong></div>
      <div class="detail-box"><small>Foto ricordo</small><strong>${place.photos.length} / 10</strong></div>
    </div>
    ${place.notes ? `<div class="detail-box"><small>Il nostro ricordo</small><strong>${escapeHTML(place.notes)}</strong></div>` : ""}
    ${place.wish ? `<div class="detail-box"><small>Il nostro desiderio</small><strong>${escapeHTML(place.wish)}</strong></div>` : ""}
    <div class="collection-section"><h3>Le nostre valutazioni</h3><div class="detail-grid">${ratings}</div></div>
    <div class="collection-section"><h3>Ristoranti preferiti</h3><div class="collection-list">${collectionItems(place.restaurants, "restaurant")}</div><div class="inline-add"><input id="restaurantName" placeholder="Nome ristorante"><input id="restaurantNote" placeholder="Piatto o ricordo preferito"><button type="button" data-add-collection="restaurant">＋</button></div></div>
    <div class="collection-section"><h3>Monumenti e luoghi preferiti</h3><div class="collection-list">${collectionItems(place.monuments, "monument")}</div><div class="inline-add"><input id="monumentName" placeholder="Nome del luogo"><input id="monumentNote" placeholder="Perché vi è piaciuto"><button type="button" data-add-collection="monument">＋</button></div></div>
    <div class="form-row"><button type="button" class="soft-button" data-detail-action="edit">Modifica informazioni</button><button type="button" class="soft-button" data-detail-action="photos">Apri le foto</button></div>`;
  }

  function collectionItems(items, type) {
    if (!items.length) return `<p class="field-note">Non hai ancora aggiunto nulla.</p>`;
    return items.map((item, index) => `<div class="collection-item"><div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.note || "Un posto da ricordare")}</small></div><button type="button" data-delete-collection="${type}" data-index="${index}" aria-label="Elimina">×</button></div>`).join("");
  }

  function bindDetailsEvents(placeId) {
    const place = placeById(placeId);
    $("#formBody").onclick = event => {
      const add = event.target.closest("[data-add-collection]");
      if (add) {
        const type = add.dataset.addCollection;
        const nameInput = type === "restaurant" ? $("#restaurantName") : $("#monumentName");
        const noteInput = type === "restaurant" ? $("#restaurantNote") : $("#monumentNote");
        const name = nameInput.value.trim();
        if (!name) return showToast("Inserisci prima un nome.");
        const target = type === "restaurant" ? place.restaurants : place.monuments;
        target.push({ id: uid(), name, note: noteInput.value.trim() });
        saveState(); refreshDetails(placeId); return;
      }
      const remove = event.target.closest("[data-delete-collection]");
      if (remove) {
        const target = remove.dataset.deleteCollection === "restaurant" ? place.restaurants : place.monuments;
        target.splice(Number(remove.dataset.index), 1); saveState(); refreshDetails(placeId); return;
      }
      const action = event.target.closest("[data-detail-action]")?.dataset.detailAction;
      if (action === "edit") { $("#formDialog").close(); openPlaceEditor(placeId); }
      if (action === "photos") { $("#formDialog").close(); openGallery(placeId); }
      if (action === "rate") { $("#formDialog").close(); openRatingEditor(placeId); }
    };
  }

  function refreshDetails(placeId) {
    const place = placeById(placeId);
    $("#formBody").innerHTML = detailsBody(place);
    bindDetailsEvents(placeId);
  }

  function renderRatings() {
    const container = $("#ratingsList");
    let places = state.places.filter(place => place.status !== "planned");
    if (activeRatingFilter === "rated") places = places.filter(place => averageRating(place.ratings));
    if (activeRatingFilter === "unrated") places = places.filter(place => !averageRating(place.ratings));
    places.sort((a, b) => {
      const scoreDifference = (averageRating(b.ratings) || 0) - (averageRating(a.ratings) || 0);
      return scoreDifference || (b.dates?.start || "").localeCompare(a.dates?.start || "");
    });
    if (!places.length) {
      container.innerHTML = emptyState("☆", activeRatingFilter === "all" ? "Nessun viaggio da raccontare" : "Nessun viaggio in questo filtro", activeRatingFilter === "all" ? "Quando una meta sarà in visita o visitata, apparirà qui con tutti i suoi dettagli." : "Prova a selezionare un altro filtro.");
      return;
    }
    container.innerHTML = places.map(place => {
      const score = averageRating(place.ratings);
      const photoStyle = place.photos[0] ? `style="background-image:url('${place.photos[0].data}')"` : "";
      return `<article class="rating-card" data-place-id="${place.id}">
        <div class="destination-avatar ${place.photos[0] ? "has-photo" : ""}" ${photoStyle}>${escapeHTML(place.name.slice(0, 1).toUpperCase())}</div>
        <div class="rating-main"><h3>${escapeHTML(place.name)}</h3><p>${escapeHTML(place.country || "Paese da definire")} · ${escapeHTML(formatDateRange(place))}</p><div class="mini-tags"><span>${place.restaurants.length} ristoranti</span><span>${place.monuments.length} luoghi</span><span>${place.photos.length} foto</span></div></div>
        <div class="score-or-action">${score ? `<span class="big-score">${score.toFixed(1)} <small>/10</small></span><small>media complessiva</small>` : `<button class="add-rating" type="button">${place.status === "visited" ? "Valuta" : "In visita"}</button>`}</div>
      </article>`;
    }).join("");
  }

  function renderStatsYearOptions() {
    const select = $("#statsYear");
    const years = new Set([new Date().getFullYear()]);
    state.places.forEach(place => {
      if (place.dates?.start) years.add(parseLocalDate(place.dates.start).getFullYear());
      if (place.dates?.end) years.add(parseLocalDate(place.dates.end).getFullYear());
    });
    const sorted = [...years].sort((a, b) => b - a);
    if (selectedStatsYear !== "all" && !sorted.includes(Number(selectedStatsYear))) selectedStatsYear = "all";
    select.innerHTML = `<option value="all">Tutti</option>${sorted.map(year => `<option value="${year}" ${String(year) === String(selectedStatsYear) ? "selected" : ""}>${year}</option>`).join("")}`;
    select.value = selectedStatsYear;
  }

  function placeOverlapsYear(place, year) {
    if (year === "all") return true;
    if (!place.dates?.start) return false;
    const start = parseLocalDate(place.dates.start);
    const end = parseLocalDate(place.dates.end || place.dates.start);
    const first = new Date(Number(year), 0, 1, 12);
    const last = new Date(Number(year), 11, 31, 12);
    return start <= last && end >= first;
  }

  function tripDaysInYear(place, year) {
    if (!place.dates?.start) return 0;
    if (year === "all") return daysBetweenInclusive(place.dates.start, place.dates.end);
    const start = parseLocalDate(place.dates.start);
    const end = parseLocalDate(place.dates.end || place.dates.start);
    const first = new Date(Number(year), 0, 1, 12);
    const last = new Date(Number(year), 11, 31, 12);
    const clippedStart = start > first ? start : first;
    const clippedEnd = end < last ? end : last;
    if (clippedEnd < clippedStart) return 0;
    return Math.round((clippedEnd - clippedStart) / 86400000) + 1;
  }

  function renderStats() {
    const travelled = state.places.filter(place => place.status !== "planned" && placeOverlapsYear(place, selectedStatsYear));
    const visitedCountries = new Set(travelled.map(place => normalize(place.country)).filter(Boolean));
    const days = travelled.reduce((sum, place) => sum + tripDaysInYear(place, selectedStatsYear), 0);
    const sortedForDistance = [...travelled].filter(place => Number.isFinite(place.lat) && Number.isFinite(place.lng)).sort((a, b) => (a.dates?.start || a.createdAt).localeCompare(b.dates?.start || b.createdAt));
    let distance = 0;
    for (let index = 1; index < sortedForDistance.length; index += 1) distance += haversineKm(sortedForDistance[index - 1], sortedForDistance[index]);
    const rated = travelled.map(place => averageRating(place.ratings)).filter(Boolean);
    const coupleAverage = rated.length ? rated.reduce((sum, value) => sum + value, 0) / rated.length : 0;
    $("#statsGrid").innerHTML = [
      ["☼", days, days === 1 ? "giorno in viaggio" : "giorni in viaggio"],
      ["⌖", travelled.length, travelled.length === 1 ? "meta vissuta" : "mete vissute"],
      ["◇", visitedCountries.size, visitedCountries.size === 1 ? "paese visitato" : "paesi visitati"],
      ["↗", distance >= 1000 ? `${(distance / 1000).toFixed(1)}k` : Math.round(distance), "km tra le mete"]
    ].map(([icon, value, label]) => `<div class="stat-card"><i>${icon}</i><strong>${value}</strong><span>${label}</span></div>`).join("");
    renderTopDestinations(travelled);
    renderContinentStats(travelled);
    renderTimeline(travelled, coupleAverage);
  }

  function renderTopDestinations(places) {
    const top = places.filter(place => averageRating(place.ratings)).sort((a, b) => averageRating(b.ratings) - averageRating(a.ratings)).slice(0, 3);
    const container = $("#topDestinations");
    if (!top.length) {
      container.innerHTML = emptyState("☆", "La classifica aspetta i tuoi voti", "Valuta almeno un viaggio per scoprire la tua meta preferita.");
      return;
    }
    container.innerHTML = top.map((place, index) => `<div class="podium-place"><span class="podium-score">${averageRating(place.ratings).toFixed(1)} / 10</span><strong>${escapeHTML(place.name)}</strong><small>${escapeHTML(place.country || "")}</small><span class="podium-number">${index + 1}</span></div>`).join("");
  }

  function renderContinentStats(places) {
    const container = $("#continentStats");
    container.innerHTML = Object.entries(CONTINENT_TOTALS).map(([continent, total]) => {
      const countries = new Set(places.filter(place => place.continent === continent).map(place => normalize(place.country)).filter(Boolean));
      const percentage = Math.min(100, (countries.size / total) * 100);
      return `<div class="continent-row"><div class="continent-name"><strong>${continent}</strong><small>${countries.size} di ${total} stati</small></div><div class="progress-track"><i style="width:${percentage}%"></i></div><div class="continent-value"><strong>${percentage.toFixed(1)}%</strong></div></div>`;
    }).join("");
  }

  function renderTimeline(places, coupleAverage = 0) {
    const container = $("#travelTimeline");
    const sorted = [...places].sort((a, b) => (b.dates?.start || b.createdAt).localeCompare(a.dates?.start || a.createdAt));
    if (!sorted.length) {
      container.innerHTML = `<p class="field-note">La timeline inizierà con il tuo primo viaggio.</p>`;
      return;
    }
    container.innerHTML = sorted.map(place => `<div class="timeline-item"><i class="timeline-dot"></i><strong>${escapeHTML(place.name)}</strong><span>${escapeHTML(formatDateRange(place))}${averageRating(place.ratings) ? ` · voto ${averageRating(place.ratings).toFixed(1)}` : ""}</span></div>`).join("") + (coupleAverage ? `<div class="timeline-item"><i class="timeline-dot"></i><strong>La media dei vostri viaggi</strong><span>${coupleAverage.toFixed(1)} su 10: niente male per due esploratori ♡</span></div>` : "");
  }

  function renderPlanned() {
    const planned = state.places.filter(place => place.status === "planned").sort((a, b) => {
      if (!a.dates?.start && !b.dates?.start) return a.name.localeCompare(b.name);
      if (!a.dates?.start) return 1;
      if (!b.dates?.start) return -1;
      return a.dates.start.localeCompare(b.dates.start);
    });
    const upcoming = planned.find(place => place.dates?.start && daysUntil(place.dates.start) >= 0) || planned[0];
    const nextCard = $("#nextTripCard");
    if (!upcoming) {
      nextCard.className = "next-trip-card empty-next";
      nextCard.removeAttribute("data-place-id");
      nextCard.innerHTML = `<div><span class="countdown">PROSSIMA AVVENTURA</span><h2>Dove andiamo?</h2><p>La vostra prossima meta non è ancora stata scelta.</p></div>`;
    } else {
      const remaining = daysUntil(upcoming.dates?.start);
      nextCard.className = "next-trip-card";
      nextCard.dataset.placeId = upcoming.id;
      nextCard.innerHTML = `<span class="countdown">${remaining === null ? "NELLA LISTA DEI SOGNI" : remaining === 0 ? "SI PARTE OGGI!" : remaining > 0 ? `MANCANO ${remaining} GIORNI` : "VIAGGIO DA AGGIORNARE"}</span><h2>${escapeHTML(upcoming.name)}</h2><p>${escapeHTML(upcoming.country || "Destinazione da scoprire")} · ${escapeHTML(formatDateRange(upcoming))}</p><span class="trip-arrow">›</span>`;
    }
    const list = $("#plannedList");
    if (!planned.length) {
      list.innerHTML = emptyState("✦", "Nessun viaggio programmato", "Salva una meta con date precise oppure aggiungila alla lista dei sogni.", "Nuovo viaggio");
      const button = $("button", list);
      if (button) button.addEventListener("click", () => openPlaceEditor(null, "planned"));
      return;
    }
    list.innerHTML = planned.map(place => {
      const start = parseLocalDate(place.dates?.start);
      return `<article class="planned-card" data-place-id="${place.id}"><div class="planned-date"><strong>${start ? start.getDate() : "♡"}</strong><span>${start ? new Intl.DateTimeFormat("it-IT", { month: "short" }).format(start) : "sogno"}</span></div><div class="rating-main"><h3>${escapeHTML(place.name)}</h3><p>${escapeHTML(place.country || "Paese da definire")} · ${escapeHTML(place.wish || place.notes || "Una nuova avventura insieme")}</p></div><span>›</span></article>`;
    }).join("");
  }

  function applyAppearance() {
    document.documentElement.dataset.accent = state.settings.accent || "lilac";
    document.documentElement.dataset.mode = state.settings.mode || "light";
    $$("[data-accent]").forEach(button => button.classList.toggle("is-active", button.dataset.accent === state.settings.accent));
    $$("[data-mode]").forEach(button => button.classList.toggle("is-active", button.dataset.mode === state.settings.mode));
  }

  function populateSettings() {
    const settings = state.settings;
    $("#settingNameOne").value = settings.nameOne || "";
    $("#settingNameTwo").value = settings.nameTwo || "";
    $("#settingAnniversary").value = settings.anniversary || "";
    $("#settingAppTitle").value = settings.appTitle || "Our Journey";
    $("#settingDedication").value = settings.dedication || "";
    applyAppearance();
  }

  function saveSettings() {
    state.settings.nameOne = $("#settingNameOne").value.trim();
    state.settings.nameTwo = $("#settingNameTwo").value.trim();
    state.settings.anniversary = $("#settingAnniversary").value;
    state.settings.appTitle = $("#settingAppTitle").value.trim() || "Our Journey";
    state.settings.dedication = $("#settingDedication").value.trim() || "Il nostro viaggio";
    saveState();
    celebrate();
    showToast("L'app è stata personalizzata.");
  }

  function handleAccentChange(event) {
    const button = event.target.closest("[data-accent]");
    if (!button) return;
    state.settings.accent = button.dataset.accent;
    applyAppearance(); saveState({ silent: true });
  }

  function handleModeChange(event) {
    const button = event.target.closest("[data-mode]");
    if (!button) return;
    state.settings.mode = button.dataset.mode;
    applyAppearance(); saveState({ silent: true });
  }

  function exportBackup() {
    const payload = { ...state, exportedAt: new Date().toISOString(), app: "Our Journey" };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `our-journey-backup-${todayISO()}.json`;
    document.body.appendChild(link);
    link.click(); link.remove(); URL.revokeObjectURL(url);
    showToast("Backup creato. Conservalo in un posto sicuro.");
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.places) || typeof parsed.settings !== "object") throw new Error("Formato non valido");
      if (!confirm(`Importare il backup con ${parsed.places.length} mete? I dati attuali verranno sostituiti.`)) return;
      state = { ...clone(DEFAULT_STATE), ...parsed, settings: { ...clone(DEFAULT_STATE.settings), ...parsed.settings } };
      if (!saveState()) throw new Error("Salvataggio non riuscito");
      populateSettings();
      showToast("Backup importato correttamente.");
    } catch (error) {
      console.warn(error);
      showToast("Questo file non è un backup valido di Our Journey.");
    }
  }

  function addDemoData() {
    if (state.places.length && !confirm("Aggiungere alcune mete di esempio senza cancellare i vostri dati?")) return;
    const examples = [
      createPlace({ name: "Parigi", country: "Francia", continent: "Europa", lat: 48.8566, lng: 2.3522, status: "visited", companion: "Noi due ♡", start: "2024-04-20", end: "2024-04-23", notes: "Passeggiate senza fretta, luci sulla Senna e una quantità poco seria di croissant.", ratings: { city: 9.4, monuments: 9.6, food: 8.8, atmosphere: 9.5, hotel: 8.2, experiences: 9.3 }, restaurants: [{ id: uid(), name: "Le Petit Jardin", note: "La cena più romantica" }], monuments: [{ id: uid(), name: "Montmartre", note: "Il tramonto più bello" }] }),
      createPlace({ name: "Firenze", country: "Italia", continent: "Europa", lat: 43.7696, lng: 11.2558, status: "visited", companion: "Noi due ♡", start: "2025-05-01", end: "2025-05-03", notes: "Arte, vicoli e una vista meravigliosa da Piazzale Michelangelo.", ratings: { city: 9.1, monuments: 9.5, food: 9.2, atmosphere: 8.9, hotel: 8.4, experiences: 9.0 }, restaurants: [{ id: uid(), name: "Trattoria del Cuore", note: "La pasta che ordineremmo di nuovo" }], monuments: [{ id: uid(), name: "Piazzale Michelangelo", note: "Vista indimenticabile" }] }),
      createPlace({ name: "Nizza", country: "Francia", continent: "Europa", lat: 43.7102, lng: 7.2620, status: "planned", companion: "Noi due ♡", start: "2026-08-18", end: "2026-08-21", wish: "Fare una passeggiata al tramonto sulla Promenade des Anglais." }),
      createPlace({ name: "Tokyo", country: "Giappone", continent: "Asia", lat: 35.6762, lng: 139.6503, status: "planned", companion: "Noi due ♡", wish: "Vedere i ciliegi in fiore e perderci tra le luci della città." })
    ];
    const existingKeys = new Set(state.places.map(place => `${normalize(place.name)}|${normalize(place.country)}`));
    state.places.push(...examples.filter(place => !existingKeys.has(`${normalize(place.name)}|${normalize(place.country)}`)));
    saveState(); celebrate(); showToast("Dati dimostrativi aggiunti.");
  }

  function resetData() {
    if (!confirm("Vuoi cancellare definitivamente mete, foto, voti e impostazioni? Prima puoi esportare un backup.")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(DEFAULT_STATE);
    populateSettings(); saveState(); setTab("map");
    showToast("L’app è stata riportata allo stato iniziale.");
  }

  async function installApp() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      return;
    }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    showToast(isIOS ? "Su Safari: Condividi → Aggiungi alla schermata Home." : "Apri il menu del browser e scegli “Installa app”.");
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function celebrate() {
    const colors = ["#c68bd8", "#8ecfe8", "#f0ad8e", "#7fa895", "#f3c96d"];
    const container = $("#confetti");
    container.innerHTML = Array.from({ length: 24 }, (_, index) => `<i style="left:${Math.random() * 100}%;background:${colors[index % colors.length]};--drift:${(Math.random() - .5) * 170}px;animation-delay:${Math.random() * .25}s"></i>`).join("");
    setTimeout(() => { container.innerHTML = ""; }, 2400);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./" }).catch(error => console.warn("Service worker non registrato", error));
    });
  }

  init();
})();
