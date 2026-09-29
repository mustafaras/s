# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-18
lastSeq: 69
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq69

## Şu an neredeyiz
**KAO2-00…17 tamamlandı (18/28).** KAO2-17 Türkçe metin katmanını kurdu: 12 ünite
(title/promise/why) + 109 ders (title/goal) + 12 S0 dersi = **133 metin**, hepsi
`draft`. Yer tutucu ders başlıkları ("Oldu, yaptı · 3. ders") gerçek başlıklarla
değişti. **`draft` metinler uygulamada görünmez**; yerine güvenli "Ünite N" başlığı
gelir. KAO2-16'ya kadar olan iş canlıda (pin `20260929e`).

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-18**, 25 gramer kavramı için çözümlü örnek ve hata açıklaması
(`workedTr`/`errorTr`) ekler; bu oturumda başlanmadı.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim`; KAO2-16 canlı (`main` = `6173cb4e`, pin `20260929e`).
- `KAO2-STATE.json`: program `active`; KAO2-17 `done`; `nextCard=KAO2-18`;
  `ledgerLastSeq=69`.
- `releaseApproval=approved_through_KAO2-16`; **KAO2-17 yayınlanmadı**.
  Push/merge/deploy için yeni açık kullanıcı talimatı gerekir.
- G0 kapalı, G1 sunulmuş, G2 kapalı; **G3 sunuldu** (metin incelemesi kullanıcıda),
  G4 açık.
- **Bütçe kritik:** runtime `quranLearn*` **79.399 / 80 KiB** (~0,6 KiB kaldı) ·
  içerik 172.676/262.144 · CSS 10.421/14. KAO2-18 kod ekleyecekse önce ölçülmeli.
- Kaynak/test: PASS · yayın: yok · cihaz: doğrulanmadı.

## Açık riskler ve bekleyen kullanıcı işleri
- **G3 metin incelemesi kullanıcıda:** `kuran-ogreniyorum-v2/inceleme/INCELEME-KAO2-17.md`
  doldurulmalı (L1 proje sahibi + dinî bağlamlılar için L2 alan uzmanı). Onaya kadar
  tüm metinler `draft` kalır ve uygulamada görünmez — kartın öngördüğü güvenli durum.
- **Cihaz kabulü** hiç doğrulanmadı (KAO2-15/16 dâhil).
- **Bütçe:** KAO2-18+ için ~0,6 KiB; yeni kod kart başında ölçülmeli, gerekirse K-1
  bütçesi kullanıcı kararıyla güncellenmeli.
- KAO2-17 dâhil yayınlanmamış işler var; yayın için açık talimat gerekir.
