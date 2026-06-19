/* ============================================================================
 *  She Sharp — Event Welcome Board  ·  DISPLAY SETTINGS
 * ----------------------------------------------------------------------------
 *  Controls how the board behaves. You usually don't need to touch this —
 *  edit config/event.js for content. Reload (press R) after changing.
 * ========================================================================== */

window.SHESHARP_SETTINGS = {
  // Which scenes to show, in order. Remove one to hide it.
  // Scenes with no content (e.g. no speakers) are skipped automatically.
  //   "hero"      → big glowing "she sharp" title
  //   "event"     → subtitle / date / time / venue card
  //   "speakers"  → speaker grid
  //   "partners"  → partner / sponsor logo wall
  //   "register"  → QR code to register (off by default: on event day,
  //                 guests have already registered, so it's not needed —
  //                 add "register" back to this list if you ever want it)
  scenes: ["hero", "event", "speakers", "partners"],

  // Seconds each scene stays on screen before crossfading to the next.
  rotationSeconds: 12,

  // Pause auto-rotation (use ← / → keys to advance manually). Default false.
  autoRotate: true,

  // ── Optional: pull the latest event automatically from the official site ──
  // When enabled AND online, the newest upcoming event from the She Sharp
  // website is fetched and used to fill in the fields above. If the fetch
  // fails (offline / blocked), it silently falls back to config/event.js — so
  // the board ALWAYS works. Disabled by default for offline-venue reliability.
  liveFetch: {
    enabled: false,
    // Public events feed from the official She Sharp website repo.
    dataSourceUrl:
      "https://raw.githubusercontent.com/NZ-SheSharp/she-sharp/main/lib/data/json/shesharp_events_v3.json",
    // Relative image paths in the feed (/img/...) are prefixed with this.
    imageBaseUrl: "https://www.shesharp.org.nz",
    // "upcoming" → nearest future event; "latest" → first/newest in the feed.
    pick: "upcoming",
  },
};
