const $ = id => document.getElementById(id);
const esc = value => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const rows = value => String(value || "").split("\n").map(row => row.split("|").map(item => item.trim())).filter(row => row[1]);
const safe = value => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : "#"; } catch { return "#"; } };
const dateText = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "";
function placesMarkup(items, limit) { return items.slice(0,limit).map(([category,name,note,url,badge]) => `<a href="${esc(safe(url))}"><strong>${esc(name)}</strong><span>${esc(badge || category)}</span><p>${esc(note)}</p></a>`).join(""); }
async function load() {
  const [settingsResponse,weatherResponse] = await Promise.all([fetch("/api/settings"),fetch("/api/weather")]);
  const settings = await settingsResponse.json(), weather = await weatherResponse.json().catch(() => ({}));
  $("guestTitle").textContent = settings.guestName || "Welcome!";
  $("guestDates").textContent = settings.checkIn && settings.checkOut ? `${dateText(settings.checkIn)} – ${dateText(settings.checkOut)}` : "Your mobile vacation companion";
  $("guestWifi").textContent = settings.wifiName || "Guest Wi-Fi"; $("guestWifiPassword").textContent = settings.wifiPassword ? `Password: ${settings.wifiPassword}` : "";
  $("guestAddress").textContent = settings.propertyAddress; $("homeDirections").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.propertyAddress)}`;
  $("guestTemp").textContent = Number.isFinite(weather.temperature) ? `${Math.round(weather.temperature)}°` : "--°"; $("guestWeatherText").textContent = "Orlando conditions";
  $("guestForecast").innerHTML = (weather.daily || []).slice(0,3).map(day => `<div><small>${new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US",{weekday:"short"})}</small><b>${Math.round(day.high)}°</b><span>${day.rainChance}% rain</span></div>`).join("");
  $("guestNearby").innerHTML = placesMarkup(rows(settings.nearbyFavorites),12); $("guestFavorites").innerHTML = placesMarkup(rows(settings.localFavorites),12);
}
load().catch(() => { $("guestWeatherText").textContent = "Guide temporarily offline"; });
