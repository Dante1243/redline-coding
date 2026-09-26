// Every coding service offered on the site.
// To add a service: add an entry here (plus its vehicle list in vehicles.js),
// then copy heated-seats.html to <slug>.html and change the text.
// The home page cards, enquiry form checkboxes and footer links all come from this list.
//
// addOn: optional discounted price when booked with another service, e.g. { with: "remote-start", price: 39 }
//
// checks: which questions the eligibility checker asks
//   "build"       build month/year against each chassis cutoff
//   "engine"      petrol only (no diesel, hybrid or EV)
//   "trans"       automatic only
//   "heatedSeats" car must already have factory heated seats

const SERVICES = {
  "remote-start": {
    name: "Remote Engine Start",
    short: "Press lock three times on the key fob and the engine starts, so the cabin is warm or cool before you get in.",
    page: "remote-start.html",
    price: 199,
    time: "~1 hr",
    icon: "fob",
    checks: ["build", "engine", "trans"],
    vehicles: REMOTE_START_VEHICLES,
    makes: "BMW and Toyota Supra",
  },
  "heated-seats": {
    name: "Automatic Heated Seats",
    short: "Your heated seats switch on by themselves when it's cold, at the temperature and heat level you choose.",
    page: "heated-seats.html",
    price: 79,
    addOn: { with: "remote-start", price: 39 }, // discounted price when booked together
    time: "~15 min",
    icon: "seat",
    checks: ["build", "heatedSeats"],
    vehicles: HEATED_SEATS_VEHICLES,
    makes: "BMW",
  },
  "coding-menu": {
    name: "Coding Menu",
    short: "Extra drive modes, M cluster styles, start-up badges, brake force display and more. Pick what you want from $15 each.",
    page: "coding-menu.html",
    price: 15,
    time: "~5 min each",
    icon: "dial",
    checks: ["build"],
    vehicles: MENU_VEHICLES,
    makes: "BMW",
    checkerNote: "Some features need specific equipment, like the full digital cluster or driver-assistance cameras. We'll confirm which ones your car can have from its VIN.",
    menu: true, // its FEATURES are listed and priced individually on the quote page
  },
};

// Coding Menu features. Prices are per feature; MENU_DEALS below discounts multiple picks.
const FEATURES = [
  { id: "drive-modes", group: "Driving", name: "Sport Plus & Comfort Plus modes", price: 15, icon: "dial",
    desc: "Adds Sport Plus and Comfort Plus to your drive mode button, for a sharper or softer drive than the standard modes." },
  { id: "adv", group: "Driving", name: "Assisted Driving View", price: 25, icon: "lanes",
    desc: "Shows your car, the lanes and the cars around you live on the instrument cluster while the driver assistance is on.",
    note: "Needs the car's driver-assistance cameras and the full digital cluster." },
  { id: "sla", group: "Driving", name: "Speed Limit Assist auto-adjust", price: 25, icon: "gauge",
    desc: "Cruise control automatically adjusts your set speed to the speed limits the car detects.",
    note: "Needs Active Cruise Control and speed-limit sign recognition. You're still responsible for your speed, because sign reading isn't always right." },
  { id: "brake-force", group: "Safety", name: "Brake force display", price: 15, icon: "brake",
    desc: "Under hard braking, your brake lights flash to warn the driver behind that you're stopping fast." },
  { id: "cluster", group: "Style", name: "Cluster style", price: 19, icon: "screen",
    desc: "Change the instrument cluster's look: the M-car layout, the Alpina style, or a 330 km/h speedo like the M340i.",
    note: "Needs the full digital cluster (Live Cockpit Professional)." },
  { id: "badge", group: "Style", name: "M or high-trim start-up badge", price: 15, icon: "badge",
    desc: "Show an M, M4 CS, X3 M, X7 M or other badge on the cluster when you start the car.",
    note: "Purely cosmetic, and we can remove it any time, e.g. before you sell the car." },
];

// Multi-feature deals: the best price is used automatically.
const MENU_DEALS = { three: 39, all: 79 };

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
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
};
