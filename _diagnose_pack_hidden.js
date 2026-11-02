/**
 * 檢查「打工仔輓歌」在手機上消失的可能原因
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createDocument } = require("./_testlib_dom");
const ROOT = __dirname;
const ORIG = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

function load(savedRaw) {
  const doc = createDocument();
  const m = new Map();
  if (savedRaw) m.set("hkcg-demo-lite-save-v1", savedRaw);
  const store = {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] || null,
  };
  const sb = {
    document: doc, localStorage: store, sessionStorage: store, innerWidth: 390, innerHeight: 780, devicePixelRatio: 2,
    addEventListener: () => {}, removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    location: { href: "/", search: "", hash: "" }, navigator: { userAgent: "node" },
    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 0), cancelAnimationFrame: () => {},
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
    alert: () => {}, console, Math, Date, JSON,
    Audio: function () { return { play: () => Promise.resolve(), pause() {} }; },
    Image: function () { const o = { naturalWidth: 100, naturalHeight: 100, complete: true }; Object.defineProperty(o, "src", { get: () => "", set: () => {}, configurable: true }); return o; },
    PointerEvent: function () {}, MouseEvent: function () {},
    getComputedStyle: () => ({ getPropertyValue: () => "", backgroundImage: "", padding: "0", gap: "0", fontSize: "16px", lineHeight: "1", display: "block", opacity: "1" }),
    URL: { createObjectURL: () => "blob:x", revokeObjectURL: () => {} }, Blob: function () {},
    btoa: (s) => Buffer.from(s, "binary").toString("base64"), atob: (s) => Buffer.from(s, "base64").toString("binary"),
  };
  sb.window = sb; sb.self = sb; sb.globalThis = sb; sb.top = sb;
  const HOOK = `try{window.__T={state,DATA,storyPacksList,render,ensureActiveStoryPack,storyPackById};}catch(e){window.__E=String(e&&e.stack)}`;
  const i = ORIG.lastIndexOf("// boot —");
  const ctx = vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8"), ctx, { filename: "data.js" });
  vm.runInContext(ORIG.slice(0, i) + HOOK + "\n" + ORIG.slice(i), ctx, { filename: "app.js" });
  if (sb.__E) throw new Error(sb.__E);
  return { T: sb.__T, doc };
}

function show(label, savedRaw) {
  const { T, doc } = load(savedRaw);
  const list = T.storyPacksList();
  const root = doc.getElementById("screen");
  T.state.screen = "storyPacks";
  T.render();
  const cells = (root.innerHTML.match(/data-pack=/g) || []).length;
  console.log(`\n=== ${label} ===`);
  console.log("  storyPacksList():", list.length, "個 →", list.map((p) => p.name).join("、"));
  console.log("  畫面渲染 data-pack:", cells, "個");
  const has = list.some((p) => p.id === "office_ballad");
  console.log("  含 office_ballad:", has ? "✓" : "✗");
  return has;
}

/* 1. 全新（無存檔） */
show("全新開局（無存檔）", null);

/* 2. 舊存檔（有 activeStoryPackId 指向其他包） */
const oldSave = JSON.stringify({
  v: 1,
  screen: "home",
  year: 4, age: 13, soul: 260, gold: 0,
  attrs: { str: 12, agi: 10, intel: 8, luck: 8, lead: 5, life: 70 },
  team: ["C241", "C244", "C248"],
  cardCounts: { C241: 1, C244: 1, C248: 1, C03: 1 },
  activeStoryPackId: "chu_ru_xiang_jiang",
  demoSeedVersion: 271,
  lifePrepped: false,
  fighterStars: {}, skillStars: {}, equipStars: {},
  deadFighters: [], burnedSkills: [], lifeSkills: [],
  loadout: {}, loadoutInited: {}, accountGear: {},
  lifeFlags: {}, factions: {},
});
show("舊存檔（已選初入香江）", oldSave);

/* 3. 極舊存檔（無 activeStoryPackId 欄） */
const veryOld = JSON.stringify({
  v: 1, screen: "home", year: 1, age: 10, soul: 30,
  attrs: { str: 12, agi: 10, intel: 8, luck: 8, lead: 5, life: 70 },
  team: [], cardCounts: {}, demoSeedVersion: 271,
});
show("極舊存檔（無 storyPack 欄）", veryOld);

/* 4. 損壞存檔 */
show("損壞存檔（亂碼）", "{not-json");

/* 5. 存檔指向不存在的包 */
const badPack = JSON.stringify({
  v: 1, screen: "home", year: 2, age: 11, soul: 100,
  attrs: { str: 12, agi: 10, intel: 8, luck: 8, lead: 5, life: 70 },
  team: ["C241"], cardCounts: { C241: 1 }, demoSeedVersion: 271,
  activeStoryPackId: "some_deleted_pack",
});
show("存檔指向不存在的包", badPack);
