// ÆON Panel v2 — Faz 6 Sistem & Mesajlar fixture
"use strict";

const { boot, assert } = require("./helpers/panel-v2-test-helper");

const { dom, ctx, AeonV2 } = boot();

let html;

AeonV2.init();

const seededData = {
  days: {
    "2026-08-04": {
      mood: "iyi",
      moodNote: "Huzurlu",
      sleep: { hours: 7.5, quality: 8 }
    },
    "2026-08-03": { mood: "normal", sleep: { hours: 6.0 } }
  },
  notifications: [
    { from: "Observer", text: "Bugün nasılsın?", ts: "2026-08-04T08:00:00Z" }
  ],
  aeon: {
    qa: [
      { question: "İyiyim, teşekkürler.", ts: "2026-08-04T08:05:00Z", answer: "Bugün daha da iyi olacaksın.", answeredAt: "2026-08-04T08:06:00Z" }
    ]
  }
};

AeonV2.setData(seededData);
AeonV2.setTab("system");
html = dom.html;

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
assert(/system-progress/.test(html), "Durum kartlarında progress bar var");
assert(/API limit kalan/.test(html), "API limit progress metriği var");
assert(/Token ömrü/.test(html), "Token ömrü progress metriği var");
assert(/role=\"progressbar\"/.test(html), "Progress bar erişilebilir role taşıyor");
assert(/system-live-metrics/.test(html), "Canlı sistem metrikleri var");
assert(/ae-card--glass/.test(html), "Durum kartı glass varyantında");

AeonV2.updateStatus({
  status: "accepted",
  apiLimitRemaining: 450,
  apiLimitTotal: 500,
  tokenIssuedAt: "2026-08-01T00:00:00Z",
  tokenExpiresAt: "2026-09-01T00:00:00Z"
});
AeonV2.setSystemSubTab("status");
html = dom.html;
assert(/90%/.test(html), "API limit progress yüzdesi hesaplanıyor");

// 3. Audit detayları
AeonV2.setSystemSubTab("audit");
html = dom.html;
assert(/Coverage durumu/.test(html), "Audit coverage durumu var");
assert(/Redacted alan/.test(html), "Redacted alan sayısı var");
assert(/Summary alan/.test(html), "Summary alan sayısı var");
assert(/Full alan/.test(html), "Full alan sayısı var");
assert(/Polling/.test(html), "Polling durumu var");
assert(/audit-timeline/.test(html), "Audit timeline görünümü var");
assert(/Coverage zaman çizelgesi/.test(html), "Audit timeline başlığı var");
assert(/audit-timeline__marker/.test(html), "Audit timeline marker'ları var");

// 4. Mesajlaşma UI
AeonV2.setSystemSubTab("messages");
html = dom.html;
assert(/Observer/.test(html), "Inbox gönderen adı var");
assert(/Bugün nasılsın\?/.test(html), "Inbox mesaj metni var");
assert(/Sen/.test(html), "Outbox gönderen etiketi var");
assert(/İyiyim, teşekkürler\./.test(html), "Outbox mesaj metni var");
assert(/message-summary/.test(html), "Mesaj özeti var");
assert(/message-bubble--unread/.test(html), "Okunmamış bildirim animasyon sınıfı var");
assert(/ae-card--glass/.test(html), "Mesaj kartları glass varyantında");

// 5. Token alanı var ve açık token görünmüyor
assert(/GitHub token/.test(html), "Token kartı var");
assert(/type=\"password\"/.test(html), "Token input password tipinde");
assert(!/supersecrettoken/.test(html), "Token DOM çıktısında yok");

// 6. Ayarlar UI
AeonV2.setSystemSubTab("settings");
html = dom.html;
assert(/Yoğunluk/.test(html), "Yoğunluk ayarı var");
assert(/Tema/.test(html), "Tema ayarı var");
assert(/Oturum/.test(html), "Oturum ayarı var");
assert(/Sıkı/.test(html), "Sıkı yoğunluk butonu var");
assert(/Rahat/.test(html), "Rahat yoğunluk butonu var");
assert(/Geniş/.test(html), "Geniş yoğunluk butonu var");
assert((html.match(/ae-card--glass/g) || []).length >= 3, "Ayar kartları glass varyantında");
assert(/settings-detail[^"]*ae-stagger/.test(html), "Ayarlar stagger giriş sınıfı var");

// 7. Density değişimi
AeonV2.setDensity("compact");
assert(dom.density === "compact", "Root element data-density compact oldu");
AeonV2.setDensity("spacious");
assert(dom.density === "spacious", "Root element data-density spacious oldu");
AeonV2.setDensity("comfortable");
assert(dom.density === "comfortable", "Root element data-density comfortable oldu");

// 8. Theme değişimi
AeonV2.setTheme("light");
assert(dom.theme === "light", "Root element data-theme light oldu");
AeonV2.setTheme("dark");
assert(dom.theme === "dark", "Root element data-theme dark oldu");

// 9. Geçersiz sub-tab reddedilir
AeonV2.setSystemSubTab("invalid");
html = dom.html;
assert(/Durum/.test(html), "Geçersiz sub-tab sonrası Durum sekmesi aktif kaldı");

// 10. Topbar status badge tıklanabilir
AeonV2.setTab("today");
html = dom.html;
assert(/AeonV2\.setTab\('system'\)/.test(html), "Topbar status badge Sistem sekmesine yönlendiriyor");
assert(/setSystemSubTab\('status'\)/.test(html), "Topbar status badge Durum sub-tab'ına yönlendiriyor");

// 11. Hata durumunda error box
AeonV2.updateStatus({ status: "error", lastErrorCode: "rate_limited" });
AeonV2.setTab("system");
AeonV2.setSystemSubTab("status");
html = dom.html;
assert(/Son hata/.test(html), "Hata durumunda son hata başlığı var");
assert(/rate_limited/.test(html), "Hata kodu görünür");

// 12. Token setter
AeonV2.setPanelToken("supersecrettoken");
assert(AeonV2.ui.panelToken === "supersecrettoken", "Token ui'da saklandı");

console.log("\n🦩 Faz 6 Sistem & Mesajlar fixture — TÜM TESTLER BAŞARILI");
