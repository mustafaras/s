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
- `repo-root.js` — root kaynaklarına güvenli, cwd’den bağımsız erişim yardımcısı.

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

Kök fixture’ları:

```bash
for f in tests/test_*.js; do node "$f"; done
```

Tam test kanıtı alınırken iki komut birlikte çalıştırılmalıdır; kök globu
bilerek `tests/panel-v2/` altındaki fixture’ları içermez.

## Tarihsel handoff notu

`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/archive/prompt-handoffs/` altındaki
`handoff-PROMPT-01.md`–`40.md` dosyaları, o tarihteki dosya yollarını koruyan
append-only kayıtlardır. Güncel durum ve güncel yollar için
`archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md` okunur.
