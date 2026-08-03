# Headless test fixtures

Bu klasör, repository root’ta duran sentetik Node testlerini toplar. Testler
uygulama runtime’ına yüklenmez; `repo-root.js` sayesinde komutun root’tan veya
`tests/` klasöründen çalıştırılması aynı kaynak dosyalarını okur.

## Gruplar

- `test_panel_*.js`, `test_faz11_panel.js`: panel ve gözlemci fixture’ları
- `test_faz10_sync.js`, `test_panel_p2_sync.js`: sync/anti-clobber fixture’ları
- `test_quran_*.js`: Kur’an katalog, taşıma, merge, delivery ve a11y fixture’ları

Örnek:

```text
node tests/test_panel_p6_qa_release.js
node tests/test_quran_transport.js
```

`.claude/skills/run-seyma/` altındaki doğrulama harness’leri kendi skill
alanında kalır; bu klasör yalnız root test fixture’larını düzenler.
