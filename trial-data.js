/* Halaman uji foto 360° (tidak ditautkan dari mana pun, noindex). Hapus trial.html, trial-data.js, dan photos/trial-360.webp bila tidak dipakai lagi. */
window.SURVEY = {
  title: "Trial 360°",
  types: [
    { id: "trial", name: "Trial 360", unit: "Trial 360", summary: [], floors: [{ id: "tr", label: "Ruang", plan: null }],
      scenes: [
        { id: "trial-360", floor: "tr", title: "Trial 360°", photo: "photos/trial-360.webp", yaw: 0,
          hotspots: [{ info: { title: "Titik info", text: "Contoh hotspot pada foto 360°." }, yaw: 20, pitch: -5 }] }
      ] }
  ]
};
