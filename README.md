# Redline Coding: BMW Coding Services Perth

Static site for Redline Coding. It's hosted on GitHub Pages.

## Pages
- `index.html`: home page with the service cards, how it works and the general FAQ
- `remote-start.html`, `heated-seats.html`, `coding-menu.html`: one page per service, each with an eligibility checker and FAQ
- `enquire.html`: the "Get a quote" page. Customers tick services and Coding Menu features, see an itemised total and send it. Links can preselect items: `?pick=remote-start,heated-seats`, `?f=adv,sla` (menu features), `?other=1`.

## Shared files
- `services.js`: the list of services (name, price, time, which checker questions). The home cards, enquiry checkboxes and footer links are built from it.
- `vehicles.js`: eligible vehicles for each service
- `app.js`: nav, footer, eligibility checker, pricing and the quote page. Quotes are emailed through [FormSubmit](https://formsubmit.co), and customers get an automatic confirmation with the same itemised total.
- `styles.css`: all styling

## Adding a new service
1. In `vehicles.js`, add a vehicle list, e.g. `const MY_FEATURE_VEHICLES = { "BMW": { ... } };`
2. In `services.js`, add an entry with `name`, `short`, `page`, `price`, `time`, `icon`, `checks` and `vehicles`. Add `addOn: { with: "<other-slug>", price: N }` to make it cheaper when booked with another service. The bundle banner, form price and emails update automatically.
3. Copy `heated-seats.html` to the new `page` name. Set `<body data-service="...">` to the new slug and rewrite the hero, features, pricing and FAQ text.
4. Optionally add a link-preview image at `media/og-<slug>.jpg` and point the page's `og:image` at it.
