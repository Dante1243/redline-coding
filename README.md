# Remote Engine Start Coding website

Static site for OEM remote engine start (option 1CR) coding enquiries. It's hosted on GitHub Pages.

- `index.html`, `styles.css`: the page
- `vehicles.js`: eligibility data. Keep it in sync with *Supported Vehicles.docx*.
- `app.js`: eligibility checker and enquiry form. Enquiries are emailed through [FormSubmit](https://formsubmit.co) to the address in `ENQUIRY_EMAIL`.

The first enquiry sends a one-time activation email from FormSubmit. Click the link in it, and every enquiry after that arrives in your inbox.
