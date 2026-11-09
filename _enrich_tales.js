/**
 * t379 第 6 項：薄弱 tale 包加厚（並補 tale_scene 供場面過渡使用）
 *
 * 加厚前（對白字數）：
 *   初入香江 766｜城寨 637｜風球 599｜手袋 547｜霓虹 571｜打工仔輓歌 1223
 * 做法：每個節點append 2–3 句「續場」對白，令較薄嘅四包拉到 800–1000 字，
 *       同最厚嘅輓歌（1223）差距收窄；同時每步補 `tale_scene`，
 *       令 t379 嘅場面過渡小標題（第 N 步 · XX 歲 · 場景）有內容。
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));

/** node id → { scene, lines: [[speaker, text], ...] } */
const ENRICH = {
  /* ---------- 手袋三夜 ---------- */
  EV_SDN_01: {
    scene: "雨夜天台",
    lines: [
      ["眼鏡女", "你有冇見過我阿媽？冇。你哋邊個見過？"],
      ["西裝帶頭", "我見單，唔見人。"],
      ["你", "（雨打喺鐵皮上，你聽到自己吞口水嘅聲）"],
    ],
  },
  EV_SDN_02: {
    scene: "樓梯口",
    lines: [
      ["搬嘢女人", "你係咪差人？唔似。差人唔會咁夜行樓梯。"],
      ["你", "（你搖頭）"],
      ["搬嘢女人", "咁你走啦。呢個袋，唔關你事。"],
    ],
  },
  EV_SDN_02B: {
    scene: "樓梯轉角",
    lines: [
      ["搬嘢女人", "你讀過書？（你點頭）咁你讀俾我聽。"],
      ["你", "（你把張紙攤平，讀到一半停低）"],
      ["搬嘢女人", "唔使讀晒。我知最後一句寫咩。"],
    ],
  },
  EV_SDN_03: {
    scene: "旺角後巷",
    lines: [
      ["打拳", "你唔係呢條巷嘅人。"],
      ["眼鏡女", "佢係我搵嚟嘅。"],
      ["打拳", "（望你一眼）咁你最好識走。"],
    ],
  },
  EV_SDN_03B: {
    scene: "後巷膠凳",
    lines: [
      ["打拳", "我打咗十幾年，第一次有人幫我包手。"],
      ["你", "（你想講咩，但冇講）"],
      ["打拳", "下次你唔使嚟。真嘅。"],
    ],
  },
  EV_SDN_04: {
    scene: "茶餐廳卡位",
    lines: [
      ["眼鏡女", "你叫我哋信你，你信唔信你自己？"],
      ["你", "（你冇答）"],
      ["搬嘢女人", "我信。我唔識字，但我識人。"],
    ],
  },
  EV_SDN_04B: {
    scene: "三個人的天台",
    lines: [
      ["打拳", "我以為我係唯一一個受害者。"],
      ["眼鏡女", "你唔係。冇人係。"],
      ["你", "（三個人望住同一個方向，乜都冇）"],
    ],
  },
  EV_SDN_05: {
    scene: "第四夜・冇雨",
    lines: [
      ["搬嘢女人", "我下個月搬。呢區租貴。"],
      ["眼鏡女", "搬去邊？"],
      ["搬嘢女人", "（搖頭）唔知。有樓梯就得。"],
    ],
  },

  /* ---------- 霓虹未完 ---------- */
  EV_NMW_01: {
    scene: "廟街棚架",
    lines: [
      ["補燈師傅", "你上唔上嚟？上嚟就知咩叫高。"],
      ["拆遷隊", "唔好上。跌落嚟冇人賠。"],
      ["你", "（你望住棚上面嗰雙手，指節都係黑色）"],
    ],
  },
  EV_NMW_02: {
    scene: "招牌之下",
    lines: [
      ["招牌漆", "寫「拆」字？我寫過。寫完嗰晚睡得好好。"],
      ["補燈師傅", "咁你今晚寫咩？"],
      ["招牌漆", "（冇答，只係開咗罐新漆）"],
    ],
  },
  EV_NMW_02B: {
    scene: "棚上工具箱",
    lines: [
      ["補燈師傅", "呢張相，係我師傅同我。"],
      ["補燈師傅", "佢教我唔好用死力。燈管會斷。"],
      ["你", "（你把相放返工具箱最底）"],
    ],
  },
  EV_NMW_03: {
    scene: "半空三噸",
    lines: [
      ["拆遷隊", "你企開啲。呢個位食風。"],
      ["補燈師傅", "佢講得啱。你行開。"],
      ["你", "（你冇行開。鋼纜又響一聲）"],
    ],
  },
  EV_NMW_03B: {
    scene: "招牌漆的寫字檔",
    lines: [
      ["招牌漆", "你知唔知點解招牌要寫得咁大？"],
      ["招牌漆", "因為條街好長，人要喺對面都認得。"],
      ["你", "（你望住最後一頁空白，好耐）"],
    ],
  },
  EV_NMW_04: {
    scene: "拆完嘅牆",
    lines: [
      ["補燈師傅", "你摸下呢幅牆。仲暖。"],
      ["招牌漆", "唔係暖。係你手凍。"],
      ["你", "（你縮手。印上面有油漆味）"],
    ],
  },
  EV_NMW_04B: {
    scene: "街口圍板",
    lines: [
      ["拆遷隊", "我以前都寫過字。寫得唔靚。"],
      ["拆遷隊", "所以我去拆。拆嘢唔使靚。"],
      ["你", "（張紙上面嘅日期，係下個月）"],
    ],
  },
  EV_NMW_05: {
    scene: "圍板後面",
    lines: [
      ["招牌漆", "你個名，你寫定我寫？"],
      ["補燈師傅", "（笑）佢自己寫。咁大個人。"],
      ["你", "（你接過毛筆，手有啲震）"],
    ],
  },

  /* ---------- 風球未落 ---------- */
  EV_FKL_01: {
    scene: "碼頭．八號",
    lines: [
      ["阿嬸", "坐啦。位冇人。"],
      ["水手", "（讓開半張凳）你濕晒。"],
      ["你", "（你坐低，雨水由褲腳滴落地磚）"],
    ],
  },
  EV_FKL_02: {
    scene: "茶記窗邊",
    lines: [
      ["阿嬸", "膠紙唔係擋風。係擋碎片。"],
      ["阿嬸", "玻璃爆嘅時候，你就知分別。"],
      ["你", "（你按住膠紙另一邊，手都係膠水）"],
    ],
  },
  EV_FKL_02B: {
    scene: "後巷鐵閘",
    lines: [
      ["細路", "你驚唔驚？我唔驚。我驚貓驚。"],
      ["你", "（你望住鐵閘上面嘅鐵線）"],
      ["細路", "你爬過去，我幫你睇住。"],
    ],
  },
  EV_FKL_03: {
    scene: "茶記門口．九號",
    lines: [
      ["隔離舖", "三分鐘。三分鐘之後我報警。"],
      ["水手", "你報。警察唔會上樓。"],
      ["你", "（你已經行到樓梯口）"],
    ],
  },
  EV_FKL_03B: {
    scene: "三樓走廊",
    lines: [
      ["水手", "貓叫喺左手邊。你聽。"],
      ["你", "（你聽到，仲有另一種聲）"],
      ["水手", "（細聲）有人喺度。唔好出聲。"],
    ],
  },
  EV_FKL_04: {
    scene: "茶記．凌晨四點",
    lines: [
      ["阿嬸", "飲完先講嘢。"],
      ["水手", "（飲一啖）原來茶記嘅奶茶係咁味。"],
      ["你", "（你望住窗外，對岸全黑）"],
    ],
  },
  EV_FKL_04B: {
    scene: "茶記廚房",
    lines: [
      ["阿嬸", "佢走嗰年，我留咗佢對鞋。"],
      ["阿嬸", "就喺廚房後面。你唔好笑我。"],
      ["你", "（你冇笑。你望住張相好耐）"],
    ],
  },
  EV_FKL_05: {
    scene: "碼頭閘口",
    lines: [
      ["細路", "我搵到我阿媽喇。佢喺樓上。"],
      ["細路", "佢冇死。佢只係冇落嚟。"],
      ["你", "（你唔知應該講咩，所以冇講）"],
    ],
  },

  /* ---------- 九龍城寨風雲 ---------- */
  EV_KLW_01: {
    scene: "城寨西門",
    lines: [
      ["看更權", "你識邊個？"],
      ["白衫", "（喺遠處）佢識我。"],
      ["看更權", "（望你）咁你自己講。你識唔識佢？"],
    ],
  },
  EV_KLW_02: {
    scene: "寨內藥房",
    lines: [
      ["阿妹", "你唔使答我。你答你自己。"],
      ["阿妹", "你入嚟，係為咗搵人，定係為咗避人？"],
      ["你", "（藥櫃上面嘅紙條，有一張寫住你個名）"],
    ],
  },
  EV_KLW_02B: {
    scene: "藥房後巷飯枱",
    lines: [
      ["阿妹", "你食得慢。你以前食得慢？定係而家先慢？"],
      ["你", "（你冇答）"],
      ["阿妹", "慢慢食。呢度唔趕人。"],
    ],
  },
  EV_KLW_03: {
    scene: "寨內天井",
    lines: [
      ["打拳佬", "你睇住把刀，定睇住本簿？"],
      ["你", "（你睇住本簿）"],
      ["打拳佬", "（笑）咁你仲有得救。"],
    ],
  },
  EV_KLW_03B: {
    scene: "三十幾條巷",
    lines: [
      ["看更權", "你行得快。行得快嘅人，通常想走。"],
      ["看更權", "呢度冇得走。你不如行慢啲。"],
      ["你", "（你放慢腳步，巷尾嗰幅牆仲喺度）"],
    ],
  },
  EV_KLW_04: {
    scene: "寨門巷口",
    lines: [
      ["白衫", "你唔使即刻答我。我等到聽朝。"],
      ["白衫", "聽朝你唔嚟，我就當你揀咗另一邊。"],
      ["你", "（你將張紙摺好，收入衫袋）"],
    ],
  },
  EV_KLW_04B: {
    scene: "藥房後巷",
    lines: [
      ["阿妹", "你唔好以為我唔驚。我驚到腳都軟。"],
      ["阿妹", "但係我唔會交你出去。"],
      ["你", "（你伸手出去，又收返）"],
    ],
  },
  EV_KLW_05: {
    scene: "半年後．寨門",
    lines: [
      ["看更權", "你隻手受過傷？（你點頭）"],
      ["看更權", "傷痕會好。疤痕唔會。"],
      ["你", "（燈籠嘅光，照住你半邊面）"],
    ],
  },
};

