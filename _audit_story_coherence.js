/**
 * 故事一致性審計（t384 更新版，支援 track_variants）
 *
 * A. office 包：逐職種模擬走完 10 步，檢查每步內文場所是否同職種一致
 * B. tale 包：desc / 對白有冇預設玩家行為
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));

const PLACE = {
  office: /寫字樓|公司|老闆|主管|影印|辦公室|同事|部門|報銷|總部/,
  tea: /茶記|茶餐廳|伙記|樓面|水吧|廚房|卡位|到會|奶茶|大牌檔/,
  deal: /親戚|買賣|入貨|貨倉|貨源|供應商|批發|訂單|送貨/,
};
const LABEL = { office: "寫字樓", tea: "茶記", deal: "親戚買賣" };

console.log("========== A. office 包：逐職種檢查每步場所 ==========");
const pack = d.story_packs.find((p) => p.id === "office_ballad");
const chain = pack.office_chain.map((id) => d.events.find((e) => e.id === id));

let problems = 0;
["office", "tea", "deal"].forEach((track) => {
  console.log(`\n  ── ${LABEL[track]} ──`);
  chain.forEach((raw, i) => {
    // 第 1 步本來就要列出三個工種（玩家喺呢步揀），唔算矛盾
    if (i === 0) {
      console.log(`    ✅ 第 1 步「${raw.name}」（三選一：寫字樓／茶記／親戚買賣）`);
      return;
    }
    const v = raw.track_variants ? raw.track_variants[track] : null;
    const name = (v && v.name) || raw.name;
    const desc = (v && v.desc) || raw.desc;
    const dlg = (v && v.dialogue) || raw.dialogue || [];
    const hay = `${name} ${desc} ${dlg.map((x) => x.text).join(" ")}`;

    const own = PLACE[track].test(hay);
    const wrong = Object.keys(PLACE).filter((k) => k !== track && PLACE[k].test(hay));
    const tag = i === 0 ? "（第 1 步，三選一）" : (v ? "" : "（通用）");
    if (wrong.length) {
      problems++;
      console.log(`    ❌ 第 ${i + 1} 步「${name}」出現別個職種：${wrong.join("/")}${tag}`);
      wrong.forEach((k) => {
        const m = hay.match(PLACE[k]);
        console.log(`       命中「${m[0]}」`);
      });
    } else {
      console.log(`    ✅ 第 ${i + 1} 步「${name}」${own ? "（同職種一致）" : ""}${tag}`);
    }
  });
});

console.log("\n========== B. tale 包：desc 有冇預設玩家行為 ==========");
const FORCE = /^你(幫|遞|叫|拉|救|擋|拆|接|寫|讀|包|扶|推|交|放|塞)/;
let forced = 0;
["chu_ru_xiang_jiang", "kowloon_walled_ch1", "fung_kau_mei_lok", "shou_dai_nv_xia", "neon_mei_wan"].forEach((pid) => {
  const p = d.story_packs.find((x) => x.id === pid);
  const ns = p.tale_chain.map((id) => d.events.find((e) => e.id === id));
  let n = 0;
  ns.forEach((node, i) => {
    String(node.desc || "").split(/(?<=[。])/).forEach((s) => {
      if (FORCE.test(s.trim())) { n++; forced++; console.log(`    ⚠ ${p.name} 第 ${i + 1} 步：${s.trim()}`); }
    });
    (node.dialogue || []).forEach((x) => {
      if (x.speaker === "你" && FORCE.test(x.text.replace(/^（/, ""))) { n++; forced++; console.log(`    ⚠ ${p.name} 第 ${i + 1} 步對白：${x.text}`); }
    });
  });
  console.log(`  ${p.name}：${n === 0 ? "✅ 無" : n + " 處"}`);
});

console.log("\n========== C. 選擇文字有冇預設上一步已做某事 ==========");
let assumed = 0;
["chu_ru_xiang_jiang", "kowloon_walled_ch1", "fung_kau_mei_lok", "shou_dai_nv_xia", "neon_mei_wan"].forEach((pid) => {
  const p = d.story_packs.find((x) => x.id === pid);
  p.tale_chain.forEach((id, i) => {
    if (i === 0) return;
    const node = d.events.find((e) => e.id === id);
    (node.tale_choices || []).forEach((c) => {
      if (/^(包完|打完|講完|寫完|讀完)/.test(String(c.text))) {
        assumed++; console.log(`    ⚠ ${p.name} 第 ${i + 1} 步選擇：「${c.text}」`);
      }
    });
  });
});

console.log(`\n總結：office 場所矛盾 ${problems} 處｜tale 預設行為 ${forced} 處｜選擇預設動作 ${assumed} 處`);
if (problems || forced || assumed) process.exit(1);
console.log("✅ 全部通過");
