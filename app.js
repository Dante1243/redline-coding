// Where enquiries are emailed. FormSubmit.co forwards form posts to this address.
const ENQUIRY_EMAIL = "dante.farate@gmail.com";

const UNSURE = "__unsure";
const OTHER = "__other";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const thisYear = new Date().getFullYear();
const pageService = document.body.dataset.service || "";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const money = (n) => `$${n}`;
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

function fill(select, items, placeholder) {
  select.innerHTML = "";
  select.add(new Option(placeholder, ""));
  for (const [value, text] of items) select.add(new Option(text, value));
}

function text(select) {
  if (!select || select.disabled || !select.value) return "-";
  return select.options[select.selectedIndex].text;
}

function yearOptions() {
  const years = [];
  for (let y = thisYear; y >= 2016; y--) years.push([String(y), String(y)]);
  return years;
}

// sessionStorage can be unavailable (private mode, blocked storage), so never rely on it
function store(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function load(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}

// ---- pricing ----

// Coding Menu price: the three priciest picks for MENU_DEALS.three, or every feature for MENU_DEALS.all
function menuQuote(ids) {
  const prices = FEATURES.filter((f) => ids.includes(f.id)).map((f) => f.price).sort((a, b) => b - a);
  const full = sum(prices);
  let total = full, deal = "";
  if (prices.length >= 3 && MENU_DEALS.three + sum(prices.slice(3)) < total) {
    total = MENU_DEALS.three + sum(prices.slice(3));
    deal = `Coding Menu deal: any 3 for ${money(MENU_DEALS.three)}`;
  }
  if (prices.length === FEATURES.length && MENU_DEALS.all < total) {
    total = MENU_DEALS.all;
    deal = `Coding Menu deal: all ${FEATURES.length} for ${money(MENU_DEALS.all)}`;
  }
  return { full, total, saved: full - total, count: prices.length, deal };
}

// Itemised quote for { services: [slug], features: [id], other: bool }
function buildQuote({ services = [], features = [], other = false }) {
  const lines = [], discounts = [];
  for (const slug of services) {
    const s = SERVICES[slug];
    if (!s || s.menu) continue;
    lines.push({ name: s.name, price: s.price });
    if (s.addOn && services.includes(s.addOn.with))
      discounts.push({ name: `${s.name} with ${SERVICES[s.addOn.with].name}`, amount: s.price - s.addOn.price });
  }
  for (const f of FEATURES.filter((f) => features.includes(f.id))) lines.push({ name: f.name, price: f.price });
  const m = menuQuote(features);
  if (m.saved) discounts.push({ name: m.deal, amount: m.saved });
  if (other) lines.push({ name: "Other coding", price: null });

  const full = sum(lines.map((l) => l.price || 0));
  const saved = sum(discounts.map((d) => d.amount));
  return { lines, discounts, full, saved, total: full - saved, count: lines.length, other };
}

// ---- links to the quote page ----
let menuPicked = []; // features ticked on the Coding Menu page

function quoteHref(slug = pageService) {
  const s = SERVICES[slug];
  if (s && s.menu) return menuPicked.length ? `enquire.html?f=${menuPicked.join(",")}` : "enquire.html";
  return s ? `enquire.html?pick=${slug}` : "enquire.html";
}

function updateQuoteLinks() {
  document.querySelectorAll("a[data-quote]").forEach((a) => { a.href = quoteHref(); });
}

// ---- shared nav + footer ----
function renderChrome() {
  const home = pageService || document.body.dataset.page ? "index.html" : "";
  const faq = $("faq") ? "#faq" : "index.html#faq";
  const nav = $("site-nav");
  if (nav) {
    nav.outerHTML = `
      <div class="mstripe" aria-hidden="true"></div>
      <nav class="nav">
        <div class="wrap nav-inner">
          <a class="brand" href="${home || "#top"}" aria-label="Redline Coding home">
            <span class="brand-name">REDLINE<b>CODING</b></span>
            <span class="brand-sub">BMW Coding Services · Perth</span>
          </a>
          <div class="nav-links">
            <a href="${home}#services">Services</a>
            <a href="${home}#how">How it works</a>
            <a href="${faq}">FAQ</a>
            <a class="btn btn-primary btn-sm" href="enquire.html" data-quote>Get a quote</a>
          </div>
        </div>
      </nav>`;
  }
  const foot = $("site-footer");
  if (foot) {
    const links = Object.values(SERVICES).map((s) => `<a href="${s.page}">${esc(s.name)}</a>`).join("");
    foot.outerHTML = `
      <footer class="footer">
        <div class="mstripe" aria-hidden="true"></div>
        <div class="wrap">
          <p class="foot-brand">REDLINE<b>CODING</b> <span>BMW Coding Services · Perth, WA</span></p>
          <p class="foot-links"><a href="index.html">Home</a>${links}<a href="enquire.html">Get a quote</a></p>
          <p class="disclaimer">Redline Coding is an independent business. It is not affiliated with, authorised by, sponsored by or endorsed by BMW AG, BMW M GmbH, Bayerische Motoren Werke AG, Toyota Motor Corporation, or any of their subsidiaries or dealers. BMW, M, iDrive, Supra and all related model names are trademarks of their respective owners and are used on this site only to identify compatible vehicles.</p>
          <p class="copy">© ${thisYear} Redline Coding</p>
        </div>
      </footer>`;
  }
}

// ---- home page service cards ----
function renderServiceCards() {
  const root = $("service-cards");
  if (!root) return;
  root.innerHTML = Object.values(SERVICES).map((s) => `
    <a class="svc-card" href="${s.page}">
      <div class="f-icon" aria-hidden="true">${ICONS[s.icon] || ""}</div>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.short)}</p>
      <p class="svc-meta"><span>From <b>${money(s.price)}</b></span><span>${esc(s.time)}</span></p>
      ${s.addOn ? `<p class="svc-deal">Only ${money(s.addOn.price)} with ${esc(SERVICES[s.addOn.with].name)}</p>` : ""}
      ${s.menu ? `<p class="svc-deal">${dealsText()}</p>` : ""}
      <span class="svc-more">Details and eligibility <span aria-hidden="true">→</span></span>
    </a>`).join("") + `
    <a class="svc-card svc-card-alt" href="enquire.html?other=1">
      <div class="f-icon" aria-hidden="true">${ICONS.chat}</div>
      <div class="svc-alt-text"><h3>Something else?</h3>
      <p>Looking for another BMW coding feature? Tell us what you're after and we'll let you know if your car can have it.</p></div>
      <span class="svc-more">Ask us <span aria-hidden="true">→</span></span>
    </a>`;
}

// Bundle banners: on the home page for every add-on, on a service page for the ones involving it
function renderBundles() {
  const root = $("bundles");
  if (!root) return;
  root.innerHTML = Object.entries(SERVICES)
    .filter(([slug, s]) => s.addOn && (!pageService || pageService === slug || pageService === s.addOn.with))
    .map(([slug, s]) => {
      const q = buildQuote({ services: [s.addOn.with, slug] });
      const base = SERVICES[s.addOn.with];
      return `
        <div class="bundle">
          <div>
            <p class="bundle-tag">Bundle and save ${money(q.saved)}</p>
            <p class="bundle-title">${esc(base.name)} + ${esc(s.name)}</p>
            <p class="bundle-sub">Add ${esc(s.name.toLowerCase())} to a ${esc(base.name.toLowerCase())} booking for just ${money(s.addOn.price)} (normally ${money(s.price)}). Both done in the same visit.</p>
          </div>
          <div class="bundle-price">
            <p><span class="from">From</span> ${money(q.total)}</p>
            <a class="btn btn-primary" href="enquire.html?pick=${s.addOn.with},${slug}">Book the bundle</a>
          </div>
        </div>`;
    }).join("");
}

// ---- compact item rows (Coding Menu page and quote page) ----
const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
let rowCount = 0;

function itemRow({ kind, id, name, price, sub, desc, note, link, checked }) {
  const did = `item-desc-${++rowCount}`;
  return `
    <div class="item">
      <label class="item-main">
        <input type="checkbox" data-kind="${kind}" value="${esc(id)}" ${checked ? "checked" : ""}>
        <span class="item-box" aria-hidden="true"></span>
        <span class="item-name">${esc(name)}${sub ? `<small>${esc(sub)}</small>` : ""}</span>
        <span class="item-price" data-price="${esc(id)}">${price}</span>
      </label>
      ${desc ? `
      <button type="button" class="item-more" aria-expanded="false" aria-controls="${did}" aria-label="More about ${esc(name)}">${CHEVRON}</button>
      <div class="item-desc" id="${did}" hidden>
        <p>${esc(desc)}</p>
        ${note ? `<p class="item-fine">${esc(note)}</p>` : ""}
        ${link ? `<p><a href="${link}">Details and eligibility →</a></p>` : ""}
      </div>` : ""}
    </div>`;
}

function wireRows(root) {
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".item-more");
    if (!btn) return;
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    $(btn.getAttribute("aria-controls")).hidden = !open;
  });
}

