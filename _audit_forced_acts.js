/**
 * 第二輪：檢查每一步 desc 有冇假設「上一步你幫咗／做咗某事」。
 * 做法：列出所有 desc 中以「你」開頭的句子 + 上一步全部 outcome，人工對照。
 */
const fs = require("fs");
const path = require("path");
const d = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));

const packs = ["chu_ru_xiang_jiang", "kowloon_walled_ch1", "fung_kau_mei_lok", "shou_dai_nv_xia", "neon_mei_wan"];
let issues = 0;

packs.forEach((pid) => {
  const p = d.story_packs.find((x) => x.id === pid);
  const ns = p.tale_chain.map((id) => d.events.find((e) => e.id === id));
  ns.forEach((n, i) => {
    const sents = String(n.desc || "").split(/(?<=[。])/).map((s) => s.trim()).filter(Boolean);
    const youSents = sents.filter((s) => /^你/.test(s));
    youSents.forEach((s) => {
      // 中性動詞（企／行過／望）可以接受；「幫／遞／叫／拉／救」屬主動介入，需要檢查
      if (/^你(幫|遞|叫|拉|救|擋|拆|接|寫|讀|包|扶|推|擋|交)/.test(s)) {
        issues++;
        console.log(`⚠ ${p.name} 第 ${i + 1} 步 ${n.id}：${s}`);
        if (i > 0) {
          const prev = ns[i - 1];
          console.log(`   上一步可選：`);
          (prev.tale_choices || []).forEach((c, j) => console.log(`     [${j}] ${c.text}`));
        }
      }
    });
    // 對白中的「你」旁白
    (n.dialogue || []).forEach((x) => {
      if (x.speaker === "你" && /^（?你(幫|遞|叫|拉|救|擋|拆|接|寫|讀|包|扶)/.test(x.text)) {
        issues++;
        console.log(`⚠ ${p.name} 第 ${i + 1} 步對白：${x.text}`);
      }
    });
  });
});
console.log(`\n共 ${issues} 處需要人工覆核`);
