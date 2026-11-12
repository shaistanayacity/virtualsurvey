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
    var b = el("div", "home__bg"); bgs.appendChild(b); return b;
  });
  // Hanya gambar slide yang sedang tampil yang diunduh dulu; sisanya menyusul saat jaringan sudah longgar.
  function ensureBg(i) {
    i = (i + slides.length) % slides.length;
    var b = bgEls[i];
    if (!b.style.backgroundImage) b.style.backgroundImage = "url(" + slides[i].image + ")";
  }
  ensureBg(0);
  function loadRest() { setTimeout(function () { slides.forEach(function (s, i) { ensureBg(i); }); }, 3000); }
  if (document.readyState === "complete") loadRest(); else window.addEventListener("load", loadRest, { once: true });
  root.appendChild(bgs);
  root.appendChild(el("div", "home__shade"));

  var top = el("header", "home__top");
  var brand = el("span", "home__brand");
  var logo = el("img", "home__logo"); logo.src = "assets/logo.png"; logo.alt = ""; logo.width = 34; logo.height = 34;
  brand.appendChild(logo); brand.appendChild(document.createTextNode(H.brand || ""));
  top.appendChild(brand);
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
    ensureBg(cur);
    bgEls.forEach(function (b, k) { b.classList.toggle("on", k === cur); });
    dotEls.forEach(function (d, k) { if (k === cur) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    tag.textContent = s.tag || "";
    title.textContent = s.name;
    desc.textContent = s.desc || "";
    var e = s.enter;
    if (e && (e.scene || e.next || e.units)) { cta.disabled = false; cta.textContent = (s.cta || "Jelajahi") + "  →"; }
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
    if (e.units) { openUnits(slides[cur]); return; }
    if (e.scene && VS.hasScene(e.scene)) { VS.enter(e.scene); hide(); }
  });
  card.addEventListener("click", function () { go(cur + 1); });
  next.addEventListener("click", function () { go(cur + 1); });
  prev.addEventListener("click", function () { go(cur - 1); });

  // Layar "Pilih Unit"
  var units = el("div", "units"), uBack = el("button", "units__back", "‹ Kembali"), uHead = el("div", "units__head"),
      uTag = el("p", "home__tag"), uTitle = el("h2", "units__title", "Pilih Unit"), uGrid = el("div", "units__grid");
  uBack.type = "button";
  uHead.appendChild(uTag); uHead.appendChild(uTitle);
  units.appendChild(uBack); units.appendChild(uHead); units.appendChild(uGrid);
  root.appendChild(units);
  function specLine(t) {
    return (t.summary || []).slice(0, 2).map(function (r) { return r[0].replace("Luas Bangunan", "LB").replace("Luas Tanah", "LT") + " " + r[1]; }).join(" · ");
  }
  function openUnits(slide) {
    uTag.textContent = slide.name;
    uGrid.textContent = "";
    (slide.enter.units || []).forEach(function (id) {
      var t = (D.types || []).filter(function (x) { return x.id === id; })[0];
      if (!t) return;
      var first = t.scenes && t.scenes[0], ready = !!(first && VS.hasScene(first.id));
      var c = el("button", "unit" + (ready ? "" : " unit--off")); c.type = "button";
      var img = t.cover || (first && first.photo);
      if (img) c.style.backgroundImage = "url(" + img + ")";
      var lab = el("span"), name = el("strong", null, t.name);
      if (ready) lab.appendChild(el("small", null, "Tipe")); else c.appendChild(el("span", "unit__tag", "Segera hadir"));
      lab.appendChild(name);
      var sp = specLine(t);
      if (sp) lab.appendChild(el("em", null, sp));
      c.appendChild(lab);
      if (ready) {
        if (VS.prefetch) { VS.prefetch(first.id); c.addEventListener("pointerenter", function () { VS.prefetch(first.id); }); }
        c.addEventListener("click", function () { VS.enter(first.id); hide(); closeUnits(); });
      }
      else c.setAttribute("aria-disabled", "true");
      uGrid.appendChild(c);
    });
    units.classList.add("open");
    var f = uGrid.querySelector(".unit:not(.unit--off)"); if (f) f.focus({ preventScroll: true });
  }
  function closeUnits() { units.classList.remove("open"); }
  uBack.addEventListener("click", closeUnits);

  function visible() { return !root.classList.contains("hide"); }
  function hide(instant) {
    if (instant) root.classList.add("instant");
    root.classList.add("hide");
    if (instant) { void root.offsetWidth; root.classList.remove("instant"); }
    root.setAttribute("aria-hidden", "true");
    if (!instant && VS.onEnter) VS.onEnter();
  }
  VS.showHome = function () {
    closeUnits(); root.classList.remove("hide"); root.setAttribute("aria-hidden", "false");
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  };

  document.addEventListener("keydown", function (e) {
    if (!visible()) return;
    if (units.classList.contains("open")) { if (e.key === "Escape") closeUnits(); return; }
    if (e.key === "ArrowRight") go(cur + 1);
    else if (e.key === "ArrowLeft") go(cur - 1);
  });
  // Scroll = ganti slide; gerak mouse = latar bergeser halus (parallax).
  var wAcc = 0, wLock = false;
  root.addEventListener("wheel", function (e) {
    if (units.classList.contains("open")) return;
    e.preventDefault();
    if (wLock) return;
    wAcc += e.deltaY;
    if (Math.abs(wAcc) < 40) return;
    var d = wAcc > 0 ? 1 : -1; wAcc = 0; wLock = true;
    go(cur + d);
    setTimeout(function () { wLock = false; wAcc = 0; }, 900);
  }, { passive: false });
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, raf = 0, mx = 0, my = 0;
  if (!still) {
    root.addEventListener("mousemove", function (e) {
      mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        root.style.setProperty("--px", (-mx * 26).toFixed(1) + "px");
        root.style.setProperty("--py", (-my * 16).toFixed(1) + "px");
      });
    });
  }
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
