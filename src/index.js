const DEFAULTS = {
  guestName: "Welcome!",
  occasion: "",
  welcomeMessage: "Relax, explore, and make unforgettable memories.",
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
  parkOrder: "disney-first",
  motionIntensity: "full",
  artworkIntensity: 80,
  transitionStyle: "auto"
};

const PARKS = [
  { name: "Magic Kingdom", id: "75ea578a-adc8-4116-a54d-dccb60765ef9" },
  { name: "EPCOT", id: "47f90d2c-e191-4239-a466-5892ef59a88b" },
  { name: "Hollywood Studios", id: "288747d1-8b4f-4a64-867e-ea7c9b27bad8" },
  { name: "Animal Kingdom", id: "1c84a229-8862-4648-9c71-378ddd2c7693" },
  { name: "Universal Studios Florida", id: "eb3f4560-2383-4a36-9152-6b3e5ed6bc57" },
  { name: "Universal Islands of Adventure", id: "267615cc-8943-4c2a-ae2c-5da728ca591f" },
  { name: "Universal Epic Universe", id: "12dbb85b-265f-44e6-bccf-f1faa17211fc" }
];

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extra
    }
  });
}

function authorized(request, env) {
  const supplied = request.headers.get("authorization") || "";
  return Boolean(env.ADMIN_TOKEN) && supplied === `Bearer ${env.ADMIN_TOKEN}`;
}

function sanitize(input) {
  const text = (v, n) => String(v ?? "").trim().slice(0, n);
  const bool = (v, fallback = true) => v === undefined ? fallback : Boolean(v);
  const themes = new Set([
    "galactic", "celebration", "elegant", "holiday", "christmas-immersive", "halloween-immersive", "fourth-july-immersive",
    "aurora-immersive", "iron-man-immersive", "spider-man-immersive", "superhero-immersive", "neutral",
    "star-wars", "star-wars-immersive", "toy-story", "wizarding", "princess", "harry-potter-immersive"
  ]);
  return {
    guestName: text(input.guestName, 80) || DEFAULTS.guestName,
    occasion: text(input.occasion, 100),
    welcomeMessage: text(input.welcomeMessage, 160),
    checkIn: text(input.checkIn, 10),
    checkOut: text(input.checkOut, 10),
    theme: themes.has(input.theme) ? input.theme : "galactic",
    wifiName: text(input.wifiName, 80),
    wifiPassword: text(input.wifiPassword, 80),
    slideSeconds: Math.min(120, Math.max(8, Number(input.slideSeconds) || 18)),
    showWelcome: bool(input.showWelcome),
    showEvents: bool(input.showEvents),
    showForecast: bool(input.showForecast),
    showClock: bool(input.showClock),
    showArrival: bool(input.showArrival),
    parkOrder: ["disney-first", "universal-first"].includes(input.parkOrder) ? input.parkOrder : "disney-first",
    motionIntensity: ["full", "reduced", "still"].includes(input.motionIntensity) ? input.motionIntensity : "full",
    artworkIntensity: Math.min(100, Math.max(20, Number(input.artworkIntensity) || 80)),
    transitionStyle: ["auto", "fade", "cinematic"].includes(input.transitionStyle) ? input.transitionStyle : "auto"
  };
}

function easternDate(iso = new Date().toISOString()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(iso));
}

function easternTime(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(iso));
}

async function fetchApi(url) {
  const response = await fetch(url, {
    headers: { "accept": "application/json", "user-agent": "STR-Welcome-Display/2.0" },
    cf: { cacheTtl: 600, cacheEverything: true }
  });
  if (!response.ok) throw new Error(`${response.status} from ThemeParks.wiki`);
  return response.json();
}

