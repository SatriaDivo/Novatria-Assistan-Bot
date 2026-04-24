const prefixes = {
  catat: "CAT",
  todo: "TODO",
  link: "LINK",
  jadwal: "JAD",
  arsip: "ARS",
};

function buatId(type) {
  const prefix = prefixes[type] || "LOG";
  const waktu = Date.now().toString(36).toUpperCase();
  const acak = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${waktu}-${acak}`;
}

module.exports = buatId;
