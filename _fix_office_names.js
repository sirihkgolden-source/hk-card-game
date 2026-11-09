/** 為職種變體補上合適的節點名稱（原本名稱帶場所：影印機／茶記） */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const pack = d.story_packs.find((p) => p.id === "office_ballad");
const nodeOf = (id) => d.events.find((e) => e.id === id);

const NAMES = {
  EV_OF_02: { office: "影印機旁的那個人", tea: "水吧阿姐", deal: "貨倉門口那個送貨" },
  EV_OF_03: { office: "對唔上的報銷單", tea: "茶記的數簿", deal: "數簿", },
  EV_OF_04: { office: "私下接單", tea: "四十人到會", deal: "第一單生意" },
  EV_OF_05: { office: "升職還是跳槽", tea: "頂唔頂間舖", deal: "三成股份" },
  EV_OF_06: { office: "控制成本", tea: "租約到期", deal: "租約到期" },
};

Object.entries(NAMES).forEach(([id, per]) => {
  const n = nodeOf(id);
  if (!n || !n.track_variants) throw new Error("no variants " + id);
  Object.entries(per).forEach(([tk, name]) => {
    if (!n.track_variants[tk]) throw new Error(`no ${id}/${tk}`);
    n.track_variants[tk].name = name;
  });
  n.name = n.track_variants.office.name;
});

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");

Object.keys(NAMES).forEach((id) => {
  const n = nodeOf(id);
  const names = Object.entries(n.track_variants).map(([k, v]) => `${k}:${v.name}`);
  console.log(id, names.join(" | "));
});
