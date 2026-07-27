(function () {
  var data = window.SHELF;
  var root = document.querySelector("[data-shelf]");
  if (!data || !root) return;

  var TONES = { stem: "var(--teal)", abm: "var(--sky)", humss: "var(--indigo)", ict: "var(--violet)" };
  var ICONS = {
    handout: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M18 21H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h8l5 5v12a1 1 0 0 1-1 1z"/>',
    video: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>'
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
  }

  var order = ["stem", "abm", "humss", "ict"];
  var strands = data.strands.slice().sort(function (a, b) {
    return order.indexOf(a.id) - order.indexOf(b.id);
  });

  var tabs = root.querySelector("[data-strand-tabs]");
  var search = root.querySelector("[data-shelf-search]");
  var list = root.querySelector("[data-shelf-list]");
  var count = root.querySelector("[data-shelf-count]");

  var active = strands[0].id;

  tabs.innerHTML = strands.map(function (s) {
    var topics = s.semesters.reduce(function (a, sem) {
      return a + sem.subjects.reduce(function (b, sub) { return b + sub.topics.length; }, 0);
    }, 0);
    return '<button class="strand-tab" type="button" role="tab" data-strand="' + esc(s.id) + '" ' +
      'style="--tone: ' + TONES[s.id] + '" aria-selected="' + (s.id === active) + '">' +
      esc(s.code) + ' <span>' + topics + "</span></button>";
  }).join("");

  function linkFor(url, kind, label) {
    return '<a class="res-link" href="' + esc(url) + '" target="_blank" rel="noopener">' +
      icon(kind) + esc(label) + "</a>";
  }

  function draw() {
    var strand = strands.filter(function (s) { return s.id === active; })[0];
    var needle = (search.value || "").trim().toLowerCase();
    var shown = 0;
    var blocks = [];

    strand.semesters.forEach(function (sem) {
      sem.subjects.forEach(function (subject) {
        var topics = subject.topics.filter(function (t) {
          if (!needle) return true;
          return (t.title + " " + subject.name + " " + subject.code).toLowerCase().indexOf(needle) !== -1;
        });
        if (!topics.length) return;
        shown += topics.length;

        blocks.push(
          '<section class="subject-block" style="--tone: ' + TONES[strand.id] + '">' +
            '<div class="subject-head">' +
              '<span class="subject-code">' + esc(subject.code) + "</span>" +
              '<h2 class="subject-name">' + esc(subject.name) + "</h2>" +
              '<span class="subject-count">' + topics.length + (topics.length === 1 ? " topic" : " topics") + "</span>" +
            "</div>" +
            '<ol class="topic-list">' +
              topics.map(function (t) {
                var links = [];
                if (t.handout) links.push(linkFor(t.handout, "handout", "Handout"));
                t.videos.forEach(function (url, i) {
                  links.push(linkFor(url, "video", t.videos.length > 1 ? "Video " + (i + 1) : "Video guide"));
                });
                return '<li class="topic-row">' +
                  '<span class="topic-n">' + (t.n < 10 ? "0" : "") + t.n + "</span>" +
                  '<span class="topic-title">' + esc(t.title) + "</span>" +
                  '<span class="topic-links">' + (links.join("") || '<span class="topic-none">Nothing filed yet</span>') + "</span>" +
                "</li>";
              }).join("") +
            "</ol>" +
          "</section>"
        );
      });
    });

    count.textContent = shown
      ? shown + (shown === 1 ? " topic" : " topics") + (needle ? ' matching "' + search.value.trim() + '"' : "")
      : "Nothing matched that";

    list.innerHTML = blocks.length
      ? blocks.join("")
      : '<p class="shelf-empty">No topic in ' + esc(strand.code) + ' matches that. Try a shorter search, or another strand.</p>';
  }

  tabs.addEventListener("click", function (event) {
    var btn = event.target.closest ? event.target.closest("[data-strand]") : null;
    if (!btn) return;
    active = btn.getAttribute("data-strand");
    Array.prototype.forEach.call(tabs.querySelectorAll("[data-strand]"), function (t) {
      t.setAttribute("aria-selected", String(t === btn));
    });
    draw();
  });

  search.addEventListener("input", draw);

  var totals = strands.reduce(function (acc, s) {
    s.semesters.forEach(function (sem) {
      sem.subjects.forEach(function (sub) {
        acc.topics += sub.topics.length;
        sub.topics.forEach(function (t) {
          if (t.handout) acc.handouts += 1;
          acc.videos += t.videos.length;
        });
      });
    });
    return acc;
  }, { topics: 0, handouts: 0, videos: 0 });

  Object.keys(totals).forEach(function (key) {
    var node = document.querySelector("[data-total-" + key + "]");
    if (node) node.textContent = totals[key];
  });

  draw();
})();
