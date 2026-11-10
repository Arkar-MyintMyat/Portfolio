/* Arkar Myint Myat — portfolio scripts (no dependencies) */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Always open at the top ----------
     Don't restore an old scroll position on reload; links to a section (#projects etc.) still work.
     Smooth scrolling is switched on only after load, so the first paint never animates. */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener("load", function () {
    if (!location.hash) window.scrollTo(0, 0);
    root.classList.add("smooth-scroll");
  });

  /* ---------- Theme toggle (saved per visitor) ---------- */
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      btn.setAttribute("aria-label", next === "light" ? "Switch to dark theme" : "Switch to light theme");
    });
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("nav-links");
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menu.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- Screenshot slots: show a labelled placeholder until the file exists ---------- */
  var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>';
  function markMissing(img) {
    var media = img.closest(".frame-media");
    if (!media || media.classList.contains("is-missing")) return;
    media.classList.add("is-missing");
    var ph = document.createElement("div");
    ph.className = "placeholder";
    ph.setAttribute("role", "img");
    ph.setAttribute("aria-label", img.alt || "Screenshot coming soon");
    var label = img.getAttribute("data-label") || img.alt || "Screenshot";
    var strong = document.createElement("strong");
    strong.textContent = label;
    var code = document.createElement("code");
    code.textContent = img.getAttribute("src");
    ph.innerHTML = icon;
    ph.appendChild(strong);
    ph.appendChild(code);
    img.hidden = true;
    img.removeAttribute("data-zoom");
    media.appendChild(ph);
  }
  document.querySelectorAll(".frame-media img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    img.addEventListener("error", function () { markMissing(img); });
  });

  /* ---------- Lightbox for real screenshots ---------- */
  var box = null, lastFocus = null;
  function closeBox() {
    if (!box) return;
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function openBox(img) {
    if (!box) {
      box = document.createElement("div");
      box.className = "lightbox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Image viewer");
      box.innerHTML = '<button class="icon-btn close" type="button" aria-label="Close image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button><figure><img alt=""><figcaption></figcaption></figure>';
      document.body.appendChild(box);
      box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".close")) closeBox(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box && !box.hidden) closeBox(); });
    }
    lastFocus = document.activeElement;
    var big = box.querySelector("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    var cap = img.closest("figure");
    cap = cap && cap.querySelector("figcaption");
    box.querySelector("figcaption").textContent = cap ? cap.textContent : img.alt;
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".close").focus();
  }
  document.addEventListener("click", function (e) {
    var img = e.target.closest("img[data-zoom]");
    if (img && !img.hidden) { e.preventDefault(); openBox(img); }
  });
  document.querySelectorAll("img[data-zoom]").forEach(function (img) {
    img.tabIndex = 0;
    img.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && img.hasAttribute("data-zoom")) { e.preventDefault(); openBox(img); }
    });
  });

  /* ---------- Case-study contents + homepage menu: highlight the current section ---------- */
  var tocLinks = document.querySelectorAll(".toc a[href^='#'], .side-nav a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var link = map[en.target.id];
          if (link) link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var tip = btn.querySelector(".copy-tip");
    var label = btn.getAttribute("aria-label") || "Copy";
    var timer = null;
    function show(message, ok) {
      if (tip) tip.textContent = message;
      btn.classList.toggle("is-copied", ok);
      btn.setAttribute("aria-label", message);
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.classList.remove("is-copied");
        btn.setAttribute("aria-label", label);
        if (tip) tip.textContent = "";
      }, 1800);
    }
    // If the clipboard is blocked, select the visible address so it can be copied by hand.
    function selectText() {
      var val = btn.parentNode.querySelector(".val");
      if (!val) return;
      var range = document.createRange();
      range.selectNodeContents(val);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      show("Press Ctrl+C to copy", false);
    }
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { show("Copied!", true); }, selectText);
      } else {
        selectText();
      }
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
