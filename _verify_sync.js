const fs = require("fs");
const path = require("path");
const dir = process.argv[2] || ".";

const app = fs.readFileSync(path.join(dir, "app.js"), "utf8");
const data = fs.readFileSync(path.join(dir, "data.js"), "utf8");
const css = fs.readFileSync(path.join(dir, "styles.css"), "utf8");
const idx = fs.readFileSync(path.join(dir, "index.html"), "utf8");

const checks = {
  "index: 版本號一致（t378）": /app\.js\?v=t378-1/.test(idx) && /styles\.css\?v=t378-1/.test(idx) && /data\.js\?v=t378-1/.test(idx),
  "app: 記憶小遊戲美化": app.includes("mg-pad-neon"),
  "app: inputTimer 修正": app.includes("mg.inputTimer"),
  "app: 故事鏈引擎": app.includes("taleResolveEnding"),
  "app: 換卡保護": app.includes("tradeWouldLeaveNoFighter"),
  "app: 循環修正 alreadyFinished": app.includes("alreadyFinished"),
  "app: 空隊伍修正": app.includes("next[id] = Math.max(1, next[id] | 0)"),
  "app: 故事包清單提示": app.includes("pack-list-more"),
  "data: 6 個故事包（tale_chain 5 個）": (data.match(/"tale_chain"/g) || []).length >= 5,
  "data: office_ballad 存在": data.includes('"office_ballad"'),
  "data: 打工仔新節點": data.includes("影印機旁的那個人"),
  "css: 街機面板": css.includes("mg-arcade"),
  "css: 圓形鍵位": css.includes("mg-pad-neon"),
  "css: 波紋動畫": css.includes("mg-ripple"),
  "css: 故事包提示": css.includes("pack-list-more"),
  "css: 換卡警告": css.includes("trade-risk"),
};

let bad = 0;
console.log("=== 內容檢查（" + path.resolve(dir) + "） ===");
Object.keys(checks).forEach((k) => {
  const ok = checks[k];
  if (!ok) bad++;
  console.log("  " + (ok ? "OK  " : "FAIL") + " " + k);
});
console.log(bad === 0 ? "\n全部齊全 ✅" : "\n有 " + bad + " 項缺失 ❌");
process.exit(bad ? 1 : 0);
