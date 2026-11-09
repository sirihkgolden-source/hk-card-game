/**
 * t379：為故事節點補 `tale_scene`（場面過渡小標題用）
 * 令每步之間有「地點／時段」提示，減少跳戲感。
 */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(root, "data.json"), "utf8"));
const EV = data.events;

const SCENES = {
  /* 初入香江 */
  EV_CRXJ_01: "月台 · 抵港第一日",
  EV_CRXJ_02: "街口 · 第一份工",
  EV_CRXJ_03B: "街口 · 第一次出糧",
  EV_CRXJ_03: "樓上 · 收數上門",
  EV_CRXJ_03C: "凌晨 · 首次捱夜",
  EV_CRXJ_04: "後巷 · 頂名之人",
  EV_CRXJ_04B: "茶記 · 阿珍的湯",
  EV_CRXJ_05: "同一條巷 · 一年之後",

  /* 九龍城寨 */
  EV_KLW_01: "城寨西門 · 入寨",
  EV_KLW_02: "寨內藥房 · 第一夜",
  EV_KLW_02B: "藥房後巷 · 寨內規矩",
  EV_KLW_03: "天井 · 開片",
  EV_KLW_03B: "寨內巷里 · 睇規矩",
  EV_KLW_04: "寨口 · 白衫的條件",
  EV_KLW_04B: "藥房 · 兩張紙",
  EV_KLW_05: "寨門 · 半年之後",

  /* 風球未落 */
  EV_FKL_01: "碼頭 · 八號風球",
  EV_FKL_02: "茶記 · 膠紙打叉",
  EV_FKL_02B: "後巷 · 細路的貓",
  EV_FKL_03: "九號風球 · 隔離舖",
  EV_FKL_03B: "三樓 · 樓梯水聲",
  EV_FKL_04: "凌晨四點 · 熄燈之後",
  EV_FKL_04B: "茶記 · 一張舊相",
  EV_FKL_05: "早上七點 · 風球落",

  /* 手袋三夜 */
  EV_SDN_01: "第一夜 · 雨夜天台",
  EV_SDN_02: "第二夜 · 樓梯口",
  EV_SDN_02B: "樓梯口 · 手袋裡的字",
  EV_SDN_03: "第三夜 · 旺角後巷",
  EV_SDN_03B: "後巷 · 打拳的手",
  EV_SDN_04: "茶記 · 三條數",
  EV_SDN_04B: "天台 · 四個人",
  EV_SDN_05: "第四夜 · 冇雨",

  /* 霓虹未完 */
  EV_NMW_01: "凌晨兩點半 · 熄燈之前",
  EV_NMW_02: "棚上 · 最後一晚",
  EV_NMW_02B: "棚上 · 工具箱",
  EV_NMW_03: "拆遷朝早 · 招牌上棚",
  EV_NMW_03B: "寫字檔 · 帳簿",
  EV_NMW_04: "牆上 · 拆剩嘅字",
  EV_NMW_04B: "街口 · 清拆令",
  EV_NMW_05: "半年後 · 最後一盞",
};

let touched = 0, missing = 0;
Object.keys(SCENES).forEach((id) => {
  const n = EV.find((e) => e.id === id);
  if (!n) { console.error("  缺節點:", id); missing++; return; }
  n.tale_scene = SCENES[id];
  touched++;
});

fs.writeFileSync(path.join(root, "data.json"), JSON.stringify(data, null, 2) + "\n");
fs.writeFileSync(path.join(root, "data.js"), "window.HK_SLICE_DATA = " + JSON.stringify(data, null, 2) + ";\n");

console.log("已為", touched, "個節點補上 tale_scene" + (missing ? `（${missing} 個缺失）` : ""));
const talePacks = data.story_packs.filter((p) => Array.isArray(p.tale_chain) && p.tale_chain.length);
talePacks.forEach((p) => {
  const missingScene = p.tale_chain.filter((id) => {
    const n = EV.find((e) => e.id === id);
    return !n || !n.tale_scene;
  });
  console.log(`  ${p.name}: ${p.tale_chain.length} 步，缺 tale_scene ${missingScene.length}`);
});