function picked(root, kind) {
  return [...root.querySelectorAll(`input[data-kind="${kind}"]:checked`)].map((i) => i.value);
}

function dealsText() {
  return `Any 3 for ${money(MENU_DEALS.three)} · All ${FEATURES.length} for ${money(MENU_DEALS.all)}`;
}

// ---- Coding Menu page ----
function renderMenu() {
  const root = $("menu");
  if (!root) return;
  const groups = [...new Set(FEATURES.map((f) => f.group))];
  root.innerHTML = groups.map((g) => `
    <h3 class="item-group">${esc(g)}</h3>
    <div class="items">
      ${FEATURES.filter((f) => f.group === g)
        .map((f) => itemRow({ kind: "feature", id: f.id, name: f.name, price: money(f.price), desc: f.desc, note: f.note }))
        .join("")}
    </div>`).join("") + `
    <div class="total-bar">
      <p id="menuSummary"></p>
      <a class="btn btn-primary btn-sm" href="enquire.html" data-quote>Get a quote</a>
    </div>`;
  wireRows(root);

  const update = () => {
    menuPicked = picked(root, "feature");
    updateQuoteLinks();
    const el = $("menuSummary");
    if (!menuPicked.length) {
      el.innerHTML = `Tick the features you want. <b>${dealsText()}</b>`;
      return;
    }
    const m = menuQuote(menuPicked);
    const more = m.count < 3 ? ` · Add ${3 - m.count} more and pay ${money(MENU_DEALS.three)} for all 3` : "";
    el.innerHTML = `${m.count} selected · Total <b class="total-num">${money(m.total)}</b>` +
      (m.saved ? ` <span class="save-pill">Save ${money(m.saved)}</span>` : "") + more;
  };
  root.addEventListener("change", update);
  update();
}

