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
  showNearbyMap: true,
  showNearbyEasy: true,
  showLocalFavorites: false,
  propertyAddress: "4290 Paragraph Drive, Kissimmee, FL 34746",
  pageSchedule: {},
  pageDurations: {},
  smartRotation: true,
  maxRotationPages: 6,
  pageOrder: ["arrival", "welcome", "events", "forecast", "homeInfo", "storeyLake", "nearbyMap", "nearbyEasy", "localFavorites", "celebration", "review"],
  nearbyFavorites: "",
  language: "en",
  showCelebration: false,
  celebrationType: "birthday",
  celebrationDate: "",
  celebrationName: "",
  celebrationMessage: "Wishing you an unforgettable day filled with magic and memories!",
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
let currentParks = null;
let currentSettings = DEFAULTS;
const TRANSLATIONS = {
  en: { stay:"Your Orlando stay", hours:"Today’s Orlando park hours", changes:"Times may change", wifi:"Wi-Fi", events:"Entertainment & Events", plan:"Plan your day", today:"Today", forecast:"Weather for Your Stay", vacationForecast:"Your vacation forecast", home:"Your Home Guide", settle:"Settle in and feel at home", good:"Good to know", resort:"Storey Lake Resort", noPlans:"No plans today? Enjoy your included resort amenities", map:"Around Orlando", closer:"You’re closer than you think", favorites:"Local Favorites", places:"A few places we genuinely love", thankYou:"Thank You", birthdayKicker:"A birthday wish just for you", anniversaryKicker:"Celebrating your anniversary", birthday:"Happy Birthday", anniversary:"Happy Anniversary" },
  es: { stay:"Tu estadía en Orlando", hours:"Horarios de los parques hoy", changes:"Los horarios pueden cambiar", wifi:"Wi-Fi", events:"Eventos y entretenimiento", plan:"Planifica tu día", today:"Hoy", forecast:"Clima durante tu estadía", vacationForecast:"Pronóstico de tus vacaciones", home:"Guía de la casa", settle:"Instálate y siéntete como en casa", good:"Información útil", resort:"Resort Storey Lake", noPlans:"¿Sin planes hoy? Disfruta de las amenidades incluidas", map:"Alrededor de Orlando", closer:"Estás más cerca de lo que imaginas", favorites:"Favoritos locales", places:"Algunos lugares que nos encantan", thankYou:"Gracias", birthdayKicker:"Un deseo de cumpleaños solo para ti", anniversaryKicker:"Celebrando su aniversario", birthday:"Feliz cumpleaños", anniversary:"Feliz aniversario" },
  fr: { stay:"Votre séjour à Orlando", hours:"Horaires des parcs aujourd’hui", changes:"Les horaires peuvent changer", wifi:"Wi-Fi", events:"Spectacles et événements", plan:"Planifiez votre journée", today:"Aujourd’hui", forecast:"Météo de votre séjour", vacationForecast:"Prévisions de vos vacances", home:"Guide de la maison", settle:"Installez-vous comme chez vous", good:"Bon à savoir", resort:"Resort Storey Lake", noPlans:"Rien de prévu? Profitez des équipements inclus", map:"Autour d’Orlando", closer:"Vous êtes plus près que vous ne le pensez", favorites:"Nos adresses préférées", places:"Quelques endroits que nous aimons", thankYou:"Merci", birthdayKicker:"Un vœu d’anniversaire rien que pour vous", anniversaryKicker:"Célébrons votre anniversaire", birthday:"Joyeux anniversaire", anniversary:"Joyeux anniversaire de mariage" },
  pt: { stay:"Sua estadia em Orlando", hours:"Horários dos parques hoje", changes:"Os horários podem mudar", wifi:"Wi-Fi", events:"Eventos e entretenimento", plan:"Planeje seu dia", today:"Hoje", forecast:"Clima durante sua estadia", vacationForecast:"Previsão das suas férias", home:"Guia da casa", settle:"Sinta-se em casa", good:"Informações úteis", resort:"Resort Storey Lake", noPlans:"Sem planos hoje? Aproveite as comodidades incluídas", map:"Perto de Orlando", closer:"Você está mais perto do que imagina", favorites:"Favoritos locais", places:"Alguns lugares que adoramos", thankYou:"Obrigado", birthdayKicker:"Um desejo de aniversário só para você", anniversaryKicker:"Celebrando seu aniversário", birthday:"Feliz aniversário", anniversary:"Feliz aniversário de casamento" },
  de: { stay:"Ihr Aufenthalt in Orlando", hours:"Heutige Parköffnungszeiten", changes:"Zeiten können sich ändern", wifi:"WLAN", events:"Shows und Veranstaltungen", plan:"Planen Sie Ihren Tag", today:"Heute", forecast:"Wetter für Ihren Aufenthalt", vacationForecast:"Ihre Urlaubsvorhersage", home:"Hausinformationen", settle:"Fühlen Sie sich wie zu Hause", good:"Gut zu wissen", resort:"Storey Lake Resort", noPlans:"Heute noch nichts vor? Genießen Sie die enthaltenen Annehmlichkeiten", map:"Orlando entdecken", closer:"Alles ist näher als Sie denken", favorites:"Lokale Favoriten", places:"Einige Orte, die wir lieben", thankYou:"Vielen Dank", birthdayKicker:"Ein Geburtstagswunsch nur für Sie", anniversaryKicker:"Wir feiern Ihren Jahrestag", birthday:"Alles Gute zum Geburtstag", anniversary:"Alles Gute zum Hochzeitstag" }
};

