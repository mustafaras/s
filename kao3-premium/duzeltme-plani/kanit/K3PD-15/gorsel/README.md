# K3PD-15 görsel kanıt

Kontrollü yerel QA çıktısı (`tools/kapi/gorsel-qa/cdp.mjs` — CDP pipe, **sunucu/soket yok**,
boş geçici profil, origin `127.0.0.1:9000`, token/`forceSync` yok, dış istekler kesik).

| Dosya | İçerik |
|---|---|
| `kontak-1-ses-bitmeden-yaldiz.jpg` | **Asıl fark.** Ses hiç `ended` üretmezken yaldız: ÖNCEKİ 8/8, SONRAKİ 1/8 |
| `kontak-2-ended-ilerleme.jpg` | `ended` ilerlemesi (eski 2/8→5/8→8/8, yeni 1/8→2/8→3/8→4/8) + klipsiz satır |
| `kontak-3-reduced-motion.jpg` | Hareket azaltmada statik satır (iki sürümde aynı) |
| `onceki/`, `sonraki/` | Ham ölçüm log'ları |
| `yeniden-uret-1-…mjs` | Kontak 1 karelerini üretir |
| `yeniden-uret-2-…mjs` | Kontak 2 ve 3 karelerini üretir |
| `kontak-olustur.py` | PNG'lerden JPG kontak sayfalarını üretir (PIL) |

## Yeniden üretme

```bash
# 1) Önceki sürümü çıkar (düzeltme öncesi)
rm -rf /tmp/k3pd15-head && mkdir -p /tmp/k3pd15-head
git archive HEAD~1 | tar -x -C /tmp/k3pd15-head

# 2) Kareleri çek (repo kökünden; Chrome for Testing yolu gerekli)
export KAO_QA_CHROME="$HOME/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
node kao3-premium/duzeltme-plani/kanit/K3PD-15/gorsel/yeniden-uret-1-ses-bitmeden.mjs \
  /tmp/k3pd15-head kao3-premium/duzeltme-plani/kanit/K3PD-15/gorsel/onceki prof-onceki ONCEKI
node kao3-premium/duzeltme-plani/kanit/K3PD-15/gorsel/yeniden-uret-1-ses-bitmeden.mjs \
  . kao3-premium/duzeltme-plani/kanit/K3PD-15/gorsel/sonraki prof-sonraki SONRAKI
# (2. betik aynı kalıpla kontak 2/3 karelerini üretir)

# 3) Kontak sayfaları
cd kao3-premium/duzeltme-plani/kanit/K3PD-15/gorsel && python3 kontak-olustur.py
```

Ham PNG'ler repoya alınmaz (6,5 MB); yalnız JPG kontak sayfaları tutulur.

## Sınır

Kaynak-görsel kanıttır. Gerçek cihaz, gerçek ses donanımı ve ekran okuyucu kabulü değildir.
K3PD-15 hükmü `NOT_MEASURED` kalır.
