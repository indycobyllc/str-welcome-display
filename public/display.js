const DEFAULTS = {
  guestName: "Welcome!",
  occasion: "",
  welcomeMessage: "Your adventure begins here.",
  checkIn: "",
  checkOut: "",
  theme: "galactic",
  wifiName: "Guest Wi-Fi",
  wifiPassword: "",
  slideSeconds: 18,
  showWelcome: true,
  showEvents: true,
  showForecast: true,
  showClock: true,
  showArrival: true,
  showHomeInfo: false,
  showStoreyLake: true,
  showLocalFavorites: false,
  homeInfo: "Parking|Add parking and vehicle instructions here.\nPool & spa|Add operating and safety guidance here.\nComfort|Add thermostat and home-care guidance here.\nTrash|Add collection days and bin instructions here.\nCheckout|Add the key departure steps here.\nNeed help?|Add the best host contact method here.",
  localFavorites: "Breakfast|Add a favorite breakfast spot|A great start before the parks|\nDinner|Add a favorite dinner spot|A guest-favorite evening out|\nTreats|Add a favorite dessert stop|Perfect after a long park day|",
  reviewUrl: "",
  reviewMessage: "Thank you for staying with us. If you enjoyed your visit, we would be grateful if you shared your experience.",
  parkOrder: "disney-first",
  motionIntensity: "full",
  artworkIntensity: 80,
  transitionStyle: "auto"
};

const $ = (id) => document.getElementById(id);
let currentWeather = null;
let currentSettings = DEFAULTS;