function applyLanguage(language) {
  const words = TRANSLATIONS[language] || TRANSLATIONS.en;
  document.documentElement.lang = language || "en";
  document.querySelectorAll("[data-i18n]").forEach(node => { if (words[node.dataset.i18n]) node.textContent = words[node.dataset.i18n]; });
  document.querySelectorAll("[data-page-key]").forEach(slide => { const key = slide.dataset.titleKey; if (key && words[key]) slide.dataset.pageTitle = words[key]; });
}

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

function scheduledPageVisible(enabled, key, settings, todayValue, checkIn, checkOut) {
  if (!enabled) return false;
  const rule = settings.pageSchedule?.[key] || { mode: "always" };
  if (rule.mode === "always") return true;
  if (!checkIn || !checkOut || todayValue < checkIn || todayValue > checkOut) return false;
  const stayDay = Math.floor((todayValue - checkIn) / 86400000) + 1;
  const daysUntilCheckout = Math.ceil((checkOut - todayValue) / 86400000);
  if (rule.mode === "stay") return true;
  if (rule.mode === "arrival") return stayDay === 1;
  if (rule.mode === "first-two") return stayDay <= 2;
  if (rule.mode === "final-two") return daysUntilCheckout <= 1;
  if (rule.mode === "custom") {
    const start = Math.max(1, Number(rule.startDay) || 1);
    const end = Math.max(start, Number(rule.endDay) || start);
    return stayDay >= start && stayDay <= end;
  }
  return true;
}

function parseRows(value, columns) {
  return String(value || "").split("\n").map(row => row.split("|").map(item => item.trim()).slice(0, columns)).filter(row => row.some(Boolean));
}

