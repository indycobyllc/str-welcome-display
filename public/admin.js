const FIELDS = [
  "guestName", "occasion", "welcomeMessage", "checkIn", "checkOut", "theme",
  "wifiName", "wifiPassword", "slideSeconds", "showWelcome", "showEvents",
  "showForecast", "showClock", "showArrival", "parkOrder", "motionIntensity",
  "artworkIntensity", "transitionStyle"
  , "showHomeInfo", "showStoreyLake", "showNearbyMap", "showLocalFavorites", "propertyAddress", "homeInfo",
  "localFavorites", "reviewUrl", "reviewMessage"
];
const $ = id => document.getElementById(id);
const SCHEDULE_PAGES = ["welcome", "events", "forecast", "homeInfo", "storeyLake", "nearbyMap", "localFavorites"];

function setStatus(message, type = "") {
  const node = $("status");
  node.textContent = message;
  node.className = `status ${type}`;
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

$("loadButton").addEventListener("click", loadSettings);
$("publishButton").addEventListener("click", publish);
$("adminToken").addEventListener("keydown", event => {
  if (event.key === "Enter") loadSettings();
});
document.querySelectorAll("[data-schedule-page]").forEach(select => select.addEventListener("change", () => updateScheduleRow(select.dataset.schedulePage)));
$("theme").addEventListener("change", updateThemeGallery);
$("themeGallery").addEventListener("click", event => {
  const button = event.target.closest(".theme-preview");
  if (!button) return;
  $("theme").value = button.dataset.themeValue;
  updateThemeGallery();
});
renderThemeGallery();
