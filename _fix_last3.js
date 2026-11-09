/** t384e：清掉剩餘 3 處場所／動作不一致 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const nodeOf = (id) => d.events.find((e) => e.id === id);
let changed = 0;

/* 1) 寫字樓第 4 步「貨源」改「客源」（寫字樓唔係買貨） */
const v4 = nodeOf("EV_OF_04").track_variants.office;
v4.dialogue = v4.dialogue.map((x) => {
  if (x.text.includes("但你冇貨源，冇車，冇單")) {
    changed++;
    return { speaker: x.speaker, text: "（但你冇報價權，冇車，冇公司個名可以用）" };
  }
  return x;
});
nodeOf("EV_OF_04").dialogue = v4.dialogue;

/* 2) 第 8 步「公司」→「嗰間廠」（通用，任何職種都通） */
const n8 = nodeOf("EV_OF_08");
n8.dialogue = n8.dialogue.map((x) => {
  if (x.text.includes("嗰間公司")) { changed++; return { speaker: x.speaker, text: "（你查過，嗰間廠冇咩生意）" }; }
  return x;
});
/* 選擇「繼續做自己嘢」保持不變 */

/* 3) 城寨第 5 步「你放慢腳步」→ 中性 */
const nk = nodeOf("EV_KLW_03B");
nk.dialogue = nk.dialogue.map((x) => {
  if (x.text === "（你放慢腳步，巷尾嗰幅牆仲喺度）") {
    changed++;
    return { speaker: x.speaker, text: "（巷尾嗰幅牆，一路都喺度）" };
  }
  return x;
});

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log("改動", changed, "處");