function renderGuestPages(s) {
  const homeRows = parseRows(s.homeInfo, 2);
  $("homeInfoGrid").innerHTML = homeRows.map(([title, detail], index) => `<article><span>${["⌂", "◌", "◇", "♻", "✓", "? "][index % 6]}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></article>`).join("");
  const todaySeed = Number(new Intl.DateTimeFormat("en-CA", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date()).replaceAll("-", ""));
  const rotateDaily = (rows, limit) => {
    const score = row => [...row.join("")].reduce((total, character) => ((total * 31) + character.charCodeAt(0) + todaySeed) % 2147483647, 7);
    const sorted = [...rows].sort((a, b) => score(a) - score(b));
    if (sorted.length <= limit) return sorted;
    const selected = [], categories = new Set();
    for (const row of sorted) {
      const category = row[0].toLowerCase();
      if (!categories.has(category)) { selected.push(row); categories.add(category); }
      if (selected.length === limit) return selected;
    }
    for (const row of sorted) { if (!selected.includes(row)) selected.push(row); if (selected.length === limit) break; }
    return selected;
  };
  const nearbyCards = rotateDaily(parseRows(s.nearbyFavorites, 6).filter(row => PLACE_ASSETS[row[1]]), 12).map(([category, name, note, url, distance, service]) => { const link = safeUrl(url), image = placeAsset(name); return `<article data-category="${escapeHtml(category.toLowerCase())}"><div class="favorite-visual"><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}"><small>${escapeHtml(distance)}</small></div><div><em>${escapeHtml(category)}</em><h3>${escapeHtml(name)}</h3><p>${escapeHtml(note)}</p><strong>${escapeHtml(service)}</strong>${link ? qrMarkup(link, `Scan for ${name}`) : ""}</div></article>`; });
  $("nearbyFavoritesGrid").innerHTML = pagedCards(nearbyCards, 6);
  const favoriteCards = rotateDaily(parseRows(s.localFavorites, 6).filter(row => PLACE_ASSETS[row[1]]), 12).map(([category, name, note, url, distance]) => { const link = safeUrl(url), image = placeAsset(name); return `<article data-category="${escapeHtml(category.toLowerCase())}"><div class="favorite-visual"><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}"><small>${escapeHtml(distance)}</small></div><div><em>${escapeHtml(category)}</em><h3>${escapeHtml(name)}</h3><p>${escapeHtml(note)}</p>${link ? qrMarkup(link, `Scan to plan ${name}`) : ""}</div></article>`; });
  $("favoritesGrid").innerHTML = pagedCards(favoriteCards, 6);
}

function pagedCards(cards, perPage) {
  const pages = [];
  for (let index = 0; index < cards.length; index += perPage) pages.push(`<div class="favorite-page rotating-page ${index === 0 ? "active" : ""}">${cards.slice(index, index + perPage).join("")}</div>`);
  return pages.join("");
}

const PLACE_ASSETS = {
  "Walmart Supercenter":"walmart-supercenter.jpg", "Publix · Sunrise City Plaza":"publix.jpg", "Super Target":"target.jpg",
  "King O Falafel":"king-o-falafel.jpg", "Sabor Brasil":"sabor-brasil.jpg", "Tropico Mofongo":"tropico-mofongo.jpg", "Miller's Ale House":"millers-ale-house.jpg",
  "Zuru Ramen & Hibachi":"zuru-ramen.jpg", "Taco Bell":"taco-bell.jpg", "Cracker Barrel":"cracker-barrel.jpg", "Wawa":"wawa.jpg", "Applebee's":"applebees.jpg", "Se7en Bites":"se7en-bites.jpg",
  "Beefy King":"beefy-king.jpg", "Lazy Moon Pizza":"lazy-moon.jpg", "Andretti Indoor Karting":"andretti.jpg",
  "Orlando Science Center":"orlando-science-center.jpg", "Bok Tower Gardens":"bok-tower-gardens.jpg",
  "King's Landing · Emerald Cut":"kings-landing.jpg",
  "Devil's Den Spring":"devils-den.jpg", "Kennedy Space Center":"kennedy-space-center.jpg", "Blowing Rocks Preserve":"blowing-rocks.jpg"
};

function placeAsset(name = "") { return `/assets/places/${PLACE_ASSETS[name] || ""}`; }

function qrMarkup(url, label) {
  const qrUrl = `https://quickchart.io/qr?size=150&margin=1&text=${encodeURIComponent(url)}`;
  return `<div class="favorite-qr"><img src="${escapeHtml(qrUrl)}" alt="${escapeHtml(label)}"><b>Scan</b></div>`;
}

