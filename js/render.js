/* ============================================================================
 *  render.js — builds each scene's DOM from the event object.
 *  Pure-ish functions: each returns an HTMLElement (or null to skip the scene).
 * ========================================================================== */
(function () {
  "use strict";

  // ── tiny helpers ─────────────────────────────────────────────────────────
  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function initials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); })
      .join("");
  }
  // Inline Lucide-style icons (calendar, clock, pin) to keep things offline.
  var ICONS = {
    date: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    venue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  };

  // Render the hero title, styling the word "sharp" in the script font and
  // keeping it on one line (spaces → &nbsp;). Built word-by-word so the span
  // markup is never mangled by the space replacement.
  function heroTitle(title) {
    var t = String(title || "she sharp").trim();
    return t
      .split(/(\s+)/)
      .map(function (part) {
        if (/^\s+$/.test(part)) return "&nbsp;";
        if (/^sharp$/i.test(part)) return '<span class="sharp">' + esc(part) + "</span>";
        return esc(part);
      })
      .join("");
  }

  // ── Scene builders ─────────────────────────────────────────────────────────
  var builders = {
    hero: function (ev) {
      var s = el("section", "scene hero");
      if (ev.presenter) {
        var p = el("p", "eyebrow", esc(ev.presenter));
        p.setAttribute("data-stagger", "1");
        s.appendChild(p);
      }
      var h1 = el("h1", null, heroTitle(ev.title));
      h1.setAttribute("data-stagger", "2");
      s.appendChild(h1);
      if (ev.tagline) {
        var tg = el("p", "tagline", esc(ev.tagline));
        tg.setAttribute("data-stagger", "3");
        s.appendChild(tg);
      }
      return s;
    },

    event: function (ev) {
      if (!ev.subtitle && !ev.date && !ev.venue) return null;
      var s = el("section", "scene event");
      var card = el("div", "card");
      if (ev.tagline) {
        var eb = el("p", "eyebrow", esc(ev.tagline));
        eb.setAttribute("data-stagger", "1");
        card.appendChild(eb);
      }
      if (ev.subtitle) {
        var sub = el("h2", "subtitle", esc(ev.subtitle));
        sub.setAttribute("data-stagger", "2");
        card.appendChild(sub);
      }
      var meta = el("div", "meta");
      meta.setAttribute("data-stagger", "3");
      function addPill(icon, text) {
        if (!text) return;
        meta.appendChild(
          el("span", "pill", '<span class="ico">' + icon + "</span><span>" + esc(text) + "</span>")
        );
      }
      addPill(ICONS.date, ev.date);
      addPill(ICONS.time, ev.time);
      addPill(ICONS.venue, [ev.venue, ev.city].filter(Boolean).join(" · "));
      if (meta.childNodes.length) card.appendChild(meta);
      s.appendChild(card);
      return s;
    },

    speakers: function (ev) {
      var list = (ev.speakers || []).filter(function (sp) { return sp && sp.name; });
      if (!list.length) return null;
      var s = el("section", "scene speakers");
      var h = el("h2", "section-heading", esc(ev.speakersHeading || "Meet our speakers"));
      h.setAttribute("data-stagger", "1");
      s.appendChild(h);
      var grid = el("div", "speaker-grid");
      grid.setAttribute("data-stagger", "2");
      list.forEach(function (sp) {
        var card = el("div", "speaker");
        if (sp.image) {
          var img = el("img", "avatar");
          img.src = sp.image;
          img.alt = sp.name;
          img.onerror = function () {
            var f = el("div", "avatar", esc(initials(sp.name)));
            img.replaceWith(f);
          };
          card.appendChild(img);
        } else {
          card.appendChild(el("div", "avatar", esc(initials(sp.name))));
        }
        card.appendChild(el("div", "s-name", esc(sp.name)));
        if (sp.title) card.appendChild(el("div", "s-title", esc(sp.title)));
        grid.appendChild(card);
      });
      s.appendChild(grid);
      return s;
    },

    partners: function (ev) {
      var list = (ev.partners || []).filter(function (p) { return p && (p.logo || p.name); });
      if (!list.length) return null;
      var s = el("section", "scene partners");
      var h = el("h2", "section-heading", esc(ev.partnersHeading || "In partnership with"));
      h.setAttribute("data-stagger", "1");
      s.appendChild(h);
      var wall = el("div", "partner-wall");
      wall.setAttribute("data-stagger", "2");
      list.forEach(function (p) {
        var item = el("div", "partner");
        if (p.logo) {
          var img = el("img");
          img.src = p.logo;
          img.alt = p.name || "Partner";
          img.onerror = function () {
            img.replaceWith(el("div", "p-fallback", esc(p.name || "Partner")));
          };
          item.appendChild(img);
        } else {
          item.appendChild(el("div", "p-fallback", esc(p.name)));
        }
        wall.appendChild(item);
      });
      s.appendChild(wall);
      return s;
    },

    register: function (ev) {
      if (!ev.registrationUrl) return null;
      var s = el("section", "scene register");
      var h = el("h2", "section-heading", esc(ev.registrationLabel || "Scan to register"));
      h.setAttribute("data-stagger", "1");
      s.appendChild(h);
      var qrCard = el("div", "qr-card");
      qrCard.setAttribute("data-stagger", "2");
      var qrTarget = el("div");
      qrCard.appendChild(qrTarget);
      s.appendChild(qrCard);
      var url = el("div", "reg-url", esc(ev.registrationUrl));
      url.setAttribute("data-stagger", "3");
      s.appendChild(url);

      // Generate the QR once the element is in the DOM.
      setTimeout(function () {
        if (window.QRCode) {
          try {
            new window.QRCode(qrTarget, {
              text: ev.registrationUrl,
              width: 420,
              height: 420,
              colorDark: "#1f1e44",
              colorLight: "#ffffff",
              correctLevel: window.QRCode.CorrectLevel.M,
            });
          } catch (e) {
            qrTarget.textContent = ev.registrationUrl;
          }
        }
      }, 0);
      return s;
    },
  };

  window.SheSharpRender = { builders: builders };
})();
