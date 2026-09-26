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

function fill(select, items, placeholder) {
  select.innerHTML = "";
  select.add(new Option(placeholder, ""));
  for (const [value, text] of items) select.add(new Option(text, value));
}

function text(select) {
  if (!select || select.disabled || !select.value) return "-";
  return select.options[select.selectedIndex].text;
}

// ---- shared nav + footer ----
function renderChrome() {
  const onHome = !pageService;
  const home = onHome ? "" : "index.html";
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
            <a href="#faq">FAQ</a>
            <a class="btn btn-primary btn-sm" href="#enquire">Enquire</a>
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
          <p class="foot-links"><a href="index.html">Home</a>${links}</p>
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
      <span class="svc-more">Details and eligibility <span aria-hidden="true">→</span></span>
    </a>`).join("") + `
    <a class="svc-card svc-card-alt" href="#enquire">
      <div class="f-icon" aria-hidden="true">${ICONS.chat}</div>
      <h3>Something else?</h3>
      <p>Looking for another BMW coding feature? Tell us what you're after and we'll let you know if your car can have it.</p>
      <span class="svc-more">Ask us <span aria-hidden="true">→</span></span>
    </a>`;
}

// ---- eligibility checker (service pages) ----
let checker = null; // { svc, summary() } once built

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
    const years = [];
    for (let y = thisYear; y >= 2016; y--) years.push([String(y), String(y)]);
    fill(by, [...years, [UNSURE, "Not sure"]], "Year…");
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
        ? `<p>Think we've got it wrong? You can still <a href="#enquire">send an enquiry</a> and we'll double-check.</p>`
        : `<p><a class="btn btn-primary" href="#enquire">Send an enquiry</a></p>`);
    result.hidden = false;
    result.dataset.verdict = title;
  }

  checker = {
    svc,
    touched: () => !!make.value,
    carName: () => [make, model].map(text).filter((v) => v !== "-" && !/not sure|other/i.test(v)).join(" "),
    summary() {
      const idx = chassis.value;
      const list = svc.vehicles[make.value]?.[model.value];
      const c = list && idx !== "" && idx !== UNSURE ? list[+idx] : null;
      const out = {
        "Make": text(make),
        "Model": text(model),
        "Chassis": c ? `${c.label}${c.trims ? " (" + c.trims + ")" : ""}` : text(chassis),
      };
      if (bm) out["Build date"] = `${text(bm)} ${text(by)}`;
      if (engine) out["Engine"] = text(engine);
      if (trans) out["Transmission"] = text(trans);
      if (heated) out["Heated seats"] = text(heated);
      out[`Checker result (${svc.name})`] = result.hidden ? "Not checked" : result.dataset.verdict;
      return out;
    },
  };
}

// ---- enquiry form (every page) ----
function buildEnquiry() {
  const root = $("enquiry-form");
  if (!root) return;
  const boxes = Object.entries(SERVICES).map(([slug, s]) => `
    <label class="pick">
      <input type="checkbox" name="svc" value="${esc(s.name)}" ${slug === pageService ? "checked" : ""}>
      <span><b>${esc(s.name)}</b><small>From ${money(s.price)} · ${esc(s.time)}</small></span>
    </label>`).join("");

  root.innerHTML = `
    <form id="form" novalidate>
      <fieldset class="picks">
        <legend>What are you interested in? *</legend>
        <div class="pick-grid">
          ${boxes}
          <label class="pick">
            <input type="checkbox" name="svc" value="Other coding">
            <span><b>Something else</b><small>Tell us in the message</small></span>
          </label>
        </div>
        <p class="pick-err" id="pickErr" hidden>Please choose at least one option.</p>
      </fieldset>
      <div class="grid">
        <label>Full name *<input name="name" required autocomplete="name"></label>
        <label>Email *<input name="email" type="email" required autocomplete="email"></label>
        <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
        <label>Suburb<input name="location" autocomplete="address-level2" placeholder="e.g. Joondalup"></label>
        <label>Your car<input name="car" placeholder="e.g. 2020 BMW 330i"></label>
        <label>Where would you like it done?
          <select name="service">
            <option>Mobile (at my home or work)</option>
            <option>Drop-off</option>
            <option>No preference</option>
          </select>
        </label>
        <label class="span2">VIN (optional, 17 characters)
          <input name="vin" maxlength="17" pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}" placeholder="e.g. WBA5R1C50KA000000" autocomplete="off">
          <small class="hint">With your VIN we can check eligibility exactly. It's on your rego papers and at the base of the windscreen.</small>
        </label>
        <label class="span2">Message
          <textarea name="message" rows="4" placeholder="Anything else we should know? Preferred days or times?"></textarea>
        </label>
      </div>
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-primary" type="submit" id="submitBtn">Send enquiry</button>
      <p id="formStatus" class="status" role="status" aria-live="polite"></p>
    </form>`;

  const form = $("form"), statusEl = $("formStatus"), btn = $("submitBtn"), pickErr = $("pickErr");
  form.addEventListener("change", (e) => { if (e.target.name === "svc") pickErr.hidden = true; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.className = "status";
    const picked = [...form.querySelectorAll('input[name="svc"]:checked')].map((i) => i.value);
    if (!picked.length) {
      pickErr.hidden = false;
      form.querySelector('input[name="svc"]').focus();
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return; // bot

    const car = (checker && checker.touched() && checker.carName()) || data.car.trim();
    const payload = {
      _subject: `Redline Coding enquiry: ${picked.join(" + ")}${car ? " – " + car : ""} (${data.name})`,
      _template: "table",
      _replyto: data.email,
      // Confirmation email FormSubmit sends to the customer (needs the field to be named "email")
      _autoresponse: autoReply(data.name, picked, car),
      "Name": data.name,
      "email": data.email,
      "Phone": data.phone || "-",
      "Suburb": data.location || "-",
      "Services": picked.join(", "),
      "Car": data.car || "-",
      "Mobile or drop-off": data.service || "-",
      "VIN": (data.vin || "-").toUpperCase(),
      ...(checker && checker.touched() ? checker.summary() : {}),
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
      showThanks(form, data, picked, car);
    } catch (err) {
      statusEl.className = "status err";
      statusEl.textContent = `Sorry, your enquiry didn't send (${err.message}). Please try again or email ${ENQUIRY_EMAIL} directly.`;
    } finally {
      btn.disabled = false;
      btn.textContent = "Send enquiry";
    }
  });
}

