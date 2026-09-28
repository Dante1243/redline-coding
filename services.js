// Every coding service offered on the site. Big jobs get their own page; quick features
// go on the Coding Menu (FEATURES below) instead.
// To add a service: add an entry here (plus its vehicle list in vehicles.js),
// then copy remote-start.html to <slug>.html and change the text.
// The home page cards, quote page rows and footer links all come from this list.
//
// addOn: optional discounted price when booked with another service, e.g. { with: "remote-start", price: 39 }
//
// checks: which questions the eligibility checker asks
//   "build"   build month/year against each chassis cutoff
//   "engine"  petrol only (no diesel, hybrid or EV)
//   "trans"   automatic only
//   any REQUIREMENTS key (cluster, dap, heated): asks about that equipment

const SERVICES = {
  "remote-start": {
    name: "Remote Engine Start",
    short: "Press lock three times on the key fob and the engine starts, so the cabin is warm or cool before you get in.",
    page: "remote-start.html",
    price: 199,
    time: "~1 hr",
    icon: "fob",
    img: "rs-cluster",
    checks: ["build", "engine", "trans"],
    vehicles: REMOTE_START_VEHICLES,
    makes: "BMW and Toyota Supra",
  },
  "coding-menu": {
    name: "Coding Menu",
    short: "Automatic heated seats, start/stop memory or always off, extra drive modes, M cluster styles and more. Pick what you want from $5 and we do it all in one visit.",
    page: "coding-menu.html",
    price: 5,
    time: "~5 min each",
    icon: "dial",
    img: "card-coding-menu-hd",
    checks: ["build", "cluster", "dap", "heated"],
    vehicles: MENU_VEHICLES,
    makes: "BMW",
    menu: true, // its FEATURES are listed and priced individually on the quote page
  },
};

// Equipment some features need. The Coding Menu checker asks about each one,
// then shows which features the customer's car can have.
const REQUIREMENTS = {
  cluster: {
    label: "full digital cluster",
    question: "Is the cluster behind the wheel fully digital?",
    hint: "One big screen with no physical needles (Live Cockpit Professional). Base models have physical-look dials with a small screen in the middle.",
    yes: "Yes, it's one full screen",
    no: "No, it has physical-look dials",
  },
  dap: {
    label: "Driving Assistant Professional",
    question: "Does it have Driving Assistant Professional?",
    hint: "Adaptive cruise control plus steering assist that keeps you centred in your lane (option 5AU).",
    yes: "Yes",
    no: "No",
  },
  heated: {
    label: "factory heated seats",
    question: "Does it have heated seats now?",
    hint: "Look for a button with a seat and wavy lines, usually on the climate control panel.",
    yes: "Yes, it has seat heating buttons",
    no: "No heated seats",
  },
};

