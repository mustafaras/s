# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-22
lastSeq: 77
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…21 tamamlandı (22/28).** KAO2-21 Seviye 0'ı şekil aileleri sırasıyla yeniden
kurdu ve **ayrı yüzey** olarak ekledi (onaylanan B2): konum tablosu 28×4 (ZWJ ile mekanik,
bağlanmayanda "biçim yok"), 28/28 harfe **gerçek kelime sesi** (sessiz harf 0), ders akışı
açıklama→dinle-gör→6-8 alıştırma→gerçek kelime, S0.12 Besmele+Fâtiha kelime kelime.
**Kapı dokunulmadı** (12 mini ders · 20 okunuş · 12 minimal çift).

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-22** — K-3 kademe A (muallim kaydı hattı; kayıt gelirse).

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; canlı pin **`20260930d`** (KAO2-20/21 bu turda yayınlanacak).
- `KAO2-STATE.json`: KAO2-21 `done`; `nextCard=KAO2-22`; `ledgerLastSeq=77`;
  `releaseApproval=approved_through_KAO2-21`.
- **⚠️ BÜTÇE %99.3 DOLU:** çalışma zamanı **87.423 / 88 KiB** (pay **0.6 KiB**) ·
  içerik 175.459/256 · css 11.911/14. Sonraki kart yeni çalışma zamanı kodu
  getirmemeli; gerekirse veri taşıma/karar gerekir.
- Kimlik pinleri: App yüzeyi **764** · `App.kao*` **43** · atama **602** · `onclick` 393.
- Kaynak/test: PASS · yayın: KAO2-21 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
