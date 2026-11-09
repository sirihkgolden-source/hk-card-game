/**
 * 調平「打工仔輓歌」五條路線的可達分佈（隨機搜索版）。
 *
 * 約束（保持語意骨架）：
 *   1) 每個選項的「主路線」維持不變（例如「照實講」永遠主 rich）
 *   2) 主路線權重 3–6，次要路線 0–2
 *   3) 五條固定路徑（全 0／全 1／全 2／三組混合）要走出 5 個不同結局
 *   4) 窮舉 59049 條路徑：每個結局 8–32%，最高與最低差距 ≤ 15%
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const ROUTES = ["rich", "biz", "flat", "street", "scam"];

const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const pack = d.story_packs.find((p) => p.id === "office_ballad");
const nodes = pack.office_chain.map((id) => d.events.find((e) => e.id === id));

/** 每個選項的主路線（語意骨幹，唔准改） */
const TOP = nodes.map((n) =>
  n.office_choices.map((c) => {
    let best = ROUTES[0], bv = -Infinity;
    ROUTES.forEach((k) => { const v = (c.delta || {})[k] | 0; if (v > bv) { bv = v; best = k; } });
    return best;
  })
);

let seed = 20261103;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

function randomDelta() {
  const delta = {};
  const top = rnd() < 0.5 ? ri(3, 5) : ri(4, 6);
  delta[TOP_cur] = top;
  // 1–2 個次要路線
  const others = ROUTES.filter((k) => k !== TOP_cur);
  const nSec = rnd() < 0.55 ? 1 : 2;
  for (let i = 0; i < nSec; i++) {
    const k = others.splice(Math.floor(rnd() * others.length), 1)[0];
    const v = ri(1, Math.min(2, top - 1));
    if (v > 0) delta[k] = v;
  }
  return delta;
}

let TOP_cur = null;
function build() {
  return nodes.map((n, i) =>
    n.office_choices.map((c, j) => {
      if (c._delta) return c._delta;
      TOP_cur = TOP[i][j];
      return randomDelta();
    })
  );
}

function enumerate(deltas) {
  const counts = { rich: 0, biz: 0, flat: 0, street: 0, scam: 0 };
  let total = 0;
  (function walk(i, acc) {
    if (i >= nodes.length) {
      let best = ROUTES[0], bv = -Infinity;
      ROUTES.forEach((k) => { if (acc[k] > bv || (acc[k] === bv && ROUTES.indexOf(k) < ROUTES.indexOf(best))) { bv = acc[k]; best = k; } });
      counts[best]++; total++;
      return;
    }
    nodes[i].office_choices.forEach((c, j) => {
      const dl = deltas[i][j];
      const n = {};
      ROUTES.forEach((k) => { n[k] = acc[k] + (dl[k] | 0); });
      walk(i + 1, n);
    });
  })(0, { rich: 0, biz: 0, flat: 0, street: 0, scam: 0 });
  return { counts, total };
}

function fixedPaths(deltas) {
  const sum = (pick) => {
    const r = { rich: 0, biz: 0, flat: 0, street: 0, scam: 0 };
    nodes.forEach((n, step) => {
      const ci = Math.min(pick(step), n.office_choices.length - 1);
      Object.entries(deltas[step][ci]).forEach(([k, v]) => { r[k] += v; });
    });
    return r;
  };
  const win = (r) => {
    let best = ROUTES[0], bv = -Infinity;
    ROUTES.forEach((k) => { if (r[k] > bv) { bv = r[k]; best = k; } });
    return best;
  };
  return [
    win(sum(() => 0)), win(sum(() => 1)), win(sum(() => 2)),
    win(sum((s) => (s % 2 === 0 ? 0 : 1))),
    win(sum((s) => (s % 2 === 0 ? 1 : 2))),
    win(sum((s) => (s % 2 === 0 ? 2 : 0))),
  ];
}

function evaluate(deltas) {
  const { counts, total } = enumerate(deltas);
  const pcts = ROUTES.map((k) => (counts[k] / total) * 100);
  const spread = Math.max(...pcts) - Math.min(...pcts);
  const out = pcts.filter((p) => p < 8 || p > 32).length;
  const fp = new Set(fixedPaths(deltas)).size;
  const ok = spread <= 15 && out === 0 && fp >= 5;
  return { ok, spread, out, fp, pcts, deltas };
}

let best = null;
for (let iter = 0; iter < 4000; iter++) {
  nodes.forEach((n, i) => n.office_choices.forEach((c, j) => { c._delta = null; }));
  TOP_cur = null;
  const deltas = build();
  const r = evaluate(deltas);
  if (!best || r.spread < best.spread || (r.ok && !best.ok)) best = r;
  if (r.ok) { best = r; break; }
}

console.log("結果:", ROUTES.map((k, i) => k + " " + best.pcts[i].toFixed(1) + "%").join("  "));
console.log("差距:", best.spread.toFixed(1) + "%", "| 越界:", best.out, "| 固定路徑不同結局:", best.fp, "| ok:", best.ok);
if (!best.ok) { console.error("FAIL：搵唔到可行解"); process.exit(1); }

/* 寫回 */
nodes.forEach((n, i) => n.office_choices.forEach((c, j) => {
  c.delta = best.deltas[i][j];
  delete c._delta;
}));
const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log("已寫入 data.json / data.js");
