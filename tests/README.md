# Headless test fixtures

Bu klasör, repository içindeki sentetik Node testlerini toplar. Testler uygulama
runtime’ına yüklenmez; `repo-root.js` sayesinde root’tan veya `tests/` içinden
çalıştırıldığında aynı kaynak dosyalarını okur.

## Klasörler ve sınırlar

- `panel-v2/` — ÆON Panel-v2 Premium’un 27 headless VM fixture’ı ve ortak
  sandbox yardımcısı. Panel-v2 dosyalarının tek canonical test konumudur.
- `test_panel_*.js`, `test_faz11_panel.js` — legacy Panel 1 / observer fixture’ları.
- `test_panel_p*.js` — Panel-01–06 kontrol, projection, event ve polling fixture’ları.
- `test_faz10_sync.js`, `test_quran_*.js` — sync, Kur’an taşıma ve katalog fixture’ları.
- `reminders/` — REM-02+ ağsız sentetik reminder contract fixture’ları; runtime, browser ve gerçek veri kullanmaz.
- `repo-root.js` — root kaynaklarına güvenli, cwd’den bağımsız erişim yardımcısı.

Reminder panel acceptance’ı üç ayrı scope olarak raporlanır: `tests/reminders/`
app/reminder contract ailesi, root `tests/test_panel_*.js` current observer
regression ailesi ve `tests/panel-v2/` ayrı Premium regression ailesidir.
Panel-v2 fixture sayısı current panel acceptance’ının yerine geçmez. REM-66
architecture gate’i `test_reminder_panel_fixture_architecture.js` ile dosya
manifestlerini ve static boundary’leri kontrol eder. REM-67’de aynı ayrı scope’a
app → sync → projection → panel lineage fixture’ı eklenecektir.

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

Reminder fixture’ları:

```bash
for f in tests/reminders/test_reminder_*.js; do node "$f"; done
```

Current panel fixture’ları ayrı:

```bash
for f in tests/reminders/test_reminder_panel_*.js; do node "$f"; done
for f in tests/test_panel_*.js; do node "$f"; done
node tests/test_faz11_panel.js
```

Kök fixture’ları:

```bash
for f in tests/test_*.js; do node "$f"; done
```

Tam panel kanıtında current-panel komutları ile Panel-v2 komutu ayrı exit code
olarak kaydedilir; kök globu bilerek `tests/panel-v2/` altındaki fixture’ları
içermez. Fixture sayısı tek başına başarı kanıtı değildir: test adları, exit
code ve varsa failure signature birlikte raporlanır. Fixture’lar browser,
gerçek ağ, gerçek token, gerçek localStorage ve data repo write kullanmaz;
zaman duyarlı kontroller sabit/injected clock ya da açıkça bounded benchmark
sınırıyla çalışır.

## Tarihsel handoff notu

`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/archive/prompt-handoffs/` altındaki
`handoff-PROMPT-01.md`–`40.md` dosyaları, o tarihteki dosya yollarını koruyan
append-only kayıtlardır. Güncel durum ve güncel yollar için
`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md` okunur.