async function cachedJson(url, key) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${url} unavailable`);
    const data = await response.json();
    try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch {}
    return { data, offline: false };
  } catch (error) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved?.data) return { data: saved.data, offline: true };
    } catch {}
    throw error;
  }
}

function setOffline(isOffline) {
  $("connectionStatus").hidden = !isOffline;
  $("display").classList.toggle("offline", isOffline);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function safeUrl(value = "") {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
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

function parseRows(value, columns) {
  return String(value || "").split("\n").map(row => row.split("|").map(item => item.trim()).slice(0, columns)).filter(row => row.some(Boolean));
}

function renderGuestPages(s) {
  const homeRows = parseRows(s.homeInfo, 2);
  $("homeInfoGrid").innerHTML = homeRows.map(([title, detail], index) => `<article><span>${["⌂", "◌", "◇", "♻", "✓", "? "][index % 6]}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></article>`).join("");
  const favorites = parseRows(s.localFavorites, 4);
  $("favoritesGrid").innerHTML = favorites.map(([category, name, note, url]) => { const link = safeUrl(url); return `<article><small>${escapeHtml(category)}</small><h3>${escapeHtml(name)}</h3><p>${escapeHtml(note)}</p>${link ? `<a href="${escapeHtml(link)}">View details ↗</a>` : ""}</article>`; }).join("");
}

function applyReviewMoment(s, todayValue, checkOut) {
  const slide = document.querySelector(".review-slide");
  const reviewUrl = safeUrl(s.reviewUrl);
  if (!reviewUrl || !checkOut || todayValue > checkOut) return slide.hidden = true;
  const daysUntil = Math.ceil((checkOut - todayValue) / 86400000);
  slide.hidden = daysUntil < 0 || daysUntil > 2;
  if (slide.hidden) return;
  $("reviewMessage").textContent = s.reviewMessage || DEFAULTS.reviewMessage;
  $("reviewTiming").textContent = daysUntil === 0 ? "Safe travels home" : daysUntil === 1 ? "Before tomorrow's checkout" : "As your stay winds down";
  const qr = $("reviewQr");
  qr.src = `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(reviewUrl)}`;
  qr.alt = "QR code linking to the Airbnb review page";
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
    const result = await cachedJson("/api/weather", "str-weather-v1");
    const weather = result.data;
    window.__dataOffline ||= result.offline;
    const details = weatherDetails(weather.weatherCode, weather.isDay);
    $("weatherIcon").textContent = details.icon;
    $("weatherTemp").textContent = `${Math.round(weather.temperature)}°`;
    $("weatherText").textContent = details.text;
    renderHourlyTimeline(weather);
    return weather;
  } catch {
    $("weatherText").textContent = "Orlando";
    return { daily: [] };
  }
}

function renderHourlyTimeline(weather) {
  const now = new Date();
  const hours = (weather.hourly || []).filter(hour => new Date(hour.time) >= now).slice(0, 5);
  if (!hours.length) return $("hourlyTimeline").replaceChildren();
  const cells = hours.map((hour, index) => {
    const date = new Date(hour.time);
    const label = index === 0 ? "Now" : date.toLocaleTimeString("en-US", { hour: "numeric" });
    const detail = weatherDetails(hour.weatherCode, date.getHours() >= 7 && date.getHours() < 19);
    return `<div><span>${escapeHtml(label)}</span><b>${detail.icon} ${Math.round(hour.temperature)}°</b><small>${Math.round(hour.rainChance || 0)}% rain</small></div>`;
  });
  const sunset = weather.daily?.[0]?.sunset;
  if (sunset) cells.push(`<div><span>Sunset</span><b>☀ ${new Date(sunset).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</b><small>Golden hour</small></div>`);
  $("hourlyTimeline").innerHTML = cells.join("");
}

function forecastHint(day) {
  if (day.rainChance >= 70) return "Pack ponchos";
  if (day.uvIndex >= 8 && day.high >= 92) return "Hydrate & take breaks";
  if (day.uvIndex >= 8) return "High UV · sunscreen";
  if (day.high >= 92) return "Plan a cool-down break";
  if (day.rainChance <= 25) return "Great park weather";
  return "A flexible park day";
}

function uvLabel(value = 0) {
  if (value >= 11) return "Extreme";
  if (value >= 8) return "Very high";
  if (value >= 6) return "High";
  if (value >= 3) return "Moderate";
  return "Low";
}

function shortDay(date) {
  return new Date(`${date}T12:00:00-04:00`).toLocaleDateString("en-US", { weekday: "long" });
}

function packingAdvice(day) {
  const items = [];
  if ((day.rainChance || 0) >= 40) items.push("ponchos");
  if ((day.uvIndex || 0) >= 6) items.push("sunscreen");
  if ((day.high || 0) >= 88) items.push("water bottles");
  if ((day.low || 100) <= 62) items.push("a light layer");
  return items.length ? items.slice(0, 3).join(" · ") : "Comfortable shoes · park-ready layers";
}

function renderWeatherSnapshot(days) {
  const snapshot = $("weatherSnapshot");
  if (!days.length) return snapshot.replaceChildren();
  const best = [...days].sort((a, b) => {
    const score = day => (day.rainChance || 0) + Math.abs(Math.min(Math.max(day.high || 80, 72), 86) - (day.high || 80)) * 3;
    return score(a) - score(b);
  })[0];
  const packDay = days.find(day => day.date > days[0].date) || days[0];
  const sunset = days[0].sunset ? new Date(days[0].sunset).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "After dinner";
  snapshot.innerHTML = `
    <article><span class="snapshot-icon">★</span><div><small>Best park day</small><strong>${escapeHtml(shortDay(best.date))}</strong><p>${Math.round(best.rainChance || 0)}% rain · High ${Math.round(best.high)}°</p></div></article>
    <article><span class="snapshot-icon">⌁</span><div><small>Pack for ${packDay === days[0] ? "today" : shortDay(packDay.date)}</small><strong>${escapeHtml(packingAdvice(packDay))}</strong><p>UV ${uvLabel(packDay.uvIndex)} · ${Math.round(packDay.rainChance || 0)}% rain</p></div></article>
    <article><span class="snapshot-icon">☀</span><div><small>Tonight's sunset</small><strong>${escapeHtml(sunset)}</strong><p>Plan photos and nighttime arrival around dusk</p></div></article>`;
}