// ---- eligibility checker (service pages) ----
function buildChecker() {
  const root = $("checker");
  const svc = SERVICES[pageService];
  if (!root || !svc) return;
  const has = (c) => svc.checks.includes(c);

  root.innerHTML = `
    <div class="grid">
      <label>Make<select id="make"></select></label>
      <label>Model<select id="model" disabled><option value="">Select make first…</option></select></label>
      <label>Body / chassis
        <select id="chassis" disabled><option value="">Select model first…</option></select>
        <small class="hint">Not sure? Pick "I'm not sure". We can find it from your VIN.</small>
      </label>
      ${has("build") ? `
      <label>Build date (month / year)
        <div class="row">
          <select id="buildMonth" aria-label="Build month"></select>
          <select id="buildYear" aria-label="Build year"></select>
        </div>
        <small class="hint">Look for the build date on the sticker inside the driver's door jamb.</small>
      </label>` : ""}
      ${has("engine") ? `
      <label>Engine / fuel
        <select id="engine">
          <option value="">Select…</option>
          <option value="petrol">Petrol</option>
          <option value="mhev">Petrol mild-hybrid (48V)</option>
          <option value="diesel">Diesel</option>
          <option value="phev">Plug-in hybrid (e.g. 330e, 530e, 45e)</option>
          <option value="ev">Fully electric (e.g. i4, iX)</option>
          <option value="unsure">I'm not sure</option>
        </select>
      </label>` : ""}
      ${has("trans") ? `
      <label>Transmission
        <select id="trans">
          <option value="">Select…</option>
          <option value="auto">Automatic</option>
          <option value="manual">Manual</option>
          <option value="unsure">I'm not sure</option>
        </select>
      </label>` : ""}
      ${has("heatedSeats") ? `
      <label>Does it have heated seats now?
        <select id="heated">
          <option value="">Select…</option>
          <option value="yes">Yes, it has seat heating buttons</option>
          <option value="no">No heated seats</option>
          <option value="unsure">I'm not sure</option>
        </select>
        <small class="hint">Look for a button with a seat and wavy lines, usually on the climate control panel.</small>
      </label>` : ""}
    </div>
    <div id="result" class="result" hidden></div>`;

  const make = $("make"), model = $("model"), chassis = $("chassis"), result = $("result");
  const bm = $("buildMonth"), by = $("buildYear"), engine = $("engine"), trans = $("trans"), heated = $("heated");

  fill(make, [...Object.keys(svc.vehicles).map((m) => [m, m]), [OTHER, "Other make"], [UNSURE, "I'm not sure"]], "Select make…");
  if (bm) {
    fill(bm, [...MONTHS.map((m, i) => [String(i + 1), m]), [UNSURE, "Not sure"]], "Month…");
    fill(by, [...yearOptions(), [UNSURE, "Not sure"]], "Year…");
  }

  make.addEventListener("change", () => {
    const models = svc.vehicles[make.value];
    if (models) {
      fill(model, [...Object.keys(models).map((m) => [m, m]), [OTHER, "Other / not listed"], [UNSURE, "I'm not sure"]], "Select model…");
      model.disabled = false;
    } else {
      fill(model, [], make.value ? "N/A" : "Select make first…");
      model.disabled = true;
    }
    model.dispatchEvent(new Event("change"));
  });

  model.addEventListener("change", () => {
    const list = svc.vehicles[make.value]?.[model.value];
    if (list) {
      fill(chassis, [...list.map((c, i) => [String(i), c.label]), [UNSURE, "I'm not sure"]], "Select body / chassis…");
      chassis.disabled = false;
      if (list.length === 1) chassis.value = "0";
    } else {
      fill(chassis, [], model.value ? "N/A" : "Select model first…");
      chassis.disabled = true;
    }
    evaluate();
  });

  [chassis, bm, by, engine, trans, heated].forEach((el) => el && el.addEventListener("change", evaluate));

  // Remember the car and result so the quote page can include them
  function remember() {
    const idx = chassis.value;
    const list = svc.vehicles[make.value]?.[model.value];
    const c = list && idx !== "" && idx !== UNSURE ? list[+idx] : null;
    const fields = {
      "Make": text(make),
      "Model": text(model),
      "Chassis": c ? `${c.label}${c.trims ? " (" + c.trims + ")" : ""}` : text(chassis),
    };
    if (bm) fields["Build date"] = `${text(bm)} ${text(by)}`;
    if (engine) fields["Engine"] = text(engine);
    if (trans) fields["Transmission"] = text(trans);
    if (heated) fields["Heated seats"] = text(heated);
    fields[`Checker result (${svc.name})`] = result.hidden ? "Not checked" : result.dataset.verdict;
    const car = [make, model].map(text).filter((v) => v !== "-" && !/not sure|other/i.test(v)).join(" ");
    const built = bm && by.value && by.value !== UNSURE
      ? `, built ${bm.value && bm.value !== UNSURE ? text(bm) + " " : ""}${by.value}` : "";
    store("rc-checker", {
      service: svc.name,
      car: car ? `${car}${c ? " " + c.code : ""}${built}` : "",
      verdict: result.hidden ? "" : result.dataset.verdict,
      cls: result.hidden ? "" : result.className.replace("result ", ""),
      fields,
    });
  }

  // Each check pushes a reason: "no" beats "check" beats "yes".
  function evaluate() {
    if (!make.value) { result.hidden = true; return; }
    const no = [], check = [], info = [];

    if (make.value === OTHER || make.value === UNSURE) {
      check.push(`We code ${svc.makes} models for this service. If you're not sure what you have, send an enquiry and we'll tell you.`);
    } else if (!model.value) {
      result.hidden = true; return;
    } else if (model.value === OTHER || model.value === UNSURE) {
      check.push("That model isn't on our list, or you're not sure which it is. Send an enquiry (your VIN helps) and we'll check it for you.");
    } else if (!chassis.value) {
      result.hidden = true; return;
    } else {
      const list = svc.vehicles[make.value][model.value];
      const candidates = chassis.value === UNSURE ? list : [list[+chassis.value]];
      const live = candidates.filter((c) => c.status !== "excluded");

      if (live.length === 0) {
        no.push(candidates[0].note || "This model isn't supported.");
      } else {
        if (chassis.value === UNSURE && live.length < candidates.length)
          check.push(`Some ${model.value} versions are supported and some aren't. Your VIN tells us exactly which one you have.`);
        live.filter((c) => c.status === "conditional").forEach((c) => check.push(c.note));
        live.filter((c) => c.status === "eligible" && c.note).forEach((c) => info.push(c.note));

        const cutoff = live.find((c) => c.cutoff)?.cutoff;
        if (cutoff && bm) {
          const y = by.value, m = bm.value;
          if (!y || y === UNSURE) {
            check.push("We need the build date. Anything from February 2021 or earlier qualifies. It's on the sticker in the driver's door jamb.");
          } else if (+y > cutoff.year || (+y === cutoff.year && m && m !== UNSURE && +m >= cutoff.month)) {
            no.push("Your car was built in March 2021 or later. BMW locked the coding on cars from that date, so it can't be added.");
          } else if (+y === cutoff.year && (!m || m === UNSURE)) {
            check.push("Your car was built in 2021. January and February 2021 builds qualify, but March onwards don't. Please check the build month.");
          }
        }

        if (engine && live.some((c) => c.mhevRisk) && engine.value === "petrol")
          info.push("Some M340i, M440i, M550i, 40i and M50i cars have a hidden 48V mild-hybrid system even though the badge doesn't say hybrid. We'll confirm this on your car.");
      }
    }

    if (engine) {
      const badEngine = {
        diesel: "Diesel engines aren't supported. BMW doesn't offer factory remote start on diesels.",
        mhev: "48V mild-hybrid cars aren't supported.",
        phev: "Plug-in hybrids (330e, 530e, X5 45e, etc.) can't use this coding.",
        ev: "Electric cars have no engine to remote-start.",
      };
      if (badEngine[engine.value]) no.push(badEngine[engine.value]);
      else if (engine.value !== "petrol") check.push("We need to confirm your car is pure petrol, not diesel or hybrid.");
    }
    if (trans) {
      if (trans.value === "manual") no.push("Manual cars aren't supported. The feature needs an automatic transmission.");
      else if (trans.value !== "auto") check.push("We need to confirm your car has an automatic transmission.");
    }
    if (heated) {
      if (heated.value === "no") no.push("This feature needs factory heated seats. If your car doesn't have seat heating buttons, it can't be added by coding.");
      else if (heated.value !== "yes") check.push("We need to confirm your car has factory heated seats (a button with a seat and wavy lines).");
    }
    if (svc.checkerNote) info.push(svc.checkerNote);

    let cls, title;
    if (no.length) { cls = "no"; title = "Sorry, this car isn't eligible"; }
    else if (check.length) { cls = "check"; title = "Possibly eligible. We'll need to confirm a few details"; }
    else { cls = "yes"; title = "Good news: your car looks eligible"; }

    const reasons = cls === "no" ? no : cls === "check" ? check : [];
    result.className = "result " + cls;
    result.innerHTML =
      `<h3>${title}</h3>` +
      (reasons.length ? `<ul>${reasons.map((r) => `<li>${r}</li>`).join("")}</ul>` : "") +
      (info.length && cls !== "no" ? `<ul class="info">${info.map((r) => `<li>${r}</li>`).join("")}</ul>` : "") +
      (cls === "no"
        ? `<p>Think we've got it wrong? You can still <a href="${quoteHref()}" data-quote>send an enquiry</a> and we'll double-check.</p>`
        : `<p><a class="btn btn-primary" href="${quoteHref()}" data-quote>Get a quote</a></p>`);
    result.hidden = false;
    result.dataset.verdict = title;
    remember();
  }
}