function listText(items) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function autoReply(name, picked, car) {
  const first = name.trim().split(/\s+/)[0];
  return `Hi ${first},

Thanks for contacting Redline Coding. We've received your enquiry about ${listText(picked)}${car ? ` for your ${car}` : ""} and will get back to you within one business day with pricing and availability.

What happens next:
1. We check your car's eligibility (from your VIN if you gave one).
2. We reply with your exact price and available times, either mobile anywhere in Perth or drop-off.
3. If your car can't be coded, you don't pay. You only pay once it's working.

Need to add something? Just send another enquiry through the website.

Redline Coding
BMW Coding Services, Perth

Redline Coding is an independent business and is not affiliated with BMW AG or Toyota Motor Corporation.`;
}

function showThanks(form, data, picked, car) {
  const first = data.name.trim().split(/\s+/)[0];
  const box = document.createElement("div");
  box.className = "thanks";
  box.setAttribute("role", "status");
  box.tabIndex = -1;
  box.innerHTML = `
    <div class="thanks-tick" aria-hidden="true"></div>
    <h3>Thanks, ${esc(first)}! Your enquiry is in.</h3>
    <p>We've sent a confirmation to <b>${esc(data.email)}</b>. If you can't see it, check your spam folder.</p>
    <ol>
      <li>We check ${car ? "your " + esc(car) : "your car"} for ${esc(listText(picked))}${data.vin ? " using your VIN" : ""}.</li>
      <li>We reply within one business day with your price and available times.</li>
      <li>You only pay once it's working.</li>
    </ol>`;
  form.replaceWith(box);
  box.focus();
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
buildChecker();
buildEnquiry();
fillServiceFacts();
