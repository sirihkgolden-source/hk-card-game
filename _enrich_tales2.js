/** 初入香江：補 tale_scene + 續場對白（第二輪加厚） */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));

const ENRICH = {
  EV_CRXJ_01: {
    scene: "九廣鐵路月台",
    lines: [
      ["七叔", "行啦。企喺月台，蒸氣會將你件衫焗乾，人唔會。"],
      ["阿珍", "（遞你一隻瓷杯）燙手就放枱。"],
      ["你", "（蒸氣散咗，你先見到條街有幾多人）"],
    ],
  },
  EV_CRXJ_02: {
    scene: "同一條街．三個門口",
    lines: [
      ["七叔", "揀工唔係揀錢。係揀你跌低嗰陣，邊個會扶你。"],
      ["光仔", "（咳）你唔使理我。我聽日就好。"],
      ["你", "（三個門口，三道燈）"],
    ],
  },
  EV_CRXJ_03B: {
    scene: "街口．第一次出糧",
    lines: [
      ["七叔", "你數咗兩次。數第三次唔會多。"],
      ["阿珍", "（喺門口）今晚有飯。你唔嚟，我就當你唔肚餓。"],
      ["你", "（你把錢對摺，放喺最入嗰格）"],
    ],
  },
  EV_CRXJ_03: {
    scene: "唐樓三樓．走廊",
    lines: [
      ["西裝帶頭", "你屋企幾多人住？"],
      ["七叔", "（企前一步）佢一個人住。你有事同我講。"],
      ["你", "（走廊盡頭，有人開咗門又關返）"],
    ],
  },
  EV_CRXJ_03C: {
    scene: "凌晨三點．騎樓底",
    lines: [
      ["阿婆", "你唔使幫我。你返去睇下你自己。」"],
      ["你", "（你托起籮紙皮，手指即刻黑）"],
      ["阿婆", "（細聲）多謝。呢兩個字，我講咗幾十年，講完都係要還。"],
    ],
  },
  EV_CRXJ_04: {
    scene: "茶記後巷",
    lines: [
      ["光仔", "我唔會求你。你點做都得。"],
      ["七叔", "（搭你膊頭）呢條街，認名嘅人唔多。"],
      ["你", "（你望住光仔手上嘅醫院單，紙邊捲起）"],
    ],
  },
  EV_CRXJ_04B: {
    scene: "茶記廚房",
    lines: [
      ["阿珍", "飲晒佢。飲剩我會嬲。"],
      ["你", "（湯入面有一塊好腍嘅肉）"],
      ["阿珍", "（轉過身）碗放喺水槽就得。唔使你洗。"],
    ],
  },
  EV_CRXJ_05: {
    scene: "一年後．同一條巷",
    lines: [
      ["七叔", "行慢啲。行快咗，人會以為你急住走。"],
      ["阿珍", "（望你個袋）換咗袋？（你點頭）好睇。唔好用。"],
      ["你", "（你冇答。街口嘅燈同一年前一樣）"],
    ],
  },
};

let touched = 0, added = 0;
Object.entries(ENRICH).forEach(([id, spec]) => {
  const n = d.events.find((e) => e.id === id);
  if (!n) { console.warn("missing", id); return; }
  if (!Array.isArray(n.dialogue)) n.dialogue = [];
  const have = new Set(n.dialogue.map((x) => `${x.speaker}|${x.text}`));
  spec.lines.forEach(([speaker, text]) => {
    if (have.has(`${speaker}|${text}`)) return;
    n.dialogue.push({ speaker, text });
    added++;
  });
  if (!n.tale_scene && spec.scene) n.tale_scene = spec.scene;
  touched++;
});

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log("nodes", touched, "lines", added);

["chu_ru_xiang_jiang", "kowloon_walled_ch1", "fung_kau_mei_lok", "shou_dai_nv_xia", "neon_mei_wan"].forEach((pid) => {
  const p = d.story_packs.find((x) => x.id === pid);
  const ns = p.tale_chain.map((id) => d.events.find((e) => e.id === id));
  let lines = 0, words = 0, scenes = 0;
  ns.forEach((n) => {
    lines += (n.dialogue || []).length;
    (n.dialogue || []).forEach((x) => { words += String(x.text || "").length; });
    if (n.tale_scene) scenes++;
  });
  console.log(`  ${p.name}：${lines} 句／${words} 字｜場景 ${scenes}/${ns.length}`);
});