// ---- quote page ----
function buildQuotePage() {
  const root = $("quote-items");
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const pickS = (params.get("pick") || "").split(",");
  const pickF = (params.get("f") || "").split(",");

  const services = Object.entries(SERVICES).filter(([, s]) => !s.menu);
  root.innerHTML = `
    <h3 class="item-group">Services</h3>
    <div class="items">
      ${services.map(([slug, s]) => itemRow({
        kind: "service", id: slug, name: s.name, price: money(s.price), checked: pickS.includes(slug),
        sub: [s.time, s.addOn ? `${money(s.addOn.price)} with ${SERVICES[s.addOn.with].name}` : ""].filter(Boolean).join(" · "),
        desc: s.short, link: s.page,
      })).join("")}
    </div>
    <h3 class="item-group">Coding Menu <small>${dealsText()}</small></h3>
    <div class="items">
      ${FEATURES.map((f) => itemRow({
        kind: "feature", id: f.id, name: f.name, price: money(f.price), checked: pickF.includes(f.id),
        desc: f.desc, note: f.note,
      })).join("")}
    </div>
    <h3 class="item-group">Something else</h3>
    <div class="items">
      ${itemRow({ kind: "other", id: "other", name: "Other coding", price: "Quote", sub: "Tell us what you're after in the message", checked: params.has("other") })}
    </div>`;
  wireRows(root);

  // Car details, prefilled from the eligibility checker if the customer used one
  fill($("qMonth"), MONTHS.map((m, i) => [String(i + 1), m]), "Month…");
  fill($("qYear"), yearOptions(), "Year…");
  const chk = load("rc-checker");
  const form = $("quote");
  if (chk && chk.car) {
    form.car.value = chk.car;
    const note = $("checkerNote");
    note.hidden = false;
    note.className = `result ${chk.cls || "check"}`;
    note.innerHTML = `<p><b>From the ${esc(chk.service)} checker:</b> ${esc(chk.car)}${chk.verdict ? `<br>${esc(chk.verdict)}` : ""}</p>`;
  }

  const selection = () => ({
    services: picked(root, "service"),
    features: picked(root, "feature"),
    other: picked(root, "other").length > 0,
  });

  const update = () => {
    const sel = selection();
    const q = buildQuote(sel);
    // show add-on prices as discounted when their partner service is ticked
    for (const [slug, s] of services) {
      if (!s.addOn) continue;
      root.querySelector(`[data-price="${slug}"]`).innerHTML = sel.services.includes(s.addOn.with)
        ? `<s>${money(s.price)}</s> ${money(s.addOn.price)}`
        : money(s.price);
    }
    $("quote-summary").innerHTML = summaryHtml(q);
    $("quoteBar").hidden = !q.count;
    $("quoteBarText").innerHTML = `${q.count} item${q.count === 1 ? "" : "s"} · Total <b class="total-num">${money(q.total)}</b>${q.other ? "+" : ""}` +
      (q.saved ? ` <span class="save-pill">Save ${money(q.saved)}</span>` : "");
    $("pickErr").hidden = true;
  };
  root.addEventListener("change", update);
  update();

  form.addEventListener("submit", (e) => submitQuote(e, form, selection));
}

