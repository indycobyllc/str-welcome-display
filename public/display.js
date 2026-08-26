const DEFAULTS = {
  guestName: "Welcome!",
  occasion: "",
  welcomeMessage: "Your adventure begins here.",
  checkIn: "",
  checkOut: "",
  theme: "galactic",
  wifiName: "Guest Wi-Fi",
  wifiPassword: "",
  checkoutTime: "10:00 AM",
  contactText: "Message us through your booking app.",
  guideUrl: "",
  showParks: true,
  showHouse: true,
  slideSeconds: 18
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function formatDateRange(start, end) {
  if (!start && !end) return "";
  const opts = { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" };
  const toDate = value => value ? new Date(`${value}T12:00:00-04:00`) : null;
  const s = toDate(start), e = toDate(end);
  if (s && e) return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}`;
  return (s || e).toLocaleDateString("en-US", opts);
}

function makeQr(url) {
  const holder = $("qrCode");
  if (!url) {
    holder.textContent = "QR";
    return;
  }
  const img = document.createElement("img");
  img.alt = "QR code for the digital house guide";
  img.src = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(url)}`;
  holder.replaceChildren(img);
}

async function loadSettings() {
  try {
    const response = await fetch("/api/settings", { cache: "no-store" });
    if (!response.ok) throw new Error("Settings unavailable");
    return { ...DEFAULTS, ...(await response.json()) };
  } catch {
    return DEFAULTS;
  }
}

async function loadParks() {
  try {
    const response = await fetch("/api/parks", { cache: "no-store" });
    if (!response.ok) throw new Error("Park data unavailable");
    return await response.json();
  } catch (error) {
    return { parks: [], error: error.message };
  }
}

function applySettings(s) {
  $("display").dataset.theme = s.theme || "galactic";
  $("guestName").textContent = s.guestName || "Welcome!";
  $("occasion").textContent = s.occasion || "";
  $("occasion").hidden = !s.occasion;
  $("welcomeMessage").textContent = s.welcomeMessage || "";
  $("stayDates").textContent = formatDateRange(s.checkIn, s.checkOut);
  $("wifiName").textContent = s.wifiName || "Guest Wi-Fi";
  $("wifiPassword").textContent = s.wifiPassword ? `Password: ${s.wifiPassword}` : "";
  $("checkoutTime").textContent = s.checkoutTime || "10:00 AM";
  $("contactText").textContent = s.contactText || "Message us through your booking app.";
  makeQr(s.guideUrl);

  document.querySelector(".parks-slide").hidden = !s.showParks;
  document.querySelector(".house-slide").hidden = !s.showHouse;
}

function renderParks(data) {
  const grid = $("parksGrid");
  if (!data.parks?.length) {
    grid.innerHTML = `<div class="park-card"><h3>Schedules updating</h3><div class="events">Please confirm current hours in the official Disney app.</div></div>`;
    $("parksUpdated").textContent = "";
    return;
  }

  grid.innerHTML = data.parks.map(park => {
    const events = (park.events || []).slice(0, 3)
      .map(event => `<div>${escapeHtml(event.name)} — ${escapeHtml(event.time)}</div>`)
      .join("");
    return `<article class="park-card">
      <h3>${escapeHtml(park.name)}</h3>
      <div class="hours">${escapeHtml(park.hours || "Hours unavailable")}</div>
      <div class="events">${events || "No major entertainment listed."}</div>
    </article>`;
  }).join("");

  const updated = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZone: "America/New_York"
  }) : "";
  $("parksUpdated").textContent = updated ? `Updated at ${updated} Eastern` : "";
}

let slideTimer;
function startSlides(seconds) {
  const visibleSlides = [...document.querySelectorAll(".slide")].filter(s => !s.hidden);
  if (!visibleSlides.length) return;
  visibleSlides.forEach(s => s.classList.remove("active"));
  let index = 0;
  visibleSlides[0].classList.add("active");
  const duration = Math.max(8, Number(seconds) || 18) * 1000;

  const animateProgress = () => {
    const bar = $("progressBar");
    bar.style.transition = "none";
    bar.style.width = "0";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = `width ${duration}ms linear`;
        bar.style.width = "100%";
      });
    });
  };
  animateProgress();

  clearInterval(slideTimer);
  if (visibleSlides.length > 1) {
    slideTimer = setInterval(() => {
      visibleSlides[index].classList.remove("active");
      index = (index + 1) % visibleSlides.length;
      visibleSlides[index].classList.add("active");
      animateProgress();
    }, duration);
  }
}

async function refreshAll() {
  const [settings, parks] = await Promise.all([loadSettings(), loadParks()]);
  applySettings(settings);
  renderParks(parks);
  startSlides(settings.slideSeconds);
}

refreshAll();
setInterval(refreshAll, 5 * 60 * 1000);
