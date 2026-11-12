(function () {
  "use strict";
  var D = window.SURVEY, L = D && D.lead, VS = window.VS, stage = document.querySelector(".stage");
  if (!L || !L.whatsapp || !VS || !VS.state || !stage) return;   // nonaktif bila nomor admin kosong

  var EVERY = L.everySeconds || 120, KEY = "vs_lead_v1";
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  if (read()) return;                                           // sudah mengisi: tidak ditanya lagi

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ---- UI ----
  var overlay = el("div", "lead"), card = el("form", "lead__card");
  overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true"); overlay.setAttribute("aria-labelledby", "lead-title");
  card.noValidate = true;
  var eyebrow = el("p", "lead__eyebrow", "Tertarik?"), title = el("h2", "lead__title"), lead = el("p", "lead__lead",
    "Isi data Anda dan tim kami akan menghubungi lewat WhatsApp dengan info unit, harga, dan simulasi.");
  title.id = "lead-title";
  var lName = el("label", null, "Nama"), iName = el("input"), lPhone = el("label", null, "Nomor WhatsApp"), iPhone = el("input");
  iName.type = "text"; iName.name = "name"; iName.autocomplete = "name"; iName.placeholder = "Nama lengkap"; iName.maxLength = 60;
  iPhone.type = "tel"; iPhone.name = "phone"; iPhone.autocomplete = "tel"; iPhone.inputMode = "tel"; iPhone.placeholder = "08xx xxxx xxxx"; iPhone.maxLength = 20;
  lName.appendChild(iName); lPhone.appendChild(iPhone);
  var err = el("p", "lead__err"); err.setAttribute("role", "alert");
  var go = el("button", "lead__go", "Hubungi via WhatsApp  →"); go.type = "submit";
  var later = el("button", "lead__later", "Nanti saja"); later.type = "button";
  var note = el("p", "lead__note", "Dengan mengirim, Anda setuju dihubungi tim kami lewat WhatsApp. Data hanya dipakai untuk keperluan informasi unit.");
  [eyebrow, title, lead, lName, lPhone, err, go, later, note].forEach(function (n) { card.appendChild(n); });
  overlay.appendChild(card); stage.appendChild(overlay);
  var thanks = el("p", "lead__thanks"); thanks.setAttribute("role", "status"); stage.appendChild(thanks);

  // ---- Timer: hanya berjalan saat pengunjung di dalam tour, tab aktif, dan pop-up tertutup ----
  var active = 0, total = 0, isOpen = false, timer;
  timer = setInterval(function () {
    if (isOpen || document.hidden || !VS.inSurvey()) return;
    active++; total++;
    if (active >= EVERY) show();
  }, 1000);

  function show() {
    isOpen = true; active = 0;
    try { VS.stopTour(); } catch (e) {}
    title.textContent = "Suka dengan " + (VS.state().unit || "unit ini") + "?";
    err.textContent = ""; iName.removeAttribute("aria-invalid"); iPhone.removeAttribute("aria-invalid");
    overlay.classList.add("open");
    setTimeout(function () { (iName.value ? iPhone : iName).focus(); }, 380);
  }
  function hide() { isOpen = false; active = 0; overlay.classList.remove("open"); }
  later.addEventListener("click", hide);
  overlay.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); hide(); } });
  overlay.addEventListener("pointerdown", function (e) { if (e.target === overlay) hide(); });

  // ---- Kirim ----
  function normPhone(v) {
    var d = String(v).replace(/\D/g, "");
    if (d.indexOf("0") === 0) d = "62" + d.slice(1);
    else if (d.indexOf("8") === 0) d = "62" + d;
    return d;
  }
  function message(name, phone) {
    var s = VS.state(), mins = Math.max(1, Math.round(total / 60)), byUnit = {}, order = [];
    s.visited.forEach(function (v) { if (!byUnit[v.unit]) { byUnit[v.unit] = []; order.push(v.unit); } byUnit[v.unit].push(v.title); });
    var rooms = order.map(function (u) { return "• " + u + ": " + byUnit[u].join(", "); }).join("\n");
    return "Halo Admin " + (D.home && D.home.brand ? D.home.brand : "") + ", saya " + name + " (+" + phone + ").\n" +
      "Saya sedang melihat virtual survey *" + s.unit + "*" + (s.cluster ? " (cluster " + s.cluster + ")" : "") + ".\n" +
      "Ruangan yang sudah saya lihat:\n" + rooms + "\n" +
      "Lama melihat: ±" + mins + " menit.\n" +
      "Saya tertarik, mohon info lebih lanjut. Terima kasih.";
  }
  card.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = iName.value.trim().replace(/\s+/g, " "), phone = normPhone(iPhone.value), bad = null;
    iName.removeAttribute("aria-invalid"); iPhone.removeAttribute("aria-invalid");
    if (name.length < 2) bad = iName;
    else if (phone.length < 9 || phone.length > 15) bad = iPhone;
    if (bad) {
      bad.setAttribute("aria-invalid", "true"); bad.focus();
      err.textContent = bad === iName ? "Mohon isi nama Anda." : "Nomor WhatsApp belum benar. Contoh: 0812 3456 7890.";
      return;
    }
    var url = "https://wa.me/" + String(L.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(message(name, phone));
    write(JSON.stringify({ name: name, phone: phone, at: Date.now() }));
    clearInterval(timer);                                       // sudah mengisi: berhenti total
    hide();
    thanks.textContent = "Terima kasih, " + name.split(" ")[0] + "! WhatsApp akan terbuka. Tinggal tekan kirim.";
    thanks.classList.add("show"); setTimeout(function () { thanks.classList.remove("show"); }, 5500);
    var w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (er) {} } else window.location.href = url;   // pop-up diblokir: buka di tab ini
  });
})();
