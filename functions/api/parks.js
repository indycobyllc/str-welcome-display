const API = "https://api.themeparks.wiki/v1";
const WDW_NAME = "Walt Disney World";
const TARGET_PARKS = [
  "Magic Kingdom Park",
  "EPCOT",
  "Disney's Hollywood Studios",
  "Disney's Animal Kingdom Theme Park"
];

function timeLabel(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York"
  });
}

function dateEastern() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function apiJson(path) {
  const response = await fetch(`${API}${path}`, {
    headers: { "User-Agent": "STR-Welcome-Display/1.0" },
    cf: { cacheTtl: 600, cacheEverything: true }
  });
  if (!response.ok) throw new Error(`ThemeParks.wiki returned ${response.status}`);
  return response.json();
}

function selectToday(schedulePayload) {
  const today = dateEastern();
  const list = Array.isArray(schedulePayload?.schedule) ? schedulePayload.schedule : [];
  return list.find(item => item.date === today) || list[0] || null;
}

function regularHours(day) {
  const entries = Array.isArray(day?.openingHours) ? day.openingHours : [];
  const regular = entries.find(item =>
    String(item.type || "").toUpperCase().includes("OPERATING")
  ) || entries.find(item =>
    !String(item.type || "").toUpperCase().includes("INFORMATION")
  );
  if (!regular?.startTime || !regular?.endTime) return "";
  return `${timeLabel(regular.startTime)} – ${timeLabel(regular.endTime)}`;
}

function entertainmentFromLive(livePayload) {
  const live = Array.isArray(livePayload?.liveData) ? livePayload.liveData : [];
  const events = [];
  for (const item of live) {
    const showtimes = Array.isArray(item.showtimes) ? item.showtimes : [];
    if (!showtimes.length) continue;
    for (const show of showtimes) {
      const start = show.startTime || show.start;
      if (!start) continue;
      const localDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York"
      }).format(new Date(start));
      if (localDate !== dateEastern()) continue;
      events.push({ name: item.name || "Entertainment", time: timeLabel(start) });
    }
  }

  const priority = /fireworks|fantasmic|luminous|starlight|parade|nighttime|happily ever after/i;
  return events
    .sort((a, b) => Number(priority.test(b.name)) - Number(priority.test(a.name)))
    .filter((event, index, all) =>
      all.findIndex(x => x.name === event.name && x.time === event.time) === index
    )
    .slice(0, 5);
}

async function discoverParks() {
  const payload = await apiJson("/destinations");
  const destinations = payload.destinations || payload || [];
  const destination = destinations.find(d =>
    String(d.name || "").toLowerCase().includes(WDW_NAME.toLowerCase())
  );
  if (!destination) throw new Error("Walt Disney World destination not found");

  const embeddedParks = destination.parks || destination.children || [];
  if (embeddedParks.length) {
    return embeddedParks.filter(p => TARGET_PARKS.includes(p.name));
  }

  const children = await apiJson(`/entity/${destination.id}/children`);
  const entities = children.children || children.entities || [];
  return entities.filter(p => TARGET_PARKS.includes(p.name));
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(new URL(context.request.url).origin + "/api/parks-cache");
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const parks = await discoverParks();
    const result = await Promise.all(parks.map(async park => {
      const [schedule, live] = await Promise.all([
        apiJson(`/entity/${park.id}/schedule`).catch(() => ({})),
        apiJson(`/entity/${park.id}/live`).catch(() => ({}))
      ]);
      const today = selectToday(schedule);
      return {
        id: park.id,
        name: park.name
          .replace(" Theme Park", "")
          .replace(" Park", park.name === "Magic Kingdom Park" ? "" : " Park"),
        hours: regularHours(today),
        events: entertainmentFromLive(live)
      };
    }));

    const ordered = TARGET_PARKS.map(name =>
      result.find(item =>
        item.name.toLowerCase().startsWith(name.replace(" Theme Park","").replace(" Park","").toLowerCase())
      )
    ).filter(Boolean);

    const body = JSON.stringify({
      updatedAt: new Date().toISOString(),
      source: "ThemeParks.wiki",
      parks: ordered.length ? ordered : result
    });

    const response = new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600"
      }
    });
    await cache.put(cacheKey, response.clone());
    return response;
  } catch (error) {
    return Response.json({
      updatedAt: new Date().toISOString(),
      parks: [],
      error: error instanceof Error ? error.message : "Unknown error"
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
