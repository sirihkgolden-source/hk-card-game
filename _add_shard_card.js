/**
 * t391：殘頁專屬戰鬥卡 —— C254「籠鬥之王」
 *
 * 總導演提供插畫：鐵籠擂台、勝利者、紅龍霓虹、倒下對手。
 * 定位：**殘頁專屬**（只能靠 10 張殘頁兌換，唔會喺扭蛋／店鋪／事件掉落）
 * 稀有度：最高級
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

/* 1) 圖片：複製到 assets/fighters/C254.jpg */
const SRC = "C:/Users/dinoy/.cursor/projects/c-Users-dinoy-CardGame-demo-lite/assets/hk_manhua_underground_cage_fighter_victory_card-8eb66f05-bede-4e00-bafc-3530b48034b6.jpg";
const DEST = path.join(ROOT, "assets/fighters/C254.jpg");
if (!fs.existsSync(SRC)) throw new Error("找不到插畫檔");
fs.copyFileSync(SRC, DEST);
console.log("已複製插畫 → assets/fighters/C254.jpg (" + Math.round(fs.statSync(DEST).size / 1024) + "KB)");

/* 2) 新增技能 S73「鐵籠終局」 */
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));

const SKILL_ID = "S73";
if (!(d.skills || []).some((s) => s.id === SKILL_ID)) {
  d.skills.push({
    id: SKILL_ID,
    name: "鐵籠終局",
    tag: "城寨",
    tags: ["城寨"],
    cd: 5,
    effect: "對血量最低敵 攻×2.3；若擊殺，本場我方 攻＋12%（最後一個站起嘅人）",
    kind: "招式",
    blurb: "最後一個站起嘅人",
    art: "assets/fighters/C254.jpg",
    dmg_mult: 2.3,
    hits: 1,
    target: "lowest",
    power: "phys",
    rarity: "最高級"
  });
  console.log("已新增技能 S73「鐵籠終局」");
} else {
  console.log("技能 S73 已存在，跳過");
}

/* 3) 新增戰鬥卡 C254「籠鬥之王」 */
const CARD_ID = "C254";
if (!(d.fighters || []).some((f) => f.id === CARD_ID)) {
  d.fighters.push({
    id: CARD_ID,
    name: "籠鬥之王",
    rarity: "最高級",
    slots: 7,
    tags: ["城寨"],
    atk: 19,
    spd: 13,
    basic: "籠邊肘擊",
    skill: "鐵籠終局",
    skill_cd: 5,
    art: "assets/fighters/C254.jpg",
    tod: "鐵籠夜戰",
    flavor: "鐵絲網圍住半個城寨。你數過，今晚第七個倒下嘅人仲喺度喘氣——但你已經唔記得自己流緊邊個嘅血。",
    blurb: "最後一個站起嘅人",
    skill_effect: "對血量最低敵 攻×2.3；若擊殺，本場我方 攻＋12%（最後一個站起嘅人）",
    rarity_slang: "鎮場王牌",
    dmg_mult: 2.3,
    hits: 1,
    target: "lowest",
    power: "phys",
    /** t391：只可由殘頁兌換，唔入扭蛋／店鋪／事件池 */
    shard_only: true
  });
  console.log("已新增戰鬥卡 C254「籠鬥之王」");
} else {
  console.log("戰鬥卡 C254 已存在，跳過");
}

/* 4) 殘頁清單改為 C254（單一專屬卡） */
d.shard_rewards = {
  need: 10,
  pool: [CARD_ID],
  note: "戰鬥卡殘頁 ×10 可換「籠鬥之王」（殘頁專屬卡）"
};
console.log("已設定 shard_rewards.pool =", JSON.stringify(d.shard_rewards.pool));

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");

console.log("\nfighters:", d.fighters.length, "｜skills:", d.skills.length);