function getScheduleEntries(payload) {
  if (Array.isArray(payload?.schedule)) return payload.schedule;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getOpeningHours(day) {
  if (!day) return [];
  if (Array.isArray(day.openingHours)) return day.openingHours;
  if (Array.isArray(day.hours)) return day.hours;
  return [];
}

function normalHours(payload) {
  const today = easternDate();
  const entries = getScheduleEntries(payload);
  const todayEntries = entries.filter(x => x.date === today);
  const direct =
    todayEntries.find(x => /OPERATING|REGULAR/i.test(String(x.type || "")) && x.openingTime && x.closingTime) ||
    todayEntries.find(x => x.openingTime && x.closingTime);
  if (direct) return `${easternTime(direct.openingTime)} – ${easternTime(direct.closingTime)}`;

  const day = todayEntries[0] || entries[0];
  const hours = getOpeningHours(day);
  const regular =
    hours.find(x => /OPERATING|REGULAR/i.test(String(x.type || ""))) ||
    hours.find(x => x.startTime && x.endTime);
  return regular ? `${easternTime(regular.startTime)} – ${easternTime(regular.endTime)}` : "";
}

function operatingWindow(payload) {
  const today = easternDate();
  const entries = getScheduleEntries(payload).filter(x => x.date === today);
  const direct =
    entries.find(x => /OPERATING|REGULAR/i.test(String(x.type || "")) && x.openingTime && x.closingTime) ||
    entries.find(x => x.openingTime && x.closingTime);
  if (direct) return { openingTime: direct.openingTime, closingTime: direct.closingTime };

  const hours = getOpeningHours(entries[0]);
  const regular =
    hours.find(x => /OPERATING|REGULAR/i.test(String(x.type || ""))) ||
    hours.find(x => x.startTime && x.endTime);
  return regular ? { openingTime: regular.startTime, closingTime: regular.endTime } : null;
}

function attractionInsights(payload, parkName) {
  const live = Array.isArray(payload?.liveData) ? payload.liveData : [];
  const waits = live
    .filter(item => item.entityType === "ATTRACTION" && item.status === "OPERATING")
    .map(item => ({ name: item.name, park: parkName, wait: Number(item.queue?.STANDBY?.waitTime) }))
    .filter(item => Number.isFinite(item.wait) && item.wait > 0 && item.wait <= 180);
  const unavailable = live
    .filter(item => item.entityType === "ATTRACTION" && /DOWN|REFURBISHMENT/i.test(String(item.status || "")))
    .map(item => ({ name: item.name || "Unnamed attraction", park: parkName }));
  return { waits, unavailable };
}

function extractEvents(payload) {
  const today = easternDate();
  const live = Array.isArray(payload?.liveData) ? payload.liveData : [];
  const rows = [];
  for (const item of live) {
    for (const show of (Array.isArray(item.showtimes) ? item.showtimes : [])) {
      const start = show.startTime || show.start;
      if (!start || easternDate(start) !== today) continue;
      rows.push({ name: item.name || "Entertainment", time: easternTime(start) });
    }
  }
  const priority = /happily ever after|luminous|fantasmic|fireworks|parade|starlight|nighttime/i;
  return rows
    .sort((a, b) => Number(priority.test(b.name)) - Number(priority.test(a.name)))
    .filter((x, i, all) => all.findIndex(y => y.name === x.name && y.time === x.time) === i)
    .slice(0, 4);
}

async function parkData() {
  const results = await Promise.all(PARKS.map(async park => {
    const [schedule, live] = await Promise.all([
      fetchApi(`https://api.themeparks.wiki/v1/entity/${park.id}/schedule`).catch(() => ({})),
      fetchApi(`https://api.themeparks.wiki/v1/entity/${park.id}/live`).catch(() => ({}))
    ]);
    const window = operatingWindow(schedule);
    const attractionData = attractionInsights(live, park.name);
    return {
      name: park.name,
      hours: normalHours(schedule) || "Check official app",
      events: extractEvents(live),
      closingTime: window?.closingTime || "",
      waits: attractionData.waits,
      unavailable: attractionData.unavailable
    };
  }));

  const latest = results
    .filter(park => park.closingTime)
    .sort((a, b) => new Date(b.closingTime) - new Date(a.closingTime))[0];
  const bestBets = results.flatMap(park => park.waits).sort((a, b) => a.wait - b.wait).slice(0, 3);
  const unavailableAttractions = results
    .flatMap(park => park.unavailable)
    .filter((item, index, all) => all.findIndex(other => other.name === item.name && other.park === item.park) === index);
  const eveningPick = results.flatMap(park => park.events.map(event => ({ ...event, park: park.name })))
    .find(event => /fireworks|parade|fantasmic|luminous|nighttime|spectacular/i.test(event.name));
  const insights = {
    latestClosing: latest ? { park: latest.name, time: easternTime(latest.closingTime) } : null,
    bestBets,
    unavailable: unavailableAttractions.length,
    unavailableAttractions,
    eveningPick: eveningPick || null
  };
  const parks = results.map(({ closingTime, waits, unavailable: unavailableCount, ...park }) => park);
  return { updatedAt: new Date().toISOString(), source: "ThemeParks.wiki", parks, insights };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/settings" && request.method === "GET") {
      let stored = null;
      if (env.STR_SETTINGS) {
        stored = await env.STR_SETTINGS.get("current-display", "json");
      }
      return json({ ...DEFAULTS, ...(stored || {}) });
    }

    if (url.pathname === "/api/admin/status" && request.method === "GET") {
      return json({
        adminConfigured: Boolean(env.ADMIN_TOKEN),
        settingsStorageConfigured: Boolean(env.STR_SETTINGS)
      });
    }

    if (url.pathname === "/api/admin/settings") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

      if (request.method === "GET") {
        const stored = env.STR_SETTINGS
          ? await env.STR_SETTINGS.get("current-display", "json")
          : null;
        return json({ ...DEFAULTS, ...(stored || {}) });
      }

      if (request.method === "POST") {
        if (!env.STR_SETTINGS) return json({ error: "KV binding STR_SETTINGS is missing." }, 500);
        let body;
        try { body = await request.json(); }
        catch { return json({ error: "Invalid JSON" }, 400); }
        const clean = sanitize(body);
        await env.STR_SETTINGS.put("current-display", JSON.stringify(clean));
        return json({ success: true, settings: clean });
      }
    }

    if (url.pathname === "/api/parks" && request.method === "GET") {
      const cache = caches.default;
      const key = new Request(`${url.origin}/api/parks?cache=v7`);
      const cached = await cache.match(key);
      if (cached) return cached;

      try {
        const data = await parkData();
        const response = json(data, 200, {
          "cache-control": "public, max-age=300, s-maxage=600"
        });
        await cache.put(key, response.clone());
        return response;
      } catch (error) {
        return json({
          updatedAt: new Date().toISOString(),
          parks: PARKS.map(p => ({ name: p.name, hours: "Check official app", events: [] })),
          error: error instanceof Error ? error.message : "Park data unavailable"
        });
      }
    }

    if (url.pathname === "/api/weather" && request.method === "GET") {
      const cache = caches.default;
      const key = new Request(`${url.origin}/api/weather?cache=v3`);
      const cached = await cache.match(key);
      if (cached) return cached;

      try {
        const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=28.3772&longitude=-81.5707&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=16";
        const weatherResponse = await fetch(weatherUrl, {
          headers: { "accept": "application/json", "user-agent": "STR-Welcome-Display/3.0" },
          cf: { cacheTtl: 600, cacheEverything: true }
        });
        if (!weatherResponse.ok) throw new Error(`${weatherResponse.status} from Open-Meteo`);
        const payload = await weatherResponse.json();
        const response = json({
          temperature: payload.current?.temperature_2m,
          weatherCode: payload.current?.weather_code,
          isDay: Boolean(payload.current?.is_day),
          updatedAt: payload.current?.time,
          hourly: (payload.hourly?.time || []).map((time, index) => ({
            time,
            temperature: payload.hourly.temperature_2m?.[index],
            rainChance: payload.hourly.precipitation_probability?.[index],
            weatherCode: payload.hourly.weather_code?.[index]
          })),
          daily: (payload.daily?.time || []).map((date, index) => ({
            date,
            weatherCode: payload.daily.weather_code?.[index],
            high: payload.daily.temperature_2m_max?.[index],
            low: payload.daily.temperature_2m_min?.[index],
            rainChance: payload.daily.precipitation_probability_max?.[index],
            uvIndex: payload.daily.uv_index_max?.[index],
            sunrise: payload.daily.sunrise?.[index],
            sunset: payload.daily.sunset?.[index]
          }))
        }, 200, { "cache-control": "public, max-age=300, s-maxage=600" });
        await cache.put(key, response.clone());
        return response;
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "Weather unavailable" }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
