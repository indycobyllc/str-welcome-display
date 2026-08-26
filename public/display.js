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
    return weather;
  } catch {
    $("weatherText").textContent = "Orlando";
    return { daily: [] };
  }
}

function forecastHint(day) {
  if (day.rainChance >= 70) return "Pack ponchos";
  if (day.uvIndex >= 8 && day.high >= 92) return "Hydrate & take breaks";
  if (day.uvIndex >= 8) return "High UV · sunscreen";
  if (day.high >= 92) return "Plan a cool-down break";
  if (day.rainChance <= 25) return "Great park weather";
  return "A flexible park day";
}

function renderForecast(weather, settings) {
  const grid = $("forecastGrid");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
  const start = settings.checkIn && settings.checkIn > today ? settings.checkIn : today;
  const end = settings.checkOut || "9999-12-31";
  let days = (weather.daily || []).filter(day => day.date >= start && day.date <= end);
  const isStayForecast = Boolean(settings.checkIn && settings.checkOut);
  if (!days.length) days = (weather.daily || []).slice(0, 7);

  if (!days.length) {
    grid.innerHTML = `<div class="schedule-empty">The extended forecast is updating.</div>`;
    $("forecastRange").textContent = "Orlando, Florida";
    $("forecastNote").textContent = "";
    return;
  }

  grid.style.setProperty("--forecast-days", Math.min(days.length, 8));
  grid.innerHTML = days.map((day, index) => {
    const date = new Date(`${day.date}T12:00:00-04:00`);
    const label = index === 0 && day.date === today ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
    const detail = weatherDetails(day.weatherCode, true);
    return `<article class="forecast-card">
      <div class="forecast-day">${escapeHtml(label)}</div>
      <div class="forecast-date">${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
      <div class="forecast-icon" aria-hidden="true">${detail.icon}</div>
      <div class="forecast-temps"><strong>${Math.round(day.high)}°</strong><span>${Math.round(day.low)}°</span></div>
      <div class="forecast-rain">${Math.round(day.rainChance || 0)}% rain</div>
      <div class="forecast-tip">${escapeHtml(forecastHint(day))}</div>
    </article>`;
  }).join("");

  const first = new Date(`${days[0].date}T12:00:00-04:00`);
  const last = new Date(`${days[days.length - 1].date}T12:00:00-04:00`);
  $("forecastRange").textContent = `${first.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${last.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  $("forecastNote").textContent = isStayForecast ? "Forecast matched to the dates entered in the guest admin." : "Add check-in and checkout dates in the admin to match the guest’s stay.";
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
  const legacyWelcome = "Welcome to Your Orlando Vacation!";
  $("guestName").textContent = !s.guestName || s.guestName === legacyWelcome ? "Welcome!" : s.guestName;
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

  const eventCards = data.parks.map(park => {
    const events = (park.events || []).slice(0, 3)
      .map(event => `<li><span>${escapeHtml(event.name)}</span><strong>${escapeHtml(event.time)}</strong></li>`)
      .join("");
    return `<article class="park-card">
      <div class="park-card-heading">${parkMark(park.name)}</div>
      <ul class="event-list">${events || "<li><span>No major entertainment listed.</span></li>"}</ul>
    </article>`;
  });
  const firstGroup = eventCards.slice(0, 4).join("");
  const secondGroup = eventCards.slice(4).join("");
  eventsGrid.innerHTML = `<div class="event-page active" data-event-page="0">${firstGroup}</div>
    ${secondGroup ? `<div class="event-page" data-event-page="1">${secondGroup}</div>` : ""}`;

  const insights = data.insights || {};
  const bestBets = (insights.bestBets || []).map(item => `${escapeHtml(item.name)} · ${Number(item.wait)} min`).join("<br>");
  const unavailableAttractions = Array.isArray(insights.unavailableAttractions) ? insights.unavailableAttractions : [];
  const disruptions = unavailableAttractions.length
    ? unavailableAttractions.map(item => `<span>${escapeHtml(item.name)} <small>${escapeHtml(item.park)}</small></span>`).join("")
    : Number(insights.unavailable)
      ? `<span>${Number(insights.unavailable)} attractions temporarily unavailable</span>`
      : "No major disruptions reported";
  $("insightsGrid").innerHTML = `
    <article><span>Open latest</span><strong>${insights.latestClosing ? `${escapeHtml(insights.latestClosing.park)} · ${escapeHtml(insights.latestClosing.time)}` : "Schedule updating"}</strong></article>
    <article><span>Low waits right now</span><strong>${bestBets || "Live waits updating"}</strong></article>
    <article><span>${unavailableAttractions.length ? `Unavailable now · ${unavailableAttractions.length}` : "Good to know"}</span><strong class="disruption-list">${disruptions}</strong></article>`;

  const updated = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZone: "America/New_York"
  }) : "";
  $("parksUpdated").textContent = updated ? `Updated at ${updated} Eastern` : "";
}

let slideTimer;
let eventPageTimer;

function showEventPage(index) {
  const pages = [...document.querySelectorAll(".event-page")];
  pages.forEach((page, pageIndex) => page.classList.toggle("active", pageIndex === index));
}

function resetEventPages(duration) {
  clearTimeout(eventPageTimer);
  showEventPage(0);
  if (document.querySelectorAll(".event-page").length > 1) {
    eventPageTimer = setTimeout(() => showEventPage(1), duration / 2);
  }
}

function updatePageTitle(slide) {
  $("pageTitle").textContent = slide?.dataset.pageTitle || "";
}

function startSlides(seconds) {
  const visibleSlides = [...document.querySelectorAll(".slide")].filter(s => !s.hidden);
  if (!visibleSlides.length) return;
  visibleSlides.forEach(s => s.classList.remove("active"));
  let index = 0;
  visibleSlides[0].classList.add("active");
  updatePageTitle(visibleSlides[0]);
  const duration = Math.max(8, Number(seconds) || 18) * 1000;
  if (visibleSlides[0].classList.contains("parks-slide")) resetEventPages(duration);

  clearInterval(slideTimer);
  if (visibleSlides.length > 1) {
    slideTimer = setInterval(() => {
      visibleSlides[index].classList.remove("active");
      index = (index + 1) % visibleSlides.length;
      visibleSlides[index].classList.add("active");
      updatePageTitle(visibleSlides[index]);
      if (visibleSlides[index].classList.contains("parks-slide")) {
        resetEventPages(duration);
      } else {
        clearTimeout(eventPageTimer);
      }
    }, duration);
  }
}

async function refreshAll() {
  const [settings, parks, weather] = await Promise.all([loadSettings(), loadParks(), loadWeather()]);
  applySettings(settings);
  renderParks(parks);
  renderForecast(weather, settings);
  startSlides(settings.slideSeconds);
}

updateClock();
setInterval(updateClock, 30 * 1000);
refreshAll();
setInterval(refreshAll, 5 * 60 * 1000);
