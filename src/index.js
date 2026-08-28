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
  nearbyFavorites: `Groceries|Walmart Supercenter|A practical one-stop for groceries, vacation supplies, pickup and delivery.|https://www.walmart.com/store/817-kissimmee-fl/shopping-services|Close by|Delivery & pickup
Groceries|Publix · Sunrise City Plaza|An easy grocery run with Instacart delivery when you would rather stay by the pool.|https://www.publix.com/|Close by|Delivery available
Groceries|Super Target|Great for groceries, sunscreen, forgotten chargers and everything the family left at home.|https://www.target.com/sl/kissimmee/1918|Close by|Pickup & delivery
Mediterranean|King O Falafel|One of the closest highly rated local choices for falafel, shawarma and hummus.|https://www.google.com/maps/search/?api=1&query=King+O+Falafel+Kissimmee|Very close|Delivery friendly
Brazilian|Sabor Brasil|Casual Brazilian comfort food with generous portions close to the resort area.|https://www.google.com/maps/search/?api=1&query=Sabor+Brasil+Kissimmee|Very close|Delivery friendly
Caribbean|Tropico Mofongo|A nearby option for mofongo and hearty Puerto Rican and Caribbean flavors.|https://www.google.com/maps/search/?api=1&query=Tropico+Mofongo+Kissimmee|Very close|Delivery friendly
American|Miller's Ale House|An easy group choice for burgers, wings, seafood and sports after a park day.|https://millersalehouse.com/|Very close|Pickup & delivery
Asian|Zuru Ramen & Hibachi|A convenient choice when the group wants ramen, hibachi or something warm delivered.|https://www.google.com/maps/search/?api=1&query=Zuru+Ramen+Hibachi+Kissimmee|Very close|Delivery friendly
Quick Eats|Taco Bell|A familiar, fast stop for tacos, burritos and late-night cravings after a long park day.|https://www.google.com/maps/search/?api=1&query=Taco+Bell+4951+W+Irlo+Bronson+Memorial+Hwy+Kissimmee+FL|Very close|Drive-thru & delivery
Breakfast|Cracker Barrel|A family-friendly choice for all-day breakfast, Southern comfort food and a relaxed sit-down meal.|https://www.google.com/maps/search/?api=1&query=Cracker+Barrel+5400+W+Irlo+Bronson+Memorial+Hwy+Kissimmee+FL|Very close|Dine-in & pickup
Essentials|Wawa|A Florida fan favorite for hoagies, coffee, fuel, snacks and vacation essentials.|https://www.google.com/maps/search/?api=1&query=Wawa+near+4290+Paragraph+Drive+Kissimmee+FL|Close by|Food, fuel & essentials
American|Applebee's|An easy group-friendly option for burgers, ribs, appetizers and a casual meal close to the home.|https://www.google.com/maps/search/?api=1&query=Applebees+4759+Irlo+Bronson+Memorial+Pkwy+Kissimmee+FL|Very close|Dine-in & delivery`,
  language: "en",
  showCelebration: false,
  celebrationType: "birthday",
  celebrationDate: "",
  celebrationName: "",
  celebrationMessage: "Wishing you an unforgettable day filled with magic and memories!",
  homeInfo: "Parking|Add parking and vehicle instructions here.\nPool & spa|Add operating and safety guidance here.\nComfort|Add thermostat and home-care guidance here.\nTrash|Add collection days and bin instructions here.\nCheckout|Add the key departure steps here.\nNeed help?|Add the best host contact method here.",
  localFavorites: `Food|Se7en Bites|Southern comfort brunch and bakery favorites—go hungry and share something sweet.|https://www.se7enbites.com/|Worth the drive|
Food|Beefy King|An old-school Orlando landmark for hot steamed roast-beef sandwiches.|https://beefykingorlando.com/|Worth the drive|
Food|Lazy Moon Pizza|The giant slices and laid-back local-art atmosphere make this more memorable than ordinary pizza.|https://www.lazymoonpizza.com/|Worth the drive|
Food|Teak Neighborhood Grill|Come for the handcrafted burgers—and ask your server for the Underground secret menu.|https://www.teakorlando.com/|Worth the drive|
Food|Willie's Pinchos|Puerto Rican pinchos, mofongo, loaded fries and bold comfort food.|https://williespinchos.com/|Worth the drive|
Food|The Edison|A Roaring '20s power-plant atmosphere that is best for a themed night out at Disney Springs.|https://www.theedisonfla.com/|Close by|
Treats|Gideon's Bakehouse|Nearly half-pound cookies and rotating cake slices; expect a queue at Disney Springs.|https://gideonsbakehouse.com/locations/|Close by|
Treats|The Dolly Llama|Build an over-the-top combination of waffles, ice cream, sauces and toppings.|https://www.thedollyllamaflorida.com/|Worth the drive|
Treats|The Glass Knife|Beautiful cakes, pastries, donuts and brunch in Winter Park.|https://theglassknife.com/|Worth the drive|
Treats|Better Than Sex|An adults-only dessert experience made for date night or an anniversary.|https://www.betterthansexdesserts.com/|Worth the drive|
Treats|Salt & Straw|Creative small-batch flavors make this a fun Disney Springs finale.|https://saltandstraw.com/pages/disney-springs|Close by|
Entertainment|Andretti Indoor Karting|Electric karting, bowling, laser tag, VR and arcade games under one roof.|https://andrettikarting.com/orlando/attractions|Worth the drive|
Entertainment|SAK Comedy Lab|Audience-driven live improv with the spontaneous energy of Whose Line Is It Anyway?|https://www.sakcomedylab.com/|Worth the drive|
Entertainment|Orlando Science Center|A strong rainy-day choice for hands-on science, dinosaurs and family discovery.|https://www.osc.org/|Worth the drive|
Entertainment|Orlando Cat Café|Reserve time for coffee and a room full of adoptable cats.|https://www.orlandocatcafe.com/|Worth the drive|
Entertainment|Titanic: The Artifact Exhibition|Artifacts, recreated rooms and costumed storytelling create an immersive indoor outing.|https://titanicorlando.com/|Worth the drive|
Nature|Bok Tower Gardens|A peaceful garden escape centered on the historic Singing Tower and carillon.|https://boktowergardens.org/|Half-day trip|
Nature|King's Landing · Emerald Cut|Paddle through one of Central Florida's clearest and most beautiful spring runs.|https://www.kingslandingfl.com/|Half-day trip|
Nature|Kelly Park · Rock Springs|A classic Florida spring day with tubing and cool clear water.|https://www.ocfl.net/cultureparks/parks.aspx?m=dtlvw&d=22|Half-day trip|
Nature|Brevard Zoo Kayaking|A rare chance to kayak around animal habitats; kayaking is separate from admission.|https://brevardzoo.getanchor.io/adventures/kayaking/index.html|Day trip|
Nature|Mead Botanical Garden|A free, relaxed garden walk in Winter Park with trails, wetlands and birdlife.|https://meadgarden.org/|Worth the drive|
Day Trip|Devil's Den Spring|Snorkel inside a prehistoric underground spring; reservations are required.|https://devilsden.com/|Full-day trip|
Day Trip|Kennedy Space Center|Real spacecraft, astronaut history and an unforgettable Space Coast day.|https://www.kennedyspacecenter.com/|Full-day trip|
Day Trip|Blowing Rocks Preserve|At rough high tide, Atlantic waves burst dramatically through the limestone shoreline.|https://www.nature.org/en-us/get-involved/how-to-help/places-we-protect/blowing-rocks-preserve/|Full-day trip|`,
  reviewUrl: "",
  rebookUrl: "",
  reviewMessage: "Thank you for staying with us. If you enjoyed your visit, we would be grateful if you shared your experience.",
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

