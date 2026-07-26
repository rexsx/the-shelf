(function () {
  var THEME_KEY = "gfa-theme";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function storedTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null;
    }
  }

  function initTheme() {
    var toggle = document.querySelector("[data-theme-toggle]");
    var meta = document.querySelector('meta[name="theme-color"]');

    function sync() {
      var current = root.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      if (toggle) toggle.setAttribute("aria-label", "Switch to " + next + " theme");
      if (meta) meta.setAttribute("content", current === "dark" ? "#070a12" : "#f7f9fc");
    }

    function apply(theme, remember) {
      root.setAttribute("data-theme", theme);
      if (remember) {
        try {
          window.localStorage.setItem(THEME_KEY, theme);
        } catch (err) {
          sync();
          return;
        }
      }
      sync();
    }

    sync();

    if (toggle) {
      toggle.addEventListener("click", function () {
        apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
      });
    }

    var system = window.matchMedia("(prefers-color-scheme: light)");
    var onSystemChange = function (event) {
      if (storedTheme()) return;
      apply(event.matches ? "light" : "dark", false);
    };

    if (system.addEventListener) system.addEventListener("change", onSystemChange);
    else if (system.addListener) system.addListener(onSystemChange);
  }

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

    var head = document.querySelector(".masthead");

    function update() {
      var span = root.scrollHeight - root.clientHeight;
      var ratio = span > 0 ? Math.min(1, root.scrollTop / span) : 0;
      bar.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
      if (head) head.classList.toggle("is-stuck", root.scrollTop > 8);
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

  function splitHeadlines() {
    if (reduceMotion) return;

    document.querySelectorAll(".display").forEach(function (heading) {
      var pieces = [];
      var lastWord = null;
      var separated = true;

      function addToWord(node) {
        if (!separated && lastWord) {
          lastWord.appendChild(node);
          return;
        }
        var word = document.createElement("span");
        word.className = "word";
        word.appendChild(node);
        pieces.push(word);
        lastWord = word;
        separated = false;
      }

      Array.prototype.slice.call(heading.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (chunk) {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) {
              pieces.push(document.createTextNode(chunk));
              separated = true;
              return;
            }
            addToWord(document.createTextNode(chunk));
          });
          return;
        }

        if (node.nodeType === 1) {
          addToWord(node.cloneNode(true));
          return;
        }

        pieces.push(node.cloneNode(true));
      });

      var words = pieces.filter(function (piece) {
        return piece.nodeType === 1 && piece.className === "word";
      });

      if (words.length < 2) return;

      heading.textContent = "";
      pieces.forEach(function (piece) { heading.appendChild(piece); });
      words.forEach(function (word, index) {
        word.style.transitionDelay = (index * 0.045).toFixed(3) + "s";
      });
      heading.classList.add("has-words");
    });
  }

  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    function revealAll() {
      targets.forEach(function (node) { node.classList.add("is-visible"); });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealAll();
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

    window.setTimeout(function () {
      if (!document.querySelector("[data-reveal].is-visible")) revealAll();
    }, 2500);
  }

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.masthead-nav a[href^="#"]'));
    var pairs = links.map(function (link) {
      return { link: link, section: document.querySelector(link.getAttribute("href")) };
    }).filter(function (pair) { return pair.section; });

    if (!pairs.length || !("IntersectionObserver" in window)) return;

    var active = null;

    function mark(pair) {
      if (active === pair) return;
      if (active) active.link.removeAttribute("aria-current");
      if (pair) pair.link.setAttribute("aria-current", "true");
      active = pair;
    }

    var observer = new IntersectionObserver(function () {
      var middle = window.innerHeight / 2;
      var best = null;
      var bestDistance = Infinity;

      pairs.forEach(function (pair) {
        var box = pair.section.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) return;
        var distance = Math.abs(box.top - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = pair;
        }
      });

      mark(best);
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    pairs.forEach(function (pair) { observer.observe(pair.section); });
  }

  function initSpotlight() {
    var cover = document.querySelector(".cover");
    if (!cover || reduceMotion) return;
    var spot = cover.querySelector(".spotlight");
    if (!spot || !window.matchMedia("(hover: hover)").matches) return;

    var ticking = false;
    var x = 50;
    var y = 30;

    cover.addEventListener("pointermove", function (event) {
      var box = cover.getBoundingClientRect();
      x = ((event.clientX - box.left) / box.width) * 100;
      y = ((event.clientY - box.top) / box.height) * 100;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        spot.style.setProperty("--mx", x.toFixed(2) + "%");
        spot.style.setProperty("--my", y.toFixed(2) + "%");
        ticking = false;
      });
    });

    cover.addEventListener("pointerenter", function () { cover.dataset.pointer = "true"; });
    cover.addEventListener("pointerleave", function () { cover.dataset.pointer = "false"; });
  }

  function initYear() {
    var slot = document.querySelector("[data-year]");
    if (slot) slot.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initProgress();
    splitHeadlines();
    initReveal();
    initScrollSpy();
    initSpotlight();
    initYear();
  });
})();
