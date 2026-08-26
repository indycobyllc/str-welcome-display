const DEFAULTS = {
  guestName: "Welcome to Your Orlando Vacation!",
  occasion: "",
  welcomeMessage: "Relax, explore, and make unforgettable memories.",
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

const PARKS = [
  { name: "Magic Kingdom", id: "75ea578a-adc8-4116-a54d-dccb60765ef9" },
  { name: "EPCOT", id: "47f90d2c-e191-4239-a466-5892ef59a88b" },
  { name: "Hollywood Studios", id: "6f612806-3d2f-4e3b-8e9a-78c7b7b9a6f6" },
  { name: "Animal Kingdom", id: "1c84a229-8862-4648-9c71-378ddd2c7693" }
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
  const themes = new Set(["galactic", "celebration", "elegant", "holiday", "neutral"]);
  return {
    guestName: text(input.guestName, 80) || DEFAULTS.guestName,
    occasion: text(input.occasion, 100),
    welcomeMessage: text(input.welcomeMessage, 160),
    checkIn: text(input.checkIn, 10),
    checkOut: text(input.checkOut, 10),
    theme: themes.has(input.theme) ? input.theme : "galactic",
    wifiName: text(input.wifiName, 80),
    wifiPassword: text(input.wifiPassword, 80),
    checkoutTime: text(input.checkoutTime, 30),
    contactText: text(input.contactText, 140),
    guideUrl: text(input.guideUrl, 500),
    showParks: Boolean(input.showParks),
    showHouse: Boolean(input.showHouse),
    slideSeconds: Math.min(120, Math.max(8, Number(input.slideSeconds) || 18))
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
  const day = entries.find(x => x.date === today) || entries[0];
  const hours = getOpeningHours(day);
  const regular =
    hours.find(x => /OPERATING|REGULAR/i.test(String(x.type || ""))) ||
    hours.find(x => x.startTime && x.endTime);
  return regular ? `${easternTime(regular.startTime)} – ${easternTime(regular.endTime)}` : "";
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
    return {
      name: park.name,
      hours: normalHours(schedule) || "Check official app",
      events: extractEvents(live)
    };
  }));
  return { updatedAt: new Date().toISOString(), source: "ThemeParks.wiki", parks: results };
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
      const key = new Request(`${url.origin}/api/parks?cache=v2`);
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

    return env.ASSETS.fetch(request);
  }
};
