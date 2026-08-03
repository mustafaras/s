# ÆON Paneli — PANEL-11 D4 Eksik ve Özet Modül Kartları

**Sequence:** `PANEL-013`
**Durum:** `ready_for_review`
**Tarih:** 2026-08-03
**Önkoşul:** D3 timeline/drawer kabulü + P1/P3/P4 coverage/provenance sözleşmeleri

D4, coverage araştırmasında dağınık kalan veya yalnız projection özeti olarak
görünen modülleri ortak `module-card` + `detail-drawer` yüzeyinde toplar.
Mevcut P3/P4 ayrıntı kartları veri sürekliliği için korunur; D4 atlası hızlı
karar ve provenance giriş noktasıdır.

## 1. Ortak kart sözleşmesi

Her D4 kartı aşağıdaki yüzeyi taşır:

| Alan | Sözleşme |
|---|---|
| Karar cümlesi | Kullanıcının bu modülde hangi soruya bakacağını söyler |
| Summary | Tek canonical metric ve kısa güvenli özet |
| Source/time | `source-badge` + son güvenli kaynak zamanı |
| Status | icon/metin status badge; `ok`, `pending`, `warning`, `danger`, `muted` |
| Coverage | `Tam`, `Özet`, `Redacted`, `Eksik` |
| Cross-check | Kopya metriği değil, canonical metriği doğrulayan ikinci sinyal |
| Drawer | 44px erişilebilir eylem; metadata-first ayrıntı |

Kartlar source object’i backfill etmez veya render sırasında migrate etmez.
Eksik/bozuk projection açık nedeni ve fail-closed status ile kalır.

## 2. Uygulanan yedi modül

1. **Terapi + Profil:** consent, profil ilerlemesi, terapi thought count;
   hassas metin ve ham yanıtlar `redacted`.
2. **Bildirim Teslimatı:** oluşturuldu/iletildi/okundu/retry-error lifecycle;
   yalnız metadata ve zaman.
3. **Kur’an Teslimatı:** request, video, not ve delivery error sayıları;
   mevcut Quran transport/outbox writer sınırı korunur.
4. **Saygı Kanıtı:** root collection/streak ile daily evidence/derived streak
   karşılaştırması ve mismatch alarmı.
5. **Günün Fotoğrafı:** kaynak, lisans, fetched/cache durumu ve stale/error
   ayrımı.
6. **Konum Audit:** izin/nudge/dismiss/snooze ile sample/processed/accepted
   zamanları; GPS koordinatı ve raw track yok.
7. **Zihin-Beden + Arşiv:** soul session/minute canonical metriği ile
   kütüphane/izleme/dinleme provenance cross-check’i.

## 3. Drawer ve erişilebilirlik

D4 drawer, D3 drawer altyapısıyla aynı semantiği kullanır:

- `role="dialog"`, `aria-modal`, başlık/açıklama bağlantıları ve close button,
- desktop sağ paneli, mobil tam ekran,
- Escape ve focus trap; kapanınca açan modül eylemine odak iadesi,
- 44px touch target, `:focus-visible`, reduced-motion,
- hassas modüllerde raw text/response/token/GPS/base64 görünmez.

## 4. Veri ve yazma sınırı

D4 yalnız `PROJECTION_SECTIONS` ve güvenli latest state’ten read/render yapar.
`data/latest.json` full-replace zinciri, `SeySync.schedule`, Kur’an outbox,
observer inbox/outbox ve başka bir write kanalı eklenmedi veya değiştirilmedi.

## 5. Kanıt

- `test_panel_p4_module_cards.js`: **13/13 PASS** — 7 descriptor, source-data
  immutability, dolu/eski/eksik/bozuk/redacted, source/time/status/privacy,
  coverage, canonical/cross-check, ARIA drawer, focus trap ve write sınırı.
- P3 root modules **26/26**, P4 provenance **19/19**, D3 timeline **13/13**,
  event sync **8/8**, polling **15/15**.
- P0 **27/27**, P1 **35/35**, Faz 10 **64/64**, Faz 11 **50/50**.
- `node --check panel.js`, `sync.js`, `panelCoverageManifest.js`: PASS.
- `panel.css?v=20260803e` / `panel.js?v=20260803e` cache ve script-tag balance:
  PASS; headless app/migration/B1/B2/B3 ve `git diff --check`: PASS.
- Browser/server/gerçek ağ/`localStorage`/`seyma-data` yazımı yapılmadı.

**Sonraki güvenli adım:** Kullanıcı D4 modül kartları teslimini review edip açık
kabul verene kadar Prompt 12 / `PANEL-014` başlatılmayacak.
