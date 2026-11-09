/** deal 版用「伙計」代替「伙記」（伙記屬茶記用語，避免語感混淆） */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const n = d.events.find((e) => e.id === "EV_OF_06");
let c = 0;
["deal"].forEach((tk) => {
  n.track_variants[tk].dialogue.forEach((x) => {
    if (x.text.includes("伙記")) { x.text = x.text.replace(/伙記/g, "伙計"); c++; }
  });
  if (n.track_variants[tk].desc.includes("伙記")) {
    n.track_variants[tk].desc = n.track_variants[tk].desc.replace(/伙記/g, "伙計");
    c++;
  }
});
/* 第 5 步 deal 版亦檢查 */
const n5 = d.events.find((e) => e.id === "EV_OF_05");
if (n5 && n5.track_variants && n5.track_variants.deal) {
  n5.track_variants.deal.dialogue.forEach((x) => {
    if (x.text.includes("伙記")) { x.text = x.text.replace(/伙記/g, "伙計"); c++; }
  });
}
const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log("改", c, "處");
