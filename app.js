// Where enquiries are emailed. FormSubmit.co forwards form posts to this address.
// The first submission sends a one-time activation email to this inbox; click it to start receiving enquiries.
// After activation, FormSubmit gives you a random alias. You can put that here instead of your real address.
const ENQUIRY_EMAIL = "dante.farate@gmail.com";

const UNSURE = "__unsure";
const OTHER = "__other";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const $ = (id) => document.getElementById(id);
const make = $("make"), model = $("model"), chassis = $("chassis");
const buildMonth = $("buildMonth"), buildYear = $("buildYear");
const engine = $("engine"), trans = $("trans"), result = $("result");

function fill(select, items, placeholder) {
  select.innerHTML = "";
  select.add(new Option(placeholder, ""));
  for (const [value, text] of items) select.add(new Option(text, value));
}

// ---- initial options ----
fill(make, [...Object.keys(VEHICLES).map((m) => [m, m]), [OTHER, "Other make"], [UNSURE, "I'm not sure"]], "Select make…");
fill(buildMonth, [...MONTHS.map((m, i) => [String(i + 1), m]), [UNSURE, "Not sure"]], "Month…");
const thisYear = new Date().getFullYear();
const years = [];
for (let y = thisYear; y >= 2016; y--) years.push([String(y), String(y)]);
fill(buildYear, [...years, [UNSURE, "Not sure"]], "Year…");

make.addEventListener("change", () => {
  const models = VEHICLES[make.value];
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
  const list = VEHICLES[make.value]?.[model.value];
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

[chassis, buildMonth, buildYear, engine, trans].forEach((el) => el.addEventListener("change", evaluate));

// ---- eligibility ----
// Each check pushes a reason with a level: "no" beats "check" beats "yes".
function evaluate() {
  if (!make.value) { result.hidden = true; return; }

  const no = [], check = [], info = [];
  let candidates = [];

  if (make.value === OTHER || make.value === UNSURE) {
    check.push("We only code BMW and Toyota Supra models. If you're not sure what you have, send an enquiry and we'll tell you.");
  } else if (!model.value) {
    result.hidden = true; return;
  } else if (model.value === OTHER || model.value === UNSURE) {
    check.push("That model isn't on our list, or you're not sure which it is. Send an enquiry (your VIN helps) and we'll check it for you.");
  } else if (!chassis.value) {
    result.hidden = true; return;
  } else {
    const list = VEHICLES[make.value][model.value];
    candidates = chassis.value === UNSURE ? list : [list[+chassis.value]];
    const live = candidates.filter((c) => c.status !== "excluded");

    if (live.length === 0) {
      no.push(candidates[0].note || "This model isn't supported.");
    } else {
      if (chassis.value === UNSURE && live.length < candidates.length)
        check.push(`Some ${model.value} versions are supported and some aren't. Your VIN tells us exactly which one you have.`);
      live.filter((c) => c.status === "conditional").forEach((c) => check.push(c.note));
      live.filter((c) => c.status === "eligible" && c.note).forEach((c) => info.push(c.note));

      // Build date: only matters for chassis with a cutoff
      const cutoff = live.find((c) => c.cutoff)?.cutoff;
      if (cutoff) {
        const y = buildYear.value, m = buildMonth.value;
        if (!y || y === UNSURE) {
          check.push("We need the build date. Anything from February 2021 or earlier qualifies. It's on the sticker in the driver's door jamb.");
        } else if (+y > cutoff.year || (+y === cutoff.year && m && m !== UNSURE && +m >= cutoff.month)) {
          no.push("Your car was built in March 2021 or later. BMW locked the coding on cars from that date, so it can't be added.");
        } else if (+y === cutoff.year && (!m || m === UNSURE)) {
          check.push("Your car was built in 2021. January and February 2021 builds qualify, but March onwards don't. Please check the build month.");
        }
      }

      if (live.some((c) => c.mhevRisk) && engine.value === "petrol")
        info.push("Some M340i, M440i, M550i, 40i and M50i cars have a hidden 48V mild-hybrid system even though the badge doesn't say hybrid. We'll confirm this on your car.");
    }
  }

  // Engine and transmission apply to every make
  const badEngine = {
    diesel: "Diesel engines aren't supported. BMW doesn't offer factory remote start on diesels.",
    mhev: "48V mild-hybrid cars aren't supported.",
    phev: "Plug-in hybrids (330e, 530e, X5 45e, etc.) can't use this coding. Ask us about Auxiliary Climate Preconditioning instead.",
    ev: "Electric cars have no engine to remote-start.",
  };
  if (badEngine[engine.value]) no.push(badEngine[engine.value]);
  else if (engine.value === "unsure" || !engine.value) check.push("We need to confirm your car is pure petrol, not diesel or hybrid.");

  if (trans.value === "manual") no.push("Manual cars aren't supported. The feature needs an automatic transmission.");
  else if (trans.value === "unsure" || !trans.value) check.push("We need to confirm your car has an automatic transmission.");

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

function text(select) {
  if (select.disabled || !select.value) return "-";
  return select.options[select.selectedIndex].text;
}

function selection() {
  const idx = chassis.value;
  const list = VEHICLES[make.value]?.[model.value];
  const c = list && idx !== "" && idx !== UNSURE ? list[+idx] : null;
  return {
    "Make": text(make),
    "Model": text(model),
    "Chassis": c ? `${c.label}${c.trims ? " (" + c.trims + ")" : ""}` : text(chassis),
    "Build date": `${text(buildMonth)} ${text(buildYear)}`,
    "Engine": text(engine),
    "Transmission": text(trans),
    "Website verdict": result.hidden ? "Not checked" : result.dataset.verdict,
  };
}

// ---- enquiry form ----
const form = $("form"), statusEl = $("formStatus"), btn = $("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.className = "status";
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  if (data._honey) return; // bot

  const car = selection();
  const payload = {
    _subject: `Remote start enquiry: ${car.Make} ${car.Model} (${data.name})`,
    _template: "table",
    _replyto: data.email,
    "Name": data.name,
    "Email": data.email,
    "Phone": data.phone || "-",
    "Location": data.location || "-",
    "VIN": (data.vin || "-").toUpperCase(),
    ...car,
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
    form.reset();
    statusEl.className = "status ok";
    statusEl.textContent = "Thanks, your enquiry has been sent. We'll be in touch shortly.";
  } catch (err) {
    statusEl.className = "status err";
    statusEl.textContent = `Sorry, your enquiry didn't send (${err.message}). Please try again or email ${ENQUIRY_EMAIL} directly.`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Send enquiry";
  }
});

$("yr").textContent = thisYear;
