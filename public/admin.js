const FIELDS = [
  "guestName", "occasion", "welcomeMessage", "checkIn", "checkOut", "theme",
  "wifiName", "wifiPassword", "slideSeconds", "showWelcome", "showEvents",
  "showForecast", "showClock", "showArrival", "parkOrder", "motionIntensity",
  "artworkIntensity", "transitionStyle"
  , "showHomeInfo", "showStoreyLake", "showNearbyMap", "showLocalFavorites", "propertyAddress", "homeInfo",
  "showNearbyEasy", "nearbyFavorites", "localFavorites", "reviewUrl", "reviewMessage"
  , "language", "showCelebration", "celebrationType", "celebrationDate", "celebrationName", "celebrationMessage"
];
const $ = id => document.getElementById(id);
const SCHEDULE_PAGES = ["welcome", "events", "forecast", "homeInfo", "storeyLake", "nearbyMap", "nearbyEasy", "localFavorites"];
const DURATION_PAGES = [...SCHEDULE_PAGES, "celebration", "review"];
const PAGE_LABELS = { welcome:"Welcome & park hours", events:"Events & insights", forecast:"Stay forecast", homeInfo:"Home information", storeyLake:"Storey Lake amenities", nearbyMap:"Nearby attractions map", nearbyEasy:"Nearby & easy", localFavorites:"Local favorites" };
const ORDER_LABELS = { arrival:"Arrival cinematic", ...PAGE_LABELS, celebration:"Celebration moment", review:"Checkout review" };
const DEFAULT_PAGE_ORDER = Object.keys(ORDER_LABELS);
let pageOrder = [...DEFAULT_PAGE_ORDER];
let plannedStays = [];

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
    return `<article class="planned-stay ${state === "Active now" ? "active" : ""}"><div><small>${state}</small><h3>${escapeAdmin(stay.guestName)}</h3><p>${escapeAdmin(stay.checkIn)} → ${escapeAdmin(stay.checkOut)} · ${escapeAdmin(stay.theme)}</p></div><button type="button" class="secondary" data-edit-stay="${escapeAdmin(stay.id)}">Edit</button></article>`;
  }).join("");
}

function editStay(stay = {}) {
  $("stayId").value = stay.id || "";
  $("stayGuestName").value = stay.guestName || "";
  $("stayCheckIn").value = stay.checkIn || "";
  $("stayCheckOut").value = stay.checkOut || "";
  $("stayWelcomeMessage").value = stay.welcomeMessage || "Your adventure begins here!";
  $("stayOccasion").value = stay.occasion || "";
  $("stayTheme").value = stay.theme || $("theme").value || "galactic";
  $("stayLanguage").value = stay.language || "en";
  $("stayCelebrationType").value = stay.showCelebration ? (stay.celebrationType || "birthday") : "none";
  $("stayCelebrationDate").value = stay.celebrationDate || "";
  $("stayCelebrationName").value = stay.celebrationName || "";
  $("stayCelebrationMessage").value = stay.celebrationMessage || "Wishing you an unforgettable day filled with magic and memories!";
  $("deleteStayButton").hidden = !stay.id;
  $("stayEditor").hidden = false;
  $("stayEditor").scrollIntoView({ behavior:"smooth", block:"nearest" });
}

function collectStay() {
  const celebrationType = $("stayCelebrationType").value;
  return { id:$("stayId").value, guestName:$("stayGuestName").value.trim(), checkIn:$("stayCheckIn").value, checkOut:$("stayCheckOut").value, welcomeMessage:$("stayWelcomeMessage").value.trim(), occasion:$("stayOccasion").value.trim(), theme:$("stayTheme").value, language:$("stayLanguage").value, showCelebration:celebrationType !== "none", celebrationType:celebrationType === "none" ? "birthday" : celebrationType, celebrationDate:$("stayCelebrationDate").value, celebrationName:$("stayCelebrationName").value.trim(), celebrationMessage:$("stayCelebrationMessage").value.trim() };
}

async function loadStays() {
  const response = await fetch("/api/admin/stays", { headers:{ Authorization:`Bearer ${token()}` }, cache:"no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "Incorrect admin password." : "Unable to load upcoming stays.");
  plannedStays = (await response.json()).stays || [];
  renderStays();
}

async function saveStay() {
  if (!token()) return setStatus("Enter the admin password first.", "error");
  setStatus("Saving stay…");
  try {
    const response = await fetch("/api/admin/stays", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` }, body:JSON.stringify({ action:"save", stay:collectStay() }) });
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
  if (settings.guestName === "Welcome to Your Orlando Vacation!") {
    $("guestName").value = "Welcome!";
  }
  updateThemeGallery();
}

function collect() {
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
  return result;
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
  $("previewLink").href = `/?previewTheme=${encodeURIComponent($("theme").value)}`;
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
    await loadStays();
    setStatus("Current settings loaded.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function publish() {
  if (!token()) return setStatus("Enter the admin password first.", "error");
  setStatus("Publishing…");
  try {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify(collect())
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
$("theme").addEventListener("change", updateThemeGallery);
$("themeGallery").addEventListener("click", event => {
  const button = event.target.closest(".theme-preview");
  if (!button) return;
  $("theme").value = button.dataset.themeValue;
  updateThemeGallery();
});
renderThemeGallery();
