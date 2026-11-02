const fs = require("fs");
const s = fs.readFileSync(process.argv[2] || "data.js", "utf8");
const i = s.indexOf('"story_packs"');
const j = s.indexOf('"factions"', i);
const chunk = s.slice(i, j);
// top-level pack objects: look for "id" then nearby "name","status","cover"
const packs = [];
const re = /\{\s*"id":\s*"([^"]+)"\s*,\s*"name":\s*"([^"]+)"\s*,\s*"blurb":\s*"([^"]*)"\s*,\s*"cover":\s*"([^"]+)"\s*,\s*"status":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(chunk))) packs.push({ id: m[1], name: m[2], status: m[5], cover: m[4] });
console.log("pack_count=" + packs.length);
packs.forEach((p) => console.log(p.id + " | " + p.name + " | " + p.status + " | " + p.cover));
