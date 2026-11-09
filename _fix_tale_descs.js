/**
 * t384b：修 tale 包「描述預設咗玩家行為」的矛盾。
 *
 * 原則：每步 desc 一律寫成「客觀場面」，唔預設玩家上一步做過乜。
 * 另外修正「上一步某個選擇令下一步唔可能發生」的情況（改 outcome 收尾，唔改分支結構）。
 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const nodeOf = (id) => d.events.find((e) => e.id === id);

let changed = 0;
function setDesc(id, desc) {
  const n = nodeOf(id);
  if (!n) throw new Error("missing " + id);
  if (n.desc === desc) return;
  n.desc = desc;
  changed++;
  console.log(`  desc ${id} ← ${desc.slice(0, 34)}…`);
}
function setOutcome(id, idx, outcome) {
  const n = nodeOf(id);
  const c = (n.tale_choices || [])[idx];
  if (!c) throw new Error(`missing choice ${id}[${idx}]`);
  if (c.outcome === outcome) return;
  c.outcome = outcome;
  changed++;
  console.log(`  outcome ${id}[${idx}] ← ${outcome.slice(0, 30)}…`);
}

console.log("【手袋三夜】");
// step3：上一步玩家可能已經自己打開過手袋 → 改為客觀描述
setDesc("EV_SDN_02B", "樓梯級上面，手袋攤開咗。裡面有一張紙，寫住一個地址同一個名。搬嘢女人望住張紙，話佢唔識字，但認得個名嘅形狀。");
// step5：上一步可能選擇「企埋一邊」→ 唔可以預設玩家已經遞紗布
setDesc("EV_SDN_03B", "後巷靜咗。打拳嗰個男人坐喺膠凳，手背仲流緊血。佢冇望你，亦都冇叫你走。");
// step6 [2] 報警：原本寫「第二日就搬走咗」，令 step7「三個人的天台」唔可能發生
setOutcome("EV_SDN_04", 2, "警察嚟咗，抄咗啲資料就走。搬嘢女人冇搬，但佢由嗰日起唔再同你講嘢。");
// step7：改成客觀（三個人已經同場），唔講「你叫」
setDesc("EV_SDN_04B", "天台。眼鏡女、搬嘢女人、打拳，三個人第一次企喺同一個位置。冇人講嘢，雨開始落。");

console.log("【風球未落】");
// step5：上一步可能揀「留低幫阿嬸」→ 唔可以預設玩家已經同水手上樓
setOutcome("EV_FKL_03", 1, "你按住門。阿嬸喺後面煲水，一路冇停手。過咗十分鐘，佢推你一把：「你上樓睇下。我睇住舖。」");
setDesc("EV_FKL_03B", "樓梯好暗，水退到腳眼。三樓走廊冇燈，有扇門半開。水手行前面，一路數住級數。");

console.log("【初入香江】");
// step8：唔預設「發咗達」（玩家可能報警／被頂名）→ 改為時間推移 + 中性物件
setDesc("EV_CRXJ_05", "一年過去。同一條巷，同一塊招牌。有人喺後面叫你個名——叫得好準，冇一個錯字。");

console.log("【九龍城寨】");
setDesc("EV_KLW_05", "半年後，寨門燈籠重新點起。看更換咗人。舊看更坐喺巷口剝花生，見有人行過，冇起身。");

console.log("【霓虹未完】");
// step3：上一步可能同拆遷隊傾 → 「師傅叫你上棚」仍然合理，但改成客觀場面
setDesc("EV_NMW_02B", "棚上面，師傅打開工具箱。裡面每一件工具都有名，用膠紙寫住。佢冇叫你上嚟，但亦都冇叫你走。");
// step5：上一步可能選擇拉人／講數 → 「帶你入寫字檔」唔一定發生
setDesc("EV_NMW_03B", "招牌漆嘅寫字檔。牆上掛住幾十張草圖，每一張都係一條街嘅招牌。佢企喺門口，冇話畀你入，亦都冇關門。");

console.log("【打工仔輓歌】第 6 步買賣版措辭");
const ev6 = nodeOf("EV_OF_06");
if (ev6 && ev6.track_variants && ev6.track_variants.deal) {
  ev6.track_variants.deal.desc = "第六年，你嘅舖租約到期。業主加租四成，而貨倉業主話要收返個位自用。你計過，兩邊一齊加就冇錢賺。";
  changed++;
  console.log("  deal desc 已改為中性（唔預設你係唯一老闆）");
}

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log(`\n完成，改動 ${changed} 處`);