function categoryIcon(category = "") {
  if (/grocer/i.test(category)) return "▣";
  if (/food|american|asian|brazil|caribbean|mediterranean/i.test(category)) return "●";
  if (/treat/i.test(category)) return "✦";
  if (/entertain/i.test(category)) return "▶";
  if (/nature/i.test(category)) return "♧";
  if (/trip/i.test(category)) return "↗";
  return "◇";
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
  if (new URLSearchParams(location.search).get("previewPage") || new URLSearchParams(location.search).get("previewDate")) {
    try {
      const draft = JSON.parse(localStorage.getItem("str-preview-draft") || "null");
      if (draft?.settings && Date.now() - draft.savedAt < 3600000) return { ...DEFAULTS, ...draft.settings };
    } catch {}
  }
  const queryToken = new URLSearchParams(location.search).get("displayToken");
  if (queryToken) try { localStorage.setItem("str-display-token", queryToken); } catch {}
  let displayToken = queryToken;
  if (!displayToken) try { displayToken = localStorage.getItem("str-display-token") || ""; } catch {}
  if (!displayToken) return { ...DEFAULTS, accessDenied:true };
  try {
    const response = await fetch(`/api/settings?displayToken=${encodeURIComponent(displayToken)}`, { cache:"no-store" });
    if (response.status === 401) { try { localStorage.removeItem("str-settings-v1"); localStorage.removeItem("str-display-token"); } catch {} return { ...DEFAULTS, accessDenied:true }; }
    if (!response.ok) throw new Error("Settings unavailable");
    const data = await response.json();
    try { localStorage.setItem("str-settings-v1", JSON.stringify({ savedAt:Date.now(), data })); } catch {}
    const result = { data, offline:false };
    window.__dataOffline ||= result.offline;
    return { ...DEFAULTS, ...result.data };
  } catch {
    try { const saved = JSON.parse(localStorage.getItem("str-settings-v1") || "null"); if (saved?.data) return { ...DEFAULTS, ...saved.data }; } catch {}
    return { ...DEFAULTS, accessDenied:true };
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
  $("display").dataset.celebrationType = s.celebrationType || "birthday";
  $("display").dataset.motion = s.motionIntensity;
  const themedTransition = /star-wars|iron-man|space-coast/.test(activeTheme) ? "wipe" : /harry|wizard|princess|classic-theme-park/.test(activeTheme) ? "spark" : /spider/.test(activeTheme) ? "web" : /christmas/.test(activeTheme) ? "snow" : /aurora|florida-storm|everglades/.test(activeTheme) ? "curtain" : "cinematic";
  $("display").dataset.transition = s.transitionStyle === "auto" ? themedTransition : s.transitionStyle;
  $("display").style.setProperty("--art-opacity", String((Number(s.artworkIntensity) || 80) / 100));
  if (s.accessDenied) {
    document.querySelectorAll(".slide").forEach(slide => { slide.hidden = !slide.classList.contains("welcome-slide"); });
    $("guestName").textContent = "Display access required"; $("welcomeMessage").textContent = "Open the admin page to copy the secure OptiSigns display URL.";
    $("occasion").hidden = true; $("stayDates").textContent = ""; $("hourlyTimeline").innerHTML = ""; $("parkHoursGrid").innerHTML = ""; $("staySummary").hidden = true; $("guestHubLink").hidden = true;
    return;
  }
  applyLanguage(s.language);
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
  const guestHubUrl = s.guestAccessToken ? `${location.origin}/guest?token=${encodeURIComponent(s.guestAccessToken)}` : "";
  $("guestHubLink").hidden = !guestHubUrl;
  if (guestHubUrl) {
    $("guestHubLink").href = guestHubUrl;
    window.LocalQRCode?.toDataURL(guestHubUrl, { width:240, margin:4, errorCorrectionLevel:"M" }).then(source => { $("guestHubQr").src = source; });
  }
  const previewDate = new URLSearchParams(location.search).get("previewDate");
  const today = /^\d{4}-\d{2}-\d{2}$/.test(previewDate || "") ? previewDate : new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
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
  document.querySelector(".welcome-slide").hidden = !scheduledPageVisible(s.showWelcome, "welcome", s, todayValue, checkIn, checkOut);
  document.querySelector(".parks-slide").hidden = !scheduledPageVisible(s.showEvents, "events", s, todayValue, checkIn, checkOut);
  document.querySelector(".forecast-slide").hidden = !scheduledPageVisible(s.showForecast, "forecast", s, todayValue, checkIn, checkOut);
  document.querySelector(".home-info-slide").hidden = !scheduledPageVisible(s.showHomeInfo, "homeInfo", s, todayValue, checkIn, checkOut);
  document.querySelector(".storey-lake-slide").hidden = !scheduledPageVisible(s.showStoreyLake, "storeyLake", s, todayValue, checkIn, checkOut);
  document.querySelector(".nearby-map-slide").hidden = !scheduledPageVisible(s.showNearbyMap, "nearbyMap", s, todayValue, checkIn, checkOut);
  document.querySelector(".nearby-easy-slide").hidden = !scheduledPageVisible(s.showNearbyEasy, "nearbyEasy", s, todayValue, checkIn, checkOut);
  document.querySelector(".favorites-slide").hidden = !scheduledPageVisible(s.showLocalFavorites, "localFavorites", s, todayValue, checkIn, checkOut);
  applySmartRotation(s, todayValue, checkIn, checkOut);
  const celebrationPreview = new URLSearchParams(location.search).get("previewPage") === "celebration";
  const celebrationToday = Boolean(s.celebrationDate) && s.celebrationDate === today;
  document.querySelector(".celebration-slide").hidden = !(celebrationPreview || (s.showCelebration && celebrationToday));
  const celebrationWords = TRANSLATIONS[s.language] || TRANSLATIONS.en;
  $("celebrationKicker").textContent = s.celebrationType === "anniversary" ? (celebrationWords.anniversaryKicker || TRANSLATIONS.en.anniversaryKicker) : (celebrationWords.birthdayKicker || TRANSLATIONS.en.birthdayKicker);
  const celebrationHeading = s.celebrationType === "anniversary" ? (celebrationWords.anniversary || TRANSLATIONS.en.anniversary) : (celebrationWords.birthday || TRANSLATIONS.en.birthday);
  $("celebrationTitle").textContent = `${celebrationHeading}${s.celebrationName ? `, ${s.celebrationName}` : ""}!`;
  $("celebrationMessage").textContent = s.celebrationMessage || DEFAULTS.celebrationMessage;
  $("mapPropertyAddress").textContent = s.propertyAddress || DEFAULTS.propertyAddress;
  renderGuestPages(s);
  applyReviewMoment(s, todayValue, checkOut);
  $("currentTime").parentElement.hidden = !s.showClock;
  applyStaySummary(s.checkIn, s.checkOut);
}

function applySmartRotation(s, today, checkIn, checkOut) {
  if (!s.smartRotation || new URLSearchParams(location.search).get("previewPage")) return;
  const enabled = key => !document.querySelector(`[data-page-key="${key}"]`)?.hidden;
  const day = checkIn && today >= checkIn ? Math.floor((today - checkIn) / 86400000) + 1 : 0;
  const remaining = checkOut && today <= checkOut ? Math.max(0, Math.ceil((checkOut - today) / 86400000)) : 99;
  const rain = Number(currentWeather?.daily?.find(item => item.date === new URLSearchParams(location.search).get("previewDate"))?.rainChance ?? currentWeather?.daily?.[0]?.rainChance ?? 0);
  const high = Number(currentWeather?.daily?.find(item => item.date === new URLSearchParams(location.search).get("previewDate"))?.high ?? currentWeather?.daily?.[0]?.high ?? 0);
  const hasLiveParkOpportunity = Boolean(currentParks?.insights?.bestBets?.length || currentParks?.insights?.eveningPick);
  let preferred = day === 1
    ? ["welcome", "homeInfo", "nearbyEasy", "storeyLake", "forecast", "events", "nearbyMap", "localFavorites"]
    : day === 2
      ? ["welcome", "events", "forecast", "nearbyEasy", "nearbyMap", "storeyLake", "localFavorites", "homeInfo"]
      : remaining <= 2
        ? ["welcome", "events", "forecast", "localFavorites", "nearbyEasy", "homeInfo", "nearbyMap", "storeyLake"]
        : ["welcome", "events", "forecast", "localFavorites", "storeyLake", "nearbyMap", "nearbyEasy", "homeInfo"];
  if (rain >= 65) preferred = ["welcome", "forecast", "events", "nearbyEasy", "localFavorites", "homeInfo", "nearbyMap", "storeyLake"];
  else if (high >= 92) preferred = ["welcome", "forecast", "events", "storeyLake", "nearbyEasy", "localFavorites", "nearbyMap", "homeInfo"];
  else if (hasLiveParkOpportunity) preferred = ["welcome", "events", ...preferred.filter(page => !["welcome", "events"].includes(page))];
  const selected = new Set(preferred.filter(enabled).slice(0, Number(s.maxRotationPages) || 6));
  document.querySelectorAll("[data-page-key]").forEach(slide => {
    if (["arrival", "celebration", "review"].includes(slide.dataset.pageKey)) return;
    if (!slide.hidden && !selected.has(slide.dataset.pageKey)) slide.hidden = true;
  });
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
let favoritePageTimer;

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

function resetFavoritePages(slide, duration) {
  clearTimeout(favoritePageTimer);
  const pages = [...slide.querySelectorAll(".rotating-page")];
  pages.forEach((page, index) => page.classList.toggle("active", index === 0));
  if (pages.length > 1) favoritePageTimer = setTimeout(() => pages.forEach((page, index) => page.classList.toggle("active", index === 1)), duration * .45);
}

function updatePageTitle(slide) {
  $("pageTitle").textContent = slide?.dataset.pageTitle || "";
}

function startSlides(seconds) {
  const allSlides = [...document.querySelectorAll(".slide")];
  allSlides.forEach(slide => slide.classList.remove("active"));
  const pageOrder = Array.isArray(currentSettings.pageOrder) ? currentSettings.pageOrder : DEFAULTS.pageOrder;
  const orderIndex = page => { const index = pageOrder.indexOf(page); return index < 0 ? pageOrder.length : index; };
  let visibleSlides = allSlides.filter(s => !s.hidden)
    .sort((a, b) => orderIndex(a.dataset.pageKey) - orderIndex(b.dataset.pageKey));
  const previewPage = new URLSearchParams(location.search).get("previewPage");
  if (previewPage) {
    const previewSlide = document.querySelector(`[data-page-key="${CSS.escape(previewPage)}"]`);
    if (previewSlide) {
      allSlides.forEach(slide => { slide.hidden = slide !== previewSlide; });
      previewSlide.hidden = false;
      visibleSlides = [previewSlide];
    }
  }
  if (!visibleSlides.length) {
    document.querySelector(".welcome-slide").hidden = false;
    visibleSlides = [document.querySelector(".welcome-slide")];
  }
  let index = 0;
  visibleSlides[0].classList.add("active");
  updatePageTitle(visibleSlides[0]);
  const getDuration = slide => Math.max(8, Number(currentSettings.pageDurations?.[slide.dataset.pageKey]) || Number(seconds) || 18) * 1000;
  let duration = getDuration(visibleSlides[0]);
  if (visibleSlides[0].classList.contains("parks-slide")) resetEventPages(duration);
  if (visibleSlides[0].querySelector(".rotating-page")) resetFavoritePages(visibleSlides[0], duration);

  clearTimeout(slideTimer);
  if (visibleSlides.length > 1) {
    const advance = () => {
      visibleSlides[index].classList.remove("active");
      index = (index + 1) % visibleSlides.length;
      visibleSlides[index].classList.add("active");
      updatePageTitle(visibleSlides[index]);
      duration = getDuration(visibleSlides[index]);
      if (visibleSlides[index].classList.contains("parks-slide")) {
        resetEventPages(duration);
      } else {
        clearTimeout(eventPageTimer);
      }
      if (visibleSlides[index].querySelector(".rotating-page")) resetFavoritePages(visibleSlides[index], duration);
      else clearTimeout(favoritePageTimer);
      slideTimer = setTimeout(advance, duration);
    };
    slideTimer = setTimeout(advance, duration);
  }
}

async function refreshAll() {
  window.__dataOffline = !navigator.onLine;
  const [settings, parks, weather] = await Promise.all([loadSettings(), loadParks(), loadWeather()]);
  currentWeather = weather;
  currentParks = parks;
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
