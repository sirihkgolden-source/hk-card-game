/**
 * 修正 EV_OF_06 的 tea / deal 變體：dialogue 誤寫成 [speaker, text] 陣列，
 * 令 eventDialogueHtml 讀不到 d.speaker / d.text → 畫面出現 10 個空白 <p>。
 * 統一轉回 { speaker, text } 物件。
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const n = d.events.find((e) => e.id === "EV_OF_06");

let fixed = 0;
["office", "tea", "deal"].forEach((tk) => {
  const v = n.track_variants[tk];
  v.dialogue = (v.dialogue || []).map((x) => {
    if (Array.isArray(x)) {
      fixed++;
      return { speaker: x[0], text: x[1] };
    }
    return x;
  });
  // 驗證
  const bad = v.dialogue.filter((x) => !x || typeof x.speaker !== "string" || typeof x.text !== "string");
  if (bad.length) throw new Error(`${tk} 仍有 ${bad.length} 筆格式錯誤`);
});
n.dialogue = n.track_variants.office.dialogue;

/* 全專案掃描：任何 track_variants 的 dialogue 都必須係物件 */
let others = 0;
d.events.forEach((e) => {
  if (!e.track_variants) return;
  Object.keys(e.track_variants).forEach((tk) => {
    const v = e.track_variants[tk];
    (v.dialogue || []).forEach((x) => {
      if (Array.isArray(x) || typeof x !== "object" || typeof x.speaker !== "string" || typeof x.text !== "string") {
        others++;
        console.log(`  ⚠ ${e.id}/${tk} 格式異常：${JSON.stringify(x)}`);
      }
    });
  });
});

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log(`修正 ${fixed} 筆｜其他異常 ${others} 筆`);
console.log("tea 第 1 句：", JSON.stringify(n.track_variants.tea.dialogue[0]));
