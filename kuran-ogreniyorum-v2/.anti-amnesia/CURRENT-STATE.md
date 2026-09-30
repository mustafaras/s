# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-25
lastSeq: 80
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…24 tamamlandı (25/28).** KAO2-24 iki ayrı ekranı (harita + istatistik) tek
**İlerleme** ekranında birleştirdi ve modülün en güçlü motivasyon anlatısını görünür
kıldı: **kapsam eğrisi** ("ilk 50 kelime ≈ %45") çalışma zamanında lexicon `freq`'ten
hesaplanır, 03 §1 tablosuyla ±0,1 tutarlı. Taşlar koşul metniyle, haftalık etkinlik
yumuşak seri diliyle (D-19), Mushaf haritası ekranın bölümü olarak.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-25** — Kelime detayı v2 (S-08) ve **panel aynası**: kelime katmanları,
gerçek bağlam örnekleri ve panel projeksiyonunun eşlenmesi.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; canlı pin **`20260930h`** (KAO2-24 bu turda yayınlanacak).
- `KAO2-STATE.json`: KAO2-24 `done`; `nextCard=KAO2-25`; `ledgerLastSeq=80`;
  `releaseApproval=approved_through_KAO2-24`.
- **Bütçe (revizyon 2, kullanıcı yetkisi):** çalışma zamanı tavanı **128 KiB**.
  Ölçüm **91.567 / 128 KiB** · içerik 177.657/256 · css 12.631/14 · p95 4,6 ms.
- Kimlik pinleri: App yüzeyi 764 · `App.kao*` **43** · atama 602 · `onclick` 393.
- Kaynak/test: PASS · yayın: KAO2-24 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