function summaryHtml(q) {
  if (!q.count) return `<p class="muted">Nothing selected yet. Tick at least one item above.</p>`;
  return `
    <table class="sum">
      <tbody>
        ${q.lines.map((l) => `<tr><td>${esc(l.name)}</td><td>${l.price == null ? "Quote" : money(l.price)}</td></tr>`).join("")}
        ${q.discounts.map((d) => `<tr class="sum-disc"><td>${esc(d.name)}</td><td>−${money(d.amount)}</td></tr>`).join("")}
      </tbody>
      <tfoot>
        <tr class="sum-total"><td>Total${q.other ? " <small>+ other coding to quote</small>" : ""}</td><td>${money(q.total)} <small>AUD</small></td></tr>
      </tfoot>
    </table>
    <p class="hint">Estimated price. We confirm your final price from your VIN before booking. No fix, no fee: you only pay once it's working.</p>`;
}

function quoteText(q) {
  const lines = q.lines.map((l) => `- ${l.name}: ${l.price == null ? "to quote" : money(l.price)}`);
  const disc = q.discounts.map((d) => `- ${d.name}: -${money(d.amount)}`);
  return [...lines, ...disc, `Estimated total: ${money(q.total)} AUD${q.other ? " + other coding to quote" : ""}`].join("\n");
}

