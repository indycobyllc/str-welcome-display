const FIELDS = [
  "guestName", "occasion", "welcomeMessage", "checkIn", "checkOut", "theme",
  "wifiName", "wifiPassword", "slideSeconds", "showWelcome", "showEvents",
  "showForecast", "showClock", "showArrival", "parkOrder", "motionIntensity",
  "artworkIntensity", "transitionStyle", "lgSignageOptimized"
  , "showMorningShow", "morningShowTime", "morningShowDuration"
  , "showNightShow", "nightShowTime", "nightShowDuration"
  , "showFullNightSpectacular"
  , "smartRotation", "maxRotationPages"
  , "showHomeInfo", "showStoreyLake", "showNearbyMap", "showLocalFavorites", "propertyAddress", "homeInfo",
  "showNearbyEasy", "nearbyFavorites", "localFavorites", "reviewUrl", "rebookUrl", "reviewMessage"
  , "language", "showCelebration", "celebrationType", "celebrationDate", "celebrationEndDate", "celebrationName", "celebrationKicker", "celebrationHeadline", "showCelebrationMessage", "celebrationMessage"
];
const $ = id => document.getElementById(id);
function cleanGuestName(value) {
  return String(value || "").trim()
    .replace(/^welcome(?:\s+to\s+your\s+orlando\s+vacation)?[\s,!:\-–—]*/i, "")
    .replace(/^the\s+/i, "").replace(/[!.]+$/g, "").trim();
}
const SCHEDULE_PAGES = ["welcome", "events", "forecast", "homeInfo", "storeyLake", "nearbyMap", "nearbyEasy", "localFavorites"];
const DURATION_PAGES = [...SCHEDULE_PAGES, "celebration", "review"];
const PAGE_LABELS = { welcome:"Welcome & park hours", events:"Events & insights", forecast:"Stay forecast", homeInfo:"Home information", storeyLake:"Storey Lake amenities", nearbyMap:"Nearby attractions map", nearbyEasy:"Nearby & easy", localFavorites:"Local favorites" };
const ORDER_LABELS = { arrival:"Arrival cinematic", ...PAGE_LABELS, celebration:"Celebration moment", review:"Checkout review" };
const DEFAULT_PAGE_ORDER = Object.keys(ORDER_LABELS);
let pageOrder = [...DEFAULT_PAGE_ORDER];
let plannedStays = [];
let placeCollections = { nearby:[], local:[] };
let displayAccessToken = "";

function renderScheduleRows() {
  $("scheduleRows").innerHTML = SCHEDULE_PAGES.map(page => `<div class="schedule-row">
    <strong>${PAGE_LABELS[page]}</strong>
    <select id="schedule-${page}" data-schedule-page="${page}"><option value="always">Always</option><option value="stay">During stay</option><option value="arrival">Arrival day</option><option value="first-two">First 2 days</option><option value="final-two">Final 2 days</option><option value="custom">Custom days</option></select>
    <span class="schedule-days" data-schedule-days="${page}" hidden>Days <input id="schedule-${page}-start" type="number" min="1" max="60" value="1">–<input id="schedule-${page}-end" type="number" min="1" max="60" value="60"></span>
    <label>Seconds<input id="duration-${page}" type="number" min="8" max="120" value="18"></label>
    <button type="button" class="secondary" data-preview-page="${page}">Preview</button>
  </div>`).join("");
}

function renderPageOrder() {
  $("pageOrderList").innerHTML = pageOrder.map((page, index) => `<li data-order-page="${page}"><span><b>${index + 1}</b>${ORDER_LABELS[page]}</span><div><button type="button" class="order-button" data-order-direction="up" aria-label="Move ${ORDER_LABELS[page]} up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" class="order-button" data-order-direction="down" aria-label="Move ${ORDER_LABELS[page]} down" ${index === pageOrder.length - 1 ? "disabled" : ""}>↓</button></div></li>`).join("");
}

function setStatus(message, type = "") {
  const node = $("status");
  node.textContent = message;
  node.className = `status ${type}`;
}

function token() {
  return $("adminToken").value.trim();
}

function escapeAdmin(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[character]));
}

function easternToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
}

function renderStays() {
  const today = easternToday();
  $("stayPlannerEmpty").hidden = plannedStays.length > 0;
  $("stayPlannerList").innerHTML = plannedStays.map(stay => {
    const state = stay.checkIn <= today && stay.checkOut >= today ? "Active now" : stay.checkIn > today ? "Upcoming" : "Completed";
    return `<article class="planned-stay ${state === "Active now" ? "active" : ""}"><div><small>${state}</small><h3>${escapeAdmin(stay.guestName)}</h3><p>${escapeAdmin(stay.checkIn)} → ${escapeAdmin(stay.checkOut)} · ${escapeAdmin(stay.theme)}</p></div><div class="planned-stay-actions"><button type="button" class="secondary" data-reset-stay-access="${escapeAdmin(stay.id)}">Reset guest link</button><button type="button" class="secondary" data-edit-stay="${escapeAdmin(stay.id)}">Edit</button></div></article>`;
  }).join("");
  const selected = $("rotationGuest")?.value || "base";
  if ($("rotationGuest")) {
    $("rotationGuest").innerHTML = `<option value="base">Current display guest</option>${plannedStays.map(stay => `<option value="${escapeAdmin(stay.id)}">${escapeAdmin(stay.guestName)} · ${escapeAdmin(stay.checkIn)}</option>`).join("")}`;
    $("rotationGuest").value = plannedStays.some(stay => stay.id === selected) ? selected : "base";
  }
}

function parsePlaces(value) {
  return String(value || "").split("\n").map(row => row.split("|").map(item => item.trim()).slice(0, 6)).filter(row => row.some(Boolean));
}

function serializePlaces(rows) {
  return rows.map(row => row.map(value => String(value || "").replaceAll("|", "—").replaceAll("\n", " ").trim()).join("|")).join("\n");
}

function renderPlaceEditor(kind) {
  const nearby = kind === "nearby";
  const labels = nearby ? ["Category", "Place name", "Guest note", "Directions or website", "Distance", "Service"] : ["Category", "Place name", "Personal note", "Directions or website", "Trip badge", "Optional image URL"];
  $(`${kind}PlacesEditor`).innerHTML = placeCollections[kind].map((row, index) => `<article class="place-editor-row" data-place-kind="${kind}" data-place-index="${index}"><div class="place-editor-fields">${labels.map((label, column) => `<label class="${column === 2 || column === 3 ? "place-wide" : ""}">${label}<input data-place-column="${column}" value="${escapeAdmin(row[column] || "")}" maxlength="${column === 2 ? 240 : 500}">${column === 2 ? `<small class="place-copy-count ${String(row[column] || "").length > 115 ? "warning" : ""}">${String(row[column] || "").length}/115 recommended</small>` : ""}</label>`).join("")}</div><div class="place-editor-actions"><button type="button" class="order-button" data-place-action="up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" class="order-button" data-place-action="down" ${index === placeCollections[kind].length - 1 ? "disabled" : ""}>↓</button><button type="button" class="danger compact" data-place-action="remove">Remove</button></div></article>`).join("");
}

function loadPlaceEditors() {
  placeCollections.nearby = parsePlaces($("nearbyFavorites").value);
  placeCollections.local = parsePlaces($("localFavorites").value);
  renderPlaceEditor("nearby"); renderPlaceEditor("local");
}

function syncPlaceEditors() {
  $("nearbyFavorites").value = serializePlaces(placeCollections.nearby);
  $("localFavorites").value = serializePlaces(placeCollections.local);
}