let touched = 0;
let added = 0;
Object.entries(ENRICH).forEach(([id, spec]) => {
  const n = d.events.find((e) => e.id === id);
  if (!n) { console.warn("missing node", id); return; }
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

/* 統計 */
console.log("加厚節點:", touched, "｜新增對白:", added);
["chu_ru_xiang_jiang", "kowloon_walled_ch1", "fung_kau_mei_lok", "shou_dai_nv_xia", "neon_mei_wan"].forEach((pid) => {
  const p = d.story_packs.find((x) => x.id === pid);
  const ns = p.tale_chain.map((id) => d.events.find((e) => e.id === id));
  let lines = 0, words = 0, scenes = 0;
  ns.forEach((n) => {
    lines += (n.dialogue || []).length;
    (n.dialogue || []).forEach((x) => { words += String(x.text || "").length; });
    if (n.tale_scene) scenes++;
  });
  console.log(`  ${p.name}：${lines} 句／${words} 字｜有場景 ${scenes}/${ns.length}`);
});

const office = d.story_packs.find((p) => p.id === "office_ballad");
const ons = office.office_chain.map((id) => d.events.find((e) => e.id === id));
let olines = 0, owords = 0;
ons.forEach((n) => { olines += (n.dialogue || []).length; (n.dialogue || []).forEach((x) => { owords += String(x.text || "").length; }); });
console.log(`  打工仔輓歌：${olines} 句／${owords} 字（對照）`);
