(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- 3D model loading / error states + reduced-motion gating ---
  function setupModels() {
    var models = document.querySelectorAll("model-viewer");
    models.forEach(function (mv) {
      var port = mv.closest(".obs-port");

      if (reduceMotion) mv.removeAttribute("auto-rotate");

      if (!port) return;

      // already loaded before listener attached?
      if (mv.loaded) port.classList.add("is-loaded");

      mv.addEventListener("load", function () {
        port.classList.add("is-loaded");
      });

      mv.addEventListener("error", function () {
        port.classList.add("is-error", "is-loaded");
        if (!port.querySelector(".obs-port__fallback")) {
          var fb = document.createElement("div");
          fb.className = "obs-port__fallback";
          fb.innerHTML =
            '<span aria-hidden="true">◌</span><span>Модель недоступна</span>';
          port.appendChild(fb);
        }
      });
    });
  }

  // --- scroll reveal ---
  function setupReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var siblings = el.parentElement
            ? Array.prototype.indexOf.call(el.parentElement.children, el)
            : 0;
          el.style.transitionDelay = Math.min(siblings, 6) * 60 + "ms";
          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function init() {
    setupModels();
    setupReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
