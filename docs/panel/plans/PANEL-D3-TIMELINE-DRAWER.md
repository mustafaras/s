# ÆON Paneli — PANEL-10 D3 Son Değişiklikler Timeline ve Drawer

**Sequence:** `PANEL-012`
**Durum:** `completed`
**Tarih:** 2026-08-03
**Önkoşul:** PANEL-005 event sözleşmesi + D1 component sözleşmesi + D2 command center

Bu teslimat append-only event projection’ı kullanıcı tarafından takip
edilebilir bir değişiklik zaman çizelgesine taşır. Her yüzey metadata-first ve
redacted kalır; panel observer read/render sınırını aşmaz.

## 1. Timeline satırı sözleşmesi

Her `timeline-row` tek karar için şu bilgileri aynı satırda taşır:

| Alan | Görsel karşılık | Kanıt/sınır |
|---|---|---|
| Saat | occurred-at zamanı | event `occurredAt`, yoksa `—` |
| Feature | ikon + feature etiketi | section/path/operation sınıflaması |
| Özet | kısa güvenli metin | allowlist/redaction; ham payload yok |
| Source | source badge | user, derived, external, delivery, observer |
| Status | icon/renk + metin badge | ok, pending, warning, danger, muted |
| Revision | kısa SHA/revision | snapshot revision prefix’i |
| Drawer | satırın tamamı 44px hedef | `eventId` + `correlationId` ile açılır |

Retry, merge ve accepted event’leri aynı `correlationId` altında tek grup
satırı olur. Grubun drawer audit seviyesi zincirdeki üyeleri sequence sırasıyla
gösterir; event sırası ve duplicate alarmı mevcut `EVENT_LOG_STATE.audit`
kanıtından gelir.

## 2. Filtre sözleşmesi

Timeline filtreleri `aria-pressed` taşır ve renk tek başına anlam taşımaz:

`Tümü`, `Dikkat gerektiren`, `Senkron`, `Terapi / profil`, `Kur’an / video`,
`İletişim`, `Kullanıcı girdisi`, `Türetilmiş`, `Dış kaynak`.

Filtreleme yalnız event metadata’sı üzerinde yapılır; raw metin, token, GPS,
profil cevabı veya base64 medya arama/DOM yüzeyine girmez. `Dikkat gerektiren`
pending, stale, conflict ve error sinyallerini ayrı status semantiğiyle
gösterir; accepted event başarıya ancak kendi receipt/revision kanıtıyla çıkar.

## 3. Drawer seviyeleri

| Seviye | Kullanıcı sorusu | İçerik |
|---|---|---|
| 1 · Hızlı özet | “Ne oldu?” | güvenli özet, feature, source, status, revision |
| 2 · Feature ayrıntısı | “Hangi alan etkilenmiş?” | event/correlation, section/path/operation, privacy ve zaman zinciri |
| 3 · Audit | “Bunu nasıl kanıtlıyorum?” | sequence, cihaz, revision, zincir üyeleri ve sıralama sonucu |

Drawer davranışı:

- Desktop’ta sağdan açılan 420–520px paneldir.
- Mobilde tam ekran paneldir; ana scroll konumu korunur.
- `role="dialog"`, `aria-modal`, labelled title/description, close button ve
  Escape bulunur.
- Tab odağı drawer içinde döner; kapanınca açan timeline satırına iade edilir.
- Dış backdrop’e tıklama kapatır; raw payload hiçbir seviyede gösterilmez.
- Yeni polling/event geldiğinde açık input/taslak korunur; drawer yalnız
  kullanıcı eylemiyle açılır, otomatik scroll yapılmaz.

## 4. Responsive ve motion

- 375–430px: filtreler yatay kaydırılabilir, satır metadata ikinci hatta iner,
  drawer tam genişlik olur.
- 768px: timeline satırı ve drawer aynı semantiği korur; filtre çubuğu taşmaz.
- 1280px: 520px’e kadar drawer, timeline’da source/status/revision paralel
  okunur.
- `--touch-min: 44px`, `:focus-visible`, contrast token’ları ve
  `prefers-reduced-motion: reduce` korunur.

## 5. Observer write ve veri güvenliği

Bu prompt yalnız `panel.js` render/state UI’si, `panel.css`, `panel.html` cache
version’ı, D3 planı ve sentetik fixture’a dokunur. `data/latest.json`,
`data/observer-snapshot.json`, event dosyaları, localStorage ve mevcut observer
write kanalları değişmez. Gerçek ağ, browser ve `seyma-data` write’ı
yapılmamıştır.

## 6. Kanıt

- `tests/test_panel_p3_timeline_drawer.js`: **13/13 PASS** — zincir gruplama,
  dokuz filtre, source/status/revision, raw redaction, modal ARIA, üç seviye,
  focus trap, Tab/Esc, responsive/reduced-motion ve cache-bust.
- `tests/test_panel_p2_event_log.js`: **13/13 PASS**.
- `tests/test_panel_p2_sync.js`: **8/8 PASS**; `tests/test_panel_p2_polling.js`: **15/15 PASS**.
- P0 **27/27**, P1 **35/35**, P3 **26/26**, P4 **19/19**, Faz 10 **64/64**,
  Faz 11 **50/50**.
- `node --check panel.js`, `sync.js`, `panelCoverageManifest.js`: PASS.
- `panel.css?v=20260803d` ve `panel.js?v=20260803d` script/cache kontrolü: PASS.
- Headless app/migration/Zikirmatik kapıları ve `git diff --check`: PASS.

**Kabul:** Kullanıcı D3 timeline/drawer teslimini açıkça kabul etti; kabul kaydı
paired ledger’larda `PANEL-012` sequence’iyle tutuluyor.

**Sonraki güvenli adım:** PANEL-013 / Prompt 11 D4 modül kartları uygulandı ve
kullanıcı review’ını bekliyor.
