const $ = id => document.getElementById(id);
const managerToken = new URLSearchParams(location.search).get("managerToken") || "";
if (!managerToken) { $("managerForm").hidden = true; $("managerStatus").textContent = "This manager link is missing or invalid. Ask the display owner for the current portal link."; }
$("managerForm").addEventListener("submit", async event => {
  event.preventDefault(); const button = $("createButton"), status = $("managerStatus");
  const reservationName = $("reservationName").value.trim();
  const suggestedName = `${reservationName.split(/\s+/).filter(Boolean).slice(-1)[0] || "Guest"} Family`;
  const payload = { reservationName, guestCount:Number($("guestCount").value) || 0, guestName:$("guestName").value.trim() || suggestedName, checkIn:$("checkIn").value, checkOut:$("checkOut").value };
  button.disabled = true; status.textContent = "Creating secure guest link…"; status.className = "";
  try { const response = await fetch(`/api/manager/stays?managerToken=${encodeURIComponent(managerToken)}`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error || "Unable to create reservation."); $("guestLink").value = body.preArrivalUrl; $("resultTitle").textContent = `${body.guestName} is ready`; $("managerResult").hidden = false; $("managerForm").closest("section").hidden = true; status.textContent = ""; } catch (error) { status.textContent = error.message; status.className = "error"; } finally { button.disabled = false; }
});
$("copyGuestLink").addEventListener("click", async () => { try { await navigator.clipboard.writeText($("guestLink").value); $("copyGuestLink").textContent = "Copied—paste into Airbnb"; } catch { $("guestLink").select(); } });
$("addAnother").addEventListener("click", () => { $("managerForm").reset(); $("managerForm").closest("section").hidden = false; $("managerResult").hidden = true; $("copyGuestLink").textContent = "Copy link for Airbnb"; });
