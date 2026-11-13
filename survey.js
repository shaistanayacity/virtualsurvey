(function () {
  "use strict";
  var D = window.SURVEY, $ = function (id) { return document.getElementById(id); };
  // Tipe rumah: hanya tipe yang punya scene yang ditampilkan. (Format lama tanpa "types" tetap didukung.)
  var types = (D.types || [{ id: "unit", name: D.unit, unit: D.unit, summary: D.summary, floors: allFloors, scenes: allScenes }])
    .filter(function (t) { return t.scenes && t.scenes.length; });
  var allScenes = [], allFloors = [], byId = {}, floorById = {}, typeById = {};
  types.forEach(function (t) {
    typeById[t.id] = t;
    t.scenes.forEach(function (s) { s.type = t.id; allScenes.push(s); byId[s.id] = s; });
    (t.floors || []).forEach(function (f) { f.type = t.id; allFloors.push(f); floorById[f.id] = f; });
  });
  var curType = null;

  // Belum ada scene sama sekali (semua tipe masih kosong): hanya beranda & "Pilih Unit" yang aktif.
  if (!allScenes.length) {
    window.VS = { hasScene: function () { return false; }, enter: function () {} };
    return;
  }

  // Pannellum multi-scene config dari data.js
  // Titik info (mis. "Smart Door Lock"): pin berdenyut + kartu kecil saat disorot / diketuk.
  function pinTip(div, a) {
    div.classList.add("pin");
    var dot = document.createElement("i"); dot.textContent = "i";
    var card = document.createElement("span"); card.className = "pin__card";
    var t = document.createElement("strong"); t.textContent = a.title;
    card.appendChild(t);
    if (a.text) { var p = document.createElement("small"); p.textContent = a.text; card.appendChild(p); }
    div.appendChild(dot); div.appendChild(card);
    div.addEventListener("click", function (e) { e.stopPropagation(); div.classList.toggle("open"); });
  }
  var scenes = {};
  allScenes.forEach(function (s) {
    var fov = s.fov || 360, partial = fov < 360;
    var haov = fov, vaov = partial ? fov * s.h / s.w : 180;
    var cfg = {
      type: "equirectangular", panorama: s.photo, yaw: s.yaw || 0, pitch: s.pitch || 0, hfov: partial ? fov : 100,
      autoRotate: (partial || s.still) ? 0 : -2,
      hotSpots: (s.hotspots || []).map(function (h) {
        var yaw = h.yaw, pitch = h.pitch || 0;
        if (h.x != null) { yaw = (h.x / 100 - 0.5) * haov; pitch = (0.5 - h.y / 100) * vaov; }
        if (h.info) return { type: "info", yaw: yaw, pitch: pitch, cssClass: "pin", createTooltipFunc: pinTip, createTooltipArgs: h.info };
        return { type: "scene", sceneId: h.to, yaw: yaw, pitch: pitch, text: h.label };
      })
    };
    // Foto 360 beresolusi 4096 px: batasi zoom-in agar tidak pecah (bisa diatur per scene dengan minHfov).
    if (!partial) cfg.minHfov = s.minHfov || 70;
    if (s.limits) {
      ["minYaw", "maxYaw", "minPitch", "maxPitch"].forEach(function (k) { if (s.limits[k] != null) cfg[k] = s.limits[k]; });
      if (s.limits.maxYaw != null && s.limits.minYaw != null) cfg.hfov = Math.min(cfg.hfov, s.limits.maxYaw - s.limits.minYaw - 2);
    }
    if (partial) { cfg.haov = haov; cfg.vaov = vaov; cfg.vOffset = 0; cfg.minHfov = 30; cfg.maxHfov = fov; }
    scenes[s.id] = cfg;
  });
  var deepLink = location.hash.slice(1) in byId;
  var startId = deepLink ? location.hash.slice(1) : allScenes[0].id;
  var viewer = pannellum.viewer("pano", {
    default: { firstScene: startId, autoLoad: deepLink || !$("home"), showControls: false, compass: false, mouseZoom: false, autoRotateInactivityDelay: 4000, sceneFadeDuration: 900 },
    scenes: scenes
  });

  var current = null, shownFloor = null, visited = [];
  function markVisited(id) {
    var s = byId[id];
    if (!s || visited.some(function (v) { return v.id === id; })) return;
    visited.push({ id: id, unit: typeById[s.type].name, title: s.title });
  }
  var homeEl = $("home");
  function homeOpen() { return homeEl && !homeEl.classList.contains("hide"); }

  // Foto biasa: batasi zoom-out supaya tepi foto tidak terbuka (pita hitam), terutama di layar portrait.
  function fitView() {
    var sc = current && byId[current];
    if (!sc || !sc.fov || sc.fov >= 360) return;
    var box = $("pano"), a = box.clientWidth / Math.max(1, box.clientHeight);
    var vaov = sc.fov * sc.h / sc.w, rad = Math.PI / 180;
    var maxH = Math.min(sc.fov, 2 * Math.atan(Math.tan(vaov / 2 * rad) * a) / rad);
    var minH = Math.min(30, maxH);
    lastBounds = [minH, maxH];
    viewer.setHfovBounds([minH, maxH]);
    if (viewer.getHfov() > maxH) viewer.setHfov(maxH, false);
  }
  var lastBounds = null, dollyT;
  // "Kamera" bergerak: mulai dari bingkai penuh lalu zoom pelan ke dalam.
  function dolly() {
    var sc = current && byId[current];
    if (!sc || !sc.fov || sc.fov >= 360 || !lastBounds) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearTimeout(dollyT);
    viewer.setHfov(lastBounds[1], false);
    dollyT = setTimeout(function () { viewer.setHfov(Math.max(lastBounds[0], lastBounds[1] * 0.86), 6500); }, 200);
  }
  window.addEventListener("resize", fitView);

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }
  function fillSpecs(node, rows) {
    node.textContent = "";
    rows.forEach(function (r) { node.appendChild(el("dt", {}, r[0])); node.appendChild(el("dd", {}, r[1])); });
  }

  // Tab lantai (per tipe): klik lantai -> tampil denah + spesifikasi, lalu loncat ke scene pertama lantai itu.
  var floorsEl = $("floors"), navEl = $("floors-nav"), typesEl = $("types");
  function buildFloors() {
    floorsEl.textContent = ""; navEl.textContent = "";
    var list = allFloors.filter(function (f) {   // hanya lantai/area yang sudah punya scene
      return f.type === curType && allScenes.some(function (sc) { return sc.floor === f.id; });
    });
    list.forEach(function (f) {
      var b = el("button", { type: "button", role: "tab", "data-floor": f.id }, f.label);
      b.addEventListener("click", function () {
        showFloor(f.id);
        var first = allScenes.filter(function (s) { return s.floor === f.id; })[0];
        if (first && (!current || byId[current].floor !== f.id)) viewer.loadScene(first.id);
      });
      floorsEl.appendChild(b);
      var n = el("button", { type: "button", "data-floor": f.id }, f.label);
      n.addEventListener("click", function () { b.click(); openPanel(); });
      navEl.appendChild(n);
    });
    floorsEl.hidden = navEl.hidden = list.length < 2;
  }
  function setType(id) {
    var t = typeById[id];
    if (!t || curType === id) return;
    curType = id; shownFloor = null;
    $("unit-name").textContent = t.unit || t.name;
    document.title = D.title + " — " + (t.unit || t.name);
    fillSpecs($("summary"), t.summary || []);
    fillSpecs($("building"), t.building || []);
    $("building-box").hidden = !(t.building && t.building.length);
    buildTypeTabs();
    buildFloors();
    buildRail();
  }
  // Pemilih unit di dalam survey: unit-unit se-cluster (urutan sesuai home.slides[].enter.units).
  // Unit yang belum punya scene tampil redup + "segera" dan tidak bisa diklik.
  var rawTypeById = {};
  (D.types || []).forEach(function (t) { rawTypeById[t.id] = t; });
  function clusterIds(typeId) {
    var sl = (D.home && D.home.slides) || [];
    for (var i = 0; i < sl.length; i++) {
      var u = sl[i].enter && sl[i].enter.units;
      if (u && u.indexOf(typeId) > -1) return u;
    }
    return types.map(function (t) { return t.id; });
  }
  function buildTypeTabs() {
    typesEl.textContent = "";
    var list = clusterIds(curType).map(function (id) { return rawTypeById[id] || typeById[id]; }).filter(Boolean);
    list.forEach(function (t) {
      var ready = !!typeById[t.id];
      var b = el("button", { type: "button", "data-type": t.id, "aria-selected": t.id === curType ? "true" : "false" }, t.name);
      if (!ready) {
        b.className = "off"; b.setAttribute("aria-disabled", "true"); b.title = "Segera hadir";
        b.appendChild(el("em", {}, "segera"));
      } else {
        b.addEventListener("click", function () {
          if (t.id === curType) return;
          setType(t.id);
          viewer.loadScene(typeById[t.id].scenes[0].id);
          closePanel();
        });
      }
      typesEl.appendChild(b);
    });
    typesEl.hidden = list.length < 2;
    // Tab aktif ke tengah (penting di HP saat tab tidak muat).
    requestAnimationFrame(function () {
      var sel = typesEl.querySelector('[aria-selected="true"]');
      if (sel && typesEl.scrollWidth > typesEl.clientWidth) typesEl.scrollLeft = sel.offsetLeft - (typesEl.clientWidth - sel.offsetWidth) / 2;
    });
  }
  setType(byId[startId].type);

  function showFloor(id) {
    var f = floorById[id];
    if (!f) return;
    shownFloor = id;
    [floorsEl, navEl].forEach(function (box) {
      Array.prototype.forEach.call(box.children, function (b) {
        b.setAttribute("aria-selected", b.getAttribute("data-floor") === id ? "true" : "false");
      });
    });
    $("plan").hidden = !f.plan;
    $("plan-hint").hidden = !f.plan || !allScenes.some(function (s) { return s.floor === id && s.plan; });
    if (f.plan) { $("plan-img").src = f.plan; $("plan-img").alt = "Denah " + f.label; }
    $("floor-name").textContent = f.label + (f.area ? " · " + f.area : "");
    fillSpecs($("specs"), f.specs || []);
    var dots = $("plan-dots"), rooms = $("rooms");
    dots.textContent = ""; rooms.textContent = "";
    allScenes.filter(function (s) { return s.floor === id; }).forEach(function (s) {
      var d = el("button", { type: "button", class: "dot", title: s.title, "aria-label": s.title, "data-scene": s.id });
      if (s.plan) {
      d.style.left = s.plan.x + "%"; d.style.top = s.plan.y + "%";
      d.addEventListener("click", function () { viewer.loadScene(s.id); closePanel(); });
      dots.appendChild(d); }
      var r = el("button", { type: "button", "data-scene": s.id }, s.title);
      r.addEventListener("click", function () { viewer.loadScene(s.id); closePanel(); });
      rooms.appendChild(r);
    });
    markCurrent();
  }
  function markCurrent() {
    document.querySelectorAll("[data-scene]").forEach(function (n) {
      if (n.getAttribute("data-scene") === current) n.setAttribute("aria-current", "true");
      else n.removeAttribute("aria-current");
    });
  }

  var heroEl = $("scene-title"), heroTimer;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function announce(id) {
    var list = typeById[byId[id].type].scenes, i = list.indexOf(byId[id]);
    $("count-cur").textContent = pad(i + 1);
    $("count-all").textContent = "/" + pad(list.length);
    heroEl.classList.remove("show");
    clearTimeout(heroTimer);
    heroTimer = setTimeout(function () {
      heroEl.textContent = byId[id].title;
      heroEl.classList.add("show");
    }, 250);
  }
  viewer.on("scenechange", function (id) {
    current = id;
    markVisited(id);
    setType(byId[id].type);
    fitView();
    announce(id);
    if (shownFloor !== byId[id].floor) showFloor(byId[id].floor); else markCurrent();
    updateRail();
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  });
  viewer.on("load", function () {
    if (!current) { current = viewer.getScene(); announce(current); showFloor(byId[current].floor); }
    markVisited(current);
    warmed[current] = true;
    warmAround(current);
    fitView();
    dolly();
    updateRail();
    scheduleTour();
  });

  // ---- Interaksi: urutan ruangan, rel progres, dock, tur otomatis ----
  var railEl = $("rail"), hintEl = $("hint"), playBtn = $("dock-play");
  function list() { return curType ? typeById[curType].scenes : []; }
  function step(d) {
    var l = list(), i = l.indexOf(byId[current]), n = i + d;
    if (i < 0 || n < 0 || n >= l.length) return false;
    viewer.loadScene(l[n].id);
    return true;
  }
  function buildRail() {
    if (!railEl) return;
    railEl.textContent = "";
    var l = list();
    railEl.hidden = l.length < 2;
    l.forEach(function (s) {
      var b = el("button", { type: "button", "data-rail": s.id, "data-title": s.title, "aria-label": s.title });
      b.addEventListener("click", function () { stopTour(); if (current !== s.id) viewer.loadScene(s.id); });
      railEl.appendChild(b);
    });
    updateRail();
  }
  function updateRail() {
    if (!railEl) return;
    Array.prototype.forEach.call(railEl.children, function (b) {
      if (b.getAttribute("data-rail") === current) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }
  function showHint(msg) {
    hintEl.textContent = msg; hintEl.classList.add("show");
    clearTimeout(showHint.t); showHint.t = setTimeout(function () { hintEl.classList.remove("show"); }, 6500);
  }
  var stepped = false;
  function userStep(d) { stopTour(); if (step(d)) { stepped = true; hintEl.classList.remove("show"); } }

  // Scroll / roda mouse pindah ruangan (zoom lewat pinch atau tombol +/-).
  var wheelAcc = 0, wheelLock = false;
  $("pano").addEventListener("wheel", function (e) {
    e.preventDefault();
    if (wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 50) return;
    var d = wheelAcc > 0 ? 1 : -1; wheelAcc = 0; wheelLock = true;
    userStep(d);
    setTimeout(function () { wheelLock = false; wheelAcc = 0; }, 1100);
  }, { passive: false });
  document.addEventListener("keydown", function (e) {
    if (homeOpen() || panel.classList.contains("open")) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); userStep(1); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); userStep(-1); }
    else if (e.key === " ") { e.preventDefault(); toggleTour(); }
  });
  $("pano").addEventListener("pointerdown", function () { stopTour(); });
  $("dock-prev").addEventListener("click", function () { userStep(-1); });
  $("dock-next").addEventListener("click", function () { userStep(1); });

  // Tur otomatis
  var touring = false, tourT;
  function scheduleTour() {
    clearTimeout(tourT);
    if (!touring) return;
    tourT = setTimeout(function () { if (!step(1)) stopTour(); }, 6800);
  }
  function setTouring(on) {
    touring = on;
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.setAttribute("aria-label", on ? "Hentikan tur otomatis" : "Putar tur otomatis");
    playBtn.querySelector(".dock__ico").textContent = on ? "❚❚" : "▶";
    playBtn.querySelector(".dock__lbl").textContent = on ? "Jeda" : "Tur Otomatis";
  }
  function stopTour() { clearTimeout(tourT); if (touring) setTouring(false); }
  function toggleTour() {
    if (touring) { stopTour(); return; }
    var l = list();
    setTouring(true);
    hintEl.classList.remove("show");
    if (l.length && l[l.length - 1].id === current) viewer.loadScene(l[0].id); else scheduleTour();
  }
  playBtn.addEventListener("click", toggleTour);
  $("dock-full").addEventListener("click", function () {
    var st = document.querySelector(".stage");
    if (document.fullscreenElement) document.exitFullscreen();
    else if (st.requestFullscreen) st.requestFullscreen();
  });

  buildRail();

  // ---- Pemuatan foto: ruangan berikutnya diunduh di latar belakang (hemat data bila Data Saver / jaringan lambat) ----
  var warmed = {};
  function slowNet() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || "")));
  }
  function warm(id) {
    var s = byId[id];
    if (!s || warmed[id]) return;
    warmed[id] = true;
    var im = new Image(); im.crossOrigin = "anonymous"; im.decoding = "async"; im.src = s.photo;
  }
  function warmAround(id) {
    if (slowNet()) return;
    var l = typeById[byId[id].type].scenes, i = l.indexOf(byId[id]);
    var order = [l[i + 1], l[i - 1], l[i + 2]];
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 600); };
    order.forEach(function (s, k) { if (s) idle(function () { setTimeout(function () { warm(s.id); }, k * 400); }); });
  }

  // API untuk beranda (home.js)
  window.VS = {
    hasScene: function (id) { return !!byId[id]; },
    enter: function (id) { if (byId[id] && current !== id) viewer.loadScene(id); },
    inSurvey: function () { return !homeOpen(); },
    prefetch: function (id) { if (!slowNet()) warm(id); },
    stopTour: function () { stopTour(); },
    state: function () {
      var t = typeById[curType], sl = (D.home && D.home.slides) || [], cluster = "";
      sl.forEach(function (s) { if (s.enter && s.enter.units && s.enter.units.indexOf(curType) > -1) cluster = s.name; });
      return { unit: t ? t.name : "", cluster: cluster, visited: visited.slice() };
    },
    onEnter: function () {
      stepped = false;
      showHint(window.matchMedia && matchMedia("(hover: hover)").matches ? "Scroll untuk lanjut ke ruangan berikutnya" : "Seret untuk melihat sekeliling · tombol → untuk lanjut");
    }
  };
  $("brand").addEventListener("click", function () { stopTour(); hintEl.classList.remove("show"); closePanel(); if (window.VS.showHome) window.VS.showHome(); });

  // Panel mobile
  var panel = $("panel");
  var toggle = $("panel-toggle");
  var small = window.matchMedia && matchMedia("(max-width: 820px)").matches;
  var panelLabel = allFloors.some(function (f) { return f.plan; }) ? (small ? "Denah" : "Denah & Spesifikasi") : (small ? "Info" : "Spesifikasi");
  toggle.textContent = panelLabel;
  function setPanel(open) {
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Tutup" : panelLabel;
  }
  function openPanel() { setPanel(true); }
  function closePanel() { setPanel(false); }
  toggle.addEventListener("click", function () { setPanel(!panel.classList.contains("open")); });
  $("panel-close").addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });
})();