// Coding Menu features. Prices are per feature; MENU_DEALS below discounts multiple picks.
// needs: REQUIREMENTS keys the car must have. note: caveats shown when the row is expanded.
// img: photos in media/ (name.jpg full size, name-sm.jpg thumbnail); features without one show their icon.
// closeUp: the photo is a close-up of a small button or badge, so it shows smaller when the row is opened.
// addOn: cheaper when booked with a service. noDeal: not part of the 3-for / all-of-them deals.
// Every feature also needs iDrive 7 and a build date before March 2021 (checked per model).
const FEATURES = [
  { id: "heated-seats", group: "Comfort", name: "Automatic heated seats", price: 79, icon: "seat", needs: ["heated"],
    addOn: { with: "remote-start", price: 39 }, noDeal: true, img: ["hs-hero", "hs-menu"],
    desc: "Your heated seats switch on by themselves when it's colder than the temperature you choose, even part-way through a drive, at the heat level you choose. Change both any time in iDrive, separately for driver and passenger.",
    note: "For 1–4 Series and X1–X4. Higher models like the 5 Series usually have it from the factory. It switches on once the driver's seatbelt is fastened." },
  { id: "start-stop", group: "Comfort", name: "Auto start/stop: memory or always off", price: 15, icon: "power", needs: [], img: ["feat-start-stop"], closeUp: true,
    desc: "Your choice: the car remembers when you switch auto start/stop off, or auto start/stop starts switched off every drive. Either way, no more pressing the button each time you get in.",
    note: "May not work on cars that have had BMW's late-2023 software update (11/2023) or newer. We check your car's software version first. Tell us in your quote which option you want." },
  { id: "comfort-blink", group: "Comfort", name: "Comfort blink (3 → 5 flashes)", price: 10, icon: "blink", needs: [], img: ["feat-comfort-blink", "feat-comfort-blink-set"],
    desc: "Adds a 5-flash option to your iDrive lighting settings, so one tap of the indicator stalk can flash 5 times instead of 3. Handy for freeway lane changes, and you can switch back to 3 any time." },
  { id: "disclaimers", group: "Comfort", name: "Skip iDrive warning pop-ups", price: 10, icon: "screen", needs: [],
    desc: "Removes the warning pop-ups you have to click through: the legal disclaimer on iDrive at start-up, the warning on the reversing camera screen, and the Night Vision warning if your car has it.",
    note: "A dealer software update can bring the warnings back. We can remove them again." },
  { id: "drive-modes", group: "Driving", name: "Sport Plus & Comfort Plus modes", price: 15, icon: "dial", needs: [], img: ["feat-sport-plus", "feat-comfort-plus"],
    desc: "Adds Sport Plus and Comfort Plus to your drive mode button, for a sharper or softer drive than the standard modes.",
    note: "Changes throttle, steering and gearbox response. The ride only gets firmer or softer if your car has adaptive suspension." },
  { id: "default-mode", group: "Driving", name: "Default driving mode", price: 15, icon: "dial", needs: [], img: ["feat-default-mode"],
    desc: "Choose the driving mode your car starts in every time, such as Sport, Sport Individual, Comfort Plus or Eco Pro, so you don't have to press the mode button on every drive.",
    note: "Tell us which mode you want when you book." },
  { id: "adv", group: "Driving", name: "Assisted Driving View", price: 39, noDeal: true, icon: "lanes", needs: ["dap", "cluster"], img: ["feat-adv"],
    desc: "Shows your car, the lanes and the cars around you live on the instrument cluster while the driver assistance is on." },
  { id: "sla", group: "Driving", name: "Speed Limit Assist auto-adjust", price: 39, noDeal: true, icon: "gauge", needs: ["dap"], img: ["feat-sla"],
    desc: "Cruise control automatically adjusts your set speed to the speed limits the car detects.",
    note: "You're still responsible for your speed, because sign reading isn't always right." },
  { id: "brake-force", group: "Safety", name: "Brake force display", price: 15, icon: "brake", needs: [],
    desc: "Under hard braking, your brake lights flash to warn the driver behind that you're stopping fast.",
    note: "Works with the factory Australian-spec tail lights." },
  { id: "esa", group: "Safety", name: "Emergency Stop Assistant", price: 39, noDeal: true, icon: "alert", needs: ["dap"], img: ["feat-esa"],
    desc: "If the driver becomes unwell, pulling and holding the parking brake switch while driving hands control to the car. It slows down in the breakdown lane if possible (otherwise in its own lane), stops, switches on the hazard lights and starts an emergency call.",
    note: "BMW doesn't offer this in Australia. It's an emergency aid, and the driver remains responsible for the car at all times. We recommend telling your insurer." },
  { id: "cluster", group: "Style", name: "Cluster style", price: 19, icon: "screen", needs: ["cluster"], img: ["feat-cluster"],
    desc: "Change the instrument cluster's look: the M340i layout with a 330 km/h speedo, the M3 / M4 layout with shift lights, the M-car or M Sport layouts, or the Alpina style." },
  { id: "badge", group: "Style", name: "M or high-trim start-up badge", price: 15, icon: "badge", needs: ["cluster"], img: ["feat-badge"], closeUp: true,
    desc: "Choose from over 80 badges, from M, M Sport and Alpina to M3 CS, M4 CSL, M5 Competition, X5 M Competition and V12, to show when you start the car.",
    note: "Purely cosmetic, and we can remove it any time, e.g. before you sell the car." },
  { id: "idrive-startup", group: "Style", name: "iDrive start-up animation", price: 15, icon: "badge", needs: [], img: ["feat-idrive-startup"],
    desc: "Change the animation on the iDrive screen when you start the car: BMW M, Alpina, BMW i, or even Rolls-Royce.",
    note: "Which animations are available depends on your car's iDrive software version." },
  // Quick extras: $5 each, always full price (outside the deals). extra: shown as one line on the home page card.
  { id: "speedo-refresh", group: "Quick extras", name: "Faster digital speedo", price: 5, noDeal: true, extra: true, icon: "gauge", needs: [],
    desc: "The digital speed readout updates 5 or 10 times a second instead of twice, so it keeps up with the car." },
  { id: "xview", group: "Quick extras", name: "X View display", price: 5, noDeal: true, extra: true, icon: "screen", needs: [], img: ["feat-xview", "feat-xview-menu"],
    desc: "Unlocks the X View display normally only on BMW X models, showing your car's tilt and incline angles.",
    note: "For models that don't have it from the factory." },
  { id: "lock-horn", group: "Quick extras", name: "No horn when locking with the engine running", price: 5, noDeal: true, extra: true, icon: "lock", needs: [], img: ["feat-lock-horn"], closeUp: true,
    desc: "Stops the horn sounding when you lock the car with the engine running, for example while it warms up." },
  { id: "window-interrupt", group: "Quick extras", name: "Windows keep moving when a door opens", price: 5, noDeal: true, extra: true, icon: "window", needs: [], img: ["feat-window-interrupt"], closeUp: true,
    desc: "Automatic window up or down no longer stops halfway when you open a door." },
  { id: "parking-longer", group: "Quick extras", name: "Parking sensors & cameras stay on longer", price: 5, noDeal: true, extra: true, icon: "camera", needs: [], img: ["feat-parking-longer"], closeUp: true,
    desc: "Parking sensors, Top View and the reversing camera stay on for longer and up to 50 km/h, so they don't switch off as soon as you pull away.",
    note: "Made for cars with Parking Assistant Professional (360° cameras). It may work on others, and we'll check yours." },
  { id: "seat-memory", group: "Quick extras", name: "Seat heating memory", price: 5, noDeal: true, extra: true, icon: "seat", needs: [], img: ["feat-seat-memory"], closeUp: true,
    desc: "Choose how long your seat heating (and cooling, if fitted) setting is remembered: 15 minutes, 24 hours, unlimited, or not at all.",
    note: "Usually the driver's seat." },
];

