# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-21
lastSeq: 76
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq71

## Şu an neredeyiz
**KAO2-00…20 tamamlandı (21/28). KAO2-21 `blocked`.** Bütçe engeli **çözüldü**:
çalışma zamanı 86.032 → **84.745 / 88 KiB** (pay 3.34). İki **kullanıcı kararı** bekliyor:
(A) 07 §2 ders 0.5'in istediği **elif (ا)** içerikte yok; (B) kartın (f) maddesi kapıdaki
12 mini dersi kaldırmayı ister ama `test_kao_render.js:342` bunu sabitliyor.

## Sıradaki kartın tek cümlesi
**KAO2-21** — Seviye 0'ı şekil aileleri sırasıyla yeniden kurmak; ama yukarıdaki iki karar
verilmeden başlanamaz. Kabul ölçütleri çalıştırılabilir spec olarak hazır:
`evidence/KAO2-21/HEDEF-SPEC-TESTI.js`.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim` = `main`; canlı pin **`20260930c`** (run 36690840781).
- `KAO2-STATE.json`: KAO2-20 `done`; **KAO2-21 `blocked`**; `ledgerLastSeq=76`;
  `releaseApproval=approved_through_KAO2-20`.
- **Bütçe rahatladı:** çalışma zamanı **84.745 / 88 KiB** · içerik 173.298/256 ·
  css 11.574/14 · p95 ~5.0 ms.
- Kaynak/test: PASS · yayın: KAO2-21 sonrası · cihaz: **doğrulanmadı**.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
