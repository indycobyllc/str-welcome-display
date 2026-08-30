const $ = id => document.getElementById(id);
const esc = value => String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
const rows = value => String(value || "").split("\n").map(row => row.split("|").map(item => item.trim())).filter(row => row[1]);
const safe = value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : "#"; } catch { return "#"; } };
const dateText = (value, options = { month:"short", day:"numeric" }) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US", options) : "";
const easternToday = () => new Intl.DateTimeFormat("en-CA", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
const weatherLabel = code => code === 0 ? "Clear skies" : code <= 3 ? "Partly cloudy" : code <= 48 ? "Cloudy or foggy" : code <= 67 ? "Rain possible" : code <= 77 ? "Wintry weather" : code <= 82 ? "Rain showers" : "Thunderstorms possible";
let initialized = false;
let allPlaces = [];
let placeSource = "all";
let placeCategory = "all";

function farewell(data = {}) {
  initialized = false;
  document.title = "Thank You for Staying With Us";
  document.querySelector(".guest-shell").innerHTML = `<header class="farewell"><span>✦ UNTIL NEXT TIME</span><h1>Thank you for staying with us</h1><p>${esc(data.message || "We hope you made wonderful Orlando memories.")}</p></header><section><h2>One last favor</h2><div class="guest-grid links">${data.reviewUrl ? `<a href="${esc(safe(data.reviewUrl))}"><small>SHARE YOUR EXPERIENCE</small><strong>Leave a review</strong><p>Your feedback means a great deal to us →</p></a>` : ""}${data.rebookUrl ? `<a href="${esc(safe(data.rebookUrl))}"><small>COME BACK SOON</small><strong>Plan another stay</strong><p>Return for your next Orlando adventure →</p></a>` : ""}</div></section><footer>This guest guide expired automatically at checkout and no longer provides access to stay information.</footer>`;
}

function denied(message) {
  initialized = false;
  document.querySelector(".guest-shell").innerHTML = `<header class="farewell"><span>✦ GUEST GUIDE</span><h1>Link unavailable</h1><p>${esc(message || "This private guest guide is not available.")}</p></header><footer>No guest or property information has been shared.</footer>`;
}

function switchView(view) {
  document.querySelectorAll("[data-view]").forEach(section => section.classList.toggle("active", section.dataset.view === view));
  document.querySelectorAll("[data-view-button]").forEach(button => button.classList.toggle("active", button.dataset.viewButton === view));
  scrollTo({ top:0, behavior:"smooth" });
}

function staySummary(settings) {
  const today = new Date(`${easternToday()}T12:00:00`), checkIn = new Date(`${settings.checkIn}T12:00:00`), checkOut = new Date(`${settings.checkOut}T12:00:00`);
  const day = Math.max(1, Math.floor((today - checkIn) / 86400000) + 1);
  const remaining = Math.max(0, Math.ceil((checkOut - today) / 86400000));
  return { day, remaining, label:today.getTime() === checkIn.getTime() ? "Arrival day" : today.getTime() === checkOut.getTime() ? "Checkout day" : `Vacation day ${day}` };
}

function renderToday(settings, weather, parks) {
  const stay = staySummary(settings), today = weather.daily?.find(day => day.date === easternToday()) || weather.daily?.[0] || {};
  $("stayDay").innerHTML = `<small>${esc(stay.label)}</small><strong>${stay.remaining} day${stay.remaining === 1 ? "" : "s"} left</strong>`;
  $("todayDate").textContent = new Date().toLocaleDateString("en-US", { timeZone:"America/New_York", weekday:"long", month:"short", day:"numeric" });
  $("guestTemp").textContent = Number.isFinite(weather.temperature) ? `${Math.round(weather.temperature)}°` : "--°";
  $("guestWeatherText").textContent = weatherLabel(weather.weatherCode);
  $("todayWeatherDetail").innerHTML = `<div><small>HIGH / LOW</small><strong>${Number.isFinite(today.high) ? `${Math.round(today.high)}° / ${Math.round(today.low)}°` : "Updating"}</strong></div><div><small>RAIN</small><strong>${Number(today.rainChance) || 0}%</strong></div><div><small>SUNSET</small><strong>${today.sunset ? new Date(today.sunset).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" }) : "—"}</strong></div>`;
  const easternParts = new Intl.DateTimeFormat("en-CA", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23" }).formatToParts(new Date());
  const easternPart = type => easternParts.find(part => part.type === type)?.value;
  const easternNow = `${easternPart("year")}-${easternPart("month")}-${easternPart("day")}T${easternPart("hour")}:${easternPart("minute")}`;
  const nextHours = (weather.hourly || []).filter(hour => hour.time >= easternNow).slice(0, 6);
  $("hourlyWeather").innerHTML = nextHours.map(hour => `<article><small>${new Date(hour.time).toLocaleTimeString("en-US", { hour:"numeric" })}</small><strong>${Math.round(hour.temperature)}°</strong><span>${hour.rainChance || 0}% rain</span></article>`).join("");
  $("guestForecast").innerHTML = (weather.daily || []).slice(0, 4).map(day => `<article><small>${dateText(day.date, { weekday:"short" })}</small><b>${Math.round(day.high)}°</b><span>${weatherLabel(day.weatherCode)}</span><em>${day.rainChance || 0}% rain</em></article>`).join("");
  const insights = parks.insights || {};
  let briefTitle = "Make today yours", brief = settings.welcomeMessage || "Your Orlando adventure is waiting.";
  if (stay.day === 1) { briefTitle = "Welcome to Orlando"; brief = "Settle in, connect to Wi-Fi and keep Nearby & Easy handy for tonight."; }
  else if (stay.remaining <= 1) { briefTitle = "One more memorable day"; brief = "Save a little time tonight for packing and review the home checkout notes."; }
  else if (Number(today.rainChance) >= 65) { briefTitle = "Rain-smart plan"; brief = "Keep ponchos ready and use Explore to find indoor favorites between showers."; }
  else if (Number(today.high) >= 92) { briefTitle = "Beat the afternoon heat"; brief = "Start early, take a midday pool break at The Hideaway Club and return refreshed."; }
  else if (insights.eveningPick) { briefTitle = "Tonight’s highlight"; brief = `${insights.eveningPick.name} at ${insights.eveningPick.park} · ${insights.eveningPick.time}.`; }
  $("smartBrief").innerHTML = `<i>✦</i><div><small>${esc(briefTitle)}</small><strong>${esc(brief)}</strong></div>`;
  const best = insights.bestBets || [];
  $("parkPulse").innerHTML = best.length ? best.map(item => `<article><span>Low wait</span><strong>${esc(item.name)}</strong><b>${Number(item.wait)} min</b></article>`).join("") : `<article><strong>Live park opportunities are updating.</strong></article>`;
  const events = (parks.parks || []).flatMap(park => (park.events || []).map(event => ({ ...event, park:park.name }))).slice(0, 6);
  $("mobileEvents").innerHTML = events.length ? events.map(event => `<article><div><small>${esc(event.category || "show")}</small><strong>${esc(event.name)}</strong><span>${esc(event.park)}</span></div><b>${esc(event.time)}</b></article>`).join("") : `<p class="empty-state">No major upcoming entertainment is currently listed. Check the official park apps before heading out.</p>`;
}

function renderHome(settings) {
  $("homeWifi").textContent = settings.wifiName || "Guest Wi-Fi";
  $("guestAddress").textContent = settings.propertyAddress;
  $("homeAddressLink").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.propertyAddress)}`;
  const homeRows = rows(settings.homeInfo);
  const draw = query => {
    const match = query.toLowerCase();
    const filtered = homeRows.filter(row => row.join(" ").toLowerCase().includes(match));
    $("homeGuideCards").innerHTML = filtered.map(([title, detail], index) => `<article><i>${["⌂","◌","◇","♻","✓","?"][index % 6]}</i><div><strong>${esc(title)}</strong><p>${esc(detail)}</p></div></article>`).join("") || `<p class="empty-state">No home information matches that search.</p>`;
  };
  draw("");
  $("homeSearch").oninput = event => draw(event.target.value);
}

function renderDirectory() {
  const query = ($("placeSearch")?.value || "").toLowerCase();
  const filtered = allPlaces.filter(place => (placeSource === "all" || place.source === placeSource) && (placeCategory === "all" || place.category === placeCategory) && place.search.includes(query));
  $("placeDirectory").innerHTML = filtered.map(place => `<a href="${esc(safe(place.url))}"><img class="place-photo" src="${esc(placeAsset(place.name))}" alt="${esc(place.name)}"><div><small>${esc(place.category)} · ${place.source === "nearby" ? "NEARBY & EASY" : "LOCAL FAVORITE"}</small><strong>${esc(place.name)}</strong><p>${esc(place.note)}</p><span>${esc(place.badge)} · Open directions ↗</span></div></a>`).join("") || `<p class="empty-state">No recommendations match those filters.</p>`;
}

const PLACE_ASSETS = {
  "Walmart Supercenter":"walmart-supercenter.jpg", "Publix · Sunrise City Plaza":"publix.jpg", "Super Target":"target.jpg",
  "King O Falafel":"king-o-falafel.jpg", "Sabor Brasil":"sabor-brasil.jpg", "Tropico Mofongo":"tropico-mofongo.jpg", "Miller's Ale House":"millers-ale-house.jpg",
  "Zuru Ramen & Hibachi":"zuru-ramen.jpg", "Taco Bell":"taco-bell.jpg", "Cracker Barrel":"cracker-barrel.jpg", "Wawa":"wawa.jpg", "Applebee's":"applebees.jpg", "Se7en Bites":"se7en-bites.jpg",
  "Beefy King":"beefy-king.jpg", "Lazy Moon Pizza":"lazy-moon.jpg", "Andretti Indoor Karting":"andretti.jpg",
  "Orlando Science Center":"orlando-science-center.jpg", "Bok Tower Gardens":"bok-tower-gardens.jpg",
  "King's Landing · Emerald Cut":"kings-landing.jpg",
  "Devil's Den Spring":"devils-den.jpg", "Kennedy Space Center":"kennedy-space-center.jpg", "Blowing Rocks Preserve":"blowing-rocks.jpg",
  "Teak Neighborhood Grill":"teak-neighborhood-grill.jpg", "Gideon's Bakehouse":"gideons-bakehouse.jpg", "The Dolly Llama":"dolly-llama.jpg",
  "Orlando Cat Café":"orlando-cat-cafe.jpg", "Titanic: The Artifact Exhibition":"titanic-orlando.webp", "SAK Comedy Lab":"sak-comedy-lab.jpg",
  "Portillo's Kissimmee":"portillos-kissimmee.jpg", "Twistee Treat":"twistee-treat.jpg", "Yellow Dog Eats":"yellow-dog-eats.jpg"
};
function placeAsset(name = "") { return `/assets/places/${PLACE_ASSETS[name] || ""}`; }

function renderExplore(settings) {
  allPlaces = [...rows(settings.nearbyFavorites).filter(row => PLACE_ASSETS[row[1]]).map(row => ({ source:"nearby", category:row[0], name:row[1], note:row[2], url:row[3], badge:row[4], search:row.join(" ").toLowerCase() })), ...rows(settings.localFavorites).filter(row => PLACE_ASSETS[row[1]]).map(row => ({ source:"favorites", category:row[0], name:row[1], note:row[2], url:row[3], badge:row[4], search:row.join(" ").toLowerCase() }))];
  const categories = [...new Set(allPlaces.map(place => place.category))];
  $("categoryFilters").innerHTML = `<button class="active" data-place-category="all">All types</button>${categories.map(category => `<button data-place-category="${esc(category)}">${esc(category)}</button>`).join("")}`;
  renderDirectory();
}

function wireInteractions(settings) {
  document.querySelectorAll("[data-view-button],[data-open-view]").forEach(button => button.onclick = () => switchView(button.dataset.viewButton || button.dataset.openView));
  const copyWifi = async () => { try { await navigator.clipboard.writeText(settings.wifiPassword || ""); $("copyWifiHome").textContent = "Copied!"; setTimeout(() => $("copyWifiHome").textContent = "Copy password", 1800); } catch {} };
  $("copyWifi").onclick = copyWifi; $("copyWifiHome").onclick = copyWifi;
  $("placeSearch").oninput = renderDirectory;
  document.querySelectorAll("[data-place-source]").forEach(button => button.onclick = () => { placeSource = button.dataset.placeSource; document.querySelectorAll("[data-place-source]").forEach(item => item.classList.toggle("active", item === button)); renderDirectory(); });
  $("categoryFilters").onclick = event => { const button = event.target.closest("[data-place-category]"); if (!button) return; placeCategory = button.dataset.placeCategory; document.querySelectorAll("[data-place-category]").forEach(item => item.classList.toggle("active", item === button)); renderDirectory(); };
}

async function load() {
  const token = new URLSearchParams(location.search).get("token") || "";
  if (!token) return denied("Scan the current QR code on the welcome display to open your guide.");
  const settingsResponse = await fetch(`/api/guest?token=${encodeURIComponent(token)}`, { cache:"no-store" });
  const settings = await settingsResponse.json().catch(() => ({}));
  if (settingsResponse.status === 410) return farewell(settings);
  if (!settingsResponse.ok) return denied(settings.error);
  if (initialized) return;
  const [weatherResponse, parksResponse] = await Promise.all([fetch("/api/weather", { cache:"no-store" }), fetch("/api/parks", { cache:"no-store" })]);
  const weather = await weatherResponse.json().catch(() => ({})), parks = await parksResponse.json().catch(() => ({}));
  const guestName = String(settings.guestName || "").trim().replace(/^welcome(?:\s+to\s+your\s+orlando\s+vacation)?[\s,!:\-–—]*/i, "").replace(/^the\s+/i, "").replace(/[!.]+$/g, "").trim();
  $("guestTitle").textContent = guestName ? `Welcome, ${guestName}!` : "Welcome!";
  $("guestDates").textContent = settings.checkIn && settings.checkOut ? `${dateText(settings.checkIn)} – ${dateText(settings.checkOut)}` : "Your mobile vacation companion";
  $("guestWifi").textContent = settings.wifiName || "Guest Wi-Fi";
  $("homeDirections").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.propertyAddress)}`;
  renderToday(settings, weather, parks); renderHome(settings); renderExplore(settings); wireInteractions(settings);
  $("guestLoading").hidden = true; $("guestApp").hidden = false; initialized = true;
}

load().catch(() => denied("The guide could not be verified. Please scan the QR code again."));
setInterval(() => load().catch(() => {}), 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) load().catch(() => {}); });
