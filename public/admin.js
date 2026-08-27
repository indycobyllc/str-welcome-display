const FIELDS = [
  "guestName", "occasion", "welcomeMessage", "checkIn", "checkOut", "theme",
  "wifiName", "wifiPassword", "slideSeconds", "showWelcome", "showEvents",
  "showForecast", "showClock", "showArrival", "parkOrder", "motionIntensity",
  "artworkIntensity", "transitionStyle"
  , "showHomeInfo", "showStoreyLake", "showNearbyMap", "showLocalFavorites", "propertyAddress", "homeInfo",
  "localFavorites", "reviewUrl", "reviewMessage"
  , "language", "showCelebration", "celebrationType", "celebrationDate", "celebrationName", "celebrationMessage"
];
const $ = id => document.getElementById(id);
const SCHEDULE_PAGES = ["welcome", "events", "forecast", "homeInfo", "storeyLake", "nearbyMap", "localFavorites"];
const DURATION_PAGES = [...SCHEDULE_PAGES, "celebration", "review"];
const PAGE_LABELS = { welcome:"Welcome & park hours", events:"Events & insights", forecast:"Stay forecast", homeInfo:"Home information", storeyLake:"Storey Lake amenities", nearbyMap:"Nearby attractions map", localFavorites:"Local favorites" };
const ORDER_LABELS = { arrival:"Arrival cinematic", ...PAGE_LABELS, celebration:"Celebration moment", review:"Checkout review" };
const DEFAULT_PAGE_ORDER = Object.keys(ORDER_LABELS);
let pageOrder = [...DEFAULT_PAGE_ORDER];

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

function selectAdminTab(tab) {
  document.querySelectorAll("[data-admin-tab]").forEach(button => button.classList.toggle("active", button.dataset.adminTab === tab));
  document.querySelectorAll("[data-admin-tabs]").forEach(section => { section.hidden = !section.dataset.adminTabs.split(" ").includes(tab); });
}

function token() {
  return $("adminToken").value.trim();
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
selectAdminTab("guest");
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
document.querySelector(".admin-tabs").addEventListener("click", event => {
  const button = event.target.closest("[data-admin-tab]");
  if (button) selectAdminTab(button.dataset.adminTab);
});
$("theme").addEventListener("change", updateThemeGallery);
$("themeGallery").addEventListener("click", event => {
  const button = event.target.closest(".theme-preview");
  if (!button) return;
  $("theme").value = button.dataset.themeValue;
  updateThemeGallery();
});
renderThemeGallery();
