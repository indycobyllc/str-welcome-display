(() => {
  // src/display-client.js
  if (!String.prototype.replaceAll) {
    Object.defineProperty(String.prototype, "replaceAll", {
      configurable: true,
      writable: true,
      value: function(search, replacement) {
        if (search instanceof RegExp) {
          if (!search.global) throw new TypeError("replaceAll requires a global RegExp");
          return this.replace(search, replacement);
        }
        return this.split(String(search)).join(replacement);
      }
    });
  }
  var DEFAULTS = {
    guestName: "Welcome!",
    occasion: "",
    welcomeMessage: "Your adventure begins here.",
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
    showMorningShow: true,
    morningShowTime: "08:00",
    morningShowDuration: 75,
    showNightShow: true,
    nightShowTime: "20:55",
    nightShowDuration: 50,
    showFullNightSpectacular: true,
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
    pageOrder: ["arrival", "welcome", "events", "forecast", "funFact", "homeInfo", "storeyLake", "nearbyMap", "nearbyEasy", "localFavorites", "celebration", "review"],
    nearbyFavorites: "",
    language: "en",
    showCelebration: false,
    celebrationType: "birthday",
    celebrationDate: "",
    celebrationEndDate: "",
    celebrationName: "",
    celebrationKicker: "",
    celebrationHeadline: "",
    showCelebrationMessage: true,
    celebrationMessage: "Wishing you an unforgettable day filled with magic and memories!",
    homeInfo: "Parking|Park in the garage or driveway. You may also use any available unreserved parking space within the community.\nChandelier fireworks|With the chandelier switched on, say \u201CAlexa, chandelier firework show\u201D and watch it come to life. When finished, say \u201CAlexa, reset chandelier\u201D to restore the regular lighting.\nComfort|The thermostat is upstairs. Please consider the outdoor temperature\u201471\xB0F is typically a comfortable setting the air conditioner can maintain.\nSolar & EV charging|This home is powered by solar energy! An EV charger is located in the garage. Access to the charger lockbox code is available for purchase.\nMake yourself at home|Everything outside the locked closets is available for your use, including a stroller and Pack \u2019n Play.\nKitchen essentials|You are welcome to use the air fryer, coffee maker, toaster, blender, oven and other unlocked kitchen amenities.\nTrash pickup|Bag all garbage securely, then place it inside the bin outside the front door. The community team normally collects it daily.\nMade in this home|The 3D-printed park maps, MagicBand replica, EPCOT nightlight, Magic Kingdom sign and other d\xE9cor were made by us. Interested in your own? Email indycobyenterprisesllc@gmail.com to coordinate an Etsy purchase.\nHelp us improve|We welcome your feedback. Your ideas help us make your future visits\u2014and every guest\u2019s stay\u2014even better.",
    localFavorites: "Breakfast|Add a favorite breakfast spot|A great start before the parks|\nDinner|Add a favorite dinner spot|A guest-favorite evening out|\nTreats|Add a favorite dessert stop|Perfect after a long park day|",
    reviewUrl: "",
    reviewMessage: "Thank you for staying with us. If you enjoyed your visit, we would be grateful if you shared your experience.",
    parkOrder: "disney-first",
    motionIntensity: "full",
    artworkIntensity: 80,
    transitionStyle: "auto",
    lgSignageOptimized: true
  };
  function guestAddressName(value) {
    return String(value || "").trim().replace(/^welcome(?:\s+to\s+your\s+orlando\s+vacation)?[\s,!:\-–—]*/i, "").replace(/^the\s+/i, "").replace(/[!.]+$/g, "").trim();
  }
  function guestWelcomeHeadline(value) {
    const name = guestAddressName(value);
    return name ? `Welcome, ${name}!` : "Welcome!";
  }
  var $ = (id) => document.getElementById(id);
  var FUN_FACTS = [
    ["Magic Kingdom is upstairs", "Florida\u2019s high water table meant the famous Utilidors could not go underground. They were built at ground level first, then Magic Kingdom was constructed above them."],
    ["Detail Hunt \xB7 Liberty Tree", "Count the lanterns hanging from Liberty Square\u2019s Liberty Tree. There are 13\u2014one for each of the original American colonies."],
    ["Century-old locomotives", "The four steam locomotives of the Walt Disney World Railroad were originally built between 1916 and 1928\u2014decades before Magic Kingdom existed."],
    ["Seven million yards of earth", "Creating Seven Seas Lagoon required moving more than seven million cubic yards of earth. The man-made lagoon contains three small islands."],
    ["Detail Hunt \xB7 Take the stairs", "At Tower of Terror, inspect the directory board in the abandoned lobby. Fallen letters at its base rearrange into a warning: TAKE THE STAIRS."],
    ["Frozen at 8:05", "Every clock and watch inside the Hollywood Tower Hotel is stopped at 8:05\u2014the moment lightning struck in the attraction\u2019s 1939 backstory."],
    ["Detail Hunt \xB7 A strange song", "In Tower of Terror\u2019s library, look beneath the trumpet for 1932 sheet music titled \u201CWhat! No Mickey Mouse? What Kind of Party Is This?\u201D"],
    ["Detail Hunt \xB7 Caesar", "Before leaving Tower of Terror, look for Caesar, the ventriloquist dummy from a classic Twilight Zone episode, waiting in the basement."],
    ["Exactly 337 animals", "The Tree of Life contains 337 sculpted animals across its trunk and roots. Its carvings turn the park icon into a giant visual scavenger hunt."],
    ["The safari road is engineered rough", "Imagineers mixed concrete with real stones, dirt and twigs to create Kilimanjaro Safaris\u2019 deliberately convincing\u2014and bumpy\u2014road surface."],
    ["Detail Hunt \xB7 Kangaroos", "From the main Tree of Life photo area, turn left and watch the habitat on your right for western grey and red kangaroos."],
    ["Detail Hunt \xB7 Bruce", "Along the Discovery Island Trails near the Tree of Life Garden, look for Bruce, a paroon shark catfish\u2014a species capable of growing to ten feet long."],
    ["Detail Hunt \xB7 The shy muntjac", "Take the right-hand Oasis trail and scan the brush on your left for Carly, a small Reeve\u2019s muntjac that many guests walk straight past."],
    ["Not actually naked", "The naked mole rats at Gorilla Falls are covered in very fine sensory hairs that help them navigate their dark underground tunnels."],
    ["Detail Hunt \xB7 Pixar\u2019s first Oscar", "At the Toy Story Mania! exit, find the open Little Golden Book for Tin Toy\u2014the 1988 short that earned Pixar its first Academy Award."],
    ["Andy built a snack empire", "Toy Story Mania! hides imaginary concessions including Slinky\u2019s Corn Dogs, Wheezy\u2019s Snow Cones, Rocky Gibraltar\u2019s Taffy and Hockey Puck\u2019s Ice Cream Bars."],
    ["Detail Hunt \xB7 Rat tracks", "In EPCOT\u2019s expanded France pavilion, look down in Remy\u2019s queue for tiny rat prints, then scan the railings, lamps and benches for more rat motifs."],
    ["Detail Hunt \xB7 Parked after dinner", "Outside Remy\u2019s Ratatouille Adventure, Chef Skinner\u2019s scooter and Colette\u2019s motorbike are parked in the pavilion as full-size film Easter eggs."],
    ["Crookedology", "The passage into Remy\u2019s corner of the France pavilion shifts from real-world architecture to bolder colors and intentionally bent shapes\u2014Pixar\u2019s design idea called \u201Ccrookedology.\u201D"],
    ["Two thousand Himalayan details", "For Expedition Everest, Imagineers brought back more than 2,000 handcrafted objects from Asia and used traditional rammed-earth techniques in the village."],
    ["The theater moves\u2014not the stage", "At Carousel of Progress, the audience seating revolves around a stationary central stage, carrying guests from one era to the next."],
    ["A lost attraction let guests choose", "EPCOT\u2019s Horizons let riders select a desert, undersea or space ending from buttons in their vehicle\u2014an early Disney branching finale."],
    ["Detail Hunt \xB7 Ratatouille storefronts", "Along EPCOT\u2019s All\xE9e des Marchands, find Anton Ego\u2019s fictional wine shop and the health inspector\u2019s office from Ratatouille."],
    ["A Falcon at full scale", "The Millennium Falcon parked in Galaxy\u2019s Edge stretches more than 100 feet from end to end\u2014roughly the length of the ship\u2019s on-screen design."],
    ["A song hidden in the future", "Horizons once hid \u201CThere\u2019s a Great Big Beautiful Tomorrow\u201D on a television in its 1940s scene, before the song returned to Carousel of Progress."],
    ["Castle inspiration", "Cinderella Castle\u2019s designers studied European landmarks including Versailles, Fontainebleau, Chambord, and Chenonceau."],
    ["From animation to architecture", "Imagineers also used the original production designs from Disney\u2019s 1950 Cinderella film when creating Cinderella Castle."],
    ["The artist behind the castle", "Herb Ryman served as Cinderella Castle\u2019s chief designer after also contributing to Disneyland\u2019s Sleeping Beauty Castle."],
    ["A royal name correction", "The restaurant inside Cinderella Castle was renamed Cinderella\u2019s Royal Table in 1997; it had previously referenced Sleeping Beauty\u2019s King Stefan."],
    ["When the castle became cake", "For Walt Disney World\u2019s 25th anniversary, Cinderella Castle was transformed with giant decorations and more than 400 gallons of pink paint."],
    ["A suite in the landmark", "A private suite opened inside Cinderella Castle in 2007 as part of Disney\u2019s Year of a Million Dreams."],
    ["Room for one more", "The Haunted Mansion is famously presented as the home of 999 happy haunts\u2014with room for one more."],
    ["Why they\u2019re Doom Buggies", "The Haunted Mansion\u2019s continuously moving vehicles use Disney\u2019s Omnimover system, which lets each car turn guests toward a carefully framed scene."],
    ["The voice in the mansion", "Paul Frees\u2014also known for many classic animation voices\u2014recorded the Haunted Mansion\u2019s Ghost Host narration."],
    ["An elegant exterior", "Walt Disney wanted the Haunted Mansion maintained beautifully on the outside, leaving the ghosts to look after the interior."],
    ["A billion-dollar idea", "EPCOT Center cost approximately $1 billion to create and was once among the world\u2019s largest single-site construction projects."],
    ["Two EPCOT spheres", "Spaceship Earth is really two separate structural spheres\u2014an outer weather shell surrounding an inner ride building."],
    ["Floating above the ground", "Spaceship Earth begins 15 feet above ground level; its lower hemisphere is suspended from the structure above."],
    ["Four famous narrators", "Spaceship Earth has been narrated by Vic Perrin, Walter Cronkite, Jeremy Irons, and Dame Judi Dench."],
    ["A very large aquarium", "The main tank at The Seas with Nemo & Friends holds about 5.7 million gallons of water."],
    ["Around the world on foot", "A complete walk around EPCOT\u2019s World Showcase promenade is approximately 1.3 miles."],
    ["An opening-day song", "The Sherman Brothers wrote The World Showcase March especially for EPCOT Center\u2019s 1982 grand-opening ceremonies."],
    ["A little spark from home", "A slide whistle borrowed from songwriter Robert Sherman\u2019s son was used while recording music for Journey Into Imagination."],
    ["Hand-pollinated magic", "Because ordinary bees and large guest crowds do not mix well, crops inside The Land\u2019s greenhouses have historically been pollinated by hand."],
    ["Why America is across the lagoon", "EPCOT placed The American Adventure opposite the entrance so guests pass other nations before reaching the host pavilion."],
    ["Neighbors at the gateway", "Mexico and Canada\u2014the United States\u2019 continental neighbors\u2014welcome guests at the two sides of World Showcase\u2019s main entrance."],
    ["A science-fiction storyteller", "Author Ray Bradbury helped develop the original story concept and script ideas for Spaceship Earth."],
    ["Filming before opening", "The first production filmed at the Florida studio was the television movie Splash Too in February 1988\u2014more than a year before the park opened."],
    ["Hollywood Boulevard\u2019s source", "Buildings along Hollywood Boulevard were designed from real examples of classic Southern California architecture."],
    ["A two-hour opening-day tour", "Disney-MGM Studios originally featured a sprawling backstage tour designed to show guests how movies and television were made."],
    ["A working animation studio", "Guests once watched Disney artists at work in Florida through large windows along the park\u2019s Animation Tour."],
    ["Animation made in Florida", "Disney\u2019s Florida animation team played major roles in Mulan, Lilo & Stitch, and Brother Bear."],
    ["The original Star Tours pilot", "Paul Reubens voiced REX, the enthusiastic but inexperienced pilot in the original Star Tours."],
    ["More than 100 journeys", "Updates to Star Tours created more than 100 possible combinations of characters, destinations, and story sequences."],
    ["Thirteen stories into the Twilight Zone", "The original Tower of Terror adventure culminated in a 13-story elevator drop; randomized drop profiles arrived in 2002."],
    ["Fantasmic in Florida", "Walt Disney World\u2019s version of Fantasmic! debuted in the purpose-built Hollywood Hills Amphitheater in October 1998."],
    ["Hidden Mickey Hunt \xB7 Wilderness Lodge", "In the Wilderness Lodge lobby, study the stones of the towering fireplace\u2014an official Disney clue points to a stone Mickey hidden there."],
    ["Hidden Mickey Hunt \xB7 Under the Sea", "Near the exit of Under the Sea \u2013 Journey of the Little Mermaid, study the rockwork for a remarkably subtle Steamboat Willie profile."],
    ["Hidden Mickey Hunt \xB7 Tatooine Traders", "At the build-your-own-lightsaber area, look low on a panel for three battle-scar circles arranged as Mickey\u2019s head and ears."],
    ["Hidden Mickey from the sky", "Near EPCOT, a 5,000-kilowatt solar array is constructed in the unmistakable outline of Mickey Mouse\u2019s head."],
    ["Toy Story detail hunt", "In the Toy Story Mania! queue, find barcode 121506\u2014a reference to December 15, 2006, when the attraction was announced."],
    ["The tradition began as a joke", "Hidden Mickeys began as inside jokes among Disney Imagineers in the 1980s before becoming a resort-wide guest scavenger hunt."],
    ["Not every trio is intentional", "Disney\u2019s own archives note that fans sometimes find three-circle \u2018Hidden Mickeys\u2019 that were actually accidental design patterns."],
    ["Pull the forbidden rope", "Outside Indiana Jones Epic Stunt Spectacular, find the well with the sign warning guests not to pull the rope\u2014and see what happens if you do."],
    ["A fireplace through time", "Wilderness Lodge\u2019s 82-foot lobby fireplace uses more than 100 colors to evoke 1.6 billion years of Grand Canyon rock layers."],
    ["Forty miles of lodgepole pine", "The lodgepole pine used at Wilderness Lodge would stretch nearly 40 miles if placed end to end."],
    ["A 1959 idea still moving", "Disneyland introduced America\u2019s first daily operating monorail in 1959; Walt Disney World expanded the idea into a true resort transportation system."]
  ];
  var funFactIndex = Math.floor(Date.now() / 864e5) % FUN_FACTS.length;
  function advanceFunFact() {
    const fact = FUN_FACTS[funFactIndex++ % FUN_FACTS.length];
    const isHunt = /hunt|look beyond|look for|find the/i.test(`${fact[0]} ${fact[1]}`);
    $("funFactLabel").textContent = isHunt ? "Today\u2019s park hunt" : "Did you know?";
    $("funFactTitle").textContent = fact[0];
    $("funFactText").textContent = fact[1];
    $("funFactNumber").textContent = String((funFactIndex - 1) % FUN_FACTS.length + 1).padStart(2, "0");
  }
  var currentWeather = null;
  var currentParks = null;
  var currentSettings = DEFAULTS;
  var TRANSLATIONS = {
    en: { stay: "Your Orlando stay", hours: "Today\u2019s Orlando park hours", changes: "Times may change", wifi: "Wi-Fi", events: "Entertainment & Events", plan: "Plan your day", today: "Today", forecast: "Weather for Your Stay", vacationForecast: "Your vacation forecast", home: "Your Home Guide", settle: "Settle in and feel at home", good: "Good to know", resort: "Storey Lake Resort", noPlans: "No plans today? Enjoy your included resort amenities", map: "Around Orlando", closer: "You\u2019re closer than you think", favorites: "Local Favorites", places: "A few places we genuinely love", thankYou: "Thank You", birthdayKicker: "A birthday wish just for you", anniversaryKicker: "Celebrating your anniversary", babyGirlKicker: "A little princess is on her way", birthday: "Happy Birthday", anniversary: "Happy Anniversary", babyGirl: "It\u2019s a Girl" },
    es: { stay: "Tu estad\xEDa en Orlando", hours: "Horarios de los parques hoy", changes: "Los horarios pueden cambiar", wifi: "Wi-Fi", events: "Eventos y entretenimiento", plan: "Planifica tu d\xEDa", today: "Hoy", forecast: "Clima durante tu estad\xEDa", vacationForecast: "Pron\xF3stico de tus vacaciones", home: "Gu\xEDa de la casa", settle: "Inst\xE1late y si\xE9ntete como en casa", good: "Informaci\xF3n \xFAtil", resort: "Resort Storey Lake", noPlans: "\xBFSin planes hoy? Disfruta de las amenidades incluidas", map: "Alrededor de Orlando", closer: "Est\xE1s m\xE1s cerca de lo que imaginas", favorites: "Favoritos locales", places: "Algunos lugares que nos encantan", thankYou: "Gracias", birthdayKicker: "Un deseo de cumplea\xF1os solo para ti", anniversaryKicker: "Celebrando su aniversario", birthday: "Feliz cumplea\xF1os", anniversary: "Feliz aniversario" },
    fr: { stay: "Votre s\xE9jour \xE0 Orlando", hours: "Horaires des parcs aujourd\u2019hui", changes: "Les horaires peuvent changer", wifi: "Wi-Fi", events: "Spectacles et \xE9v\xE9nements", plan: "Planifiez votre journ\xE9e", today: "Aujourd\u2019hui", forecast: "M\xE9t\xE9o de votre s\xE9jour", vacationForecast: "Pr\xE9visions de vos vacances", home: "Guide de la maison", settle: "Installez-vous comme chez vous", good: "Bon \xE0 savoir", resort: "Resort Storey Lake", noPlans: "Rien de pr\xE9vu? Profitez des \xE9quipements inclus", map: "Autour d\u2019Orlando", closer: "Vous \xEAtes plus pr\xE8s que vous ne le pensez", favorites: "Nos adresses pr\xE9f\xE9r\xE9es", places: "Quelques endroits que nous aimons", thankYou: "Merci", birthdayKicker: "Un v\u0153u d\u2019anniversaire rien que pour vous", anniversaryKicker: "C\xE9l\xE9brons votre anniversaire", birthday: "Joyeux anniversaire", anniversary: "Joyeux anniversaire de mariage" },
    pt: { stay: "Sua estadia em Orlando", hours: "Hor\xE1rios dos parques hoje", changes: "Os hor\xE1rios podem mudar", wifi: "Wi-Fi", events: "Eventos e entretenimento", plan: "Planeje seu dia", today: "Hoje", forecast: "Clima durante sua estadia", vacationForecast: "Previs\xE3o das suas f\xE9rias", home: "Guia da casa", settle: "Sinta-se em casa", good: "Informa\xE7\xF5es \xFAteis", resort: "Resort Storey Lake", noPlans: "Sem planos hoje? Aproveite as comodidades inclu\xEDdas", map: "Perto de Orlando", closer: "Voc\xEA est\xE1 mais perto do que imagina", favorites: "Favoritos locais", places: "Alguns lugares que adoramos", thankYou: "Obrigado", birthdayKicker: "Um desejo de anivers\xE1rio s\xF3 para voc\xEA", anniversaryKicker: "Celebrando seu anivers\xE1rio", birthday: "Feliz anivers\xE1rio", anniversary: "Feliz anivers\xE1rio de casamento" },
    de: { stay: "Ihr Aufenthalt in Orlando", hours: "Heutige Park\xF6ffnungszeiten", changes: "Zeiten k\xF6nnen sich \xE4ndern", wifi: "WLAN", events: "Shows und Veranstaltungen", plan: "Planen Sie Ihren Tag", today: "Heute", forecast: "Wetter f\xFCr Ihren Aufenthalt", vacationForecast: "Ihre Urlaubsvorhersage", home: "Hausinformationen", settle: "F\xFChlen Sie sich wie zu Hause", good: "Gut zu wissen", resort: "Storey Lake Resort", noPlans: "Heute noch nichts vor? Genie\xDFen Sie die enthaltenen Annehmlichkeiten", map: "Orlando entdecken", closer: "Alles ist n\xE4her als Sie denken", favorites: "Lokale Favoriten", places: "Einige Orte, die wir lieben", thankYou: "Vielen Dank", birthdayKicker: "Ein Geburtstagswunsch nur f\xFCr Sie", anniversaryKicker: "Wir feiern Ihren Jahrestag", birthday: "Alles Gute zum Geburtstag", anniversary: "Alles Gute zum Hochzeitstag" }
  };
  function applyLanguage(language) {
    const words = TRANSLATIONS[language] || TRANSLATIONS.en;
    document.documentElement.lang = language || "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      if (words[node.dataset.i18n]) node.textContent = words[node.dataset.i18n];
    });
    document.querySelectorAll("[data-page-key]").forEach((slide) => {
      const key = slide.dataset.titleKey;
      if (key && words[key]) slide.dataset.pageTitle = words[key];
    });
  }
  async function cachedJson(url, key) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${url} unavailable`);
      const data = await response.json();
      try {
        localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
      } catch {
      }
      return { data, offline: false };
    } catch (error) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || "null");
        if (saved == null ? void 0 : saved.data) return { data: saved.data, offline: true };
      } catch {
      }
      throw error;
    }
  }
  function setOffline(isOffline) {
    $("connectionStatus").hidden = !isOffline;
    $("display").classList.toggle("offline", isOffline);
  }
  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[c]);
  }
  function safeUrl(value = "") {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }
  function formatDateRange(start, end) {
    if (!start && !end) return "";
    const opts = { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" };
    const toDate = (value) => value ? /* @__PURE__ */ new Date(`${value}T12:00:00-04:00`) : null;
    const s = toDate(start), e = toDate(end);
    if (s && e) return `${s.toLocaleDateString("en-US", opts)} \u2013 ${e.toLocaleDateString("en-US", opts)}`;
    return (s || e).toLocaleDateString("en-US", opts);
  }
  function calendarDate(value) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }
  function scheduledPageVisible(enabled, key, settings, todayValue, checkIn, checkOut) {
    var _a;
    if (!enabled) return false;
    const rule = ((_a = settings.pageSchedule) == null ? void 0 : _a[key]) || { mode: "always" };
    if (rule.mode === "always") return true;
    if (!checkIn || !checkOut || todayValue < checkIn || todayValue > checkOut) return false;
    const stayDay = Math.floor((todayValue - checkIn) / 864e5) + 1;
    const daysUntilCheckout = Math.ceil((checkOut - todayValue) / 864e5);
    if (rule.mode === "stay") return true;
    if (rule.mode === "arrival") return stayDay === 1;
    if (rule.mode === "first-two") return stayDay <= 2;
    if (rule.mode === "final-two") return daysUntilCheckout <= 1;
    if (rule.mode === "custom") {
      const start = Math.max(1, Number(rule.startDay) || 1);
      const end = Math.max(start, Number(rule.endDay) || start);
      return stayDay >= start && stayDay <= end;
    }
    return true;
  }
  function parseRows(value, columns) {
    return String(value || "").split("\n").map((row) => row.split("|").map((item) => item.trim()).slice(0, columns)).filter((row) => row.some(Boolean));
  }
  function renderGuestPages(s) {
    const homeRows = parseRows(s.homeInfo, 2);
    $("homeInfoGrid").innerHTML = homeRows.map(([title, detail], index) => `<article><span>${["\u2302", "\u2726", "\xB0", "\u2600", "\u2661", "\u25C7", "\u267B", "\u25A7", "\u2713"][index % 9]}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></article>`).join("");
    const todaySeed = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date()).replaceAll("-", ""));
    const rotateDaily = (rows, limit) => {
      const score = (row) => [...row.join("")].reduce((total, character) => (total * 31 + character.charCodeAt(0) + todaySeed) % 2147483647, 7);
      const sorted = [...rows].sort((a, b) => score(a) - score(b));
      if (sorted.length <= limit) return sorted;
      const selected = [], categories = /* @__PURE__ */ new Set();
      for (const row of sorted) {
        const category = row[0].toLowerCase();
        if (!categories.has(category)) {
          selected.push(row);
          categories.add(category);
        }
        if (selected.length === limit) return selected;
      }
      for (const row of sorted) {
        if (!selected.includes(row)) selected.push(row);
        if (selected.length === limit) break;
      }
      return selected;
    };
    const nearbyCards = rotateDaily(parseRows(s.nearbyFavorites, 6).filter((row) => PLACE_ASSETS[row[1]]), 12).map(([category, name, note, url, distance, service]) => {
      const link = safeUrl(url), image = placeAsset(name);
      return `<article data-category="${escapeHtml(category.toLowerCase())}"><div class="favorite-visual"><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}"><small>${escapeHtml(distance)}</small></div><div><em>${escapeHtml(category)}</em><h3>${escapeHtml(name)}</h3><p>${escapeHtml(note)}</p><strong>${escapeHtml(service)}</strong>${link ? qrMarkup(link, `Scan for ${name}`) : ""}</div></article>`;
    });
    $("nearbyFavoritesGrid").innerHTML = pagedCards(nearbyCards, 6);
    const favoriteCards = rotateDaily(parseRows(s.localFavorites, 6).filter((row) => PLACE_ASSETS[row[1]]), 12).map(([category, name, note, url, distance]) => {
      const link = safeUrl(url), image = placeAsset(name);
      return `<article data-category="${escapeHtml(category.toLowerCase())}"><div class="favorite-visual"><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}"><small>${escapeHtml(distance)}</small></div><div><em>${escapeHtml(category)}</em><h3>${escapeHtml(name)}</h3><p>${escapeHtml(note)}</p>${link ? qrMarkup(link, `Scan to plan ${name}`) : ""}</div></article>`;
    });
    $("favoritesGrid").innerHTML = pagedCards(favoriteCards, 6);
  }
  function pagedCards(cards, perPage) {
    const pages = [];
    for (let index = 0; index < cards.length; index += perPage) pages.push(`<div class="favorite-page rotating-page ${index === 0 ? "active" : ""}">${cards.slice(index, index + perPage).join("")}</div>`);
    return pages.join("");
  }
  var PLACE_ASSETS = {
    "Walmart Supercenter": "walmart-supercenter.jpg",
    "Publix \xB7 Sunrise City Plaza": "publix.jpg",
    "Super Target": "target.jpg",
    "King O Falafel": "king-o-falafel.jpg",
    "Sabor Brasil": "sabor-brasil.jpg",
    "Tropico Mofongo": "tropico-mofongo.jpg",
    "Miller's Ale House": "millers-ale-house.jpg",
    "Zuru Ramen & Hibachi": "zuru-ramen.jpg",
    "Taco Bell": "taco-bell.jpg",
    "Cracker Barrel": "cracker-barrel.jpg",
    "Wawa": "wawa.jpg",
    "Applebee's": "applebees.jpg",
    "Se7en Bites": "se7en-bites.jpg",
    "Beefy King": "beefy-king.jpg",
    "Lazy Moon Pizza": "lazy-moon.jpg",
    "Andretti Indoor Karting": "andretti.jpg",
    "Orlando Science Center": "orlando-science-center.jpg",
    "Bok Tower Gardens": "bok-tower-gardens.jpg",
    "King's Landing \xB7 Emerald Cut": "kings-landing.jpg",
    "Devil's Den Spring": "devils-den.jpg",
    "Kennedy Space Center": "kennedy-space-center.jpg",
    "Blowing Rocks Preserve": "blowing-rocks.jpg",
    "Teak Neighborhood Grill": "teak-neighborhood-grill.jpg",
    "Gideon's Bakehouse": "gideons-bakehouse.jpg",
    "The Dolly Llama": "dolly-llama.jpg",
    "Orlando Cat Caf\xE9": "orlando-cat-cafe.jpg",
    "Titanic: The Artifact Exhibition": "titanic-orlando.webp",
    "SAK Comedy Lab": "sak-comedy-lab.jpg",
    "Portillo's Kissimmee": "portillos-kissimmee.jpg",
    "Twistee Treat": "twistee-treat.jpg",
    "Yellow Dog Eats": "yellow-dog-eats.jpg"
  };
  function placeAsset(name = "") {
    return `/assets/places/${PLACE_ASSETS[name] || ""}`;
  }
  function qrMarkup(url, label) {
    const qrUrl = `https://quickchart.io/qr?size=150&margin=1&text=${encodeURIComponent(url)}`;
    return `<div class="favorite-qr"><img src="${escapeHtml(qrUrl)}" alt="${escapeHtml(label)}"><b>Scan</b></div>`;
  }
  function applyReviewMoment(s, todayValue, checkOut) {
    const slide = document.querySelector(".review-slide");
    const reviewUrl = safeUrl(s.reviewUrl);
    if (!reviewUrl || !checkOut || todayValue > checkOut) return slide.hidden = true;
    const daysUntil = Math.ceil((checkOut - todayValue) / 864e5);
    slide.hidden = daysUntil < 0 || daysUntil > 2;
    if (slide.hidden) return;
    $("reviewMessage").textContent = s.reviewMessage || DEFAULTS.reviewMessage;
    $("reviewTiming").textContent = daysUntil === 0 ? "Safe travels home" : daysUntil === 1 ? "Before tomorrow's checkout" : "As your stay winds down";
    const qr = $("reviewQr");
    qr.src = `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(reviewUrl)}`;
    qr.alt = "QR code linking to the Airbnb review page";
  }
  function applyStaySummary(start, end) {
    const holder = $("staySummary");
    const checkIn = calendarDate(start);
    const checkOut = calendarDate(end);
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      holder.hidden = true;
      return;
    }
    const todayText = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(/* @__PURE__ */ new Date());
    const today = calendarDate(todayText);
    const dayMs = 864e5;
    const nights = Math.round((checkOut - checkIn) / dayMs);
    $("stayLength").textContent = `${nights}-night stay`;
    if (today < checkIn) {
      const until = Math.ceil((checkIn - today) / dayMs);
      $("daysRemaining").textContent = `Begins in ${until} day${until === 1 ? "" : "s"}`;
    } else if (today < checkOut) {
      const remaining = Math.ceil((checkOut - today) / dayMs);
      $("daysRemaining").textContent = `${remaining} day${remaining === 1 ? "" : "s"} remaining`;
    } else if (today === checkOut) {
      $("daysRemaining").textContent = "Departure day";
    } else {
      $("daysRemaining").textContent = "Thanks for staying with us";
    }
    holder.hidden = false;
  }
  function updateClock() {
    const now = /* @__PURE__ */ new Date();
    $("currentTime").textContent = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York"
    });
    $("currentDate").textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: "America/New_York"
    });
  }
  function weatherDetails(code, isDay = true) {
    if (code === 0) return { icon: isDay ? "\u2600" : "\u263E", text: "Clear" };
    if ([1, 2].includes(code)) return { icon: isDay ? "\u{1F324}" : "\u2601", text: "Partly cloudy" };
    if (code === 3) return { icon: "\u2601", text: "Cloudy" };
    if ([45, 48].includes(code)) return { icon: "\u224B", text: "Foggy" };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: "\u{1F326}", text: "Drizzle" };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: "\u2602", text: "Rain" };
    if ([95, 96, 99].includes(code)) return { icon: "\u03DF", text: "Thunderstorms" };
    return { icon: "\u25CB", text: "Orlando" };
  }
  async function loadWeather() {
    try {
      const result = await cachedJson("/api/weather", "str-weather-v1");
      const weather = result.data;
      window.__dataOffline || (window.__dataOffline = result.offline);
      const details = weatherDetails(weather.weatherCode, weather.isDay);
      $("weatherIcon").textContent = details.icon;
      $("weatherTemp").textContent = `${Math.round(weather.temperature)}\xB0`;
      $("weatherText").textContent = details.text;
      renderHourlyTimeline(weather);
      return weather;
    } catch {
      $("weatherText").textContent = "Orlando";
      return { daily: [] };
    }
  }
  function renderHourlyTimeline(weather) {
    var _a, _b, _c, _d;
    const currentKey = ((_a = weather.updatedAt) == null ? void 0 : _a.slice(0, 13)) || orlandoHourKey();
    const currentHour = (weather.hourly || []).find((hour) => {
      var _a2;
      return ((_a2 = hour.time) == null ? void 0 : _a2.slice(0, 13)) === currentKey;
    }) || (weather.hourly || []).find((hour) => {
      var _a2;
      return ((_a2 = hour.time) == null ? void 0 : _a2.slice(0, 13)) > currentKey;
    });
    const futureHours = (weather.hourly || []).filter((hour) => {
      var _a2;
      return ((_a2 = hour.time) == null ? void 0 : _a2.slice(0, 13)) > currentKey;
    }).slice(0, 4);
    const currentDetail = weatherDetails(weather.weatherCode, weather.isDay);
    const cells = [`<div><span>Now</span><b>${currentDetail.icon} ${Math.round(weather.temperature)}\xB0</b><small>${Math.round((currentHour == null ? void 0 : currentHour.rainChance) || 0)}% rain</small></div>`];
    cells.push(...futureHours.map((hour) => {
      var _a2;
      const hourNumber = Number((_a2 = hour.time) == null ? void 0 : _a2.slice(11, 13));
      const label = `${hourNumber % 12 || 12} ${hourNumber < 12 ? "AM" : "PM"}`;
      const detail = weatherDetails(hour.weatherCode, hourNumber >= 7 && hourNumber < 19);
      return `<div><span>${escapeHtml(label)}</span><b>${detail.icon} ${Math.round(hour.temperature)}\xB0</b><small>${Math.round(hour.rainChance || 0)}% rain</small></div>`;
    }));
    const currentLocal = weather.updatedAt || `${orlandoHourKey()}:00`;
    const currentDate = currentLocal.slice(0, 10);
    const todayWeather = ((_b = weather.daily) == null ? void 0 : _b.find((day) => day.date === currentDate)) || ((_c = weather.daily) == null ? void 0 : _c[0]);
    const sunset = todayWeather == null ? void 0 : todayWeather.sunset;
    if (sunset && currentLocal >= sunset) {
      const nextMorning = (_d = weather.daily) == null ? void 0 : _d.find((day) => day.date > currentDate && day.sunrise);
      if (nextMorning == null ? void 0 : nextMorning.sunrise) cells.push(`<div><span>Sunrise</span><b>\u2600 ${formatOrlandoClock(nextMorning.sunrise)}</b><small>Tomorrow morning</small></div>`);
    } else if (sunset) {
      cells.push(`<div><span>Sunset</span><b>\u2600 ${formatOrlandoClock(sunset)}</b><small>Golden hour</small></div>`);
    }
    $("hourlyTimeline").innerHTML = cells.join("");
  }
  function formatOrlandoClock(localTime) {
    const [hours = 0, minutes = "00"] = String(localTime).slice(11, 16).split(":");
    const hour = Number(hours);
    return `${hour % 12 || 12}:${minutes} ${hour < 12 ? "AM" : "PM"}`;
  }
  function orlandoHourKey() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "America/New_York"
    }).formatToParts(/* @__PURE__ */ new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}`;
  }
  function forecastHint(day) {
    if (day.rainChance >= 70) return "Pack ponchos";
    if (day.uvIndex >= 8 && day.high >= 92) return "Hydrate & take breaks";
    if (day.uvIndex >= 8) return "High UV \xB7 sunscreen";
    if (day.high >= 92) return "Plan a cool-down break";
    if (day.rainChance <= 25) return "Great park weather";
    return "A flexible park day";
  }
  function uvLabel(value = 0) {
    if (value >= 11) return "Extreme";
    if (value >= 8) return "Very high";
    if (value >= 6) return "High";
    if (value >= 3) return "Moderate";
    return "Low";
  }
  function shortDay(date) {
    return (/* @__PURE__ */ new Date(`${date}T12:00:00-04:00`)).toLocaleDateString("en-US", { weekday: "long" });
  }
  function packingAdvice(day) {
    const items = [];
    if ((day.rainChance || 0) >= 40) items.push("ponchos");
    if ((day.uvIndex || 0) >= 6) items.push("sunscreen");
    if ((day.high || 0) >= 88) items.push("water bottles");
    if ((day.low || 100) <= 62) items.push("a light layer");
    return items.length ? items.slice(0, 3).join(" \xB7 ") : "Comfortable shoes \xB7 park-ready layers";
  }
  function renderWeatherSnapshot(days) {
    const snapshot = $("weatherSnapshot");
    if (!days.length) return snapshot.replaceChildren();
    const best = [...days].sort((a, b) => {
      const score = (day) => (day.rainChance || 0) + Math.abs(Math.min(Math.max(day.high || 80, 72), 86) - (day.high || 80)) * 3;
      return score(a) - score(b);
    })[0];
    const packDay = days.find((day) => day.date > days[0].date) || days[0];
    const sunset = days[0].sunset ? new Date(days[0].sunset).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "After dinner";
    snapshot.innerHTML = `
    <article><span class="snapshot-icon">\u2605</span><div><small>Best park day</small><strong>${escapeHtml(shortDay(best.date))}</strong><p>${Math.round(best.rainChance || 0)}% rain \xB7 High ${Math.round(best.high)}\xB0</p></div></article>
    <article><span class="snapshot-icon">\u2301</span><div><small>Pack for ${packDay === days[0] ? "today" : shortDay(packDay.date)}</small><strong>${escapeHtml(packingAdvice(packDay))}</strong><p>UV ${uvLabel(packDay.uvIndex)} \xB7 ${Math.round(packDay.rainChance || 0)}% rain</p></div></article>
    <article><span class="snapshot-icon">\u2600</span><div><small>Tonight's sunset</small><strong>${escapeHtml(sunset)}</strong><p>Plan photos and nighttime arrival around dusk</p></div></article>`;
  }
  function renderForecast(weather, settings) {
    const grid = $("forecastGrid");
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(/* @__PURE__ */ new Date());
    const start = settings.checkIn && settings.checkIn > today ? settings.checkIn : today;
    const end = settings.checkOut || "9999-12-31";
    let days = (weather.daily || []).filter((day) => day.date >= start && day.date <= end);
    if (!days.length) days = (weather.daily || []).slice(0, 7);
    if (!days.length) {
      grid.innerHTML = `<div class="schedule-empty">The extended forecast is updating.</div>`;
      $("forecastRange").textContent = "Orlando, Florida";
      $("forecastNote").textContent = `Weather data by ${weather.source || "Open-Meteo"} \xB7 Orlando, Florida`;
      $("weatherSnapshot").replaceChildren();
      return;
    }
    const hottest = Math.max(...days.map((day) => day.high || 0));
    const wettest = Math.max(...days.map((day) => day.rainChance || 0));
    grid.style.setProperty("--forecast-days", Math.min(days.length, 8));
    grid.innerHTML = days.map((day, index) => {
      const date = /* @__PURE__ */ new Date(`${day.date}T12:00:00-04:00`);
      const label = index === 0 && day.date === today ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
      const detail = weatherDetails(day.weatherCode, true);
      const flags = [];
      if (days.length > 1 && day.high === hottest) flags.push("Hottest");
      if (days.length > 1 && wettest >= 35 && day.rainChance === wettest) flags.push("Wettest");
      return `<article class="forecast-card">
      ${flags.length ? `<div class="forecast-flags">${flags.map((flag) => `<span>${flag}</span>`).join("")}</div>` : ""}
      <div class="forecast-day">${escapeHtml(label)}</div>
      <div class="forecast-date">${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
      <div class="forecast-icon" aria-hidden="true">${detail.icon}</div>
      <div class="forecast-temps"><strong>${Math.round(day.high)}\xB0</strong><span>${Math.round(day.low)}\xB0</span></div>
      <div class="forecast-rain">${Math.round(day.rainChance || 0)}% rain</div>
      <div class="forecast-uv"><span style="--uv:${Math.min(day.uvIndex || 0, 11)}"></span>UV ${escapeHtml(uvLabel(day.uvIndex))}</div>
      <div class="forecast-tip">${escapeHtml(forecastHint(day))}</div>
    </article>`;
    }).join("");
    renderWeatherSnapshot(days);
    const first = /* @__PURE__ */ new Date(`${days[0].date}T12:00:00-04:00`);
    const last = /* @__PURE__ */ new Date(`${days[days.length - 1].date}T12:00:00-04:00`);
    $("forecastRange").textContent = `${first.toLocaleDateString("en-US", { month: "long", day: "numeric" })} \u2013 ${last.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
    $("forecastNote").textContent = `Weather data by ${weather.source || "Open-Meteo"} \xB7 Orlando, Florida`;
  }
  function parkLogo(name) {
    if (/magic kingdom/i.test(name)) return "/assets/parks/magic-kingdom.svg";
    if (/epcot/i.test(name)) return "/assets/parks/epcot.svg";
    if (/hollywood/i.test(name)) return "/assets/parks/hollywood-studios.svg";
    if (/animal kingdom/i.test(name)) return "/assets/parks/animal-kingdom.svg";
    return "";
  }
  function parkMark(name) {
    const logo = parkLogo(name);
    if (logo) return `<img src="${logo}" alt="${escapeHtml(name)}">`;
    const shortName = name.replace(/^Universal\s+/i, "");
    return `<span class="universal-mark"><small>Universal</small>${escapeHtml(shortName)}</span>`;
  }
  function eventCategory(event) {
    if (event.category) return event.category;
    if (/parade|starlight|festival of fantasy|procession/i.test(event.name)) return "parade";
    if (/fireworks|happily ever after|luminous|fantasmic|celestial|movie magic|nighttime|spectacular/i.test(event.name)) return "nighttime";
    return "show";
  }
  function eventBadge(event) {
    const category = eventCategory(event);
    const details = {
      nighttime: { icon: "\u2726", label: "Nighttime" },
      parade: { icon: "\u2691", label: "Parade" },
      show: { icon: "\u25C9", label: "Show" }
    }[category];
    return `<i class="event-type event-type-${category}" title="${details.label}" aria-label="${details.label}"><b>${details.icon}</b><small>${details.label}</small></i>`;
  }
  async function loadSettings() {
    if (new URLSearchParams(location.search).get("previewPage") || new URLSearchParams(location.search).get("previewDate") || new URLSearchParams(location.search).get("previewShow")) {
      try {
        const draft = JSON.parse(localStorage.getItem("str-preview-draft") || "null");
        if ((draft == null ? void 0 : draft.settings) && Date.now() - draft.savedAt < 36e5) return { ...DEFAULTS, ...draft.settings };
      } catch {
      }
    }
    const queryToken = new URLSearchParams(location.search).get("displayToken");
    if (queryToken) try {
      localStorage.setItem("str-display-token", queryToken);
    } catch {
    }
    let displayToken = queryToken;
    if (!displayToken) try {
      displayToken = localStorage.getItem("str-display-token") || "";
    } catch {
    }
    if (!displayToken) return { ...DEFAULTS, accessDenied: true };
    try {
      const response = await fetch(`/api/settings?displayToken=${encodeURIComponent(displayToken)}`, { cache: "no-store" });
      if (response.status === 401) {
        try {
          localStorage.removeItem("str-settings-v1");
          localStorage.removeItem("str-display-token");
        } catch {
        }
        return { ...DEFAULTS, accessDenied: true };
      }
      if (!response.ok) throw new Error("Settings unavailable");
      const data = await response.json();
      try {
        localStorage.setItem("str-settings-v1", JSON.stringify({ savedAt: Date.now(), data }));
      } catch {
      }
      const result = { data, offline: false };
      window.__dataOffline || (window.__dataOffline = result.offline);
      return { ...DEFAULTS, ...result.data };
    } catch {
      try {
        const saved = JSON.parse(localStorage.getItem("str-settings-v1") || "null");
        if (saved == null ? void 0 : saved.data) return { ...DEFAULTS, ...saved.data };
      } catch {
      }
      return { ...DEFAULTS, accessDenied: true };
    }
  }
  async function loadParks() {
    try {
      const result = await cachedJson("/api/parks", "str-parks-v1");
      window.__dataOffline || (window.__dataOffline = result.offline);
      return result.data;
    } catch (error) {
      return { parks: [], error: error.message };
    }
  }
  function applySettings(s) {
    var _a;
    currentSettings = s;
    const previewTheme = new URLSearchParams(location.search).get("previewTheme");
    const selectedTheme = previewTheme || s.theme || "galactic";
    const activeTheme = selectedTheme === "dynamic-atmosphere" ? resolveDynamicTheme() : selectedTheme === "epcot-dynamic" ? "epcot-festival-night" : selectedTheme;
    $("display").dataset.theme = activeTheme;
    $("display").dataset.themeMode = selectedTheme === "dynamic-atmosphere" ? "dynamic" : selectedTheme === "epcot-dynamic" ? "epcot-dynamic" : "fixed";
    $("display").dataset.atmosphere = selectedTheme === "epcot-dynamic" ? resolveEpcotAtmosphere() : "";
    $("display").dataset.celebrationType = s.celebrationType || "birthday";
    $("display").dataset.motion = s.motionIntensity;
    $("display").dataset.signage = s.lgSignageOptimized ? "lg43" : "standard";
    const themedTransition = /star-wars|iron-man|space-coast/.test(activeTheme) ? "wipe" : /harry|wizard|princess|classic-theme-park/.test(activeTheme) ? "spark" : /spider/.test(activeTheme) ? "web" : /christmas/.test(activeTheme) ? "snow" : /aurora|florida-storm|everglades/.test(activeTheme) ? "curtain" : "cinematic";
    $("display").dataset.transition = s.transitionStyle === "auto" ? themedTransition : s.transitionStyle;
    $("display").style.setProperty("--art-opacity", String((Number(s.artworkIntensity) || 80) / 100));
    if (s.accessDenied) {
      document.querySelectorAll(".slide").forEach((slide) => {
        slide.hidden = !slide.classList.contains("welcome-slide");
      });
      $("guestName").textContent = "Display access required";
      $("welcomeMessage").textContent = "Open the admin page to copy the secure OptiSigns display URL.";
      $("occasion").hidden = true;
      $("stayDates").textContent = "";
      $("hourlyTimeline").innerHTML = "";
      $("parkHoursGrid").innerHTML = "";
      $("staySummary").hidden = true;
      $("guestHubLink").hidden = true;
      return;
    }
    applyLanguage(s.language);
    const guest = guestAddressName(s.guestName);
    const welcomeHeadline = guestWelcomeHeadline(s.guestName);
    $("guestName").textContent = welcomeHeadline;
    $("arrivalGuest").textContent = welcomeHeadline;
    $("occasion").textContent = s.occasion || "";
    $("occasion").hidden = !s.occasion;
    $("welcomeMessage").textContent = s.welcomeMessage || "";
    $("stayDates").textContent = formatDateRange(s.checkIn, s.checkOut);
    $("wifiName").textContent = s.wifiName || "Guest Wi-Fi";
    $("wifiPassword").textContent = s.wifiPassword ? `Password: ${s.wifiPassword}` : "";
    const guestHubUrl = s.guestAccessToken ? `${location.origin}/guest?token=${encodeURIComponent(s.guestAccessToken)}` : "";
    $("guestHubLink").hidden = !guestHubUrl;
    if (guestHubUrl) {
      $("guestHubLink").href = guestHubUrl;
      (_a = window.LocalQRCode) == null ? void 0 : _a.toDataURL(guestHubUrl, { width: 240, margin: 4, errorCorrectionLevel: "M" }).then((source) => {
        $("guestHubQr").src = source;
      });
    }
    const previewDate = new URLSearchParams(location.search).get("previewDate");
    const today = /^\d{4}-\d{2}-\d{2}$/.test(previewDate || "") ? previewDate : new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
    const checkIn = calendarDate(s.checkIn), checkOut = calendarDate(s.checkOut), todayValue = calendarDate(today);
    let dayline = "Your Orlando adventure awaits";
    let eyebrow = "Your Orlando stay";
    if (checkIn && checkOut && todayValue >= checkIn && todayValue <= checkOut) {
      const day = Math.floor((todayValue - checkIn) / 864e5) + 1;
      const remaining = Math.max(0, Math.ceil((checkOut - todayValue) / 864e5));
      dayline = todayValue === checkIn ? "Your adventure begins today" : todayValue === checkOut ? "Safe travels home" : `Day ${day} of your vacation \xB7 ${remaining} day${remaining === 1 ? "" : "s"} remaining`;
      eyebrow = todayValue === checkIn ? "Welcome to your Orlando stay" : todayValue === checkOut ? "Until next time" : "Make today unforgettable";
    } else if (checkIn && todayValue < checkIn) {
      const until = Math.ceil((checkIn - todayValue) / 864e5);
      dayline = `${until} day${until === 1 ? "" : "s"} until your vacation`;
      eyebrow = "Your getaway is almost here";
    }
    $("welcomeEyebrowText").textContent = eyebrow;
    $("vacationDayline").textContent = dayline;
    $("arrivalMessage").textContent = s.occasion || "The adventure is waiting.";
    $("arrivalGuest").textContent = welcomeHeadline;
    document.querySelector(".arrival-slide").hidden = !(s.showArrival && s.checkIn === today);
    document.querySelector(".welcome-slide").hidden = !scheduledPageVisible(s.showWelcome, "welcome", s, todayValue, checkIn, checkOut);
    document.querySelector(".parks-slide").hidden = !scheduledPageVisible(s.showEvents, "events", s, todayValue, checkIn, checkOut);
    document.querySelector(".forecast-slide").hidden = !scheduledPageVisible(s.showForecast, "forecast", s, todayValue, checkIn, checkOut);
    document.querySelector(".home-info-slide").hidden = !scheduledPageVisible(s.showHomeInfo, "homeInfo", s, todayValue, checkIn, checkOut);
    document.querySelector(".storey-lake-slide").hidden = !scheduledPageVisible(s.showStoreyLake, "storeyLake", s, todayValue, checkIn, checkOut);
    document.querySelector(".nearby-map-slide").hidden = !scheduledPageVisible(s.showNearbyMap, "nearbyMap", s, todayValue, checkIn, checkOut);
    document.querySelector(".nearby-easy-slide").hidden = !scheduledPageVisible(s.showNearbyEasy, "nearbyEasy", s, todayValue, checkIn, checkOut);
    document.querySelector(".favorites-slide").hidden = !scheduledPageVisible(s.showLocalFavorites, "localFavorites", s, todayValue, checkIn, checkOut);
    applySmartRotation(s, todayValue, checkIn, checkOut);
    const celebrationPreview = new URLSearchParams(location.search).get("previewPage") === "celebration";
    const celebrationEndDate = s.celebrationEndDate || s.celebrationDate;
    const celebrationToday = Boolean(s.celebrationDate) && today >= s.celebrationDate && today <= celebrationEndDate;
    document.querySelector(".celebration-slide").hidden = !(celebrationPreview || s.showCelebration && celebrationToday);
    const celebrationWords = TRANSLATIONS[s.language] || TRANSLATIONS.en;
    const celebrationCopy = s.celebrationType === "baby-girl" ? { kicker: celebrationWords.babyGirlKicker || TRANSLATIONS.en.babyGirlKicker, heading: celebrationWords.babyGirl || TRANSLATIONS.en.babyGirl } : s.celebrationType === "anniversary" ? { kicker: celebrationWords.anniversaryKicker || TRANSLATIONS.en.anniversaryKicker, heading: celebrationWords.anniversary || TRANSLATIONS.en.anniversary } : { kicker: celebrationWords.birthdayKicker || TRANSLATIONS.en.birthdayKicker, heading: celebrationWords.birthday || TRANSLATIONS.en.birthday };
    $("celebrationKicker").textContent = s.celebrationKicker || celebrationCopy.kicker;
    const customCelebrationHeadline = String(s.celebrationHeadline || "").replaceAll("{name}", s.celebrationName || "");
    const celebrationHeading = customCelebrationHeadline || celebrationCopy.heading;
    document.querySelector(".celebration-icon").textContent = s.celebrationType === "baby-girl" ? "\u2661" : "\u2726";
    const automaticName = !customCelebrationHeadline && s.celebrationName ? `, ${s.celebrationName}` : "";
    $("celebrationTitle").textContent = customCelebrationHeadline ? customCelebrationHeadline : `${celebrationHeading}${automaticName}!`;
    const celebrationMessage = $("celebrationMessage");
    celebrationMessage.textContent = s.celebrationMessage || "";
    celebrationMessage.hidden = s.showCelebrationMessage === false || !s.celebrationMessage;
    $("mapPropertyAddress").textContent = s.propertyAddress || DEFAULTS.propertyAddress;
    renderGuestPages(s);
    applyReviewMoment(s, todayValue, checkOut);
    $("currentTime").parentElement.hidden = !s.showClock;
    applyStaySummary(s.checkIn, s.checkOut);
    renderDiagnostics(s);
  }
  function renderDiagnostics(settings) {
    const panel = $("displayDiagnostics");
    if (!panel) return;
    const visible = new URLSearchParams(location.search).get("diagnostics") === "1";
    panel.hidden = !visible;
    if (!visible) return;
    const screenSize = `${screen.width}\xD7${screen.height}`;
    const viewport = `${window.innerWidth}\xD7${window.innerHeight}`;
    const ratio = (window.innerWidth / Math.max(1, window.innerHeight)).toFixed(3);
    const engine = /Web0S|webOS/i.test(navigator.userAgent) ? "LG webOS" : /Android/i.test(navigator.userAgent) ? "Android" : "Browser";
    panel.innerHTML = `<strong>TV diagnostics</strong><span>Viewport <b>${viewport}</b></span><span>Screen <b>${screenSize}</b></span><span>Pixel ratio <b>${window.devicePixelRatio || 1}</b></span><span>Aspect <b>${ratio}</b></span><span>Engine <b>${engine}</b></span><span>LG optimization <b>${settings.lgSignageOptimized ? "ON" : "OFF"}</b></span><small>${escapeHtml(navigator.userAgent.slice(0, 150))}</small>`;
  }
  function resolveDynamicTheme() {
    const code = Number(currentWeather == null ? void 0 : currentWeather.weatherCode);
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "florida-storm";
    const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" }).format(/* @__PURE__ */ new Date())) % 24;
    if (hour < 6) return "space-station-orlando";
    if (hour < 10) return "florida-wildlife";
    if (hour < 16) return "luxury-resort";
    if (hour < 20) return "safari-sunset";
    return "enchanted-castle-night";
  }
  function resolveEpcotAtmosphere() {
    const code = Number(currentWeather == null ? void 0 : currentWeather.weatherCode);
    if ([95, 96, 99].includes(code)) return "storm";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
    if ([3, 45, 48].includes(code)) return "overcast";
    const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" }).format(/* @__PURE__ */ new Date())) % 24;
    if (hour >= 6 && hour < 10) return "sunrise";
    if (hour >= 10 && hour < 17) return "day";
    if (hour >= 17 && hour < 20) return "sunset";
    return "night";
  }
  function applySmartRotation(s, today, checkIn, checkOut) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    if (!s.smartRotation || new URLSearchParams(location.search).get("previewPage")) return;
    const enabled = (key) => {
      var _a2;
      return !((_a2 = document.querySelector(`[data-page-key="${key}"]`)) == null ? void 0 : _a2.hidden);
    };
    const day = checkIn && today >= checkIn ? Math.floor((today - checkIn) / 864e5) + 1 : 0;
    const remaining = checkOut && today <= checkOut ? Math.max(0, Math.ceil((checkOut - today) / 864e5)) : 99;
    const rain = Number((_f = (_e = (_b = (_a = currentWeather == null ? void 0 : currentWeather.daily) == null ? void 0 : _a.find((item) => item.date === new URLSearchParams(location.search).get("previewDate"))) == null ? void 0 : _b.rainChance) != null ? _e : (_d = (_c = currentWeather == null ? void 0 : currentWeather.daily) == null ? void 0 : _c[0]) == null ? void 0 : _d.rainChance) != null ? _f : 0);
    const high = Number((_l = (_k = (_h = (_g = currentWeather == null ? void 0 : currentWeather.daily) == null ? void 0 : _g.find((item) => item.date === new URLSearchParams(location.search).get("previewDate"))) == null ? void 0 : _h.high) != null ? _k : (_j = (_i = currentWeather == null ? void 0 : currentWeather.daily) == null ? void 0 : _i[0]) == null ? void 0 : _j.high) != null ? _l : 0);
    const hasLiveParkOpportunity = Boolean(((_n = (_m = currentParks == null ? void 0 : currentParks.insights) == null ? void 0 : _m.bestBets) == null ? void 0 : _n.length) || ((_o = currentParks == null ? void 0 : currentParks.insights) == null ? void 0 : _o.eveningPick));
    let preferred = day === 1 ? ["welcome", "homeInfo", "nearbyEasy", "storeyLake", "forecast", "events", "nearbyMap", "localFavorites"] : day === 2 ? ["welcome", "events", "forecast", "nearbyEasy", "nearbyMap", "storeyLake", "localFavorites", "homeInfo"] : remaining <= 2 ? ["welcome", "events", "forecast", "localFavorites", "nearbyEasy", "homeInfo", "nearbyMap", "storeyLake"] : ["welcome", "events", "forecast", "localFavorites", "storeyLake", "nearbyMap", "nearbyEasy", "homeInfo"];
    if (rain >= 65) preferred = ["welcome", "forecast", "events", "nearbyEasy", "localFavorites", "homeInfo", "nearbyMap", "storeyLake"];
    else if (high >= 92) preferred = ["welcome", "forecast", "events", "storeyLake", "nearbyEasy", "localFavorites", "nearbyMap", "homeInfo"];
    else if (hasLiveParkOpportunity) preferred = ["welcome", "events", ...preferred.filter((page) => !["welcome", "events"].includes(page))];
    const selected = new Set(preferred.filter(enabled).slice(0, Number(s.maxRotationPages) || 6));
    document.querySelectorAll("[data-page-key]").forEach((slide) => {
      if (["arrival", "funFact", "celebration", "review"].includes(slide.dataset.pageKey)) return;
      if (!slide.hidden && !selected.has(slide.dataset.pageKey)) slide.hidden = true;
    });
  }
  function renderParks(data) {
    var _a;
    const hoursGrid = $("parkHoursGrid");
    const eventsGrid = $("eventsGrid");
    if (!((_a = data.parks) == null ? void 0 : _a.length)) {
      hoursGrid.innerHTML = `<div class="schedule-empty">Park schedules are updating.</div>`;
      eventsGrid.innerHTML = `<div class="schedule-empty">Please confirm current events in the official park apps.</div>`;
      $("parksUpdated").textContent = "";
      return;
    }
    const orderedParks = [...data.parks].sort((a, b) => currentSettings.parkOrder === "universal-first" ? Number(!/^Universal/i.test(a.name)) - Number(!/^Universal/i.test(b.name)) : Number(/^Universal/i.test(a.name)) - Number(/^Universal/i.test(b.name)));
    hoursGrid.innerHTML = orderedParks.map((park) => `<article class="hours-card">
    <div class="park-mark">${parkMark(park.name)}</div>
    <strong>${escapeHtml(park.hours || "Hours unavailable")}</strong>
  </article>`).join("");
    const eventCards = orderedParks.map((park) => {
      const events = (park.events || []).slice(0, 3).map((event) => `<li><span class="event-name">${eventBadge(event)}<span>${escapeHtml(event.name)}</span></span><strong>${escapeHtml(event.time)}</strong></li>`).join("");
      return `<article class="park-card">
      <div class="park-card-heading">${parkMark(park.name)}</div>
      <ul class="event-list">${events || "<li><span>No major entertainment listed.</span></li>"}</ul>
    </article>`;
    });
    const firstGroup = eventCards.slice(0, 4).join("");
    const secondGroup = eventCards.slice(4).join("");
    eventsGrid.innerHTML = `<div class="event-page active" data-event-page="0">${firstGroup}</div>
    ${secondGroup ? `<div class="event-page" data-event-page="1">${secondGroup}</div>` : ""}`;
    const insights = data.insights || {};
    const bestBets = (insights.bestBets || []).map((item) => `${escapeHtml(item.name)} \xB7 ${Number(item.wait)} min`).join("<br>");
    const unavailableAttractions = Array.isArray(insights.unavailableAttractions) ? insights.unavailableAttractions : [];
    const unavailableLimit = window.innerWidth <= 720 ? 3 : window.innerWidth <= 1050 ? 4 : 7;
    const visibleUnavailable = unavailableAttractions.slice(0, unavailableLimit);
    const unavailableRemaining = Math.max(0, unavailableAttractions.length - visibleUnavailable.length);
    const disruptions = unavailableAttractions.length ? `${visibleUnavailable.map((item) => `<span title="${escapeHtml(`${item.name} \xB7 ${item.park}`)}">${escapeHtml(item.name)} <small>${escapeHtml(item.park)}</small></span>`).join("")}${unavailableRemaining ? `<span class="disruption-more">+${unavailableRemaining} more</span>` : ""}` : Number(insights.unavailable) ? `<span>${Number(insights.unavailable)} attractions under refurbishment</span>` : "No refurbishments reported";
    $("insightsGrid").innerHTML = `
    <article><span>Open latest</span><strong>${insights.latestClosing ? `${escapeHtml(insights.latestClosing.park)} \xB7 ${escapeHtml(insights.latestClosing.time)}` : "Schedule updating"}</strong></article>
    <article><span>Low waits right now</span><strong>${bestBets || "Live waits updating"}</strong></article>
    <article><span>${unavailableAttractions.length ? `Refurbishments \xB7 ${unavailableAttractions.length}` : "Refurbishments"}</span><strong class="disruption-list">${disruptions}</strong></article>`;
    renderRecommendation(data, currentWeather);
    const updated = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York"
    }) : "";
    $("parksUpdated").textContent = updated ? `Updated at ${updated} Eastern` : "";
  }
  function renderRecommendation(data, weather) {
    var _a, _b;
    const insights = data.insights || {};
    const today = (_a = weather == null ? void 0 : weather.daily) == null ? void 0 : _a[0];
    let title = "Best opportunity right now";
    let message = ((_b = insights.bestBets) == null ? void 0 : _b.length) ? `${insights.bestBets[0].name} is reporting about a ${insights.bestBets[0].wait}-minute wait.` : "Live recommendations are updating.";
    if ((today == null ? void 0 : today.rainChance) >= 65) {
      title = "Rain-smart plan";
      message = "Start with indoor attractions and keep ponchos ready for the highest rain window.";
    } else if (insights.eveningPick) {
      title = "Evening highlight";
      message = `${insights.eveningPick.name} at ${insights.eveningPick.park} \xB7 ${insights.eveningPick.time}.`;
    } else if (insights.latestClosing) {
      title = "Best for a late night";
      message = `${insights.latestClosing.park} has the latest posted closing time at ${insights.latestClosing.time}.`;
    }
    $("smartRecommendation").innerHTML = `<span>\u2726 ${escapeHtml(title)}</span><strong>${escapeHtml(message)}</strong>`;
  }
  var slideTimer;
  var eventPageTimer;
  var favoritePageTimer;
  var morningShowTimers = [];
  var nightShowTimers = [];
  function orlandoClockParts() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(/* @__PURE__ */ new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
  }
  function stopMorningShow() {
    morningShowTimers.forEach(clearTimeout);
    morningShowTimers = [];
    const show = $("morningShow");
    show.querySelectorAll("video").forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
    const music = $("morningShowMusic");
    if (music) {
      music.pause();
      music.currentTime = 0;
      music.volume = 0;
    }
    show.classList.remove("playing");
    show.hidden = true;
  }
  function playMorningShow(settings, preview = false) {
    var _a, _b;
    const show = $("morningShow");
    if (!show || show.classList.contains("playing")) return;
    let duration = Math.max(45, Number(settings.morningShowDuration) || 75);
    const hasVideoReel = Boolean(show.querySelector(".video-shot video"));
    const reelCards = [...show.querySelectorAll("[data-reel]")];
    const reelMilliseconds = reelCards.reduce((total, card) => total + (Number(card.dataset.durationMs) || 4450), 0);
    const ropeSeconds = hasVideoReel ? 12 : Math.min(10, duration * 0.14);
    const finaleSeconds = hasVideoReel ? 12 : Math.min(14, duration * 0.19);
    if (hasVideoReel) duration = ropeSeconds + reelMilliseconds / 1e3 + finaleSeconds;
    show.querySelectorAll("[data-morning-scene]").forEach((scene) => scene.classList.remove("active"));
    show.querySelector('[data-morning-scene="rope"]').classList.add("active");
    reelCards.forEach((card) => card.classList.remove("active"));
    $("ropeDropCount").textContent = "3";
    const guest = guestAddressName(settings.guestName) || "Your day starts now";
    $("morningGuestName").textContent = guest === "Your day starts now" ? guest : `Let\u2019s go, ${guest}!`;
    const today = (_a = currentWeather == null ? void 0 : currentWeather.daily) == null ? void 0 : _a[0];
    $("morningWeatherLine").textContent = currentWeather ? `${Math.round(currentWeather.temperature)}\xB0 now \xB7 High ${Math.round((_b = today == null ? void 0 : today.high) != null ? _b : currentWeather.temperature)}\xB0 \xB7 ${Math.round((today == null ? void 0 : today.rainChance) || 0)}% chance of rain` : "Sunshine, thrills and unforgettable moments are waiting.";
    $("morningTodayLabel").textContent = settings.occasion || "A brand-new Orlando day";
    show.style.setProperty("--morning-duration", `${duration}s`);
    if (hasVideoReel) show.querySelectorAll("video").forEach((video) => {
      const card = video.closest(".video-shot");
      const markReady = () => card == null ? void 0 : card.classList.add("video-ready");
      card == null ? void 0 : card.classList.remove("video-ready", "video-fallback");
      if (video.readyState >= 2) markReady();
      else video.addEventListener("loadeddata", markReady, { once: true });
      video.load();
    });
    show.hidden = false;
    requestAnimationFrame(() => show.classList.add("playing"));
    const music = $("morningShowMusic");
    if (music) {
      music.currentTime = 0;
      music.volume = 0;
      music.play().then(() => {
        for (let step = 1; step <= 10; step += 1) morningShowTimers.push(setTimeout(() => {
          music.volume = Math.min(0.3, step * 0.03);
        }, step * 250));
        for (let step = 1; step <= 10; step += 1) morningShowTimers.push(setTimeout(() => {
          music.volume = Math.max(0, 0.3 - step * 0.03);
        }, (duration - 3 + step * 0.25) * 1e3));
      }).catch(() => {
      });
    }
    [0, 1, 2].forEach((step) => morningShowTimers.push(setTimeout(() => {
      $("ropeDropCount").textContent = String(3 - step);
    }, (ropeSeconds - 4 + step) * 1e3)));
    morningShowTimers.push(setTimeout(() => {
      show.querySelector('[data-morning-scene="rope"]').classList.remove("active");
      show.querySelector('[data-morning-scene="reel"]').classList.add("active");
      let cardOffset = 0;
      reelCards.forEach((card) => {
        morningShowTimers.push(setTimeout(() => {
          const outgoing = reelCards.find((item) => item.classList.contains("active"));
          if (outgoing && outgoing !== card) {
            outgoing.classList.add("leaving");
            outgoing.classList.remove("active");
            morningShowTimers.push(setTimeout(() => {
              outgoing.classList.remove("leaving");
              const oldVideo = outgoing.querySelector("video");
              if (oldVideo) oldVideo.pause();
            }, 450));
          }
          card.classList.add("active");
          const video = card.querySelector("video");
          if (video) {
            video.currentTime = 0;
            video.play().catch(() => card.classList.add("video-fallback"));
          }
        }, cardOffset));
        cardOffset += Number(card.dataset.durationMs) || 4450;
      });
    }, ropeSeconds * 1e3));
    morningShowTimers.push(setTimeout(() => {
      reelCards.forEach((card) => {
        card.classList.remove("active", "leaving");
        const video = card.querySelector("video");
        if (video) video.pause();
      });
      show.querySelector('[data-morning-scene="reel"]').classList.remove("active");
      show.querySelector('[data-morning-scene="finale"]').classList.add("active");
    }, (duration - finaleSeconds) * 1e3));
    morningShowTimers.push(setTimeout(stopMorningShow, duration * 1e3));
    if (!preview) try {
      localStorage.setItem(`str-morning-show-${orlandoClockParts().date}`, "played");
    } catch {
    }
  }
  function scheduleMorningShow(settings) {
    const preview = new URLSearchParams(location.search).get("previewShow") === "morning";
    if (preview) return playMorningShow(settings, true);
    if (!settings.showMorningShow || settings.accessDenied) return;
    const now = orlandoClockParts();
    const [hour, minute] = String(settings.morningShowTime || "08:00").split(":").map(Number);
    const start = hour * 60 + minute;
    let alreadyPlayed = false;
    try {
      alreadyPlayed = Boolean(localStorage.getItem(`str-morning-show-${now.date}`));
    } catch {
    }
    if (now.minutes >= start && now.minutes < start + 30 && !alreadyPlayed) playMorningShow(settings);
  }
  function stopNightShow() {
    nightShowTimers.forEach(clearTimeout);
    nightShowTimers = [];
    const show = $("nightShow");
    show == null ? void 0 : show.querySelectorAll("video").forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
    const music = $("nightShowMusic");
    if (music) {
      music.pause();
      music.currentTime = 0;
      music.volume = 0;
    }
    const feature = $("nightFeaturePlayer");
    if (feature) feature.src = "about:blank";
    show == null ? void 0 : show.querySelectorAll("[data-night-scene]").forEach((scene) => scene.classList.remove("active"));
    show == null ? void 0 : show.classList.remove("playing", "spoiler-free");
    if (show) show.hidden = true;
  }
  function playNightShow(settings, preview = false) {
    var _a;
    const show = $("nightShow");
    if (!show || show.classList.contains("playing") || ((_a = $("morningShow")) == null ? void 0 : _a.classList.contains("playing"))) return;
    let duration = Math.min(120, Math.max(50, Number(settings.nightShowDuration) || 50));
    const guest = guestAddressName(settings.guestName) || "Orlando";
    $("nightGuestLine").textContent = guest === "Orlando" ? "Good night, Orlando." : `Good night, ${guest}.`;
    const today = calendarDate((/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "America/New_York" }));
    const checkin = calendarDate(settings.checkIn);
    const checkout = calendarDate(settings.checkOut);
    const previewNight = Number(new URLSearchParams(location.search).get("previewNight"));
    const stayNight = preview && previewNight > 0 ? previewNight : checkin && today ? Math.max(1, Math.floor((today - checkin) / 864e5) + 1) : 1;
    const rotationNight = (stayNight - 1) % 4 + 1;
    const presentations = {
      2: { id: "ypp4iuJUW2I", title: "Happily Ever After", start: 11, seconds: 1370, muted: true, instructions: "Muted presentation \xB7 Open your favorite music app and play \u201CHappily Ever After\u201D when the show begins." },
      3: { id: "gJ7MkFUA4VA", title: "Fantasmic!", start: 0, seconds: 1772, muted: true, instructions: "This presentation will play without sound." },
      4: { id: "Fb7uwyGj4OE", title: "Luminous: The Symphony of Us", start: 0, seconds: 1239, muted: false, instructions: "Enjoy tonight\u2019s EPCOT presentation with sound." }
    };
    const presentation = settings.showFullNightSpectacular ? presentations[rotationNight] : null;
    if (!presentation) duration = Math.max(75, duration);
    const scenes = ["river", "tree", "fireworks", "finale"].map((name) => show.querySelector(`[data-night-scene="${name}"]`));
    const sceneStarts = presentation ? [0, duration * 0.2, duration * 0.4, duration * 0.6] : [0, duration * 0.16, duration * 0.32, duration * 0.48];
    show.querySelectorAll("[data-night-scene]").forEach((scene) => scene.classList.remove("active"));
    scenes[0].classList.add("active");
    show.classList.toggle("spoiler-free", !presentation);
    $("nightFeatureKicker").textContent = presentation ? `Vacation night ${stayNight} \xB7 Tonight\u2019s feature` : "A little nighttime magic, just for you";
    $("nightFeatureTitle").textContent = (presentation == null ? void 0 : presentation.title) || (guest === "Orlando" ? "Good night, Orlando." : `Good night, ${guest}.`);
    $("nightFeatureInstructions").textContent = (presentation == null ? void 0 : presentation.instructions) || "Rest well. Tomorrow holds another adventure.";
    const remaining = checkout && today ? Math.max(0, Math.ceil((checkout - today) / 864e5)) : null;
    $("nightStayLine").textContent = remaining === 0 ? "Until next time" : remaining === 1 ? "One more vacation day awaits" : Number.isFinite(remaining) ? `${remaining} vacation days still ahead` : "What a day";
    show.hidden = false;
    requestAnimationFrame(() => show.classList.add("playing"));
    const music = $("nightShowMusic");
    if (music) {
      music.currentTime = 0;
      music.volume = 0;
      music.play().then(() => {
        for (let step = 1; step <= 10; step += 1) nightShowTimers.push(setTimeout(() => {
          music.volume = Math.min(0.34, step * 0.034);
        }, step * 300));
        for (let step = 1; step <= 10; step += 1) nightShowTimers.push(setTimeout(() => {
          music.volume = Math.max(0, 0.34 - step * 0.034);
        }, (duration - 4 + step * 0.3) * 1e3));
      }).catch(() => {
      });
    }
    scenes.slice(1).forEach((scene, index) => nightShowTimers.push(setTimeout(() => {
      const outgoing = scenes.find((item) => item.classList.contains("active"));
      outgoing == null ? void 0 : outgoing.classList.remove("active");
      scene.classList.add("active");
      const video = scene.querySelector("video");
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {
        });
      }
    }, sceneStarts[index + 1] * 1e3)));
    nightShowTimers.push(setTimeout(() => {
      if (!presentation) return nightShowTimers.push(setTimeout(stopNightShow, 5e3));
      scenes.forEach((scene) => scene.classList.remove("active"));
      const featureStage = show.querySelector('[data-night-scene="feature"]');
      featureStage.classList.add("active");
      const feature = $("nightFeaturePlayer");
      feature.title = `${presentation.title} nighttime spectacular`;
      feature.src = `https://www.youtube-nocookie.com/embed/${presentation.id}?autoplay=1&mute=${presentation.muted ? 1 : 0}&start=${presentation.start}&controls=0&rel=0&modestbranding=1&playsinline=1`;
      nightShowTimers.push(setTimeout(() => {
        feature.src = "about:blank";
        featureStage.classList.remove("active");
        show.querySelector('[data-night-scene="postlude"]').classList.add("active");
        nightShowTimers.push(setTimeout(stopNightShow, 12e3));
      }, (presentation.seconds + 2) * 1e3));
    }, duration * 1e3));
    if (!preview) try {
      localStorage.setItem(`str-night-show-${orlandoClockParts().date}`, "played");
    } catch {
    }
  }
  function scheduleNightShow(settings) {
    const preview = new URLSearchParams(location.search).get("previewShow") === "night";
    if (preview) return playNightShow(settings, true);
    if (!settings.showNightShow || settings.accessDenied) return;
    const now = orlandoClockParts();
    const [hour, minute] = String(settings.nightShowTime || "20:55").split(":").map(Number);
    const start = hour * 60 + minute;
    let alreadyPlayed = false;
    try {
      alreadyPlayed = Boolean(localStorage.getItem(`str-night-show-${now.date}`));
    } catch {
    }
    if (now.minutes >= start && now.minutes < start + 20 && !alreadyPlayed) playNightShow(settings);
  }
  function showEventPage(index) {
    const pages = [...document.querySelectorAll(".event-page")];
    pages.forEach((page, pageIndex) => page.classList.toggle("active", pageIndex === index));
  }
  function resetEventPages(duration) {
    clearTimeout(eventPageTimer);
    showEventPage(0);
    if (document.querySelectorAll(".event-page").length > 1) {
      eventPageTimer = setTimeout(() => showEventPage(1), duration / 2);
    }
  }
  function resetFavoritePages(slide, duration) {
    clearTimeout(favoritePageTimer);
    const pages = [...slide.querySelectorAll(".rotating-page")];
    pages.forEach((page, index) => page.classList.toggle("active", index === 0));
    if (pages.length > 1) favoritePageTimer = setTimeout(() => pages.forEach((page, index) => page.classList.toggle("active", index === 1)), duration * 0.45);
  }
  function updatePageTitle(slide) {
    $("pageTitle").textContent = (slide == null ? void 0 : slide.dataset.pageTitle) || "";
  }
  function startSlides(seconds) {
    const allSlides = [...document.querySelectorAll(".slide")];
    allSlides.forEach((slide) => slide.classList.remove("active"));
    const pageOrder = Array.isArray(currentSettings.pageOrder) ? currentSettings.pageOrder : DEFAULTS.pageOrder;
    const orderIndex = (page) => {
      const index2 = pageOrder.indexOf(page);
      return index2 < 0 ? pageOrder.length : index2;
    };
    let visibleSlides = allSlides.filter((s) => !s.hidden).sort((a, b) => orderIndex(a.dataset.pageKey) - orderIndex(b.dataset.pageKey));
    const previewPage = new URLSearchParams(location.search).get("previewPage");
    if (previewPage) {
      const previewSlide = document.querySelector(`[data-page-key="${CSS.escape(previewPage)}"]`);
      if (previewSlide) {
        allSlides.forEach((slide) => {
          slide.hidden = slide !== previewSlide;
        });
        previewSlide.hidden = false;
        visibleSlides = [previewSlide];
      }
    }
    if (!visibleSlides.length) {
      document.querySelector(".welcome-slide").hidden = false;
      visibleSlides = [document.querySelector(".welcome-slide")];
    }
    let index = 0;
    visibleSlides[0].classList.add("active");
    updatePageTitle(visibleSlides[0]);
    if (visibleSlides[0].dataset.pageKey === "funFact") advanceFunFact();
    const getDuration = (slide) => {
      var _a;
      return Math.max(8, Number((_a = currentSettings.pageDurations) == null ? void 0 : _a[slide.dataset.pageKey]) || Number(seconds) || 18) * 1e3;
    };
    let duration = getDuration(visibleSlides[0]);
    if (visibleSlides[0].classList.contains("parks-slide")) resetEventPages(duration);
    if (visibleSlides[0].querySelector(".rotating-page")) resetFavoritePages(visibleSlides[0], duration);
    clearTimeout(slideTimer);
    if (visibleSlides.length > 1) {
      const advance = () => {
        visibleSlides[index].classList.remove("active");
        index = (index + 1) % visibleSlides.length;
        visibleSlides[index].classList.add("active");
        updatePageTitle(visibleSlides[index]);
        if (visibleSlides[index].dataset.pageKey === "funFact") advanceFunFact();
        duration = getDuration(visibleSlides[index]);
        if (visibleSlides[index].classList.contains("parks-slide")) {
          resetEventPages(duration);
        } else {
          clearTimeout(eventPageTimer);
        }
        if (visibleSlides[index].querySelector(".rotating-page")) resetFavoritePages(visibleSlides[index], duration);
        else clearTimeout(favoritePageTimer);
        slideTimer = setTimeout(advance, duration);
      };
      slideTimer = setTimeout(advance, duration);
    }
  }
  async function refreshAll() {
    window.__dataOffline = !navigator.onLine;
    const [settings, parks, weather] = await Promise.all([loadSettings(), loadParks(), loadWeather()]);
    currentWeather = weather;
    currentParks = parks;
    applySettings(settings);
    renderParks(parks);
    renderForecast(weather, settings);
    startSlides(settings.slideSeconds);
    scheduleMorningShow(settings);
    scheduleNightShow(settings);
    setOffline(Boolean(window.__dataOffline));
    document.documentElement.classList.add("display-ready");
  }
  updateClock();
  setInterval(updateClock, 30 * 1e3);
  refreshAll().catch((error) => {
    console.error("Display refresh failed", error);
    document.documentElement.classList.add("display-fallback");
  });
  setInterval(refreshAll, 5 * 60 * 1e3);
  window.addEventListener("online", refreshAll);
  window.addEventListener("resize", () => renderDiagnostics(currentSettings));
  window.addEventListener("offline", () => setOffline(true));
  setInterval(() => {
    const x = Math.round(Math.random() * 4 - 2);
    const y = Math.round(Math.random() * 4 - 2);
    $("display").style.setProperty("--burn-x", `${x}px`);
    $("display").style.setProperty("--burn-y", `${y}px`);
  }, 4 * 60 * 1e3);
})();
