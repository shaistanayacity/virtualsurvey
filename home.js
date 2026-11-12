(function () {
  "use strict";
  var D = window.SURVEY, H = D && D.home, VS = window.VS, root = document.getElementById("home");
  if (!H || !H.slides || !H.slides.length || !VS || !root) { if (root) root.hidden = true; return; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var slides = H.slides, cur = 0;

  // Latar per slide
  var bgs = el("div", "home__bgs"), bgEls = slides.map(function (s) {
    var b = el("div", "home__bg"); b.style.backgroundImage = "url(" + s.image + ")"; bgs.appendChild(b); return b;
  });
  root.appendChild(bgs);
  root.appendChild(el("div", "home__shade"));

  var top = el("header", "home__top");
  top.appendChild(el("span", "home__brand", H.brand || ""));
  top.appendChild(el("span", "home__sub", H.sub || ""));
  root.appendChild(top);

  var content = el("div", "home__content"), tag = el("p", "home__tag"), title = el("h2", "home__title"),
      desc = el("p", "home__desc"), cta = el("button", "home__cta");
  cta.type = "button";
  [tag, title, desc, cta].forEach(function (n) { content.appendChild(n); });
  root.appendChild(content);

  var nextBox = el("aside", "home__next"), card = el("button", "home__card"), cardTxt = el("span"), cardSmall = el("small", null, "Berikutnya"), cardName = el("strong");
  card.type = "button";
  cardTxt.appendChild(cardSmall); cardTxt.appendChild(cardName); card.appendChild(cardTxt); nextBox.appendChild(card);
  root.appendChild(nextBox);

  var bottom = el("footer", "home__bottom"), count = el("div", "home__count"), cb = el("b"), ca = el("span", null, "/" + pad(slides.length));
  count.appendChild(cb); count.appendChild(ca);
  var dots = el("div", "home__dots"), dotEls = slides.map(function (s, i) {
    var d = el("button"); d.type = "button"; d.setAttribute("aria-label", s.name);
    d.addEventListener("click", function () { go(i); }); dots.appendChild(d); return d;
  });
  var arrows = el("div", "home__arrows"), prev = el("button", null, "←"), next = el("button", null, "→");
  prev.type = next.type = "button"; prev.setAttribute("aria-label", "Sebelumnya"); next.setAttribute("aria-label", "Berikutnya");
  arrows.appendChild(prev); arrows.appendChild(next);
  bottom.appendChild(count); bottom.appendChild(dots); bottom.appendChild(arrows);
  root.appendChild(bottom);

  function go(i) {
    cur = (i + slides.length) % slides.length;
    var s = slides[cur], nx = slides[(cur + 1) % slides.length];
    bgEls.forEach(function (b, k) { b.classList.toggle("on", k === cur); });
    dotEls.forEach(function (d, k) { if (k === cur) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    tag.textContent = s.tag || "";
    title.textContent = s.name;
    desc.textContent = s.desc || "";
    var e = s.enter;
    if (e && (e.scene || e.next)) { cta.disabled = false; cta.textContent = (s.cta || "Jelajahi") + "  →"; }
    else { cta.disabled = true; cta.textContent = "Segera hadir"; }
    cb.textContent = pad(cur + 1);
    nextBox.hidden = slides.length < 2;
    card.style.backgroundImage = "url(" + nx.image + ")";
    cardName.textContent = nx.name;
    content.classList.remove("in"); void content.offsetWidth; content.classList.add("in");
  }

  cta.addEventListener("click", function () {
    var e = slides[cur].enter;
    if (!e) return;
    if (e.next) { go(cur + 1); return; }
    if (e.scene && VS.hasScene(e.scene)) { VS.enter(e.scene); hide(); }
  });
  card.addEventListener("click", function () { go(cur + 1); });
  next.addEventListener("click", function () { go(cur + 1); });
  prev.addEventListener("click", function () { go(cur - 1); });

  function visible() { return !root.classList.contains("hide"); }
  function hide(instant) {
    if (instant) root.classList.add("instant");
    root.classList.add("hide");
    if (instant) { void root.offsetWidth; root.classList.remove("instant"); }
    root.setAttribute("aria-hidden", "true");
  }
  VS.showHome = function () {
    root.classList.remove("hide"); root.setAttribute("aria-hidden", "false");
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  };

  document.addEventListener("keydown", function (e) {
    if (!visible()) return;
    if (e.key === "ArrowRight") go(cur + 1);
    else if (e.key === "ArrowLeft") go(cur - 1);
  });
  var x0 = null;
  root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", function (e) {
    if (x0 == null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
  });

  go(0);
  // Link langsung ke scene (#dalam-tv) melewati beranda.
  if (location.hash && VS.hasScene(location.hash.slice(1))) hide(true);
})();
