// ÆON Panel v2 — Prompt 34 Sistem sub-tab contract fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, AeonV2 } = boot();
AeonV2.init();
AeonV2.setData({ days: { "2026-08-11": { mood: 4 } } });
AeonV2.setTab("system");

let html = dom.html;
const labels = ["Durum", "Olaylar", "Denetim", "Mesajlar", "Ayarlar"];
assert(JSON.stringify(AeonV2.SYSTEM_SUB_TABS.map(function(tab) { return tab.id; })) === '["status","events","audit","messages","settings"]', "SYSTEM_SUB_TABS kanonik id sırasını koruyor");
let cursor = -1;
labels.forEach(function(label) {
  const index = html.indexOf(">" + label + "</button>");
  assert(index > cursor, "Sub-tab kanonik sırada: " + label);
  cursor = index;
});
assert((html.match(/id="ae-system-subtab-[a-z]+"/g) || []).length === 5, "Beş sistem sub-tab kimliği var");
assert((html.match(/aria-controls="ae-system-panel-[a-z]+"/g) || []).length === 5, "Beş sub-tab panel bağlantısı var");
assert((html.match(/aria-selected="true"/g) || []).length >= 2, "Ana ve sistem tablistelerinde seçili state var");
assert(/id="ae-system-panel-status"/.test(html), "Varsayılan Durum paneli bağlı render ediliyor");
assert(!/system-panel--subtab-enter/.test(html), "İlk sistem renderı gereksiz geçiş animasyonu taşımıyor");

labels.slice(1).forEach(function(label) {
  const id = label === "Olaylar" ? "events" : label === "Denetim" ? "audit" : label === "Mesajlar" ? "messages" : "settings";
  AeonV2.setSystemSubTab(id);
  html = dom.html;
  assert(new RegExp('id="ae-system-panel-' + id + '"').test(html), label + " paneli seçilebiliyor");
  assert(new RegExp('id="ae-system-subtab-' + id + '"[^>]+aria-selected="true"').test(html), label + " sub-tab selected state taşıyor");
  assert(/system-panel--subtab-enter/.test(html), label + " geçiş animasyonu taşıyor");
  AeonV2.render();
  assert(!/system-panel--subtab-enter/.test(dom.html), label + " geçiş sınıfı bir sonraki renderda temizleniyor");
});

AeonV2.setSystemSubTab("not-valid");
assert(/id="ae-system-panel-settings"/.test(dom.html), "Geçersiz sistem sub-tab mevcut seçimi bozmuyor");

console.log("\n✅ Prompt 34 system sub-tabs fixture — TÜM TESTLER BAŞARILI");
