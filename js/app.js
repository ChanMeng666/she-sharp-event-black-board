/* ============================================================================
 *  app.js — boots the board: loads content, builds scenes, runs the rotation,
 *  and wires keyboard / fullscreen controls.
 * ========================================================================== */
(function () {
  "use strict";

  var SETTINGS = window.SHESHARP_SETTINGS || {};
  var DEFAULT_SCENES = ["hero", "event", "speakers", "partners", "register"];

  var stageEl = document.getElementById("stage");
  var dotsEl = document.getElementById("dots");

  var scenes = [];      // [{ name, el }]
  var index = 0;
  var timer = null;
  var paused = false;

  function rotationMs() {
    return Math.max(3, Number(SETTINGS.rotationSeconds) || 12) * 1000;
  }

  // Build all enabled, non-empty scenes from the event object.
  function buildScenes(ev) {
    var order = Array.isArray(SETTINGS.scenes) && SETTINGS.scenes.length
      ? SETTINGS.scenes
      : DEFAULT_SCENES;
    var builders = window.SheSharpRender.builders;

    stageEl.innerHTML = "";
    dotsEl.innerHTML = "";
    scenes = [];

    order.forEach(function (name) {
      var build = builders[name];
      if (!build) return;
      var node = build(ev);
      if (!node) return; // builder returned null → no content, skip
      stageEl.appendChild(node);
      scenes.push({ name: name, el: node });

      var dot = document.createElement("span");
      dot.className = "dot";
      dotsEl.appendChild(dot);
    });

    if (!scenes.length) {
      stageEl.appendChild(buildFallback());
      return;
    }
    index = 0;
    show(0);
  }

  function buildFallback() {
    var s = document.createElement("section");
    s.className = "scene hero active";
    s.innerHTML = '<h1>she&nbsp;<span class="sharp">sharp</span></h1>';
    return s;
  }

  function show(i) {
    scenes.forEach(function (sc, n) {
      sc.el.classList.toggle("active", n === i);
    });
    var dots = dotsEl.children;
    for (var n = 0; n < dots.length; n++) {
      dots[n].classList.toggle("on", n === i);
    }
    // Re-trigger entrance animations by reflowing the active scene.
    if (scenes[i]) {
      var staggered = scenes[i].el.querySelectorAll("[data-stagger]");
      staggered.forEach(function (node) {
        node.style.animation = "none";
        // force reflow
        void node.offsetWidth;
        node.style.animation = "";
      });
    }
    index = i;
  }

  function next() { show((index + 1) % scenes.length); }
  function prev() { show((index - 1 + scenes.length) % scenes.length); }

  function startTimer() {
    stopTimer();
    if (paused || scenes.length < 2 || SETTINGS.autoRotate === false) return;
    timer = setInterval(next, rotationMs());
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function restartTimer() { if (!paused) startTimer(); }

  function togglePause() {
    paused = !paused;
    document.body.classList.toggle("paused", paused);
    if (paused) stopTimer(); else startTimer();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
    } else {
      (document.exitFullscreen || function () {}).call(document);
    }
  }

  // ── Keyboard controls ──────────────────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowRight": case "PageDown":
        next(); restartTimer(); break;
      case "ArrowLeft": case "PageUp":
        prev(); restartTimer(); break;
      case " ": case "Spacebar":
        e.preventDefault(); togglePause(); break;
      case "f": case "F":
        toggleFullscreen(); break;
      case "r": case "R":
        location.reload(); break;
    }
  });

  // Show the cursor briefly on movement, then hide it again for a clean stage.
  var cursorTimer = null;
  document.addEventListener("mousemove", function () {
    document.body.classList.add("show-cursor");
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(function () {
      document.body.classList.remove("show-cursor");
    }, 2500);
  });

  // Click anywhere to advance (handy for a touch display / presenter remote).
  stageEl.addEventListener("click", function () { next(); restartTimer(); });

  // ── Boot ──────────────────────────────────────────────────────────────────
  async function boot() {
    var ev = Object.assign({}, window.SHESHARP_EVENT || {});

    // Optional: merge live data from the official site over the local config.
    if (SETTINGS.liveFetch && SETTINGS.liveFetch.enabled && window.SheSharpLiveFetch) {
      try {
        var live = await window.SheSharpLiveFetch(SETTINGS.liveFetch);
        if (live) {
          // Live values win, but keep local non-empty fields the feed lacks.
          Object.keys(live).forEach(function (k) {
            var v = live[k];
            var has = Array.isArray(v) ? v.length : v;
            if (has) ev[k] = v;
          });
        }
      } catch (e) { /* fall back to local config */ }
    }

    buildScenes(ev);
    startTimer();
  }

  boot();
})();
