// Every coding service offered on the site.
// To add a service: add an entry here (plus its vehicle list in vehicles.js),
// then copy heated-seats.html to <slug>.html and change the text.
// The home page cards, enquiry form checkboxes and footer links all come from this list.
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
    time: "~15 min",
    icon: "seat",
    checks: ["build", "heatedSeats"],
    vehicles: HEATED_SEATS_VEHICLES,
    makes: "BMW",
  },
};

const ICONS = {
  fob: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="3"/><circle cx="12" cy="8" r="1.6"/><path d="M10 13.5h4M10 16.5h4"/></svg>',
  seat: '<svg viewBox="0 0 24 24"><path d="M6.5 4.5A2 2 0 0 1 8.5 2.5h2a2 2 0 0 1 2 2.2l-.9 8.3H7.3z"/><path d="M5 13h9.5a2 2 0 0 1 2 2v1.5H5z"/><path d="M7.5 16.5v4M14 16.5v4"/><path d="M18.5 3.5c-1 1 1 2 0 3s1 2 0 3M21 3.5c-1 1 1 2 0 3s1 2 0 3"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
  screen: '<svg viewBox="0 0 24 24"><path d="M4 6h16v10H4z"/><path d="M9 20h6M12 16v4"/><path d="m9 10 2 2 4-4"/></svg>',
  dial: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 12l3.5-3.5"/><path d="M12 5v1.5M5 12h1.5M17.5 12H19"/></svg>',
  thermo: '<svg viewBox="0 0 24 24"><path d="M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
};