const encoder = new TextEncoder();
const randomNonce = () => `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
const base64Url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");

async function hmac(value, env) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.GUEST_TOKEN_SECRET || env.ADMIN_TOKEN), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  return base64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function displayAccessToken(env, version = "1") {
  return hmac(`display-access:${version}`, env);
}

async function guestAccessToken(stay, env) {
  return hmac(`guest-access:${stay.id || "current"}:${stay.guestAccessNonce}:${stay.checkIn}:${stay.checkOut}`, env);
}

async function verifiedGuestRecord(token, records, env) {
  if (!token) return null;
  for (const record of records) if (record?.guestAccessNonce && await guestAccessToken(record, env) === token) return record;
  return null;
}

function easternNow() {
  const entries = new Intl.DateTimeFormat("en-US", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", hourCycle:"h23" }).formatToParts(new Date());
  const part = type => entries.find(entry => entry.type === type)?.value || "";
  return { date:`${part("year")}-${part("month")}-${part("day")}`, hour:Number(part("hour")) };
}

function guestWindowStatus(stay) {
  const now = easternNow();
  if (!stay.checkIn || !stay.checkOut || now.date < stay.checkIn) return "not-started";
  if (now.date > stay.checkOut || (now.date === stay.checkOut && now.hour >= 11)) return "expired";
  return "active";
}

function safeGuestSettings(settings) {
  return {
    guestName:settings.guestName, checkIn:settings.checkIn, checkOut:settings.checkOut,
    occasion:settings.occasion, welcomeMessage:settings.welcomeMessage,
    wifiName:settings.wifiName, wifiPassword:settings.wifiPassword, propertyAddress:settings.propertyAddress,
    homeInfo:settings.homeInfo,
    nearbyFavorites:settings.nearbyFavorites, localFavorites:settings.localFavorites, language:settings.language,
    theme:settings.theme, accessExpires:`${settings.checkOut} at 11:00 AM Eastern`
  };
}

function sanitize(input) {
  const text = (v, n) => String(v ?? "").trim().slice(0, n);
  const bool = (v, fallback = true) => v === undefined ? fallback : Boolean(v);
  const themes = new Set([
    "galactic", "celebration", "elegant", "holiday", "christmas-immersive", "halloween-immersive", "fourth-july-immersive",
    "aurora-immersive", "iron-man-immersive", "spider-man-immersive", "superhero-immersive", "neutral",
    "star-wars", "star-wars-immersive", "toy-story", "wizarding", "princess", "harry-potter-immersive",
    "harry-potter-express", "mario-immersive", "pokemon-immersive"
    , "florida-sunshine", "orlando-nights", "retro-florida", "space-coast", "everglades-adventure",
    "tropical-christmas", "beach-day", "pirate-adventure", "luxury-resort", "florida-storm",
    "classic-theme-park", "orange-grove"
  ]);
  const schedulePages = ["welcome", "events", "forecast", "homeInfo", "storeyLake", "nearbyMap", "nearbyEasy", "localFavorites"];
  const scheduleModes = new Set(["always", "stay", "arrival", "first-two", "final-two", "custom"]);
  const pageSchedule = Object.fromEntries(schedulePages.map(page => {
    const entry = input.pageSchedule?.[page] || {};
    return [page, {
      mode: scheduleModes.has(entry.mode) ? entry.mode : "always",
      startDay: Math.min(60, Math.max(1, Number(entry.startDay) || 1)),
      endDay: Math.min(60, Math.max(1, Number(entry.endDay) || 60))
    }];
  }));
  const durationPages = [...schedulePages, "celebration", "review"];
  const pageDurations = Object.fromEntries(durationPages.map(page => [page,
    Math.min(120, Math.max(8, Number(input.pageDurations?.[page]) || Number(input.slideSeconds) || 18))
  ]));
  const defaultPageOrder = DEFAULTS.pageOrder;
  const requestedOrder = Array.isArray(input.pageOrder) ? input.pageOrder.filter(page => defaultPageOrder.includes(page)) : [];
  const pageOrder = [...new Set([...requestedOrder, ...defaultPageOrder])];
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
    showHomeInfo: bool(input.showHomeInfo, false),
    showStoreyLake: bool(input.showStoreyLake),
    showNearbyMap: bool(input.showNearbyMap),
    showNearbyEasy: bool(input.showNearbyEasy),
    showLocalFavorites: bool(input.showLocalFavorites, false),
    propertyAddress: text(input.propertyAddress, 160) || DEFAULTS.propertyAddress,
    pageSchedule,
    pageDurations,
    pageOrder,
    smartRotation: bool(input.smartRotation),
    maxRotationPages: Math.min(8, Math.max(3, Number(input.maxRotationPages) || 6)),
    language: ["en", "es", "fr", "pt", "de"].includes(input.language) ? input.language : "en",
    showCelebration: bool(input.showCelebration, false),
    celebrationType: ["birthday", "anniversary"].includes(input.celebrationType) ? input.celebrationType : "birthday",
    celebrationDate: text(input.celebrationDate, 10),
    celebrationName: text(input.celebrationName, 100),
    celebrationMessage: text(input.celebrationMessage, 300),
    homeInfo: text(input.homeInfo, 3000),
    nearbyFavorites: text(input.nearbyFavorites, 8000),
    localFavorites: text(input.localFavorites, 16000),
    reviewUrl: text(input.reviewUrl, 500),
    rebookUrl: text(input.rebookUrl, 500),
    reviewMessage: text(input.reviewMessage, 500),
    parkOrder: ["disney-first", "universal-first"].includes(input.parkOrder) ? input.parkOrder : "disney-first",
    motionIntensity: ["full", "reduced", "still"].includes(input.motionIntensity) ? input.motionIntensity : "full",
    artworkIntensity: Math.min(100, Math.max(20, Number(input.artworkIntensity) || 80)),
    transitionStyle: ["auto", "fade", "cinematic", "quick-wipe"].includes(input.transitionStyle) ? input.transitionStyle : "auto"
  };
}

function sanitizeStay(input, existing = {}) {
  const clean = sanitize({ ...DEFAULTS, ...input });
  const id = String(existing.id || input.id || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80) || crypto.randomUUID();
  return {
    id,
    guestAccessNonce: existing.guestAccessNonce || randomNonce(),
    guestName: clean.guestName,
    checkIn: clean.checkIn,
    checkOut: clean.checkOut,
    welcomeMessage: clean.welcomeMessage,
    occasion: clean.occasion,
    theme: clean.theme,
    language: clean.language,
    showCelebration: Boolean(input.showCelebration),
    celebrationType: clean.celebrationType,
    celebrationDate: clean.celebrationDate,
    celebrationName: clean.celebrationName,
    celebrationMessage: clean.celebrationMessage
  };
}

function settingsWithDefaults(stored) {
  const merged = { ...DEFAULTS, ...(stored || {}) };
  if (!stored?.nearbyFavorites) merged.nearbyFavorites = DEFAULTS.nearbyFavorites;
  else {
    merged.nearbyFavorites = String(merged.nearbyFavorites).replace(
      "A Florida fan-favorite convenience stop for made-to-order hoagies, coffee, fuel, snacks and last-minute supplies.",
      "A Florida fan favorite for hoagies, coffee, fuel, snacks and vacation essentials."
    );
    const defaultNearbyRows = DEFAULTS.nearbyFavorites.split("\n").slice(-4);
    const savedNearbyNames = new Set(String(merged.nearbyFavorites).split("\n").map(row => row.split("|")[1]?.trim()));
    const missingNearbyRows = defaultNearbyRows.filter(row => !savedNearbyNames.has(row.split("|")[1]?.trim()));
    if (missingNearbyRows.length) merged.nearbyFavorites = `${String(merged.nearbyFavorites).trim()}\n${missingNearbyRows.join("\n")}`;
  }
  if (!stored?.localFavorites || /Add a favorite (breakfast|dinner|dessert) spot/i.test(stored.localFavorites)) merged.localFavorites = DEFAULTS.localFavorites;
  if (!Array.isArray(stored?.pageOrder)) merged.pageOrder = [...DEFAULTS.pageOrder];
  else if (!stored.pageOrder.includes("nearbyEasy")) {
    merged.pageOrder = [...stored.pageOrder];
    const beforeFavorites = merged.pageOrder.indexOf("localFavorites");
    merged.pageOrder.splice(beforeFavorites < 0 ? merged.pageOrder.length : beforeFavorites, 0, "nearbyEasy");
  }
  return merged;
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
    .filter(item => item.entityType === "ATTRACTION" && /REFURBISHMENT/i.test(String(item.status || "")))
    .map(item => ({ name: item.name || "Unnamed attraction", park: parkName }));
  return { waits, unavailable };
}

function extractEvents(payload) {
  const today = easternDate();
  const now = Date.now();
  const live = Array.isArray(payload?.liveData) ? payload.liveData : [];
  const rows = [];
  for (const item of live) {
    for (const show of (Array.isArray(item.showtimes) ? item.showtimes : [])) {
      const start = show.startTime || show.start;
      const startsAt = start ? new Date(start).getTime() : NaN;
      if (!start || easternDate(start) !== today || !Number.isFinite(startsAt) || startsAt <= now) continue;
      const name = item.name || "Entertainment";
      const category = /parade|starlight|festival of fantasy|procession/i.test(name) ? "parade"
        : /fireworks|happily ever after|luminous|fantasmic|celestial|movie magic|nighttime|spectacular/i.test(name) ? "nighttime"
        : "show";
      rows.push({ name, time: easternTime(start), startsAt, category });
    }
  }
  const priority = /happily ever after|luminous|fantasmic|fireworks|parade|starlight|nighttime/i;
  return rows
    .sort((a, b) => Number(priority.test(b.name)) - Number(priority.test(a.name)) || a.startsAt - b.startsAt)
    .filter((x, i, all) => all.findIndex(y => y.name === x.name && y.time === x.time) === i)
    .slice(0, 4)
    .map(({ startsAt, ...event }) => event);
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
      if (!env.ADMIN_TOKEN || !env.STR_SETTINGS) return json({ error:"Display security is not configured." }, 503);
      const displayVersion = await env.STR_SETTINGS.get("display-token-version") || "1";
      if (url.searchParams.get("displayToken") !== await displayAccessToken(env, displayVersion)) return json({ error:"Display access denied." }, 401);
      const [stored, stays] = env.STR_SETTINGS
        ? await Promise.all([env.STR_SETTINGS.get("current-display", "json"), env.STR_SETTINGS.get("planned-stays", "json")])
        : [null, []];
      const activeStay = (Array.isArray(stays) ? stays : [])
        .filter(stay => guestWindowStatus(stay) === "active")
        .sort((a, b) => b.checkIn.localeCompare(a.checkIn))[0];
      let tokenSource = activeStay;
      if (activeStay && !activeStay.guestAccessNonce) {
        activeStay.guestAccessNonce = randomNonce();
        await env.STR_SETTINGS.put("planned-stays", JSON.stringify(stays));
      } else if (!activeStay && stored?.checkIn && stored?.checkOut) {
        tokenSource = { ...stored, id:"current", guestAccessNonce:stored.guestAccessNonce || randomNonce() };
        if (!stored.guestAccessNonce) await env.STR_SETTINGS.put("current-display", JSON.stringify({ ...stored, guestAccessNonce:tokenSource.guestAccessNonce }));
      }
      const settings = { ...settingsWithDefaults(stored), ...(activeStay || {}), activeStayId:activeStay?.id || "" };
      delete settings.guestAccessNonce;
      if (tokenSource && guestWindowStatus(tokenSource) === "active") settings.guestAccessToken = await guestAccessToken(tokenSource, env);
      return json(settings);
    }

    if (url.pathname === "/api/guest" && request.method === "GET") {
      if (!env.ADMIN_TOKEN || !env.STR_SETTINGS) return json({ error:"Guest access is unavailable." }, 503);
      const [stored, stays] = await Promise.all([env.STR_SETTINGS.get("current-display", "json"), env.STR_SETTINGS.get("planned-stays", "json")]);
      const currentRecord = stored ? { ...stored, id:"current" } : null;
      const record = await verifiedGuestRecord(url.searchParams.get("token"), [currentRecord, ...(Array.isArray(stays) ? stays : [])], env);
      if (!record) return json({ error:"This guest guide link is invalid or has been revoked." }, 401);
      const access = guestWindowStatus(record);
      if (access === "not-started") return json({ error:`This guest guide becomes available on ${record.checkIn}.` }, 403);
      if (access === "expired") return json({ expired:true, message:"Thank you for staying with us. We hope your Orlando memories last long after checkout.", reviewUrl:stored?.reviewUrl || "", rebookUrl:stored?.rebookUrl || "" }, 410, { "cache-control":"private, no-store, max-age=0", "x-robots-tag":"noindex, nofollow, noarchive" });
      const settings = record.id === "current" ? settingsWithDefaults(record) : { ...settingsWithDefaults(stored), ...record };
      return json(safeGuestSettings(settings), 200, { "cache-control":"private, no-store, max-age=0", "x-robots-tag":"noindex, nofollow, noarchive" });
    }

    if (url.pathname === "/api/admin/status" && request.method === "GET") {
      return json({
        adminConfigured: Boolean(env.ADMIN_TOKEN),
        settingsStorageConfigured: Boolean(env.STR_SETTINGS)
      });
    }

    if (url.pathname === "/api/admin/display-access") {
      if (!authorized(request, env)) return json({ error:"Unauthorized" }, 401);
      if (!env.STR_SETTINGS) return json({ error:"KV binding STR_SETTINGS is missing." }, 500);
      let version = await env.STR_SETTINGS.get("display-token-version") || "1";
      if (request.method === "POST") {
        version = String(Number(version) + 1);
        await env.STR_SETTINGS.put("display-token-version", version);
      }
      const displayToken = await displayAccessToken(env, version);
      return json({ displayToken, displayUrl:`${url.origin}/?displayToken=${encodeURIComponent(displayToken)}`, rotated:request.method === "POST" });
    }

    if (url.pathname === "/api/admin/current-guest-access" && request.method === "POST") {
      if (!authorized(request, env)) return json({ error:"Unauthorized" }, 401);
      if (!env.STR_SETTINGS) return json({ error:"KV binding STR_SETTINGS is missing." }, 500);
      const stored = await env.STR_SETTINGS.get("current-display", "json");
      if (!stored) return json({ error:"Publish current guest settings first." }, 404);
      await env.STR_SETTINGS.put("current-display", JSON.stringify({ ...stored, guestAccessNonce:randomNonce() }));
      return json({ success:true, message:"The current guest’s previous guide link has been revoked." });
    }

    if (url.pathname === "/api/admin/settings") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

      if (request.method === "GET") {
        const stored = env.STR_SETTINGS
          ? await env.STR_SETTINGS.get("current-display", "json")
          : null;
        return json(settingsWithDefaults(stored));
      }

      if (request.method === "POST") {
        if (!env.STR_SETTINGS) return json({ error: "KV binding STR_SETTINGS is missing." }, 500);
        let body;
        try { body = await request.json(); }
        catch { return json({ error: "Invalid JSON" }, 400); }
        const stored = await env.STR_SETTINGS.get("current-display", "json");
        const clean = { ...sanitize(body), guestAccessNonce:stored?.guestAccessNonce || randomNonce() };
        await env.STR_SETTINGS.put("current-display", JSON.stringify(clean));
        return json({ success: true, settings: clean });
      }
    }

    if (url.pathname === "/api/admin/stays") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      if (!env.STR_SETTINGS) return json({ error: "KV binding STR_SETTINGS is missing." }, 500);
      const stays = await env.STR_SETTINGS.get("planned-stays", "json");
      const current = (Array.isArray(stays) ? stays : []).map(stay => stay.guestAccessNonce ? stay : { ...stay, guestAccessNonce:randomNonce() });
      if (Array.isArray(stays) && current.some((stay, index) => stay.guestAccessNonce !== stays[index]?.guestAccessNonce)) await env.STR_SETTINGS.put("planned-stays", JSON.stringify(current));
      if (request.method === "GET") return json({ stays: current.sort((a, b) => a.checkIn.localeCompare(b.checkIn)) });
      if (request.method === "POST") {
        let body;
        try { body = await request.json(); }
        catch { return json({ error: "Invalid JSON" }, 400); }
        if (body.action === "delete") {
          const next = current.filter(stay => stay.id !== body.id);
          await env.STR_SETTINGS.put("planned-stays", JSON.stringify(next));
          return json({ success: true, stays: next });
        }
        if (body.action === "rotate-access") {
          const next = current.map(stay => stay.id === body.id ? { ...stay, guestAccessNonce:randomNonce() } : stay);
          if (!next.some(stay => stay.id === body.id)) return json({ error:"Stay not found." }, 404);
          await env.STR_SETTINGS.put("planned-stays", JSON.stringify(next));
          return json({ success:true, stays:next, message:"The previous guest guide link has been revoked." });
        }
        const existing = current.find(stay => stay.id === body.stay?.id) || {};
        const clean = sanitizeStay(body.stay || {}, existing);
        if (!clean.checkIn || !clean.checkOut || clean.checkOut < clean.checkIn) return json({ error: "Enter a valid check-in and checkout date." }, 400);
        const next = [...current.filter(stay => stay.id !== clean.id), clean].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
        await env.STR_SETTINGS.put("planned-stays", JSON.stringify(next));
        const overlaps = next.filter(stay => stay.id !== clean.id && stay.checkIn < clean.checkOut && stay.checkOut > clean.checkIn).map(stay => stay.guestName);
        return json({ success: true, stay: clean, stays: next, overlaps });
      }
    }

    if (url.pathname === "/api/parks" && request.method === "GET") {
      const cache = caches.default;
      const key = new Request(`${url.origin}/api/parks?cache=v10`);
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
      const key = new Request(`${url.origin}/api/weather?cache=v4`);
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
          source: "Open-Meteo",
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