function editStay(stay = {}) {
  $("stayId").value = stay.id || "";
  $("stayGuestName").value = cleanGuestName(stay.guestName);
  $("stayCheckIn").value = stay.checkIn || "";
  $("stayCheckOut").value = stay.checkOut || "";
  $("stayWelcomeMessage").value = stay.welcomeMessage || "Your adventure begins here!";
  $("stayOccasion").value = stay.occasion || "";
  $("stayTheme").value = stay.theme || $("theme").value || "galactic";
  $("stayLanguage").value = stay.language || "en";
  $("stayCelebrationType").value = stay.showCelebration ? (stay.celebrationType || "birthday") : "none";
  $("stayCelebrationDate").value = stay.celebrationDate || "";
  $("stayCelebrationEndDate").value = stay.celebrationEndDate || "";
  $("stayCelebrationName").value = stay.celebrationName || "";
  $("stayCelebrationKicker").value = stay.celebrationKicker || "";
  $("stayCelebrationHeadline").value = stay.celebrationHeadline || "";
  $("stayShowCelebrationMessage").checked = stay.showCelebrationMessage !== false;
  $("stayCelebrationMessage").value = stay.celebrationMessage || "Wishing you an unforgettable day filled with magic and memories!";
  $("deleteStayButton").hidden = !stay.id;
  $("stayEditor").hidden = false;
  $("stayEditor").scrollIntoView({ behavior:"smooth", block:"nearest" });
}

function collectStay() {
  const celebrationType = $("stayCelebrationType").value;
  return { id:$("stayId").value, guestName:cleanGuestName($("stayGuestName").value), checkIn:$("stayCheckIn").value, checkOut:$("stayCheckOut").value, welcomeMessage:$("stayWelcomeMessage").value.trim(), occasion:$("stayOccasion").value.trim(), theme:$("stayTheme").value, language:$("stayLanguage").value, showCelebration:celebrationType !== "none", celebrationType:celebrationType === "none" ? "birthday" : celebrationType, celebrationDate:$("stayCelebrationDate").value, celebrationEndDate:$("stayCelebrationEndDate").value, celebrationName:$("stayCelebrationName").value.trim(), celebrationKicker:$("stayCelebrationKicker").value.trim(), celebrationHeadline:$("stayCelebrationHeadline").value.trim(), showCelebrationMessage:$("stayShowCelebrationMessage").checked, celebrationMessage:$("stayCelebrationMessage").value.trim() };
}

function celebrationRangeIsValid(settings) {
  return !settings.showCelebration || !settings.celebrationEndDate || !settings.celebrationDate || settings.celebrationEndDate >= settings.celebrationDate;
}

