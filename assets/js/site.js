(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initNav() {
    var head = document.querySelector(".masthead");
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!head || !toggle) return;

    function setOpen(open) {
      head.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(head.dataset.open !== "true");
    });

    head.querySelectorAll(".masthead-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function initProgress() {
    var bar = document.querySelector("[data-progress]");
    if (!bar) return;
    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var span = doc.scrollHeight - doc.clientHeight;
      var ratio = span > 0 ? Math.min(1, doc.scrollTop / span) : 0;
      bar.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener("resize", update);
    update();
  }

  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (node) { node.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    targets.forEach(function (node) { observer.observe(node); });
  }

  function initYear() {
    var slot = document.querySelector("[data-year]");
    if (slot) slot.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initProgress();
    initReveal();
    initYear();
  });
})();
