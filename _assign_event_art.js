/**
 * t380：事件插畫分派（唔生成新圖，用現有 5 張做主題化分配）
 *
 * 問題：只有 5 張事件圖，其中 ev-alley-wake 被用 57 次、ev-yum-cha 31 次，
 * 玩家每兩三個事件就見到同一張巷景，非常出戲。
 *
 * 做法：按事件 category + type + desc 關鍵詞，分配最貼題嘅圖：
 *   - 食肆／茶記／大牌檔／飲品 → ev-yum-cha
 *   - 交通／港鐵／巴士／電車／月台 → ev-mtr-crowd
 *   - 天台／屋頂／棚架 → ev-rooftop-night
 *   - 過期／罐頭／食物／垃圾／執嘢 → ev-expired-can
 *   - 其餘街頭／後巷 → ev-alley-wake（作最後 fallback）
 *
 * 目標：令 ev-alley-wake 佔比由 57/125（46%）降至 30% 以下。
 */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(root, "data.json"), "utf8"));

const IMG = {
  alley: "assets/events/ev-alley-wake.jpg",
  yumcha: "assets/events/ev-yum-cha.jpg",
  mtr: "assets/events/ev-mtr-crowd.jpg",
  rooftop: "assets/events/ev-rooftop-night.jpg",
  can: "assets/events/ev-expired-can.jpg",
};

/** 關鍵詞 → 圖（依序比對，先命中先用） */
const RULES = [
  // 食
  { k: ["茶記", "茶餐廳", "大牌檔", "冰室", "食堂", "伙記", "伙頭", "廚", "煲", "湯", "飯", "麵", "粥", "糖水", "奶茶", "菠蘿油", "蛋撻", "燒味", "打冷", "宵夜", "早餐", "食"], img: IMG.yumcha },
  // 交通
  { k: ["港鐵", "地鐵", "MTR", "巴士", "小巴", "電車", "叮叮", "天星", "渡輪", "月台", "車廂", "站", "隧道", "塞車", "通勤", "司機", "的士"], img: IMG.mtr },
  // 天台
  { k: ["天台", "屋頂", "棚", "簷", "梯", "樓上", "高空"], img: IMG.rooftop },
  // 食物／垃圾
  { k: ["過期", "罐頭", "垃圾", "廚餘", "執", "拾", "回收", "廢", "爛", "發霉"], img: IMG.can },
];

/** category → 首選圖 */
const CAT_IMG = {
  shop_equip: IMG.alley,
  shop_fighter: IMG.alley,
  shop_skill: IMG.alley,
  star_up: IMG.rooftop,
  gear_upgrade: IMG.alley,
  fighter_train: IMG.rooftop,
  fighter_revive: IMG.rooftop,
  card_trade: IMG.alley,
  card_gift: IMG.alley,
  card_draw: IMG.alley,
  minigame: IMG.alley,
  faction: IMG.alley,
  special_battle: IMG.alley,
};

let changed = 0;
const counts = {};

data.events.forEach((ev) => {
  if (!ev.art) return;
  const hay = `${ev.name || ""} ${ev.type || ""} ${ev.category_label || ""} ${ev.desc || ""} ${ev.reward_blurb || ""}`;
  let pick = null;

  // 1) 關鍵詞優先
  for (const r of RULES) {
    if (r.k.some((k) => hay.includes(k))) { pick = r.img; break; }
  }
  // 2) 冇命中 → 用 category
  if (!pick) pick = CAT_IMG[ev.category] || null;
  /*
   * 3) 仍然係巷景時，按事件性質再分流，避免巷景獨大（實測原本 46%）。
   *    - 帶「夜」／「燈」→ 天台夜景
   *    - 帶「人」／「街坊」／「阿」→ 人群
   *    - 其餘 → 保持巷景
   */
  if (pick === IMG.alley) {
    if (/夜|燈|收工|通宵|凌晨/.test(hay)) pick = IMG.rooftop;
    else if (/街坊|阿|人|群|排隊|迫/.test(hay)) pick = IMG.mtr;
  }
  // 4) 仍然冇 → 保持原圖
  if (!pick) return;

  if (ev.art !== pick) {
    ev.art = pick;
    changed++;
  }
  counts[pick] = (counts[pick] || 0) + 1;
});

fs.writeFileSync(path.join(root, "data.json"), JSON.stringify(data, null, 2) + "\n");
fs.writeFileSync(path.join(root, "data.js"), "window.HK_SLICE_DATA = " + JSON.stringify(data, null, 2) + ";\n");

/* ===== 驗證 ===== */
const finalCounts = {};
data.events.forEach((e) => { if (e.art) finalCounts[e.art] = (finalCounts[e.art] || 0) + 1; });
const total = data.events.filter((e) => e.art).length;
const alley = finalCounts[IMG.alley] || 0;
const pct = ((alley / total) * 100).toFixed(0);

console.log("=== 分派結果 ===");
Object.entries(finalCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  const nm = k.split("/").pop();
  console.log(`  ${String(v).padStart(3)} 次  ${nm}`);
});
console.log("");
console.log(`改動 ${changed} 個事件`);
console.log(`ev-alley-wake 佔比: ${pct}%（目標 <30%）`);

let fail = 0;
if (Number(pct) >= 30) { console.error("FAIL: 巷景佔比仍然過高"); fail++; }
// 每張圖至少用過 2 次（避免有圖完全冇用）
Object.values(IMG).forEach((p) => {
  const c = finalCounts[p] || 0;
  if (c < 2) { console.error(`FAIL: ${p.split("/").pop()} 只用 ${c} 次`); fail++; }
});
if (fail) { console.error("TOTAL FAIL", fail); process.exit(1); }
console.log("OK");
