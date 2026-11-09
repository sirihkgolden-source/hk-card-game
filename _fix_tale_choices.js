/**
 * t384c：修「選擇文字預設咗玩家行為」。
 *
 * 手袋三夜第 5 步：三個選項全部以「包完」開頭，
 * 但上一步玩家可能揀咗「由得佢哋打，你企埋一邊」→ 冇包過手。
 *
 * 霓虹未完第 3 步：選項「唔問，繼續幫手」預設玩家已經喺上面幫手。
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const nodeOf = (id) => d.events.find((e) => e.id === id);

let changed = 0;
function setChoiceText(id, idx, text) {
  const n = nodeOf(id);
  const c = n.tale_choices[idx];
  if (!c) throw new Error(`${id}[${idx}] missing`);
  if (c.text === text) return;
  c.text = text;
  changed++;
  console.log(`  ${id}[${idx}] 「${text}」`);
}

console.log("【手袋三夜】第 5 步：唔再預設已經包過手");
setChoiceText("EV_SDN_03B", 0, "過去幫佢包手，順便問佢為咩要打");
setChoiceText("EV_SDN_03B", 1, "過去幫佢包手，包完就走");
setChoiceText("EV_SDN_03B", 2, "唔包手，叫佢去自首");

console.log("【霓虹未完】第 3 步：唔預設已經喺上面幫手");
setChoiceText("EV_NMW_02B", 0, "話：我想學");
setChoiceText("EV_NMW_02B", 1, "問佢相裡面係邊個");
setChoiceText("EV_NMW_02B", 2, "唔問，靜靜企喺旁邊睇");

console.log("【初入香江】第 5 步：唔預設「加班」（三個工種都通，但講明係收夜）");
const c5 = nodeOf("EV_CRXJ_03C");
if (!c5.desc.includes("收夜")) {
  c5.desc = "收夜已經係凌晨三點。你行返屋企，條街只剩霓虹燈同清潔工人。有個阿婆蹲喺騎樓底執紙皮。";
  changed++;
  console.log("  EV_CRXJ_03C desc ← 收夜…");
}
/* 選項「唔幫，趕住返屋企」→ 改成「唔幫，繼續行」 */
setChoiceText("EV_CRXJ_03C", 2, "唔幫，繼續行");

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log(`\n改動 ${changed} 處`);
