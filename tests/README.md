# Headless test fixtures

Bu klasör, repository içindeki sentetik Node testlerini toplar. Testler uygulama
runtime’ına yüklenmez; `repo-root.js` sayesinde root’tan veya `tests/` içinden
çalıştırıldığında aynı kaynak dosyalarını okur.

## Klasörler ve sınırlar

- `panel-v2/` — ÆON Panel-v2 Premium’un 27 headless VM fixture’ı ve ortak
  sandbox yardımcısı. Panel-v2 dosyalarının tek canonical test konumudur.
- `panel/` — legacy Panel 1 / observer fixture’ları (`test_panel_*.js` ve
  `test_faz11_panel.js`).
- `app/` — sync ve büyük dosya davranışı için uygulama fixture’ları.
- `app/test_aeon_message_expand.js` — ÆON/Luna sohbetinde uzun mesajın
  “Tümünü göster” durumunun render’lar arasında yaşadığını doğrular. Kırpılmış
  balonun kimliği eskiden her render’da artan bir sayaçtan üretiliyor ve açık/kapalı
  bilgisi yalnızca DOM’da tutuluyordu; her arka plan render’ı (30 sn ÆON yoklaması,
  reminder timer’ı, foreground dönüşü, yeni mesaj, panel makbuzu) mesajı kullanıcı
  okurken kapatıyordu. Ağsız, sentetik, `node:vm` tabanlı.
- `app/test_motivation_room_accessibility.js` — Terapi Odası dialog semantiği,
  Tab/Shift+Tab focus sarma, Escape kapanışı ve yansıma taslağında yeniden render
  olmaması için ağsız sentetik regresyon fixture’ı.
- `app/test_modal_focus_containment.js` — Tüm ortak modal ailesinin odak
  sözleşmesini, metin alanı dahil Tab/Shift+Tab sarma, Escape kapanışı, semantik
  dialog kabuğu ve focusable arka plan regresyonunu ağsız sentetik olarak doğrular.
- `app/test_local_visual_qa_guard.js` — Ajanın ekran görüntüsü alabilen yerel
  QA istisnasının Guard 1, force-sync ve gerçek profil sınırlarını kaynak
  düzeyinde ağsız doğrular.
- `quran/` — Kur’an taşıma, katalog ve demo sözleşmesi fixture’ları.
- `panel/test_panel_p*.js` — Panel-01–06 kontrol, projection, event ve polling fixture’ları.
- `panel/test_panel_boot_resilience.js` — panel boot/poll dayanıklılık fixture’ı:
  fetch zaman aşımı + gerçek iptal, `load()` tek uçuş kilidi, event-log gün
  dosyalarında sınırlı eşzamanlılık, ardışık hata backoff’u ve “yer tutucuda
  takılı kalma” regresyonu. 2026-08-21’de sahada görülen `ERR_HTTP2_PROTOCOL_ERROR`
  istek seli + “Çekirdek başlatılıyor…” kilitlenmesini kalıcı olarak kapatır.
- `reminders/` — dondurulmuş reminder programı için 20 seçilmiş ağsız sentetik
  bakım fixture’ı; runtime, browser ve gerçek veri kullanmaz.
- `repo-root.js` — root kaynaklarına güvenli, cwd’den bağımsız erişim yardımcısı.

Reminder acceptance’ı üç ayrı scope olarak raporlanır: `tests/reminders/`
app/reminder contract bakım ailesi, `tests/panel/` current observer regression
ailesi ve `tests/panel-v2/` ayrı Premium regression
ailesidir. Panel-v2 fixture sayısı current panel acceptance’ının yerine
geçmez. Reminder setinin tamamı `run-reminder-smoke.mjs` ile exit-code bazlı
çalışır; `test_reminder_panel_fixture_architecture.js` static boundary ve
scope ayrımını, `test_reminder_end_to_end_lineage.js` ise sentetik app → sync →
projection → panel hattını kontrol eder.

Panel-v2 testlerinin ayrıntılı envanteri ve çalıştırma kuralları:
[`panel-v2/README.md`](panel-v2/README.md).

## Sık kullanılan komutlar

Tek Panel-v2 fixture’ı:

```bash
node tests/panel-v2/test_panel_v2_css.js
```

Tüm Panel-v2 fixture’ları:

```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
```

Reminder bakım regression:

```bash
node docs/reminders/verify-reminder-freeze.mjs
node tests/reminders/run-reminder-smoke.mjs
```

Current panel fixture’ları ayrıca:

```bash
for f in tests/panel/test_panel_*.js; do node "$f"; done
node tests/panel/test_faz11_panel.js
```

App/sync fixture’ları:

```bash
for f in tests/app/test_*.js; do node "$f"; done
```

Kur’an fixture’ları:

```bash
for f in tests/quran/test_*.js; do node "$f"; done
```

Tam panel kanıtında current-panel komutları ile Panel-v2 komutu ayrı exit code
olarak kaydedilir; `tests/app/`, `tests/panel/` ve `tests/quran/` globları
bilerek `tests/panel-v2/` altındaki fixture’ları içermez. Fixture sayısı tek
başına başarı kanıtı değildir: test adları, exit
code ve varsa failure signature birlikte raporlanır. Fixture’lar browser,
gerçek ağ, gerçek token, gerçek localStorage ve data repo write kullanmaz;
zaman duyarlı kontroller sabit/injected clock ya da açıkça bounded benchmark
sınırıyla çalışır.

## Panel-v2 kapanış notu

Panel-v2 40/40 tamamlanmıştır. Güncel durum ve güncel yollar için
`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`, kısa iş
özeti için `archive/PANEL-V2-PREMIUM-TASARIM/WORK-SUMMARY.md` okunur.
Ayrıntılı prompt/handoff bytes'ı Git geçmişinde tutulur; test fixture'ları
çalıştırmak için bu tarihsel dosyalara gerek yoktur.
