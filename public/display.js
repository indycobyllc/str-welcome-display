const DEFAULTS = {
  guestName: "Welcome!",
  occasion: "",
  welcomeMessage: "Your adventure begins here.",
  checkIn: "",
  checkOut: "",
  theme: "galactic",
  wifiName: "Guest Wi-Fi",
  wifiPassword: "",
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

function calendarDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function applyStaySummary(start, end) {
  const holder = $("staySummary");
  const checkIn = calendarDate(start);
  const checkOut = calendarDate(end);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    holder.hidden = true;
    return;
  }

  const todayText = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
  const today = calendarDate(todayText);
  const dayMs = 86400000;
  const nights = Math.round((checkOut - checkIn) / dayMs);
  $("stayLength").textContent = `${nights}-night stay`;

  if (today < checkIn) {
    const until = Math.ceil((checkIn - today) / dayMs);
    $("daysRemaining").textContent = `Begins in ${until} day${until === 1 ? "" : "s"}`;
  } else if (today < checkOut) {
    const remaining = Math.ceil((checkOut - today) / dayMs);
    $("daysRemaining").textContent = `${remaining} day${remaining === 1 ? "" : "s"} remaining`;
  } else if (today === checkOut) {
    $("daysRemaining").textContent = "Departure day";
  } else {
    $("daysRemaining").textContent = "Thanks for staying with us";
  }
  holder.hidden = false;
}

function updateClock() {
  const now = new Date();
  $("currentTime").textContent = now.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZone: "America/New_York"
  });
  $("currentDate").textContent = now.toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric", timeZone: "America/New_York"
  });
}

function weatherDetails(code, isDay = true) {
  if (code === 0) return { icon: isDay ? "☀" : "☾", text: "Clear" };
  if ([1, 2].includes(code)) return { icon: isDay ? "🌤" : "☁", text: "Partly cloudy" };
  if (code === 3) return { icon: "☁", text: "Cloudy" };
  if ([45, 48].includes(code)) return { icon: "≋", text: "Foggy" };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: "🌦", text: "Drizzle" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: "☂", text: "Rain" };
  if ([95, 96, 99].includes(code)) return { icon: "ϟ", text: "Thunderstorms" };
  return { icon: "○", text: "Orlando" };
}

async function loadWeather() {
  try {
    const response = await fetch("/api/weather", { cache: "no-store" });
    if (!response.ok) throw new Error("Weather unavailable");
    const weather = await response.json();
    const details = weatherDetails(weather.weatherCode, weather.isDay);
    $("weatherIcon").textContent = details.icon;
    $("weatherTemp").textContent = `${Math.round(weather.temperature)}°`;
    $("weatherText").textContent = details.text;
  } catch {
    $("weatherText").textContent = "Orlando";
  }
}

function parkLogo(name) {
  if (/magic kingdom/i.test(name)) return "/assets/parks/magic-kingdom.svg";
  if (/epcot/i.test(name)) return "/assets/parks/epcot.svg";
  if (/hollywood/i.test(name)) return "/assets/parks/hollywood-studios.svg";
  if (/animal kingdom/i.test(name)) return "/assets/parks/animal-kingdom.svg";
  return "";
}

function parkMark(name) {
  const logo = parkLogo(name);
  if (logo) return `<img src="${logo}" alt="${escapeHtml(name)}">`;
  const shortName = name.replace(/^Universal\s+/i, "");
  return `<span class="universal-mark"><small>Universal</small>${escapeHtml(shortName)}</span>`;
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
  applyStaySummary(s.checkIn, s.checkOut);
}

function renderParks(data) {
  const hoursGrid = $("parkHoursGrid");
  const eventsGrid = $("eventsGrid");
  if (!data.parks?.length) {
    hoursGrid.innerHTML = `<div class="schedule-empty">Park schedules are updating.</div>`;
    eventsGrid.innerHTML = `<div class="schedule-empty">Please confirm current events in the official park apps.</div>`;
    $("parksUpdated").textContent = "";
    return;
  }

  hoursGrid.innerHTML = data.parks.map(park => `<article class="hours-card">
    <div class="park-mark">${parkMark(park.name)}</div>
    <strong>${escapeHtml(park.hours || "Hours unavailable")}</strong>
  </article>`).join("");

  eventsGrid.innerHTML = data.parks.map(park => {
    const events = (park.events || []).slice(0, 3)
      .map(event => `<li><span>${escapeHtml(event.name)}</span><strong>${escapeHtml(event.time)}</strong></li>`)
      .join("");
    return `<article class="park-card">
      <div class="park-card-heading">${parkMark(park.name)}</div>
      <ul class="event-list">${events || "<li><span>No major entertainment listed.</span></li>"}</ul>
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
  const [settings, parks] = await Promise.all([loadSettings(), loadParks(), loadWeather()]);
  applySettings(settings);
  renderParks(parks);
  startSlides(settings.slideSeconds);
}

updateClock();
setInterval(updateClock, 30 * 1000);
refreshAll();
setInterval(refreshAll, 5 * 60 * 1000);
