const fs = require("fs");
const path = process.argv[2] || "data.js";
const s = fs.readFileSync(path, "utf8");
const i = s.indexOf('"story_packs"');
const j = s.indexOf('"factions"', i);
const chunk = s.slice(i, j);
const re = /"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"status":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(chunk))) console.log(m[1] + " | " + m[2] + " | " + m[3]);
const colloq = ["畀", "唔", "嘅", "咗", "嚟", "喺", "啲", "冇"];
let tot = 0;
for (const w of colloq) {
  let n = 0, idx = 0;
  while ((idx = s.indexOf(w, idx)) !== -1) { n++; idx += w.length; }
  console.log(w + ":" + n);
  tot += n;
}
console.log("colloq_sum=" + tot);
