/* ============================================================================
 *  live-fetch.js — OPTIONAL. Pulls the latest event from the official
 *  She Sharp website feed and maps it onto our event schema.
 *
 *  Enable in config/settings.js → liveFetch.enabled = true.
 *  Always best-effort: any failure falls back silently to config/event.js,
 *  so the board never breaks if the venue is offline.
 * ========================================================================== */
(function () {
  "use strict";

  // Prefix relative /img/... paths in the feed with the website origin.
  function absUrl(base, p) {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    return base.replace(/\/$/, "") + "/" + String(p).replace(/^\//, "");
  }

  // Parse the feed's human date ("November 21, 2025") to a timestamp.
  function ts(dateStr) {
    var t = Date.parse(dateStr);
    return isNaN(t) ? 0 : t;
  }

  // Flatten the feed's grouped speaker structure into a simple list.
  function flattenSpeakers(detail, base) {
    var out = [];
    var groups = (detail && detail.speakers) || {};
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      (g && g.speakers ? g.speakers : []).forEach(function (sp) {
        if (sp && sp.name) {
          out.push({
            name: sp.name,
            title: sp.title || sp.company || "",
            image: absUrl(base, sp.image),
          });
        }
      });
    });
    return out;
  }

  // Map one EventV3 record → our SHESHARP_EVENT shape.
  function mapEvent(rec, base) {
    var d = rec.detailPageData || {};
    var loc = d.location || {};
    var partners = [];
    var sp = d.sponsors || {};
    [].concat(sp.main || [], sp.other || []).forEach(function (s) {
      if (s && (s.logo || s.name)) {
        partners.push({ name: s.name || "Partner", logo: absUrl(base, s.logo) });
      }
    });
    return {
      presenter: "She Sharp presents",
      title: "she sharp",
      tagline: "",
      subtitle: rec.title || d.title || "",
      date: rec.date || d.date || "",
      time: d.dateTime || [d.startTime, d.endTime].filter(Boolean).join(" – ") || d.time || "",
      venue: loc.venueName || "",
      city: [loc.city, loc.country].filter(Boolean).join(", "),
      registrationUrl: d.registrationUrl || d.humanitixUrl || rec.detailPageUrl || "",
      registrationLabel: "Scan to register",
      partners: partners,
      partnersHeading: "Our sponsors",
      speakers: flattenSpeakers(d, base),
      speakersHeading: "Meet our speakers",
    };
  }

  // Choose which event to display from the feed.
  function selectEvent(events, mode) {
    if (!events || !events.length) return null;
    if (mode === "upcoming") {
      var now = Date.now();
      var future = events
        .filter(function (e) { return ts(e.date) >= now - 86400000; })
        .sort(function (a, b) { return ts(a.date) - ts(b.date); });
      if (future.length) return future[0];
    }
    // "latest" (or no upcoming found): newest by date, else first in feed.
    var byDate = events.slice().sort(function (a, b) { return ts(b.date) - ts(a.date); });
    return byDate[0] || events[0];
  }

  // Public: returns a Promise resolving to a mapped event, or null on failure.
  window.SheSharpLiveFetch = async function (cfg) {
    if (!cfg || !cfg.enabled || !cfg.dataSourceUrl) return null;
    try {
      var res = await fetch(cfg.dataSourceUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      var events = Array.isArray(data) ? data : data.events || [];
      var rec = selectEvent(events, cfg.pick || "upcoming");
      if (!rec) return null;
      console.info("[She Sharp] Live event loaded:", rec.title);
      return mapEvent(rec, cfg.imageBaseUrl || "");
    } catch (e) {
      console.warn("[She Sharp] Live fetch failed, using local config:", e.message);
      return null;
    }
  };
})();