// "Needs full digital cluster + Driving Assistant Professional"
function needsText(f) {
  return f.needs && f.needs.length ? `Needs ${f.needs.map((k) => REQUIREMENTS[k].label).join(" + ")}` : "";
}

// Multi-feature deals on the quick features (noDeal ones are always full price). The best price is used automatically.
const MENU_DEALS = {
  packs: [{ count: 3, price: 39 }, { count: 5, price: 65 }], // any N quick features for this price
  all: 99, // every quick feature
};

const ICONS = {
  fob: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="3"/><circle cx="12" cy="8" r="1.6"/><path d="M10 13.5h4M10 16.5h4"/></svg>',
  seat: '<svg viewBox="0 0 24 24"><path d="M6.5 4.5A2 2 0 0 1 8.5 2.5h2a2 2 0 0 1 2 2.2l-.9 8.3H7.3z"/><path d="M5 13h9.5a2 2 0 0 1 2 2v1.5H5z"/><path d="M7.5 16.5v4M14 16.5v4"/><path d="M18.5 3.5c-1 1 1 2 0 3s1 2 0 3M21 3.5c-1 1 1 2 0 3s1 2 0 3"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
  screen: '<svg viewBox="0 0 24 24"><path d="M4 6h16v10H4z"/><path d="M9 20h6M12 16v4"/><path d="m9 10 2 2 4-4"/></svg>',
  dial: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 12l3.5-3.5"/><path d="M12 5v1.5M5 12h1.5M17.5 12H19"/></svg>',
  thermo: '<svg viewBox="0 0 24 24"><path d="M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/></svg>',
  gauge: '<svg viewBox="0 0 24 24"><path d="M4.5 17.5a8 8 0 1 1 15 0"/><path d="M12 13.5l4-4"/><path d="M12 6.5v1.5M6.5 12H8M16 12h1.5"/></svg>',
  lanes: '<svg viewBox="0 0 24 24"><path d="M8 3 5 21M16 3l3 18M12 4v3M12 10.5v3M12 17v3"/></svg>',
  brake: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><path d="M12 9v3.5M12 15h.01"/><path d="M4.5 7.5a9 9 0 0 0 0 9M19.5 7.5a9 9 0 0 1 0 9"/></svg>',
  badge: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 10v4.5M12 10v4.5M15 10v4.5"/></svg>',
  power: '<svg viewBox="0 0 24 24"><path d="M12 3v8"/><path d="M7 6.5a7 7 0 1 0 10 0"/></svg>',
  blink: '<svg viewBox="0 0 24 24"><path d="M4 12h11"/><path d="m11 7 5 5-5 5"/><path d="M19 7v10"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/></svg>',
  window: '<svg viewBox="0 0 24 24"><path d="M5 20V9l7-5h7v16z"/><path d="M5 12h14M12 4v8"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="13" height="11" rx="2"/><path d="m16 11 5-3v9l-5-3"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
};
