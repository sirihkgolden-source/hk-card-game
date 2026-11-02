/**
 * 產生小遊戲畫面的獨立預覽頁（載入真實 styles.css）
 * 用於視覺驗收，唔影響遊戲本體。
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;

const PAD_LABELS = ["赤", "青", "金", "紫", "翠", "白"];
const PAD_COLORS = ["#ff4d6a", "#3dfff0", "#ffd36a", "#c9a0ff", "#7dffb3", "#f0f0f0"];

function pads(litIdx, disabled) {
  return PAD_COLORS.slice(0, 4).map((c, i) => {
    const lit = i === litIdx ? " lit" : "";
    const dis = disabled ? " disabled" : "";
    return `<button type="button" class="mg-pad mg-pad-neon${lit}" data-pad="${i}" style="--mg-c:${c}"${dis}><span class="mg-pad-label">${PAD_LABELS[i]}</span></button>`;
  }).join("");
}

function dots(round, maxR, phase) {
  let out = "";
  for (let r = 1; r <= maxR; r++) {
    const cls = (phase === "won" || r < round) ? " done" : ((r === round && phase !== "won" && phase !== "lost") ? " now" : "");
    out += `<span class="mg-round-dot${cls}"></span>`;
  }
  return out;
}

function arcade(opts) {
  const o = Object.assign({
    round: 1, maxRounds: 3, phase: "intro", remain: 35, timeLimit: 35,
    msg: "依序記住亮起的鍵位，再依同樣順序點選。", litIdx: -1, disabled: true,
    progress: null,
  }, opts);
  const timePct = Math.max(0, Math.min(100, (o.remain / o.timeLimit) * 100));
  const warn = o.remain <= 8;
  const isResult = o.phase === "won" || o.phase === "lost";
  const phaseLabel = { intro: "準備", watch: "記住序列", input: "依序點選", won: "破關成功", lost: "破關失敗" }[o.phase] || "";
  const progress = o.progress
    ? `<div class="mg-input-progress">${o.progress.map((on) => `<i class="${on ? "on" : ""}"></i>`).join("")}</div>`
    : "";
  return `<div class="mg-arcade">
    <div class="mg-rounds">${dots(o.round, o.maxRounds, o.phase)}</div>
    <div class="mg-timebar${warn ? " warn" : ""}"><i style="width:${timePct}%"></i></div>
    <div class="mg-status">
      <span>第 <b>${o.round}</b>／${o.maxRounds} 關</span>
      <span class="mg-phase">${phaseLabel}</span>
      <span>剩餘 <b>${o.remain}</b>s</span>
    </div>
    ${isResult
      ? `<div class="mg-result-banner ${o.phase === "won" ? "win" : "lose"}">${o.phase === "won" ? "★ 破關成功 ★" : "破關失敗"}</div>`
      : `<div class="bubble neon mg-msg">${o.msg}</div>`}
    ${progress}
    <div class="mg-pads mg-pads-neon">${pads(o.litIdx, o.disabled)}</div>
  </div>`;
}

const screens = {
  intro: arcade({ phase: "intro", disabled: true }),
  watch: arcade({ phase: "watch", remain: 28, litIdx: 1, msg: "第 2 關：記住 3 步序列。", disabled: true, round: 2 }),
  input: arcade({ phase: "input", remain: 6, msg: "依同樣順序點選鍵位。", disabled: false, round: 2, progress: [true, false, false] }),
  win: arcade({ phase: "won", remain: 12, round: 3 }),
  lose: arcade({ phase: "lost", remain: 3, round: 2 }),
};

const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>小遊戲預覽</title>
<link rel="stylesheet" href="styles.css" />
<style>
  body { background: #0a0610; margin: 0; padding: 12px; display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
  .frame { width: 374px; }
  .frame > h3 { color: #ffd36a; font: 900 12px/1.4 system-ui; margin: 0 0 6px; letter-spacing: .1em; }
  .screen.demo { position: relative; height: 700px; padding: 8px 10px 10px; gap: 6px; }
</style>
</head>
<body>
${Object.keys(screens).map((k) => `
  <div class="frame">
    <h3>${k}</h3>
    <div class="screen demo has-bg bg-soft" data-screen="minigame">
      <div class="mg-wrap">${screens[k]}</div>
    </div>
  </div>`).join("")}
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, "_mg_preview.html"), html);
console.log("已產生 _mg_preview.html");
