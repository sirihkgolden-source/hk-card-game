/**
 * t384d：修最後三處「預設玩家動作」的旁白。
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const nodeOf = (id) => d.events.find((e) => e.id === id);

const FIX = [
  ["EV_CRXJ_04B", "（你接過碗，湯好燙）", "（一碗湯放咗喺你面前。湯好燙）"],
  ["EV_SDN_03B", "（你幫佢包紮。佢冇再拒絕）", "（紗布擺咗喺膠凳上。佢冇叫你，亦都冇叫你走）"],
  ["EV_NMW_05", "（你接過毛筆，手有啲震）", "（毛筆擺喺圍板上面，等緊人接）"],
];

let changed = 0;
FIX.forEach(([id, from, to]) => {
  const n = nodeOf(id);
  const hit = (n.dialogue || []).find((x) => x.text === from);
  if (!hit) { console.warn("not found:", id, from); return; }
  hit.text = to;
  changed++;
  console.log(`  ${id}：${to}`);
});

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log(`\n改動 ${changed} 處`);