async function submitQuote(e, form, selection) {
  e.preventDefault();
  const statusEl = $("formStatus"), btn = $("submitBtn");
  statusEl.className = "status";
  const sel = selection();
  const q = buildQuote(sel);
  if (!q.count) {
    $("pickErr").hidden = false;
    $("quote-items").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  if (data._honey) return; // bot

  const chk = load("rc-checker");
  const car = data.car.trim();
  const shortList = [
    ...sel.services.map((s) => SERVICES[s].name),
    ...(sel.features.length ? [`${sel.features.length} menu feature${sel.features.length > 1 ? "s" : ""}`] : []),
    ...(sel.other ? ["other coding"] : []),
  ].join(" + ");

  const payload = {
    _subject: `Redline Coding quote ${money(q.total)}${q.other ? "+" : ""}: ${shortList}${car ? " – " + car : ""} (${data.name})`,
    _template: "table",
    _replyto: data.email,
    // Confirmation email FormSubmit sends to the customer (needs the field to be named "email")
    _autoresponse: autoReply(data.name, q, car),
    "Name": data.name,
    "email": data.email,
    "Phone": data.phone || "-",
    "Suburb": data.location || "-",
    "Mobile or drop-off": data.service || "-",
    "Items": q.lines.map((l) => `${l.name} (${l.price == null ? "quote" : money(l.price)})`).join(", "),
    "Discounts": q.discounts.map((d) => `${d.name} (-${money(d.amount)})`).join(", ") || "-",
    "Estimated total": `${money(q.total)} AUD${q.other ? " + other coding to quote" : ""}`,
    "Car": car || "-",
    "Build date": [text($("qMonth")), text($("qYear"))].filter((v) => v !== "-").join(" ") || "-",
    "VIN": (data.vin || "-").toUpperCase(),
    ...(chk && chk.fields ? chk.fields : {}),
    "Message": data.message || "-",
  };

  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${ENQUIRY_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === "false" || json.success === false) throw new Error(json.message || res.statusText);
    showThanks(form, data, q, car);
  } catch (err) {
    statusEl.className = "status err";
    statusEl.textContent = `Sorry, your quote request didn't send (${err.message}). Please try again or email ${ENQUIRY_EMAIL} directly.`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Send quote request";
  }
}

