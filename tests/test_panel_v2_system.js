// ÆON Panel v2 — Faz 6 Sistem & Mesajlar fixture
"use strict";

const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }

function assert(cond, msg) {
  if (!cond) {
    console.error("❌ FAIL: " + msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log("✅ PASS: " + msg);
}

let html = "";
let rootTheme = "dark";
let rootDensity = "comfortable";
global.document = {
  getElementById: function(id) {
    if (id === "app") {
      return {
        innerHTML: html,
        set innerHTML(v) { html = v; }
      };
    }
    if (id === "root") {
      return {
        setAttribute: function(k, v) {
          if (k === "data-theme") rootTheme = v;
          if (k === "data-density") rootDensity = v;
        },
        getAttribute: function(k) {
          if (k === "data-theme") return rootTheme;
          if (k === "data-density") return rootDensity;
          return null;
        }
      };
    }
    return null;
  }
};

const vm = require("vm");
const ctx = {
  window: {},
  document: global.document,
  console: console,
  setTimeout: function(cb) { if (typeof cb === "function") cb(); return 0; },
  setInterval: function() { return 0; },
  clearTimeout: function() {},
  clearInterval: function() {}
};
ctx.window = ctx;

vm.createContext(ctx);
vm.runInContext(read("panelCoverageManifest.js"), ctx);
vm.runInContext(read("panel-v2.js"), ctx);

ctx.AeonV2.init();

const seededData = {
  days: {
    "2026-08-04": {
      mood: { value: 4, note: "Huzurlu" },
      sleep: { duration: 7.5, quality: 8 }
    },
    "2026-08-03": { mood: { value: 3 }, sleep: { duration: 6.0 } }
  },
  aeonInbox: [
    { from: "Observer", text: "Bugün nasılsın?", ts: "2026-08-04T08:00:00Z" }
  ],
  aeonOutbox: [
    { text: "İyiyim, teşekkürler.", ts: "2026-08-04T08:05:00Z" }
  ]
};

ctx.AeonV2.setData(seededData);
ctx.AeonV2.setTab("system");

// 1. Sistem sekmesi 4 alt-sekme gösteriyor
assert(/sub-tab/.test(html), "Sub-tab butonları var");
assert(/Durum/.test(html), "Durum sub-tab var");
assert(/Audit/.test(html), "Audit sub-tab var");
assert(/Mesajlar/.test(html), "Mesajlar sub-tab var");
assert(/Ayarlar/.test(html), "Ayarlar sub-tab var");

// 2. Status detayı varsayılan açılıyor
assert(/Durum/.test(html), "Durum başlığı/bağlamı var");
assert(/Bekliyor|idle/.test(html), "Sync durumu metni var");
assert(/Gün sayısı/.test(html), "Gün sayısı satırı var");
assert(/2/.test(html), "İki gün sayısı görünür");

// 3. Audit detayları
ctx.AeonV2.setSystemSubTab("audit");
assert(/Coverage durumu/.test(html), "Audit coverage durumu var");
assert(/Redacted alan/.test(html), "Redacted alan sayısı var");
assert(/Summary alan/.test(html), "Summary alan sayısı var");
assert(/Full alan/.test(html), "Full alan sayısı var");
assert(/Polling/.test(html), "Polling durumu var");

// 4. Mesajlaşma UI
ctx.AeonV2.setSystemSubTab("messages");
assert(/Observer/.test(html), "Inbox gönderen adı var");
assert(/Bugün nasılsın\?/.test(html), "Inbox mesaj metni var");
assert(/Sen/.test(html), "Outbox gönderen etiketi var");
assert(/İyiyim, teşekkürler\./.test(html), "Outbox mesaj metni var");

// 5. Token alanı var ve açık token görünmüyor
assert(/GitHub token/.test(html), "Token kartı var");
assert(/type=\"password\"/.test(html), "Token input password tipinde");
assert(!/supersecrettoken/.test(html), "Token DOM çıktısında yok");

// 6. Ayarlar UI
ctx.AeonV2.setSystemSubTab("settings");
assert(/Yoğunluk/.test(html), "Yoğunluk ayarı var");
assert(/Tema/.test(html), "Tema ayarı var");
assert(/Oturum/.test(html), "Oturum ayarı var");
assert(/Sıkı/.test(html), "Sıkı yoğunluk butonu var");
assert(/Rahat/.test(html), "Rahat yoğunluk butonu var");
assert(/Geniş/.test(html), "Geniş yoğunluk butonu var");

// 7. Density değişimi
ctx.AeonV2.setDensity("compact");
assert(rootDensity === "compact", "Root element data-density compact oldu");
ctx.AeonV2.setDensity("spacious");
assert(rootDensity === "spacious", "Root element data-density spacious oldu");
ctx.AeonV2.setDensity("comfortable");
assert(rootDensity === "comfortable", "Root element data-density comfortable oldu");

// 8. Theme değişimi
ctx.AeonV2.setTheme("light");
assert(rootTheme === "light", "Root element data-theme light oldu");
ctx.AeonV2.setTheme("dark");
assert(rootTheme === "dark", "Root element data-theme dark oldu");

// 9. Geçersiz sub-tab reddedilir
ctx.AeonV2.setSystemSubTab("invalid");
assert(/Durum/.test(html), "Geçersiz sub-tab sonrası Durum sekmesi aktif kaldı");

// 10. Topbar status badge tıklanabilir
ctx.AeonV2.setTab("today");
assert(/AeonV2\.setTab\('system'\)/.test(html), "Topbar status badge Sistem sekmesine yönlendiriyor");
assert(/setSystemSubTab\('status'\)/.test(html), "Topbar status badge Durum sub-tab'ına yönlendiriyor");

// 11. Hata durumunda error box
ctx.AeonV2.updateStatus({ status: "error", lastErrorCode: "rate_limited" });
ctx.AeonV2.setTab("system");
ctx.AeonV2.setSystemSubTab("status");
assert(/Son hata/.test(html), "Hata durumunda son hata başlığı var");
assert(/rate_limited/.test(html), "Hata kodu görünür");

// 12. Token setter
ctx.AeonV2.setPanelToken("supersecrettoken");
assert(ctx.AeonV2.ui.panelToken === "supersecrettoken", "Token ui'da saklandı");

console.log("\n🦩 Faz 6 Sistem & Mesajlar fixture — TÜM TESTLER BAŞARILI");
