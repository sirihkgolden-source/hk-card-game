const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => resolve({ status: res.statusCode, body: data, len: Buffer.byteLength(data) }));
    }).on("error", reject);
  });
}

(async () => {
  const base = "https://sirihkgolden-source.github.io/hk-card-game/";
  const cb = Date.now();

  const idx = await get(base + "index.html?cb=" + cb);
  const ver = (idx.body.match(/app\.js\?v=([\w\-]+)/) || [])[1];
  console.log("=== 線上 index.html ===");
  console.log("  版本號:", ver);

  const app = await get(base + "app.js?cb=" + cb);
  console.log("\n=== 線上 app.js ===");
  console.log("  大小:", app.len, "bytes");

  const checks = {
    "t373 打工仔重寫（影印機）": /影印機/.test(app.body),
    "t373 打工仔 10 步": /最後一個月/.test(app.body),
    "t374 種子補 default_team": /Math\.max\(1, next\[id\] \| 0\)/.test(app.body),
    "t374 prune 空隊保險": /if \(!state\.team\.length\) \{/.test(app.body),
    "t375 alreadyFinished": /alreadyFinished/.test(app.body),
    "t375 寫 office_ending flag": /office_ending_" \+ fin\.routeKey/.test(app.body),
    "t375 宿敵池過濾": /special_battle" && !eventExcludedFromYearPool/.test(app.body),
    "t369 tale 引擎": /taleResolveEnding/.test(app.body),
    "t371 換卡保護": /tradeWouldLeaveNoFighter/.test(app.body),
  };
  Object.keys(checks).forEach((k) => console.log("  " + (checks[k] ? "✓" : "✗") + " " + k));

  const data = await get(base + "data.js?cb=" + cb);
  console.log("\n=== 線上 data.js ===");
  console.log("  大小:", data.len, "bytes");
  const dchecks = {
    "tale 節點 EV_CRXJ_01": /EV_CRXJ_01/.test(data.body),
    "8 步故事包": /"tale_chain"/.test(data.body),
    "打工仔新節點（影印機旁的那個人）": /影印機旁的那個人/.test(data.body),
  };
  Object.keys(dchecks).forEach((k) => console.log("  " + (dchecks[k] ? "✓" : "✗") + " " + k));

  const allOk = Object.values(checks).every(Boolean) && Object.values(dchecks).every(Boolean);
  console.log("\n" + (allOk ? "✅ 全部修正已在線上" : "⚠️ 部分項目未上線"));
})();
