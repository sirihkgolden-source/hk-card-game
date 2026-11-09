/** EV_OF_06 的 tea / deal 兩版本來文字重複 → 依職種背景改寫成唔同內容 */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data.json"), "utf8"));
const n = d.events.find((e) => e.id === "EV_OF_06");

/* 茶記版：你係頂手接間舖，業主加租；伙記跟咗老細十幾年 */
n.track_variants.tea = {
  name: "租約到期",
  desc: "第六年，茶記租約到期。業主加租四成。你計過，加咗租就要減一個伙記。",
  dialogue: [
    ["業主", "四成。唔簽就搬。"],
    ["你", "四成？我一日賣幾多杯奶茶，你知唔知？"],
    ["業主", "隔籬個位有人出更高。我唔急。"],
    ["你", "（你望住舖頭，卡位係你自己一手一腳裝嘅）"],
    ["伙記", "（細聲）老細……我哋搬唔搬？"],
    ["你", "（兩個伙記跟咗上手老細十幾年，兩個都有家）"],
    ["業主", "（遞筆）下星期一之前答我。"],
    ["你", "（你想起第一日，你連茶都唔識叫）"],
    ["你", "（原來呢個位，都係租返嚟嘅）"],
    ["你", "（你望住支筆，好耐）"],
  ],
  office_choices: n.track_variants.office.office_choices.map((c) => ({ text: c.text, delta: c.delta })),
};
/* 茶記語意：簽＝縮細（減伙記）／搬遠／借錢擴充 → 沿用 office 三個選擇文字會講「交一個人」，
   改成茶記語意，但 delta 保持不變 */
n.track_variants.tea.office_choices = [
  { text: "簽，減一個伙記頂住", delta: n.track_variants.office.office_choices[0].delta },
  { text: "搬去更遠更平嘅舖", delta: n.track_variants.office.office_choices[1].delta },
  { text: "借錢擴充，一次過做大", delta: n.track_variants.office.office_choices[2].delta },
];

/* 買賣版：你自己開嘅舖（唔係親戚舖），貨倉同客都係你自己嘅 */
n.track_variants.deal = {
  name: "搬倉",
  desc: "第六年，你自己間舖租約到期。業主加租四成，而貨倉業主話要收返個位自用。你計過，兩邊一齊加就冇錢賺。",
  dialogue: [
    ["業主", "四成。唔簽就搬。"],
    ["你", "四成？我賺嘅都冇咁多。"],
    ["業主", "隔籬個位有人出更高。我唔急。"],
    ["倉主", "（另一邊，電話）個倉我仔要用。你搵過第二個位。"],
    ["你", "（你望住舖頭，貨架係你自己一手一腳搭嘅）"],
    ["伙記", "（細聲）老闆……我哋搬唔搬？"],
    ["你", "（你請咗兩個伙記，兩個都有家）"],
    ["業主", "（遞筆）下星期一之前答我。"],
    ["你", "（你想起第一日返工，阿媽講嘅「穩定」）"],
    ["你", "（原來穩定係要買嘅，而且年年加價）"],
  ],
  office_choices: [
    { text: "簽，縮細舖面、貨搬去新界", delta: n.track_variants.office.office_choices[0].delta },
    { text: "搬去更遠更平嘅舖", delta: n.track_variants.office.office_choices[1].delta },
    { text: "借錢擴充，一次過做大", delta: n.track_variants.office.office_choices[2].delta },
  ],
};

/* 寫字樓版保持原樣 */
n.name = n.track_variants.office.name;
n.desc = n.track_variants.office.desc;
n.dialogue = n.track_variants.office.dialogue;
n.office_choices = n.track_variants.office.office_choices;

const json = JSON.stringify(d, null, 2) + "\n";
fs.writeFileSync(path.join(ROOT, "data.json"), json);
fs.writeFileSync(path.join(ROOT, "data.js"), "window.HK_SLICE_DATA = " + json + ";\n");
console.log("EV_OF_06 三版已重寫");
["office", "tea", "deal"].forEach((k) => console.log("  " + k, "→", n.track_variants[k].name));
