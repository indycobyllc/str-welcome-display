const $ = id => document.getElementById(id);
const esc = value => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const rows = value => String(value || "").split("\n").map(row => row.split("|").map(item => item.trim())).filter(row => row[1]);
const safe = value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : "#"; } catch { return "#"; } };
const dateText = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "";
function placesMarkup(items, limit) { return items.slice(0,limit).map(([category,name,note,url,badge]) => `<a href="${esc(safe(url))}"><strong>${esc(name)}</strong><span>${esc(badge || category)}</span><p>${esc(note)}</p></a>`).join(""); }
function farewell(data = {}) {
  document.title = "Thank You for Staying With Us";
  document.querySelector(".guest-shell").innerHTML = `<header class="farewell"><span>✦ UNTIL NEXT TIME</span><h1>Thank you for staying with us</h1><p>${esc(data.message || "We hope you made wonderful Orlando memories.")}</p></header><section><h2>One last favor</h2><div class="guest-grid links">${data.reviewUrl ? `<a href="${esc(safe(data.reviewUrl))}"><small>SHARE YOUR EXPERIENCE</small><strong>Leave a review</strong><p>Your feedback means a great deal to us →</p></a>` : ""}${data.rebookUrl ? `<a href="${esc(safe(data.rebookUrl))}"><small>COME BACK SOON</small><strong>Plan another stay</strong><p>Return for your next Orlando adventure →</p></a>` : ""}</div></section><footer>This guest guide expired automatically at checkout and no longer provides access to stay information.</footer>`;
}
function denied(message) { document.querySelector(".guest-shell").innerHTML = `<header class="farewell"><span>✦ GUEST GUIDE</span><h1>Link unavailable</h1><p>${esc(message || "This private guest guide is not available.")}</p></header><footer>No guest or property information has been shared.</footer>`; }
async function load() {
  const token = new URLSearchParams(location.search).get("token") || "";
  if (!token) return denied("Scan the current QR code on the welcome display to open your guide.");
  const settingsResponse = await fetch(`/api/guest?token=${encodeURIComponent(token)}`, { cache:"no-store" });
  const settings = await settingsResponse.json().catch(() => ({}));
  if (settingsResponse.status === 410) return farewell(settings);
  if (!settingsResponse.ok) return denied(settings.error);
  const weatherResponse = await fetch("/api/weather", { cache:"no-store" });
  const weather = await weatherResponse.json().catch(() => ({}));
  $("guestTitle").textContent = settings.guestName || "Welcome!";
  $("guestDates").textContent = settings.checkIn && settings.checkOut ? `${dateText(settings.checkIn)} – ${dateText(settings.checkOut)}` : "Your mobile vacation companion";
  $("guestWifi").textContent = settings.wifiName || "Guest Wi-Fi"; $("guestWifiPassword").textContent = settings.wifiPassword ? `Password: ${settings.wifiPassword}` : "";
  $("guestAddress").textContent = settings.propertyAddress; $("homeDirections").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.propertyAddress)}`;
  $("guestTemp").textContent = Number.isFinite(weather.temperature) ? `${Math.round(weather.temperature)}°` : "--°"; $("guestWeatherText").textContent = "Orlando conditions";
  $("guestForecast").innerHTML = (weather.daily || []).slice(0,3).map(day => `<div><small>${new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US",{weekday:"short"})}</small><b>${Math.round(day.high)}°</b><span>${day.rainChance}% rain</span></div>`).join("");
  $("guestNearby").innerHTML = placesMarkup(rows(settings.nearbyFavorites),12); $("guestFavorites").innerHTML = placesMarkup(rows(settings.localFavorites),12);
}
load().catch(() => denied("The guide could not be verified. Please scan the QR code again."));
setInterval(load, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
