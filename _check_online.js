const https = require("https");
function get(u) {
  return new Promise((res, rej) => {
    https.get(u, (r) => { let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => res({ s: r.statusCode, b: d, len: Buffer.byteLength(d) })); }).on("error", rej);
  });
}
(async () => {
  const base = "https://sirihkgolden-source.github.io/hk-card-game/";
  const cb = Date.now();
  const idx = await get(base + "index.html?cb=" + cb);
  const ver = (idx.b.match(/app\.js\?v=([\w\-]+)/) || [])[1];
  console.log("=== 線上 index.html ===");
  console.log("  版本:", ver);

  const data = await get(base + "data.js?cb=" + cb);
  console.log("\n=== 線上 data.js ===");
  console.log("  大小:", data.len, "bytes");
  const hasPack = data.b.indexOf("office_ballad") >= 0;
  const hasName = data.b.indexOf("打工仔輓歌") >= 0;
  const hasTale = data.b.indexOf("tale_chain") >= 0;
  console.log("  含 office_ballad:", hasPack);
  console.log("  含「打工仔輓歌」:", hasName);
  console.log("  含 tale_chain:", hasTale);

  if (hasPack) {
    const i = data.b.indexOf('"id": "office_ballad"');
    console.log("\n  office_ballad 定義片段:");
    console.log("  " + data.b.slice(i, i + 380).replace(/\s+/g, " "));
  }

  // 列出所有 story pack id + status
  const ids = [...data.b.matchAll(/"id": "([a-z_]+)",\s*\n\s*"name": "([^"]+)"/g)].map((m) => m[1] + " | " + m[2]);
  const packIds = ["chu_ru_xiang_jiang", "kowloon_walled_ch1", "fung_kau_mei_lok", "shou_dai_nv_xia", "neon_mei_wan", "office_ballad"];
  console.log("\n=== 六個故事包是否存在 ===");
  packIds.forEach((p) => console.log("  " + (data.b.indexOf('"' + p + '"') >= 0 ? "✓" : "✗") + " " + p));

  // 檢查 story_packs 區塊
  const si = data.b.indexOf('"story_packs"');
  if (si >= 0) {
    console.log("\n=== story_packs 區塊前 700 字 ===");
    console.log(data.b.slice(si, si + 700).replace(/\s+/g, " "));
  }
})();
