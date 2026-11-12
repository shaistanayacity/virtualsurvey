(function () {
  "use strict";
  var D = window.SURVEY, $ = function (id) { return document.getElementById(id); };
  var byId = {}, floorById = {};
  D.scenes.forEach(function (s) { byId[s.id] = s; });
  D.floors.forEach(function (f) { floorById[f.id] = f; });
  $("unit-name").textContent = D.unit;
  document.title = D.title + " — " + D.unit;

  // Pannellum multi-scene config dari data.js
  var scenes = {};
  D.scenes.forEach(function (s) {
    var fov = s.fov || 360, partial = fov < 360;
    var haov = fov, vaov = partial ? fov * s.h / s.w : 180;
    var cfg = {
      type: "equirectangular", panorama: s.photo, yaw: s.yaw || 0, pitch: s.pitch || 0, hfov: partial ? fov : 100,
      autoRotate: partial ? 0 : -2,
      hotSpots: (s.hotspots || []).map(function (h) {
        var yaw = h.yaw, pitch = h.pitch || 0;
        if (h.x != null) { yaw = (h.x / 100 - 0.5) * haov; pitch = (0.5 - h.y / 100) * vaov; }
        return { type: "scene", sceneId: h.to, yaw: yaw, pitch: pitch, text: h.label };
      })
    };
    if (partial) { cfg.haov = haov; cfg.vaov = vaov; cfg.vOffset = 0; cfg.minHfov = 30; cfg.maxHfov = fov; }
    scenes[s.id] = cfg;
  });
  var startId = (location.hash.slice(1) in byId) ? location.hash.slice(1) : D.scenes[0].id;
  var viewer = pannellum.viewer("pano", {
    default: { firstScene: startId, autoLoad: true, showControls: false, compass: false, autoRotateInactivityDelay: 4000, sceneFadeDuration: 900 },
    scenes: scenes
  });

  var current = null, shownFloor = null;

  // Foto biasa: batasi zoom-out supaya tepi foto tidak terbuka (pita hitam), terutama di layar portrait.
  function fitView() {
    var sc = current && byId[current];
    if (!sc || !sc.fov || sc.fov >= 360) return;
    var box = $("pano"), a = box.clientWidth / Math.max(1, box.clientHeight);
    var vaov = sc.fov * sc.h / sc.w, rad = Math.PI / 180;
    var maxH = Math.min(sc.fov, 2 * Math.atan(Math.tan(vaov / 2 * rad) * a) / rad);
    var minH = Math.min(30, maxH);
    viewer.setHfovBounds([minH, maxH]);
    if (viewer.getHfov() > maxH) viewer.setHfov(maxH, false);
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

  // Tab lantai: klik lantai -> tampil denah + spesifikasi, lalu loncat ke scene pertama lantai itu.
  var floorsEl = $("floors"), navEl = $("floors-nav");
  D.floors.forEach(function (f) {
    var b = el("button", { type: "button", role: "tab", "data-floor": f.id }, f.label);
    b.addEventListener("click", function () {
      showFloor(f.id);
      var first = D.scenes.filter(function (s) { return s.floor === f.id; })[0];
      if (first && (!current || byId[current].floor !== f.id)) viewer.loadScene(first.id);
    });
    floorsEl.appendChild(b);
    var n = el("button", { type: "button", "data-floor": f.id }, f.label);
    n.addEventListener("click", function () { b.click(); openPanel(); });
    navEl.appendChild(n);
  });
  fillSpecs($("summary"), D.summary || []);
  if (D.floors.length < 2) { floorsEl.hidden = true; navEl.hidden = true; }

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
    if (f.plan) { $("plan-img").src = f.plan; $("plan-img").alt = "Denah " + f.label; }
    $("floor-name").textContent = f.label + (f.area ? " · " + f.area : "");
    fillSpecs($("specs"), f.specs || []);
    var dots = $("plan-dots"), rooms = $("rooms");
    dots.textContent = ""; rooms.textContent = "";
    D.scenes.filter(function (s) { return s.floor === id; }).forEach(function (s) {
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
    var i = D.scenes.indexOf(byId[id]);
    $("count-cur").textContent = pad(i + 1);
    $("count-all").textContent = "/" + pad(D.scenes.length);
    heroEl.classList.remove("show");
    clearTimeout(heroTimer);
    heroTimer = setTimeout(function () {
      heroEl.textContent = byId[id].title;
      heroEl.classList.add("show");
    }, 250);
  }
  viewer.on("scenechange", function (id) {
    current = id;
    fitView();
    announce(id);
    if (shownFloor !== byId[id].floor) showFloor(byId[id].floor); else markCurrent();
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  });
  viewer.on("load", function () {
    if (!current) { current = viewer.getScene(); announce(current); showFloor(byId[current].floor); }
    fitView();
  });

  // Panel mobile
  var panel = $("panel");
  var toggle = $("panel-toggle");
  function setPanel(open) {
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Tutup" : "Denah";
  }
  function openPanel() { setPanel(true); }
  function closePanel() { setPanel(false); }
  toggle.addEventListener("click", function () { setPanel(!panel.classList.contains("open")); });
  $("panel-close").addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });
})();