function autoReply(name, q, car) {
  const first = name.trim().split(/\s+/)[0];
  return `Hi ${first},

Thanks for requesting a quote from Redline Coding${car ? ` for your ${car}` : ""}. Here's what you asked for:

${quoteText(q)}

We'll check your car's eligibility (from your VIN if you gave one) and get back to you within one business day with your final price and available times, either mobile anywhere in Perth or drop-off.

If something can't be coded on your car, you don't pay for it. You only pay once it's working.

Need to add something? Just send another quote request through the website.

Redline Coding
BMW Coding Services, Perth

Redline Coding is an independent business and is not affiliated with BMW AG or Toyota Motor Corporation.`;
}

function showThanks(form, data, q, car) {
  const first = data.name.trim().split(/\s+/)[0];
  const box = document.createElement("div");
  box.className = "card thanks-card";
  box.setAttribute("role", "status");
  box.tabIndex = -1;
  box.innerHTML = `
    <div class="thanks">
      <div class="thanks-tick" aria-hidden="true"></div>
      <h3>Thanks, ${esc(first)}! Your quote request is in.</h3>
      <p>We've emailed a copy to <b>${esc(data.email)}</b>. If you can't see it, check your spam folder.</p>
      <ol>
        <li>We check ${car ? "your " + esc(car) : "your car"}${data.vin ? " using your VIN" : ""}.</li>
        <li>We reply within one business day with your final price and available times.</li>
        <li>You only pay once it's working.</li>
      </ol>
    </div>
    <h3 class="sum-head">Your quote</h3>
    ${summaryHtml(q)}`;
  form.replaceWith(box);
  const bar = $("quoteBar");
  if (bar) bar.hidden = true;
  box.focus();
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- service page: fill hero facts and price from SERVICES ----
function fillServiceFacts() {
  const svc = SERVICES[pageService];
  if (!svc) return;
  document.querySelectorAll("[data-fill]").forEach((el) => {
    const key = el.dataset.fill;
    if (key === "price") el.textContent = money(svc.price);
    if (key === "time") el.textContent = svc.time;
  });
}

renderChrome();
renderServiceCards();
renderBundles();
renderMenu();
buildChecker();
buildQuotePage();
fillServiceFacts();
updateQuoteLinks();
