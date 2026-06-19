/* ============================================================================
 *  She Sharp — Event Welcome Board  ·  PER-EVENT CONTENT
 * ----------------------------------------------------------------------------
 *  👉 THIS IS THE ONLY FILE YOU NEED TO EDIT FOR EACH NEW EVENT. 👈
 *
 *  Change the text, dates, partner logos and speakers below, then reload the
 *  page (press R, or close & re-open index.html). No build step, no internet.
 *
 *  Tips:
 *   • Leave a field as "" (empty) or [] to hide it / skip that scene.
 *   • Partner logos: drop the image file into  assets/partners/  then point
 *     the "logo" path at it (e.g. "assets/partners/acme.svg").
 *   • Speaker photos are optional — without one, initials are shown instead.
 *   • Want the latest event pulled automatically from shesharp.org.nz?
 *     Turn on liveFetch in config/settings.js (needs internet).
 * ========================================================================== */

window.SHESHARP_EVENT = {
  // ── Hero scene ──────────────────────────────────────────────────────────
  // The big glowing title. "sharp" is automatically rendered in the mint
  // script font, matching the She Sharp brand wordmark.
  presenter: "Peyvand Academy & Ministry of Education present",
  title: "she sharp",
  tagline: "Youth Tech Series",

  // ── Event details scene ─────────────────────────────────────────────────
  subtitle: "AI & Electronics Workshop for Youth (Ages 12–18)",
  date: "June 13, 2026",
  time: "2:30pm – 4:30pm NZST",
  venue: "Fruitvale Primary School",
  city: "Auckland, New Zealand",

  // ── Register scene ──────────────────────────────────────────────────────
  // A QR code is generated from this URL. Leave "" to hide the register scene.
  registrationUrl: "https://www.shesharp.org.nz/events",
  registrationLabel: "Scan to register",

  // ── Partner / sponsor wall ──────────────────────────────────────────────
  // Logos shown on a glassmorphism wall. Add as many as you like.
  partners: [
    { name: "Peyvand Academy",       logo: "assets/partners/fonterra-logo.svg" },
    { name: "Ministry of Education", logo: "assets/partners/myob-logo.svg" },
    { name: "Little Engineers",      logo: "assets/partners/mailchimp.svg" },
  ],
  partnersHeading: "In partnership with",

  // ── Speakers (optional) ─────────────────────────────────────────────────
  // Each: { name, title, image }. image is optional (path or full URL).
  speakers: [
    // { name: "Jane Doe", title: "AI Engineer, Acme", image: "" },
  ],
  speakersHeading: "Meet our speakers",
};