function renderForecast(weather, settings) {
  const grid = $("forecastGrid");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
  const start = settings.checkIn && settings.checkIn > today ? settings.checkIn : today;
  const end = settings.checkOut || "9999-12-31";
  let days = (weather.daily || []).filter(day => day.date >= start && day.date <= end);
  if (!days.length) days = (weather.daily || []).slice(0, 7);

  if (!days.length) {
    grid.innerHTML = `<div class="schedule-empty">The extended forecast is updating.</div>`;
    $("forecastRange").textContent = "Orlando, Florida";
    $("forecastNote").textContent = `Weather data by ${weather.source || "Open-Meteo"} · Orlando, Florida`;
    $("weatherSnapshot").replaceChildren();
    return;
  }

  const hottest = Math.max(...days.map(day => day.high || 0));
  const wettest = Math.max(...days.map(day => day.rainChance || 0));
  grid.style.setProperty("--forecast-days", Math.min(days.length, 8));
  grid.innerHTML = days.map((day, index) => {
    const date = new Date(`${day.date}T12:00:00-04:00`);
    const label = index === 0 && day.date === today ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
    const detail = weatherDetails(day.weatherCode, true);
    const flags = [];
    if (days.length > 1 && day.high === hottest) flags.push("Hottest");
    if (days.length > 1 && wettest >= 35 && day.rainChance === wettest) flags.push("Wettest");
    return `<article class="forecast-card">
      ${flags.length ? `<div class="forecast-flags">${flags.map(flag => `<span>${flag}</span>`).join("")}</div>` : ""}
      <div class="forecast-day">${escapeHtml(label)}</div>
      <div class="forecast-date">${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
      <div class="forecast-icon" aria-hidden="true">${detail.icon}</div>
      <div class="forecast-temps"><strong>${Math.round(day.high)}°</strong><span>${Math.round(day.low)}°</span></div>
      <div class="forecast-rain">${Math.round(day.rainChance || 0)}% rain</div>
      <div class="forecast-uv"><span style="--uv:${Math.min(day.uvIndex || 0, 11)}"></span>UV ${escapeHtml(uvLabel(day.uvIndex))}</div>
      <div class="forecast-tip">${escapeHtml(forecastHint(day))}</div>
    </article>`;
  }).join("");
  renderWeatherSnapshot(days);

  const first = new Date(`${days[0].date}T12:00:00-04:00`);
  const last = new Date(`${days[days.length - 1].date}T12:00:00-04:00`);
  $("forecastRange").textContent = `${first.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${last.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  $("forecastNote").textContent = `Weather data by ${weather.source || "Open-Meteo"} · Orlando, Florida`;
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

function eventCategory(event) {
  if (event.category) return event.category;
  if (/parade|starlight|festival of fantasy|procession/i.test(event.name)) return "parade";
  if (/fireworks|happily ever after|luminous|fantasmic|celestial|movie magic|nighttime|spectacular/i.test(event.name)) return "nighttime";
  return "show";
}

function eventBadge(event) {
  const category = eventCategory(event);
  const details = {
    nighttime: { icon: "✦", label: "Nighttime" },
    parade: { icon: "⚑", label: "Parade" },
    show: { icon: "◉", label: "Show" }
  }[category];
  return `<i class="event-type event-type-${category}" title="${details.label}" aria-label="${details.label}"><b>${details.icon}</b><small>${details.label}</small></i>`;
}

async function loadSettings() {
  try {
    const result = await cachedJson("/api/settings", "str-settings-v1");
    window.__dataOffline ||= result.offline;
    return { ...DEFAULTS, ...result.data };
  } catch {
    return DEFAULTS;
  }
}

async function loadParks() {
  try {
    const result = await cachedJson("/api/parks", "str-parks-v1");
    window.__dataOffline ||= result.offline;
    return result.data;
  } catch (error) {
    return { parks: [], error: error.message };
  }
}

function applySettings(s) {
  currentSettings = s;
  const previewTheme = new URLSearchParams(location.search).get("previewTheme");
  const activeTheme = previewTheme || s.theme || "galactic";
  $("display").dataset.theme = activeTheme;
  $("display").dataset.motion = s.motionIntensity;
  const themedTransition = /star-wars|iron-man/.test(activeTheme) ? "wipe" : /harry|wizard|princess/.test(activeTheme) ? "spark" : /spider/.test(activeTheme) ? "web" : /christmas/.test(activeTheme) ? "snow" : /aurora/.test(activeTheme) ? "curtain" : "cinematic";
  $("display").dataset.transition = s.transitionStyle === "auto" ? themedTransition : s.transitionStyle;
  $("display").style.setProperty("--art-opacity", String((Number(s.artworkIntensity) || 80) / 100));
  const legacyWelcome = "Welcome to Your Orlando Vacation!";
  const guest = !s.guestName || s.guestName === legacyWelcome ? "Welcome!" : s.guestName;
  $("guestName").textContent = guest;
  $("arrivalGuest").textContent = guest;
  $("occasion").textContent = s.occasion || "";
  $("occasion").hidden = !s.occasion;
  $("welcomeMessage").textContent = s.welcomeMessage || "";
  $("stayDates").textContent = formatDateRange(s.checkIn, s.checkOut);
  $("wifiName").textContent = s.wifiName || "Guest Wi-Fi";
  $("wifiPassword").textContent = s.wifiPassword ? `Password: ${s.wifiPassword}` : "";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const checkIn = calendarDate(s.checkIn), checkOut = calendarDate(s.checkOut), todayValue = calendarDate(today);
  let dayline = "Your Orlando adventure awaits";
  let eyebrow = "Your Orlando stay";
  if (checkIn && checkOut && todayValue >= checkIn && todayValue <= checkOut) {
    const day = Math.floor((todayValue - checkIn) / 86400000) + 1;
    const remaining = Math.max(0, Math.ceil((checkOut - todayValue) / 86400000));
    dayline = todayValue === checkIn ? "Your adventure begins today" : todayValue === checkOut ? "Safe travels home" : `Day ${day} of your vacation · ${remaining} day${remaining === 1 ? "" : "s"} remaining`;
    eyebrow = todayValue === checkIn ? "Welcome to your Orlando stay" : todayValue === checkOut ? "Until next time" : "Make today unforgettable";
  } else if (checkIn && todayValue < checkIn) {
    const until = Math.ceil((checkIn - todayValue) / 86400000);
    dayline = `${until} day${until === 1 ? "" : "s"} until your vacation`;
    eyebrow = "Your getaway is almost here";
  }
  $("welcomeEyebrowText").textContent = eyebrow;
  $("vacationDayline").textContent = dayline;
  $("arrivalMessage").textContent = s.occasion || "The adventure is waiting.";
  $("arrivalGuest").textContent = guest;
  document.querySelector(".arrival-slide").hidden = !(s.showArrival && s.checkIn === today);
  document.querySelector(".welcome-slide").hidden = !s.showWelcome;
  document.querySelector(".parks-slide").hidden = !s.showEvents;
  document.querySelector(".forecast-slide").hidden = !s.showForecast;
  document.querySelector(".home-info-slide").hidden = !s.showHomeInfo;
  document.querySelector(".storey-lake-slide").hidden = !s.showStoreyLake;
  document.querySelector(".favorites-slide").hidden = !s.showLocalFavorites;
  renderGuestPages(s);
  applyReviewMoment(s, todayValue, checkOut);
  $("currentTime").parentElement.hidden = !s.showClock;
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

  const orderedParks = [...data.parks].sort((a, b) => currentSettings.parkOrder === "universal-first"
    ? Number(!/^Universal/i.test(a.name)) - Number(!/^Universal/i.test(b.name))
    : Number(/^Universal/i.test(a.name)) - Number(/^Universal/i.test(b.name)));
  hoursGrid.innerHTML = orderedParks.map(park => `<article class="hours-card">
    <div class="park-mark">${parkMark(park.name)}</div>
    <strong>${escapeHtml(park.hours || "Hours unavailable")}</strong>
  </article>`).join("");

  const eventCards = orderedParks.map(park => {
    const events = (park.events || []).slice(0, 3)
      .map(event => `<li><span class="event-name">${eventBadge(event)}<span>${escapeHtml(event.name)}</span></span><strong>${escapeHtml(event.time)}</strong></li>`)
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
  const unavailableLimit = window.innerWidth <= 720 ? 3 : window.innerWidth <= 1050 ? 4 : 7;
  const visibleUnavailable = unavailableAttractions.slice(0, unavailableLimit);
  const unavailableRemaining = Math.max(0, unavailableAttractions.length - visibleUnavailable.length);
  const disruptions = unavailableAttractions.length
    ? `${visibleUnavailable.map(item => `<span title="${escapeHtml(`${item.name} · ${item.park}`)}">${escapeHtml(item.name)} <small>${escapeHtml(item.park)}</small></span>`).join("")}${unavailableRemaining ? `<span class="disruption-more">+${unavailableRemaining} more</span>` : ""}`
    : Number(insights.unavailable)
      ? `<span>${Number(insights.unavailable)} attractions under refurbishment</span>`
      : "No refurbishments reported";
  $("insightsGrid").innerHTML = `
    <article><span>Open latest</span><strong>${insights.latestClosing ? `${escapeHtml(insights.latestClosing.park)} · ${escapeHtml(insights.latestClosing.time)}` : "Schedule updating"}</strong></article>
    <article><span>Low waits right now</span><strong>${bestBets || "Live waits updating"}</strong></article>
    <article><span>${unavailableAttractions.length ? `Refurbishments · ${unavailableAttractions.length}` : "Refurbishments"}</span><strong class="disruption-list">${disruptions}</strong></article>`;
  renderRecommendation(data, currentWeather);

  const updated = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZone: "America/New_York"
  }) : "";
  $("parksUpdated").textContent = updated ? `Updated at ${updated} Eastern` : "";
}

function renderRecommendation(data, weather) {
  const insights = data.insights || {};
  const today = weather?.daily?.[0];
  let title = "Best opportunity right now";
  let message = insights.bestBets?.length ? `${insights.bestBets[0].name} is reporting about a ${insights.bestBets[0].wait}-minute wait.` : "Live recommendations are updating.";
  if (today?.rainChance >= 65) {
    title = "Rain-smart plan";
    message = "Start with indoor attractions and keep ponchos ready for the highest rain window.";
  } else if (insights.eveningPick) {
    title = "Evening highlight";
    message = `${insights.eveningPick.name} at ${insights.eveningPick.park} · ${insights.eveningPick.time}.`;
  } else if (insights.latestClosing) {
    title = "Best for a late night";
    message = `${insights.latestClosing.park} has the latest posted closing time at ${insights.latestClosing.time}.`;
  }
  $("smartRecommendation").innerHTML = `<span>✦ ${escapeHtml(title)}</span><strong>${escapeHtml(message)}</strong>`;
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
  let visibleSlides = [...document.querySelectorAll(".slide")].filter(s => !s.hidden);
  if (!visibleSlides.length) {
    document.querySelector(".welcome-slide").hidden = false;
    visibleSlides = [document.querySelector(".welcome-slide")];
  }
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
  window.__dataOffline = !navigator.onLine;
  const [settings, parks, weather] = await Promise.all([loadSettings(), loadParks(), loadWeather()]);
  currentWeather = weather;
  applySettings(settings);
  renderParks(parks);
  renderForecast(weather, settings);
  startSlides(settings.slideSeconds);
  setOffline(Boolean(window.__dataOffline));
}

updateClock();
setInterval(updateClock, 30 * 1000);
refreshAll();
setInterval(refreshAll, 5 * 60 * 1000);
window.addEventListener("online", refreshAll);
window.addEventListener("offline", () => setOffline(true));
setInterval(() => {
  const x = Math.round(Math.random() * 4 - 2);
  const y = Math.round(Math.random() * 4 - 2);
  $("display").style.setProperty("--burn-x", `${x}px`);
  $("display").style.setProperty("--burn-y", `${y}px`);
}, 4 * 60 * 1000);