async function loadStays() {
  const response = await fetch("/api/admin/stays", { headers:{ Authorization:`Bearer ${token()}` }, cache:"no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "Incorrect admin password." : "Unable to load upcoming stays.");
  plannedStays = (await response.json()).stays || [];
  renderStays();
}

async function loadDisplayAccess(rotate = false) {
  const response = await fetch("/api/admin/display-access", { method:rotate ? "POST" : "GET", headers:{ Authorization:`Bearer ${token()}` }, cache:"no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Unable to load secure display access.");
  displayAccessToken = body.displayToken;
  $("secureDisplayUrl").value = body.displayUrl;
  updateThemeGallery();
  return body;
}

async function saveStay() {
  if (!token()) return setStatus("Enter the admin password first.", "error");
  const stay = collectStay();
  if (!celebrationRangeIsValid(stay)) return setStatus("Celebration end date must be on or after its start date.", "error");
  setStatus("Saving stay…");
  try {
    const response = await fetch("/api/admin/stays", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` }, body:JSON.stringify({ action:"save", stay }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Unable to save stay.");
    plannedStays = body.stays || [];
    renderStays();
    $("stayEditor").hidden = true;
    setStatus(body.overlaps?.length ? `Stay saved. Check overlapping dates with: ${body.overlaps.join(", ")}.` : "Upcoming stay saved.", body.overlaps?.length ? "error" : "success");
  } catch (error) { setStatus(error.message, "error"); }
}

async function deleteStay() {
  const id = $("stayId").value;
  if (!id || !confirm("Delete this planned stay?")) return;
  const response = await fetch("/api/admin/stays", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` }, body:JSON.stringify({ action:"delete", id }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return setStatus(body.error || "Unable to delete stay.", "error");
  plannedStays = body.stays || [];
  renderStays();
  $("stayEditor").hidden = true;
  setStatus("Planned stay deleted.", "success");
}

function apply(settings) {
  for (const id of FIELDS) {
    const el = $(id);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = Boolean(settings[id]);
    else if (settings[id] !== undefined && settings[id] !== null) el.value = settings[id];
  }
  for (const page of SCHEDULE_PAGES) {
    const rule = settings.pageSchedule?.[page] || {};
    $(`schedule-${page}`).value = rule.mode || "always";
    $(`schedule-${page}-start`).value = rule.startDay || 1;
    $(`schedule-${page}-end`).value = rule.endDay || 60;
    updateScheduleRow(page);
  }
  for (const page of DURATION_PAGES) {
    const input = $(`duration-${page}`);
    if (input) input.value = settings.pageDurations?.[page] || settings.slideSeconds || 18;
  }
  const savedOrder = Array.isArray(settings.pageOrder) ? settings.pageOrder.filter(page => DEFAULT_PAGE_ORDER.includes(page)) : [];
  pageOrder = [...new Set([...savedOrder, ...DEFAULT_PAGE_ORDER])];
  renderPageOrder();
  $("guestName").value = cleanGuestName(settings.guestName);
  updateThemeGallery();
  loadPlaceEditors();
  renderRotationPreview();
}

function collect() {
  syncPlaceEditors();
  const result = {};
  for (const id of FIELDS) {
    const el = $(id);
    result[id] = el.type === "checkbox" ? el.checked :
      el.type === "number" ? Number(el.value) : el.value.trim();
  }
  result.pageSchedule = Object.fromEntries(SCHEDULE_PAGES.map(page => [page, {
    mode: $(`schedule-${page}`).value,
    startDay: Number($(`schedule-${page}-start`).value) || 1,
    endDay: Number($(`schedule-${page}-end`).value) || 60
  }]));
  result.pageDurations = Object.fromEntries(DURATION_PAGES.map(page => [page, Number($(`duration-${page}`)?.value) || Number(result.slideSeconds) || 18]));
  result.pageOrder = [...pageOrder];
  result.guestName = cleanGuestName(result.guestName);
  return result;
}

function dateValue(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? new Date(`${value}T12:00:00Z`) : null; }
function scheduledForDate(page, settings, date, checkIn, checkOut) {
  const rule = settings.pageSchedule?.[page] || { mode:"always" };
  if (rule.mode === "always") return true;
  if (!date || !checkIn || !checkOut || date < checkIn || date > checkOut) return false;
  const day = Math.floor((date - checkIn) / 86400000) + 1;
  const remaining = Math.ceil((checkOut - date) / 86400000);
  return rule.mode === "stay" || (rule.mode === "arrival" && day === 1) || (rule.mode === "first-two" && day <= 2) || (rule.mode === "final-two" && remaining <= 1) || (rule.mode === "custom" && day >= rule.startDay && day <= rule.endDay);
}

async function rotationForDate(settings, dateText) {
  const date = dateValue(dateText), checkIn = dateValue(settings.checkIn), checkOut = dateValue(settings.checkOut);
  const flags = { welcome:"showWelcome", events:"showEvents", forecast:"showForecast", homeInfo:"showHomeInfo", storeyLake:"showStoreyLake", nearbyMap:"showNearbyMap", nearbyEasy:"showNearbyEasy", localFavorites:"showLocalFavorites" };
  const enabled = Object.keys(flags).filter(page => settings[flags[page]] && scheduledForDate(page, settings, date, checkIn, checkOut));
  const day = date && checkIn && date >= checkIn ? Math.floor((date - checkIn) / 86400000) + 1 : 0;
  const remaining = date && checkOut && date <= checkOut ? Math.max(0, Math.ceil((checkOut - date) / 86400000)) : 99;
  let weather = {};
  try { const response = await fetch("/api/weather"); const data = await response.json(); weather = data.daily?.find(item => item.date === dateText) || {}; } catch {}
  let preferred = day === 1 ? ["welcome","homeInfo","nearbyEasy","storeyLake","forecast","events","nearbyMap","localFavorites"] : day === 2 ? ["welcome","events","forecast","nearbyEasy","nearbyMap","storeyLake","localFavorites","homeInfo"] : remaining <= 2 ? ["welcome","events","forecast","localFavorites","nearbyEasy","homeInfo","nearbyMap","storeyLake"] : ["welcome","events","forecast","localFavorites","storeyLake","nearbyMap","nearbyEasy","homeInfo"];
  let reason = day === 1 ? "Arrival essentials prioritized" : remaining <= 2 ? "Departure-ready information prioritized" : "Balanced vacation-day rotation";
  if (Number(weather.rainChance) >= 65) { preferred = ["welcome","forecast","events","nearbyEasy","localFavorites","homeInfo","nearbyMap","storeyLake"]; reason = `Rain-smart rotation · ${weather.rainChance}% chance`; }
  else if (Number(weather.high) >= 92) { preferred = ["welcome","forecast","events","storeyLake","nearbyEasy","localFavorites","nearbyMap","homeInfo"]; reason = `Heat-smart rotation · high near ${Math.round(weather.high)}°`; }
  let regular = settings.smartRotation ? preferred.filter(page => enabled.includes(page)).slice(0, settings.maxRotationPages || 6) : enabled;
  const special = [];
  if (settings.showArrival && settings.checkIn === dateText) special.push("arrival");
  const celebrationEndDate = settings.celebrationEndDate || settings.celebrationDate;
  if (settings.showCelebration && settings.celebrationDate && dateText >= settings.celebrationDate && dateText <= celebrationEndDate) special.push("celebration");
  if (settings.reviewUrl && remaining <= 1 && remaining >= 0) special.push("review");
  return { pages:[...special, ...regular].sort((a,b) => settings.pageOrder.indexOf(a) - settings.pageOrder.indexOf(b)), reason, weather };
}

async function renderRotationPreview() {
  if (!$("rotationPreview")) return;
  const stay = plannedStays.find(item => item.id === $("rotationGuest").value);
  const settings = { ...collect(), ...(stay || {}) };
  const date = $("rotationDate").value || stay?.checkIn || settings.checkIn || easternToday();
  $("rotationDate").value = date;
  $("rotationPreview").innerHTML = `<p>Calculating this guest’s rotation…</p>`;
  const result = await rotationForDate(settings, date);
  $("rotationPreview").innerHTML = `<div class="rotation-summary"><strong>${escapeAdmin(result.reason)}</strong><span>${result.pages.length} pages · ${result.pages.reduce((sum, page) => sum + Number(settings.pageDurations?.[page] || settings.slideSeconds || 18), 0)} seconds per loop</span></div><ol>${result.pages.map((page, index) => `<li><b>${index + 1}</b><span>${escapeAdmin(ORDER_LABELS[page])}</span><small>${settings.pageDurations?.[page] || settings.slideSeconds || 18}s</small></li>`).join("") || "<li>No pages are enabled for this date.</li>"}</ol>`;
}

function updateScheduleRow(page) {
  const custom = $(`schedule-${page}`).value === "custom";
  document.querySelector(`[data-schedule-days="${page}"]`).hidden = !custom;
}

function renderThemeGallery() {
  const select = $("theme");
  $("themeGallery").innerHTML = [...select.options].map(option =>
    `<button type="button" class="theme-preview" data-theme-value="${option.value}" data-preview-theme="${option.value}"><i></i><span>${option.textContent}</span></button>`
  ).join("");
  updateThemeGallery();
}

function updateThemeGallery() {
  document.querySelectorAll(".theme-preview").forEach(button =>
    button.classList.toggle("selected", button.dataset.themeValue === $("theme").value)
  );
  const access = displayAccessToken ? `&displayToken=${encodeURIComponent(displayAccessToken)}` : "";
  $("previewLink").href = `/?previewTheme=${encodeURIComponent($("theme").value)}${access}`;
}

async function loadSettings() {
  if (!token()) return setStatus("Enter the admin password first.", "error");
  setStatus("Loading…");
  try {
    const response = await fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(response.status === 401 ? "Incorrect admin password." : "Unable to load settings.");
    apply(await response.json());
    await Promise.all([loadStays(), loadDisplayAccess()]);
    setStatus("Current settings loaded.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function publish() {
  if (!token()) return setStatus("Enter the admin password first.", "error");
  const settings = collect();
  if (!celebrationRangeIsValid(settings)) return setStatus("Celebration end date must be on or after its start date.", "error");
  setStatus("Publishing…");
  try {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify(settings)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || (response.status === 401 ? "Incorrect admin password." : "Unable to publish."));
    if (body.settings) apply(body.settings);
    const selectedTheme = $("theme").selectedOptions[0]?.textContent || body.settings?.theme || "selected theme";
    setStatus(`Published: ${selectedTheme}. The display will update within five minutes.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

renderScheduleRows();
renderPageOrder();
$("stayTheme").innerHTML = $("theme").innerHTML;
$("loadButton").addEventListener("click", loadSettings);
$("publishButton").addEventListener("click", publish);
$("adminToken").addEventListener("keydown", event => {
  if (event.key === "Enter") loadSettings();
});
document.querySelectorAll("[data-schedule-page]").forEach(select => select.addEventListener("change", () => updateScheduleRow(select.dataset.schedulePage)));
document.querySelectorAll("[data-preview-page]").forEach(button => button.addEventListener("click", () => {
  try { localStorage.setItem("str-preview-draft", JSON.stringify({ savedAt: Date.now(), settings: collect() })); } catch {}
  const params = new URLSearchParams({ previewPage: button.dataset.previewPage, previewTheme: $("theme").value });
  window.open(`/?${params}`, "_blank", "noopener");
}));
$("previewMorningShow")?.addEventListener("click", () => {
  try { localStorage.setItem("str-preview-draft", JSON.stringify({ savedAt: Date.now(), settings: collect() })); } catch {}
  const params = new URLSearchParams({ previewShow:"morning", previewTheme:$("theme").value });
  if (displayAccessToken) params.set("displayToken", displayAccessToken);
  window.open(`/?${params}`, "_blank", "noopener");
});
$("previewNightShow")?.addEventListener("click", () => {
  try { localStorage.setItem("str-preview-draft", JSON.stringify({ savedAt: Date.now(), settings: collect() })); } catch {}
  const params = new URLSearchParams({ previewShow:"night", previewTheme:$("theme").value, previewNight:$("nightShowPreviewNight")?.value || "auto" });
  if (displayAccessToken) params.set("displayToken", displayAccessToken);
  window.open(`/?${params}`, "_blank", "noopener");
});
$("pageOrderList").addEventListener("click", event => {
  const button = event.target.closest("[data-order-direction]");
  const row = event.target.closest("[data-order-page]");
  if (!button || !row) return;
  const from = pageOrder.indexOf(row.dataset.orderPage);
  const to = button.dataset.orderDirection === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= pageOrder.length) return;
  [pageOrder[from], pageOrder[to]] = [pageOrder[to], pageOrder[from]];
  renderPageOrder();
});
$("newStayButton").addEventListener("click", () => editStay());
$("cancelStayButton").addEventListener("click", () => { $("stayEditor").hidden = true; });
$("saveStayButton").addEventListener("click", saveStay);
$("deleteStayButton").addEventListener("click", deleteStay);
$("stayPlannerList").addEventListener("click", event => { const button = event.target.closest("[data-edit-stay]"); if (button) editStay(plannedStays.find(stay => stay.id === button.dataset.editStay)); });
$("stayPlannerList").addEventListener("click", async event => {
  const button = event.target.closest("[data-reset-stay-access]");
  if (!button || !confirm("Reset this guest link? Any QR code or bookmarked link already issued for this stay will stop working.")) return;
  const response = await fetch("/api/admin/stays", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` }, body:JSON.stringify({ action:"rotate-access", id:button.dataset.resetStayAccess }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return setStatus(body.error || "Unable to reset guest access.", "error");
  plannedStays = body.stays || []; renderStays(); setStatus(body.message, "success");
});
$("copyDisplayUrlButton").addEventListener("click", async () => {
  if (!$("secureDisplayUrl").value) return setStatus("Load current settings first.", "error");
  try { await navigator.clipboard.writeText($("secureDisplayUrl").value); setStatus("Secure OptiSigns URL copied.", "success"); }
  catch { $("secureDisplayUrl").select(); setStatus("Copy the selected secure URL and paste it into OptiSigns.", "success"); }
});
$("openDiagnosticsButton").addEventListener("click", () => {
  if (!$("secureDisplayUrl").value) return setStatus("Load current settings first.", "error");
  const url = new URL($("secureDisplayUrl").value);
  url.searchParams.set("diagnostics", "1");
  window.open(url.href, "_blank", "noopener");
});
$("rotateDisplayUrlButton").addEventListener("click", async () => {
  if (!confirm("Rotate TV access? The current OptiSigns URL will stop working immediately and must be replaced with the new URL.")) return;
  try { await loadDisplayAccess(true); setStatus("TV access rotated. Copy the new URL into OptiSigns now.", "success"); }
  catch (error) { setStatus(error.message, "error"); }
});
$("resetCurrentGuestLinkButton").addEventListener("click", async () => {
  if (!confirm("Reset the current guest QR? Any mobile guest-guide link already issued from the main display settings will stop working.")) return;
  const response = await fetch("/api/admin/current-guest-access", { method:"POST", headers:{ Authorization:`Bearer ${token()}` } });
  const body = await response.json().catch(() => ({}));
  setStatus(response.ok ? body.message : body.error || "Unable to reset the guest QR.", response.ok ? "success" : "error");
});
document.querySelectorAll("[data-add-place]").forEach(button => button.addEventListener("click", () => {
  const kind = button.dataset.addPlace;
  placeCollections[kind].push([kind === "nearby" ? "Food" : "Favorite", "", "", "", kind === "nearby" ? "Close by" : "Worth the drive", ""]);
  renderPlaceEditor(kind);
  $(`${kind}PlacesEditor`).lastElementChild?.scrollIntoView({ behavior:"smooth", block:"nearest" });
}));
document.querySelectorAll(".place-editor-list").forEach(editor => {
  editor.addEventListener("input", event => {
    const row = event.target.closest("[data-place-index]");
    if (!row || event.target.dataset.placeColumn === undefined) return;
    placeCollections[row.dataset.placeKind][Number(row.dataset.placeIndex)][Number(event.target.dataset.placeColumn)] = event.target.value;
    if (event.target.dataset.placeColumn === "2") { const count = event.target.parentElement.querySelector(".place-copy-count"); count.textContent = `${event.target.value.length}/115 recommended`; count.classList.toggle("warning", event.target.value.length > 115); }
  });
  editor.addEventListener("click", event => {
    const button = event.target.closest("[data-place-action]"), row = event.target.closest("[data-place-index]");
    if (!button || !row) return;
    const rows = placeCollections[row.dataset.placeKind], index = Number(row.dataset.placeIndex);
    if (button.dataset.placeAction === "remove") rows.splice(index, 1);
    else { const to = button.dataset.placeAction === "up" ? index - 1 : index + 1; if (to >= 0 && to < rows.length) [rows[index], rows[to]] = [rows[to], rows[index]]; }
    renderPlaceEditor(row.dataset.placeKind);
  });
});
$("rotationGuest").addEventListener("change", () => { const stay = plannedStays.find(item => item.id === $("rotationGuest").value); if (stay?.checkIn) $("rotationDate").value = stay.checkIn; renderRotationPreview(); });
$("rotationDate").addEventListener("change", renderRotationPreview);
$("refreshRotationButton").addEventListener("click", renderRotationPreview);
$("openRotationButton").addEventListener("click", () => {
  const stay = plannedStays.find(item => item.id === $("rotationGuest").value);
  const settings = { ...collect(), ...(stay || {}) };
  try { localStorage.setItem("str-preview-draft", JSON.stringify({ savedAt:Date.now(), settings })); } catch {}
  window.open(`/?previewDate=${encodeURIComponent($("rotationDate").value || easternToday())}&previewTheme=${encodeURIComponent(settings.theme)}`, "_blank", "noopener");
});
$("theme").addEventListener("change", updateThemeGallery);
$("themeGallery").addEventListener("click", event => {
  const button = event.target.closest(".theme-preview");
  if (!button) return;
  $("theme").value = button.dataset.themeValue;
  updateThemeGallery();
});
renderThemeGallery();
