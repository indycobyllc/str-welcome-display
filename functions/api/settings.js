const DEFAULTS = {
  guestName: "Welcome!",
  occasion: "",
  welcomeMessage: "Your adventure begins here.",
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

export async function onRequestGet(context) {
  try {
    const stored = await context.env.STR_SETTINGS.get("current-display", "json");
    return Response.json({ ...DEFAULTS, ...(stored || {}) }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return Response.json(DEFAULTS, { headers: { "Cache-Control": "no-store" } });
  }
}
