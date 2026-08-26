function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(context) {
  const configured = context.env.ADMIN_TOKEN;
  if (!configured) return false;
  const supplied = context.request.headers.get("Authorization") || "";
  return supplied === `Bearer ${configured}`;
}

function sanitize(input) {
  const text = (value, max) => String(value ?? "").trim().slice(0, max);
  const allowedThemes = new Set(["galactic", "celebration", "elegant", "holiday", "neutral"]);
  const theme = allowedThemes.has(input.theme) ? input.theme : "galactic";
  const slideSeconds = Math.min(120, Math.max(8, Number(input.slideSeconds) || 18));

  return {
    guestName: text(input.guestName, 80) || "Welcome!",
    occasion: text(input.occasion, 100),
    welcomeMessage: text(input.welcomeMessage, 160),
    checkIn: text(input.checkIn, 10),
    checkOut: text(input.checkOut, 10),
    theme,
    wifiName: text(input.wifiName, 80),
    wifiPassword: text(input.wifiPassword, 80),
    checkoutTime: text(input.checkoutTime, 30),
    contactText: text(input.contactText, 140),
    guideUrl: text(input.guideUrl, 500),
    showParks: Boolean(input.showParks),
    showHouse: Boolean(input.showHouse),
    slideSeconds
  };
}

export async function onRequestGet(context) {
  if (!isAuthorized(context)) return unauthorized();
  const stored = await context.env.STR_SETTINGS.get("current-display", "json");
  return Response.json(stored || {}, { headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPost(context) {
  if (!isAuthorized(context)) return unauthorized();

  let input;
  try {
    input = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const clean = sanitize(input);
  await context.env.STR_SETTINGS.put("current-display", JSON.stringify(clean));
  return Response.json({ success: true, settings: clean });
}
