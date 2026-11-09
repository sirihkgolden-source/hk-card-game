/** 補回一句對白，維持打工仔輓歌每步 ≥10 句的密度（t373 內容量守衛） */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const pack = d.story_packs.find((p) => p.id === "office_ballad");
const nodeOf = (id) => d.events.find((e) => e.id === id);

/* EV_OF_02 三個變體各補一句「老前輩的警告細節」 */
const ADD = {
  office: ["隔籬位阿姐", "打好咗，你就係佢嘅人。唔打，你就係冇用嘅人。"],
  tea: ["水吧阿姐", "呢間舖做咗四十年，靠嘅唔係手勢，係冇人記得我做過咩。"],
  deal: ["送貨", "我第一次袋住嗰筆錢，行到街口就拐咗入巷，數咗三次。"],
};
const n2 = nodeOf("EV_OF_02");
Object.entries(ADD).forEach(([tk, [speaker, text]]) => {
  const v = n2.track_variants[tk];
  const idx = v.dialogue.findIndex((x) => x.speaker === "隔籬位阿姐" || x.speaker === "水吧阿姐" || x.speaker === "送貨");
  v.dialogue.splice(idx + 1, 0, { speaker, text });
});
n2.dialogue = n2.track_variants.office.dialogue;

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");

let total = 0, chars = 0;
pack.office_chain.forEach((id) => {
  const n = nodeOf(id);
  const dlg = n.dialogue || [];
  const c = dlg.map((x) => x.text || "").join("").length;
  total += dlg.length; chars += c;
  console.log(`${id}: ${dlg.length} 句 / ${c} 字`);
});
console.log(`合計 ${total} 句 / ${chars} 字`);
